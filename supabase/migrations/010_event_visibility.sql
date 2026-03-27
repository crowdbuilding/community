-- ============================================================================
-- Event visibility: public events for guests, restricted events for members
-- ============================================================================

-- Add visibility field to meetings
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS visibility text DEFAULT 'members'
  CHECK (visibility IN ('public', 'aspirant', 'members'));

-- Add kennismaking event type
-- (no constraint change needed - event_type is just text)

-- Update meetings RLS: allow guests to see public events
DROP POLICY IF EXISTS "Members can read meetings" ON meetings;
CREATE POLICY "Users can read visible meetings"
  ON meetings FOR SELECT USING (
    is_platform_admin()
    OR (visibility = 'public' AND has_membership(project_id, 'guest'))
    OR (visibility = 'aspirant' AND has_membership(project_id, 'aspirant'))
    OR (visibility = 'members' AND has_membership(project_id, 'member'))
  );

-- Allow aspirant+ to RSVP (not just members)
DROP POLICY IF EXISTS "Members can rsvp" ON event_rsvps;
CREATE POLICY "Members can rsvp"
  ON event_rsvps FOR INSERT WITH CHECK (
    profile_id = auth.uid() AND EXISTS (
      SELECT 1 FROM meetings m WHERE m.id = meeting_id AND has_membership(m.project_id, 'aspirant')
    )
  );

-- Allow guests to RSVP on public events
CREATE POLICY "Guests can rsvp to public events"
  ON event_rsvps FOR INSERT WITH CHECK (
    profile_id = auth.uid() AND EXISTS (
      SELECT 1 FROM meetings m WHERE m.id = meeting_id AND m.visibility = 'public' AND has_membership(m.project_id, 'guest')
    )
  );
