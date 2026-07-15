create table if not exists public.crawler_sources (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  hostname text not null,
  category text not null default 'web',
  license text not null default 'unknown',
  crawl_interval_minutes integer not null default 1440 check (crawl_interval_minutes >= 60),
  robots_allowed boolean not null default false,
  status text not null default 'active' check (status in ('active','paused','blocked','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,url)
);
create table if not exists public.crawler_runs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_url text not null,
  status text not null check (status in ('queued','running','completed','failed','blocked')),
  pages_fetched integer not null default 0,
  records_created integer not null default 0,
  changed_records integer not null default 0,
  error_message text,
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz
);
create table if not exists public.oracle_records (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_id text not null,
  source_url text not null,
  category text not null default 'web',
  title text not null default '',
  description text not null default '',
  content_hash text not null,
  content text not null,
  confidence numeric(4,3) not null default .7 check (confidence between 0 and 1),
  license text not null default 'unknown',
  version text not null,
  status text not null default 'pending-review' check (status in ('pending-review','approved','rejected','expired')),
  provenance jsonb not null default '{}'::jsonb,
  changed boolean not null default true,
  observed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(owner_id,source_url,content_hash)
);
create index if not exists crawler_sources_owner_idx on public.crawler_sources(owner_id,status);
create index if not exists crawler_runs_owner_idx on public.crawler_runs(owner_id,started_at desc);
create index if not exists oracle_records_owner_idx on public.oracle_records(owner_id,observed_at desc);
create index if not exists oracle_records_source_idx on public.oracle_records(source_url,observed_at desc);
create index if not exists oracle_records_content_fts_idx on public.oracle_records using gin(to_tsvector('english',title||' '||description||' '||content));
alter table public.crawler_sources enable row level security;
alter table public.crawler_runs enable row level security;
alter table public.oracle_records enable row level security;
create policy "owners manage crawler sources" on public.crawler_sources for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners view crawler runs" on public.crawler_runs for select using (auth.uid()=owner_id);
create policy "owners manage oracle records" on public.oracle_records for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);