create table if not exists public.holo_runtime_sessions(
 id text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 status text not null default 'active' check(status in ('active','ended')),
 world_uri text not null,
 scene_id text,
 device_profile jsonb not null default '{}'::jsonb,
 runtime_plan jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.holo_spatial_checkpoints(
 id text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 session_id text references public.holo_runtime_sessions(id) on delete cascade,
 world_uri text not null,
 scene_id text,
 position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
 orientation jsonb not null default '{"yaw":0,"pitch":0,"roll":0}'::jsonb,
 inventory_refs jsonb not null default '[]'::jsonb,
 conversation_refs jsonb not null default '[]'::jsonb,
 saved_at timestamptz not null default now()
);

create table if not exists public.holo_presence_state(
 session_id text not null references public.holo_runtime_sessions(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 presence_type text not null check(presence_type in ('live-person','avatar','recorded','ai')),
 position jsonb not null default '{"x":0,"y":0,"z":0}'::jsonb,
 orientation jsonb not null default '{"yaw":0,"pitch":0,"roll":0}'::jsonb,
 accessibility jsonb not null default '{}'::jsonb,
 updated_at timestamptz not null default now(),
 primary key(session_id,user_id)
);

alter table public.holo_runtime_sessions enable row level security;
alter table public.holo_spatial_checkpoints enable row level security;
alter table public.holo_presence_state enable row level security;

create policy "holo sessions owner read" on public.holo_runtime_sessions for select using(auth.uid()=user_id);
create policy "holo sessions owner insert" on public.holo_runtime_sessions for insert with check(auth.uid()=user_id);
create policy "holo sessions owner update" on public.holo_runtime_sessions for update using(auth.uid()=user_id);
create policy "holo checkpoints owner read" on public.holo_spatial_checkpoints for select using(auth.uid()=user_id);
create policy "holo checkpoints owner insert" on public.holo_spatial_checkpoints for insert with check(auth.uid()=user_id);
create policy "holo presence owner read" on public.holo_presence_state for select using(auth.uid()=user_id);
create policy "holo presence owner write" on public.holo_presence_state for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

create index if not exists holo_runtime_sessions_user_idx on public.holo_runtime_sessions(user_id,updated_at desc);
create index if not exists holo_spatial_checkpoints_user_idx on public.holo_spatial_checkpoints(user_id,saved_at desc);
