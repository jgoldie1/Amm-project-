create table if not exists public.live_stream_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  room_name text not null,
  status text not null default 'live' check (status in ('live','paused','ended')),
  pause_reason text,
  started_at timestamptz not null default now(),
  paused_at timestamptz,
  resumed_at timestamptz,
  ended_at timestamptz,
  total_pause_seconds integer not null default 0,
  qualified_live_seconds integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id,room_name)
);

create table if not exists public.live_stream_breaks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.live_stream_sessions(id) on delete cascade,
  user_id uuid not null,
  reason text not null,
  source text not null default 'manual',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer,
  protected boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists live_stream_breaks_session_idx on public.live_stream_breaks(session_id,started_at desc);

alter table public.live_stream_sessions enable row level security;
alter table public.live_stream_breaks enable row level security;
revoke all on public.live_stream_sessions from anon, authenticated;
revoke all on public.live_stream_breaks from anon, authenticated;

comment on table public.live_stream_sessions is 'Server-managed TRYAMM LIVE session and protected-pause state.';
comment on table public.live_stream_breaks is 'Server-managed protected LIVE breaks such as BRB, phone call, bathroom, accessibility, technical or emergency pauses.';
