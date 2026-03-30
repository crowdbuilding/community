-- Drop the existing event_type check constraint (may have been created with wrong/incomplete values)
ALTER TABLE meetings DROP CONSTRAINT IF EXISTS meetings_event_type_check;

-- Add event_type column if it doesn't exist yet, then set the correct constraint
ALTER TABLE meetings ADD COLUMN IF NOT EXISTS event_type text DEFAULT 'overig';

ALTER TABLE meetings ADD CONSTRAINT meetings_event_type_check
  CHECK (event_type IN ('kennismaking', 'alv', 'bouwvergadering', 'workshop', 'uitje', 'overig'));
