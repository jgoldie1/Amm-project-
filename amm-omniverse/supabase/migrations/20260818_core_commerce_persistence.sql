-- TRYAMM core persistence: commerce, delivery, money, approvals, provider onboarding
-- Server-authoritative production data. RLS enabled by default.

create extension if not exists pgcrypto;

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  buyer_user_id uuid not null,
  seller_account_id uuid not null,
  status text not null check (status in ('draft','payment_pending','confirmed','processing','fulfilled','cancelled','refunded','disputed')),
  currency text not null default 'USD',
  subtotal_minor bigint not null default 0,
  discount_minor bigint not null default 0,
  delivery_minor bigint not null default 0,
  tax_minor bigint not null default 0,
  total_minor bigint not null default 0,
  fulfillment_type text not null check (fulfillment_type in ('holo_delivery','package_delivery','pickup','digital','service','external_shipping')),
  idempotency_key text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  listing_id text not null,
  seller_account_id uuid not null,
  title text not null,
  quantity integer not null check (quantity > 0),
  unit_price_minor bigint not null check (unit_price_minor >= 0),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.delivery_jobs (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.marketplace_orders(id) on delete set null,
  account_id uuid not null,
  customer_user_id uuid not null,
  provider_id text,
  courier_user_id uuid,
  mode text not null check (mode in ('walk','bike','car','van','third_party','robot','drone')),
  state text not null check (state in ('confirmed','merchant_accepted','preparing','ready_for_pickup','courier_assigned','picked_up','in_transit','arriving','delivered','problem','cancelled','refunded')),
  tracking_code text not null unique,
  eta_minutes integer,
  pickup_address jsonb not null default '{}'::jsonb,
  dropoff_address jsonb not null default '{}'::jsonb,
  precise_location_retention_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_tracking_events (
  id uuid primary key default gen_random_uuid(),
  delivery_job_id uuid not null references public.delivery_jobs(id) on delete cascade,
  state text not null,
  public_message text not null,
  eta_minutes integer,
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  source text not null check (source in ('merchant','courier','provider','system')),
  occurred_at timestamptz not null default now()
);

create table if not exists public.delivery_proofs (
  id uuid primary key default gen_random_uuid(),
  delivery_job_id uuid not null references public.delivery_jobs(id) on delete cascade,
  proof_type text not null check (proof_type in ('photo','signature','pin','recipient_confirmation','provider_confirmation')),
  storage_path text,
  confirmation_hash text,
  created_at timestamptz not null default now()
);

create table if not exists public.money_journal_entries (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  source_type text not null,
  source_id text not null,
  currency text not null default 'USD',
  idempotency_key text not null unique,
  status text not null check (status in ('pending','posted','reversed','failed')),
  created_by text not null,
  created_at timestamptz not null default now(),
  posted_at timestamptz
);

create table if not exists public.money_journal_lines (
  id uuid primary key default gen_random_uuid(),
  journal_entry_id uuid not null references public.money_journal_entries(id) on delete cascade,
  ledger_account text not null,
  debit_minor bigint not null default 0 check (debit_minor >= 0),
  credit_minor bigint not null default 0 check (credit_minor >= 0),
  constraint journal_line_one_side check ((debit_minor = 0) <> (credit_minor = 0))
);

create table if not exists public.jarvis_approval_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  requested_by_agent text not null,
  requested_for_user_id uuid not null,
  action text not null,
  action_payload jsonb not null default '{}'::jsonb,
  risk_level text not null check (risk_level in ('low','medium','high','critical')),
  status text not null check (status in ('pending','approved','denied','expired','executed','failed')),
  expires_at timestamptz,
  decided_by uuid,
  decided_at timestamptz,
  execution_correlation_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.external_service_partners (
  id uuid primary key default gen_random_uuid(),
  legal_name text not null,
  partner_type text not null check (partner_type in ('telehealth','medicaid_billing','legal','tax','insurance','realty','notary','registrar','domain_reseller')),
  status text not null check (status in ('lead','application','verification','contracting','sandbox','approved','suspended','rejected')),
  jurisdictions text[] not null default '{}',
  license_or_accreditation jsonb not null default '{}'::jsonb,
  api_capabilities jsonb not null default '{}'::jsonb,
  commercial_terms jsonb not null default '{}'::jsonb,
  verification_evidence jsonb not null default '{}'::jsonb,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.marketplace_orders enable row level security;
alter table public.marketplace_order_items enable row level security;
alter table public.delivery_jobs enable row level security;
alter table public.delivery_tracking_events enable row level security;
alter table public.delivery_proofs enable row level security;
alter table public.money_journal_entries enable row level security;
alter table public.money_journal_lines enable row level security;
alter table public.jarvis_approval_requests enable row level security;
alter table public.external_service_partners enable row level security;

-- Minimum end-user policies. Production should further scope staff/service roles with custom claims.
create policy if not exists marketplace_orders_buyer_read on public.marketplace_orders
for select to authenticated using (buyer_user_id = auth.uid());

create policy if not exists delivery_jobs_customer_read on public.delivery_jobs
for select to authenticated using (customer_user_id = auth.uid() or courier_user_id = auth.uid());

create policy if not exists approval_owner_read on public.jarvis_approval_requests
for select to authenticated using (requested_for_user_id = auth.uid() or decided_by = auth.uid());

-- No direct authenticated INSERT/UPDATE policies for money journals or provider approvals.
-- Those writes must be performed by trusted server/service-role functions after authorization.
