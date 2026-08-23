-- Omni Treasury & Bills Engine
-- Accounting/approval layer only. External money movement must be executed by authorized payment/banking providers.

create table if not exists public.omni_treasury_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete set null,
  entity_key text not null,
  name text not null,
  currency text not null default 'USD',
  account_type text not null default 'operating' check (account_type in ('operating','tax','reserve','payroll','production','refund','escrow_reference')),
  provider_ref text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.omni_bills (
  id uuid primary key default gen_random_uuid(),
  entity_key text not null,
  vendor_name text not null,
  category text not null,
  description text not null default '',
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'USD',
  due_at timestamptz not null,
  priority integer not null default 50 check (priority between 0 and 100),
  legal_or_contractual boolean not null default false,
  recurring_rule text,
  provider_payment_ref text,
  status text not null default 'scheduled' check (status in ('draft','scheduled','approved','processing','paid','failed','disputed','cancelled')),
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  paid_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.omni_reserve_buckets (
  id uuid primary key default gen_random_uuid(),
  entity_key text not null,
  bucket_key text not null,
  name text not null,
  currency text not null default 'USD',
  target_type text not null default 'percent' check (target_type in ('percent','fixed','months_of_expense')),
  target_value numeric(18,4) not null default 0 check (target_value >= 0),
  current_amount numeric(18,2) not null default 0 check (current_amount >= 0),
  minimum_amount numeric(18,2) not null default 0 check (minimum_amount >= 0),
  protected boolean not null default true,
  release_requires_approval boolean not null default true,
  active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb,
  unique(entity_key,bucket_key)
);

create table if not exists public.omni_treasury_ledger (
  id uuid primary key default gen_random_uuid(),
  entity_key text not null,
  occurred_at timestamptz not null default now(),
  entry_type text not null check (entry_type in ('revenue','tax','refund','chargeback','provider_fee','creator_payable','talent_payable','royalty_payable','production_cost','payroll','contractor','operating_bill','reserve_funding','reserve_release','authorized_distribution','adjustment')),
  source_system text not null,
  source_ref text,
  description text not null default '',
  gross_amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  debit numeric(18,2) not null default 0 check (debit >= 0),
  credit numeric(18,2) not null default 0 check (credit >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_system,source_ref,entry_type)
);

create table if not exists public.omni_payment_approvals (
  id uuid primary key default gen_random_uuid(),
  entity_key text not null,
  bill_id uuid references public.omni_bills(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  approver_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending' check (status in ('pending','approved','rejected','expired','executed')),
  amount numeric(18,2) not null check (amount >= 0),
  currency text not null default 'USD',
  expires_at timestamptz,
  decision_at timestamptz,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.omni_cash_forecasts (
  id uuid primary key default gen_random_uuid(),
  entity_key text not null,
  as_of timestamptz not null default now(),
  currency text not null default 'USD',
  cash_available numeric(18,2) not null default 0,
  taxes_due numeric(18,2) not null default 0,
  refunds_chargebacks numeric(18,2) not null default 0,
  contractual_payables numeric(18,2) not null default 0,
  bills_due numeric(18,2) not null default 0,
  reserve_shortfall numeric(18,2) not null default 0,
  safe_to_spend numeric(18,2) not null default 0,
  assumptions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.omni_treasury_accounts enable row level security;
alter table public.omni_bills enable row level security;
alter table public.omni_reserve_buckets enable row level security;
alter table public.omni_treasury_ledger enable row level security;
alter table public.omni_payment_approvals enable row level security;
alter table public.omni_cash_forecasts enable row level security;

-- Service-role backend owns writes. Authenticated users only receive scoped treasury data through server APIs.

insert into public.omni_reserve_buckets (entity_key,bucket_key,name,target_type,target_value,minimum_amount,protected)
values
('tryamm','tax','Tax Reserve','percent',25,0,true),
('tryamm','refunds','Refund & Chargeback Reserve','percent',5,0,true),
('tryamm','payroll','Payroll & Contractor Reserve','months_of_expense',1,0,true),
('tryamm','operations','Operating Reserve','months_of_expense',3,0,true),
('tryamm','production','Production Reserve','percent',10,0,true),
('tryamm','emergency','Emergency Reserve','percent',5,0,true)
on conflict (entity_key,bucket_key) do nothing;
