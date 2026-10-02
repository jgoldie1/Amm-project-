-- TRYAMM distributed 3D Print Network.
-- Server-authoritative work orders, QA evidence, shipment proof and settlement ledger.
-- Exact home addresses are intentionally not part of the operator public profile.

create extension if not exists pgcrypto;

create table if not exists public.print_network_operators (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  display_name text not null,
  service_region text,
  level text not null default 'applicant'
    check (level in ('applicant','trainee','apprentice','certified','lead','regional-hub')),
  certification_status text not null default 'pending'
    check (certification_status in ('pending','training','sample-required','review','certified','suspended','rejected')),
  printer_profiles jsonb not null default '[]'::jsonb,
  materials jsonb not null default '[]'::jsonb,
  service_modes jsonb not null default '["ship"]'::jsonb,
  max_build_mm jsonb not null default '{}'::jsonb,
  quality_score numeric(5,2),
  completed_jobs integer not null default 0,
  on_time_jobs integer not null default 0,
  dispute_count integer not null default 0,
  availability text not null default 'offline'
    check (availability in ('offline','available','busy','paused')),
  payout_provider text,
  payout_account_ref text,
  payout_ready boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_network_jobs (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid references auth.users(id) on delete set null,
  commerce_order_id uuid references public.commerce_orders(id) on delete set null,
  source_asset_id text,
  source_asset_url text,
  source_manifest jsonb not null default '{}'::jsonb,
  title text not null,
  product_category text not null default 'general',
  quantity integer not null default 1 check (quantity between 1 and 500),
  process text not null default 'fdm'
    check (process in ('fdm','sla','sls','other')),
  material text not null,
  color text,
  target_dimensions_mm jsonb not null default '{}'::jsonb,
  tolerance_mm numeric(8,3),
  unit_price_cents bigint not null default 0 check (unit_price_cents >= 0),
  gross_cents bigint not null default 0 check (gross_cents >= 0),
  operator_share_bps integer not null default 8000 check (operator_share_bps between 0 and 10000),
  platform_share_bps integer not null default 1500 check (platform_share_bps between 0 and 10000),
  reserve_share_bps integer not null default 500 check (reserve_share_bps between 0 and 10000),
  funding_status text not null default 'unfunded'
    check (funding_status in ('unfunded','payment-pending','paid-verified','refunded','reversed')),
  rights_status text not null default 'pending'
    check (rights_status in ('pending','verified','rejected')),
  safety_status text not null default 'pending'
    check (safety_status in ('pending','verified','rejected')),
  status text not null default 'requested'
    check (status in ('requested','funding-required','available','accepted','printing','qa-submitted','qa-approved','packaged','shipped','delivered','settlement-review','settled','disputed','cancelled')),
  assigned_operator_id uuid references public.print_network_operators(id) on delete set null,
  packaging_spec jsonb not null default '{}'::jsonb,
  delivery_spec jsonb not null default '{}'::jsonb,
  due_at timestamptz,
  accepted_at timestamptz,
  print_started_at timestamptz,
  qa_submitted_at timestamptz,
  qa_approved_at timestamptz,
  packaged_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  settled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (operator_share_bps + platform_share_bps + reserve_share_bps = 10000)
);

create table if not exists public.print_network_qa_evidence (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.print_network_jobs(id) on delete cascade,
  operator_id uuid not null references public.print_network_operators(id) on delete restrict,
  evidence_type text not null
    check (evidence_type in ('front','back','left','right','top','bottom','packaging','shipping-label','dimension','weight','other')),
  storage_bucket text not null default 'print-network-evidence',
  storage_path text not null,
  mime_type text,
  file_size_bytes bigint check (file_size_bytes is null or file_size_bytes >= 0),
  sha256 text,
  note text,
  review_status text not null default 'pending'
    check (review_status in ('pending','accepted','rejected')),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  unique(job_id,evidence_type,storage_path)
);

create table if not exists public.print_network_shipments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.print_network_jobs(id) on delete cascade unique,
  operator_id uuid not null references public.print_network_operators(id) on delete restrict,
  carrier text not null,
  service_level text,
  tracking_code text not null,
  tracking_url text,
  status text not null default 'label-created'
    check (status in ('label-created','accepted','in-transit','out-for-delivery','delivered','exception','returned','cancelled')),
  provider_verified boolean not null default false,
  proof_reference text,
  events jsonb not null default '[]'::jsonb,
  shipped_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.print_network_earnings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.print_network_jobs(id) on delete restrict unique,
  operator_id uuid not null references public.print_network_operators(id) on delete restrict,
  gross_cents bigint not null check (gross_cents >= 0),
  operator_earnings_cents bigint not null check (operator_earnings_cents >= 0),
  platform_revenue_cents bigint not null check (platform_revenue_cents >= 0),
  reserve_cents bigint not null check (reserve_cents >= 0),
  currency text not null default 'USD',
  verification_status text not null default 'pending'
    check (verification_status in ('pending','verified','rejected','reversed')),
  payout_status text not null default 'blocked'
    check (payout_status in ('blocked','payable','processing','paid','reversed')),
  payout_provider_ref text,
  evidence jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (operator_earnings_cents + platform_revenue_cents + reserve_cents = gross_cents)
);

create index if not exists print_network_operators_status_idx on public.print_network_operators(certification_status,availability,updated_at desc);
create index if not exists print_network_jobs_status_idx on public.print_network_jobs(status,process,material,created_at);
create index if not exists print_network_jobs_category_idx on public.print_network_jobs(product_category,safety_status,status,created_at);
create index if not exists print_network_jobs_operator_idx on public.print_network_jobs(assigned_operator_id,status,updated_at desc);
create index if not exists print_network_qa_job_idx on public.print_network_qa_evidence(job_id,evidence_type,review_status);
create index if not exists print_network_earnings_operator_idx on public.print_network_earnings(operator_id,payout_status,created_at desc);

alter table public.print_network_operators enable row level security;
alter table public.print_network_jobs enable row level security;
alter table public.print_network_qa_evidence enable row level security;
alter table public.print_network_shipments enable row level security;
alter table public.print_network_earnings enable row level security;

revoke all on table public.print_network_operators from public, anon, authenticated;
revoke all on table public.print_network_jobs from public, anon, authenticated;
revoke all on table public.print_network_qa_evidence from public, anon, authenticated;
revoke all on table public.print_network_shipments from public, anon, authenticated;
revoke all on table public.print_network_earnings from public, anon, authenticated;

grant select,insert,update,delete on table public.print_network_operators to service_role;
grant select,insert,update,delete on table public.print_network_jobs to service_role;
grant select,insert,update,delete on table public.print_network_qa_evidence to service_role;
grant select,insert,update,delete on table public.print_network_shipments to service_role;
grant select,insert,update,delete on table public.print_network_earnings to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values(
  'print-network-evidence',
  'print-network-evidence',
  false,
  15728640,
  array['image/jpeg','image/png','image/webp','application/pdf']::text[]
)
on conflict (id) do update set
  public=false,
  file_size_limit=excluded.file_size_limit,
  allowed_mime_types=excluded.allowed_mime_types;

comment on table public.print_network_operators is 'TRYAMM distributed print-worker profiles. Exact home addresses are not stored as public operator profile data.';
comment on table public.print_network_jobs is 'Server-authoritative 3D print work orders. Money remains blocked until payment, rights, safety, QA and delivery evidence are verified.';
comment on table public.print_network_qa_evidence is 'Private six-view print QA, packaging and related evidence. Storage bucket is private.';
comment on table public.print_network_earnings is 'Server-authoritative print earnings. Operator actions alone cannot make earnings payable.';
