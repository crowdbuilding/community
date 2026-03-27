-- ============================================================================
-- Add 'aspirant' role between guest and member
-- Route: guest → aspirant → member → moderator → admin
-- ============================================================================

-- Drop the old check constraint and add new one with 'aspirant'
ALTER TABLE memberships DROP CONSTRAINT IF EXISTS memberships_role_check;
ALTER TABLE memberships ADD CONSTRAINT memberships_role_check
  CHECK (role IN ('guest', 'aspirant', 'member', 'moderator', 'admin'));

-- Update the has_membership helper to include aspirant
CREATE OR REPLACE FUNCTION has_membership(p_project_id uuid, p_min_role text DEFAULT 'guest')
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM memberships
    WHERE profile_id = auth.uid()
    AND project_id = p_project_id
    AND (
      CASE p_min_role
        WHEN 'guest' THEN role IN ('guest', 'aspirant', 'member', 'moderator', 'admin')
        WHEN 'aspirant' THEN role IN ('aspirant', 'member', 'moderator', 'admin')
        WHEN 'member' THEN role IN ('member', 'moderator', 'admin')
        WHEN 'moderator' THEN role IN ('moderator', 'admin')
        WHEN 'admin' THEN role = 'admin'
        ELSE false
      END
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;
