create extension if not exists pgcrypto;

create table if not exists public.black_business_profiles (
  business_id uuid primary key,
  opted_in boolean not null default false,
  ownership_claim_status text not null default 'self_attested',
  verification_level text not null default 'self_attested',
  verification_notes text,
  city text,
  region text,
  country_code text not null default 'US',
  categories text[] not null default '{}',
  certifications text[] not null default '{}',
  capabilities text[] not null default '{}',
  service_area text,
  supplier_ready boolean not null default false,
  funding_ready boolean not null default false,
  active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procurement_opportunities (
  id uuid primary key default gen_random_uuid(),
  buyer_name text not null,
  title text not null,
  opportunity_type text not null default 'rfp',
  source_reference text,
  geography text,
  due_at timestamptz,
  categories text[] not null default '{}',
  requirements jsonb not null default '{}'::jsonb,
  eligibility_summary text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.procurement_matches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  opportunity_id uuid not null references public.procurement_opportunities(id) on delete cascade,
  match_score numeric(5,2) not null default 0,
  match_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  unique (business_id, opportunity_id)
);

create table if not exists public.funding_opportunities (
  id uuid primary key default gen_random_uuid(),
  provider_name text not null,
  title text not null,
  funding_type text not null default 'grant',
  source_reference text,
  geography text,
  deadline timestamptz,
  amount_min numeric(18,2),
  amount_max numeric(18,2),
  currency text not null default 'USD',
  eligibility_summary text,
  required_documents jsonb not null default '[]'::jsonb,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.funding_matches (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  funding_opportunity_id uuid not null references public.funding_opportunities(id) on delete cascade,
  match_score numeric(5,2) not null default 0,
  match_reasons jsonb not null default '[]'::jsonb,
  status text not null default 'suggested',
  created_at timestamptz not null default now(),
  unique (business_id, funding_opportunity_id)
);

create table if not exists public.supplier_exchange_listings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null,
  listing_type text not null check (listing_type in ('supply','request','wholesale','partnership')),
  title text not null,
  description text,
  categories text[] not null default '{}',
  minimum_order numeric(18,2),
  currency text not null default 'USD',
  countries_served text[] not null default '{}',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.black_business_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  campaign_type text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  cities text[] not null default '{}',
  countries text[] not null default '{}',
  sponsored boolean not null default false,
  placement_label text,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_black_business_profiles_location on public.black_business_profiles(country_code, region, city);
create index if not exists idx_procurement_opportunities_due on public.procurement_opportunities(status, due_at);
create index if not exists idx_funding_opportunities_deadline on public.funding_opportunities(status, deadline);
create index if not exists idx_supplier_exchange_listing_type on public.supplier_exchange_listings(status, listing_type);

alter table public.black_business_profiles enable row level security;
alter table public.procurement_opportunities enable row level security;
alter table public.procurement_matches enable row level security;
alter table public.funding_opportunities enable row level security;
alter table public.funding_matches enable row level security;
alter table public.supplier_exchange_listings enable row level security;
alter table public.black_business_campaigns enable row level security;

-- Policies must be tightened against the repository's business ownership/role tables during integration.
