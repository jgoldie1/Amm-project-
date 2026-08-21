create table if not exists public.game_prize_events (
 id uuid primary key default gen_random_uuid(), event_key text not null unique, title text not null, rules_version text not null,
 status text not null default 'draft' check(status in ('draft','published','funded','live','finalizing','final','cancelled')),
 prize_pool_cents bigint not null default 0 check(prize_pool_cents>=0), currency text not null default 'USD', rules jsonb not null default '{}'::jsonb,
 sponsor_id text, created_at timestamptz not null default now());
create table if not exists public.game_prize_results (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.game_prize_events(id) on delete cascade,
 user_id uuid not null references auth.users(id), place integer check(place is null or(place>=1 and place<=100000)), score numeric,
 server_evidence jsonb not null default '{}'::jsonb, anti_cheat_state text not null default 'pending', eligibility_state text not null default 'pending', final boolean not null default false,
 unique(event_id,user_id));
create table if not exists public.game_prize_payouts (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.game_prize_events(id), result_id uuid references public.game_prize_results(id),
 user_id uuid references auth.users(id), payout_kind text not null, amount_cents bigint not null default 0 check(amount_cents>=0), currency text not null default 'USD',
 state text not null default 'pending' check(state in ('pending','held','approved','submitted','paid','failed','reversed','cancelled')),
 provider_ref text, idempotency_key text not null unique, gate_evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.game_prize_allocations (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.game_prize_events(id), allocation_type text not null,
 beneficiary_ref text, bps integer check(bps is null or(bps>=0 and bps<=10000)), amount_cents bigint check(amount_cents is null or amount_cents>=0), basis text not null,
 state text not null default 'pending', evidence jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
alter table public.game_prize_events enable row level security; alter table public.game_prize_results enable row level security; alter table public.game_prize_payouts enable row level security; alter table public.game_prize_allocations enable row level security;
revoke all on public.game_prize_events from anon; revoke all on public.game_prize_results from anon; revoke all on public.game_prize_payouts from anon; revoke all on public.game_prize_allocations from anon;
create policy "published prize events readable" on public.game_prize_events for select to authenticated using(status in ('published','funded','live','finalizing','final'));
create policy "player reads own prize result" on public.game_prize_results for select to authenticated using((select auth.uid())=user_id);
create policy "player reads own payout" on public.game_prize_payouts for select to authenticated using((select auth.uid())=user_id);
-- Event creation, funding confirmation, result finalization, prize calculation, allocations and payout writes are trusted-server/admin operations only.
