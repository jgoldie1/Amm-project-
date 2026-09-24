-- Server-authoritative Stripe purchase chain:
-- checkout -> verified Stripe event -> transaction -> entitlement -> balanced ledger.
-- Browsers can read their own transaction/entitlement records but cannot create,
-- update, or delete payment authority.

create extension if not exists pgcrypto;

-- Compatibility foundation for the existing commerce API. These are no-ops when
-- the runtime tables already exist.
create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null,
  client_order_id text not null,
  currency text not null default 'USD',
  subtotal_cents bigint not null check (subtotal_cents >= 0),
  fulfillment text not null default 'pickup',
  status text not null default 'pending_payment',
  idempotency_key text not null,
  payment_provider text,
  provider_session_id text,
  provider_payment_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists commerce_orders_buyer_client_uidx on public.commerce_orders(buyer_id,client_order_id);
create unique index if not exists commerce_orders_idempotency_uidx on public.commerce_orders(idempotency_key);
create unique index if not exists commerce_orders_provider_session_uidx on public.commerce_orders(provider_session_id) where provider_session_id is not null;

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id text not null,
  seller_key text not null,
  product_name text not null,
  unit_amount_cents bigint not null check (unit_amount_cents >= 0),
  quantity integer not null check (quantity > 0),
  line_total_cents bigint not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create table if not exists public.commerce_seller_allocations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  seller_key text not null,
  gross_cents bigint not null check (gross_cents >= 0),
  platform_fee_cents bigint not null default 0 check (platform_fee_cents >= 0),
  seller_net_cents bigint not null check (seller_net_cents >= 0),
  transfer_status text not null default 'blocked',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(order_id,seller_key)
);

create table if not exists public.commerce_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null,
  event_type text not null,
  verified boolean not null default false,
  order_id uuid,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists commerce_payment_events_provider_uidx on public.commerce_payment_events(provider,provider_event_id);

create table if not exists public.commerce_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null,
  buyer_id uuid not null,
  provider text not null check (provider in ('stripe')),
  provider_event_id text not null,
  provider_session_id text not null,
  provider_payment_id text,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null,
  status text not null default 'paid' check (status in ('paid','refunded','disputed','reversed')),
  verified_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists commerce_payment_transactions_event_uidx on public.commerce_payment_transactions(provider,provider_event_id);
create unique index if not exists commerce_payment_transactions_session_uidx on public.commerce_payment_transactions(provider,provider_session_id);
create index if not exists commerce_payment_transactions_order_idx on public.commerce_payment_transactions(order_id,created_at desc);

create table if not exists public.commerce_entitlements (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.commerce_payment_transactions(id) on delete restrict,
  order_id uuid not null,
  order_item_id uuid not null,
  buyer_id uuid not null,
  product_id text not null,
  entitlement_type text not null default 'purchase',
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active','fulfilled','revoked','refunded')),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  unique(transaction_id,order_item_id)
);
create index if not exists commerce_entitlements_buyer_idx on public.commerce_entitlements(buyer_id,granted_at desc);

create table if not exists public.commerce_ledger_entries (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.commerce_payment_transactions(id) on delete restrict,
  order_id uuid not null,
  entry_key text not null unique,
  ledger_account text not null,
  direction text not null check (direction in ('debit','credit')),
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null,
  seller_key text,
  created_at timestamptz not null default now()
);
create index if not exists commerce_ledger_transaction_idx on public.commerce_ledger_entries(transaction_id);

alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;
alter table public.commerce_seller_allocations enable row level security;
alter table public.commerce_payment_events enable row level security;
alter table public.commerce_payment_transactions enable row level security;
alter table public.commerce_entitlements enable row level security;
alter table public.commerce_ledger_entries enable row level security;

