-- Server-owned practice resume snapshots. These records NEVER authorize game rankings, rewards, payouts or wallet changes.
create table if not exists public.tryamm_gameverse_practice_sessions(
 user_id uuid not null references auth.users(id) on delete cascade,
 game_id text not null check(game_id in ('spades-practice','pool-practice')),
 revision integer not null default 1 check(revision>=1),
 state jsonb not null,
 updated_at timestamptz not null default now(),
 primary key(user_id,game_id)
);
create index if not exists tryamm_gameverse_practice_updated_idx on public.tryamm_gameverse_practice_sessions(user_id,updated_at desc);
alter table public.tryamm_gameverse_practice_sessions enable row level security;
revoke insert,update,delete on public.tryamm_gameverse_practice_sessions from anon,authenticated;
grant select on public.tryamm_gameverse_practice_sessions to authenticated;
drop policy if exists tryamm_gameverse_practice_read_own on public.tryamm_gameverse_practice_sessions;
create policy tryamm_gameverse_practice_read_own on public.tryamm_gameverse_practice_sessions
 for select to authenticated using ((select auth.uid())=user_id);
comment on table public.tryamm_gameverse_practice_sessions is 'Non-authoritative practice resume only; no financial or competitive benefits.';
