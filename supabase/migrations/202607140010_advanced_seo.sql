create table if not exists public.seo_pages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  path text not null,
  title text not null,
  description text not null,
  canonical_url text not null,
  country text not null default 'US',
  locale text not null default 'en-US',
  robots text not null default 'index,follow',
  json_ld jsonb not null default '{}'::jsonb,
  open_graph jsonb not null default '{}'::jsonb,
  twitter_card jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_id,path)
);
create table if not exists public.backlink_opportunities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  target_url text not null,
  source_domain text not null,
  contact_name text,
  contact_email text,
  category text not null default 'creator-media',
  region text not null default 'global',
  authority_score integer not null default 0 check (authority_score between 0 and 100),
  relevance_score integer not null default 0 check (relevance_score between 0 and 100),
  status text not null default 'prospect' check (status in ('prospect','contacted','negotiating','earned','rejected','lost')),
  anchor_text text,
  relationship_type text not null default 'editorial',
  earned_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists seo_pages_owner_status_idx on public.seo_pages(owner_id,status);
create index if not exists backlink_owner_status_idx on public.backlink_opportunities(owner_id,status);
create index if not exists backlink_domain_idx on public.backlink_opportunities(source_domain);
alter table public.seo_pages enable row level security;
alter table public.backlink_opportunities enable row level security;
create policy "seo pages owner read" on public.seo_pages for select using (auth.uid()=owner_id);
create policy "seo pages owner write" on public.seo_pages for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "backlinks owner read" on public.backlink_opportunities for select using (auth.uid()=owner_id);
create policy "backlinks owner write" on public.backlink_opportunities for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);