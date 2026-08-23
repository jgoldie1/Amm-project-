create extension if not exists pgcrypto;

create table if not exists public.jacobie_property_comps (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  address_text text,
  source_name text,
  source_url text,
  source_checked_at timestamptz,
  sale_price numeric,
  sale_date date,
  square_feet numeric,
  bedrooms numeric,
  bathrooms numeric,
  distance_miles numeric,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.jacobie_rehab_budget_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  category text not null,
  description text not null,
  estimated_cost numeric not null default 0,
  approved_cost numeric,
  actual_cost numeric,
  contingency boolean not null default false,
  vendor_reference text,
  status text not null default 'planned' check(status in ('planned','quoted','approved','in-progress','completed','cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jacobie_property_media (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  media_type text not null check(media_type in ('photo','video','3d-scan','digital-twin','floorplan','document')),
  stage text not null default 'before' check(stage in ('before','during','after','listing')),
  storage_url text,
  privacy_reviewed boolean not null default false,
  pii_redacted boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.jacobie_holo_listings (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check(status in ('draft','review','published','paused','archived')),
  tour_asset_url text,
  marketplace_url text,
  feature_hotspots jsonb not null default '[]'::jsonb,
  staging_plan jsonb not null default '{}'::jsonb,
  marketing_copy text,
  approved_by_qualified_professional boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jacobie_flip_tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  workstream text not null check(workstream in ('comps','deal','construction','docs','media','scan3d','holo','marketing','security','admin')),
  title text not null,
  assigned_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check(status in ('open','assigned','submitted','approved','rejected','completed')),
  evidence_refs jsonb not null default '[]'::jsonb,
  supervisor_user_id uuid references auth.users(id) on delete set null,
  supervisor_approved boolean not null default false,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jacobie_property_security_reviews (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  classification text not null default 'internal' check(classification in ('public','internal','confidential','restricted')),
  access_review jsonb not null default '{}'::jsonb,
  pii_findings jsonb not null default '[]'::jsonb,
  redaction_status text not null default 'not-started' check(redaction_status in ('not-started','in-progress','complete')),
  audit_notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.jacobie_regulated_service_referrals (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.jacobie_real_estate_projects(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  service_type text not null check(service_type in ('brokerage','appraisal','lending','contracting','inspection','legal')),
  professional_name text,
  organization_name text,
  credential_reference text,
  jurisdiction text,
  verification_status text not null default 'pending' check(verification_status in ('pending','verified','rejected','expired')),
  scope text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jacobie_property_comps enable row level security;
alter table public.jacobie_rehab_budget_items enable row level security;
alter table public.jacobie_property_media enable row level security;
alter table public.jacobie_holo_listings enable row level security;
alter table public.jacobie_flip_tasks enable row level security;
alter table public.jacobie_property_security_reviews enable row level security;
alter table public.jacobie_regulated_service_referrals enable row level security;

create policy "jacobie comps own" on public.jacobie_property_comps for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie rehab own" on public.jacobie_rehab_budget_items for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie media own" on public.jacobie_property_media for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie holo own" on public.jacobie_holo_listings for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie tasks own" on public.jacobie_flip_tasks for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie security own" on public.jacobie_property_security_reviews for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
create policy "jacobie referrals own" on public.jacobie_regulated_service_referrals for all using(owner_user_id=auth.uid()) with check(owner_user_id=auth.uid());
