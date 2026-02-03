
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Roadmaps Table
create table roadmaps (
  id text primary key, -- Keeping as text to match existing IDs like 'roadmap_1', but typically UUID is better. For new ones we can use UUIDs.
  title text not null,
  description text,
  is_public boolean default false,
  user_id uuid references auth.users(id) not null,
  created_at timestamp with time zone default now(),
  is_template boolean default false,
  share_id text,
  category text
);

-- Milestones Table
create table milestones (
  id text primary key,
  roadmap_id text references roadmaps(id) on delete cascade not null,
  title text not null,
  description text,
  status text check (status in ('PLANNED', 'IN_PROGRESS', 'COMPLETED')) default 'PLANNED',
  "order" integer not null
);

-- Resources Table
create table resources (
  id text primary key,
  milestone_id text references milestones(id) on delete cascade not null,
  title text not null,
  url text not null,
  type text check (type in ('VIDEO', 'ARTICLE')) not null
);

-- Progress Table
create table progress (
  id text primary key,
  user_id uuid references auth.users(id) not null,
  milestone_id text references milestones(id) on delete cascade not null,
  is_completed boolean default false,
  unique(user_id, milestone_id) -- Prevent duplicate progress entries
);

-- Row Level Security (RLS) Policies

-- Roadmaps: Users can see their own roadmaps AND all templates.
alter table roadmaps enable row level security;

create policy "Users can view their own roadmaps and templates"
on roadmaps for select
using (auth.uid() = user_id or is_template = true);

create policy "Users can insert their own roadmaps"
on roadmaps for insert
with check (auth.uid() = user_id);

create policy "Users can update their own roadmaps"
on roadmaps for update
using (auth.uid() = user_id);

create policy "Users can delete their own roadmaps"
on roadmaps for delete
using (auth.uid() = user_id);

-- Milestones/Resources: Inherit viewability from roadmap? 
-- Simplest is: viewable if roadmap is viewable.
-- But Supabase policies on related tables can be tricky (performance). 
-- Often easier to just say: "If I can see the roadmap, I can see its components". 
-- BUT for simplicity/safety: Users can see components of their own roadmaps + templates.

alter table milestones enable row level security;
alter table resources enable row level security;

create policy "View milestones common"
on milestones for select
using (
  exists (select 1 from roadmaps r where r.id = milestones.roadmap_id and (r.user_id = auth.uid() or r.is_template = true))
);

create policy "Manage milestones personal"
on milestones for all
using (
  exists (select 1 from roadmaps r where r.id = milestones.roadmap_id and r.user_id = auth.uid())
);

create policy "View resources common"
on resources for select
using (
  exists (select 1 from milestones m join roadmaps r on m.roadmap_id = r.id where m.id = resources.milestone_id and (r.user_id = auth.uid() or r.is_template = true))
);

create policy "Manage resources personal"
on resources for all
using (
  exists (select 1 from milestones m join roadmaps r on m.roadmap_id = r.id where m.id = resources.milestone_id and r.user_id = auth.uid())
);

-- Progress: Users own their progress
alter table progress enable row level security;

create policy "Users manage their own progress"
on progress for all
using (auth.uid() = user_id);
