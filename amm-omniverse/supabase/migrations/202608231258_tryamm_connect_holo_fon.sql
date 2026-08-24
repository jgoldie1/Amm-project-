-- TRYAMM Connect / Holo Fon production-safe control plane.
-- Real carrier activation, eSIM provisioning, number porting, satellite traffic,
-- Lifeline reimbursement, and regulated telecom service remain provider-gated.
create table if not exists public.connectivity_providers (
  id uuid primary key default gen_random_uuid(), provider_key text unique not null, name text not null,
  provider_type text not null check (provider_type in ('carrier','mvno','wifi','fixed-wireless','satellite-ntn','esim-marketplace','affiliate','lifeline-referral')),
  service_regions text[] not null default '{}', capabilities text[] not null default '{}',
  integration_status text not null default 'candidate' check (integration_status in ('candidate','contract-required','sandbox','connected','degraded','disabled')),
  regulated boolean not null default true, metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.connectivity_market_readiness (
  id uuid primary key default gen_random_uuid(), market_code text unique not null, market_name text not null,
  status text not null default 'research' check (status in ('research','partner-needed','legal-review','pilot-ready','live','blocked')),
  mobile_voice boolean not null default false, mobile_data boolean not null default false, esim boolean not null default false,
  wifi boolean not null default true, fixed_wireless boolean not null default false, satellite_ntn boolean not null default false,
  lifeline_or_subsidy boolean not null default false, regulatory_notes text, metadata jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.holo_fon_lines (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null default 'Holo Fon', line_type text not null default 'personal' check (line_type in ('personal','family','creator','business','iot','assist')),
  provider_key text, esim_status text not null default 'not-provisioned' check (esim_status in ('not-provisioned','pending','active','suspended','cancelled')),
  phone_number_masked text, preferred_networks text[] not null default array['wifi','cellular'], satellite_fallback boolean not null default false,
  roaming_enabled boolean not null default false, status text not null default 'planning' check (status in ('planning','eligible','provisioning','active','suspended','closed')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.quantum_email_accounts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null, domain text not null default 'tryamm.online', security_mode text not null default 'pq-ready' check (security_mode in ('standard','enhanced','pq-ready')),
  translation_enabled boolean not null default true, hologpt_assist boolean not null default true,
  status text not null default 'reserved' check (status in ('reserved','active','suspended')), metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(handle,domain)
);
create table if not exists public.connectivity_dealer_applications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  market_code text not null, business_name text, role_type text not null default 'dealer' check (role_type in ('dealer','installer','support','repair','enterprise-sales','accessibility-specialist')),
  status text not null default 'submitted' check (status in ('submitted','review','approved','rejected','paused')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.connectivity_providers enable row level security;
alter table public.connectivity_market_readiness enable row level security;
alter table public.holo_fon_lines enable row level security;
alter table public.quantum_email_accounts enable row level security;
alter table public.connectivity_dealer_applications enable row level security;
revoke all on public.connectivity_providers from anon, authenticated;
revoke all on public.connectivity_market_readiness from anon, authenticated;
grant select on public.connectivity_providers to authenticated;
grant select on public.connectivity_market_readiness to authenticated;
grant select,insert,update,delete on public.holo_fon_lines to authenticated;
grant select,insert,update on public.quantum_email_accounts to authenticated;
grant select,insert,update on public.connectivity_dealer_applications to authenticated;
drop policy if exists connectivity_providers_authenticated_read on public.connectivity_providers;
drop policy if exists connectivity_market_authenticated_read on public.connectivity_market_readiness;
drop policy if exists holo_fon_owner_all on public.holo_fon_lines;
drop policy if exists quantum_email_owner_all on public.quantum_email_accounts;
drop policy if exists connectivity_dealer_owner_all on public.connectivity_dealer_applications;
create policy connectivity_providers_authenticated_read on public.connectivity_providers for select to authenticated using (true);
create policy connectivity_market_authenticated_read on public.connectivity_market_readiness for select to authenticated using (true);
create policy holo_fon_owner_all on public.holo_fon_lines for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy quantum_email_owner_all on public.quantum_email_accounts for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
create policy connectivity_dealer_owner_all on public.connectivity_dealer_applications for all to authenticated using (auth.uid()=user_id) with check (auth.uid()=user_id);
