-- ============================================================================
-- Professional Updates — Schema Extension
-- ============================================================================

-- Add professional fields to profiles
ALTER TABLE profiles ADD COLUMN professional_type TEXT
  CHECK (professional_type IN ('architect', 'kostendeskundige', 'constructeur', 'installatie_adviseur', 'notaris', 'anders'));
ALTER TABLE profiles ADD COLUMN professional_label TEXT;

-- ============================================================================
-- Professional Invites
-- ============================================================================

CREATE TABLE professional_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  name TEXT,
  professional_type TEXT NOT NULL
    CHECK (professional_type IN ('architect', 'kostendeskundige', 'constructeur', 'installatie_adviseur', 'notaris', 'anders')),
  invited_by UUID REFERENCES profiles(id) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'revoked')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(project_id, email)
);

-- ============================================================================
-- Professional Updates
-- ============================================================================

CREATE TABLE professional_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES profiles(id) NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Update Files (attached to professional updates)
-- ============================================================================

CREATE TABLE update_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id UUID REFERENCES professional_updates(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  file_type TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================================
-- Helper: check if user is a professional on a project
-- ============================================================================

CREATE OR REPLACE FUNCTION is_professional(p_project_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    JOIN memberships m ON m.profile_id = p.id
    WHERE p.id = auth.uid()
    AND m.project_id = p_project_id
    AND p.professional_type IS NOT NULL
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================================================
-- Enable RLS
-- ============================================================================

ALTER TABLE professional_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE update_files ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Professional Invites
CREATE POLICY "Moderators can read invites"
  ON professional_invites FOR SELECT USING (
    is_platform_admin() OR has_membership(project_id, 'moderator')
  );

CREATE POLICY "Moderators can create invites"
  ON professional_invites FOR INSERT WITH CHECK (
    is_platform_admin() OR has_membership(project_id, 'moderator')
  );

CREATE POLICY "Moderators can update invites"
  ON professional_invites FOR UPDATE USING (
    is_platform_admin() OR has_membership(project_id, 'moderator')
  );

-- Professional Updates
CREATE POLICY "Members can read professional updates"
  ON professional_updates FOR SELECT USING (
    is_platform_admin() OR has_membership(project_id, 'guest')
  );

CREATE POLICY "Professionals can create updates"
  ON professional_updates FOR INSERT WITH CHECK (
    is_platform_admin()
    OR (author_id = auth.uid() AND is_professional(project_id))
  );

CREATE POLICY "Authors can edit their updates"
  ON professional_updates FOR UPDATE USING (
    is_platform_admin() OR author_id = auth.uid()
  );

CREATE POLICY "Authors can delete their updates"
  ON professional_updates FOR DELETE USING (
    is_platform_admin() OR author_id = auth.uid()
  );

-- Update Files
CREATE POLICY "Members can read update files"
  ON update_files FOR SELECT USING (
    is_platform_admin() OR EXISTS (
      SELECT 1 FROM professional_updates pu
      WHERE pu.id = update_id AND has_membership(pu.project_id, 'guest')
    )
  );

CREATE POLICY "Professionals can add files"
  ON update_files FOR INSERT WITH CHECK (
    is_platform_admin() OR EXISTS (
      SELECT 1 FROM professional_updates pu
      WHERE pu.id = update_id AND pu.author_id = auth.uid()
    )
  );

CREATE POLICY "Authors can delete files"
  ON update_files FOR DELETE USING (
    is_platform_admin() OR EXISTS (
      SELECT 1 FROM professional_updates pu
      WHERE pu.id = update_id AND pu.author_id = auth.uid()
    )
  );

-- ============================================================================
-- Storage bucket for project files
-- ============================================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', true);

CREATE POLICY "Authenticated users can upload project files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'project-files' AND auth.role() = 'authenticated');

CREATE POLICY "Public read access for project files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'project-files');
