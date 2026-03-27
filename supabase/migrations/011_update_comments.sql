-- Comments on updates (separate from post comments)
CREATE TABLE IF NOT EXISTS update_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id uuid REFERENCES updates(id) ON DELETE CASCADE NOT NULL,
  author_id uuid REFERENCES profiles(id) NOT NULL,
  text text NOT NULL,
  reply_to_id uuid REFERENCES update_comments(id) ON DELETE SET NULL,
  reply_to_name text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE update_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read update comments"
  ON update_comments FOR SELECT USING (
    EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND has_membership(u.project_id, 'aspirant'))
    OR EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND u.is_public = true AND has_membership(u.project_id, 'guest'))
  );

CREATE POLICY "Members can create update comments"
  ON update_comments FOR INSERT WITH CHECK (
    author_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND has_membership(u.project_id, 'aspirant'))
      OR EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND u.is_public = true AND has_membership(u.project_id, 'guest'))
    )
  );

CREATE POLICY "Authors can delete own update comments"
  ON update_comments FOR DELETE USING (author_id = auth.uid());

-- Update reactions (emoji reactions like on posts)
CREATE TABLE IF NOT EXISTS update_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  update_id uuid REFERENCES updates(id) ON DELETE CASCADE NOT NULL,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  emoji text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(update_id, profile_id, emoji)
);

ALTER TABLE update_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can read update reactions"
  ON update_reactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND has_membership(u.project_id, 'aspirant'))
    OR EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND u.is_public = true AND has_membership(u.project_id, 'guest'))
  );

CREATE POLICY "Members can add update reactions"
  ON update_reactions FOR INSERT WITH CHECK (
    profile_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND has_membership(u.project_id, 'aspirant'))
      OR EXISTS (SELECT 1 FROM updates u WHERE u.id = update_id AND u.is_public = true AND has_membership(u.project_id, 'guest'))
    )
  );

CREATE POLICY "Members can remove own update reactions"
  ON update_reactions FOR DELETE USING (profile_id = auth.uid());
