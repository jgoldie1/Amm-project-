create table if not exists public.quantum_sandbox_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid null,
  provider_id text not null,
  backend_id text not null,
  execution_type text not null check (execution_type in ('classical_simulator','quantum_simulator','quantum_hardware')),
  state text not null default 'draft',
  workload jsonb not null default '{}'::jsonb,
  estimated_cost_usd numeric(12,4) not null default 0,
  approved_by uuid null references auth.users(id),
  provider_job_id text null,
  result jsonb null,
  provenance jsonb not null default '{}'::jsonb,
  error_code text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_at timestamptz null,
  completed_at timestamptz null
);

create table if not exists public.quantum_sandbox_metering (
  id bigserial primary key,
  job_id uuid not null references public.quantum_sandbox_jobs(id) on delete cascade,
  metric text not null,
  quantity numeric(18,6) not null,
  unit text not null,
  cost_usd numeric(12,4) not null default 0,
  recorded_at timestamptz not null default now()
);

create table if not exists public.quantum_sandbox_artifacts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.quantum_sandbox_jobs(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  content_type text null,
  storage_path text not null,
  sha256 text null,
  security_status text not null default 'pending',
  publication_status text not null default 'sandbox',
  created_at timestamptz not null default now()
);

alter table public.quantum_sandbox_jobs enable row level security;
alter table public.quantum_sandbox_metering enable row level security;
alter table public.quantum_sandbox_artifacts enable row level security;

create policy "owners read sandbox jobs" on public.quantum_sandbox_jobs for select using (auth.uid() = owner_id);
create policy "owners create sandbox jobs" on public.quantum_sandbox_jobs for insert with check (auth.uid() = owner_id);
create policy "owners update sandbox jobs" on public.quantum_sandbox_jobs for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "owners read sandbox artifacts" on public.quantum_sandbox_artifacts for select using (auth.uid() = owner_id);
create policy "owners create sandbox artifacts" on public.quantum_sandbox_artifacts for insert with check (auth.uid() = owner_id);

create index if not exists quantum_sandbox_jobs_owner_created_idx on public.quantum_sandbox_jobs(owner_id, created_at desc);
create index if not exists quantum_sandbox_metering_job_idx on public.quantum_sandbox_metering(job_id, recorded_at desc);
