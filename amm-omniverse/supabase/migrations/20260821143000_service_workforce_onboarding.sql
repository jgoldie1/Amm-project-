create table if not exists public.tryamm_role_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null,
  status text not null default 'draft' check(status in ('draft','submitted','review','ready','active','suspended','rejected')),
  profile jsonb not null default '{}'::jsonb,
  verification jsonb not null default '{}'::jsonb,
  tax_payroll_state jsonb not null default '{}'::jsonb,
  payout_state jsonb not null default '{}'::jsonb,
  training_state jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, role_key)
);
create table if not exists public.tryamm_role_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role_key text not null,
  evidence_type text not null,
  reference text,
  metadata jsonb not null default '{}'::jsonb,
  state text not null default 'submitted' check(state in ('submitted','verified','rejected','expired')),
  verified_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists public.tryamm_tax_filing_readiness (
  user_id uuid primary key references auth.users(id) on delete cascade,
  taxpayer_onboarding_state text not null default 'not-started',
  worker_classification text,
  federal_state text not null default 'not-ready',
  ssa_state text not null default 'not-ready',
  state_local_state text not null default 'not-ready',
  provider text,
  provider_account_ref text,
  evidence jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.tryamm_role_profiles enable row level security;
alter table public.tryamm_role_evidence enable row level security;
alter table public.tryamm_tax_filing_readiness enable row level security;
revoke all on public.tryamm_role_profiles from anon; revoke all on public.tryamm_role_evidence from anon; revoke all on public.tryamm_tax_filing_readiness from anon;
create policy "user reads roles" on public.tryamm_role_profiles for select to authenticated using ((select auth.uid())=user_id);
create policy "user creates roles" on public.tryamm_role_profiles for insert to authenticated with check ((select auth.uid())=user_id);
create policy "user updates draft roles" on public.tryamm_role_profiles for update to authenticated using ((select auth.uid())=user_id and status in ('draft','submitted')) with check ((select auth.uid())=user_id);
create policy "user reads evidence" on public.tryamm_role_evidence for select to authenticated using ((select auth.uid())=user_id);
create policy "user submits evidence" on public.tryamm_role_evidence for insert to authenticated with check ((select auth.uid())=user_id);
create policy "user reads filing readiness" on public.tryamm_tax_filing_readiness for select to authenticated using ((select auth.uid())=user_id);
-- Verification, activation, payroll/tax filing state transitions and provider acknowledgements are trusted-server/admin operations only.
