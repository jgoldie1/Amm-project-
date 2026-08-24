create table if not exists public.regulated_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique,
  asset_type text not null,
  title text not null,
  jurisdiction text,
  issuer_entity text,
  classification_status text not null default 'unclassified' check (classification_status in ('unclassified','non_security','security','regulated_other')),
  offering_status text not null default 'draft' check (offering_status in ('draft','review','approved','open','paused','closed','cancelled')),
  valuation_minor bigint,
  currency text not null default 'USD',
  total_units bigint not null check (total_units > 0),
  transfer_restricted boolean not null default true,
  custody_provider text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fractional_positions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.regulated_assets(id) on delete restrict,
  holder_user_id uuid not null references auth.users(id) on delete restrict,
  units bigint not null default 0 check (units >= 0),
  pending_units bigint not null default 0 check (pending_units >= 0),
  restricted_units bigint not null default 0 check (restricted_units >= 0),
  cost_basis_minor bigint not null default 0,
  status text not null default 'active' check (status in ('active','frozen','closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(asset_id, holder_user_id)
);

create table if not exists public.ownership_transactions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.regulated_assets(id) on delete restrict,
  holder_user_id uuid not null references auth.users(id) on delete restrict,
  event_type text not null check (event_type in ('subscription','purchase','sale','transfer_in','transfer_out','distribution_reinvest','adjustment','freeze','unfreeze')),
  units_delta bigint not null,
  gross_minor bigint,
  currency text not null default 'USD',
  canonical_event_id text not null,
  wallet_transaction_id text,
  ledger_reference text,
  provider text,
  provider_reference text,
  status text not null default 'pending' check (status in ('pending','verified','settled','reversed','rejected')),
  compliance_state text not null default 'pending' check (compliance_state in ('pending','approved','blocked','review')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  verified_at timestamptz,
  settled_at timestamptz,
  unique(canonical_event_id)
);

create table if not exists public.asset_distributions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.regulated_assets(id) on delete restrict,
  distribution_key text not null unique,
  record_at timestamptz not null,
  payable_at timestamptz,
  gross_minor bigint not null check (gross_minor >= 0),
  currency text not null default 'USD',
  withholding_minor bigint not null default 0 check (withholding_minor >= 0),
  reserve_minor bigint not null default 0 check (reserve_minor >= 0),
  net_distributable_minor bigint not null check (net_distributable_minor >= 0),
  status text not null default 'draft' check (status in ('draft','approved','payable','settled','cancelled')),
  canonical_event_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_partner_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete restrict,
  provider text not null,
  account_type text not null check (account_type in ('deposit_partner','payment','payout','brokerage','custody','card','crypto_partner')),
  currency text,
  external_ref_hash text not null,
  status text not null default 'pending' check (status in ('pending','active','restricted','closed')),
  capabilities jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, external_ref_hash)
);

create index if not exists fractional_positions_holder_idx on public.fractional_positions(holder_user_id);
create index if not exists ownership_transactions_holder_created_idx on public.ownership_transactions(holder_user_id, created_at desc);
create index if not exists ownership_transactions_asset_created_idx on public.ownership_transactions(asset_id, created_at desc);
create index if not exists asset_distributions_asset_record_idx on public.asset_distributions(asset_id, record_at desc);
create index if not exists financial_partner_accounts_user_idx on public.financial_partner_accounts(user_id);

alter table public.regulated_assets enable row level security;
alter table public.fractional_positions enable row level security;
alter table public.ownership_transactions enable row level security;
alter table public.asset_distributions enable row level security;
alter table public.financial_partner_accounts enable row level security;

revoke all on public.regulated_assets from anon, authenticated;
revoke all on public.fractional_positions from anon, authenticated;
revoke all on public.ownership_transactions from anon, authenticated;
revoke all on public.asset_distributions from anon, authenticated;
revoke all on public.financial_partner_accounts from anon, authenticated;

grant all on public.regulated_assets to service_role;
grant all on public.fractional_positions to service_role;
grant all on public.ownership_transactions to service_role;
grant all on public.asset_distributions to service_role;
grant all on public.financial_partner_accounts to service_role;
