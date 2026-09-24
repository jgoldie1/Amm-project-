-- Applied to production as Supabase migration 20260924213313_asset_commerce_convergence.
-- Converges certified digital-asset sales onto the existing authoritative Stripe flow.

alter table public.commerce_order_items
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table public.commerce_seller_allocations
  add column if not exists reserve_cents integer not null default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname='commerce_seller_allocations_reserve_cents_check'
      and conrelid='public.commerce_seller_allocations'::regclass
  ) then
    alter table public.commerce_seller_allocations
      add constraint commerce_seller_allocations_reserve_cents_check
      check (reserve_cents >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname='commerce_seller_allocations_parts_check'
      and conrelid='public.commerce_seller_allocations'::regclass
  ) then
    alter table public.commerce_seller_allocations
      add constraint commerce_seller_allocations_parts_check
      check (gross_cents = seller_net_cents + platform_fee_cents + reserve_cents);
  end if;
end
$$;

create table if not exists public.commerce_asset_registry (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  asset_key text not null unique,
  title text not null,
  source_uri text,
  provenance_status text not null default 'pending'
    check (provenance_status in ('pending','verified','rejected')),
  rights_status text not null default 'pending'
    check (rights_status in ('pending','verified','rejected')),
  certification_status text not null default 'pending'
    check (certification_status in ('pending','verified','rejected')),
  review_reference text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists commerce_asset_registry_owner_created_idx
  on public.commerce_asset_registry(owner_user_id,created_at desc);
create index if not exists commerce_asset_registry_status_idx
  on public.commerce_asset_registry(provenance_status,rights_status,certification_status);

alter table public.commerce_asset_registry enable row level security;
revoke all on table public.commerce_asset_registry from public, anon, authenticated;
grant select,insert,update,delete on table public.commerce_asset_registry to service_role;

create or replace function public.apply_verified_stripe_checkout(
  p_order_id uuid,
  p_buyer_id uuid,
  p_provider_event_id text,
  p_provider_session_id text,
  p_provider_payment_id text,
  p_amount_cents bigint,
  p_currency text,
  p_verified_at timestamptz,
  p_event_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_order public.commerce_orders%rowtype;
  v_transaction_id uuid;
  v_existing_order_id uuid;
  v_item_count integer := 0;
  v_item_total bigint := 0;
  v_invalid_item_count integer := 0;
  v_allocation_total bigint := 0;
  v_invalid_allocation_count integer := 0;
  v_credit_total bigint := 0;
  v_entitlement_count integer := 0;
  v_ledger_count integer := 0;
  item_row record;
  allocation_row record;
begin
  if p_order_id is null or p_buyer_id is null or coalesce(p_provider_event_id,'')='' or coalesce(p_provider_session_id,'')='' then
    raise exception 'verified_stripe_identifiers_required';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 or coalesce(p_currency,'')='' then
    raise exception 'verified_stripe_amount_required';
  end if;

  select order_id,id into v_existing_order_id,v_transaction_id
  from public.commerce_payment_transactions
  where (provider='stripe' and provider_event_id=p_provider_event_id)
     or (provider='stripe' and provider_session_id=p_provider_session_id)
  order by created_at asc
  limit 1;

  if v_transaction_id is not null then
    if v_existing_order_id <> p_order_id then raise exception 'stripe_evidence_reuse_detected'; end if;
    update public.commerce_payment_events
      set order_id=p_order_id,processed_at=coalesce(processed_at,now())
      where provider='stripe' and provider_event_id=p_provider_event_id;
    return jsonb_build_object('applied',false,'duplicate',true,'transactionId',v_transaction_id);
  end if;

  select * into v_order from public.commerce_orders where id=p_order_id for update;
  if not found then raise exception 'commerce_order_not_found'; end if;

  select order_id,id into v_existing_order_id,v_transaction_id
  from public.commerce_payment_transactions
  where (provider='stripe' and provider_event_id=p_provider_event_id)
     or (provider='stripe' and provider_session_id=p_provider_session_id)
  order by created_at asc
  limit 1;

  if v_transaction_id is not null then
    if v_existing_order_id <> p_order_id then raise exception 'stripe_evidence_reuse_detected'; end if;
    update public.commerce_payment_events
      set order_id=p_order_id,processed_at=coalesce(processed_at,now())
      where provider='stripe' and provider_event_id=p_provider_event_id;
    return jsonb_build_object('applied',false,'duplicate',true,'transactionId',v_transaction_id);
  end if;

  if v_order.buyer_id is distinct from p_buyer_id then raise exception 'stripe_buyer_mismatch'; end if;
  if v_order.subtotal_cents is distinct from p_amount_cents then raise exception 'stripe_amount_mismatch'; end if;
  if upper(coalesce(v_order.currency,'')) <> upper(p_currency) then raise exception 'stripe_currency_mismatch'; end if;
  if coalesce(v_order.status,'') not in ('pending_payment','payment_failed','paid') then raise exception 'commerce_order_not_payable'; end if;
  if coalesce(v_order.payment_provider,'') <> 'stripe' then raise exception 'stripe_provider_not_bound'; end if;
  if coalesce(v_order.provider_session_id,'') <> p_provider_session_id then raise exception 'stripe_session_mismatch'; end if;

  select count(*),
         coalesce(sum(line_total_cents),0),
         count(*) filter (where line_total_cents <> unit_amount_cents::bigint * quantity)
    into v_item_count,v_item_total,v_invalid_item_count
  from public.commerce_order_items
  where order_id=p_order_id;

  if v_item_count <= 0 or v_item_total <> p_amount_cents or v_invalid_item_count <> 0 then
    raise exception 'order_items_mismatch';
  end if;

  select coalesce(sum(gross_cents),0) into v_allocation_total
  from public.commerce_seller_allocations
  where order_id=p_order_id;
  if v_allocation_total <> p_amount_cents then raise exception 'seller_allocation_mismatch'; end if;

  select count(*) into v_invalid_allocation_count
  from (
    select
      coalesce(i.seller_key,a.seller_key) as seller_key,
      coalesce(i.item_gross,0) as item_gross,
      coalesce(a.gross_cents,0) as allocation_gross,
      coalesce(a.seller_net_cents,0)+coalesce(a.platform_fee_cents,0)+coalesce(a.reserve_cents,0) as allocation_parts
    from (
      select seller_key,sum(line_total_cents)::bigint as item_gross
      from public.commerce_order_items
      where order_id=p_order_id
      group by seller_key
    ) i
    full join (
      select seller_key,gross_cents,seller_net_cents,platform_fee_cents,reserve_cents
      from public.commerce_seller_allocations
      where order_id=p_order_id
    ) a on a.seller_key=i.seller_key
  ) reconciled
  where item_gross <> allocation_gross or allocation_parts <> allocation_gross;

  if v_invalid_allocation_count <> 0 then raise exception 'seller_allocation_breakdown_mismatch'; end if;

  insert into public.commerce_payment_transactions(
    order_id,buyer_id,provider,provider_event_id,provider_session_id,provider_payment_id,
    amount_cents,currency,status,verified_at,metadata
  ) values (
    p_order_id,p_buyer_id,'stripe',p_provider_event_id,p_provider_session_id,nullif(p_provider_payment_id,''),
    p_amount_cents,upper(p_currency),'paid',coalesce(p_verified_at,now()),coalesce(p_event_payload,'{}'::jsonb)
  ) returning id into v_transaction_id;

  update public.commerce_orders
    set status='paid',payment_provider='stripe',provider_session_id=p_provider_session_id,
        provider_payment_id=nullif(p_provider_payment_id,''),updated_at=now()
    where id=p_order_id;

  for item_row in
    select * from public.commerce_order_items where order_id=p_order_id order by id
  loop
    insert into public.commerce_entitlements(
      transaction_id,order_id,order_item_id,buyer_id,product_id,entitlement_type,quantity,status,metadata
    ) values (
      v_transaction_id,p_order_id,item_row.id,p_buyer_id,item_row.product_id,'purchase',item_row.quantity,'active',
      jsonb_build_object(
        'sellerKey',item_row.seller_key,
        'productName',item_row.product_name,
        'unitAmountCents',item_row.unit_amount_cents
      ) || coalesce(item_row.metadata,'{}'::jsonb)
    ) on conflict (transaction_id,order_item_id) do nothing;
  end loop;

  select count(*) into v_entitlement_count
  from public.commerce_entitlements
  where transaction_id=v_transaction_id;
  if v_entitlement_count <> v_item_count then raise exception 'entitlement_count_mismatch'; end if;

  insert into public.commerce_ledger_entries(
    transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency
  ) values (
    v_transaction_id,p_order_id,'stripe:'||p_provider_session_id||':clearing',
    'stripe_clearing','debit',p_amount_cents,upper(p_currency)
  );
  v_ledger_count := v_ledger_count + 1;

  for allocation_row in
    select * from public.commerce_seller_allocations where order_id=p_order_id order by seller_key
  loop
    if allocation_row.seller_net_cents > 0 then
      insert into public.commerce_ledger_entries(
        transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency,seller_key
      ) values (
        v_transaction_id,p_order_id,'stripe:'||p_provider_session_id||':seller:'||allocation_row.seller_key,
        'seller_payable','credit',allocation_row.seller_net_cents,upper(p_currency),allocation_row.seller_key
      );
      v_credit_total := v_credit_total + allocation_row.seller_net_cents;
      v_ledger_count := v_ledger_count + 1;
    end if;

    if allocation_row.platform_fee_cents > 0 then
      insert into public.commerce_ledger_entries(
        transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency,seller_key
      ) values (
        v_transaction_id,p_order_id,'stripe:'||p_provider_session_id||':platform:'||allocation_row.seller_key,
        'platform_revenue','credit',allocation_row.platform_fee_cents,upper(p_currency),allocation_row.seller_key
      );
      v_credit_total := v_credit_total + allocation_row.platform_fee_cents;
      v_ledger_count := v_ledger_count + 1;
    end if;

    if allocation_row.reserve_cents > 0 then
      insert into public.commerce_ledger_entries(
        transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency,seller_key
      ) values (
        v_transaction_id,p_order_id,'stripe:'||p_provider_session_id||':reserve:'||allocation_row.seller_key,
        'commerce_reserve','credit',allocation_row.reserve_cents,upper(p_currency),allocation_row.seller_key
      );
      v_credit_total := v_credit_total + allocation_row.reserve_cents;
      v_ledger_count := v_ledger_count + 1;
    end if;
  end loop;

  if v_credit_total <> p_amount_cents then raise exception 'commerce_ledger_unbalanced'; end if;

  update public.commerce_seller_allocations
    set transfer_status='ready',updated_at=now()
    where order_id=p_order_id and transfer_status='blocked';

  update public.commerce_payment_events
    set order_id=p_order_id,processed_at=coalesce(processed_at,now())
    where provider='stripe' and provider_event_id=p_provider_event_id;

  return jsonb_build_object(
    'applied',true,
    'duplicate',false,
    'transactionId',v_transaction_id,
    'entitlements',v_entitlement_count,
    'ledgerEntries',v_ledger_count
  );
end;
$$;

revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from public;
revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from anon;
revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from authenticated;
grant execute on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) to service_role;
