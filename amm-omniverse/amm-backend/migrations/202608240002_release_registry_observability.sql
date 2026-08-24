-- Applied to TRYAMM Supabase as migration release_registry_observability_wave.
-- Durable release truth and health sampling tied to exact commit SHAs.

create table if not exists public.release_registry (
  id uuid primary key default gen_random_uuid(),
  commit_sha text not null,
  environment text not null check (environment in ('preview','production')),
  deployment_url text,
  production_green boolean not null default false,
  device_green boolean not null default false,
  full_green boolean generated always as (production_green and device_green) stored,
  gate_results jsonb not null default '{}'::jsonb,
  device_proof jsonb not null default '{}'::jsonb,
  rollback_of_commit_sha text,
  released_at timestamptz not null default now(),
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(commit_sha, environment)
);
create index if not exists release_registry_env_time_idx on public.release_registry(environment, released_at desc);
create index if not exists release_registry_full_green_idx on public.release_registry(full_green, released_at desc);

create table if not exists public.release_health_samples (
  id uuid primary key default gen_random_uuid(),
  commit_sha text not null,
  service text not null,
  route text,
  device_class text,
  ok boolean not null,
  status_code integer,
  latency_ms integer,
  error_code text,
  metadata jsonb not null default '{}'::jsonb,
  sampled_at timestamptz not null default now()
);
create index if not exists release_health_samples_commit_idx on public.release_health_samples(commit_sha, sampled_at desc);
create index if not exists release_health_samples_service_idx on public.release_health_samples(service, sampled_at desc);
create index if not exists release_health_samples_failures_idx on public.release_health_samples(ok, sampled_at desc);

alter table public.release_registry enable row level security;
alter table public.release_health_samples enable row level security;

comment on table public.release_registry is 'Server-authoritative TRYAMM release truth: production proof, device proof, rollback linkage, and FULL GREEN state by exact commit SHA.';
comment on table public.release_health_samples is 'Observability samples tied to exact release SHA across public routes, backend services, and device classes.';
