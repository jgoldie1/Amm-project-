begin;

create table if not exists public.streetverse_business_registry (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  external_id text not null,
  legal_name text not null,
  doing_business_as text,
  address text,
  city text not null,
  region_id text not null,
  license_type text,
  license_status text,
  latitude double precision,
  longitude double precision,
  source_updated_at timestamptz,
  created_at timestamptz not null default now(),
  unique(source, external_id)
);

create table if not exists public.streetverse_business_claims (
  id uuid primary key default gen_random_uuid(),
  registry_id uuid not null references public.streetverse_business_registry(id) on delete cascade,
  claimant_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','verified','rejected','suspended')),
  verification_methods text[] not null default '{}',
  verification_evidence jsonb not null default '{}'::jsonb,
  verified_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(registry_id, claimant_user_id)
);

create table if not exists public.streetverse_storefronts (
  id uuid primary key default gen_random_uuid(),
  claim_id uuid not null unique references public.streetverse_business_claims(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  region_id text not null,
  status text not null default 'draft' check (status in ('draft','private-preview','open','paused')),
  display_name text not null,
  description text not null default '',
  categories text[] not null default '{}',
  hours jsonb not null default '{}'::jsonb,
  services jsonb not null default '[]'::jsonb,
  accessibility jsonb not null default '{}'::jsonb,
  customer_capacity integer not null default 10 check (customer_capacity between 1 and 10000),
  traffic_multiplier numeric(8,4) not null default 1 check (traffic_multiplier > 0),
  reputation numeric(6,2) not null default 50 check (reputation between 0 and 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.streetverse_storefront_staff (
  storefront_id uuid not null references public.streetverse_storefronts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  status text not null default 'active' check (status in ('invited','active','inactive')),
  created_at timestamptz not null default now(),
  primary key (storefront_id, user_id)
);

create table if not exists public.streetverse_careers (
  user_id uuid not null references auth.users(id) on delete cascade,
  region_id text not null,
  role text not null,
  xp bigint not null default 0 check (xp >= 0),
  reputation numeric(6,2) not null default 50 check (reputation between 0 and 100),
  rank text not null default 'trainee',
  completed_missions text[] not null default '{}',
  current_employer_storefront_id uuid references public.streetverse_storefronts(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, region_id, role)
);

alter table public.streetverse_business_registry enable row level security;
alter table public.streetverse_business_claims enable row level security;
alter table public.streetverse_storefronts enable row level security;
alter table public.streetverse_storefront_staff enable row level security;
alter table public.streetverse_careers enable row level security;

create policy "registry_public_read" on public.streetverse_business_registry
for select to authenticated using (true);

create policy "claims_own_read" on public.streetverse_business_claims
for select to authenticated using (auth.uid() = claimant_user_id);

create policy "claims_own_insert" on public.streetverse_business_claims
for insert to authenticated with check (auth.uid() = claimant_user_id and status = 'pending');

create policy "storefront_owner_read" on public.streetverse_storefronts
for select to authenticated using (auth.uid() = owner_user_id or status = 'open');

create policy "storefront_owner_write" on public.streetverse_storefronts
for all to authenticated using (auth.uid() = owner_user_id) with check (auth.uid() = owner_user_id);

create policy "storefront_staff_read" on public.streetverse_storefront_staff
for select to authenticated using (auth.uid() = user_id or exists (
  select 1 from public.streetverse_storefronts s where s.id = storefront_id and s.owner_user_id = auth.uid()
));

create policy "career_own_all" on public.streetverse_careers
for all to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists streetverse_business_registry_region_idx on public.streetverse_business_registry(region_id, city);
create index if not exists streetverse_business_registry_name_idx on public.streetverse_business_registry(lower(coalesce(doing_business_as, legal_name)));
create index if not exists streetverse_storefronts_region_status_idx on public.streetverse_storefronts(region_id, status);

commit;
