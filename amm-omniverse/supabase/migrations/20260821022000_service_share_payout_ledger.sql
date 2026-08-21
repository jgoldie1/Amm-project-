create table if not exists public.service_share_agreements (
 id uuid primary key default gen_random_uuid(), agreement_key text not null unique, recipient_ref text not null, share_bps integer not null check(share_bps>=0 and share_bps<=10000),
 eligible_basis text not null, status text not null default 'draft' check(status in ('draft','active','paused','ended')), terms_ref text, created_at timestamptz not null default now());
create table if not exists public.service_share_transactions (
 id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.service_share_agreements(id), source_payment_ref text not null,
 gross_cents bigint not null check(gross_cents>=0), eligible_net_cents bigint not null check(eligible_net_cents>=0), currency text not null default 'USD',
 evidence jsonb not null default '{}'::jsonb, state text not null default 'pending' check(state in ('pending','verified','held','reversed')), created_at timestamptz not null default now(), unique(agreement_id,source_payment_ref));
create table if not exists public.service_share_payouts (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.service_share_transactions(id), recipient_user_id uuid references auth.users(id),
 share_bps integer not null check(share_bps>=0 and share_bps<=10000), amount_cents bigint not null check(amount_cents>=0), currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')), provider_ref text,
 idempotency_key text not null unique, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.service_share_agreements enable row level security; alter table public.service_share_transactions enable row level security; alter table public.service_share_payouts enable row level security;
revoke all on public.service_share_agreements from anon; revoke all on public.service_share_transactions from anon; revoke all on public.service_share_payouts from anon;
create policy "recipient reads own service payout" on public.service_share_payouts for select to authenticated using((select auth.uid())=recipient_user_id);
-- Agreement activation, payment verification, eligible basis calculation, share calculation and payout state changes are trusted-server/admin operations only.
