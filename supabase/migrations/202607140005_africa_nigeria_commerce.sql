create table if not exists public.africa_business_profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users(id) on delete cascade,
  business_name text not null default '',
  country text not null default 'NG',
  currency text not null default 'NGN',
  business_type text not null default 'creator',
  registration_status text not null default 'unverified',
  tax_status text not null default 'not-reviewed',
  kyc_status text not null default 'not-started',
  payout_status text not null default 'blocked-until-verified',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.africa_payment_intents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  country text not null,
  currency text not null,
  amount numeric not null check (amount > 0),
  provider text not null check (provider in ('paystack','flutterwave','mock')),
  channel text not null,
  purpose text not null default 'marketplace',
  status text not null default 'pending',
  provider_reference text unique,
  checkout_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.africa_payout_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  country text not null,
  provider text not null,
  account_name text,
  account_number_last4 text,
  bank_code text,
  recipient_code text,
  status text not null default 'pending-verification',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.africa_creator_settlements (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  country text not null,
  currency text not null,
  gross_amount numeric not null,
  platform_fee numeric not null default 0,
  withholding numeric not null default 0,
  net_amount numeric not null,
  provider text not null,
  status text not null default 'pending',
  period_start timestamptz,
  period_end timestamptz,
  provider_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists africa_payment_owner_idx on public.africa_payment_intents(owner_id,created_at desc);
create index if not exists africa_settlement_owner_idx on public.africa_creator_settlements(owner_id,created_at desc);

alter table public.africa_business_profiles enable row level security;
alter table public.africa_payment_intents enable row level security;
alter table public.africa_payout_accounts enable row level security;
alter table public.africa_creator_settlements enable row level security;

create policy "Owners manage Africa business profiles" on public.africa_business_profiles for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "Owners read Africa payment intents" on public.africa_payment_intents for select using (owner_id=auth.uid());
create policy "Owners insert Africa payment intents" on public.africa_payment_intents for insert with check (owner_id=auth.uid());
create policy "Owners manage Africa payout accounts" on public.africa_payout_accounts for all using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "Owners read Africa settlements" on public.africa_creator_settlements for select using (owner_id=auth.uid());
