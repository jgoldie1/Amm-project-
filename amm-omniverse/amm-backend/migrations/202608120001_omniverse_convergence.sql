-- AMM Omniverse convergence schema
-- Reuses the Living Worlds foundation and adds the missing shared platform records.
create extension if not exists pgcrypto;

create table if not exists public.worlds (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  kind text not null,
  description text not null default '',
  status text not null default 'development' check (status in ('development','alpha','beta','live','maintenance')),
  max_players integer not null default 1000 check (max_players > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  avatar_name text not null default 'Traveler',
  home_world_slug text not null default 'my-world',
  level integer not null default 1 check (level > 0),
  xp bigint not null default 0 check (xp >= 0),
  reputation bigint not null default 0,
  skills jsonb not null default '{}'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.world_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  world_id uuid not null references public.worlds(id) on delete cascade,
  shard text not null default 'global-1',
  state jsonb not null default '{}'::jsonb,
  entered_at timestamptz not null default now(),
  ended_at timestamptz
);
create index if not exists world_sessions_active_idx on public.world_sessions(world_id, entered_at desc) where ended_at is null;
create index if not exists world_sessions_user_active_idx on public.world_sessions(user_id, entered_at desc) where ended_at is null;

create table if not exists public.world_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_type text not null,
  item_key text not null,
  quantity integer not null default 1 check (quantity >= 0),
  attributes jsonb not null default '{}'::jsonb,
  acquired_at timestamptz not null default now(),
  unique(user_id, item_type, item_key)
);

create table if not exists public.world_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete set null,
  world_id uuid not null references public.worlds(id) on delete cascade,
  title text not null,
  description text not null default '',
  event_type text not null default 'community',
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer not null default 100 check (capacity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Event bus / audit stream. This is intentionally separate from scheduled world_events.
create table if not exists public.platform_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  world_id uuid references public.worlds(id) on delete set null,
  event_type text not null,
  source text not null default 'client',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists platform_events_user_idx on public.platform_events(user_id, created_at desc);
create index if not exists platform_events_type_idx on public.platform_events(event_type, created_at desc);

-- AI Cafe / Creator Table persistence.
create table if not exists public.creator_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  project_type text not null check (project_type in ('business','book','game','world','music','app','course','research','invention','other')),
  status text not null default 'idea' check (status in ('idea','learning','designing','building','testing','published','archived')),
  current_stage text not null default 'idea',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists creator_projects_owner_idx on public.creator_projects(owner_id, updated_at desc);

-- Workforce/call-center/logistics simulation state.
create table if not exists public.workforce_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  simulation_key text not null,
  status text not null default 'started' check (status in ('started','paused','completed','failed')),
  score numeric,
  state jsonb not null default '{}'::jsonb,
  feedback jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create index if not exists workforce_runs_user_idx on public.workforce_runs(user_id, started_at desc);

-- Kingdoms Press project model.
create table if not exists public.publications (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid references public.creator_projects(id) on delete set null,
  title text not null,
  format text not null default 'ebook' check (format in ('print','ebook','audio','interactive','holobook')),
  edition text not null default '1',
  status text not null default 'draft' check (status in ('draft','editorial','rights-review','approved','published','archived')),
  source_verification_status text not null default 'not-required' check (source_verification_status in ('not-required','pending','verified','flagged')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists publications_owner_idx on public.publications(owner_id, updated_at desc);

-- All American App Store account-level access/entitlements.
create table if not exists public.entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  asset_key text not null,
  asset_type text not null,
  source text not null default 'grant' check (source in ('purchase','subscription','family','education','grant','creator')),
  metadata jsonb not null default '{}'::jsonb,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  unique(user_id, asset_key)
);
create index if not exists entitlements_user_idx on public.entitlements(user_id, starts_at desc);

alter table public.worlds enable row level security;
alter table public.world_profiles enable row level security;
alter table public.world_sessions enable row level security;
alter table public.world_inventory enable row level security;
alter table public.world_events enable row level security;
alter table public.platform_events enable row level security;
alter table public.creator_projects enable row level security;
alter table public.workforce_runs enable row level security;
alter table public.publications enable row level security;
alter table public.entitlements enable row level security;

-- Idempotent policy creation helper blocks.
do $$ begin create policy "worlds readable by everyone" on public.worlds for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "events readable by everyone" on public.world_events for select using (true); exception when duplicate_object then null; end $$;
do $$ begin create policy "users read own world profile" on public.world_profiles for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users insert own world profile" on public.world_profiles for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users update own world profile" on public.world_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users manage own sessions" on public.world_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users manage own inventory" on public.world_inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "creators insert events" on public.world_events for insert with check (auth.uid() = owner_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "owners update events" on public.world_events for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users read own platform events" on public.platform_events for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users insert own platform events" on public.platform_events for insert with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users manage own creator projects" on public.creator_projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users manage own workforce runs" on public.workforce_runs for all using (auth.uid() = user_id) with check (auth.uid() = user_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users manage own publications" on public.publications for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id); exception when duplicate_object then null; end $$;
do $$ begin create policy "users read own entitlements" on public.entitlements for select using (auth.uid() = user_id); exception when duplicate_object then null; end $$;

insert into public.worlds (slug,name,kind,description,status,metadata) values
('my-world','My World','open-world','Persistent life, business, property, missions and social play.','alpha','{"screen":"city"}'::jsonb),
('middleverse','The Middleverse','hub','Travel, commerce and events connecting every world.','alpha','{"screen":"city","hub":true}'::jsonb),
('sports','Sportsverse','sport','Sports careers, leagues, training and holographic replay.','alpha','{"screen":"sports"}'::jsonb),
('marketplace','Marketplace World','business','Commerce, businesses, logistics and creator storefronts.','alpha','{"screen":"marketplace"}'::jsonb),
('music','Music World','entertainment','Studios, concerts, labels, festivals and creator commerce.','alpha','{"screen":"music"}'::jsonb),
('kingdom','Kingdom City','faith','Faith, scripture, ministry, service, family and stewardship.','alpha','{"screen":"faith"}'::jsonb),
('blockchain','Blockchain World','technology','Wallet, identity and blockchain experiences.','alpha','{"screen":"blockchain"}'::jsonb),
('generations','Generations World','education','Protected youth learning, family, creativity and career discovery.','development','{"screen":"city","youth":true}'::jsonb),
('workforce','Workforce World','workforce','AI call-center, logistics, business and career simulations.','development','{"screen":"city"}'::jsonb),
('wilderness','Wilderness World','nature','Wildlife, fishing, conservation, exploration and ecology.','development','{"screen":"city"}'::jsonb),
('ocean','Ocean World','nature','Marine biology, fishing, underwater exploration and conservation.','development','{"screen":"city"}'::jsonb),
('moon','Moon World','space','Lunar exploration, science, habitats and logistics.','development','{"screen":"city"}'::jsonb),
('mars','Mars World','space','Settlement, science, construction and logistics on Mars.','development','{"screen":"city"}'::jsonb),
('saturn','Saturn System','space','Saturn, Titan, Enceladus and outer-system exploration.','development','{"screen":"city"}'::jsonb),
('chrono','Chrono World','time','Historical reconstruction, future simulation and alternate timelines.','development','{"screen":"city"}'::jsonb),
('creator','Creator World','creator','Build experiences, worlds, missions, books and applications.','development','{"screen":"city"}'::jsonb)
on conflict (slug) do update set name=excluded.name,kind=excluded.kind,description=excluded.description,metadata=excluded.metadata;
