create table if not exists public.streetverse_mission_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  mission_id text not null,
  beat_id text not null,
  status text not null default 'active' check (status in ('active','complete','failed','paused')),
  choice jsonb not null default '{}'::jsonb,
  runtime_state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id,character_id,mission_id)
);

alter table public.streetverse_mission_runs enable row level security;
revoke all on public.streetverse_mission_runs from anon;
grant select,insert,update,delete on public.streetverse_mission_runs to authenticated;

create policy mission_runs_select_own on public.streetverse_mission_runs for select to authenticated using ((select auth.uid())=user_id);
create policy mission_runs_insert_own on public.streetverse_mission_runs for insert to authenticated with check ((select auth.uid())=user_id);
create policy mission_runs_update_own on public.streetverse_mission_runs for update to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy mission_runs_delete_own on public.streetverse_mission_runs for delete to authenticated using ((select auth.uid())=user_id);

create index if not exists streetverse_mission_runs_user_character_idx on public.streetverse_mission_runs(user_id,character_id,updated_at desc);
