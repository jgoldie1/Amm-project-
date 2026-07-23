-- Holo5DX hardware/calibration persistence contract
create table if not exists public.holo5dx_hardware_profiles (
  hardware_id text primary key,
  owner_id uuid null references auth.users(id) on delete set null,
  hardware_type text not null,
  status text not null default 'prototype-unvalidated',
  display jsonb not null default '{}'::jsonb,
  optics jsonb not null default '{}'::jsonb,
  certification jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo5dx_calibration_profiles (
  id uuid primary key default gen_random_uuid(),
  hardware_id text not null references public.holo5dx_hardware_profiles(hardware_id) on delete cascade,
  version text not null,
  geometry jsonb not null,
  camera_rig jsonb not null,
  packing jsonb not null,
  warp_model jsonb not null,
  quality_metrics jsonb not null default '{}'::jsonb,
  measured boolean not null default false,
  certified boolean not null default false,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(hardware_id, version)
);

create table if not exists public.holo5dx_render_jobs (
  id uuid primary key default gen_random_uuid(),
  experience_id text not null,
  game_id text null,
  hardware_id text null references public.holo5dx_hardware_profiles(hardware_id) on delete set null,
  calibration_profile_id uuid null references public.holo5dx_calibration_profiles(id) on delete set null,
  mode text not null,
  state text not null default 'planned',
  render_plan jsonb not null,
  diagnostics jsonb not null default '{}'::jsonb,
  created_by uuid null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.holo5dx_hardware_profiles enable row level security;
alter table public.holo5dx_calibration_profiles enable row level security;
alter table public.holo5dx_render_jobs enable row level security;

create policy "owners can read their hardware profiles" on public.holo5dx_hardware_profiles
for select using (owner_id is null or owner_id = auth.uid());

create policy "owners can read calibration profiles" on public.holo5dx_calibration_profiles
for select using (
  exists (
    select 1 from public.holo5dx_hardware_profiles h
    where h.hardware_id = holo5dx_calibration_profiles.hardware_id
      and (h.owner_id is null or h.owner_id = auth.uid())
  )
);

create policy "owners can read render jobs" on public.holo5dx_render_jobs
for select using (created_by is null or created_by = auth.uid());

-- Writes should be performed by trusted backend/service-role code after validation.
