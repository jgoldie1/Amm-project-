create table if not exists public.service_share_contracts (
 id uuid primary key default gen_random_uuid(),
 contract_key text not null unique,
 beneficiary_name text not null,
 program_name text not null,
 share_bps integer not null check(share_bps>=0 and share_bps<=10000),
 basis text not null,
 status text not null default 'draft' check(status in ('draft','active','paused','ended')),
 agreement_ref text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.service_revenue_events (
 id uuid primary key default gen_random_uuid(),
 contract_id uuid not null references public.service_share_contracts(id),
 source_type text not null,
 source_ref text not null,
 gross_cents bigint not null check(gross_cents>=0),
 refunds_cents bigint not null default 0 check(refunds_cents>=0),
 chargebacks_cents bigint not null default 0 check(chargebacks_cents>=0),
 excluded_cents bigint not null default 0 check(excluded_cents>=0),
 eligible_net_cents bigint not null check(eligible_net_cents>=0),
 currency text not null default 'USD',
 evidence jsonb not null default '{}'::jsonb,
 verified boolean not null default false,
 created_at timestamptz not null default now(),
 unique(contract_id, source_type, source_ref)
);

create table if not exists public.service_share_payouts (
 id uuid primary key default gen_random_uuid(),
 contract_id uuid not null references public.service_share_contracts(id),
 revenue_event_id uuid not null references public.service_revenue_events(id),
 amount_cents bigint not null check(amount_cents>=0),
 currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text,
 idempotency_key text not null unique,
 gate_evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.service_share_contracts enable row level security;
alter table public.service_revenue_events enable row level security;
alter table public.service_share_payouts enable row level security;
revoke all on public.service_share_contracts from anon;
revoke all on public.service_revenue_events from anon;
revoke all on public.service_share_payouts from anon;

-- No direct authenticated writes. Trusted server/admin flows must verify contract state,
-- eligible revenue, refunds/chargebacks, tax/payout readiness and idempotency before writes.
