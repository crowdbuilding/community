-- ============================================================================
-- Professional Profile Extension + Company Logo
-- ============================================================================

ALTER TABLE profiles ADD COLUMN company TEXT;
ALTER TABLE profiles ADD COLUMN company_logo_url TEXT;
ALTER TABLE profiles ADD COLUMN phone TEXT;
ALTER TABLE profiles ADD COLUMN website TEXT;
ALTER TABLE profiles ADD COLUMN bio TEXT;
