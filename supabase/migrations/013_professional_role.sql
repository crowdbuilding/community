-- ============================================================================
-- Add 'professional' role for team members (adviseurs)
-- Hierarchy: guest → professional → aspirant → member → moderator → admin
-- Professional can see: public updates, advisor docs, events, team page
-- Professional cannot see: board, internal updates, roadmap, member list
-- ============================================================================

-- Update check constraint to include 'professional'
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_role_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN ('guest', 'professional', 'aspirant', 'member', 'moderator', 'admin'));

-- Update has_membership helper to include professional in hierarchy
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
  );
$$ LANGUAGE sql SECURITY DEFINER;
