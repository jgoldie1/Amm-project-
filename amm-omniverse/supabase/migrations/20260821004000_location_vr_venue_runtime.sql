create extension if not exists pgcrypto;

create table if not exists public.tryamm_vr_venues(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  mode text not null default 'arcade' check (mode in ('arcade','museum','university-lab','creator-studio','franchise')),
  timezone text not null default 'America/Chicago',
  address jsonb not null default '{}'::jsonb,
  status text not null default 'planning' check (status in ('planning','pilot','active','paused','closed')),
  created_at timestamptz not null default now()
);

create table if not exists public.tryamm_vr_rooms(
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.tryamm_vr_venues(id) on delete cascade,
  name text not null,
  room_code text not null,
  max_players integer not null default 6 check (max_players between 1 and 12),
  square_feet integer,
  boundary_config jsonb not null default '{}'::jsonb,
  hardware_profile jsonb not null default '{}'::jsonb,
  status text not null default 'offline' check (status in ('offline','ready','in-session','maintenance','emergency-stop')),
  unique(venue_id,room_code)
);

create table if not exists public.tryamm_vr_sessions(
  id uuid primary key default gen_random_uuid(),
  venue_id uuid not null references public.tryamm_vr_venues(id) on delete cascade,
  room_id uuid references public.tryamm_vr_rooms(id) on delete set null,
  host_user_id uuid references auth.users(id) on delete set null,
  experience_id text not null,
  state text not null default 'reserved' check (state in ('reserved','check-in','briefing','calibration','active','paused','complete','aborted')),
  scheduled_start timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  operator_note text,
  safety_state jsonb not null default '{}'::jsonb,
  world_memory_checkpoint jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.tryamm_vr_session_members(
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tryamm_vr_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  guest_name text,
  role text not null default 'player' check (role in ('host','player','guardian','observer','operator')),
  age_lane text not null default 'adult' check (age_lane in ('adult','teen','child')),
  guardian_approved boolean not null default false,
  accessibility jsonb not null default '{}'::jsonb,
  device_assignment jsonb not null default '{}'::jsonb,
  calibration jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now(),
  unique(session_id,user_id)
);

create table if not exists public.tryamm_vr_safety_events(
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tryamm_vr_sessions(id) on delete cascade,
  member_id uuid references public.tryamm_vr_session_members(id) on delete set null,
  event_type text not null,
  severity text not null default 'info' check (severity in ('info','warning','stop','emergency')),
  details jsonb not null default '{}'::jsonb,
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.tryamm_vr_highlights(
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.tryamm_vr_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  asset_url text,
  asset_type text not null default 'replay',
  rights_status text not null default 'private',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.tryamm_vr_venues enable row level security;
alter table public.tryamm_vr_rooms enable row level security;
alter table public.tryamm_vr_sessions enable row level security;
alter table public.tryamm_vr_session_members enable row level security;
alter table public.tryamm_vr_safety_events enable row level security;
alter table public.tryamm_vr_highlights enable row level security;

revoke all on public.tryamm_vr_venues,public.tryamm_vr_rooms,public.tryamm_vr_sessions,public.tryamm_vr_session_members,public.tryamm_vr_safety_events,public.tryamm_vr_highlights from anon;

grant select on public.tryamm_vr_venues,public.tryamm_vr_rooms to authenticated;
grant select on public.tryamm_vr_sessions,public.tryamm_vr_session_members,public.tryamm_vr_highlights to authenticated;

create policy "vr venues authenticated read" on public.tryamm_vr_venues for select to authenticated using (status in ('pilot','active'));
create policy "vr rooms authenticated read" on public.tryamm_vr_rooms for select to authenticated using (true);
create policy "vr session member read" on public.tryamm_vr_sessions for select to authenticated using (
  host_user_id=(select auth.uid()) or exists(select 1 from public.tryamm_vr_session_members m where m.session_id=id and m.user_id=(select auth.uid()))
);
create policy "vr member self read" on public.tryamm_vr_session_members for select to authenticated using (
  user_id=(select auth.uid()) or exists(select 1 from public.tryamm_vr_sessions s where s.id=session_id and s.host_user_id=(select auth.uid()))
);
create policy "vr highlight owner read" on public.tryamm_vr_highlights for select to authenticated using (
  user_id=(select auth.uid()) or exists(select 1 from public.tryamm_vr_sessions s where s.id=session_id and s.host_user_id=(select auth.uid()))
);

comment on table public.tryamm_vr_safety_events is 'Operator/server safety evidence. Safety overrides score, recording, streaks and session completion.';
comment on table public.tryamm_vr_highlights is 'Post-session replay/movie assets. Rights status must be checked before public sharing.';
