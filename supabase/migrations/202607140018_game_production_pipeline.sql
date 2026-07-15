create table if not exists public.game_production_items (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('character','environment','animation','npc-tree','quest','audio','server','performance','qa','balance')),
  game_id text not null default 'shared',
  title text not null,
  description text not null default '',
  owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'backlog' check (status in ('backlog','briefed','in-production','review','approved','blocked','done')),
  priority text not null default 'medium' check (priority in ('low','medium','high','critical')),
  budget numeric(14,2) not null default 0,
  target_date date,
  acceptance jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_asset_versions (
  id uuid primary key default gen_random_uuid(),
  production_item_id uuid not null references public.game_production_items(id) on delete cascade,
  version integer not null default 1,
  storage_path text not null,
  format text not null,
  triangle_count integer,
  texture_memory_mb numeric(10,2),
  license_record jsonb not null default '{}'::jsonb,
  qa_status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(production_item_id,version)
);

create table if not exists public.game_test_runs (
  id uuid primary key default gen_random_uuid(),
  game_id text not null,
  test_type text not null,
  build_sha text,
  device_profile text,
  passed integer not null default 0,
  failed integer not null default 0,
  metrics jsonb not null default '{}'::jsonb,
  status text not null default 'queued',
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists game_production_items_status_idx on public.game_production_items(status,priority);
create index if not exists game_production_items_game_idx on public.game_production_items(game_id,category);
create index if not exists game_test_runs_game_idx on public.game_test_runs(game_id,test_type,created_at desc);

alter table public.game_production_items enable row level security;
alter table public.game_asset_versions enable row level security;
alter table public.game_test_runs enable row level security;

create policy "authenticated production read" on public.game_production_items for select to authenticated using (true);
create policy "owners manage production items" on public.game_production_items for all to authenticated using (owner_id=auth.uid()) with check (owner_id=auth.uid());
create policy "authenticated asset version read" on public.game_asset_versions for select to authenticated using (true);
create policy "authenticated test run read" on public.game_test_runs for select to authenticated using (true);
