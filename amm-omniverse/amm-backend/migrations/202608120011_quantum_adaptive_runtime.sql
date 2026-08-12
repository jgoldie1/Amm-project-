create extension if not exists pgcrypto;

create table if not exists quantum_world_manifests (
  id uuid primary key default gen_random_uuid(),
  world_key text not null unique,
  name text not null,
  engine_target text not null default 'webgpu-three' check (engine_target in ('unreal','unity','godot','webgpu-three','native-mobile','server-sim')),
  manifest jsonb not null default '{}'::jsonb,
  streaming_cells jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists quantum_runtime_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  world_key text not null,
  active_tier text not null default 'T3_CITY',
  entity_counts jsonb not null default '{}'::jsonb,
  player_signal jsonb not null default '{}'::jsonb,
  state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists quantum_transfer_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  transfer_key text not null,
  source_world text,
  destination_world text,
  source_tier text,
  destination_tier text,
  phases jsonb not null default '["snapshot","preload","handoff","activate","cleanup"]'::jsonb,
  status text not null default 'requested' check (status in ('requested','preloading','handoff','active','completed','failed')),
  telemetry jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists quantum_prediction_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  world_key text,
  prediction_key text not null,
  confidence numeric not null check (confidence between 0 and 1),
  reason text,
  preload jsonb not null default '[]'::jsonb,
  accepted boolean,
  created_at timestamptz not null default now()
);

alter table quantum_world_manifests enable row level security;
alter table quantum_runtime_snapshots enable row level security;
alter table quantum_transfer_events enable row level security;
alter table quantum_prediction_events enable row level security;

create policy if not exists quantum_world_manifests_read on quantum_world_manifests for select using (active=true);
create policy if not exists quantum_runtime_snapshots_own on quantum_runtime_snapshots for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy if not exists quantum_transfer_events_own on quantum_transfer_events for select using (auth.uid()=user_id);
create policy if not exists quantum_prediction_events_own on quantum_prediction_events for select using (auth.uid()=user_id);

insert into quantum_world_manifests(world_key,name,engine_target,manifest) values
('global-city','Global City Living World','webgpu-three','{"paths":["street","life-city","kingdom","business","creator","service"],"streaming":"adaptive"}'::jsonb),
('wilderness-world','Worldwide Wilderness & Biosphere','webgpu-three','{"systems":["ecology","weather","wildlife","conservation"],"streaming":"population-to-individual"}'::jsonb),
('moon','Moon Living World','unreal','{"gravity":0.165,"systems":["missions","habitats","logistics"],"streaming":"mission-cells"}'::jsonb),
('mars','Mars Living World','unreal','{"gravity":0.38,"systems":["missions","settlements","logistics"],"streaming":"settlement-cells"}'::jsonb),
('saturn-system','Saturn & Moons','unreal','{"systems":["orbit","titan","enceladus","missions","logistics"],"streaming":"system-cells"}'::jsonb),
('chrono','Chrono / Time Machine','godot','{"systems":["historical-reconstruction","alternate-timeline","future-simulation"],"streaming":"scenario-cells"}'::jsonb),
('generations','Generations World','unity','{"systems":["education","family","skills","legacy"],"streaming":"age-lane"}'::jsonb)
on conflict(world_key) do update set name=excluded.name, engine_target=excluded.engine_target, manifest=excluded.manifest, updated_at=now();
