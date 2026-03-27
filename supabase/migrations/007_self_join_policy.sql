-- Allow authenticated users to request membership (as guest) to any project
-- This enables the invite link flow: user clicks link → joins as guest → admin approves

CREATE POLICY "Users can request to join projects"
  ON memberships FOR INSERT WITH CHECK (
    profile_id = auth.uid()
    AND role = 'guest'
  );

-- Allow any authenticated user to read basic project info (for join page)
CREATE POLICY "Authenticated users can read projects for joining"
  ON projects FOR SELECT USING (
    auth.uid() IS NOT NULL
  );
