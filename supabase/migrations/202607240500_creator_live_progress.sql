create extension if not exists pgcrypto;

create table if not exists public.stream_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  livekit_room_name text not null unique,
  status text not null default 'live' check (status in ('live','paused','ended','cancelled')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  active_seconds bigint not null default 0,
  protected_break_seconds bigint not null default 0,
  total_seconds bigint not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stream_breaks (
  id uuid primary key default gen_random_uuid(),
  stream_session_id uuid not null references public.stream_sessions(id) on delete cascade,
  user_id uuid not null,
  break_type text not null check (break_type in ('bathroom','accessibility','medical','food_water','technical','emergency')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  requested_seconds bigint not null default 0,
  protected_seconds bigint not null default 0,
  preserves_session_continuity boolean not null default true
);

create index if not exists idx_stream_sessions_user on public.stream_sessions(user_id, started_at desc);
create index if not exists idx_stream_breaks_session on public.stream_breaks(stream_session_id, started_at desc);

alter table public.stream_sessions enable row level security;
alter table public.stream_breaks enable row level security;

drop policy if exists "stream_sessions_own_select" on public.stream_sessions;
create policy "stream_sessions_own_select" on public.stream_sessions for select to authenticated
using (auth.uid() = user_id);

drop policy if exists "stream_breaks_own_select" on public.stream_breaks;
create policy "stream_breaks_own_select" on public.stream_breaks for select to authenticated
using (auth.uid() = user_id);

create or replace function public.apply_stream_session_to_creator_progress(p_stream_session_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  s public.stream_sessions%rowtype;
  q_minutes bigint;
  t_minutes bigint;
  b_minutes bigint;
  new_tier text;
begin
  select * into s from public.stream_sessions where id = p_stream_session_id for update;
  if not found then raise exception 'stream session not found'; end if;
  if s.status <> 'ended' then raise exception 'stream session must be ended'; end if;

  q_minutes := floor(s.active_seconds / 60.0);
  t_minutes := floor(s.total_seconds / 60.0);
  b_minutes := floor(s.protected_break_seconds / 60.0);

  insert into public.creator_progress(user_id,total_minutes,qualified_minutes,protected_break_minutes,current_tier,updated_at)
  values (s.user_id,t_minutes,q_minutes,b_minutes,'starter',now())
  on conflict (user_id) do update set
    total_minutes = public.creator_progress.total_minutes + excluded.total_minutes,
    qualified_minutes = public.creator_progress.qualified_minutes + excluded.qualified_minutes,
    protected_break_minutes = public.creator_progress.protected_break_minutes + excluded.protected_break_minutes,
    updated_at = now();

  select case
    when qualified_minutes >= 2400 then 'elite_review'
    when qualified_minutes >= 1800 then 'pro'
    when qualified_minutes >= 900 then 'active'
    else 'starter'
  end into new_tier
  from public.creator_progress where user_id = s.user_id;

  update public.creator_progress set current_tier = new_tier, updated_at = now() where user_id = s.user_id;
end;
$$;
