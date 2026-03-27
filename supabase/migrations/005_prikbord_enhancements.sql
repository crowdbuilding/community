-- ============================================================================
-- Prikbord enhancements: polls, reactions, follows, reply threading
-- ============================================================================

-- Add post_type column to posts
alter table posts add column if not exists post_type text default 'post' check (post_type in ('post', 'poll'));

-- Add reply_to columns to comments
alter table comments add column if not exists reply_to_id uuid references comments(id) on delete set null;
alter table comments add column if not exists reply_to_name text;

-- Post reactions
create table if not exists post_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  emoji text not null,
  created_at timestamptz default now(),
  unique(post_id, profile_id, emoji)
);

-- Post follows
create table if not exists post_follows (
  profile_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (profile_id, post_id)
);

-- Poll options
create table if not exists poll_options (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  text text not null,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

-- Poll votes
create table if not exists poll_votes (
  id uuid primary key default gen_random_uuid(),
  option_id uuid references poll_options(id) on delete cascade not null,
  profile_id uuid references profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(option_id, profile_id)
);

-- ============================================================================
-- Enable RLS
-- ============================================================================

alter table post_reactions enable row level security;
alter table post_follows enable row level security;
alter table poll_options enable row level security;
alter table poll_votes enable row level security;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Post reactions
create policy "Members can read reactions"
  on post_reactions for select using (
    exists (select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member'))
  );

create policy "Members can add reactions"
  on post_reactions for insert with check (
    profile_id = auth.uid() and exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can remove own reactions"
  on post_reactions for delete using (profile_id = auth.uid());

-- Post follows
create policy "Members can read follows"
  on post_follows for select using (
    exists (select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member'))
  );

create policy "Members can follow posts"
  on post_follows for insert with check (
    profile_id = auth.uid() and exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can unfollow posts"
  on post_follows for delete using (profile_id = auth.uid());

-- Poll options
create policy "Members can read poll options"
  on poll_options for select using (
    exists (select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member'))
  );

create policy "Members can create poll options"
  on poll_options for insert with check (
    exists (select 1 from posts p where p.id = post_id and p.author_id = auth.uid())
  );

-- Poll votes
create policy "Members can read votes"
  on poll_votes for select using (
    exists (
      select 1 from poll_options o join posts p on p.id = o.post_id
      where o.id = option_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can vote"
  on poll_votes for insert with check (
    profile_id = auth.uid() and exists (
      select 1 from poll_options o join posts p on p.id = o.post_id
      where o.id = option_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can change votes"
  on poll_votes for delete using (profile_id = auth.uid());

-- ============================================================================
-- Posts: allow authors to update/delete their own posts
-- ============================================================================

create policy "Authors can update own posts"
  on posts for update using (
    author_id = auth.uid()
  );

create policy "Authors and moderators can delete posts"
  on posts for delete using (
    author_id = auth.uid()
    or is_platform_admin()
    or exists (
      select 1 from memberships
      where profile_id = auth.uid()
      and project_id = posts.project_id
      and role in ('moderator', 'admin')
    )
  );
