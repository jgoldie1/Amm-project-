-- TRYAMM production authority core
-- Adds server-authoritative persistence for accessibility preferences,
-- JARVIS grants/approvals, provider evidence, audit events and feature gates.

create extension if not exists pgcrypto;

create table if not exists public.accessibility_passports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  communication_preference text null,
  opportunity_needs jsonb not null default '[]'::jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

create table if not exists public.jarvis_agent_grants (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  agent_id text not null,
  permission_level text not null check (permission_level in ('read','suggest','prepare','request_approval','execute')),
  allowed_actions jsonb not null default '[]'::jsonb,
  expires_at timestamptz null,
  revoked_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_user_id, agent_id)
);

create table if not exists public.jarvis_approval_requests (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  requested_by_actor_type text not null check (requested_by_actor_type in ('user','agent','service','admin')),
  requested_by_actor_id text not null,
  action text not null,
  target_type text null,
  target_id text null,
  summary text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','denied','expired','cancelled','executed','failed')),
  approved_at timestamptz null,
  denied_at timestamptz null,
  expires_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.provider_capability_evidence (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  provider_kind text not null,
  capability_state text not null check (capability_state in ('unconfigured','sandbox','verified','production')),
  jurisdiction jsonb not null default '[]'::jsonb,
  evidence_refs jsonb not null default '[]'::jsonb,
  expires_at timestamptz null,
  notes text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.production_feature_gates (
  feature_id text primary key,
  enabled boolean not null default false,
  environment text not null default 'production' check (environment in ('development','preview','production')),
  approved_by text null,
  approved_at timestamptz null,
  evidence_refs jsonb not null default '[]'::jsonb,
  rollback_ref text null,
  updated_at timestamptz not null default now()
);

create table if not exists public.platform_audit_events (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_type text not null check (actor_type in ('user','agent','service','admin','provider')),
  actor_id text not null,
  owner_user_id uuid null references auth.users(id) on delete set null,
  action text not null,
  target_type text null,
  target_id text null,
  correlation_id text not null,
  authorization_basis text null,
  result text not null check (result in ('allowed','denied','pending_approval','success','failure')),
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists jarvis_approval_owner_status_idx on public.jarvis_approval_requests(owner_user_id,status,created_at desc);
create index if not exists platform_audit_owner_time_idx on public.platform_audit_events(owner_user_id,occurred_at desc);
create index if not exists provider_capability_kind_state_idx on public.provider_capability_evidence(provider_kind,capability_state,updated_at desc);

alter table public.accessibility_passports enable row level security;
alter table public.jarvis_agent_grants enable row level security;
alter table public.jarvis_approval_requests enable row level security;
alter table public.provider_capability_evidence enable row level security;
alter table public.production_feature_gates enable row level security;
alter table public.platform_audit_events enable row level security;

-- Accessibility preferences belong only to the signed-in user.
drop policy if exists accessibility_passport_owner_select on public.accessibility_passports;
create policy accessibility_passport_owner_select on public.accessibility_passports
for select to authenticated using (auth.uid() = user_id);
drop policy if exists accessibility_passport_owner_insert on public.accessibility_passports;
create policy accessibility_passport_owner_insert on public.accessibility_passports
for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists accessibility_passport_owner_update on public.accessibility_passports;
create policy accessibility_passport_owner_update on public.accessibility_passports
for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists accessibility_passport_owner_delete on public.accessibility_passports;
create policy accessibility_passport_owner_delete on public.accessibility_passports
for delete to authenticated using (auth.uid() = user_id);

-- Users can inspect their own JARVIS grants and approval requests.
-- Creation/update of privileged grants should normally be performed through a server action.
drop policy if exists jarvis_grants_owner_select on public.jarvis_agent_grants;
create policy jarvis_grants_owner_select on public.jarvis_agent_grants
for select to authenticated using (auth.uid() = owner_user_id);

drop policy if exists jarvis_approvals_owner_select on public.jarvis_approval_requests;
create policy jarvis_approvals_owner_select on public.jarvis_approval_requests
for select to authenticated using (auth.uid() = owner_user_id);

-- Provider evidence, production gates and the canonical audit trail are server-authoritative.
revoke all on public.provider_capability_evidence from anon, authenticated;
revoke all on public.production_feature_gates from anon, authenticated;
revoke insert, update, delete on public.platform_audit_events from anon, authenticated;

-- Users may read only audit records tied to their own account.
drop policy if exists platform_audit_owner_select on public.platform_audit_events;
create policy platform_audit_owner_select on public.platform_audit_events
for select to authenticated using (auth.uid() = owner_user_id);

-- Browser clients do not directly mutate privileged agent grants/approvals.
revoke insert, update, delete on public.jarvis_agent_grants from anon, authenticated;
revoke insert, update, delete on public.jarvis_approval_requests from anon, authenticated;

comment on table public.accessibility_passports is 'User-controlled functional accessibility preferences; not a medical-record table.';
comment on table public.jarvis_agent_grants is 'Server-authoritative scoped grants for Personal/Student/Business/Vehicle JARVIS.';
comment on table public.jarvis_approval_requests is 'Human approval queue for consequential JARVIS actions.';
comment on table public.provider_capability_evidence is 'Evidence registry for providers and production capability gates.';
comment on table public.production_feature_gates is 'Server-only kill switches and production approval evidence.';
comment on table public.platform_audit_events is 'Append-only-style security and consequential-action audit stream.';
