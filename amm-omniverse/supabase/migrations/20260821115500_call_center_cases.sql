create table if not exists public.tryamm_support_cases (
 id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete set null,
 vertical text not null, intent text not null, status text not null default 'open' check(status in ('open','working','waiting-user','callback-scheduled','escalated','resolved','closed')),
 summary text not null default '', context jsonb not null default '{}'::jsonb, assigned_role text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.tryamm_support_handoffs (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.tryamm_support_cases(id) on delete cascade,
 from_mode text not null, to_mode text not null, reason text not null, preserved_context jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now());
create table if not exists public.tryamm_support_callbacks (
 id uuid primary key default gen_random_uuid(), case_id uuid not null references public.tryamm_support_cases(id) on delete cascade,
 requested_by uuid references auth.users(id), consent_recorded boolean not null default false, requested_window text, contact_channel text not null default 'phone',
 state text not null default 'requested' check(state in ('requested','scheduled','attempted','completed','cancelled')), created_at timestamptz not null default now());
alter table public.tryamm_support_cases enable row level security; alter table public.tryamm_support_handoffs enable row level security; alter table public.tryamm_support_callbacks enable row level security;
revoke all on public.tryamm_support_cases from anon; revoke all on public.tryamm_support_handoffs from anon; revoke all on public.tryamm_support_callbacks from anon;
create policy "support user reads own cases" on public.tryamm_support_cases for select to authenticated using((select auth.uid())=user_id);
create policy "support user creates own case" on public.tryamm_support_cases for insert to authenticated with check((select auth.uid())=user_id);
create policy "support user reads own handoffs" on public.tryamm_support_handoffs for select to authenticated using(exists(select 1 from public.tryamm_support_cases c where c.id=case_id and c.user_id=(select auth.uid())));
create policy "support user reads own callbacks" on public.tryamm_support_callbacks for select to authenticated using(exists(select 1 from public.tryamm_support_cases c where c.id=case_id and c.user_id=(select auth.uid())));
-- Assignment, escalation, callback scheduling and resolution writes are trusted support/server operations.
