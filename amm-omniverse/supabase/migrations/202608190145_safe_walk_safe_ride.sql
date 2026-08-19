create table if not exists public.safe_journeys (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  kind text not null check (kind in ('safe_walk','safe_ride')),
  pickup_label text not null,
  destination_label text not null,
  jurisdiction_code text not null,
  state text not null default 'requested',
  scheduled_for timestamptz,
  accessibility_needs jsonb not null default '[]'::jsonb,
  trusted_contact_account_ids jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safe_companions (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  role text not null check (role in ('community_companion','driver','dispatcher')),
  available boolean not null default false,
  verified_for_pilot boolean not null default false,
  jurisdiction_codes jsonb not null default '[]'::jsonb,
  accessibility_capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.safe_dispatch_matches (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.safe_journeys(id) on delete cascade,
  companion_id uuid not null references public.safe_companions(id),
  status text not null check (status in ('proposed','accepted','declined','cancelled')),
  eta_minutes integer,
  matched_at timestamptz not null default now()
);

create table if not exists public.safe_journey_events (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.safe_journeys(id) on delete cascade,
  event_type text not null check (event_type in ('status','location_ping','check_in','sos','incident','arrival_confirmation','billing')),
  public_message text,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.safe_journey_billing (
  id uuid primary key default gen_random_uuid(),
  journey_id uuid not null references public.safe_journeys(id) on delete cascade,
  currency text not null default 'USD',
  total_minor integer not null check (total_minor >= 0),
  platform_minor integer not null check (platform_minor >= 0),
  companion_or_driver_minor integer not null check (companion_or_driver_minor >= 0),
  safety_reserve_minor integer not null check (safety_reserve_minor >= 0),
  processing_minor integer not null check (processing_minor >= 0),
  community_or_referral_minor integer not null default 0 check (community_or_referral_minor >= 0),
  payment_state text not null default 'sandbox' check (payment_state in ('sandbox','pending','authorized','captured','refunded','failed')),
  created_at timestamptz not null default now()
);

alter table public.safe_journeys enable row level security;
alter table public.safe_companions enable row level security;
alter table public.safe_dispatch_matches enable row level security;
alter table public.safe_journey_events enable row level security;
alter table public.safe_journey_billing enable row level security;

-- Policies intentionally omitted from this migration until the canonical account/role claims are wired.
-- Pilot gate: do not expose these tables directly to unauthenticated clients.
