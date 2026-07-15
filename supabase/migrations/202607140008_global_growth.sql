create table if not exists public.growth_campaigns (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null, region text not null default 'global', country text, language text not null default 'en', platforms text[] not null default '{}',
  trial_days integer not null default 30 check (trial_days in (7,14,30,60)), starts_at timestamptz not null default now(), ends_at timestamptz,
  max_redemptions integer, redemption_count integer not null default 0, status text not null default 'draft', created_at timestamptz not null default now()
);
create table if not exists public.referral_links (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  campaign_id uuid references public.growth_campaigns(id) on delete set null, code text not null unique, url text not null,
  country text, language text not null default 'en', status text not null default 'active', created_at timestamptz not null default now()
);
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id) on delete cascade,
  referral_code text not null, event_type text not null check (event_type in ('click','signup','trial-start','qualified-referral','paid-conversion','refund','chargeback')),
  country text, platform text, device_hash text, revenue_minor bigint not null default 0, currency text not null default 'USD',
  fraud_score integer not null default 0, fraud_status text not null default 'clear', metadata jsonb not null default '{}', created_at timestamptz not null default now()
);
create index if not exists referral_events_owner_created_idx on public.referral_events(owner_id,created_at desc);
create index if not exists referral_events_code_idx on public.referral_events(referral_code);
alter table public.growth_campaigns enable row level security;
alter table public.referral_links enable row level security;
alter table public.referral_events enable row level security;
create policy "owners manage growth campaigns" on public.growth_campaigns for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage referral links" on public.referral_links for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
create policy "owners manage referral events" on public.referral_events for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
