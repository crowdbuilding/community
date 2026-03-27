-- Add email to profiles for member communication
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email text;

-- Update the trigger to also store email
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, full_name, avatar_url, email)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    email = EXCLUDED.email;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Backfill existing profiles with email from auth.users
UPDATE profiles SET email = u.email
FROM auth.users u
WHERE profiles.id = u.id AND profiles.email IS NULL;
