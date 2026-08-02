-- TryAMM production control plane schema
create table if not exists public.wallets (
  id text primary key,
  user_id text not null,
  currency text not null,
  available_minor bigint not null default 0 check (available_minor >= 0),
  pending_minor bigint not null default 0 check (pending_minor >= 0),
  reserve_minor bigint not null default 0 check (reserve_minor >= 0),
  lifetime_earned_minor bigint not null default 0 check (lifetime_earned_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, currency)
);
create table if not exists public.wallet_transactions (
  id text primary key,
  wallet_id text not null references public.wallets(id) on delete restrict,
  user_id text not null,
  currency text not null,
  amount_minor bigint not null,
  kind text not null,
  reference text not null unique,
  status text not null default 'posted',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.refresh_tokens (
  id text primary key,
  user_id text not null,
  token_hash text not null unique,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.payout_jobs (
  id text primary key,
  payout_id text not null unique,
  user_id text not null,
  provider text not null,
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null,
  status text not null,
  attempts integer not null default 0,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.monitoring_events (
  id text primary key,
  event_type text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create table if not exists public.rate_limit_events (
  id text primary key,
  rate_key text not null,
  route text,
  created_at timestamptz not null default now()
);
create table if not exists public.africa_provider_registry (
  id text primary key,
  markets text[] not null default '{}',
  state text not null default 'adapter-planned',
  production_enabled boolean not null default false,
  approval_evidence jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.refresh_tokens enable row level security;
alter table public.payout_jobs enable row level security;
alter table public.monitoring_events enable row level security;
alter table public.rate_limit_events enable row level security;
alter table public.africa_provider_registry enable row level security;

create policy "wallet owner select" on public.wallets for select to authenticated using (user_id = (select auth.uid())::text);
create policy "wallet transaction owner select" on public.wallet_transactions for select to authenticated using (user_id = (select auth.uid())::text);
-- Refresh tokens, payout jobs, monitoring, rate-limit evidence and provider approvals are server-only.

create index if not exists wallets_user_idx on public.wallets(user_id, currency);
create index if not exists wallet_transactions_user_idx on public.wallet_transactions(user_id, created_at desc);
create index if not exists refresh_tokens_user_idx on public.refresh_tokens(user_id, expires_at desc);
create index if not exists payout_jobs_status_idx on public.payout_jobs(status, created_at);
create index if not exists monitoring_events_type_idx on public.monitoring_events(event_type, created_at desc);
