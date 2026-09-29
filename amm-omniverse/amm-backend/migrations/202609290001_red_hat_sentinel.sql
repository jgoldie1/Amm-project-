-- TRYAMM Red Hat Sentinel defensive deception telemetry.
-- Privacy-minimized security indicators only.
-- NEVER store raw IP addresses, Authorization/Cookie headers, passwords, tokens,
-- or raw exploit payload contents in this table.

create table if not exists public.security_deception_events (
  id uuid primary key default gen_random_uuid(),
  event_kind text not null check (event_kind in ('canary-contact','suspicious-probe')),
  occurred_at timestamptz not null default now(),
  risk_score integer not null check (risk_score between 0 and 100),
  signal_codes text[] not null default '{}',
  method text not null,
  path_class text not null,
  source_hash text not null,
  user_agent_hash text not null,
  user_agent_class text not null default 'unknown',
  request_fingerprint text not null,
  request_id text,
  payload_sha256 text,
  payload_bytes integer not null default 0 check (payload_bytes >= 0),
  telemetry_hash_persistent boolean not null default false,
  expires_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.security_deception_events enable row level security;

-- Intentionally no client-facing RLS policies.
-- The backend service role is the only writer/reader; authenticated clients do not get direct table access.

create index if not exists security_deception_events_occurred_idx
  on public.security_deception_events (occurred_at desc);

create index if not exists security_deception_events_expires_idx
  on public.security_deception_events (expires_at);

create index if not exists security_deception_events_fingerprint_idx
  on public.security_deception_events (request_fingerprint, occurred_at desc);

create index if not exists security_deception_events_source_hash_idx
  on public.security_deception_events (source_hash, occurred_at desc);

comment on table public.security_deception_events is
  'Privacy-minimized Red Hat Sentinel defensive telemetry. Raw IPs, credentials, cookies, Authorization headers, and raw payloads are prohibited.';
