begin;

create table if not exists public.user_roles (
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','creator','merchant','moderator','support','finance','admin','super_admin')),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create table if not exists public.security_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  resource_type text,
  resource_id text,
  request_id text,
  ip inet,
  user_agent text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.gameverse_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  xp bigint not null default 0 check (xp >= 0),
  beans bigint not null default 0 check (beans >= 0),
  level integer not null default 1 check (level >= 1),
  metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.gameverse_results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  match_id text,
  score bigint not null default 0,
  xp_awarded bigint not null default 0,
  beans_awarded bigint not null default 0,
  idempotency_key text not null unique,
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.living_world_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  state text not null,
  display_mode text,
  cast_target jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.realtime_presence_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  socket_id text not null,
  room_type text,
  room_id text,
  connected_at timestamptz not null default now(),
  disconnected_at timestamptz
);

alter table public.user_roles enable row level security;
alter table public.security_audit_events enable row level security;
alter table public.gameverse_profiles enable row level security;
alter table public.gameverse_results enable row level security;
alter table public.living_world_sessions enable row level security;
alter table public.realtime_presence_sessions enable row level security;

create policy "users read own roles" on public.user_roles for select using (auth.uid() = user_id);
create policy "users read own game profile" on public.gameverse_profiles for select using (auth.uid() = user_id);
create policy "users update own game profile" on public.gameverse_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own results" on public.gameverse_results for select using (auth.uid() = user_id);
create policy "users read own living sessions" on public.living_world_sessions for select using (auth.uid() = user_id);
create policy "users manage own living sessions" on public.living_world_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "users read own presence" on public.realtime_presence_sessions for select using (auth.uid() = user_id);

create index if not exists idx_security_audit_actor_created on public.security_audit_events(actor_user_id, created_at desc);
create index if not exists idx_gameverse_results_user_created on public.gameverse_results(user_id, created_at desc);
create index if not exists idx_living_world_sessions_user_updated on public.living_world_sessions(user_id, updated_at desc);
create index if not exists idx_presence_room on public.realtime_presence_sessions(room_type, room_id, disconnected_at);

commit;
