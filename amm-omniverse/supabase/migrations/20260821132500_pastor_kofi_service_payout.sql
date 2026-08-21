create table if not exists public.service_revenue_events (
 id uuid primary key default gen_random_uuid(), service_key text not null, customer_ref text, gross_cents bigint not null check(gross_cents>=0),
 eligible_net_cents bigint not null check(eligible_net_cents>=0), currency text not null default 'USD', payment_state text not null,
 refund_reserve_cents bigint not null default 0 check(refund_reserve_cents>=0), evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.service_share_payouts (
 id uuid primary key default gen_random_uuid(), revenue_event_id uuid not null references public.service_revenue_events(id), recipient_ref text not null,
 share_bps integer not null default 1000 check(share_bps>=0 and share_bps<=10000), amount_cents bigint not null check(amount_cents>=0), currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text, idempotency_key text not null unique, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.service_revenue_events enable row level security; alter table public.service_share_payouts enable row level security;
revoke all on public.service_revenue_events from anon; revoke all on public.service_share_payouts from anon;
-- Trusted backend/service role creates revenue evidence, calculates the 10% eligible share, and submits/reverses payouts.
-- No authenticated client write policies are granted for payout creation or settlement.
