-- Talon Lock / TryAMM Passport v1 SQL contract
-- Review in staging before applying. Uses auth.uid() ownership checks and explicit RLS.

create table if not exists public.game_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Player',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  xp bigint not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  high_score bigint not null default 0 check (high_score >= 0),
  highest_stage integer not null default 1 check (highest_stage >= 1),
  games_played bigint not null default 0 check (games_played >= 0),
  wins bigint not null default 0 check (wins >= 0),
  losses bigint not null default 0 check (losses >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

create table if not exists public.game_achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  achievement_id text not null,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, game_id, achievement_id)
);

alter table public.game_profiles enable row level security;
alter table public.game_progress enable row level security;
alter table public.game_achievements enable row level security;

create policy "game_profiles_select_own" on public.game_profiles
for select to authenticated using ((select auth.uid()) = user_id);
create policy "game_profiles_insert_own" on public.game_profiles
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "game_profiles_update_own" on public.game_profiles
for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "game_progress_select_own" on public.game_progress
for select to authenticated using ((select auth.uid()) = user_id);
-- Intentionally no direct client INSERT/UPDATE policy for authoritative score/XP fields.
-- Server-side trusted code should validate game results and write progression using a protected backend path.

create policy "game_achievements_select_own" on public.game_achievements
for select to authenticated using ((select auth.uid()) = user_id);

-- Optional Data API grants may be needed depending on project Data API exposure settings.
-- Never expose service_role/secret keys in Talon Lock or any browser client.
