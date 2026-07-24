create table if not exists public.omnicare_cases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'care-navigation',
  summary text not null default '',
  preferred_language text not null default 'en',
  accessibility_needs jsonb not null default '[]'::jsonb,
  urgency text not null default 'routine',
  status text not null default 'submitted',
  assigned_route text,
  licensed_partner_required boolean not null default true,
  ai_support_allowed boolean not null default true,
  ai_summary text,
  consent_snapshot jsonb not null default '{}'::jsonb,
  jurisdiction text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.omnicare_case_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.omnicare_cases(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.omnicare_appointments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.omnicare_cases(id) on delete cascade,
  provider_reference text,
  scheduled_for timestamptz,
  status text not null default 'requested',
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.omnicare_transport_requests (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.omnicare_cases(id) on delete cascade,
  mode text,
  status text not null default 'requested',
  pickup jsonb not null default '{}'::jsonb,
  destination jsonb not null default '{}'::jsonb,
  accessibility_needs jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.omnicare_documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.omnicare_cases(id) on delete cascade,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  storage_key text not null,
  document_type text,
  sensitivity text not null default 'sensitive',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.omnicare_partner_routes (
  id uuid primary key default gen_random_uuid(),
  partner_name text not null,
  service_domain text not null,
  jurisdiction text,
  licensure_status text not null default 'unverified',
  credential_reference text,
  active boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.omnicare_cases enable row level security;
alter table public.omnicare_case_events enable row level security;
alter table public.omnicare_appointments enable row level security;
alter table public.omnicare_transport_requests enable row level security;
alter table public.omnicare_documents enable row level security;

create policy if not exists "omnicare users read own cases" on public.omnicare_cases for select using (auth.uid() = user_id);
create policy if not exists "omnicare users create own cases" on public.omnicare_cases for insert with check (auth.uid() = user_id);
create policy if not exists "omnicare users update own cases" on public.omnicare_cases for update using (auth.uid() = user_id);

create policy if not exists "omnicare users read own events" on public.omnicare_case_events for select using (
  exists (select 1 from public.omnicare_cases c where c.id = case_id and c.user_id = auth.uid())
);
create policy if not exists "omnicare users read own appointments" on public.omnicare_appointments for select using (
  exists (select 1 from public.omnicare_cases c where c.id = case_id and c.user_id = auth.uid())
);
create policy if not exists "omnicare users read own transport" on public.omnicare_transport_requests for select using (
  exists (select 1 from public.omnicare_cases c where c.id = case_id and c.user_id = auth.uid())
);
create policy if not exists "omnicare users read own documents" on public.omnicare_documents for select using (auth.uid() = owner_user_id);
