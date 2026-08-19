-- TRYAMM Money Engine v1
-- Sandbox-first financial infrastructure. No real payouts are enabled by this migration alone.

create table if not exists public.money_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid null references auth.users(id) on delete set null,
  account_type text not null check (account_type in ('platform_revenue','creator_payable','master_payable','publishing_payable','collaborator_payable','prize_liability','tax_payable','refund_reserve','sponsor_restricted','charity_restricted','legacy_restricted','ministry_restricted','processing_fees','operating_reserve','cash_settlement')),
  currency text not null default 'USD', label text not null,
  status text not null default 'active' check (status in ('active','frozen','closed')),
  created_at timestamptz not null default now(),
  unique(owner_user_id, account_type, currency, label)
);

create table if not exists public.money_journals (
  id uuid primary key default gen_random_uuid(), external_reference text unique,
  source_type text not null, source_id text, description text not null,
  currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','posted','reversed','void')),
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(), posted_at timestamptz
);

create table if not exists public.money_postings (
  id bigint generated always as identity primary key,
  journal_id uuid not null references public.money_journals(id) on delete restrict,
  account_id uuid not null references public.money_accounts(id) on delete restrict,
  side text not null check (side in ('debit','credit')),
  amount_minor bigint not null check (amount_minor > 0),
  created_at timestamptz not null default now()
);

create table if not exists public.rights_assets (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete restrict,
  asset_type text not null check (asset_type in ('song','album','movie','episode','anime','reel','game','omni_box','live_event','immersive_experience','other')),
  title text not null,
  rights_status text not null default 'draft' check (rights_status in ('draft','pending_signatures','active','disputed','expired')),
  territories text[] not null default array['WORLDWIDE']::text[],
  starts_at timestamptz not null default now(), ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.rights_splits (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.rights_assets(id) on delete cascade,
  participant_user_id uuid references auth.users(id) on delete set null,
  participant_name text not null, role text not null,
  revenue_lane text not null check (revenue_lane in ('master','publishing','creator','performance','sync','merch','live','sponsorship','other')),
  share_bps integer not null check (share_bps between 0 and 10000),
  signature_status text not null default 'pending' check (signature_status in ('pending','accepted','declined','superseded')),
  agreement_version integer not null default 1, created_at timestamptz not null default now()
);

create table if not exists public.creator_earnings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  asset_id uuid references public.rights_assets(id) on delete set null,
  journal_id uuid not null references public.money_journals(id) on delete restrict,
  revenue_lane text not null, amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'USD',
  state text not null default 'pending_settlement' check (state in ('pending_settlement','cleared','held','payable','paid','reversed')),
  hold_reason text, available_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists public.money_payout_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  provider text not null default 'stripe_connect', provider_account_id text,
  onboarding_status text not null default 'not_started' check (onboarding_status in ('not_started','pending','restricted','complete')),
  transfers_enabled boolean not null default false, charges_enabled boolean not null default false,
  tax_status text not null default 'unknown', payout_hold boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.money_payout_requests (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete restrict,
  amount_minor bigint not null check (amount_minor > 0), currency text not null default 'USD',
  status text not null default 'requested' check (status in ('requested','review','approved','sent','paid','failed','cancelled','held')),
  provider_reference text, idempotency_key text not null unique, review_notes text,
  requested_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.restricted_allocations (
  id uuid primary key default gen_random_uuid(), journal_id uuid not null references public.money_journals(id) on delete restrict,
  allocation_type text not null check (allocation_type in ('sponsor_prize','charity','kenosha_legacy','ministry','other')),
  beneficiary_name text not null, beneficiary_reference text,
  amount_minor bigint not null check (amount_minor >= 0), currency text not null default 'USD',
  status text not null default 'reserved' check (status in ('reserved','approved','distributed','released','reversed')),
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists money_postings_journal_idx on public.money_postings(journal_id);
create index if not exists creator_earnings_user_state_idx on public.creator_earnings(user_id,state);
create index if not exists rights_splits_asset_lane_idx on public.rights_splits(asset_id,revenue_lane,agreement_version);
create index if not exists payout_requests_user_status_idx on public.money_payout_requests(user_id,status);

create or replace function public.assert_balanced_money_journal(p_journal uuid)
returns boolean language sql stable as $$
  select coalesce(sum(case when side='debit' then amount_minor else -amount_minor end),0)=0
  from public.money_postings where journal_id=p_journal;
$$;

create or replace function public.assert_rights_split_total(p_asset uuid,p_lane text,p_version integer default 1)
returns boolean language sql stable as $$
  select coalesce(sum(share_bps),0)=10000
  from public.rights_splits
  where asset_id=p_asset and revenue_lane=p_lane and agreement_version=p_version and signature_status='accepted';
$$;

create or replace function public.post_money_journal(p_journal uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  if not public.assert_balanced_money_journal(p_journal) then raise exception 'Money journal % is not balanced', p_journal; end if;
  update public.money_journals set status='posted', posted_at=coalesce(posted_at,now()) where id=p_journal and status='pending';
end; $$;

alter table public.money_accounts enable row level security;
alter table public.money_journals enable row level security;
alter table public.money_postings enable row level security;
alter table public.rights_assets enable row level security;
alter table public.rights_splits enable row level security;
alter table public.creator_earnings enable row level security;
alter table public.money_payout_profiles enable row level security;
alter table public.money_payout_requests enable row level security;
alter table public.restricted_allocations enable row level security;

do $$ begin
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='money_accounts' and policyname='users read own money accounts') then
    create policy "users read own money accounts" on public.money_accounts for select using (owner_user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='rights_assets' and policyname='users read own rights assets') then
    create policy "users read own rights assets" on public.rights_assets for select using (creator_user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='rights_assets' and policyname='users manage own rights assets') then
    create policy "users manage own rights assets" on public.rights_assets for all using (creator_user_id=auth.uid()) with check (creator_user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='rights_splits' and policyname='participants read rights splits') then
    create policy "participants read rights splits" on public.rights_splits for select using (participant_user_id=auth.uid() or exists(select 1 from public.rights_assets a where a.id=asset_id and a.creator_user_id=auth.uid()));
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='creator_earnings' and policyname='users read own earnings') then
    create policy "users read own earnings" on public.creator_earnings for select using (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='money_payout_profiles' and policyname='users read own payout profile') then
    create policy "users read own payout profile" on public.money_payout_profiles for select using (user_id=auth.uid());
  end if;
  if not exists(select 1 from pg_policies where schemaname='public' and tablename='money_payout_requests' and policyname='users read own payout requests') then
    create policy "users read own payout requests" on public.money_payout_requests for select using (user_id=auth.uid());
  end if;
end $$;

revoke all on function public.post_money_journal(uuid) from public;
grant execute on function public.post_money_journal(uuid) to service_role;

comment on table public.money_journals is 'Immutable-style journal headers for TRYAMM Money Engine. Postings must balance before posting.';
comment on table public.rights_splits is 'Versioned contractual split instructions. share_bps uses basis points; 10000 = 100%.';
comment on table public.creator_earnings is 'Creator/rightsholder payable subledger; not equivalent to available cash until state=payable.';
