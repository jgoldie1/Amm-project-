-- TryAMM V1 durable kernel schema aligned with the running Express persistence layer.
create extension if not exists pgcrypto;

create table if not exists public.experience_profiles (
  user_id text primary key,
  age_lane text not null default 'adult' check (age_lane in ('child','teen','adult')),
  accessibility jsonb not null default '{"captions":true}'::jsonb,
  country_code text not null default 'US',
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teleport_sessions (
  id text primary key,
  user_id text not null,
  world_id text not null,
  world_name text,
  mode text not null check (mode in ('2d','3d','ar','vr','mr','holographic')),
  age_lane text not null default 'adult' check (age_lane in ('child','teen','adult')),
  state text not null default 'arrival-bubble-ready',
  checks jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.payment_intents (
  id text primary key,
  user_id text not null,
  provider text not null check (provider in ('paystack','flutterwave','stripe')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null,
  purpose text not null,
  status text not null default 'created',
  idempotency_key text not null unique,
  provider_reference text,
  production boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_reference)
);

create table if not exists public.webhook_events (
  id text primary key,
  provider text not null,
  signature_valid boolean not null,
  provider_event_id text,
  payload jsonb not null default '{}'::jsonb,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  fulfilled boolean not null default false,
  unique(provider, provider_event_id)
);

create table if not exists public.ledger_entries (
  id text primary key,
  reference text not null,
  account text not null,
  direction text not null check (direction in ('debit','credit')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id text primary key,
  user_id text not null,
  provider text not null check (provider in ('paystack','flutterwave')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'NGN',
  status text not null default 'requested',
  idempotency_key text not null unique,
  production boolean not null default false,
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id text primary key,
  actor_user_id text,
  event_type text not null,
  target_type text,
  target_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.entitlements (
  id text primary key,
  user_id text not null,
  payment_intent_id text not null,
  entitlement_type text not null,
  amount_minor bigint not null,
  currency text not null,
  status text not null default 'active',
  activated_at timestamptz not null default now(),
  unique(payment_intent_id, entitlement_type)
);

create table if not exists public.receipts (
  id text primary key,
  user_id text not null,
  payment_intent_id text not null unique,
  provider text not null,
  provider_reference text,
  amount_minor bigint not null,
  currency text not null,
  purpose text not null,
  issued_at timestamptz not null default now()
);

create table if not exists public.settlements (
  id text primary key,
  payment_intent_id text not null unique,
  provider text not null,
  provider_reference text,
  amount_minor bigint not null,
  currency text not null,
  status text not null default 'pending-provider-settlement',
  provider_batch_id text,
  bank_reference text,
  created_at timestamptz not null default now(),
  reconciled_at timestamptz
);

create table if not exists public.refunds (
  id text primary key,
  payment_intent_id text not null,
  user_id text not null,
  amount_minor bigint not null,
  currency text not null,
  reason text,
  status text not null default 'requested',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.disputes (
  id text primary key,
  payment_intent_id text not null,
  provider text not null,
  reason text,
  status text not null default 'manual_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists teleport_sessions_user_idx on public.teleport_sessions(user_id, created_at desc);
create index if not exists payment_intents_user_idx on public.payment_intents(user_id, created_at desc);
create index if not exists webhook_events_provider_idx on public.webhook_events(provider, received_at desc);
create index if not exists ledger_entries_reference_idx on public.ledger_entries(reference, created_at);
create index if not exists payouts_user_idx on public.payouts(user_id, created_at desc);
create index if not exists audit_events_type_idx on public.audit_events(event_type, created_at desc);
create index if not exists entitlements_user_idx on public.entitlements(user_id, activated_at desc);
create index if not exists settlements_status_idx on public.settlements(status, created_at desc);
