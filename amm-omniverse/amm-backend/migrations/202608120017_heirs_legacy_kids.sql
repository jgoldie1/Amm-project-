-- Heirs & Legacy Kids framework.
-- This records family intentions, permissions, milestones and digital succession metadata.
-- It does NOT itself transfer legal title, trust assets, securities, real estate, or other regulated property.

create extension if not exists pgcrypto;

create table if not exists public.legacy_heirs (
  id uuid primary key default gen_random_uuid(),
  family_key text not null,
  person_user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  relationship text,
  generation integer not null default 1,
  age_lane text check (age_lane in ('child','teen','adult','unknown')) default 'unknown',
  status text not null default 'active' check (status in ('active','inactive','revoked','deceased')),
  guardian_required boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legacy_succession_plans (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  plan_type text not null default 'digital-legacy' check (plan_type in ('digital-legacy','business-continuity','ip-succession','education-fund','family-governance','trust-reference','estate-reference')),
  status text not null default 'draft' check (status in ('draft','review','active','superseded','revoked')),
  legal_document_reference text,
  requires_external_legal_validation boolean not null default true,
  instructions jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legacy_beneficiary_assignments (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.legacy_succession_plans(id) on delete cascade,
  heir_id uuid not null references public.legacy_heirs(id) on delete cascade,
  asset_category text not null,
  asset_reference text,
  share_percent numeric check (share_percent is null or (share_percent >= 0 and share_percent <= 100)),
  role text not null default 'beneficiary' check (role in ('beneficiary','successor-manager','custodian','advisor','observer')),
  release_conditions jsonb not null default '{}'::jsonb,
  human_approval_required boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_milestones (
  id uuid primary key default gen_random_uuid(),
  heir_id uuid not null references public.legacy_heirs(id) on delete cascade,
  milestone_type text not null check (milestone_type in ('age','education','certification','financial-literacy','business-training','service','custom')),
  title text not null,
  target_value jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','in-progress','completed','waived')),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.legacy_vault_items (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  item_type text not null check (item_type in ('letter','video','audio','book','business-plan','ip-record','credential','family-history','instruction','other')),
  storage_reference text,
  visibility text not null default 'private' check (visibility in ('private','family','heir-specific','public')),
  intended_heir_ids uuid[] not null default '{}',
  release_conditions jsonb not null default '{}'::jsonb,
  checksum text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.legacy_governance_actions (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references public.legacy_succession_plans(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action_type text not null,
  status text not null default 'proposed' check (status in ('proposed','approved','rejected','executed','cancelled')),
  approvals_required integer not null default 1 check (approvals_required >= 1),
  approvals jsonb not null default '[]'::jsonb,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.legacy_heirs enable row level security;
alter table public.legacy_succession_plans enable row level security;
alter table public.legacy_beneficiary_assignments enable row level security;
alter table public.legacy_milestones enable row level security;
alter table public.legacy_vault_items enable row level security;
alter table public.legacy_governance_actions enable row level security;

-- Direct client writes are intentionally restricted for succession records.
-- Owners can read their plans/vault; heir-linked records are exposed through trusted backend endpoints.
create policy "legacy plans owner read" on public.legacy_succession_plans for select using(owner_user_id=auth.uid());
create policy "legacy vault owner read" on public.legacy_vault_items for select using(owner_user_id=auth.uid());

create index if not exists legacy_heirs_user_idx on public.legacy_heirs(person_user_id,status);
create index if not exists legacy_assignments_plan_idx on public.legacy_beneficiary_assignments(plan_id,heir_id);
create index if not exists legacy_milestones_heir_idx on public.legacy_milestones(heir_id,status);
