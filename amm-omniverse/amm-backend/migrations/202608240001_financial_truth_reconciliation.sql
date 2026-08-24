-- Applied to TRYAMM Supabase as migration financial_truth_reconciliation_wave.
-- Additive only: extends the existing ledger/payment/settlement system.

create table if not exists public.finance_reconciliation_events (
  id uuid primary key default gen_random_uuid(),
  canonical_event_id text not null,
  provider text not null,
  provider_event_id text not null,
  ledger_entry_id uuid references public.money_ledger_entries(id) on delete set null,
  payment_intent_id text references public.payment_intents(id) on delete set null,
  currency text not null,
  gross_minor bigint not null default 0,
  fee_minor bigint not null default 0,
  refund_minor bigint not null default 0,
  net_settlement_minor bigint not null default 0,
  expected_settlement_minor bigint not null default 0,
  variance_minor bigint generated always as (net_settlement_minor - expected_settlement_minor) stored,
  status text not null default 'pending' check (status in ('pending','matched','mismatch','held','resolved','reversed')),
  provider_settled_at timestamptz,
  reconciled_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_event_id),
  unique(canonical_event_id, provider)
);
create index if not exists finance_reconciliation_events_status_idx on public.finance_reconciliation_events(status, created_at desc);
create index if not exists finance_reconciliation_events_ledger_idx on public.finance_reconciliation_events(ledger_entry_id);
create index if not exists finance_reconciliation_events_provider_idx on public.finance_reconciliation_events(provider, created_at desc);

create table if not exists public.finance_capital_allocations (
  id uuid primary key default gen_random_uuid(),
  allocation_event_id text not null unique,
  currency text not null,
  source_amount_minor bigint not null check (source_amount_minor >= 0),
  required_liabilities_minor bigint not null default 0 check (required_liabilities_minor >= 0),
  tax_reserve_minor bigint not null default 0 check (tax_reserve_minor >= 0),
  refund_reserve_minor bigint not null default 0 check (refund_reserve_minor >= 0),
  operating_reserve_minor bigint not null default 0 check (operating_reserve_minor >= 0),
  growth_inventory_minor bigint not null default 0 check (growth_inventory_minor >= 0),
  approved_distribution_minor bigint not null default 0 check (approved_distribution_minor >= 0),
  manufacturing_12d_minor bigint not null default 0 check (manufacturing_12d_minor >= 0),
  unallocated_minor bigint not null default 0,
  policy_snapshot jsonb not null default '{}'::jsonb,
  status text not null default 'proposed' check (status in ('proposed','approved','posted','reversed')),
  approved_by uuid,
  posted_ledger_entry_id uuid references public.money_ledger_entries(id) on delete set null,
  created_at timestamptz not null default now(),
  approved_at timestamptz,
  posted_at timestamptz
);
create index if not exists finance_capital_allocations_status_idx on public.finance_capital_allocations(status, created_at desc);
create index if not exists finance_capital_allocations_currency_idx on public.finance_capital_allocations(currency, created_at desc);

create table if not exists public.finance_treasury_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null unique,
  currency text not null,
  available_cash_minor bigint not null default 0,
  pending_cash_minor bigint not null default 0,
  merchant_payables_minor bigint not null default 0,
  creator_payables_minor bigint not null default 0,
  developer_payables_minor bigint not null default 0,
  tax_liability_minor bigint not null default 0,
  refund_chargeback_reserve_minor bigint not null default 0,
  operating_reserve_minor bigint not null default 0,
  manufacturing_12d_capital_minor bigint not null default 0,
  source_cutoff_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists finance_treasury_snapshots_currency_idx on public.finance_treasury_snapshots(currency, created_at desc);

alter table public.finance_reconciliation_events enable row level security;
alter table public.finance_capital_allocations enable row level security;
alter table public.finance_treasury_snapshots enable row level security;

comment on table public.finance_reconciliation_events is 'Server-authoritative reconciliation between canonical TRYAMM economic events and payment-provider settlement events.';
comment on table public.finance_capital_allocations is 'Approved allocation of genuinely available cash after liabilities and reserves, including the 12D manufacturing capital bucket.';
comment on table public.finance_treasury_snapshots is 'Point-in-time treasury truth by currency. Service-role only unless explicit policies are added later.';
