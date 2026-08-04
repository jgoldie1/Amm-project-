-- TryAMM Living Worlds foundation
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

alter table public.worlds enable row level security;
alter table public.world_profiles enable row level security;
alter table public.world_sessions enable row level security;
alter table public.world_inventory enable row level security;
alter table public.world_events enable row level security;

create policy "worlds readable by everyone" on public.worlds for select using (true);
create policy "events readable by everyone" on public.world_events for select using (true);
create policy "users read own world profile" on public.world_profiles for select using (auth.uid() = user_id);
create policy "users insert own world profile" on public.world_profiles for insert with check (auth.uid() = user_id);
create policy "users update own world profile" on public.world_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own sessions" on public.world_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users manage own inventory" on public.world_inventory for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "creators insert events" on public.world_events for insert with check (auth.uid() = owner_id);
create policy "owners update events" on public.world_events for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

insert into public.worlds (slug,name,kind,description,status) values
('my-world','My World','open-world','Persistent life, business, property, missions and social play.','alpha'),
('we-are-the-world','We Are the World','cooperative','Global rebuilding, culture, science and community missions.','alpha'),
('basketball','Basketball World','sport','Career, street, league, training and holographic replay.','development'),
('football','Football World','sport','Career, franchise, play design and team competition.','development'),
('baseball','Baseball World','sport','Batting, pitching, fielding, clubs and seasons.','development'),
('soccer','Soccer World','sport','Club, street, academy and global tournaments.','development'),
('hockey','Hockey World','sport','Ice physics, teams, leagues and arena events.','development'),
('combat','Combat World','sport','Boxing, MMA, training camps and sanctioned competition.','development'),
('racing','Racing World','sport','Street, circuit, off-road and future vehicle racing.','development'),
('creator','Creator World','creator','Build arenas, missions, events, broadcasts and mini-games.','development'),
('music','Music World','entertainment','Studios, concerts, labels, festivals and creator commerce.','development'),
('academy','Academy World','education','Sports, business, technology and creative learning.','development'),
('middleverse','The Middleverse','hub','Travel, commerce and events connecting every world.','development')
on conflict (slug) do update set name=excluded.name,kind=excluded.kind,description=excluded.description;
