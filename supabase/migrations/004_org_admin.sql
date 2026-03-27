-- ============================================================================
-- Multi-tenant: Organization Members + Project Stats
-- ============================================================================

-- Org-level membership (replaces is_platform_admin)
CREATE TABLE org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(organization_id, profile_id)
);

ALTER TABLE org_members ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Helper: check if user is org admin
-- ============================================================================

CREATE OR REPLACE FUNCTION is_org_admin(p_org_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE profile_id = auth.uid()
    AND organization_id = p_org_id
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM org_members
  WHERE profile_id = auth.uid()
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- RLS for org_members
-- ============================================================================

CREATE POLICY "Org members can read own org members"
  ON org_members FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM org_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Org admins can manage org members"
  ON org_members FOR INSERT WITH CHECK (
    is_org_admin(organization_id)
  );

CREATE POLICY "Org admins can update org members"
  ON org_members FOR UPDATE USING (
    is_org_admin(organization_id)
  );

CREATE POLICY "Org admins can remove org members"
  ON org_members FOR DELETE USING (
    is_org_admin(organization_id)
  );

-- ============================================================================
-- Update organizations RLS to be tenant-aware
-- ============================================================================

DROP POLICY IF EXISTS "Platform admins can read organizations" ON organizations;
DROP POLICY IF EXISTS "Platform admins can manage organizations" ON organizations;

CREATE POLICY "Org members can read their organization"
  ON organizations FOR SELECT USING (
    id IN (SELECT organization_id FROM org_members WHERE profile_id = auth.uid())
  );

CREATE POLICY "Org admins can update their organization"
  ON organizations FOR UPDATE USING (
    is_org_admin(id)
  );

-- ============================================================================
-- Update projects RLS: org admins see all projects in their org
-- ============================================================================

DROP POLICY IF EXISTS "Members can read their projects" ON projects;

CREATE POLICY "Users can read their projects"
  ON projects FOR SELECT USING (
    -- Org admin sees all projects in their org
    is_org_admin(organization_id)
    -- Or user has membership in this project
    OR has_membership(id, 'guest')
  );

DROP POLICY IF EXISTS "Platform admins can manage projects" ON projects;

CREATE POLICY "Org admins can create projects"
  ON projects FOR INSERT WITH CHECK (
    is_org_admin(organization_id)
  );

DROP POLICY IF EXISTS "Platform admins can update projects" ON projects;

CREATE POLICY "Org admins and project admins can update projects"
  ON projects FOR update USING (
    is_org_admin(organization_id) OR has_membership(id, 'admin')
  );

-- ============================================================================
-- RPC: get project stats for org dashboard
-- ============================================================================

CREATE OR REPLACE FUNCTION get_org_project_stats(p_org_id UUID)
RETURNS TABLE(
  project_id UUID,
  project_name TEXT,
  project_location TEXT,
  project_tagline TEXT,
  project_logo_url TEXT,
  project_cover_image_url TEXT,
  active_phase TEXT,
  member_count BIGINT,
  update_count BIGINT,
  post_count BIGINT,
  advisor_count BIGINT,
  new_updates_week BIGINT,
  new_posts_week BIGINT,
  new_members_week BIGINT
) AS $$
  SELECT
    p.id,
    p.name,
    p.location,
    p.tagline,
    p.logo_url,
    p.cover_image_url,
    (SELECT m.label FROM milestones m WHERE m.project_id = p.id AND m.status = 'active' LIMIT 1),
    (SELECT COUNT(*) FROM memberships mb WHERE mb.project_id = p.id AND mb.role != 'guest'),
    (SELECT COUNT(*) FROM updates u WHERE u.project_id = p.id),
    (SELECT COUNT(*) FROM posts po WHERE po.project_id = p.id AND po.is_hidden = false),
    (SELECT COUNT(*) FROM memberships mb2 JOIN profiles pr ON pr.id = mb2.profile_id WHERE mb2.project_id = p.id AND pr.professional_type IS NOT NULL),
    (SELECT COUNT(*) FROM updates u2 WHERE u2.project_id = p.id AND u2.created_at > now() - interval '7 days'),
    (SELECT COUNT(*) FROM posts po2 WHERE po2.project_id = p.id AND po2.created_at > now() - interval '7 days'),
    (SELECT COUNT(*) FROM memberships mb3 WHERE mb3.project_id = p.id AND mb3.joined_at > now() - interval '7 days')
  FROM projects p
  WHERE p.organization_id = p_org_id
  ORDER BY p.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Migrate existing platform admins to org_members
-- ============================================================================

INSERT INTO org_members (organization_id, profile_id, role)
SELECT '00000000-0000-4000-a000-000000000001', id, 'admin'
FROM profiles
WHERE is_platform_admin = true
ON CONFLICT (organization_id, profile_id) DO NOTHING;
