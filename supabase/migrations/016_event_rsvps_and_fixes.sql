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
