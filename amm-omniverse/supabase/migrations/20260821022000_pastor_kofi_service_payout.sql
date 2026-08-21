create table if not exists public.service_revenue_events (
 id uuid primary key default gen_random_uuid(), service_key text not null, customer_user_id uuid references auth.users(id), gross_cents bigint not null check(gross_cents>=0),
 eligible_net_cents bigint not null check(eligible_net_cents>=0), currency text not null default 'USD', payment_ref text, payment_state text not null default 'pending',
 refund_reserve_cents bigint not null default 0 check(refund_reserve_cents>=0), agreement_ref text not null, evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), settled_at timestamptz);
create table if not exists public.service_share_allocations (
 id uuid primary key default gen_random_uuid(), revenue_event_id uuid not null references public.service_revenue_events(id) on delete cascade,
 recipient_key text not null, share_bps integer not null check(share_bps>=0 and share_bps<=10000), amount_cents bigint not null check(amount_cents>=0),
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 idempotency_key text not null unique, provider_ref text, gate_evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.service_revenue_events enable row level security; alter table public.service_share_allocations enable row level security;
revoke all on public.service_revenue_events from anon; revoke all on public.service_share_allocations from anon;
create policy "customer reads own service revenue" on public.service_revenue_events for select to authenticated using((select auth.uid())=customer_user_id);
-- Service revenue creation/verification, 10% calculation, recipient payout state and reversals are trusted-server/admin operations only.
