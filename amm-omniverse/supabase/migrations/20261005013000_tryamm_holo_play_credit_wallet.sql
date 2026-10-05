-- TRYAMM closed-loop Holo / Play Credit wallet.
-- Holo Credits are earned non-cash engagement units.
-- Play Credits are purchased closed-loop units minted only from a verified commerce entitlement.
-- Neither bucket is cash, withdrawable, interest-bearing, transferable P2P, or an investment.

create table if not exists public.tryamm_credit_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  holo_earned_units bigint not null default 0 check (holo_earned_units >= 0),
  play_purchased_units bigint not null default 0 check (play_purchased_units >= 0),
  play_refund_debt_units bigint not null default 0 check (play_refund_debt_units >= 0),
  lifetime_holo_earned bigint not null default 0 check (lifetime_holo_earned >= 0),
  lifetime_play_purchased bigint not null default 0 check (lifetime_play_purchased >= 0),
  lifetime_spent bigint not null default 0 check (lifetime_spent >= 0),
  status text not null default 'active' check (status in ('active','frozen','closed')),
  updated_at timestamptz not null default now()
);

create table if not exists public.tryamm_credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  bucket text not null check (bucket in ('HOLO_EARNED','PLAY_PURCHASED')),
  event_type text not null check (event_type in ('EARN','PURCHASE_TOPUP','SPEND','REVERSAL','ADJUSTMENT')),
  units bigint not null check (units <> 0),
  source_type text not null,
  source_id text not null,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists tryamm_credit_ledger_user_created_idx on public.tryamm_credit_ledger(user_id,created_at desc);

alter table public.tryamm_credit_wallets enable row level security;
alter table public.tryamm_credit_ledger enable row level security;

revoke insert,update,delete on public.tryamm_credit_wallets from anon,authenticated;
revoke insert,update,delete on public.tryamm_credit_ledger from anon,authenticated;
grant select on public.tryamm_credit_wallets,public.tryamm_credit_ledger to authenticated;

drop policy if exists tryamm_credit_wallet_read_own on public.tryamm_credit_wallets;
create policy tryamm_credit_wallet_read_own on public.tryamm_credit_wallets
for select to authenticated using ((select auth.uid())=user_id);

drop policy if exists tryamm_credit_ledger_read_own on public.tryamm_credit_ledger;
create policy tryamm_credit_ledger_read_own on public.tryamm_credit_ledger
for select to authenticated using ((select auth.uid())=user_id);

create or replace function public.tryamm_credit_pack_units(p_product_id text)
returns bigint
language sql
immutable
set search_path=public
as $$
  select case p_product_id
    when 'holo-play-500' then 500
    when 'holo-play-1100' then 1100
    when 'holo-play-2400' then 2400
    when 'holo-play-6500' then 6500
    else 0
  end;
$$;

create or replace function public.apply_tryamm_credit_pack_entitlement()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_units bigint;
  v_inserted uuid;
begin
  if new.status not in ('active','fulfilled') then return new; end if;
  v_units:=public.tryamm_credit_pack_units(new.product_id);
  if v_units<=0 then return new; end if;

  insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
  values(new.buyer_id,'PLAY_PURCHASED','PURCHASE_TOPUP',v_units,'commerce_entitlement',new.id::text,'entitlement:'||new.id::text,
    jsonb_build_object('productId',new.product_id,'orderId',new.order_id,'cashValueMinor',0,'withdrawable',false))
  on conflict (idempotency_key) do nothing
  returning id into v_inserted;

  if v_inserted is null then return new; end if;

  insert into public.tryamm_credit_wallets(user_id,play_purchased_units,lifetime_play_purchased)
  values(new.buyer_id,v_units,v_units)
  on conflict(user_id) do update set
    play_purchased_units=public.tryamm_credit_wallets.play_purchased_units+excluded.play_purchased_units,
    lifetime_play_purchased=public.tryamm_credit_wallets.lifetime_play_purchased+excluded.lifetime_play_purchased,
    updated_at=now();
  return new;
end;
$$;

drop trigger if exists trg_tryamm_credit_pack_entitlement on public.commerce_entitlements;
create trigger trg_tryamm_credit_pack_entitlement
after insert on public.commerce_entitlements
for each row execute function public.apply_tryamm_credit_pack_entitlement();

create or replace function public.reverse_tryamm_credit_pack_entitlement()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  v_units bigint;
  v_available bigint;
  v_debt bigint;
  v_inserted uuid;
begin
  if old.status not in ('active','fulfilled') or new.status not in ('refunded','revoked') then return new; end if;
  v_units:=public.tryamm_credit_pack_units(new.product_id);
  if v_units<=0 then return new; end if;

  insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
  values(new.buyer_id,'PLAY_PURCHASED','REVERSAL',-v_units,'commerce_entitlement_refund',new.id::text,'entitlement-refund:'||new.id::text,
    jsonb_build_object('productId',new.product_id,'orderId',new.order_id,'reason','verified entitlement refund/revocation'))
  on conflict (idempotency_key) do nothing
  returning id into v_inserted;
  if v_inserted is null then return new; end if;

  insert into public.tryamm_credit_wallets(user_id) values(new.buyer_id) on conflict do nothing;
  select play_purchased_units into v_available from public.tryamm_credit_wallets where user_id=new.buyer_id for update;
  v_available:=least(v_available,v_units);
  v_debt:=v_units-v_available;
  update public.tryamm_credit_wallets
  set play_purchased_units=play_purchased_units-v_available,
      play_refund_debt_units=play_refund_debt_units+v_debt,
      status=case when v_debt>0 then 'frozen' else status end,
      updated_at=now()
  where user_id=new.buyer_id;
  return new;
