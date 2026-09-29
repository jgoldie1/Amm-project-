create table if not exists public.tryamm_edge_work_orders (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_ref text not null,
  customer_ref text,
  job_class text not null check (job_class in ('cache-sync','world-state-sync','light-ai','media-thumbnail','asset-optimize','offline-reconcile','telemetry-aggregate')),
  unit_name text not null,
  unit_count numeric(20,6) not null check (unit_count > 0),
  gross_budget_cents bigint not null check (gross_budget_cents >= 0),
  node_share_bps integer not null check (node_share_bps between 0 and 10000),
  platform_share_bps integer not null check (platform_share_bps between 0 and 10000),
  reserve_share_bps integer not null default 0 check (reserve_share_bps between 0 and 10000),
  currency text not null default 'USD',
  status text not null default 'funded' check (status in ('draft','funded','dispatching','completed','cancelled','reversed')),
  requirements jsonb not null default '{}'::jsonb,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(source_system,source_ref),
  check (node_share_bps + platform_share_bps + reserve_share_bps = 10000)
);

alter table public.tryamm_edge_jobs
  add column if not exists work_order_id uuid references public.tryamm_edge_work_orders(id) on delete set null;

create table if not exists public.tryamm_edge_earnings_ledger (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null references public.tryamm_edge_work_orders(id) on delete restrict,
  edge_job_id uuid not null references public.tryamm_edge_jobs(id) on delete restrict,
  owner_user_id text not null,
  node_id uuid not null references public.tryamm_edge_nodes(id) on delete restrict,
  gross_cents bigint not null check (gross_cents >= 0),
  node_earnings_cents bigint not null check (node_earnings_cents >= 0),
  platform_revenue_cents bigint not null check (platform_revenue_cents >= 0),
  reserve_cents bigint not null default 0 check (reserve_cents >= 0),
  currency text not null default 'USD',
  verification_status text not null default 'pending' check (verification_status in ('pending','verified','rejected','reversed')),
  payout_status text not null default 'blocked' check (payout_status in ('blocked','payable','processing','paid','reversed')),
  evidence jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(edge_job_id),
  check (node_earnings_cents + platform_revenue_cents + reserve_cents = gross_cents)
);

alter table public.tryamm_edge_work_orders enable row level security;
alter table public.tryamm_edge_earnings_ledger enable row level security;

revoke all on table public.tryamm_edge_work_orders from anon, authenticated;
revoke all on table public.tryamm_edge_earnings_ledger from anon, authenticated;
grant select,insert,update,delete on table public.tryamm_edge_work_orders to service_role;
grant select,insert,update,delete on table public.tryamm_edge_earnings_ledger to service_role;

create index if not exists tryamm_edge_work_orders_status_expiry_idx
  on public.tryamm_edge_work_orders(status,expires_at);
create index if not exists tryamm_edge_earnings_owner_status_idx
  on public.tryamm_edge_earnings_ledger(owner_user_id,payout_status,created_at desc);

comment on table public.tryamm_edge_work_orders is
'Server-authoritative funded Edge work. Client-created personal jobs do not earn unless linked to a funded work order.';
comment on table public.tryamm_edge_earnings_ledger is
'Server-authoritative Edge earnings receipts. Node execution alone cannot make a receipt payable; independent verification is required.';
