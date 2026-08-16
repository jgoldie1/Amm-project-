-- TryAMM Revenue Beta financial core
-- Additive migration. Existing treasury rows remain untouched.

create extension if not exists pgcrypto;

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid null,
  creator_user_id uuid null,
  provider text not null default 'stripe',
  provider_session_id text null,
  provider_payment_intent_id text null,
  order_type text not null,
  status text not null default 'pending',
  currency text not null default 'USD',
  gross_amount numeric(18,2) not null default 0,
  platform_amount numeric(18,2) not null default 0,
  creator_amount numeric(18,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_session_id)
);

create index if not exists commerce_orders_user_created_idx on public.commerce_orders(user_id, created_at desc);
create index if not exists commerce_orders_creator_created_idx on public.commerce_orders(creator_user_id, created_at desc);
create index if not exists commerce_orders_payment_intent_idx on public.commerce_orders(provider_payment_intent_id);

create table if not exists public.omnicash_journals (
  id uuid primary key default gen_random_uuid(),
  source_system text not null,
  source_ref text not null,
  journal_type text not null,
  currency text not null default 'USD',
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  posted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(source_system, source_ref, journal_type)
);

create table if not exists public.omnicash_entries (
  id uuid primary key default gen_random_uuid(),
  journal_id uuid not null references public.omnicash_journals(id) on delete restrict,
  account_code text not null,
  party_user_id uuid null,
  debit numeric(18,2) not null default 0 check (debit >= 0),
  credit numeric(18,2) not null default 0 check (credit >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check ((debit > 0 and credit = 0) or (credit > 0 and debit = 0))
);

create index if not exists omnicash_entries_journal_idx on public.omnicash_entries(journal_id);
create index if not exists omnicash_entries_party_idx on public.omnicash_entries(party_user_id, created_at desc);

create or replace function public.post_omnicash_journal(
  p_source_system text,
  p_source_ref text,
  p_journal_type text,
  p_currency text,
  p_description text,
  p_metadata jsonb,
  p_entries jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_journal_id uuid;
  v_debits numeric(18,2);
  v_credits numeric(18,2);
  v_entry jsonb;
begin
  if p_entries is null or jsonb_typeof(p_entries) <> 'array' or jsonb_array_length(p_entries) < 2 then
    raise exception 'A journal requires at least two entries';
  end if;

  select
    coalesce(sum((x->>'debit')::numeric),0),
    coalesce(sum((x->>'credit')::numeric),0)
  into v_debits, v_credits
  from jsonb_array_elements(p_entries) x;

  if round(v_debits,2) <> round(v_credits,2) or round(v_debits,2) <= 0 then
    raise exception 'Unbalanced OmniCash journal: debits %, credits %', v_debits, v_credits;
  end if;

  insert into public.omnicash_journals(source_system,source_ref,journal_type,currency,description,metadata)
  values (p_source_system,p_source_ref,p_journal_type,upper(coalesce(p_currency,'USD')),coalesce(p_description,''),coalesce(p_metadata,'{}'::jsonb))
  on conflict (source_system,source_ref,journal_type) do update set description=excluded.description
  returning id into v_journal_id;

  -- Idempotent replay: if journal already has entries, return it without duplicating lines.
  if exists(select 1 from public.omnicash_entries where journal_id=v_journal_id) then
    return v_journal_id;
  end if;

  for v_entry in select * from jsonb_array_elements(p_entries)
  loop
    insert into public.omnicash_entries(journal_id,account_code,party_user_id,debit,credit,metadata)
    values (
      v_journal_id,
      left(coalesce(v_entry->>'accountCode','UNCLASSIFIED'),80),
      nullif(v_entry->>'partyUserId','')::uuid,
      round(coalesce((v_entry->>'debit')::numeric,0),2),
      round(coalesce((v_entry->>'credit')::numeric,0),2),
      coalesce(v_entry->'metadata','{}'::jsonb)
    );
  end loop;

  return v_journal_id;
end;
$$;

alter table public.commerce_orders enable row level security;
alter table public.omnicash_journals enable row level security;
alter table public.omnicash_entries enable row level security;

-- Customers may read only their orders. Creators may also read orders allocated to them.
drop policy if exists commerce_orders_participant_read on public.commerce_orders;
create policy commerce_orders_participant_read on public.commerce_orders
for select using (auth.uid() = user_id or auth.uid() = creator_user_id);

-- Journals are intentionally not directly client-readable. User-facing balances/earnings
-- must be exposed through authenticated server endpoints or audited views.
revoke all on public.omnicash_journals from anon, authenticated;
revoke all on public.omnicash_entries from anon, authenticated;
revoke execute on function public.post_omnicash_journal(text,text,text,text,text,jsonb,jsonb) from anon, authenticated;
