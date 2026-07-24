create extension if not exists pgcrypto;

create table if not exists public.business_directory_profiles (
  business_id uuid primary key references public.business_accounts(id) on delete cascade,
  black_owned_opt_in boolean not null default false,
  ownership_attestation boolean not null default false,
  verification_level text not null default 'self_attested',
  verification_status text not null default 'pending',
  certification_type text,
  certification_reference text,
  certification_expires_at timestamptz,
  featured boolean not null default false,
  directory_categories text[] not null default '{}',
  diaspora_regions text[] not null default '{}',
  country_codes text[] not null default '{}',
  search_keywords text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_directory_verification_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  event_type text not null,
  actor_user_id uuid,
  evidence jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_directory_black_owned
  on public.business_directory_profiles(black_owned_opt_in, verification_status, featured);

alter table public.business_directory_profiles enable row level security;
alter table public.business_directory_verification_events enable row level security;

-- Public discovery only exposes profiles explicitly opted in and approved.
drop policy if exists "directory_public_select" on public.business_directory_profiles;
create policy "directory_public_select"
on public.business_directory_profiles for select
using (black_owned_opt_in = true and verification_status in ('approved','self_attested_public'));
