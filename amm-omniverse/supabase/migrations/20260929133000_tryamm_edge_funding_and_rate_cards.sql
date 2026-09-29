alter table public.tryamm_edge_work_orders
  add column if not exists funding_transaction_id uuid references public.commerce_payment_transactions(id) on delete restrict,
  add column if not exists funded_at timestamptz,
  add column if not exists dispatched_job_id uuid references public.tryamm_edge_jobs(id) on delete set null;

create unique index if not exists tryamm_edge_work_orders_funding_tx_uidx
  on public.tryamm_edge_work_orders(funding_transaction_id)
  where funding_transaction_id is not null;

create table if not exists public.tryamm_edge_rate_cards (
  id uuid primary key default gen_random_uuid(),
  job_class text not null check (job_class in ('cache-sync','world-state-sync','light-ai','media-thumbnail','asset-optimize','offline-reconcile','telemetry-aggregate')),
  node_class text not null check (node_class in ('pocket','tablet','workstation','cafe','business','cloud')),
  unit_name text not null,
  customer_rate_cents numeric(20,6) not null check (customer_rate_cents > 0),
  node_share_bps integer not null check (node_share_bps between 0 and 10000),
  platform_share_bps integer not null check (platform_share_bps between 0 and 10000),
  reserve_share_bps integer not null check (reserve_share_bps between 0 and 10000),
  enabled boolean not null default false,
  version integer not null default 1 check (version > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_class,node_class,version),
  check (node_share_bps + platform_share_bps + reserve_share_bps = 10000)
);

alter table public.tryamm_edge_rate_cards enable row level security;
revoke all on table public.tryamm_edge_rate_cards from anon, authenticated;
grant select,insert,update,delete on table public.tryamm_edge_rate_cards to service_role;

create index if not exists tryamm_edge_rate_cards_enabled_idx
  on public.tryamm_edge_rate_cards(job_class,node_class,enabled,version desc);

comment on table public.tryamm_edge_rate_cards is
'Server-controlled Edge Grid customer rates and revenue splits. Rows are disabled by default; no earning rate is implied until an approved row is enabled.';
