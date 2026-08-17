create extension if not exists pgcrypto;

create table if not exists public.ops_workflows(
 id uuid primary key default gen_random_uuid(), owner_user_id uuid references auth.users(id) on delete cascade,
 domain text not null, workflow_type text not null, status text not null default 'created', risk_band text not null default 'green',
 input jsonb not null default '{}'::jsonb, result jsonb not null default '{}'::jsonb,
 requires_approval boolean not null default false, approved_by uuid references auth.users(id), approved_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.ops_audit_events(
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 domain text not null,event_type text not null,entity_type text,entity_id text,risk_band text not null default 'green',payload jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());

create table if not exists public.dispatch_companies(
 id uuid primary key default gen_random_uuid(),owner_user_id uuid not null references auth.users(id) on delete cascade,name text not null,status text not null default 'draft',authority_type text,authority_number text,payout_status text not null default 'unconfigured',created_at timestamptz not null default now());
create table if not exists public.dispatch_drivers(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.dispatch_companies(id) on delete cascade,user_id uuid references auth.users(id),display_name text not null,phone text,license_state text,license_class text,eligibility_status text not null default 'pending',availability_status text not null default 'offline',skills text[] not null default '{}',languages text[] not null default '{}',created_at timestamptz not null default now());
create table if not exists public.dispatch_vehicles(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.dispatch_companies(id) on delete cascade,owner_user_id uuid references auth.users(id),vehicle_type text not null,vin_hash text,plate_state text,plate_last4 text,make text,model text,model_year int,capacity jsonb not null default '{}'::jsonb,eligibility_status text not null default 'pending',maintenance_status text not null default 'unknown',insurance_status text not null default 'unverified',availability_status text not null default 'offline',created_at timestamptz not null default now());
create table if not exists public.dispatch_customers(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.dispatch_companies(id) on delete cascade,name text not null,customer_type text not null default 'shipper',contact jsonb not null default '{}'::jsonb,billing_terms text,credit_status text not null default 'unreviewed',created_at timestamptz not null default now());
create table if not exists public.dispatch_jobs(
 id uuid primary key default gen_random_uuid(),company_id uuid not null references public.dispatch_companies(id) on delete cascade,customer_id uuid references public.dispatch_customers(id),job_type text not null,reference_number text,status text not null default 'draft',pickup jsonb not null default '{}'::jsonb,dropoff jsonb not null default '{}'::jsonb,cargo jsonb not null default '{}'::jsonb,pickup_window jsonb not null default '{}'::jsonb,delivery_window jsonb not null default '{}'::jsonb,quoted_amount_cents bigint not null default 0,currency text not null default 'USD',compliance_status text not null default 'pending',created_by_user_id uuid references auth.users(id),created_at timestamptz not null default now(),updated_at timestamptz not null default now());
create table if not exists public.dispatch_assignments(
 id uuid primary key default gen_random_uuid(),job_id uuid not null references public.dispatch_jobs(id) on delete cascade,driver_id uuid not null references public.dispatch_drivers(id),vehicle_id uuid not null references public.dispatch_vehicles(id),assigned_by_user_id uuid references auth.users(id),assignment_source text not null default 'human',recommendation jsonb not null default '{}'::jsonb,status text not null default 'offered',accepted_at timestamptz,completed_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.dispatch_status_events(
 id uuid primary key default gen_random_uuid(),job_id uuid not null references public.dispatch_jobs(id) on delete cascade,assignment_id uuid references public.dispatch_assignments(id),actor_user_id uuid references auth.users(id),event_type text not null,location jsonb not null default '{}'::jsonb,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.dispatch_documents(
 id uuid primary key default gen_random_uuid(),job_id uuid references public.dispatch_jobs(id) on delete cascade,company_id uuid not null references public.dispatch_companies(id) on delete cascade,document_type text not null,storage_ref text not null,verified boolean not null default false,metadata jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.dispatch_financial_events(
 id uuid primary key default gen_random_uuid(),job_id uuid not null references public.dispatch_jobs(id) on delete cascade,event_type text not null,amount_cents bigint not null,currency text not null default 'USD',status text not null default 'pending',provider_ref text,requires_approval boolean not null default true,approved_by uuid references auth.users(id),created_at timestamptz not null default now());

create table if not exists public.sports_experts(
 id uuid primary key default gen_random_uuid(),user_id uuid not null references auth.users(id) on delete cascade,display_name text not null,verification_status text not null default 'pending',bio text,created_at timestamptz not null default now());
create table if not exists public.sports_events(
 id uuid primary key default gen_random_uuid(),provider_event_id text,sport text not null,league text,home_name text,away_name text,starts_at timestamptz,status text not null default 'scheduled',score jsonb not null default '{}'::jsonb,source_provenance jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.sports_picks(
 id uuid primary key default gen_random_uuid(),expert_id uuid not null references public.sports_experts(id) on delete cascade,event_id uuid not null references public.sports_events(id) on delete cascade,pick_type text not null,selection text not null,line_snapshot jsonb not null default '{}'::jsonb,confidence int check(confidence between 1 and 100),rationale text,locked_at timestamptz not null default now(),result text not null default 'pending',resolved_at timestamptz,deleted_at timestamptz,created_at timestamptz not null default now());
create table if not exists public.sports_pick_results(
 id uuid primary key default gen_random_uuid(),pick_id uuid not null unique references public.sports_picks(id) on delete cascade,result text not null,source_ref text not null,resolved_by uuid references auth.users(id),resolved_at timestamptz not null default now());
create table if not exists public.sports_ai_predictions(
 id uuid primary key default gen_random_uuid(),event_id uuid not null references public.sports_events(id) on delete cascade,model_name text not null,prediction jsonb not null,confidence int check(confidence between 0 and 100),evidence jsonb not null default '[]'::jsonb,created_at timestamptz not null default now(),resolved_result text);
create table if not exists public.sports_live_rooms(
 id uuid primary key default gen_random_uuid(),event_id uuid references public.sports_events(id),host_user_id uuid not null references auth.users(id),title text not null,status text not null default 'scheduled',live_room_ref text,created_at timestamptz not null default now());

create table if not exists public.archive_evidence(
 id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id) on delete set null,url text not null,lookup_type text not null default 'wayback',requested_timestamp text,archive_timestamp text,archive_url text,status_code text,content_digest text,provenance jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());
create table if not exists public.archive_comparisons(
 id uuid primary key default gen_random_uuid(),user_id uuid references auth.users(id),url text not null,left_timestamp text not null,right_timestamp text not null,left_archive_url text,right_archive_url text,comparison jsonb not null default '{}'::jsonb,created_at timestamptz not null default now());

alter table public.ops_workflows enable row level security; alter table public.ops_audit_events enable row level security;
alter table public.dispatch_companies enable row level security; alter table public.dispatch_drivers enable row level security; alter table public.dispatch_vehicles enable row level security; alter table public.dispatch_customers enable row level security; alter table public.dispatch_jobs enable row level security; alter table public.dispatch_assignments enable row level security; alter table public.dispatch_status_events enable row level security; alter table public.dispatch_documents enable row level security; alter table public.dispatch_financial_events enable row level security;
alter table public.sports_experts enable row level security; alter table public.sports_picks enable row level security; alter table public.sports_ai_predictions enable row level security; alter table public.sports_live_rooms enable row level security; alter table public.archive_evidence enable row level security; alter table public.archive_comparisons enable row level security;

create policy "ops owner" on public.ops_workflows for all using(auth.uid()=owner_user_id) with check(auth.uid()=owner_user_id);
create policy "dispatch company owner" on public.dispatch_companies for all using(auth.uid()=owner_user_id) with check(auth.uid()=owner_user_id);
create policy "dispatch jobs company owner" on public.dispatch_jobs for all using(exists(select 1 from public.dispatch_companies c where c.id=company_id and c.owner_user_id=auth.uid())) with check(exists(select 1 from public.dispatch_companies c where c.id=company_id and c.owner_user_id=auth.uid()));
create policy "sports expert self" on public.sports_experts for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "sports picks expert self" on public.sports_picks for all using(exists(select 1 from public.sports_experts e where e.id=expert_id and e.user_id=auth.uid())) with check(exists(select 1 from public.sports_experts e where e.id=expert_id and e.user_id=auth.uid()));
create policy "archive evidence self" on public.archive_evidence for all using(user_id is null or auth.uid()=user_id) with check(user_id is null or auth.uid()=user_id);
create policy "archive compare self" on public.archive_comparisons for all using(user_id is null or auth.uid()=user_id) with check(user_id is null or auth.uid()=user_id);

create index if not exists dispatch_jobs_company_status_idx on public.dispatch_jobs(company_id,status,created_at desc);
create index if not exists dispatch_assignments_job_idx on public.dispatch_assignments(job_id,status);
create index if not exists sports_picks_event_idx on public.sports_picks(event_id,locked_at desc);
create index if not exists archive_evidence_url_idx on public.archive_evidence(url,created_at desc);