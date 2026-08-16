-- Unified Holo Services

create table if not exists public.holo_search_documents (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  source_id text not null,
  title text not null,
  description text not null default '',
  tags text[] not null default '{}',
  world_slug text,
  location jsonb not null default '{}'::jsonb,
  searchable_text text generated always as (lower(title || ' ' || description)) stored,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_type,source_id)
);

create table if not exists public.holo_ride_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pickup jsonb not null,
  dropoff jsonb not null,
  ride_type text not null default 'standard',
  status text not null default 'requested' check (status in ('requested','matched','arriving','in-progress','completed','cancelled')),
  simulation boolean not null default true,
  fare_estimate_cents integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.holo_delivery_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  merchant_key text not null,
  pickup jsonb not null,
  dropoff jsonb not null,
  items jsonb not null default '[]'::jsonb,
  status text not null default 'placed' check (status in ('placed','accepted','picked-up','in-transit','delivered','cancelled')),
  simulation boolean not null default true,
  delivery_fee_cents integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.holo_logistics_jobs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  job_type text not null default 'freight',
  origin jsonb not null,
  destination jsonb not null,
  cargo jsonb not null default '{}'::jsonb,
  status text not null default 'planned' check (status in ('planned','dispatched','picked-up','in-transit','delivered','exception','cancelled')),
  simulation boolean not null default true,
  eta timestamptz,
  route_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.holo_ad_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  objective text not null default 'awareness',
  creative jsonb not null default '{}'::jsonb,
  audience jsonb not null default '{}'::jsonb,
  placements text[] not null default array['feed'],
  budget_cents integer not null default 0 check (budget_cents >= 0),
  status text not null default 'draft' check (status in ('draft','review','approved','active','paused','completed','rejected')),
  simulation boolean not null default true,
  metrics jsonb not null default '{"impressions":0,"clicks":0,"conversions":0}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo_builder_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  builder_type text not null check (builder_type in ('world','app','storefront','ad','experience','workflow','agent')),
  status text not null default 'draft' check (status in ('draft','building','testing','published','archived')),
  spec jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo_safety_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  severity text not null default 'low' check (severity in ('low','medium','high','critical')),
  source text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table if not exists public.holo_translation_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  source_locale text not null,
  target_locale text not null,
  source_text text not null,
  translated_text text,
  status text not null default 'prepared' check (status in ('prepared','translated','human-review','approved','rejected')),
  high_risk boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.holoverse_portals (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  destination_type text not null check (destination_type in ('world','service','event','store','experience')),
  destination_key text not null,
  age_lane text not null default 'all',
  enabled boolean not null default true,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.holo_search_documents enable row level security;
alter table public.holo_ride_requests enable row level security;
alter table public.holo_delivery_orders enable row level security;
alter table public.holo_logistics_jobs enable row level security;
alter table public.holo_ad_campaigns enable row level security;
alter table public.holo_builder_projects enable row level security;
alter table public.holo_safety_events enable row level security;
alter table public.holo_translation_jobs enable row level security;
alter table public.holoverse_portals enable row level security;

create policy "public search holo documents" on public.holo_search_documents for select using (true);
create policy "users manage own ride requests" on public.holo_ride_requests for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users manage own delivery orders" on public.holo_delivery_orders for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "users manage own logistics jobs" on public.holo_logistics_jobs for all using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "users manage own ad campaigns" on public.holo_ad_campaigns for all using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "users manage own builder projects" on public.holo_builder_projects for all using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "users read own safety events" on public.holo_safety_events for select using ((select auth.uid())=user_id);
create policy "users create own safety events" on public.holo_safety_events for insert with check ((select auth.uid())=user_id);
create policy "users manage own translation jobs" on public.holo_translation_jobs for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create policy "public read enabled holoverse portals" on public.holoverse_portals for select using (enabled=true);

insert into public.holoverse_portals(slug,name,destination_type,destination_key,age_lane) values
('holo-search','Holo Search','service','holo-search','all'),
('holo-ride','Holo Ride','service','holo-ride','adult'),
('holo-delivery','Holo Delivery','service','holo-delivery','adult'),
('holo-logistics','Holo Logistics','service','holo-logistics','adult'),
('holo-advertise','Holo Advertise','service','holo-advertise','adult'),
('holo-lingo','Holo Lingo','service','holo-lingo','all'),
('holo-access','Holo Access','service','holo-access','all'),
('holo-guardian','Holo Guardian','service','holo-guardian','all'),
('holo-builder','Holo Builder','service','holo-builder','teen-plus'),
('ai-cafe','AI Cafe','service','ai-cafe','all'),
('kingdoms-press','Kingdoms Press','service','kingdoms-press','all'),
('immersive-worlds','Immersive Worlds','experience','immersive-worlds','all')
on conflict(slug) do update set name=excluded.name,destination_type=excluded.destination_type,destination_key=excluded.destination_key,age_lane=excluded.age_lane,enabled=true;

insert into public.holo_search_documents(source_type,source_id,title,description,tags,world_slug) values
('service','holo-search','Holo Search','Search across worlds, businesses, creators, books, games, learning and services.',array['search','discovery'],null),
('service','holo-ride','Holo Ride','Rideshare simulation and future dispatch service.',array['ride','transportation'],'life-city'),
('service','holo-delivery','Holo Delivery','Local delivery simulation for food, marketplace and business orders.',array['delivery','courier'],'life-city'),
('service','holo-logistics','Holo Logistics','Freight, warehousing, dispatch and supply-chain simulation.',array['logistics','freight','warehouse'],'workforce'),
('service','holo-advertise','Holo Advertise','Campaign builder for feed, world, live, creator and holographic placements.',array['advertising','marketing'],null),
('service','kingdoms-press','Kingdoms Press','Publishing, editorial, rights, readings and Living Books.',array['books','publishing'],null),
('service','ai-cafe','AI Cafe','Coffee, food, Creator Tables, learning and business operations.',array['coffee','food','creator','business'],null)
on conflict(source_type,source_id) do update set title=excluded.title,description=excluded.description,tags=excluded.tags,world_slug=excluded.world_slug;
