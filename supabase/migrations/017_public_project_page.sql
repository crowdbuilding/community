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