-- Payment authority is server-only.
revoke insert,update,delete on public.commerce_orders from anon,authenticated;
revoke insert,update,delete on public.commerce_order_items from anon,authenticated;
revoke insert,update,delete on public.commerce_seller_allocations from anon,authenticated;
revoke all on public.commerce_payment_events from anon,authenticated;
revoke all on public.commerce_payment_transactions from anon,authenticated;
revoke all on public.commerce_entitlements from anon,authenticated;
revoke all on public.commerce_ledger_entries from anon,authenticated;
grant select on public.commerce_payment_transactions,public.commerce_entitlements to authenticated;

drop policy if exists commerce_payment_transactions_buyer_read on public.commerce_payment_transactions;
create policy commerce_payment_transactions_buyer_read on public.commerce_payment_transactions
for select to authenticated using (buyer_id = auth.uid());

drop policy if exists commerce_entitlements_buyer_read on public.commerce_entitlements;
create policy commerce_entitlements_buyer_read on public.commerce_entitlements
for select to authenticated using (buyer_id = auth.uid());

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
security definer
set search_path = public
as $$
declare
  v_order public.commerce_orders%rowtype;
  v_transaction_id uuid;
  v_existing_order_id uuid;
  v_allocation_total bigint;
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
  if v_order.buyer_id is distinct from p_buyer_id then raise exception 'stripe_buyer_mismatch'; end if;
  if v_order.subtotal_cents is distinct from p_amount_cents then raise exception 'stripe_amount_mismatch'; end if;
  if upper(coalesce(v_order.currency,'')) <> upper(p_currency) then raise exception 'stripe_currency_mismatch'; end if;
  if coalesce(v_order.status,'') not in ('pending_payment','payment_failed','paid') then raise exception 'commerce_order_not_payable'; end if;

  select coalesce(sum(gross_cents),0) into v_allocation_total
    from public.commerce_seller_allocations where order_id=p_order_id;
  if v_allocation_total <> p_amount_cents then raise exception 'seller_allocation_mismatch'; end if;

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

  for item_row in select * from public.commerce_order_items where order_id=p_order_id
  loop
    insert into public.commerce_entitlements(
      transaction_id,order_id,order_item_id,buyer_id,product_id,entitlement_type,quantity,status,metadata
    ) values (
      v_transaction_id,p_order_id,item_row.id,p_buyer_id,item_row.product_id,'purchase',item_row.quantity,'active',
      jsonb_build_object('sellerKey',item_row.seller_key,'productName',item_row.product_name,'unitAmountCents',item_row.unit_amount_cents)
    ) on conflict (transaction_id,order_item_id) do nothing;
  end loop;
  select count(*) into v_entitlement_count from public.commerce_entitlements where transaction_id=v_transaction_id;

  insert into public.commerce_ledger_entries(
    transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency
  ) values (
    v_transaction_id,p_order_id,'stripe:'||p_provider_session_id||':clearing','stripe_clearing','debit',p_amount_cents,upper(p_currency)
  );
  v_ledger_count := v_ledger_count + 1;

  for allocation_row in select * from public.commerce_seller_allocations where order_id=p_order_id order by seller_key
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
  end loop;
  if v_credit_total <> p_amount_cents then raise exception 'commerce_ledger_unbalanced'; end if;

  update public.commerce_seller_allocations
    set transfer_status='ready',updated_at=now()
    where order_id=p_order_id and transfer_status='blocked';

  update public.commerce_payment_events
    set order_id=p_order_id,processed_at=coalesce(processed_at,now())
    where provider='stripe' and provider_event_id=p_provider_event_id;

  return jsonb_build_object(
    'applied',true,'duplicate',false,'transactionId',v_transaction_id,
    'entitlements',v_entitlement_count,'ledgerEntries',v_ledger_count
  );
end;
$$;

revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from public;
revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from anon;
revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from authenticated;
grant execute on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) to service_role;

comment on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb)
is 'Atomic server-only transition from verified Stripe Checkout evidence to paid order, transaction, purchase entitlements, seller readiness, and balanced ledger entries.';
