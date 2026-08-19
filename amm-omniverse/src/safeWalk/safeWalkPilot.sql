-- Safe Walk / Safe Ride pilot schema
-- Server-authoritative persistence for requests, dispatch, journey events, sponsorship and billing.

create table if not exists safe_journey_requests (
  id uuid primary key,
  account_id uuid not null,
  kind text not null check (kind in ('safe_walk','safe_ride')),
  pickup_label text not null,
  destination_label text not null,
  requested_at timestamptz not null default now(),
  scheduled_for timestamptz,
  accessibility_needs jsonb not null default '[]'::jsonb,
  trusted_contact_account_ids jsonb not null default '[]'::jsonb,
  jurisdiction_code text not null,
  state text not null,
  sponsor_program_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists safe_companion_profiles (
  id uuid primary key,
  account_id uuid not null unique,
  role text not null check (role in ('community_companion','driver','dispatcher')),
  available boolean not null default false,
  verified_for_pilot boolean not null default false,
  jurisdiction_codes jsonb not null default '[]'::jsonb,
  accessibility_capabilities jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists safe_dispatch_matches (
  id uuid primary key,
  journey_id uuid not null references safe_journey_requests(id) on delete cascade,
  companion_id uuid not null references safe_companion_profiles(id),
  matched_at timestamptz not null default now(),
  eta_minutes integer,
  status text not null check (status in ('proposed','accepted','declined','cancelled'))
);

create table if not exists safe_journey_events (
  id uuid primary key,
  journey_id uuid not null references safe_journey_requests(id) on delete cascade,
  occurred_at timestamptz not null default now(),
  type text not null check (type in ('status','location_ping','check_in','sos','incident','arrival_confirmation','billing')),
  public_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists safe_sponsor_programs (
  id uuid primary key,
  name text not null,
  sponsor_account_id uuid,
  jurisdiction_code text not null,
  funded_balance_minor bigint not null default 0,
  currency text not null default 'USD',
  active boolean not null default true,
  rules jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists safe_journey_billing (
  id uuid primary key,
  journey_id uuid not null unique references safe_journey_requests(id) on delete cascade,
  participant_charge_minor bigint not null default 0,
  sponsor_contribution_minor bigint not null default 0,
  companion_or_driver_payable_minor bigint not null default 0,
  platform_revenue_minor bigint not null default 0,
  safety_reserve_minor bigint not null default 0,
  processing_minor bigint not null default 0,
  currency text not null default 'USD',
  status text not null check (status in ('quoted','authorized','settled','refunded','voided')),
  created_at timestamptz not null default now(),
  settled_at timestamptz
);

create table if not exists safe_incidents (
  id uuid primary key,
  journey_id uuid not null references safe_journey_requests(id) on delete cascade,
  category text not null,
  severity text not null check (severity in ('low','medium','high','emergency')),
  status text not null check (status in ('open','triaged','escalated','resolved')),
  private_notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- Production requirements:
-- 1. Enable RLS on every table and create role-specific policies for rider/customer, companion/driver, dispatcher/admin, finance and safety review.
-- 2. Do not expose private incident notes or precise location history to ordinary clients.
-- 3. Billing settlement must be generated from trusted server/payment-provider events, not browser-provided values.
-- 4. Safe Ride driver eligibility, insurance, screening and local TNC/rideshare rules must be jurisdiction-verified before LIVE.
-- 5. Safe Walk remains accompaniment/check-in/de-escalation; it is not a vigilante or unlicensed armed-security service.
