begin;

create table if not exists public.game_player_checkpoints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  world_id text not null,
  district_id text not null,
  mission_id text,
  position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
  rotation jsonb not null default '{"x":0,"y":0,"z":0,"w":1}'::jsonb,
  progression jsonb not null default '{}'::jsonb,
  version bigint not null default 1,
  saved_at timestamptz not null default now(),
  unique(user_id, world_id)
);

create table if not exists public.game_matchmaking_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('shared_city','district_rescue_coop','user_world')),
  region text,
  district_id text,
  party_id text,
  max_players integer not null default 8 check (max_players between 2 and 64),
  status text not null default 'queued' check (status in ('queued','matched','cancelled','expired')),
  room_id text,
  created_at timestamptz not null default now(),
  matched_at timestamptz,
  expires_at timestamptz not null default (now() + interval '10 minutes')
);

create table if not exists public.game_room_memberships (
  id uuid primary key default gen_random_uuid(),
  room_id text not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  mode text not null check (mode in ('shared_city','district_rescue_coop','user_world')),
  district_id text,
  joined_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  disconnected_at timestamptz,
  reconnect_token_hash text,
  unique(room_id, user_id)
);

create index if not exists idx_game_player_checkpoints_user on public.game_player_checkpoints(user_id);
create index if not exists idx_game_matchmaking_status_mode on public.game_matchmaking_tickets(status, mode, created_at);
create index if not exists idx_game_room_memberships_user on public.game_room_memberships(user_id, last_seen_at desc);

alter table public.game_player_checkpoints enable row level security;
alter table public.game_matchmaking_tickets enable row level security;
alter table public.game_room_memberships enable row level security;

-- Players may read/write only their own persistent checkpoint.
drop policy if exists "checkpoint_select_own" on public.game_player_checkpoints;
create policy "checkpoint_select_own" on public.game_player_checkpoints
  for select using (auth.uid() = user_id);

drop policy if exists "checkpoint_insert_own" on public.game_player_checkpoints;
create policy "checkpoint_insert_own" on public.game_player_checkpoints
  for insert with check (auth.uid() = user_id);

drop policy if exists "checkpoint_update_own" on public.game_player_checkpoints;
create policy "checkpoint_update_own" on public.game_player_checkpoints
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Matchmaking tickets are private to the requesting player from the client.
-- A trusted server/service role may match tickets and assign rooms.
drop policy if exists "matchmaking_select_own" on public.game_matchmaking_tickets;
create policy "matchmaking_select_own" on public.game_matchmaking_tickets
  for select using (auth.uid() = user_id);

drop policy if exists "matchmaking_insert_own" on public.game_matchmaking_tickets;
create policy "matchmaking_insert_own" on public.game_matchmaking_tickets
  for insert with check (auth.uid() = user_id);

drop policy if exists "matchmaking_update_cancel_own" on public.game_matchmaking_tickets;
create policy "matchmaking_update_cancel_own" on public.game_matchmaking_tickets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Clients can inspect only their own room membership. Reconnect-token hashes are
-- server-generated and must never be created from unauthenticated client data.
drop policy if exists "room_membership_select_own" on public.game_room_memberships;
create policy "room_membership_select_own" on public.game_room_memberships
  for select using (auth.uid() = user_id);

commit;
