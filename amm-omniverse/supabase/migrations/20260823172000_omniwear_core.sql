create table if not exists public.omniwear_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_name text not null,
  device_type text not null check (device_type in ('watch','band','ring','glasses','clothing','glove','vest','suit','mobility','sensor','other')),
  capabilities jsonb not null default '{}'::jsonb,
  connection_state text not null default 'disconnected' check (connection_state in ('disconnected','pairing','connected','degraded')),
  battery_percent integer check (battery_percent is null or battery_percent between 0 and 100),
  firmware_version text,
  medical_mode boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.omniwear_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  consent jsonb not null default '{"telemetry":false,"accessibility":true,"analytics":false}'::jsonb,
  haptics jsonb not null default '{"enabled":true,"intensity":0.5}'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  privacy_mode text not null default 'local-first' check (privacy_mode in ('local-first','cloud-sync','minimal')),
  updated_at timestamptz not null default now()
);
create table if not exists public.omniwear_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.omniwear_devices(id) on delete set null,
  mode text not null check (mode in ('accessibility','xr','fitness','gaming','navigation','training','simulation')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  session_state jsonb not null default '{}'::jsonb,
  safety_state text not null default 'normal' check (safety_state in ('normal','paused','degraded','blocked'))
);
create table if not exists public.omniwear_telemetry (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id uuid references public.omniwear_devices(id) on delete cascade,
  session_id uuid references public.omniwear_sessions(id) on delete cascade,
  signal_type text not null,
  value jsonb not null,
  captured_at timestamptz not null default now()
);
alter table public.omniwear_devices enable row level security;
alter table public.omniwear_profiles enable row level security;
alter table public.omniwear_sessions enable row level security;
alter table public.omniwear_telemetry enable row level security;
create policy "omniwear_devices_owner_all" on public.omniwear_devices for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "omniwear_profiles_owner_all" on public.omniwear_profiles for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "omniwear_sessions_owner_all" on public.omniwear_sessions for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy "omniwear_telemetry_owner_all" on public.omniwear_telemetry for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
revoke all on public.omniwear_devices, public.omniwear_profiles, public.omniwear_sessions, public.omniwear_telemetry from anon;
grant select,insert,update,delete on public.omniwear_devices, public.omniwear_profiles, public.omniwear_sessions to authenticated;
grant select,insert,delete on public.omniwear_telemetry to authenticated;
insert into public.system_convergence_status(service,status,environment,details,checked_at,updated_at)
values ('omniwear','degraded','production',jsonb_build_object('database','ready','pairing','app-layer-required','telemetry','consent-gated','medical_claims','blocked-until-validated','device_adapters','unconnected','xr_integration','planned'),now(),now())
on conflict (service) do update set status=excluded.status,environment=excluded.environment,details=excluded.details,checked_at=excluded.checked_at,updated_at=excluded.updated_at;
