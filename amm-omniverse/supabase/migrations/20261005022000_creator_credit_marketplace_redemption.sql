-- Creator Credit Marketplace: turn purchased Play Credit value into auditable creator/TRYAMM
-- settlement eligibility without converting free-earned Holo Credits into cash.
-- Existing asset marketplace policy is preserved: 40% creator / 40% TRYAMM / 20% reserve
-- on verified distributable purchased-credit value only.

create table if not exists public.tryamm_play_credit_funding_lots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entitlement_id uuid not null unique references public.commerce_entitlements(id) on delete cascade,
  product_id text not null,
  order_id uuid references public.commerce_orders(id) on delete set null,
  units_granted bigint not null check (units_granted > 0),
  units_remaining bigint not null check (units_remaining >= 0),
  gross_funding_minor bigint not null check (gross_funding_minor >= 0),
  verified_net_minor bigint,
  reconciliation_reference text,
  status text not null default 'pending_reconciliation'
    check (status in ('pending_reconciliation','verified','reversed','exhausted')),
  granted_at timestamptz not null default now(),
  reconciled_at timestamptz
);
create index if not exists tryamm_play_credit_funding_user_idx
  on public.tryamm_play_credit_funding_lots(user_id,granted_at,id);

create table if not exists public.tryamm_play_credit_spend_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spend_source_id text not null,
  funding_lot_id uuid not null references public.tryamm_play_credit_funding_lots(id) on delete restrict,
  units_consumed bigint not null check (units_consumed > 0),
  eligible_net_minor bigint not null default 0 check (eligible_net_minor >= 0),
  funding_verified boolean not null default false,
  created_at timestamptz not null default now(),
  unique(spend_source_id,funding_lot_id)
);
create index if not exists tryamm_play_credit_spend_source_idx
  on public.tryamm_play_credit_spend_allocations(user_id,spend_source_id);

