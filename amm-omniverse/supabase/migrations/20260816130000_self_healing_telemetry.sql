-- TRYAMM self-healing telemetry and audit persistence
create extension if not exists pgcrypto;

create table if not exists public.self_healing_events (
  id uuid primary key default gen_random_uuid(),
  event_key text not null unique,
  subsystem text not null,
  signal_kind text not null,
  severity text not null check (severity in ('info','warning','error','critical')),
  message text not null,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  stage text not null default 'observed',
  source text not null default 'runtime',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.self_healing_repairs (
  id uuid primary key default gen_random_uuid(),
  repair_key text not null unique,
  event_id uuid not null references public.self_healing_events(id) on delete restrict,
  subsystem text not null,
  action text not null,
  description text not null,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  reversible boolean not null default false,
  touches_money boolean not null default false,
  touches_identity boolean not null default false,
  touches_permissions boolean not null default false,
  touches_competitive_state boolean not null default false,
  patch_ref text,
  decision jsonb not null default '{}'::jsonb,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'candidate',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.self_healing_canaries (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.self_healing_repairs(id) on delete restrict,
  deployment_ref text,
  environment text not null default 'canary',
  healthy boolean,
  metrics jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  outcome text not null default 'running' check (outcome in ('running','promoted','rolled-back','blocked')),
  created_at timestamptz not null default now()
);

create table if not exists public.self_healing_actions (
  id uuid primary key default gen_random_uuid(),
  repair_id uuid not null references public.self_healing_repairs(id) on delete restrict,
  action_type text not null,
  actor_type text not null default 'system' check (actor_type in ('system','stubbs-ai','human','provider')),
  actor_id text,
  authorized boolean not null default false,
  result text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists self_healing_events_subsystem_time_idx on public.self_healing_events(subsystem, occurred_at desc);
create index if not exists self_healing_events_severity_idx on public.self_healing_events(severity, occurred_at desc);
create index if not exists self_healing_repairs_event_idx on public.self_healing_repairs(event_id, created_at desc);
create index if not exists self_healing_repairs_status_idx on public.self_healing_repairs(status, created_at desc);
create index if not exists self_healing_canaries_repair_idx on public.self_healing_canaries(repair_id, created_at desc);
create index if not exists self_healing_actions_repair_idx on public.self_healing_actions(repair_id, created_at desc);

alter table public.self_healing_events enable row level security;
alter table public.self_healing_repairs enable row level security;
alter table public.self_healing_canaries enable row level security;
alter table public.self_healing_actions enable row level security;

-- Server-only telemetry. Browser clients never write or enumerate healing internals directly.
revoke all on public.self_healing_events from anon, authenticated;
revoke all on public.self_healing_repairs from anon, authenticated;
revoke all on public.self_healing_canaries from anon, authenticated;
revoke all on public.self_healing_actions from anon, authenticated;

comment on table public.self_healing_events is 'Server-only health/anomaly signals for TRYAMM self-healing runtime.';
comment on table public.self_healing_repairs is 'Audited repair candidates, decisions and verification evidence.';
comment on table public.self_healing_canaries is 'Canary health and promote/rollback outcomes.';
comment on table public.self_healing_actions is 'Immutable-style action trail for healing execution and approvals.';
