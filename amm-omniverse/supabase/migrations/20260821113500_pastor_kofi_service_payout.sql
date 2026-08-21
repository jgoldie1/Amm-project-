create table if not exists public.service_revenue_events (
  id uuid primary key default gen_random_uuid(),
  service_key text not null,
  customer_payment_ref text not null,
  gross_amount_cents bigint not null check(gross_amount_cents >= 0),
  eligible_net_amount_cents bigint not null check(eligible_net_amount_cents >= 0),
  currency text not null default 'USD',
  payment_state text not null default 'pending' check(payment_state in ('pending','settled','refunded','chargeback','reversed')),
  agreement_ref text,
  evidence jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  unique(customer_payment_ref)
);

create table if not exists public.service_share_allocations (
  id uuid primary key default gen_random_uuid(),
  revenue_event_id uuid not null references public.service_revenue_events(id) on delete cascade,
  beneficiary_key text not null,
  share_bps integer not null check(share_bps >= 0 and share_bps <= 10000),
  basis_amount_cents bigint not null check(basis_amount_cents >= 0),
  calculated_amount_cents bigint not null check(calculated_amount_cents >= 0),
  state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
  hold_until timestamptz,
  idempotency_key text not null unique,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_share_payouts (
  id uuid primary key default gen_random_uuid(),
  allocation_id uuid not null references public.service_share_allocations(id) on delete cascade,
  recipient_user_id uuid references auth.users(id),
  payout_provider text,
  provider_ref text,
  amount_cents bigint not null check(amount_cents >= 0),
  currency text not null default 'USD',
  state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
  tax_reporting_state text not null default 'unknown',
  gate_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_revenue_events enable row level security;
alter table public.service_share_allocations enable row level security;
alter table public.service_share_payouts enable row level security;
revoke all on public.service_revenue_events from anon;
revoke all on public.service_share_allocations from anon;
revoke all on public.service_share_payouts from anon;

create policy "recipient reads service share payouts" on public.service_share_payouts for select to authenticated using((select auth.uid()) = recipient_user_id);

-- Revenue verification, 10% calculation, hold release, payout submission, settlement and reversal are trusted-server/admin operations only.
-- Canonical Pastor Kofi / Servants of Christ share is 1000 bps against eligible net service revenue under the approved agreement.
