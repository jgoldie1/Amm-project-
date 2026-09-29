create table if not exists public.tryamm_edge_work_receipts (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.tryamm_edge_jobs(id) on delete restrict,
  node_id uuid not null references public.tryamm_edge_nodes(id) on delete restrict,
  supplier_user_id text not null, buyer_ref text, work_class text not null,
  metered_units numeric(20,6) not null check (metered_units >= 0),
  unit_name text not null, unit_price_cents numeric(20,6) not null check (unit_price_cents >= 0),
  gross_cents bigint not null check (gross_cents >= 0),
  verification_state text not null default 'pending' check (verification_state in ('pending','verified','rejected','reversed')),
  evidence_hash text not null, verified_at timestamptz, created_at timestamptz not null default now(),
  unique(job_id)
);
create table if not exists public.tryamm_edge_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  receipt_id uuid not null references public.tryamm_edge_work_receipts(id) on delete restrict,
  beneficiary_user_id text,
  ledger_account text not null check (ledger_account in ('node_owner_payable','tryamm_platform_revenue','network_reserve')),
  direction text not null check (direction in ('credit','debit')),
  amount_cents bigint not null check (amount_cents > 0), currency text not null default 'USD',
  settlement_state text not null default 'pending' check (settlement_state in ('pending','held','payable','paid','reversed')),
  entry_key text not null unique, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.tryamm_edge_work_receipts enable row level security;
alter table public.tryamm_edge_earnings_ledger enable row level security;
revoke all on table public.tryamm_edge_work_receipts from anon, authenticated;
revoke all on table public.tryamm_edge_earnings_ledger from anon, authenticated;
grant select,insert,update on table public.tryamm_edge_work_receipts to service_role;
grant select,insert,update on table public.tryamm_edge_earnings_ledger to service_role;
create index if not exists tryamm_edge_receipts_supplier_created_idx on public.tryamm_edge_work_receipts(supplier_user_id,created_at desc);
create index if not exists tryamm_edge_earnings_beneficiary_state_idx on public.tryamm_edge_earnings_ledger(beneficiary_user_id,settlement_state,created_at desc);