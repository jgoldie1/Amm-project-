create table if not exists public.impact_proposals (
 id uuid primary key default gen_random_uuid(), title text not null, description text not null, campaign_key text not null,
 recipient_ref text, allocation_bps integer not null default 5000 check(allocation_bps>=0 and allocation_bps<=10000),
 allocation_basis text not null, rules_version text not null, state text not null default 'draft' check(state in ('draft','compliance-review','open-vote','approved','rejected','executing','settled','cancelled')),
 opens_at timestamptz, closes_at timestamptz, created_by uuid not null references auth.users(id), created_at timestamptz not null default now());
create table if not exists public.impact_votes (
 id uuid primary key default gen_random_uuid(), proposal_id uuid not null references public.impact_proposals(id) on delete cascade,
 voter_user_id uuid not null references auth.users(id), voter_class text not null, choice text not null check(choice in ('approve','reject','abstain')),
 receipt_hash text, created_at timestamptz not null default now(), unique(proposal_id,voter_user_id,voter_class));
create table if not exists public.impact_allocations (
 id uuid primary key default gen_random_uuid(), proposal_id uuid not null references public.impact_proposals(id), eligible_net_cents bigint not null check(eligible_net_cents>=0),
 allocation_cents bigint not null check(allocation_cents>=0), currency text not null default 'USD', recipient_ref text not null,
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text, audit_hash text, evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.impact_proposals enable row level security; alter table public.impact_votes enable row level security; alter table public.impact_allocations enable row level security;
revoke all on public.impact_proposals from anon; revoke all on public.impact_votes from anon; revoke all on public.impact_allocations from anon;
create policy "members read open impact proposals" on public.impact_proposals for select to authenticated using(state in ('open-vote','approved','rejected','executing','settled'));
create policy "member casts own impact vote" on public.impact_votes for insert to authenticated with check((select auth.uid())=voter_user_id);
create policy "member reads own impact vote" on public.impact_votes for select to authenticated using((select auth.uid())=voter_user_id);
-- Proposal opening, voter eligibility/class validation, tally finalization, recipient compliance, allocation calculation and payments are trusted-server/admin operations.