create table if not exists public.tryamm_creator_credit_listings (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  asset_registry_id uuid not null references public.commerce_asset_registry(id) on delete restrict,
  title text not null,
  description text not null default '',
  category text not null check (category in (
    'lottie-gift','holo-gift-pack','stage-skin','sound-pack','rp-scene','animation-pack',
    'crossverse-room','pocket-dimension-room','broadcast-graphics','creator-tool','world-skin'
  )),
  credit_price_units bigint not null check (credit_price_units between 10 and 100000),
  state text not null default 'draft' check (state in ('draft','published','suspended','retired')),
  license_scope text not null default 'tryamm-worlds',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tryamm_creator_credit_listings_state_idx
  on public.tryamm_creator_credit_listings(state,created_at desc);

create table if not exists public.tryamm_creator_credit_purchases (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.tryamm_creator_credit_listings(id) on delete restrict,
  asset_registry_id uuid not null references public.commerce_asset_registry(id) on delete restrict,
  buyer_user_id uuid not null references auth.users(id) on delete restrict,
  creator_user_id uuid not null references auth.users(id) on delete restrict,
  source_id text not null unique,
  total_units bigint not null check (total_units > 0),
  holo_units bigint not null default 0 check (holo_units >= 0),
  play_units bigint not null default 0 check (play_units >= 0),
  funded_play_units bigint not null default 0 check (funded_play_units >= 0),
  verified_play_units bigint not null default 0 check (verified_play_units >= 0),
  eligible_net_minor bigint not null default 0 check (eligible_net_minor >= 0),
  creator_minor bigint not null default 0 check (creator_minor >= 0),
  tryamm_minor bigint not null default 0 check (tryamm_minor >= 0),
  reserve_minor bigint not null default 0 check (reserve_minor >= 0),
  settlement_state text not null default 'engagement-only'
    check (settlement_state in ('engagement-only','pending-reconciliation','verified-value','payout-held','payable','reversed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tryamm_creator_credit_purchase_creator_idx
  on public.tryamm_creator_credit_purchases(creator_user_id,created_at desc);
create index if not exists tryamm_creator_credit_purchase_buyer_idx
  on public.tryamm_creator_credit_purchases(buyer_user_id,created_at desc);

create table if not exists public.tryamm_creator_credit_settlement_ledger (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.tryamm_creator_credit_purchases(id) on delete cascade,
  beneficiary_kind text not null check (beneficiary_kind in ('CREATOR_COMMISSION','TRYAMM_REVENUE','RESERVE')),
  beneficiary_user_id uuid references auth.users(id) on delete restrict,
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null default 'USD',
  state text not null default 'VERIFIED' check (state in ('VERIFIED','HELD','PAYABLE','PAID','REVERSED')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(purchase_id,beneficiary_kind)
);
create index if not exists tryamm_creator_credit_settlement_creator_idx
  on public.tryamm_creator_credit_settlement_ledger(beneficiary_user_id,state,created_at desc);

alter table public.tryamm_play_credit_funding_lots enable row level security;
alter table public.tryamm_play_credit_spend_allocations enable row level security;
alter table public.tryamm_creator_credit_listings enable row level security;
alter table public.tryamm_creator_credit_purchases enable row level security;
alter table public.tryamm_creator_credit_settlement_ledger enable row level security;

revoke insert,update,delete on public.tryamm_play_credit_funding_lots from anon,authenticated;
revoke insert,update,delete on public.tryamm_play_credit_spend_allocations from anon,authenticated;
revoke insert,update,delete on public.tryamm_creator_credit_purchases from anon,authenticated;
revoke insert,update,delete on public.tryamm_creator_credit_settlement_ledger from anon,authenticated;
grant select on public.tryamm_play_credit_funding_lots,public.tryamm_play_credit_spend_allocations,
  public.tryamm_creator_credit_listings,public.tryamm_creator_credit_purchases,
  public.tryamm_creator_credit_settlement_ledger to authenticated;

drop policy if exists tryamm_play_credit_funding_read_own on public.tryamm_play_credit_funding_lots;
create policy tryamm_play_credit_funding_read_own on public.tryamm_play_credit_funding_lots
for select to authenticated using ((select auth.uid())=user_id);

drop policy if exists tryamm_play_credit_alloc_read_own on public.tryamm_play_credit_spend_allocations;
create policy tryamm_play_credit_alloc_read_own on public.tryamm_play_credit_spend_allocations
for select to authenticated using ((select auth.uid())=user_id);

drop policy if exists tryamm_creator_credit_listings_public_read on public.tryamm_creator_credit_listings;
create policy tryamm_creator_credit_listings_public_read on public.tryamm_creator_credit_listings
for select to authenticated using (state='published' or creator_user_id=(select auth.uid()));

drop policy if exists tryamm_creator_credit_purchases_participant_read on public.tryamm_creator_credit_purchases;
create policy tryamm_creator_credit_purchases_participant_read on public.tryamm_creator_credit_purchases
for select to authenticated using (buyer_user_id=(select auth.uid()) or creator_user_id=(select auth.uid()));

drop policy if exists tryamm_creator_credit_settlement_creator_read on public.tryamm_creator_credit_settlement_ledger;
create policy tryamm_creator_credit_settlement_creator_read on public.tryamm_creator_credit_settlement_ledger
for select to authenticated using (beneficiary_user_id=(select auth.uid()));

create or replace function public.tryamm_credit_pack_gross_minor(p_product_id text)
returns bigint language sql immutable set search_path=public
as $$
 select case p_product_id
  when 'holo-play-500' then 499
  when 'holo-play-1100' then 999
  when 'holo-play-2400' then 1999
  when 'holo-play-6500' then 4999
  else 0
 end;
$$;

create or replace function public.refresh_tryamm_creator_credit_purchase(p_source_id text)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
 v_purchase public.tryamm_creator_credit_purchases%rowtype;
 v_funded bigint:=0;
 v_verified bigint:=0;
 v_net bigint:=0;
 v_creator bigint:=0;
 v_tryamm bigint:=0;
 v_reserve bigint:=0;
 v_state text;
begin
 select * into v_purchase from public.tryamm_creator_credit_purchases where source_id=p_source_id for update;
 if not found then return jsonb_build_object('ok',false,'reason','purchase_not_found'); end if;

 select
   coalesce(sum(units_consumed),0),
   coalesce(sum(case when funding_verified then units_consumed else 0 end),0),
   coalesce(sum(case when funding_verified then eligible_net_minor else 0 end),0)
 into v_funded,v_verified,v_net
 from public.tryamm_play_credit_spend_allocations
 where user_id=v_purchase.buyer_user_id and spend_source_id=p_source_id;

 if v_purchase.play_units=0 then
   v_state:='engagement-only';
 elsif v_funded<v_purchase.play_units or v_verified<v_purchase.play_units then
   v_state:='pending-reconciliation';
 else
   v_state:='verified-value';
 end if;

 if v_state='verified-value' then
   v_creator:=floor(v_net*0.40);
   v_tryamm:=floor(v_net*0.40);
   v_reserve:=greatest(0,v_net-v_creator-v_tryamm);
 end if;

 update public.tryamm_creator_credit_purchases
 set funded_play_units=v_funded,
     verified_play_units=v_verified,
     eligible_net_minor=case when v_state='verified-value' then v_net else 0 end,
     creator_minor=v_creator,
     tryamm_minor=v_tryamm,
     reserve_minor=v_reserve,
     settlement_state=v_state,
     updated_at=now()
 where id=v_purchase.id;

 if v_state='verified-value' then
   insert into public.tryamm_creator_credit_settlement_ledger
     (purchase_id,beneficiary_kind,beneficiary_user_id,amount_minor,state,metadata)
   values
     (v_purchase.id,'CREATOR_COMMISSION',v_purchase.creator_user_id,v_creator,'VERIFIED',
      jsonb_build_object('splitBasisPoints',4000,'funding','verified-play-credit-net')),
     (v_purchase.id,'TRYAMM_REVENUE',null,v_tryamm,'VERIFIED',
      jsonb_build_object('splitBasisPoints',4000,'funding','verified-play-credit-net')),
     (v_purchase.id,'RESERVE',null,v_reserve,'VERIFIED',
      jsonb_build_object('splitBasisPoints',2000,'funding','verified-play-credit-net'))
   on conflict(purchase_id,beneficiary_kind) do update set
     amount_minor=excluded.amount_minor,
     state=case when public.tryamm_creator_credit_settlement_ledger.state in ('PAID','PAYABLE') then public.tryamm_creator_credit_settlement_ledger.state else 'VERIFIED' end,
     metadata=excluded.metadata,
     updated_at=now();
 end if;

 return jsonb_build_object(
   'ok',true,'purchaseId',v_purchase.id,'settlementState',v_state,
   'holoUnits',v_purchase.holo_units,'playUnits',v_purchase.play_units,
   'fundedPlayUnits',v_funded,'verifiedPlayUnits',v_verified,
   'eligibleNetMinor',case when v_state='verified-value' then v_net else 0 end,
   'creatorMinor',v_creator,'tryammMinor',v_tryamm,'reserveMinor',v_reserve
 );
end;
$$;
revoke all on function public.refresh_tryamm_creator_credit_purchase(text) from public,anon,authenticated;
grant execute on function public.refresh_tryamm_creator_credit_purchase(text) to service_role;

create or replace function public.apply_tryamm_credit_pack_entitlement()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
 v_units bigint;
 v_gross bigint;
 v_inserted uuid;
begin
 if new.status not in ('active','fulfilled') then return new; end if;
 v_units:=public.tryamm_credit_pack_units(new.product_id);
 v_gross:=public.tryamm_credit_pack_gross_minor(new.product_id);
 if v_units<=0 then return new; end if;

 insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
 values(new.buyer_id,'PLAY_PURCHASED','PURCHASE_TOPUP',v_units,'commerce_entitlement',new.id::text,'entitlement:'||new.id::text,
   jsonb_build_object('productId',new.product_id,'orderId',new.order_id,'cashValueMinor',0,'withdrawable',false))
 on conflict(idempotency_key) do nothing
 returning id into v_inserted;

 if v_inserted is null then return new; end if;

 insert into public.tryamm_credit_wallets(user_id,play_purchased_units,lifetime_play_purchased)
 values(new.buyer_id,v_units,v_units)
 on conflict(user_id) do update set
   play_purchased_units=public.tryamm_credit_wallets.play_purchased_units+excluded.play_purchased_units,
   lifetime_play_purchased=public.tryamm_credit_wallets.lifetime_play_purchased+excluded.lifetime_play_purchased,
   updated_at=now();

 insert into public.tryamm_play_credit_funding_lots
   (user_id,entitlement_id,product_id,order_id,units_granted,units_remaining,gross_funding_minor,status)
 values(new.buyer_id,new.id,new.product_id,new.order_id,v_units,v_units,v_gross,'pending_reconciliation')
 on conflict(entitlement_id) do nothing;
 return new;
end;
$$;

create or replace function public.allocate_tryamm_play_credit_spend(
 p_user_id uuid,p_units bigint,p_source_id text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
 v_remaining bigint:=greatest(0,coalesce(p_units,0));
 v_take bigint;
 v_eligible bigint;
 v_lot record;
 v_funded bigint:=0;
 v_verified bigint:=0;
 v_net bigint:=0;
begin
 if v_remaining=0 then return jsonb_build_object('fundedUnits',0,'verifiedUnits',0,'eligibleNetMinor',0); end if;

 for v_lot in
   select * from public.tryamm_play_credit_funding_lots
   where user_id=p_user_id and units_remaining>0 and status<>'reversed'
   order by granted_at,id
   for update
 loop
   exit when v_remaining<=0;
   v_take:=least(v_remaining,v_lot.units_remaining);
   v_eligible:=case
     when v_lot.status in ('verified','exhausted') and v_lot.verified_net_minor is not null
     then floor((v_lot.verified_net_minor::numeric*v_take::numeric)/v_lot.units_granted::numeric)
     else 0
   end;

   insert into public.tryamm_play_credit_spend_allocations
     (user_id,spend_source_id,funding_lot_id,units_consumed,eligible_net_minor,funding_verified)
   values(p_user_id,p_source_id,v_lot.id,v_take,v_eligible,
     v_lot.status in ('verified','exhausted') and v_lot.verified_net_minor is not null)
   on conflict(spend_source_id,funding_lot_id) do nothing;

   update public.tryamm_play_credit_funding_lots
   set units_remaining=units_remaining-v_take,
       status=case
         when units_remaining-v_take=0 and status='verified' then 'exhausted'
         else status
       end
   where id=v_lot.id;

   v_remaining:=v_remaining-v_take;
   v_funded:=v_funded+v_take;
   if v_lot.status in ('verified','exhausted') and v_lot.verified_net_minor is not null then
     v_verified:=v_verified+v_take;
     v_net:=v_net+v_eligible;
   end if;
 end loop;

 return jsonb_build_object(
   'fundedUnits',v_funded,'unattributedLegacyUnits',v_remaining,
   'verifiedUnits',v_verified,'eligibleNetMinor',v_net
 );
end;
$$;
revoke all on function public.allocate_tryamm_play_credit_spend(uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.allocate_tryamm_play_credit_spend(uuid,bigint,text) to service_role;

create or replace function public.purchase_tryamm_creator_credit_listing(
 p_user_id uuid,p_listing_id uuid,p_source_id text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
 v_listing record;
 v_wallet public.tryamm_credit_wallets%rowtype;
 v_holo bigint:=0;
 v_play bigint:=0;
 v_purchase_id uuid;
 v_allocation jsonb;
begin
 if p_user_id is null or p_listing_id is null or coalesce(p_source_id,'')='' then
   raise exception 'invalid_creator_credit_purchase';
 end if;

 select l.*,a.owner_user_id,a.provenance_status,a.rights_status,a.certification_status
 into v_listing
 from public.tryamm_creator_credit_listings l
 join public.commerce_asset_registry a on a.id=l.asset_registry_id
 where l.id=p_listing_id
 for update;

 if not found or v_listing.state<>'published' then raise exception 'creator_listing_unavailable'; end if;
 if v_listing.creator_user_id=p_user_id then raise exception 'creator_self_purchase_blocked'; end if;
 if v_listing.owner_user_id<>v_listing.creator_user_id or
    v_listing.provenance_status<>'verified' or v_listing.rights_status<>'verified' or v_listing.certification_status<>'verified' then
   raise exception 'creator_asset_not_verified';
 end if;

 if exists(select 1 from public.tryamm_creator_credit_purchases where source_id=p_source_id) then
   select id into v_purchase_id from public.tryamm_creator_credit_purchases where source_id=p_source_id;
   return jsonb_build_object('ok',true,'duplicate',true,'purchaseId',v_purchase_id);
 end if;

 insert into public.tryamm_credit_wallets(user_id) values(p_user_id) on conflict do nothing;
 select * into v_wallet from public.tryamm_credit_wallets where user_id=p_user_id for update;
 if v_wallet.status<>'active' or v_wallet.play_refund_debt_units>0 then raise exception 'credit_wallet_not_spendable'; end if;
 if v_wallet.holo_earned_units+v_wallet.play_purchased_units<v_listing.credit_price_units then raise exception 'insufficient_tryamm_credits'; end if;

 v_holo:=least(v_wallet.holo_earned_units,v_listing.credit_price_units);
 v_play:=v_listing.credit_price_units-v_holo;

 update public.tryamm_credit_wallets
 set holo_earned_units=holo_earned_units-v_holo,
     play_purchased_units=play_purchased_units-v_play,
     lifetime_spent=lifetime_spent+v_listing.credit_price_units,
     updated_at=now()
 where user_id=p_user_id;

 if v_holo>0 then
   insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
   values(p_user_id,'HOLO_EARNED','SPEND',-v_holo,'creator_marketplace',p_source_id,'creator-market:'||p_source_id||':holo',
     jsonb_build_object('listingId',p_listing_id,'creatorId',v_listing.creator_user_id,'cashPayoutEligible',false));
 end if;
 if v_play>0 then
   insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
   values(p_user_id,'PLAY_PURCHASED','SPEND',-v_play,'creator_marketplace',p_source_id,'creator-market:'||p_source_id||':play',
     jsonb_build_object('listingId',p_listing_id,'creatorId',v_listing.creator_user_id,'cashPayoutPotential',true));
   v_allocation:=public.allocate_tryamm_play_credit_spend(p_user_id,v_play,p_source_id);
 end if;

 insert into public.tryamm_creator_credit_purchases
   (listing_id,asset_registry_id,buyer_user_id,creator_user_id,source_id,total_units,holo_units,play_units,settlement_state)
 values
   (v_listing.id,v_listing.asset_registry_id,p_user_id,v_listing.creator_user_id,p_source_id,
    v_listing.credit_price_units,v_holo,v_play,case when v_play>0 then 'pending-reconciliation' else 'engagement-only' end)
 returning id into v_purchase_id;

 insert into public.tryamm_credit_entitlements
   (user_id,item_id,entitlement_type,source_id,metadata)
 values
   (p_user_id,'creator-listing:'||v_listing.id::text,'creator-marketplace-asset',p_source_id,
    jsonb_build_object(
      'listingId',v_listing.id,'assetRegistryId',v_listing.asset_registry_id,'creatorUserId',v_listing.creator_user_id,
      'title',v_listing.title,'category',v_listing.category,'licenseScope',v_listing.license_scope,
      'holoUnits',v_holo,'playUnits',v_play,'creatorCashPayoutFromHolo',false
    ));

 perform public.refresh_tryamm_creator_credit_purchase(p_source_id);

 return jsonb_build_object(
   'ok',true,'duplicate',false,'purchaseId',v_purchase_id,'listingId',v_listing.id,
   'totalUnits',v_listing.credit_price_units,'holoUnits',v_holo,'playUnits',v_play,
   'creatorCashPayoutFromHolo',false,'fundingAllocation',coalesce(v_allocation,'{}'::jsonb)
 );
end;
$$;
revoke all on function public.purchase_tryamm_creator_credit_listing(uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.purchase_tryamm_creator_credit_listing(uuid,uuid,text) to service_role;

create or replace function public.verify_tryamm_play_credit_funding_lot(
 p_entitlement_id uuid,p_verified_net_minor bigint,p_reference text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
 v_lot public.tryamm_play_credit_funding_lots%rowtype;
 v_source text;
begin
 if p_verified_net_minor is null or p_verified_net_minor<0 or coalesce(p_reference,'')='' then
   raise exception 'invalid_credit_funding_reconciliation';
 end if;

 select * into v_lot from public.tryamm_play_credit_funding_lots where entitlement_id=p_entitlement_id for update;
 if not found then raise exception 'credit_funding_lot_not_found'; end if;
 if v_lot.status='reversed' then raise exception 'credit_funding_lot_reversed'; end if;

 update public.tryamm_play_credit_funding_lots
 set verified_net_minor=p_verified_net_minor,
     reconciliation_reference=p_reference,
     status=case when units_remaining=0 then 'exhausted' else 'verified' end,
     reconciled_at=now()
 where id=v_lot.id;

 update public.tryamm_play_credit_spend_allocations
 set funding_verified=true,
     eligible_net_minor=floor((p_verified_net_minor::numeric*units_consumed::numeric)/v_lot.units_granted::numeric)
 where funding_lot_id=v_lot.id;

 for v_source in
   select distinct spend_source_id from public.tryamm_play_credit_spend_allocations where funding_lot_id=v_lot.id
 loop
   perform public.refresh_tryamm_creator_credit_purchase(v_source);
 end loop;

 return jsonb_build_object('ok',true,'fundingLotId',v_lot.id,'verifiedNetMinor',p_verified_net_minor);
end;
$$;
revoke all on function public.verify_tryamm_play_credit_funding_lot(uuid,bigint,text) from public,anon,authenticated;
grant execute on function public.verify_tryamm_play_credit_funding_lot(uuid,bigint,text) to service_role;

create or replace function public.release_tryamm_creator_credit_payout(
 p_purchase_id uuid,p_creator_payout_eligible boolean,p_risk_clear boolean,p_reference text
) returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare v_purchase public.tryamm_creator_credit_purchases%rowtype;
begin
 if coalesce(p_reference,'')='' then raise exception 'release_reference_required'; end if;
 select * into v_purchase from public.tryamm_creator_credit_purchases where id=p_purchase_id for update;
 if not found then raise exception 'creator_credit_purchase_not_found'; end if;
 if v_purchase.settlement_state<>'verified-value' then raise exception 'creator_credit_purchase_not_verified'; end if;
 if exists(
   select 1 from public.tryamm_play_credit_spend_allocations a
   join public.tryamm_play_credit_funding_lots f on f.id=a.funding_lot_id
   where a.spend_source_id=v_purchase.source_id and f.status='reversed'
 ) then raise exception 'creator_credit_funding_reversed'; end if;

 if not p_creator_payout_eligible or not p_risk_clear then
   update public.tryamm_creator_credit_purchases set settlement_state='payout-held',updated_at=now() where id=p_purchase_id;
   update public.tryamm_creator_credit_settlement_ledger
   set state='HELD',metadata=metadata||jsonb_build_object('releaseReference',p_reference,'riskClear',p_risk_clear,'creatorPayoutEligible',p_creator_payout_eligible),updated_at=now()
   where purchase_id=p_purchase_id and beneficiary_kind='CREATOR_COMMISSION';
   return jsonb_build_object('ok',true,'state','payout-held');
 end if;

 update public.tryamm_creator_credit_purchases set settlement_state='payable',updated_at=now() where id=p_purchase_id;
 update public.tryamm_creator_credit_settlement_ledger
 set state='PAYABLE',metadata=metadata||jsonb_build_object('releaseReference',p_reference,'riskClear',true,'creatorPayoutEligible',true),updated_at=now()
 where purchase_id=p_purchase_id and beneficiary_kind='CREATOR_COMMISSION';

 return jsonb_build_object('ok',true,'state','payable','creatorMinor',v_purchase.creator_minor);
end;
$$;
revoke all on function public.release_tryamm_creator_credit_payout(uuid,boolean,boolean,text) from public,anon,authenticated;
grant execute on function public.release_tryamm_creator_credit_payout(uuid,boolean,boolean,text) to service_role;

comment on table public.tryamm_creator_credit_settlement_ledger is
'Creator credit marketplace settlement. Only verified purchased Play Credit net funding can create real creator commission eligibility. Earned Holo Credits never create cash payout.';


-- Replace the generic closed-loop spend function so every purchased Play Credit spend
-- consumes its funding provenance. This prevents already-spent funding from later
-- being reused to create creator cash eligibility.
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
  v_funding jsonb:='{}'::jsonb;
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
    v_funding:=public.allocate_tryamm_play_credit_spend(p_user_id,v_play,p_source_id);
  end if;

  insert into public.tryamm_credit_entitlements(user_id,item_id,entitlement_type,source_id,metadata)
  values(p_user_id,v_item_id,v_entitlement_type,p_source_id,
    coalesce(p_metadata,'{}'::jsonb)||jsonb_build_object('holoUnits',v_holo,'playUnits',v_play,'fundingAllocation',v_funding));

  return jsonb_build_object(
    'duplicate',false,'spentUnits',p_units,'holoUsed',v_holo,'playUsed',v_play,
    'holoCredits',v_wallet.holo_earned_units-v_holo,'playCredits',v_wallet.play_purchased_units-v_play,
    'itemId',v_item_id,'fundingAllocation',v_funding
  );
end;
$$;
revoke all on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) from public,anon,authenticated;
grant execute on function public.spend_tryamm_credits(uuid,bigint,text,jsonb) to service_role;

-- Refund/revocation propagation: reverse the purchased-credit funding lot, freeze any
-- uncovered wallet debt, and reverse creator settlements that depended on the refunded lot.
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
  v_lot_id uuid;
  v_source text;
begin
  if old.status not in ('active','fulfilled') or new.status not in ('refunded','revoked') then return new; end if;
  v_units:=public.tryamm_credit_pack_units(new.product_id);
  if v_units<=0 then return new; end if;

  insert into public.tryamm_credit_ledger(user_id,bucket,event_type,units,source_type,source_id,idempotency_key,metadata)
  values(new.buyer_id,'PLAY_PURCHASED','REVERSAL',-v_units,'commerce_entitlement_refund',new.id::text,'entitlement-refund:'||new.id::text,
    jsonb_build_object('productId',new.product_id,'orderId',new.order_id,'reason','verified entitlement refund/revocation'))
  on conflict(idempotency_key) do nothing
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

  select id into v_lot_id from public.tryamm_play_credit_funding_lots where entitlement_id=new.id for update;
  if v_lot_id is not null then
    update public.tryamm_play_credit_funding_lots
    set status='reversed',reconciled_at=now(),reconciliation_reference=coalesce(reconciliation_reference,'')||'|refund:'||new.id::text
    where id=v_lot_id;

    for v_source in
      select distinct spend_source_id from public.tryamm_play_credit_spend_allocations where funding_lot_id=v_lot_id
    loop
      update public.tryamm_creator_credit_purchases
      set settlement_state='reversed',updated_at=now()
      where source_id=v_source;

      update public.tryamm_creator_credit_settlement_ledger
      set state='REVERSED',
          metadata=metadata||jsonb_build_object('fundingRefunded',true,'fundingEntitlementId',new.id,'recoupmentRequired',state='PAID'),
          updated_at=now()
      where purchase_id in (select id from public.tryamm_creator_credit_purchases where source_id=v_source);
    end loop;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_tryamm_credit_pack_refund on public.commerce_entitlements;
create trigger trg_tryamm_credit_pack_refund
after update of status on public.commerce_entitlements
for each row execute function public.reverse_tryamm_credit_pack_entitlement();
