-- ============================================================================
-- Community Platform — Initial Schema
-- ============================================================================

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz default now()
);

-- Projects
create table projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references organizations(id) on delete cascade not null,
  name text not null,
  location text,
  tagline text,
  description text,
  logo_url text,
  cover_image_url text,
  brand_primary_color text default '#4A90D9',
  brand_accent_color text default '#3BD269',
  default_theme text default 'light' check (default_theme in ('light', 'warm', 'dark')),
  created_at timestamptz default now()
);

-- Profiles (extends Supabase Auth)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  is_platform_admin boolean default false,
  created_at timestamptz default now()
);

-- Memberships
create table memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade not null,
  project_id uuid references projects(id) on delete cascade not null,
  role text not null default 'guest' check (role in ('guest', 'member', 'moderator', 'admin')),
  joined_at timestamptz default now(),
  unique(profile_id, project_id)
);

-- Milestones
create table milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  label text not null,
  status text default 'pending' check (status in ('done', 'active', 'pending')),
  sort_order int not null
);

-- Updates
create table updates (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  title text not null,
  body text not null,
  tag text,
  image_url text,
  is_public boolean default false,
  created_at timestamptz default now()
);

-- Posts (prikbord)
create table posts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  text text not null,
  tag text,
  image_url text,
  is_pinned boolean default false,
  is_hidden boolean default false,
  created_at timestamptz default now()
);

-- Comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  author_id uuid references profiles(id) not null,
  text text not null,
  created_at timestamptz default now()
);

-- Post likes
create table post_likes (
  profile_id uuid references profiles(id) on delete cascade not null,
  post_id uuid references posts(id) on delete cascade not null,
  primary key (profile_id, post_id)
);

-- Meetings
create table meetings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  title text not null,
  date timestamptz not null,
  location text,
  status text default 'upcoming' check (status in ('upcoming', 'done')),
  notes text,
  created_at timestamptz default now()
);

-- Decisions
create table decisions (
  id uuid primary key default gen_random_uuid(),
  meeting_id uuid references meetings(id) on delete cascade not null,
  text text not null,
  created_at timestamptz default now()
);

-- Workgroups
create table workgroups (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- Workgroup memberships
create table workgroup_members (
  profile_id uuid references profiles(id) on delete cascade not null,
  workgroup_id uuid references workgroups(id) on delete cascade not null,
  primary key (profile_id, workgroup_id)
);

-- ============================================================================
-- Auth trigger: auto-create profile on signup
-- ============================================================================

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    avatar_url = excluded.avatar_url;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ============================================================================
-- RLS Helper Functions
-- ============================================================================

create or replace function is_platform_admin()
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and is_platform_admin = true
  );
$$ language sql security definer;

create or replace function has_membership(p_project_id uuid, p_min_role text default 'guest')
returns boolean as $$
  select exists (
    select 1 from memberships
    where profile_id = auth.uid()
    and project_id = p_project_id
    and (
      case p_min_role
        when 'guest' then role in ('guest', 'member', 'moderator', 'admin')
        when 'member' then role in ('member', 'moderator', 'admin')
        when 'moderator' then role in ('moderator', 'admin')
        when 'admin' then role = 'admin'
        else false
      end
    )
  );
$$ language sql security definer;

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================

alter table organizations enable row level security;
alter table projects enable row level security;
alter table profiles enable row level security;
alter table memberships enable row level security;
alter table milestones enable row level security;
alter table updates enable row level security;
alter table posts enable row level security;
alter table comments enable row level security;
alter table post_likes enable row level security;
alter table meetings enable row level security;
alter table decisions enable row level security;
alter table workgroups enable row level security;
alter table workgroup_members enable row level security;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Organizations
create policy "Platform admins can read organizations"
  on organizations for select using (is_platform_admin());

create policy "Platform admins can manage organizations"
  on organizations for all using (is_platform_admin());

-- Projects
create policy "Members can read their projects"
  on projects for select using (
    is_platform_admin() or has_membership(id, 'guest')
  );

create policy "Platform admins can manage projects"
  on projects for insert with check (is_platform_admin());

