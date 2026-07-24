create extension if not exists pgcrypto;

create table if not exists public.holopass_accounts (
  user_id uuid primary key,
  beans bigint not null default 0,
  xp bigint not null default 0,
  loyalty_tier text not null default 'member',
  updated_at timestamptz not null default now()
);

create table if not exists public.holopass_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  business_id uuid,
  event_type text not null,
  beans_delta bigint not null default 0,
  xp_delta bigint not null default 0,
  reference_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_campaigns (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  status text not null default 'draft',
  customer_discount_type text,
  customer_discount_value numeric(18,2) not null default 0,
  creator_commission_type text not null default 'fixed',
  creator_commission_value numeric(18,2) not null default 0,
  revenue_policy_id text,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.affiliate_enrollments (
  campaign_id uuid not null references public.affiliate_campaigns(id) on delete cascade,
  creator_user_id uuid not null,
  promo_code text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  primary key (campaign_id, creator_user_id)
);

create table if not exists public.affiliate_conversions (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.affiliate_campaigns(id) on delete cascade,
  creator_user_id uuid not null,
  customer_user_id uuid,
  order_id uuid,
  gross_amount numeric(18,2) not null default 0,
  commission_amount numeric(18,2) not null default 0,
  status text not null default 'pending',
  attribution_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.reservation_resources (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  name text not null,
  resource_type text not null,
  capacity integer not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  resource_id uuid references public.reservation_resources(id) on delete set null,
  customer_user_id uuid,
  starts_at timestamptz not null,
  ends_at timestamptz,
  party_size integer not null default 1,
  status text not null default 'pending',
  deposit_amount numeric(18,2) not null default 0,
  currency text not null default 'USD',
  payment_status text not null default 'unpaid',
  created_at timestamptz not null default now()
);

create table if not exists public.holomenu_touchpoints (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  location_id uuid,
  channel text not null check (channel in ('qr','nfc','web','holo','receipt','table','window','event')),
  token text not null unique,
  destination_path text not null,
  campaign_id uuid,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.business_inbox_items (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  item_type text not null,
  source text not null,
  reference_id text,
  priority text not null default 'normal',
  status text not null default 'open',
  subject text,
  body text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.verified_reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  user_id uuid not null,
  verification_type text not null,
  reference_id text not null,
  rating integer not null check (rating between 1 and 5),
  body text,
  fraud_status text not null default 'clear',
  business_reply text,
  created_at timestamptz not null default now(),
  unique (user_id, verification_type, reference_id)
);

create table if not exists public.business_academy_progress (
  user_id uuid not null,
  course_id text not null,
  lesson_id text not null,
  completed boolean not null default false,
  completed_at timestamptz,
  primary key (user_id, course_id, lesson_id)
);

create table if not exists public.revenue_opportunities (
  id uuid primary key default gen_random_uuid(),
  feature_id text not null,
  vertical text not null,
  revenue_category text not null,
  revenue_policy_id text,
  status text not null default 'identified',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists idx_holopass_events_user on public.holopass_events(user_id, created_at desc);
create index if not exists idx_affiliate_campaigns_business on public.affiliate_campaigns(business_id, status);
create index if not exists idx_reservations_business_time on public.reservations(business_id, starts_at);
create index if not exists idx_business_inbox on public.business_inbox_items(business_id, status, created_at desc);
create index if not exists idx_verified_reviews_business on public.verified_reviews(business_id, created_at desc);

alter table public.holopass_accounts enable row level security;
alter table public.holopass_events enable row level security;
alter table public.affiliate_campaigns enable row level security;
alter table public.affiliate_enrollments enable row level security;
alter table public.affiliate_conversions enable row level security;
alter table public.reservations enable row level security;
alter table public.business_inbox_items enable row level security;
alter table public.verified_reviews enable row level security;
