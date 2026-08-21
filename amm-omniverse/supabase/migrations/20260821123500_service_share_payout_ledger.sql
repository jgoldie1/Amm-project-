create table if not exists public.service_share_programs (
  id uuid primary key default gen_random_uuid(),
  program_key text not null unique,
  title text not null,
  share_bps integer not null check (share_bps between 0 and 10000),
  basis text not null,
  agreement_ref text,
  status text not null default 'draft' check (status in ('draft','active','paused','ended')),
  created_at timestamptz not null default now()
);

create table if not exists public.service_share_earnings (
  id uuid primary key default gen_random_uuid(),
  program_id uuid not null references public.service_share_programs(id),
  source_payment_ref text not null,
  source_service_ref text not null,
  gross_cents bigint not null check (gross_cents >= 0),
  refunds_cents bigint not null default 0 check (refunds_cents >= 0),
  chargebacks_cents bigint not null default 0 check (chargebacks_cents >= 0),
  eligible_net_cents bigint not null check (eligible_net_cents >= 0),
  share_cents bigint not null check (share_cents >= 0),
  currency text not null default 'USD',
  evidence jsonb not null default '{}'::jsonb,
  state text not null default 'pending' check (state in ('pending','held','approved','reversed')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.service_share_payouts (
  id uuid primary key default gen_random_uuid(),
  earning_id uuid not null references public.service_share_earnings(id),
  payee_ref text not null,
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'USD',
  state text not null default 'pending' check (state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
  provider_ref text,
  gate_evidence jsonb not null default '{}'::jsonb,
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_share_programs enable row level security;
alter table public.service_share_earnings enable row level security;
alter table public.service_share_payouts enable row level security;
revoke all on public.service_share_programs from anon;
revoke all on public.service_share_earnings from anon;
revoke all on public.service_share_payouts from anon;

create policy "active service-share program readable" on public.service_share_programs for select to authenticated using (status='active');
-- Earnings and payout writes are trusted-server/admin operations only.
-- Payee visibility should be exposed through a server endpoint that verifies the entitled payee identity.
