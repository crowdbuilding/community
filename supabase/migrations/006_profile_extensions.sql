-- ============================================================================
-- Profile extensions: personal info for community members
-- ============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS birth_year int;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS household text;       -- gezinssamenstelling
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS housing_dream text;   -- woondroom
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_urls text[];    -- foto galerij