create policy "Platform admins can update projects"
  on projects for update using (is_platform_admin() or has_membership(id, 'admin'));

-- Profiles
create policy "Users can read profiles"
  on profiles for select using (true);

create policy "Users can update own profile"
  on profiles for update using (id = auth.uid());

-- Memberships
create policy "Members can see project memberships"
  on memberships for select using (
    is_platform_admin() or has_membership(project_id, 'guest')
  );

create policy "Moderators can insert memberships"
  on memberships for insert with check (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

create policy "Admins can update memberships"
  on memberships for update using (
    is_platform_admin() or has_membership(project_id, 'admin')
  );

create policy "Admins can delete memberships"
  on memberships for delete using (
    is_platform_admin() or has_membership(project_id, 'admin')
  );

-- Milestones
create policy "Members can read milestones"
  on milestones for select using (
    is_platform_admin() or has_membership(project_id, 'guest')
  );

create policy "Admins can manage milestones"
  on milestones for insert with check (
    is_platform_admin() or has_membership(project_id, 'admin')
  );

create policy "Admins can update milestones"
  on milestones for update using (
    is_platform_admin() or has_membership(project_id, 'admin')
  );

-- Updates
create policy "Users can read updates from their projects"
  on updates for select using (
    is_platform_admin()
    or has_membership(project_id, 'member')
    or (has_membership(project_id, 'guest') and is_public = true)
  );

create policy "Moderators can create updates"
  on updates for insert with check (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

create policy "Moderators can update updates"
  on updates for update using (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

-- Posts
create policy "Members can read posts"
  on posts for select using (
    is_platform_admin() or has_membership(project_id, 'member')
  );

create policy "Members can create posts"
  on posts for insert with check (
    is_platform_admin() or has_membership(project_id, 'member')
  );

create policy "Moderators can update posts"
  on posts for update using (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

-- Comments
create policy "Members can read comments"
  on comments for select using (
    is_platform_admin() or exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can create comments"
  on comments for insert with check (
    is_platform_admin() or exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

-- Post likes
create policy "Members can read likes"
  on post_likes for select using (
    is_platform_admin() or exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can toggle likes"
  on post_likes for insert with check (
    profile_id = auth.uid() and exists (
      select 1 from posts p where p.id = post_id and has_membership(p.project_id, 'member')
    )
  );

create policy "Members can remove likes"
  on post_likes for delete using (
    profile_id = auth.uid()
  );

-- Meetings
create policy "Members can read meetings"
  on meetings for select using (
    is_platform_admin() or has_membership(project_id, 'member')
  );

create policy "Moderators can create meetings"
  on meetings for insert with check (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

create policy "Moderators can update meetings"
  on meetings for update using (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

-- Decisions
create policy "Members can read decisions"
  on decisions for select using (
    is_platform_admin() or exists (
      select 1 from meetings m where m.id = meeting_id and has_membership(m.project_id, 'member')
    )
  );

create policy "Moderators can create decisions"
  on decisions for insert with check (
    is_platform_admin() or exists (
      select 1 from meetings m where m.id = meeting_id and has_membership(m.project_id, 'moderator')
    )
  );

-- Workgroups
create policy "Members can read workgroups"
  on workgroups for select using (
    is_platform_admin() or has_membership(project_id, 'member')
  );

create policy "Moderators can manage workgroups"
  on workgroups for insert with check (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

create policy "Moderators can update workgroups"
  on workgroups for update using (
    is_platform_admin() or has_membership(project_id, 'moderator')
  );

-- Workgroup members
create policy "Members can read workgroup members"
  on workgroup_members for select using (
    is_platform_admin() or exists (
      select 1 from workgroups w where w.id = workgroup_id and has_membership(w.project_id, 'member')
    )
  );

create policy "Members can join workgroups"
  on workgroup_members for insert with check (
    profile_id = auth.uid() and exists (
      select 1 from workgroups w where w.id = workgroup_id and has_membership(w.project_id, 'member')
    )
  );

create policy "Members can leave workgroups"
  on workgroup_members for delete using (
    profile_id = auth.uid() or exists (
      select 1 from workgroups w where w.id = workgroup_id and has_membership(w.project_id, 'moderator')
    )
  );
