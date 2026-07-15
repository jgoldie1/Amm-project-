create table if not exists public.reusable_assets (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, type text not null, category text not null default 'general', source_url text, storage_path text, preview_url text,
  license text not null default 'restricted', license_url text, attribution text not null default '', creator text not null default '', tags text[] not null default '{}',
  version text not null default '1.0.0', status text not null default 'draft', reusable boolean not null default true, commercial_use boolean not null default false,
  derivatives_allowed boolean not null default false, engine_targets text[] not null default '{web}', fingerprint text not null, metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,fingerprint)
);
create table if not exists public.news_items (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null, summary text not null default '', section text not null, source_name text not null, source_url text not null, source_type text not null,
  author text not null default '', published_at timestamptz not null, observed_at timestamptz not null default now(), country text not null default 'US', region text not null default '', city text not null default '', language text not null default 'en',
  image_url text, license text not null default 'link-and-summary-only', attribution_required boolean not null default true, confidence numeric not null default .75,
  review_status text not null default 'pending', breaking boolean not null default false, emergency boolean not null default false, sponsored boolean not null default false,
  topics text[] not null default '{}', content_hash text not null, metadata jsonb not null default '{}', created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(owner_id,content_hash)
);
create table if not exists public.weather_snapshots (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  location text not null, latitude numeric, longitude numeric, provider text not null, observed_at timestamptz not null, timezone text not null default 'UTC',
  current_conditions jsonb not null default '{}', hourly jsonb not null default '[]', daily jsonb not null default '[]', alerts jsonb not null default '[]',
  attribution text not null default '', provider_url text, stale_after_minutes integer not null default 30, created_at timestamptz not null default now()
);
create index if not exists reusable_assets_owner_type_idx on public.reusable_assets(owner_id,type,status);
create index if not exists reusable_assets_tags_idx on public.reusable_assets using gin(tags);
create index if not exists news_items_owner_section_idx on public.news_items(owner_id,section,published_at desc);
create index if not exists news_items_location_idx on public.news_items(country,region,city,published_at desc);
create index if not exists news_items_topics_idx on public.news_items using gin(topics);
create index if not exists weather_snapshots_owner_location_idx on public.weather_snapshots(owner_id,location,observed_at desc);
alter table public.reusable_assets enable row level security;
alter table public.news_items enable row level security;
alter table public.weather_snapshots enable row level security;
drop policy if exists reusable_assets_owner_all on public.reusable_assets;
create policy reusable_assets_owner_all on public.reusable_assets for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists news_items_owner_all on public.news_items;
create policy news_items_owner_all on public.news_items for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists weather_snapshots_owner_all on public.weather_snapshots;
create policy weather_snapshots_owner_all on public.weather_snapshots for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);