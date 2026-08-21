create table if not exists public.service_revenue_events (
  id uuid primary key default gen_random_uuid(),
  service_key text not null,
  order_ref text not null unique,
  gross_cents bigint not null check (gross_cents >= 0),
  eligible_net_cents bigint not null check (eligible_net_cents >= 0),
  currency text not null default 'USD',
  payment_state text not null check (payment_state in ('pending','settled','refunded','charged_back','cancelled')),
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.service_share_payouts (
  id uuid primary key default gen_random_uuid(),
  revenue_event_id uuid not null references public.service_revenue_events(id) on delete restrict,
  program_key text not null,
  recipient_ref text not null,
  share_bps integer not null check (share_bps >= 0 and share_bps <= 10000),
  amount_cents bigint not null check (amount_cents >= 0),
  state text not null default 'pending' check (state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
  provider_ref text,
  idempotency_key text not null unique,
  gate_evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.service_revenue_events enable row level security;
alter table public.service_share_payouts enable row level security;
revoke all on public.service_revenue_events from anon;
revoke all on public.service_share_payouts from anon;

-- Trusted backend/service role owns writes. Authenticated users receive no generic write policy.
-- Reads should be exposed through purpose-built APIs after authorization because these rows contain financial evidence.
