-- Holo Delivery realtime + Money Engine approval foundation
create extension if not exists pgcrypto;

create table if not exists public.holo_delivery_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  account_id uuid not null,
  state text not null check (state in ('confirmed','merchant_accepted','preparing','ready_for_pickup','courier_assigned','picked_up','in_transit','arriving','delivered','problem','cancelled','refunded')),
  public_message text not null default '',
  eta_minutes integer,
  latitude double precision,
  longitude double precision,
  source text not null default 'system',
  created_at timestamptz not null default now()
);
create index if not exists holo_delivery_events_order_created_idx on public.holo_delivery_events(order_id, created_at);
alter table public.holo_delivery_events enable row level security;

do $$ begin
  create policy "delivery owners can read events" on public.holo_delivery_events
    for select using (auth.uid() = account_id);
exception when duplicate_object then null; end $$;

create table if not exists public.agent_approval_requests (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null,
  requested_by text not null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  risk_level text not null default 'medium' check (risk_level in ('low','medium','high','critical')),
  status text not null default 'pending' check (status in ('pending','approved','denied','executed','failed','expired')),
  approved_by uuid,
  approved_at timestamptz,
  executed_at timestamptz,
  execution_result jsonb,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists agent_approval_requests_account_status_idx on public.agent_approval_requests(account_id,status,created_at desc);
alter table public.agent_approval_requests enable row level security;

do $$ begin
  create policy "approval owners can read" on public.agent_approval_requests for select using (auth.uid() = account_id);
exception when duplicate_object then null; end $$;

create table if not exists public.money_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  posting_id uuid not null,
  account_id uuid not null,
  ledger_account text not null,
  direction text not null check (direction in ('debit','credit')),
  amount_minor bigint not null check (amount_minor > 0),
  currency text not null default 'USD',
  reference_type text not null,
  reference_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists money_ledger_entries_posting_idx on public.money_ledger_entries(posting_id);
create index if not exists money_ledger_entries_account_idx on public.money_ledger_entries(account_id,created_at desc);
alter table public.money_ledger_entries enable row level security;

do $$ begin
  create policy "ledger owners can read" on public.money_ledger_entries for select using (auth.uid() = account_id);
exception when duplicate_object then null; end $$;

create table if not exists public.platform_allocation_policies (
  id uuid primary key default gen_random_uuid(),
  policy_key text unique not null,
  beneficiary_name text not null,
  percentage numeric(5,2) not null check (percentage >= 0 and percentage <= 100),
  applies_to text not null default 'eligible_platform_revenue',
  status text not null default 'pending_verification' check (status in ('pending_verification','active','paused','retired')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.platform_allocation_policies(policy_key,beneficiary_name,percentage,status,notes)
values ('soc_ministry_tithe','Pastor Kofi Ofri / Servants of Christ ministry',10.00,'pending_verification','Apply only to eligible platform revenue after recipient identity, agreement, accounting/tax treatment, and restricted-fund exclusions are verified. Never apply to creator earnings, taxes, refunds, reserves, provider settlements, or restricted mission funds.')
on conflict (policy_key) do nothing;

create or replace function public.money_engine_post(
  p_account_id uuid,
  p_reference_type text,
  p_reference_id text,
  p_currency text,
  p_entries jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_posting uuid := gen_random_uuid();
  v_debits bigint;
  v_credits bigint;
  e jsonb;
begin
  select coalesce(sum((x->>'amount_minor')::bigint),0) into v_debits
    from jsonb_array_elements(p_entries) x where x->>'direction'='debit';
  select coalesce(sum((x->>'amount_minor')::bigint),0) into v_credits
    from jsonb_array_elements(p_entries) x where x->>'direction'='credit';
  if v_debits <= 0 or v_debits <> v_credits then
    raise exception 'unbalanced_posting';
  end if;
  for e in select * from jsonb_array_elements(p_entries)
  loop
    insert into public.money_ledger_entries(posting_id,account_id,ledger_account,direction,amount_minor,currency,reference_type,reference_id,metadata)
    values(v_posting,p_account_id,e->>'ledger_account',e->>'direction',(e->>'amount_minor')::bigint,upper(p_currency),p_reference_type,p_reference_id,coalesce(p_metadata,'{}'::jsonb));
  end loop;
  return v_posting;
end;
$$;

-- Realtime publication: add table only if it is not already included.
do $$ begin
  alter publication supabase_realtime add table public.holo_delivery_events;
exception when duplicate_object then null; end $$;
