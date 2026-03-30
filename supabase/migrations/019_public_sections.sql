-- ============================================================================
-- Public content sections for the public project page
-- ============================================================================

CREATE TABLE IF NOT EXISTS public_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sort_order INT NOT NULL DEFAULT 0,
  title TEXT,
  body TEXT,
  image_url TEXT,
  bg_theme TEXT NOT NULL DEFAULT 'light',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast ordered lookup
CREATE INDEX IF NOT EXISTS idx_public_sections_project ON public_sections(project_id, sort_order);

-- RLS
ALTER TABLE public_sections ENABLE ROW LEVEL SECURITY;

-- Anyone can read sections of public projects
CREATE POLICY "Anyone can read public sections"
  ON public_sections FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects p WHERE p.id = project_id AND p.is_public = true)
  );

-- Project admins can manage sections
CREATE POLICY "Admins can insert public sections"
  ON public_sections FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM memberships m WHERE m.project_id = public_sections.project_id AND m.profile_id = auth.uid() AND m.role = 'admin')
  );

CREATE POLICY "Admins can update public sections"
  ON public_sections FOR UPDATE USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.project_id = public_sections.project_id AND m.profile_id = auth.uid() AND m.role = 'admin')
  );

CREATE POLICY "Admins can delete public sections"
  ON public_sections FOR DELETE USING (
    EXISTS (SELECT 1 FROM memberships m WHERE m.project_id = public_sections.project_id AND m.profile_id = auth.uid() AND m.role = 'admin')
  );
