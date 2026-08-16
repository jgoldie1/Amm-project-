-- Security hardening for legacy commerce/streaming routes.
-- Seller payout destinations are server-owned records; clients must never choose them.

create table if not exists public.creator_payout_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'stripe',
  provider_account_id text not null unique,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  verified_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.creator_payout_accounts enable row level security;

-- Users may see only the status of their own payout record. Writes are service-role only.
drop policy if exists creator_payout_accounts_read_own on public.creator_payout_accounts;
create policy creator_payout_accounts_read_own
on public.creator_payout_accounts for select
using (auth.uid() = user_id);

create index if not exists stream_events_user_track_created_idx
  on public.stream_events(user_id, track_id, created_at desc);

-- Add audit-friendly client request identifier where the table exists.
alter table if exists public.stream_events
  add column if not exists request_fingerprint text;
