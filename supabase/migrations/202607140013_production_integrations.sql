create table if not exists public.integration_events (
  id uuid primary key default gen_random_uuid(), event_key text not null unique, provider text not null, event_type text not null,
  provider_event_id text, provider_reference text, owner_id uuid references auth.users(id) on delete set null,
  status text not null default 'received', amount_minor bigint not null default 0, currency text not null default 'USD', payload jsonb not null default '{}',
  processed_at timestamptz, error_message text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.user_entitlements (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null, plan text, tokens bigint not null default 0, status text not null default 'active', provider text not null,
  provider_reference text not null, starts_at timestamptz not null default now(), ends_at timestamptz, metadata jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(provider,provider_reference,type)
);
create table if not exists public.meshy_jobs (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  provider_task_id text not null unique, provider text not null default 'live', status text not null default 'PENDING', asset_type text not null default 'avatar',
  prompt text not null, model_urls jsonb not null default '{}', thumbnail_url text, reusable_asset_id uuid references public.reusable_assets(id) on delete set null,
  license_status text not null default 'pending-review', originality_status text not null default 'pending-review', error_message text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create index if not exists integration_events_provider_idx on public.integration_events(provider,created_at desc);
create index if not exists entitlements_owner_idx on public.user_entitlements(owner_id,status,created_at desc);
create index if not exists meshy_jobs_owner_idx on public.meshy_jobs(owner_id,status,created_at desc);
alter table public.integration_events enable row level security;
alter table public.user_entitlements enable row level security;
alter table public.meshy_jobs enable row level security;
drop policy if exists integration_events_owner_read on public.integration_events;
create policy integration_events_owner_read on public.integration_events for select using (auth.uid()=owner_id);
drop policy if exists user_entitlements_owner_read on public.user_entitlements;
create policy user_entitlements_owner_read on public.user_entitlements for select using (auth.uid()=owner_id);
drop policy if exists meshy_jobs_owner_all on public.meshy_jobs;
create policy meshy_jobs_owner_all on public.meshy_jobs for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);