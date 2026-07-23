-- GameVerse runtime persistence foundation.
-- Explicit grants + RLS are used because new Supabase tables may not be auto-exposed to the Data API.

create table if not exists public.gameverse_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player' check (char_length(display_name) between 1 and 40),
  xp bigint not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  wins integer not null default 0 check (wins >= 0),
  losses integer not null default 0 check (losses >= 0),
  best_score integer not null default 0 check (best_score >= 0),
  accessibility jsonb not null default '{"reducedMotion":false,"highContrast":false,"audioCues":true}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gameverse_matches (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  mode text not null default 'duel',
  state text not null default 'queued' check (state in ('queued','ready','active','completed','cancelled')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz
);

create table if not exists public.gameverse_match_players (
  match_id uuid not null references public.gameverse_matches(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  final_score integer,
  result text check (result in ('win','loss','draw',null)),
  primary key (match_id, user_id)
);

create table if not exists public.gameverse_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  match_id uuid references public.gameverse_matches(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.gameverse_profiles enable row level security;
alter table public.gameverse_matches enable row level security;
alter table public.gameverse_match_players enable row level security;
alter table public.gameverse_events enable row level security;

grant select, insert, update on public.gameverse_profiles to authenticated;
grant select on public.gameverse_matches to authenticated;
grant select on public.gameverse_match_players to authenticated;
grant insert on public.gameverse_events to authenticated;

create policy "profiles_select_own" on public.gameverse_profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.gameverse_profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.gameverse_profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "match_players_can_read_match" on public.gameverse_matches for select to authenticated using (
  exists (select 1 from public.gameverse_match_players p where p.match_id = id and p.user_id = (select auth.uid()))
);
create policy "players_can_read_membership" on public.gameverse_match_players for select to authenticated using (
  user_id = (select auth.uid()) or exists (
    select 1 from public.gameverse_match_players self where self.match_id = gameverse_match_players.match_id and self.user_id = (select auth.uid())
  )
);
create policy "events_insert_own" on public.gameverse_events for insert to authenticated with check (user_id = (select auth.uid()));

create index if not exists gameverse_events_user_created_idx on public.gameverse_events(user_id, created_at desc);
create index if not exists gameverse_events_match_created_idx on public.gameverse_events(match_id, created_at desc);
create index if not exists gameverse_matches_state_created_idx on public.gameverse_matches(state, created_at desc);
