-- TryAMM V1 durable kernel schema
create extension if not exists pgcrypto;

create table if not exists public.experience_profiles (
  user_id uuid primary key,
  age_lane text not null default 'adult' check (age_lane in ('child','teen','adult')),
  accessibility jsonb not null default '{"captions":true}'::jsonb,
  country_code text not null default 'US',
  locale text not null default 'en-US',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teleport_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  world_id text not null,
  mode text not null check (mode in ('2d','3d','ar','vr','mr','holographic')),
  state text not null default 'arrival-bubble-ready',
  checks jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.payment_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('paystack','flutterwave','stripe')),
  provider_reference text,
  country_code text not null,
  currency text not null,
  amount_minor bigint not null check (amount_minor > 0),
  purpose text not null,
  status text not null default 'created',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_reference)
);

create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  signature_valid boolean not null,
  payload jsonb not null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(provider, provider_event_id)
);

create table if not exists public.ledger_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_type text not null,
  owner_id text not null,
  account_type text not null,
  currency text not null,
  created_at timestamptz not null default now(),
  unique(owner_type, owner_id, account_type, currency)
);

create table if not exists public.ledger_transactions (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.ledger_transactions(id) on delete restrict,
  account_id uuid not null references public.ledger_accounts(id) on delete restrict,
  direction text not null check (direction in ('debit','credit')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.payouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  provider text not null check (provider in ('paystack','flutterwave')),
  provider_reference text,
  currency text not null default 'NGN',
  amount_minor bigint not null check (amount_minor > 0),
  status text not null default 'requested',
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id text,
  event_type text not null,
  resource_type text not null,
  resource_id text,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists teleport_sessions_user_idx on public.teleport_sessions(user_id, created_at desc);
create index if not exists payment_intents_user_idx on public.payment_intents(user_id, created_at desc);
create index if not exists payouts_user_idx on public.payouts(user_id, created_at desc);
create index if not exists audit_events_type_idx on public.audit_events(event_type, created_at desc);
