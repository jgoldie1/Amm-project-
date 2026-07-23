-- TryAMM Asset Vault + Digital DNA + HoloMarket durable schema
-- Security-first baseline for Supabase/Postgres.

create extension if not exists pgcrypto;

create table if not exists public.asset_dna_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid,
  exact_hash text not null,
  perceptual_hash text,
  parent_dna_id uuid references public.asset_dna_records(id) on delete set null,
  version text not null default '1.0.0',
  rights_signature jsonb not null default '{}'::jsonb,
  ai_disclosure jsonb not null default '{}'::jsonb,
  provenance_checked boolean not null default false,
  ownership_checked boolean not null default false,
  status text not null default 'pending' check (status in ('pending','verified','disputed','revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id, exact_hash)
);

create table if not exists public.asset_vault_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  dna_id uuid references public.asset_dna_records(id) on delete restrict,
  name text not null,
  asset_type text not null,
  description text not null default '',
  tags text[] not null default '{}',
  version text not null default '1.0.0',
  parent_asset_id uuid references public.asset_vault_assets(id) on delete set null,
  source_path text,
  preview_path text,
  content_hash text,
  ai_disclosure jsonb not null default '{}'::jsonb,
  rights jsonb not null default '{}'::jsonb,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected','restricted')),
  status text not null default 'draft' check (status in ('draft','published','archived','recalled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.asset_dna_records
  add constraint asset_dna_records_asset_fk
  foreign key (asset_id) references public.asset_vault_assets(id) on delete set null deferrable initially deferred;

create table if not exists public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  dna_id uuid references public.asset_dna_records(id) on delete restrict,
  version text not null,
  source_path text,
  preview_path text,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(asset_id, version)
);

create table if not exists public.asset_lineage (
  id uuid primary key default gen_random_uuid(),
  parent_asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  child_asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  relationship text not null default 'derived',
  created_at timestamptz not null default now(),
  unique(parent_asset_id, child_asset_id)
);

create table if not exists public.asset_licenses (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  terms jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.asset_licenses (code,name,terms)
values
('personal','Personal', '{"commercial":false,"source_resale":false}'::jsonb),
('commercial-standard','Commercial Standard', '{"commercial":true,"source_resale":false}'::jsonb),
('extended','Extended', '{"commercial":true,"scale":"extended","source_resale":false}'::jsonb),
('subscription-library','Subscription Library', '{"commercial":true,"subscription_required":true,"model_training":false}'::jsonb)
on conflict (code) do nothing;

create table if not exists public.asset_marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  seller_id uuid not null references auth.users(id) on delete cascade,
  license_id uuid not null references public.asset_licenses(id) on delete restrict,
  title text not null,
  price_cents integer not null check (price_cents >= 0),
  currency text not null default 'USD',
  status text not null default 'draft' check (status in ('draft','active','paused','removed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.asset_entitlements (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.asset_marketplace_listings(id) on delete restrict,
  asset_id uuid not null references public.asset_vault_assets(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete cascade,
  license_id uuid not null references public.asset_licenses(id) on delete restrict,
  payment_reference text,
  status text not null default 'active' check (status in ('active','refunded','revoked','expired')),
  granted_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.asset_usage_events (
  id uuid primary key default gen_random_uuid(),
  entitlement_id uuid references public.asset_entitlements(id) on delete set null,
  asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  dna_id uuid references public.asset_dna_records(id) on delete set null,
  user_id uuid references auth.users(id) on delete set null,
  project_id text,
  surface text,
  version text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.asset_takedowns (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  dna_id uuid references public.asset_dna_records(id) on delete set null,
  opened_by uuid references auth.users(id) on delete set null,
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','under-review','upheld','rejected','resolved')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.asset_payout_splits (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.asset_vault_assets(id) on delete cascade,
  payee_id uuid not null references auth.users(id) on delete cascade,
  basis_points integer not null check (basis_points between 0 and 10000),
  role text,
  created_at timestamptz not null default now(),
  unique(asset_id, payee_id)
);

create index if not exists idx_asset_dna_owner on public.asset_dna_records(owner_id);
create index if not exists idx_asset_dna_hash on public.asset_dna_records(exact_hash);
create index if not exists idx_asset_dna_parent on public.asset_dna_records(parent_dna_id);
create index if not exists idx_asset_vault_owner on public.asset_vault_assets(owner_id);
create index if not exists idx_asset_vault_dna on public.asset_vault_assets(dna_id);
create index if not exists idx_asset_listing_seller on public.asset_marketplace_listings(seller_id);
create index if not exists idx_asset_entitlement_buyer on public.asset_entitlements(buyer_id);
create index if not exists idx_asset_usage_asset on public.asset_usage_events(asset_id);
create index if not exists idx_asset_usage_user on public.asset_usage_events(user_id);

alter table public.asset_dna_records enable row level security;
alter table public.asset_vault_assets enable row level security;
alter table public.asset_versions enable row level security;
alter table public.asset_lineage enable row level security;
alter table public.asset_licenses enable row level security;
alter table public.asset_marketplace_listings enable row level security;
alter table public.asset_entitlements enable row level security;
alter table public.asset_usage_events enable row level security;
alter table public.asset_takedowns enable row level security;
alter table public.asset_payout_splits enable row level security;

-- Public catalog reads are allowed only for published/active catalog records.
create policy "public can view published assets" on public.asset_vault_assets
for select to anon, authenticated
using (status = 'published' and moderation_status = 'approved');

create policy "owners can view own assets" on public.asset_vault_assets
for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can insert own assets" on public.asset_vault_assets
for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update own assets" on public.asset_vault_assets
for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "owners can view own dna" on public.asset_dna_records
for select to authenticated
using ((select auth.uid()) = owner_id);

create policy "owners can insert own dna" on public.asset_dna_records
for insert to authenticated
with check ((select auth.uid()) = owner_id);

create policy "owners can update own dna" on public.asset_dna_records
for update to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy "public can view active licenses" on public.asset_licenses
for select to anon, authenticated
using (active = true);

create policy "public can view active listings" on public.asset_marketplace_listings
for select to anon, authenticated
using (status = 'active');

create policy "sellers can manage own listings" on public.asset_marketplace_listings
for all to authenticated
using ((select auth.uid()) = seller_id)
with check ((select auth.uid()) = seller_id);

create policy "buyers can view own entitlements" on public.asset_entitlements
for select to authenticated
using ((select auth.uid()) = buyer_id);

create policy "owners can view versions" on public.asset_versions
for select to authenticated
using (exists (select 1 from public.asset_vault_assets a where a.id = asset_id and a.owner_id = (select auth.uid())));

create policy "owners can manage versions" on public.asset_versions
for all to authenticated
using (exists (select 1 from public.asset_vault_assets a where a.id = asset_id and a.owner_id = (select auth.uid())))
with check (exists (select 1 from public.asset_vault_assets a where a.id = asset_id and a.owner_id = (select auth.uid())));

create policy "owners can view lineage" on public.asset_lineage
for select to authenticated
using (exists (select 1 from public.asset_vault_assets a where (a.id = parent_asset_id or a.id = child_asset_id) and a.owner_id = (select auth.uid())));

create policy "owners can view own usage" on public.asset_usage_events
for select to authenticated
using ((select auth.uid()) = user_id or exists (select 1 from public.asset_vault_assets a where a.id = asset_id and a.owner_id = (select auth.uid())));

create policy "users can insert own usage" on public.asset_usage_events
for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "users can open takedowns" on public.asset_takedowns
for insert to authenticated
with check ((select auth.uid()) = opened_by);

create policy "users can view own takedowns" on public.asset_takedowns
for select to authenticated
using ((select auth.uid()) = opened_by or exists (select 1 from public.asset_vault_assets a where a.id = asset_id and a.owner_id = (select auth.uid())));

create policy "payees can view own splits" on public.asset_payout_splits
for select to authenticated
using ((select auth.uid()) = payee_id);

-- Backend service-role workflows perform moderated publication, entitlement grants,
-- payout operations, duplicate scans, and takedown propagation. Never expose the
-- service role key to clients.

-- Publication integrity check: active listings require a verified DNA record and approved/published asset.
create or replace function public.validate_asset_listing_integrity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  a public.asset_vault_assets;
  d public.asset_dna_records;
begin
  select * into a from public.asset_vault_assets where id = new.asset_id;
  if a.id is null then raise exception 'ASSET_NOT_FOUND'; end if;
  if a.owner_id <> new.seller_id then raise exception 'SELLER_NOT_OWNER'; end if;
  if a.status <> 'published' or a.moderation_status <> 'approved' then raise exception 'ASSET_NOT_PUBLISHABLE'; end if;
  if a.dna_id is null then raise exception 'DNA_RECORD_REQUIRED'; end if;
  select * into d from public.asset_dna_records where id = a.dna_id;
  if d.id is null or d.provenance_checked is not true or d.ownership_checked is not true or d.status <> 'verified' then
    raise exception 'DNA_ATTESTATION_REQUIRED';
  end if;
  return new;
end;
$$;

revoke all on function public.validate_asset_listing_integrity() from public;
grant execute on function public.validate_asset_listing_integrity() to authenticated, service_role;

drop trigger if exists trg_validate_asset_listing_integrity on public.asset_marketplace_listings;
create trigger trg_validate_asset_listing_integrity
before insert or update of status, asset_id, seller_id on public.asset_marketplace_listings
for each row
when (new.status = 'active')
execute function public.validate_asset_listing_integrity();
