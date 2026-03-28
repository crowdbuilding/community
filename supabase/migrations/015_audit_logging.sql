-- ============================================================================
-- Audit logging: track user actions for GIBIT/BIO compliance
-- ============================================================================

-- 1. Create audit_logs table
CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip_address text
);

-- Index for efficient querying
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_project ON audit_logs(project_id, created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action, created_at DESC);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- 2. Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Only platform admins and project admins can read audit logs
CREATE POLICY "Platform admins can read all audit logs"
  ON audit_logs FOR SELECT USING (is_platform_admin());

CREATE POLICY "Project admins can read their project audit logs"
  ON audit_logs FOR SELECT USING (
    project_id IS NOT NULL AND has_membership(project_id, 'admin')
  );

-- Anyone authenticated can insert (logging their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
  ON audit_logs FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- Nobody can update or delete audit logs (immutable)
-- (No UPDATE or DELETE policies = no one can modify logs)

-- 3. Server-side function for logging (bypasses RLS for system events)
CREATE OR REPLACE FUNCTION log_audit_event(
  p_action text,
  p_resource_type text,
  p_resource_id uuid DEFAULT NULL,
  p_project_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO audit_logs (user_id, action, resource_type, resource_id, project_id, metadata)
  VALUES (auth.uid(), p_action, p_resource_type, p_resource_id, p_project_id, p_metadata);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Automatic triggers for critical actions

-- Log membership changes
CREATE OR REPLACE FUNCTION trigger_log_membership_change()
RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM log_audit_event(
      'membership.created', 'membership', NEW.id, NEW.project_id,
      jsonb_build_object('role', NEW.role, 'profile_id', NEW.profile_id)
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    PERFORM log_audit_event(
      'membership.role_changed', 'membership', NEW.id, NEW.project_id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'profile_id', NEW.profile_id)
    );
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM log_audit_event(
      'membership.deleted', 'membership', OLD.id, OLD.project_id,
      jsonb_build_object('role', OLD.role, 'profile_id', OLD.profile_id)
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_membership_changes
  AFTER INSERT OR UPDATE OR DELETE ON memberships
  FOR EACH ROW EXECUTE FUNCTION trigger_log_membership_change();

-- Log project settings changes
CREATE OR REPLACE FUNCTION trigger_log_project_update()
RETURNS trigger AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name
    OR OLD.description IS DISTINCT FROM NEW.description THEN
    PERFORM log_audit_event(
      'project.updated', 'project', NEW.id, NEW.id,
      jsonb_build_object('changed_fields',
        ARRAY_REMOVE(ARRAY[
          CASE WHEN OLD.name IS DISTINCT FROM NEW.name THEN 'name' END,
          CASE WHEN OLD.description IS DISTINCT FROM NEW.description THEN 'description' END
        ], NULL)
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_project_updates
  AFTER UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION trigger_log_project_update();

-- Log auth events (login tracking via profile updates)
CREATE OR REPLACE FUNCTION trigger_log_profile_created()
RETURNS trigger AS $$
BEGIN
  PERFORM log_audit_event(
    'user.registered', 'profile', NEW.id, NULL,
    jsonb_build_object('full_name', NEW.full_name)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER audit_profile_created
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION trigger_log_profile_created();
