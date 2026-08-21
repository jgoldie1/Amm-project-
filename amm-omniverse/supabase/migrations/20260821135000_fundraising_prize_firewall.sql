create table if not exists public.fundraising_campaigns (
  id uuid primary key default gen_random_uuid(),
  campaign_key text not null unique,
  title text not null,
  campaign_type text not null check(campaign_type in ('direct-donation','fixed-price-benefit-event','membership-support','sponsor-support','merchandise-fundraiser','service-revenue-allocation','grant-or-sponsor-funding')),
  beneficiary_ref text,
  chance_based boolean not null default false check(chance_based=false),
  purchase_affects_odds boolean not null default false check(purchase_affects_odds=false),
  donation_affects_odds boolean not null default false check(donation_affects_odds=false),
  status text not null default 'draft' check(status in ('draft','review','active','paused','closed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.fundraising_ledger (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.fundraising_campaigns(id) on delete cascade,
  user_id uuid references auth.users(id),
  entry_type text not null check(entry_type in ('contribution','refund','chargeback','allocation','fee','adjustment')),
  amount_cents bigint not null check(amount_cents>=0),
  currency text not null default 'USD',
  payment_ref text,
  idempotency_key text not null unique,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.fundraising_campaigns enable row level security;
alter table public.fundraising_ledger enable row level security;
revoke all on public.fundraising_campaigns from anon;
revoke all on public.fundraising_ledger from anon;

create policy "active fundraising readable" on public.fundraising_campaigns for select to authenticated using(status in ('active','closed'));
create policy "supporter reads own fundraising entries" on public.fundraising_ledger for select to authenticated using((select auth.uid())=user_id);

-- No direct client write policies. Trusted server/payment-webhook paths create campaign ledger entries.
-- Chance-based promotions must use a separately reviewed future system and cannot be represented in these fundraising tables.
