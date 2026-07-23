-- GameVerse eSports competition schema
-- Review/apply in staging before production.

create table if not exists public.esports_seasons (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  name text not null,
  status text not null default 'draft' check (status in ('draft','open','active','completed','cancelled')),
  starts_at timestamptz,
  ends_at timestamptz,
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.esports_tournaments (
  id uuid primary key default gen_random_uuid(),
  season_id uuid references public.esports_seasons(id) on delete set null,
  game_id text not null,
  name text not null,
  format text not null check (format in ('leaderboard','single_elimination','double_elimination','round_robin','swiss','time_trial','score_attack','team')),
  status text not null default 'draft' check (status in ('draft','registration','active','completed','cancelled')),
  max_players integer,
  entry_rules jsonb not null default '{}'::jsonb,
  prize_policy jsonb not null default '{}'::jsonb,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.esports_entries (
  tournament_id uuid not null references public.esports_tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  team_id uuid,
  status text not null default 'registered' check (status in ('registered','checked_in','active','eliminated','completed','disqualified','withdrawn')),
  seed integer,
  registered_at timestamptz not null default now(),
  primary key (tournament_id, user_id)
);

create table if not exists public.esports_matches (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid not null references public.esports_tournaments(id) on delete cascade,
  round_no integer,
  bracket_slot text,
  status text not null default 'scheduled' check (status in ('scheduled','ready','active','completed','forfeit','disputed','cancelled')),
  player_a uuid references auth.users(id) on delete set null,
  player_b uuid references auth.users(id) on delete set null,
  winner_id uuid references auth.users(id) on delete set null,
  result jsonb not null default '{}'::jsonb,
  anti_cheat_status text not null default 'pending' check (anti_cheat_status in ('pending','verified','flagged','rejected')),
  replay_ref text,
  starts_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.esports_verified_scores (
  id uuid primary key default gen_random_uuid(),
  tournament_id uuid references public.esports_tournaments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  score bigint not null check (score >= 0),
  stage integer not null default 1 check (stage >= 1),
  duration_ms bigint,
  run_id text not null,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','flagged','rejected')),
  verification jsonb not null default '{}'::jsonb,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  unique(user_id, game_id, run_id)
);

create index if not exists esports_verified_scores_board_idx
  on public.esports_verified_scores(game_id, verification_status, score desc, duration_ms asc nulls last);

create or replace view public.esports_public_leaderboard
with (security_invoker = true) as
select
  evs.game_id,
  evs.user_id,
  gp.display_name,
  max(evs.score) as high_score,
  min(evs.duration_ms) filter (where evs.duration_ms is not null) as best_duration_ms,
  count(*) filter (where evs.verification_status = 'verified') as verified_runs
from public.esports_verified_scores evs
left join public.game_profiles gp on gp.user_id = evs.user_id
where evs.verification_status = 'verified'
group by evs.game_id, evs.user_id, gp.display_name;

alter table public.esports_seasons enable row level security;
alter table public.esports_tournaments enable row level security;
alter table public.esports_entries enable row level security;
alter table public.esports_matches enable row level security;
alter table public.esports_verified_scores enable row level security;

create policy "esports_seasons_read" on public.esports_seasons
for select to authenticated using (true);
create policy "esports_tournaments_read" on public.esports_tournaments
for select to authenticated using (true);
create policy "esports_entries_read_own" on public.esports_entries
for select to authenticated using ((select auth.uid()) = user_id);
create policy "esports_entries_insert_own" on public.esports_entries
for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "esports_verified_scores_read_own" on public.esports_verified_scores
for select to authenticated using ((select auth.uid()) = user_id);

-- No direct browser INSERT/UPDATE policy for verified scores, match winners, seeds or prize outcomes.
-- Trusted server/GameOps paths validate gameplay, anti-cheat evidence and tournament rules first.
-- Real-money prizes require separate legal/eligibility/tax/compliance review by jurisdiction.
