create table if not exists public.holo_credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  available bigint not null default 0 check (available >= 0),
  pending bigint not null default 0 check (pending >= 0),
  reserved bigint not null default 0 check (reserved >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  direction text not null check (direction in ('credit','debit','reserve','release','refund','reversal')),
  amount bigint not null check (amount > 0),
  reason text not null,
  source text not null,
  external_ref text,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.holo_credit_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sku text not null,
  state text not null default 'active' check (state in ('active','revoked','refunded','expired')),
  source_ledger_id uuid references public.holo_credit_ledger(id),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(user_id, sku, source_ledger_id)
);

create table if not exists public.holo_credit_family_controls (
  user_id uuid primary key references auth.users(id) on delete cascade,
  guardian_user_id uuid references auth.users(id),
  spending_paused boolean not null default false,
  per_purchase_limit bigint,
  daily_limit bigint,
  approval_required boolean not null default false,
  allowed_categories text[] not null default '{}'::text[],
  updated_at timestamptz not null default now()
);

alter table public.holo_credit_wallets enable row level security;
alter table public.holo_credit_ledger enable row level security;
alter table public.holo_credit_entitlements enable row level security;
alter table public.holo_credit_family_controls enable row level security;

revoke all on public.holo_credit_wallets from anon;
revoke all on public.holo_credit_ledger from anon;
revoke all on public.holo_credit_entitlements from anon;
revoke all on public.holo_credit_family_controls from anon;

create policy "wallet owner reads wallet" on public.holo_credit_wallets for select to authenticated using ((select auth.uid()) = user_id);
create policy "wallet owner reads ledger" on public.holo_credit_ledger for select to authenticated using ((select auth.uid()) = user_id);
create policy "wallet owner reads entitlements" on public.holo_credit_entitlements for select to authenticated using ((select auth.uid()) = user_id);
create policy "family control subject reads controls" on public.holo_credit_family_controls for select to authenticated using ((select auth.uid()) = user_id or (select auth.uid()) = guardian_user_id);

-- No authenticated INSERT/UPDATE/DELETE policies are intentionally granted for balances or ledger.
-- Purchases, grants, debits, refunds and reversals must be executed by trusted server functions/service role
-- after provider verification, eligibility, family controls and Jacobie Vision fraud checks.
