create table if not exists public.service_share_programs (
 id uuid primary key default gen_random_uuid(),
 program_key text not null unique,
 program_name text not null,
 beneficiary_name text not null,
 share_bps integer not null check(share_bps>=0 and share_bps<=10000),
 basis text not null,
 agreement_ref text,
 status text not null default 'draft' check(status in ('draft','active','paused','ended')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.service_share_revenue (
 id uuid primary key default gen_random_uuid(),
 program_id uuid not null references public.service_share_programs(id),
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
 unique(program_id,source_type,source_ref)
);

create table if not exists public.service_share_payouts (
 id uuid primary key default gen_random_uuid(),
 program_id uuid not null references public.service_share_programs(id),
 revenue_id uuid not null references public.service_share_revenue(id),
 amount_cents bigint not null check(amount_cents>=0),
 currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text,
 idempotency_key text not null unique,
 gate_evidence jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.service_share_programs enable row level security;
alter table public.service_share_revenue enable row level security;
alter table public.service_share_payouts enable row level security;
revoke all on public.service_share_programs from anon;
revoke all on public.service_share_revenue from anon;
revoke all on public.service_share_payouts from anon;

-- trusted-server/admin operations only: activate agreement, classify eligible revenue,
-- calculate share, approve payout, submit to provider, and reconcile settlement/reversal.
