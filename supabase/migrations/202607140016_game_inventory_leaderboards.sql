create table if not exists public.game_inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  sku text not null,
  name text not null,
  item_type text not null default 'collectible',
  quantity integer not null default 1 check (quantity > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, game_id, sku)
);
create table if not exists public.game_leaderboard_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  mode text not null default 'casual',
  score bigint not null default 0 check (score >= 0),
  server_verified boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists game_leaderboard_rank_idx on public.game_leaderboard_entries(game_id, mode, score desc);
create table if not exists public.game_moderation_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  game_id text not null,
  match_id uuid,
  reason text not null,
  status text not null default 'open' check (status in ('open','reviewing','actioned','dismissed')),
  resolution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create table if not exists public.game_match_events (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  sequence bigint not null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  integrity_hash text,
  anti_cheat_score integer not null default 0,
  created_at timestamptz not null default now(),
  unique(match_id, user_id, sequence)
);
create table if not exists public.game_world_districts (
  id text primary key,
  game_id text not null,
  name text not null,
  status text not null default 'planned',
  version integer not null default 1,
  manifest jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.game_inventory enable row level security;
alter table public.game_leaderboard_entries enable row level security;
alter table public.game_moderation_reports enable row level security;
alter table public.game_match_events enable row level security;
alter table public.game_world_districts enable row level security;
create policy "owners read inventory" on public.game_inventory for select using (auth.uid()=user_id);
create policy "public reads verified leaderboards" on public.game_leaderboard_entries for select using (server_verified=true);
create policy "users submit reports" on public.game_moderation_reports for insert with check (auth.uid()=reporter_id);
create policy "participants read own events" on public.game_match_events for select using (auth.uid()=user_id);
create policy "public reads released districts" on public.game_world_districts for select using (status in ('playable-alpha','beta','released'));
