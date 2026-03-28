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
-- ============================================================================
-- Fix: Create missing event_rsvps table + update default_theme constraint
-- ============================================================================

-- 1. Create event_rsvps table (referenced in code and migration 010 but never created)
CREATE TABLE IF NOT EXISTS event_rsvps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id uuid REFERENCES meetings(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'going' CHECK (status IN ('going', 'maybe', 'not_going')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, meeting_id)
);

-- Enable RLS
ALTER TABLE event_rsvps ENABLE ROW LEVEL SECURITY;

-- Read: anyone who can see the meeting can see RSVPs
CREATE POLICY "Users can read event rsvps"
  ON event_rsvps FOR SELECT USING (
    is_platform_admin() OR EXISTS (
      SELECT 1 FROM meetings m WHERE m.id = meeting_id AND has_membership(m.project_id, 'guest')
    )
  );

-- Update own RSVP
CREATE POLICY "Users can update own rsvp"
  ON event_rsvps FOR UPDATE USING (profile_id = auth.uid());

-- Delete own RSVP
CREATE POLICY "Users can delete own rsvp"
  ON event_rsvps FOR DELETE USING (profile_id = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_event_rsvps_meeting ON event_rsvps(meeting_id);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_profile ON event_rsvps(profile_id);

-- 2. Update default_theme constraint to include 'contrast'
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_default_theme_check;
ALTER TABLE projects ADD CONSTRAINT projects_default_theme_check
  CHECK (default_theme IN ('light', 'warm', 'dark', 'contrast'));
-- ============================================================================
-- Public project page: slug field + public read policies
-- ============================================================================

-- 1. Add slug to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_public boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_description text;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS public_contact_email text;

-- Index for fast slug lookup
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE slug IS NOT NULL;

-- 2. Public read policy for projects with a slug and is_public = true
CREATE POLICY "Anyone can read public projects"
  ON projects FOR SELECT USING (is_public = true AND slug IS NOT NULL);

-- 3. Public read for milestones of public projects
CREATE POLICY "Anyone can read milestones of public projects"
  ON milestones FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true)
  );

-- 4. Public read for roadmap of public projects
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'roadmap_phases') THEN
    EXECUTE 'CREATE POLICY "Anyone can read roadmap of public projects"
      ON roadmap_phases FOR SELECT USING (
        EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true)
      )';
    EXECUTE 'CREATE POLICY "Anyone can read roadmap items of public projects"
      ON roadmap_items FOR SELECT USING (
        EXISTS (SELECT 1 FROM roadmap_phases rp
          JOIN projects p ON p.id = rp.project_id
          WHERE rp.id = phase_id AND p.is_public = true)
      )';
  END IF;
END $$;

-- 5. Public read for public updates
CREATE POLICY "Anyone can read public updates"
  ON updates FOR SELECT USING (
    is_public = true AND EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true
    )
  );

-- 6. Public read for upcoming meetings of public projects (public visibility only)
CREATE POLICY "Anyone can read public meetings"
  ON meetings FOR SELECT USING (
    visibility = 'public' AND EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true
    )
  );

-- 7. Public read for team members (admin/moderator only shown publicly)
CREATE POLICY "Anyone can read team of public projects"
  ON memberships FOR SELECT USING (
    role IN ('admin', 'moderator') AND EXISTS (
      SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true
    )
  );

-- 8. Generate slug from existing project names
UPDATE projects SET slug = lower(regexp_replace(name, '[^a-zA-Z0-9]+', '-', 'g'))
  WHERE slug IS NULL;
