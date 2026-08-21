create table if not exists public.field_service_providers (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 provider_type text not null check(provider_type in ('worker','independent-provider','business-owner','agency','franchise-partner')),
 business_name text, service_lanes text[] not null default '{}'::text[], verification_state text not null default 'pending',
 training_state jsonb not null default '{}'::jsonb, insurance_state jsonb not null default '{}'::jsonb, equipment_state jsonb not null default '{}'::jsonb,
 service_territories text[] not null default '{}'::text[], reputation_score numeric not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(user_id,provider_type,business_name));

create table if not exists public.field_service_jobs (
 id uuid primary key default gen_random_uuid(), client_user_id uuid references auth.users(id), provider_id uuid references public.field_service_providers(id),
 lane_id text not null, title text not null, scope jsonb not null default '{}'::jsonb, location jsonb not null default '{}'::jsonb,
 qualification_requirements jsonb not null default '{}'::jsonb, aviation_required boolean not null default false,
 aviation_approval_evidence jsonb not null default '{}'::jsonb, status text not null default 'lead' check(status in ('lead','open','matched','scheduled','in-progress','quality-review','client-review','accepted','invoiced','paid','cancelled','disputed')),
 price_cents bigint check(price_cents is null or price_cents>=0), currency text not null default 'USD', created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.field_service_evidence (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.field_service_jobs(id) on delete cascade,
 uploaded_by uuid not null references auth.users(id), evidence_type text not null, object_ref text not null, metadata jsonb not null default '{}'::jsonb,
 sha256 text, captured_at timestamptz, created_at timestamptz not null default now());

create table if not exists public.field_service_reviews (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.field_service_jobs(id) on delete cascade,
 reviewer_user_id uuid references auth.users(id), quality_state text not null default 'pending', findings jsonb not null default '{}'::jsonb,
 client_acceptance_state text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table if not exists public.field_service_payouts (
 id uuid primary key default gen_random_uuid(), job_id uuid not null references public.field_service_jobs(id), provider_id uuid not null references public.field_service_providers(id),
 amount_cents bigint not null check(amount_cents>=0), currency text not null default 'USD', state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 idempotency_key text not null unique, provider_ref text, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.field_service_providers enable row level security; alter table public.field_service_jobs enable row level security; alter table public.field_service_evidence enable row level security; alter table public.field_service_reviews enable row level security; alter table public.field_service_payouts enable row level security;
revoke all on public.field_service_providers from anon; revoke all on public.field_service_jobs from anon; revoke all on public.field_service_evidence from anon; revoke all on public.field_service_reviews from anon; revoke all on public.field_service_payouts from anon;
create policy "provider reads self" on public.field_service_providers for select to authenticated using((select auth.uid())=user_id);
create policy "provider creates self" on public.field_service_providers for insert to authenticated with check((select auth.uid())=user_id);
create policy "job parties read" on public.field_service_jobs for select to authenticated using((select auth.uid())=client_user_id or exists(select 1 from public.field_service_providers p where p.id=provider_id and p.user_id=(select auth.uid())));
create policy "evidence uploader reads" on public.field_service_evidence for select to authenticated using((select auth.uid())=uploaded_by or exists(select 1 from public.field_service_jobs j left join public.field_service_providers p on p.id=j.provider_id where j.id=job_id and (j.client_user_id=(select auth.uid()) or p.user_id=(select auth.uid()))));
create policy "provider reads payout" on public.field_service_payouts for select to authenticated using(exists(select 1 from public.field_service_providers p where p.id=provider_id and p.user_id=(select auth.uid())));
-- Matching, qualification unlocks, aviation approvals, quality finalization and payout writes remain trusted-server/admin operations.
