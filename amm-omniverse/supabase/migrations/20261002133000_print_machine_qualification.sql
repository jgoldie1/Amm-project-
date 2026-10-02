-- TRYAMM internal printer qualification registry.
-- "Qualified" here means approved for TRYAMM network work after internal sample/calibration review.
-- It is not a manufacturer, UL, OSHA, building-code, medical-device, aerospace, or other external certification.

create table if not exists public.print_network_printers (
  id uuid primary key default gen_random_uuid(),
  operator_id uuid not null references public.print_network_operators(id) on delete cascade,
  nickname text not null,
  manufacturer text,
  model text,
  serial_fingerprint text,
  process text not null
    check (process in ('fdm','sla','sls','other')),
  supported_materials jsonb not null default '[]'::jsonb,
  build_volume_mm jsonb not null default '{}'::jsonb,
  min_layer_height_mm numeric(8,4),
  max_layer_height_mm numeric(8,4),
  qualified_tolerance_mm numeric(8,3),
  qualification_status text not null default 'unverified'
    check (qualification_status in ('unverified','sample-required','review','qualified','suspended','retired','rejected')),
  qualification_level text not null default 'standard'
    check (qualification_level in ('standard','precision','production','large-format')),
  sample_job_reference text,
  calibration_evidence jsonb not null default '{}'::jsonb,
  maintenance_state text not null default 'unknown'
    check (maintenance_state in ('unknown','current','due-soon','overdue','service-required')),
  last_calibrated_at timestamptz,
  next_calibration_due_at timestamptz,
  last_maintenance_at timestamptz,
  next_maintenance_due_at timestamptz,
  quality_score numeric(5,2),
  successful_sample_count integer not null default 0,
  failed_sample_count integer not null default 0,
  availability text not null default 'offline'
    check (availability in ('offline','available','printing','maintenance','paused')),
  external_certifications jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.print_network_jobs
  add column if not exists assigned_printer_id uuid references public.print_network_printers(id) on delete set null;

alter table public.print_swarm_assignments
  add column if not exists printer_id uuid references public.print_network_printers(id) on delete set null;

create index if not exists print_network_printers_operator_idx
  on public.print_network_printers(operator_id,qualification_status,availability,updated_at desc);
create index if not exists print_network_printers_capability_idx
  on public.print_network_printers(process,qualification_status,availability,quality_score desc);

alter table public.print_network_printers enable row level security;
revoke all on table public.print_network_printers from public, anon, authenticated;
grant select,insert,update,delete on table public.print_network_printers to service_role;

comment on table public.print_network_printers is
'Internal TRYAMM machine-qualification records used to decide whether a printer may accept network jobs. Qualification is an internal production gate, not an external regulatory or manufacturer certification.';
