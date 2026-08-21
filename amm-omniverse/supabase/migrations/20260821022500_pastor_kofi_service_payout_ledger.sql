create table if not exists public.service_revenue_events (
 id uuid primary key default gen_random_uuid(), service_key text not null, customer_ref text, gross_cents bigint not null check(gross_cents>=0),
 refund_reserve_cents bigint not null default 0 check(refund_reserve_cents>=0), fee_cents bigint not null default 0 check(fee_cents>=0),
 eligible_net_cents bigint not null default 0 check(eligible_net_cents>=0), currency text not null default 'USD', payment_ref text,
 payment_state text not null default 'pending' check(payment_state in ('pending','settled','refunded','chargeback','reversed')),
 agreement_ref text, evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.service_revenue_shares (
 id uuid primary key default gen_random_uuid(), revenue_event_id uuid not null references public.service_revenue_events(id) on delete cascade,
 recipient_key text not null, share_bps integer not null check(share_bps>=0 and share_bps<=10000), amount_cents bigint not null check(amount_cents>=0),
 basis text not null, state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 idempotency_key text not null unique, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.service_payouts (
 id uuid primary key default gen_random_uuid(), share_id uuid not null references public.service_revenue_shares(id) on delete cascade,
 recipient_user_id uuid references auth.users(id), provider text, provider_ref text, amount_cents bigint not null check(amount_cents>=0), currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 tax_evidence jsonb not null default '{}'::jsonb, payout_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.service_revenue_events enable row level security;
alter table public.service_revenue_shares enable row level security;
alter table public.service_payouts enable row level security;
revoke all on public.service_revenue_events from anon;
revoke all on public.service_revenue_shares from anon;
revoke all on public.service_payouts from anon;

create policy "recipient reads own service payout" on public.service_payouts for select to authenticated using((select auth.uid())=recipient_user_id);
-- Revenue settlement, 10% calculation, approval, provider submission, paid/reversal state and evidence writes are trusted-server/admin operations only.
