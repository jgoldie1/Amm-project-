create table if not exists public.game_player_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  avatar_asset_id text,
  accessibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.game_cloud_saves (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  slot integer not null default 1 check(slot between 1 and 10),
  version integer not null default 1,
  state jsonb not null default '{}'::jsonb,
  checksum text,
  updated_at timestamptz not null default now(),
  unique(user_id,game_id,slot)
);

create table if not exists public.game_queue_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  mode text not null default 'casual',
  region text not null default 'auto',
  party_size integer not null default 1,
  skill_rating integer not null default 0,
  controller text not null default 'touch',
  crossplay boolean not null default true,
  status text not null default 'searching',
  created_at timestamptz not null default now()
);

create table if not exists public.game_matches (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  mode text not null,
  region text not null,
  status text not null default 'lobby',
  seed text not null,
  server_authority boolean not null default true,
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.game_match_players (
  match_id uuid not null references public.game_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team text,
  rating integer not null default 0,
  result jsonb not null default '{}'::jsonb,
  primary key(match_id,user_id)
);

create table if not exists public.game_progress_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  event_type text not null,
  xp integer not null default 0,
  currency integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.game_achievements (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  code text not null,
  title text not null,
  description text not null default '',
  threshold integer not null default 1,
  reward_xp integer not null default 0,
  hidden boolean not null default false,
  unique(game_id,code)
);

create table if not exists public.game_player_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.game_achievements(id) on delete cascade,
  progress integer not null default 0,
  unlocked_at timestamptz,
  primary key(user_id,achievement_id)
);

create table if not exists public.game_replays (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references public.game_matches(id) on delete set null,
  game_id text not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  duration_seconds integer not null default 0,
  storage_path text not null,
  visibility text not null default 'private' check(visibility in ('private','friends','public')),
  integrity_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.game_anti_cheat_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  match_id uuid references public.game_matches(id) on delete set null,
  score integer not null default 0,
  disposition text not null default 'allow',
  reasons jsonb not null default '[]'::jsonb,
  telemetry jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_saves_owner_idx on public.game_cloud_saves(user_id,game_id);
create index if not exists game_queue_search_idx on public.game_queue_tickets(game_id,mode,region,status,skill_rating);
create index if not exists game_progress_owner_idx on public.game_progress_events(user_id,game_id,created_at desc);
create index if not exists game_replays_public_idx on public.game_replays(game_id,created_at desc) where visibility='public';

alter table public.game_player_profiles enable row level security;
alter table public.game_cloud_saves enable row level security;
alter table public.game_queue_tickets enable row level security;
alter table public.game_matches enable row level security;
alter table public.game_match_players enable row level security;
alter table public.game_progress_events enable row level security;
alter table public.game_achievements enable row level security;
alter table public.game_player_achievements enable row level security;
alter table public.game_replays enable row level security;
alter table public.game_anti_cheat_events enable row level security;

create policy game_profiles_owner on public.game_player_profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy game_saves_owner on public.game_cloud_saves for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy game_queue_owner on public.game_queue_tickets for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy game_match_member_read on public.game_matches for select using(exists(select 1 from public.game_match_players p where p.match_id=id and p.user_id=auth.uid()));
create policy game_match_players_member_read on public.game_match_players for select using(user_id=auth.uid() or exists(select 1 from public.game_match_players p where p.match_id=game_match_players.match_id and p.user_id=auth.uid()));
create policy game_progress_owner_read on public.game_progress_events for select using(auth.uid()=user_id);
create policy game_achievements_public_read on public.game_achievements for select using(true);
create policy game_player_achievements_owner_read on public.game_player_achievements for select using(auth.uid()=user_id);
create policy game_replays_owner_all on public.game_replays for all using(auth.uid()=owner_id) with check(auth.uid()=owner_id);
create policy game_replays_public_read on public.game_replays for select using(visibility='public');

comment on table public.game_matches is 'Server-authoritative match records; writes should be restricted to the trusted backend service role.';
comment on table public.game_anti_cheat_events is 'Security telemetry; access should remain restricted to trusted moderation and backend roles.';
