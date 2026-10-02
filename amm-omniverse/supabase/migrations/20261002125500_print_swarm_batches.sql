-- TRYAMM Print Swarm: distribute one verified manufacturing order across many certified operators.
-- Coordination only. It does not send raw machine/G-code commands.

create table if not exists public.print_swarm_batches (
  id uuid primary key default gen_random_uuid(),
  parent_job_id uuid not null references public.print_network_jobs(id) on delete restrict,
  created_by uuid not null references auth.users(id) on delete restrict,
  title text not null,
  target_quantity integer not null check (target_quantity between 2 and 100000),
  shard_target_quantity integer not null default 10 check (shard_target_quantity between 1 and 10000),
  assigned_quantity integer not null default 0 check (assigned_quantity >= 0),
  accepted_quantity integer not null default 0 check (accepted_quantity >= 0),
  qa_approved_quantity integer not null default 0 check (qa_approved_quantity >= 0),
  delivered_quantity integer not null default 0 check (delivered_quantity >= 0),
  status text not null default 'planning'
    check (status in ('planning','ready','active','qa-review','consolidating','shipping','complete','paused','cancelled')),
  process text not null,
  material text not null,
  color text,
  golden_profile jsonb not null default '{}'::jsonb,
  qa_policy jsonb not null default '{"requiredViews":["front","back","left","right","top","bottom","packaging"],"sampleRate":1}'::jsonb,
  consolidation_policy jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_swarm_assignments (
  id uuid primary key default gen_random_uuid(),
  swarm_id uuid not null references public.print_swarm_batches(id) on delete cascade,
  operator_id uuid not null references public.print_network_operators(id) on delete restrict,
  child_job_id uuid references public.print_network_jobs(id) on delete set null,
  shard_number integer not null,
  quantity integer not null check (quantity between 1 and 10000),
  state text not null default 'offered'
    check (state in ('offered','accepted','printing','qa-submitted','qa-approved','packaged','shipped','delivered','rejected','cancelled')),
  calibration_profile jsonb not null default '{}'::jsonb,
  lot_code text not null,
  offered_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(swarm_id,operator_id,shard_number),
  unique(child_job_id)
);

create table if not exists public.print_swarm_quality_samples (
  id uuid primary key default gen_random_uuid(),
  swarm_id uuid not null references public.print_swarm_batches(id) on delete cascade,
  assignment_id uuid not null references public.print_swarm_assignments(id) on delete cascade,
  operator_id uuid not null references public.print_network_operators(id) on delete restrict,
  sample_index integer not null default 1,
  measured_dimensions_mm jsonb not null default '{}'::jsonb,
  measured_weight_g numeric,
  material_batch text,
  printer_profile_hash text,
  visual_evidence_ids uuid[] not null default '{}',
  result text not null default 'pending'
    check (result in ('pending','pass','fail','rework')),
  review_note text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists print_swarm_batches_status_idx
  on public.print_swarm_batches(status,process,material,updated_at desc);
create index if not exists print_swarm_assignments_swarm_state_idx
  on public.print_swarm_assignments(swarm_id,state,operator_id);
create index if not exists print_swarm_quality_swarm_result_idx
  on public.print_swarm_quality_samples(swarm_id,result,created_at);

alter table public.print_swarm_batches enable row level security;
alter table public.print_swarm_assignments enable row level security;
alter table public.print_swarm_quality_samples enable row level security;

revoke all on table public.print_swarm_batches from public, anon, authenticated;
revoke all on table public.print_swarm_assignments from public, anon, authenticated;
revoke all on table public.print_swarm_quality_samples from public, anon, authenticated;

grant select,insert,update,delete on table public.print_swarm_batches to service_role;
grant select,insert,update,delete on table public.print_swarm_assignments to service_role;
grant select,insert,update,delete on table public.print_swarm_quality_samples to service_role;

comment on table public.print_swarm_batches is
'One verified manufacturing order split across many certified TRYAMM print operators. Coordination only; no machine commands.';
comment on table public.print_swarm_assignments is
'Per-operator production shard with lot traceability and child work-order linkage.';
comment on table public.print_swarm_quality_samples is
'Cross-operator dimensional/material/visual QA used to keep swarm production consistent.';
