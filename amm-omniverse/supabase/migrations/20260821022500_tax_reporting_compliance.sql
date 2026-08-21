create table if not exists public.tax_payee_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 payee_type text not null check(payee_type in ('employee','contractor','prize-recipient','royalty-recipient','other-review')),
 legal_name text not null, mailing_address jsonb not null default '{}'::jsonb,
 tax_provider_ref text, tin_last4 text, electronic_delivery_consent boolean not null default false,
 delivery_preference text not null default 'secure-portal', updated_at timestamptz not null default now());
create table if not exists public.tax_reporting_records (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id), tax_year integer not null,
 form_type text not null, payment_category text not null, reportable_amount_cents bigint not null default 0,
 federal_withholding_cents bigint not null default 0, state_data jsonb not null default '{}'::jsonb,
 state text not null default 'draft' check(state in ('draft','review','approved','filed','accepted','rejected','corrected','void')),
 filing_provider_ref text, filed_at timestamptz, created_at timestamptz not null default now(), unique(user_id,tax_year,form_type,payment_category));
create table if not exists public.tax_document_deliveries (
 id uuid primary key default gen_random_uuid(), reporting_record_id uuid not null references public.tax_reporting_records(id) on delete cascade,
 method text not null check(method in ('secure-portal','electronic-consent','postal-mail')),
 destination_masked text, state text not null default 'pending', provider_ref text, furnished_at timestamptz,
 evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
create table if not exists public.compliance_review_cases (
 id uuid primary key default gen_random_uuid(), subject_type text not null, subject_ref text not null, issue text not null,
 ai_summary text, authority_refs jsonb not null default '[]'::jsonb, human_review_required boolean not null default true,
 state text not null default 'open', reviewer_ref text, decision text, created_at timestamptz not null default now(), resolved_at timestamptz);
alter table public.tax_payee_profiles enable row level security; alter table public.tax_reporting_records enable row level security; alter table public.tax_document_deliveries enable row level security; alter table public.compliance_review_cases enable row level security;
revoke all on public.tax_payee_profiles from anon; revoke all on public.tax_reporting_records from anon; revoke all on public.tax_document_deliveries from anon; revoke all on public.compliance_review_cases from anon;
create policy "payee reads profile" on public.tax_payee_profiles for select to authenticated using((select auth.uid())=user_id);
create policy "payee reads tax records" on public.tax_reporting_records for select to authenticated using((select auth.uid())=user_id);
create policy "payee reads deliveries" on public.tax_document_deliveries for select to authenticated using(exists(select 1 from public.tax_reporting_records r where r.id=reporting_record_id and r.user_id=(select auth.uid())));
-- Sensitive TIN collection, classification changes, filing, corrections and delivery writes are trusted payroll/tax-service operations only.
