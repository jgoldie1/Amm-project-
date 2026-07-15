create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  currency text not null default 'USD',
  cash_balance_minor bigint not null default 0 check (cash_balance_minor >= 0),
  token_balance bigint not null default 0 check (token_balance >= 0),
  status text not null default 'active' check (status in ('active','frozen','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,currency)
);

create table if not exists public.wallet_ledger (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('credit','debit','hold','release','refund','payout')),
  asset text not null default 'cash',
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'USD',
  provider text,
  provider_reference text,
  order_id uuid references public.orders(id),
  status text not null default 'pending' check (status in ('pending','posted','failed','reversed')),
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.identity_profiles (
  owner_id uuid primary key references auth.users(id) on delete cascade,
  legal_name_status text not null default 'unverified',
  age_status text not null default 'unknown',
  country text,
  kyc_provider text,
  kyc_status text not null default 'not-started',
  driver_credential_status text not null default 'not-linked',
  passport_credential_status text not null default 'not-linked',
  government_id_stored boolean not null default false,
  raw_biometrics_stored boolean not null default false,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.digital_credentials (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  issuer text,
  issuer_did text,
  credential_hash text,
  status text not null default 'pending-verification',
  expires_at timestamptz,
  display_in_wallet boolean not null default false,
  official_government_credential boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  pass_type text not null,
  provider text not null check (provider in ('apple-wallet','google-wallet')),
  status text not null default 'requires-provider-signing',
  external_pass_id text,
  barcode_payload text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.wallets enable row level security;
alter table public.wallet_ledger enable row level security;
alter table public.identity_profiles enable row level security;
alter table public.digital_credentials enable row level security;
alter table public.wallet_passes enable row level security;

create policy "Owners manage wallets" on public.wallets for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "Owners read wallet ledger" on public.wallet_ledger for select using (owner_id=auth.uid());
create policy "Owners manage identity profile" on public.identity_profiles for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "Owners manage credentials" on public.digital_credentials for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "Owners manage wallet passes" on public.wallet_passes for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create index if not exists wallet_ledger_owner_idx on public.wallet_ledger(owner_id,created_at desc);
create index if not exists digital_credentials_owner_idx on public.digital_credentials(owner_id,type,status);