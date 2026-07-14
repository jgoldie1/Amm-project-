create table if not exists public.viral_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text not null default 'qualified-signups',
  audience text not null default '',
  region text not null default 'global',
  language text not null default 'en',
  platforms text[] not null default '{}',
  offer text not null default '',
  truthful_scarcity boolean not null default false,
  referral_code text not null,
  variant_count integer not null default 3 check (variant_count between 2 and 8),
  status text not null default 'draft',
  content_matrix jsonb not null default '[]',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.automation_events (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  provider text not null check (provider in ('zapier','discord','internal')),
  event_type text not null,
  idempotency_key text not null unique,
  status text not null default 'pending',
  payload jsonb not null default '{}',
  result jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists viral_campaigns_owner_status_idx on public.viral_campaigns(owner_id,status,created_at desc);
create index if not exists automation_events_owner_provider_idx on public.automation_events(owner_id,provider,created_at desc);
alter table public.viral_campaigns enable row level security;
alter table public.automation_events enable row level security;
drop policy if exists viral_campaigns_owner_all on public.viral_campaigns;
create policy viral_campaigns_owner_all on public.viral_campaigns for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
drop policy if exists automation_events_owner_read on public.automation_events;
create policy automation_events_owner_read on public.automation_events for select using (auth.uid()=owner_id);