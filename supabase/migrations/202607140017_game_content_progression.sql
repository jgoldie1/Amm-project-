create table if not exists public.game_loadouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  name text not null default 'Primary Loadout',
  class_id text not null,
  equipment_ids text[] not null default '{}',
  total_score integer not null default 0 check (total_score >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, game_id, name)
);

create table if not exists public.game_quest_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  quest_id text not null,
  status text not null default 'active' check (status in ('active','completed','abandoned')),
  step_index integer not null default 0 check (step_index >= 0),
  rewards jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.yogihoo_player_creatures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  creature_id text not null,
  nickname text,
  level integer not null default 1 check (level between 1 and 100),
  xp bigint not null default 0 check (xp >= 0),
  health integer not null default 100 check (health >= 0),
  stats jsonb not null default '{}'::jsonb,
  moves text[] not null default '{}',
  evolution_stage integer not null default 0 check (evolution_stage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, creature_id)
);

create table if not exists public.game_creator_arenas (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  name text not null,
  layout jsonb not null default '{}'::jsonb,
  asset_ids text[] not null default '{}',
  status text not null default 'draft' check (status in ('draft','review','published','rejected','archived')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_moderation_actions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references public.game_moderation_reports(id) on delete set null,
  target_user_id uuid references auth.users(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  action_type text not null check (action_type in ('warning','mute','suspend','ban','dismiss')),
  reason text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists game_loadouts_user_game_idx on public.game_loadouts(user_id, game_id);
create index if not exists game_quest_progress_user_status_idx on public.game_quest_progress(user_id, status);
create index if not exists yogihoo_player_creatures_user_idx on public.yogihoo_player_creatures(user_id);
create index if not exists game_creator_arenas_status_idx on public.game_creator_arenas(status, moderation_status);
create index if not exists game_moderation_actions_target_idx on public.game_moderation_actions(target_user_id, created_at desc);

alter table public.game_loadouts enable row level security;
alter table public.game_quest_progress enable row level security;
alter table public.yogihoo_player_creatures enable row level security;
alter table public.game_creator_arenas enable row level security;
alter table public.game_moderation_actions enable row level security;

create policy "players manage own loadouts" on public.game_loadouts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "players manage own quests" on public.game_quest_progress for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "players manage own creatures" on public.yogihoo_player_creatures for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owners manage creator arenas" on public.game_creator_arenas for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "public reads published arenas" on public.game_creator_arenas for select using (status = 'published' and moderation_status = 'approved');
create policy "users read own moderation actions" on public.game_moderation_actions for select using (auth.uid() = target_user_id);
