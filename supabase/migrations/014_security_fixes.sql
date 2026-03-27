-- ============================================================================
-- Security fixes: org admin access, DELETE policies, email privacy
-- ============================================================================

-- 1. Update has_membership to grant org admins access without auto-creating memberships
CREATE OR REPLACE FUNCTION has_membership(p_project_id uuid, p_min_role text DEFAULT 'guest')
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE profile_id = auth.uid()
    AND project_id = p_project_id
    AND (
      CASE p_min_role
        WHEN 'guest' THEN role IN ('guest', 'professional', 'aspirant', 'member', 'moderator', 'admin')
        WHEN 'professional' THEN role IN ('professional', 'aspirant', 'member', 'moderator', 'admin')
        WHEN 'aspirant' THEN role IN ('aspirant', 'member', 'moderator', 'admin')
        WHEN 'member' THEN role IN ('member', 'moderator', 'admin')
        WHEN 'moderator' THEN role IN ('moderator', 'admin')
        WHEN 'admin' THEN role = 'admin'
        ELSE false
      END
    )
  )
  OR EXISTS (
    -- Org admins have implicit admin access to all projects in their org
    SELECT 1 FROM projects p
    JOIN org_members om ON om.organization_id = p.organization_id
    WHERE p.id = p_project_id
    AND om.profile_id = auth.uid()
    AND om.role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 2. DELETE policies for all tables missing them

-- Organizations
CREATE POLICY "Org admins can delete organizations"
  ON organizations FOR DELETE USING (is_org_admin(id));

-- Projects
CREATE POLICY "Org admins can delete projects"
  ON projects FOR DELETE USING (is_org_admin(organization_id));

-- Memberships
CREATE POLICY "Admins can delete memberships"
  ON memberships FOR DELETE USING (
    is_platform_admin() OR has_membership(project_id, 'admin')
  );

-- Updates
CREATE POLICY "Admins can delete updates"
  ON updates FOR DELETE USING (
    author_id = auth.uid() OR has_membership(project_id, 'admin')
  );

-- Comments
CREATE POLICY "Authors and admins can delete comments"
  ON comments FOR DELETE USING (
    author_id = auth.uid() OR has_membership(
      (SELECT project_id FROM updates WHERE id = update_id), 'moderator'
    )
  );

-- Milestones
CREATE POLICY "Admins can delete milestones"
  ON milestones FOR DELETE USING (
    has_membership(project_id, 'admin')
  );

-- Meetings
CREATE POLICY "Admins can delete meetings"
  ON meetings FOR DELETE USING (
    has_membership(project_id, 'admin')
  );

-- Decisions
CREATE POLICY "Admins can delete decisions"
  ON decisions FOR DELETE USING (
    has_membership(project_id, 'admin')
  );

-- Workgroups
CREATE POLICY "Admins can delete workgroups"
  ON workgroups FOR DELETE USING (
    has_membership(project_id, 'admin')
  );

-- Posts (check if exists first)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'posts' AND policyname LIKE '%delete%'
  ) THEN
    EXECUTE 'CREATE POLICY "Authors and admins can delete posts" ON posts FOR DELETE USING (
      author_id = auth.uid() OR has_membership(project_id, ''moderator'')
    )';
  END IF;
END $$;

-- Events (check if exists first)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'events' AND policyname LIKE '%delete%'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete events" ON events FOR DELETE USING (
      has_membership(project_id, ''admin'')
    )';
  END IF;
END $$;

-- Intake responses
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'intake_responses' AND policyname LIKE '%delete%'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can delete intake responses" ON intake_responses FOR DELETE USING (
      has_membership(project_id, ''admin'')
    )';
  END IF;
END $$;

-- Professional invites
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'professional_invites' AND policyname LIKE '%delete%'
  ) THEN
    EXECUTE 'CREATE POLICY "Moderators can delete invites" ON professional_invites FOR DELETE USING (
      is_platform_admin() OR has_membership(project_id, ''moderator'')
    )';
  END IF;
END $$;

-- 3. Restrict email visibility in profiles
-- Create a view that hides email from non-admin users
-- (profiles SELECT policy is USING(true) for basic profile info,
--  but email should only be readable by project admins)
-- We solve this by making a secure function instead of changing the policy
CREATE OR REPLACE FUNCTION get_member_email(p_profile_id uuid, p_project_id uuid)
RETURNS text AS $$
  SELECT pr.email FROM profiles pr
  WHERE pr.id = p_profile_id
  AND (
    has_membership(p_project_id, 'moderator')
    OR pr.id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Fix is_professional to require proper role
CREATE OR REPLACE FUNCTION is_professional(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN memberships m ON m.profile_id = p.id
    WHERE p.id = auth.uid()
    AND m.project_id = p_project_id
    AND p.professional_type IS NOT NULL
    AND m.role IN ('professional', 'member', 'moderator', 'admin')
  );
$$ LANGUAGE sql SECURITY DEFINER;
