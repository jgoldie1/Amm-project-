-- Persistent entitlements for TRYAMM Holo/Play Credit utility spending.
create table if not exists public.tryamm_credit_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  entitlement_type text not null default 'digital-utility',
  quantity integer not null default 1 check (quantity > 0),
  source_id text not null,
  status text not null default 'active' check (status in ('active','consumed','revoked','expired')),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  expires_at timestamptz,
  unique(user_id,source_id)
);
create index if not exists tryamm_credit_entitlements_user_status_idx on public.tryamm_credit_entitlements(user_id,status,granted_at desc);
alter table public.tryamm_credit_entitlements enable row level security;
revoke insert,update,delete on public.tryamm_credit_entitlements from anon,authenticated;
grant select on public.tryamm_credit_entitlements to authenticated;
drop policy if exists tryamm_credit_entitlements_read_own on public.tryamm_credit_entitlements;
create policy tryamm_credit_entitlements_read_own on public.tryamm_credit_entitlements
for select to authenticated using ((select auth.uid())=user_id);

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
  v_item_id text:=coalesce(p_metadata->>'itemId','');
  v_entitlement_type text:=coalesce(p_metadata->>'kind','digital-utility');
begin
  if p_user_id is null or p_units is null or p_units<=0 or coalesce(p_source_id,'')='' then raise exception 'invalid_credit_spend'; end if;
  if v_item_id='' then raise exception 'credit_item_id_required'; end if;
  if exists(select 1 from public.tryamm_credit_entitlements where user_id=p_user_id and source_id=p_source_id) then
    select * into v_wallet from public.tryamm_credit_wallets where user_id=p_user_id;
    return jsonb_build_object('duplicate',true,'holoCredits',coalesce(v_wallet.holo_earned_units,0),'playCredits',coalesce(v_wallet.play_purchased_units,0),'spentUnits',p_units,'itemId',v_item_id);
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

  insert into public.tryamm_credit_entitlements(user_id,item_id,entitlement_type,source_id,metadata)
  values(p_user_id,v_item_id,v_entitlement_type,p_source_id,coalesce(p_metadata,'{}'::jsonb));

  return jsonb_build_object('duplicate',false,'spentUnits',p_units,'holoUsed',v_holo,'playUsed',v_play,
    'holoCredits',v_wallet.holo_earned_units-v_holo,'playCredits',v_wallet.play_purchased_units-v_play,'itemId',v_item_id);
end;
$$;
revoke all on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) to service_role;

comment on table public.tryamm_credit_entitlements is
'Deterministic closed-loop digital utility entitlements purchased with TRYAMM Holo/Play Credits. These are not cash, securities, chance-based prizes, or transferable stored-value instruments.';