end;
$$;

drop trigger if exists trg_tryamm_credit_pack_refund on public.commerce_entitlements;
create trigger trg_tryamm_credit_pack_refund
after update of status on public.commerce_entitlements
for each row execute function public.reverse_tryamm_credit_pack_entitlement();

create or replace function public.grant_tryamm_holo_credits(
  p_user_id uuid,p_units bigint,p_source_id text,p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v_inserted uuid; v_wallet public.tryamm_credit_wallets%rowtype;
begin
  if p_user_id is null or p_units is null or p_units<=0 or coalesce(p_source_id,'')='' then raise exception 'invalid_holo_credit_grant'; end if;
  insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
  values(p_user_id,'HOLO_EARNED','EARN',p_units,'server_reward',p_source_id,'holo-earn:'||p_source_id,coalesce(p_metadata,'{}'::jsonb))
  on conflict(idempotency_key) do nothing returning id into v_inserted;
  if v_inserted is not null then
    insert into public.tryamm_credit_wallets(user_id,holo_earned_units,lifetime_holo_earned)
    values(p_user_id,p_units,p_units)
    on conflict(user_id) do update set
      holo_earned_units=public.tryamm_credit_wallets.holo_earned_units+excluded.holo_earned_units,
      lifetime_holo_earned=public.tryamm_credit_wallets.lifetime_holo_earned+excluded.lifetime_holo_earned,
      updated_at=now();
  end if;
  select * into v_wallet from public.tryamm_credit_wallets where user_id=p_user_id;
  return jsonb_build_object('holoCredits',coalesce(v_wallet.holo_earned_units,0),'playCredits',coalesce(v_wallet.play_purchased_units,0),'status',coalesce(v_wallet.status,'active'));
end;
$$;
revoke all on function public.grant_tryamm_holo_credits(uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.grant_tryamm_holo_credits(uuid,bigint,text,jsonb) to service_role;

create or replace function public.spend_tryamm_credits(
  p_user_id uuid,p_units bigint,p_source_id text,p_metadata jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  v_wallet public.tryamm_credit_wallets%rowtype;
  v_holo bigint:=0;
  v_play bigint:=0;
begin
  if p_user_id is null or p_units is null or p_units<=0 or coalesce(p_source_id,'')='' then raise exception 'invalid_credit_spend'; end if;
  if exists(select 1 from public.tryamm_credit_ledger where user_id=p_user_id and source_type='spend' and source_id=p_source_id) then
    select * into v_wallet from public.tryamm_credit_wallets where user_id=p_user_id;
    return jsonb_build_object('duplicate',true,'holoCredits',coalesce(v_wallet.holo_earned_units,0),'playCredits',coalesce(v_wallet.play_purchased_units,0),'spentUnits',p_units);
  end if;

  insert into public.tryamm_credit_wallets(user_id) values(p_user_id) on conflict do nothing;
  select * into v_wallet from public.tryamm_credit_wallets where user_id=p_user_id for update;
  if v_wallet.status<>'active' or v_wallet.play_refund_debt_units>0 then raise exception 'credit_wallet_not_spendable'; end if;
  if v_wallet.holo_earned_units+v_wallet.play_purchased_units<p_units then raise exception 'insufficient_tryamm_credits'; end if;

  v_holo:=least(v_wallet.holo_earned_units,p_units);
  v_play:=p_units-v_holo;

  update public.tryamm_credit_wallets
  set holo_earned_units=holo_earned_units-v_holo,
      play_purchased_units=play_purchased_units-v_play,
      lifetime_spent=lifetime_spent+p_units,
      updated_at=now()
  where user_id=p_user_id;

  if v_holo>0 then
    insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
    values(p_user_id,'HOLO_EARNED','SPEND',-v_holo,'spend',p_source_id,'spend:'||p_source_id||':holo',coalesce(p_metadata,'{}'::jsonb));
  end if;
  if v_play>0 then
    insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
    values(p_user_id,'PLAY_PURCHASED','SPEND',-v_play,'spend',p_source_id,'spend:'||p_source_id||':play',coalesce(p_metadata,'{}'::jsonb));
  end if;

  return jsonb_build_object('duplicate',false,'spentUnits',p_units,'holoUsed',v_holo,'playUsed',v_play,
    'holoCredits',v_wallet.holo_earned_units-v_holo,'playCredits',v_wallet.play_purchased_units-v_play);
end;
$$;
revoke all on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) to service_role;

comment on table public.tryamm_credit_wallets is
'Closed-loop TRYAMM utility credits. Holo Credits are earned and Play Credits are purchased; neither is cash, withdrawable, transferable P2P, interest-bearing, or an investment.';
