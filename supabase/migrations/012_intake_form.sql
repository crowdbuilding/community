-- ============================================================================
-- Public Intake Form: configurable questions + anonymous responses
-- ============================================================================

-- Add intake settings to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS intake_enabled boolean DEFAULT false;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS intake_intro_text text;

-- Configurable intake questions per project
CREATE TABLE IF NOT EXISTS intake_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  question_type text NOT NULL DEFAULT 'text'
    CHECK (question_type IN ('text', 'textarea', 'select', 'radio')),
  options jsonb,
  sort_order int NOT NULL DEFAULT 0,
  required boolean DEFAULT true,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Public form submissions (no auth required)
CREATE TABLE IF NOT EXISTS intake_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  answers jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invited', 'joined', 'rejected')),
  profile_id uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_responses_project ON intake_responses(project_id);
CREATE INDEX IF NOT EXISTS idx_intake_responses_email ON intake_responses(email);
CREATE INDEX IF NOT EXISTS idx_intake_questions_project ON intake_questions(project_id, sort_order);

-- ============================================================================
-- RLS
-- ============================================================================

ALTER TABLE intake_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_responses ENABLE ROW LEVEL SECURITY;

-- Anyone can read active questions (public form needs this)
CREATE POLICY "Anyone can read active intake questions"
  ON intake_questions FOR SELECT USING (active = true);

-- Admins can manage questions
CREATE POLICY "Admins can insert intake questions"
  ON intake_questions FOR INSERT WITH CHECK (
    is_platform_admin() OR has_membership(project_id, 'admin')
  );

CREATE POLICY "Admins can update intake questions"
  ON intake_questions FOR UPDATE USING (
    is_platform_admin() OR has_membership(project_id, 'admin')
  );

CREATE POLICY "Admins can delete intake questions"
  ON intake_questions FOR DELETE USING (
    is_platform_admin() OR has_membership(project_id, 'admin')
  );

-- Anyone can submit intake responses (public form, anon key)
CREATE POLICY "Anyone can submit intake responses"
  ON intake_responses FOR INSERT WITH CHECK (true);

-- Moderators+ can read responses
CREATE POLICY "Moderators can read intake responses"
  ON intake_responses FOR SELECT USING (
    is_platform_admin() OR has_membership(project_id, 'moderator')
  );

-- Admins can update response status
CREATE POLICY "Admins can update intake responses"
  ON intake_responses FOR UPDATE USING (
    is_platform_admin() OR has_membership(project_id, 'admin')
  );
