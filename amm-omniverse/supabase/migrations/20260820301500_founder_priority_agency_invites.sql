create extension if not exists pgcrypto;

alter table public.tryamm_agencies add column if not exists priority_lane boolean not null default false;
alter table public.tryamm_agencies add column if not exists priority_reason text;

-- Tighten normal agency creation: clients may only create pending, non-priority agencies.
drop policy if exists "agency owner insert" on public.tryamm_agencies;
create policy "agency owner insert" on public.tryamm_agencies for insert to authenticated
with check (
  owner_user_id=(select auth.uid())
  and status='pending'
  and priority_lane=false
);

create table if not exists public.tryamm_founder_priority_invites (
  id uuid primary key default gen_random_uuid(),
  code_hash text not null unique,
  label text,
  note text,
  max_uses integer not null default 1 check (max_uses > 0 and max_uses <= 100),
  uses integer not null default 0 check (uses >= 0),
  expires_at timestamptz,
  active boolean not null default true,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table if not exists public.tryamm_founder_priority_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  invite_id uuid not null references public.tryamm_founder_priority_invites(id) on delete restrict,
  status text not null default 'available' check (status in ('available','used','revoked','expired')),
  granted_at timestamptz not null default now(),
  used_at timestamptz,
  agency_id uuid references public.tryamm_agencies(id) on delete set null,
  unique(user_id)
);

create index if not exists idx_priority_invites_active on public.tryamm_founder_priority_invites(active,expires_at);
create index if not exists idx_priority_entitlements_user on public.tryamm_founder_priority_entitlements(user_id,status);

alter table public.tryamm_founder_priority_invites enable row level security;
alter table public.tryamm_founder_priority_entitlements enable row level security;
revoke all on public.tryamm_founder_priority_invites from anon, authenticated;
revoke all on public.tryamm_founder_priority_entitlements from anon;
grant select on public.tryamm_founder_priority_entitlements to authenticated;

create policy "priority entitlement self select" on public.tryamm_founder_priority_entitlements
for select to authenticated using (user_id=(select auth.uid()));

comment on table public.tryamm_founder_priority_invites is 'Server-issued founder priority invites. Plain invite codes are never stored; only hashes. Issuance is restricted by server-side TRYAMM_FOUNDER_USER_ID.';
comment on table public.tryamm_founder_priority_entitlements is 'Lets a founder-approved user skip the ordinary agency waitlist only. Mandatory identity, age, tax, payment, telecom, security, sanctions and other compliance gates are not bypassed.';
