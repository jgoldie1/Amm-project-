create table if not exists public.service_share_agreements (
 id uuid primary key default gen_random_uuid(), agreement_key text not null unique, recipient_ref text not null,
 share_bps integer not null check(share_bps>=0 and share_bps<=10000), eligible_basis text not null,
 status text not null default 'draft' check(status in ('draft','active','suspended','ended')), terms_ref text, created_at timestamptz not null default now());
create table if not exists public.service_share_transactions (
 id uuid primary key default gen_random_uuid(), agreement_id uuid not null references public.service_share_agreements(id),
 payment_ref text not null, service_category text not null, gross_cents bigint not null check(gross_cents>=0), eligible_net_cents bigint not null check(eligible_net_cents>=0),
 share_cents bigint not null check(share_cents>=0), currency text not null default 'USD', reserve_cents bigint not null default 0 check(reserve_cents>=0),
 evidence jsonb not null default '{}'::jsonb, state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 idempotency_key text not null unique, provider_ref text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.service_share_reversals (
 id uuid primary key default gen_random_uuid(), transaction_id uuid not null references public.service_share_transactions(id),
 amount_cents bigint not null check(amount_cents>0), reason text not null, evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
alter table public.service_share_agreements enable row level security; alter table public.service_share_transactions enable row level security; alter table public.service_share_reversals enable row level security;
revoke all on public.service_share_agreements from anon; revoke all on public.service_share_transactions from anon; revoke all on public.service_share_reversals from anon;
-- No direct authenticated write policies. Agreement activation, eligible-basis calculation, payout creation, provider settlement and reversals are trusted-server/admin operations only.
