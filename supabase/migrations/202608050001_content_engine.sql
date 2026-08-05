create extension if not exists pgcrypto;

create table if not exists public.content_projects (
  id text primary key,
  owner_id text not null,
  title text not null,
  summary text not null,
  problem_solved text default '',
  status text not null default 'concept' check (status in ('concept','prototype','alpha','beta','live')),
  limitation text default '',
  next_milestone text default '',
  contributor_name text default '',
  contributor_role text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_assets (
  id uuid primary key default gen_random_uuid(),
  project_id text not null references public.content_projects(id) on delete cascade,
  owner_id text not null,
  asset_type text not null check (asset_type in ('screenshot','screen-recording','document','logo','trailer','other')),
  storage_path text not null,
  caption text default '',
  created_at timestamptz not null default now()
);

create table if not exists public.content_outputs (
  id text primary key,
  project_id text not null references public.content_projects(id) on delete cascade,
  channel text not null,
  title text not null,
  body text not null,
  approval_status text not null default 'draft' check (approval_status in ('draft','approved','scheduled','published','rejected')),
  scheduled_for timestamptz,
  published_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  project_id text references public.content_projects(id) on delete set null,
  event_name text not null,
  source text default '',
  campaign text default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_id text not null,
  referred_user_id text,
  code text not null unique,
  status text not null default 'pending' check (status in ('pending','qualified','rewarded','cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists content_projects_owner_idx on public.content_projects(owner_id, created_at desc);
create index if not exists content_outputs_project_idx on public.content_outputs(project_id, created_at);
create index if not exists analytics_events_project_idx on public.analytics_events(project_id, created_at desc);

alter table public.content_projects enable row level security;
alter table public.content_assets enable row level security;
alter table public.content_outputs enable row level security;
alter table public.analytics_events enable row level security;
alter table public.referrals enable row level security;

-- The application currently uses its own text user IDs. API access is performed
-- server-side with the service-role key. Browser clients receive no service key.
-- When TRYAMM migrates fully to Supabase Auth, replace these policies with
-- auth.uid()-based owner policies.

revoke all on public.content_projects from anon, authenticated;
revoke all on public.content_assets from anon, authenticated;
revoke all on public.content_outputs from anon, authenticated;
revoke all on public.analytics_events from anon, authenticated;
revoke all on public.referrals from anon, authenticated;

grant all on public.content_projects to service_role;
grant all on public.content_assets to service_role;
grant all on public.content_outputs to service_role;
grant all on public.analytics_events to service_role;
grant all on public.referrals to service_role;
