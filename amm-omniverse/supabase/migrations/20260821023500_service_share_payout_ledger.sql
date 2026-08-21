create table if not exists public.service_share_programs (
 id uuid primary key default gen_random_uuid(), program_key text not null unique, title text not null, beneficiary_ref text not null,
 share_bps integer not null check(share_bps>=0 and share_bps<=10000), eligible_revenue_rule text not null,
 agreement_ref text, status text not null default 'draft' check(status in ('draft','active','paused','ended')), created_at timestamptz not null default now());
create table if not exists public.service_share_revenue (
 id uuid primary key default gen_random_uuid(), program_id uuid not null references public.service_share_programs(id) on delete cascade,
 source_ref text not null, gross_cents bigint not null check(gross_cents>=0), eligible_net_cents bigint not null check(eligible_net_cents>=0), currency text not null default 'USD',
 evidence jsonb not null default '{}'::jsonb, state text not null default 'pending' check(state in ('pending','verified','held','reversed')), created_at timestamptz not null default now());
create table if not exists public.service_share_payouts (
 id uuid primary key default gen_random_uuid(), program_id uuid not null references public.service_share_programs(id), revenue_id uuid not null references public.service_share_revenue(id),
 beneficiary_ref text not null, amount_cents bigint not null check(amount_cents>=0), currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text, idempotency_key text not null unique, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.service_share_programs enable row level security; alter table public.service_share_revenue enable row level security; alter table public.service_share_payouts enable row level security;
revoke all on public.service_share_programs from anon; revoke all on public.service_share_revenue from anon; revoke all on public.service_share_payouts from anon;
create policy "active service programs readable" on public.service_share_programs for select to authenticated using(status='active');
-- Revenue verification, 10% calculation, payout approval and settlement are trusted-server/admin operations only.
