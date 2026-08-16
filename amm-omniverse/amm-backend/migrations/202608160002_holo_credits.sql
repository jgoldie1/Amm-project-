-- Closed-loop Holo Credits. Credits are not cash, deposits, or redeemable currency.
create table if not exists public.holo_credit_wallets (
  user_id uuid primary key,
  balance bigint not null default 0 check (balance >= 0),
  lifetime_earned bigint not null default 0 check (lifetime_earned >= 0),
  lifetime_spent bigint not null default 0 check (lifetime_spent >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  amount bigint not null check (amount <> 0),
  transaction_type text not null,
  source_system text not null,
  source_ref text not null,
  description text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique(source_system, source_ref, transaction_type)
);
create index if not exists holo_credit_tx_user_idx on public.holo_credit_transactions(user_id, created_at desc);

create or replace function public.apply_holo_credits(
  p_user_id uuid,
  p_amount bigint,
  p_transaction_type text,
  p_source_system text,
  p_source_ref text,
  p_description text default '',
  p_metadata jsonb default '{}'::jsonb
) returns bigint
language plpgsql
security definer
set search_path=public
as $$
declare v_existing bigint; v_balance bigint;
begin
  if p_amount = 0 then raise exception 'Credit amount cannot be zero'; end if;
  select amount into v_existing from public.holo_credit_transactions
    where source_system=p_source_system and source_ref=p_source_ref and transaction_type=p_transaction_type;
  if found then
    select balance into v_balance from public.holo_credit_wallets where user_id=p_user_id;
    return coalesce(v_balance,0);
  end if;

  insert into public.holo_credit_wallets(user_id,balance,lifetime_earned,lifetime_spent)
    values(p_user_id,0,0,0) on conflict(user_id) do nothing;

  select balance into v_balance from public.holo_credit_wallets where user_id=p_user_id for update;
  if v_balance + p_amount < 0 then raise exception 'Insufficient Holo Credits'; end if;

  insert into public.holo_credit_transactions(user_id,amount,transaction_type,source_system,source_ref,description,metadata)
    values(p_user_id,p_amount,p_transaction_type,p_source_system,p_source_ref,coalesce(p_description,''),coalesce(p_metadata,'{}'::jsonb));

  update public.holo_credit_wallets set
    balance=balance+p_amount,
    lifetime_earned=lifetime_earned+case when p_amount>0 then p_amount else 0 end,
    lifetime_spent=lifetime_spent+case when p_amount<0 then -p_amount else 0 end,
    updated_at=now()
  where user_id=p_user_id returning balance into v_balance;
  return v_balance;
end;
$$;

alter table public.holo_credit_wallets enable row level security;
alter table public.holo_credit_transactions enable row level security;

drop policy if exists holo_credit_wallet_self_read on public.holo_credit_wallets;
create policy holo_credit_wallet_self_read on public.holo_credit_wallets for select using(auth.uid()=user_id);
drop policy if exists holo_credit_tx_self_read on public.holo_credit_transactions;
create policy holo_credit_tx_self_read on public.holo_credit_transactions for select using(auth.uid()=user_id);

revoke insert,update,delete on public.holo_credit_wallets from anon,authenticated;
revoke insert,update,delete on public.holo_credit_transactions from anon,authenticated;
revoke execute on function public.apply_holo_credits(uuid,bigint,text,text,text,text,jsonb) from anon,authenticated;
