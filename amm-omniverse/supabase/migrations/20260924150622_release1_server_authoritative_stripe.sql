-- Release 1: server-authoritative Stripe commerce finalization.
-- Reconciles the repository with the production commerce schema created on 2026-09-03.
-- Browser/client code may request checkout only. Only a verified Stripe webhook
-- using the server-only Supabase role may create payment transactions, entitlements,
-- or Money Engine ledger postings.

create extension if not exists pgcrypto;

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  client_order_id text not null,
  currency text not null default 'USD',
  subtotal_cents integer not null check (subtotal_cents >= 0),
  fulfillment text not null check (fulfillment in ('pickup','delivery')),
  status text not null default 'pending_payment' check (
    status in (
      'pending_payment','payment_processing','paid','payment_failed','cancelled',
      'fulfilling','ready_for_pickup','out_for_delivery','completed','refunded'
    )
  ),
  payment_provider text,
  provider_session_id text,
  provider_payment_id text,
  idempotency_key text not null unique,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (buyer_id, client_order_id)
);

create unique index if not exists commerce_orders_provider_session_uidx
  on public.commerce_orders(provider_session_id)
  where provider_session_id is not null;
create index if not exists commerce_orders_buyer_created_idx
  on public.commerce_orders(buyer_id,created_at desc);

create table if not exists public.commerce_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  product_id text not null,
  seller_key text not null,
  product_name text not null,
  unit_amount_cents integer not null check (unit_amount_cents >= 0),
  quantity integer not null check (quantity between 1 and 25),
  line_total_cents integer not null check (line_total_cents >= 0),
  created_at timestamptz not null default now()
);

create index if not exists commerce_order_items_order_idx on public.commerce_order_items(order_id);

create table if not exists public.commerce_seller_allocations (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete cascade,
  seller_key text not null,
  gross_cents integer not null check (gross_cents >= 0),
  platform_fee_cents integer not null default 0 check (platform_fee_cents >= 0),
  seller_net_cents integer not null check (seller_net_cents >= 0),
  transfer_status text not null default 'blocked' check (
    transfer_status in ('blocked','ready','transferring','transferred','failed','reversed')
  ),
  connected_account_id text,
  provider_transfer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (order_id, seller_key)
);

create index if not exists commerce_allocations_order_idx
  on public.commerce_seller_allocations(order_id);

create table if not exists public.commerce_payment_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  provider_event_id text not null unique,
  order_id uuid references public.commerce_orders(id) on delete set null,
  event_type text not null,
  verified boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index if not exists commerce_payment_events_provider_uidx
  on public.commerce_payment_events(provider,provider_event_id);
create index if not exists commerce_payment_events_order_idx
  on public.commerce_payment_events(order_id,created_at desc);

create table if not exists public.commerce_payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  provider text not null check (provider='stripe'),
  provider_event_id text not null,
  provider_session_id text not null,
  provider_payment_id text,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null,
  status text not null default 'paid' check (status in ('paid','refunded','disputed','reversed')),
  verified_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  posting_id uuid,
  created_at timestamptz not null default now()
);

alter table public.commerce_payment_transactions
  add column if not exists posting_id uuid;

create unique index if not exists commerce_payment_transactions_event_uidx
  on public.commerce_payment_transactions(provider,provider_event_id);
create unique index if not exists commerce_payment_transactions_session_uidx
  on public.commerce_payment_transactions(provider,provider_session_id);
create unique index if not exists commerce_payment_transactions_order_uidx
  on public.commerce_payment_transactions(order_id);
create index if not exists commerce_payment_transactions_order_idx
  on public.commerce_payment_transactions(order_id,created_at desc);

create table if not exists public.commerce_entitlements (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.commerce_payment_transactions(id) on delete restrict,
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  order_item_id uuid not null references public.commerce_order_items(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  product_id text not null,
  entitlement_type text not null default 'purchase',
  quantity integer not null check (quantity > 0),
  status text not null default 'active' check (status in ('active','fulfilled','revoked','refunded')),
  metadata jsonb not null default '{}'::jsonb,
  granted_at timestamptz not null default now(),
  unique (transaction_id, order_item_id)
);

create index if not exists commerce_entitlements_buyer_idx
  on public.commerce_entitlements(buyer_id,granted_at desc);

alter table public.commerce_orders enable row level security;
alter table public.commerce_order_items enable row level security;
alter table public.commerce_seller_allocations enable row level security;
alter table public.commerce_payment_events enable row level security;
alter table public.commerce_payment_transactions enable row level security;
alter table public.commerce_entitlements enable row level security;

do $$ begin
  create policy "commerce_orders_buyer_read" on public.commerce_orders
    for select to authenticated using ((select auth.uid()) = buyer_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "commerce_order_items_buyer_read" on public.commerce_order_items
    for select to authenticated using (
      exists (
        select 1 from public.commerce_orders o
        where o.id = commerce_order_items.order_id
          and o.buyer_id = (select auth.uid())
      )
    );
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "commerce_payment_transactions_buyer_read" on public.commerce_payment_transactions
    for select to authenticated using ((select auth.uid()) = buyer_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "commerce_entitlements_buyer_read" on public.commerce_entitlements
    for select to authenticated using ((select auth.uid()) = buyer_id);
exception when duplicate_object then null; end $$;

revoke all on table
  public.commerce_orders,
  public.commerce_order_items,
  public.commerce_seller_allocations,
  public.commerce_payment_events,
  public.commerce_payment_transactions,
  public.commerce_entitlements
from anon, authenticated;

grant select on table
  public.commerce_orders,
  public.commerce_order_items,
  public.commerce_payment_transactions,
  public.commerce_entitlements
to authenticated;

grant select, insert, update, delete on table
  public.commerce_orders,
  public.commerce_order_items,
  public.commerce_seller_allocations,
  public.commerce_payment_events,
  public.commerce_payment_transactions,
  public.commerce_entitlements
to service_role;

create or replace function public.commerce_finalize_stripe_checkout(
  p_order_id uuid,
  p_buyer_id uuid,
  p_client_reference_id text,
  p_provider_event_id text,
  p_event_type text,
  p_provider_session_id text,
  p_provider_payment_id text,
  p_amount_cents bigint,
  p_currency text,
  p_payment_status text,
  p_event_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_order public.commerce_orders%rowtype;
  v_tx public.commerce_payment_transactions%rowtype;
  v_posting uuid;
  v_entitlement_count integer := 0;
begin
  if p_order_id is null
     or p_buyer_id is null
     or coalesce(p_provider_event_id,'') = ''
     or coalesce(p_provider_session_id,'') = ''
     or p_amount_cents is null
     or p_amount_cents <= 0 then
    raise exception 'invalid_stripe_finalize_input';
  end if;

  select * into v_order
  from public.commerce_orders
  where id = p_order_id
  for update;

  if not found then raise exception 'commerce_order_not_found'; end if;
  if v_order.buyer_id <> p_buyer_id then raise exception 'stripe_buyer_mismatch'; end if;
  if coalesce(p_client_reference_id,'') <> p_order_id::text then raise exception 'stripe_client_reference_mismatch'; end if;
  if coalesce(v_order.payment_provider,'') <> 'stripe' then raise exception 'stripe_order_provider_mismatch'; end if;
  if coalesce(v_order.provider_session_id,'') = '' then raise exception 'stripe_session_not_bound'; end if;
  if v_order.provider_session_id <> p_provider_session_id then raise exception 'stripe_session_mismatch'; end if;
  if v_order.status not in ('payment_processing','paid') then raise exception 'stripe_order_state_invalid'; end if;
  if p_amount_cents <> v_order.subtotal_cents then raise exception 'stripe_amount_mismatch'; end if;
  if upper(coalesce(p_currency,'')) <> upper(v_order.currency) then raise exception 'stripe_currency_mismatch'; end if;
  if lower(coalesce(p_payment_status,'')) <> 'paid' then raise exception 'stripe_payment_not_paid'; end if;

  insert into public.commerce_payment_events(
    provider,provider_event_id,order_id,event_type,verified,payload
  ) values (
    'stripe',p_provider_event_id,p_order_id,coalesce(p_event_type,'unknown'),true,coalesce(p_event_payload,'{}'::jsonb)
  )
  on conflict (provider_event_id) do update
    set verified = true,
        order_id = excluded.order_id,
        event_type = excluded.event_type,
        payload = excluded.payload;

  select * into v_tx
  from public.commerce_payment_transactions
  where order_id = p_order_id;

  if found then
    if v_tx.provider <> 'stripe'
       or v_tx.provider_session_id <> p_provider_session_id
       or v_tx.amount_cents <> p_amount_cents
       or upper(v_tx.currency) <> upper(p_currency) then
      raise exception 'commerce_transaction_conflict';
    end if;

    update public.commerce_payment_events
      set processed_at = coalesce(processed_at,now())
      where provider_event_id = p_provider_event_id;

    return jsonb_build_object(
      'matched',true,
      'already_finalized',true,
      'order_id',p_order_id,
      'transaction_id',v_tx.id,
      'posting_id',v_tx.posting_id
    );
  end if;

  insert into public.commerce_payment_transactions(
    order_id,buyer_id,provider,provider_event_id,provider_session_id,provider_payment_id,
    amount_cents,currency,status,verified_at,metadata
  ) values (
    p_order_id,p_buyer_id,'stripe',p_provider_event_id,p_provider_session_id,nullif(p_provider_payment_id,''),
    p_amount_cents,upper(p_currency),'paid',now(),
    jsonb_build_object('event_type',coalesce(p_event_type,'unknown'))
  )
  returning * into v_tx;

  insert into public.commerce_entitlements(
    transaction_id,order_id,order_item_id,buyer_id,product_id,
    entitlement_type,quantity,status,metadata
  )
  select
    v_tx.id,
    p_order_id,
    oi.id,
    p_buyer_id,
    oi.product_id,
    'purchase',
    oi.quantity,
    'active',
    jsonb_build_object('seller_key',oi.seller_key)
  from public.commerce_order_items oi
  where oi.order_id = p_order_id
  on conflict (transaction_id,order_item_id) do nothing;

  get diagnostics v_entitlement_count = row_count;

  select public.money_engine_post(
    p_buyer_id,
    'commerce_order',
    p_order_id::text,
    upper(p_currency),
    jsonb_build_array(
      jsonb_build_object('ledger_account','stripe_processor_clearing','direction','debit','amount_minor',p_amount_cents),
      jsonb_build_object('ledger_account','commerce_seller_payable','direction','credit','amount_minor',p_amount_cents)
    ),
    jsonb_build_object(
      'provider','stripe',
      'provider_event_id',p_provider_event_id,
      'provider_session_id',p_provider_session_id,
      'transaction_id',v_tx.id
    )
  ) into v_posting;

  update public.commerce_payment_transactions
    set posting_id = v_posting
    where id = v_tx.id;

  update public.commerce_orders
    set status='paid',
        payment_provider='stripe',
        provider_session_id=p_provider_session_id,
        provider_payment_id=nullif(p_provider_payment_id,''),
        updated_at=now(),
        metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
          'stripe_event_id',p_provider_event_id,
          'payment_status','paid'
        )
    where id=p_order_id;

  update public.commerce_seller_allocations
    set transfer_status='ready',updated_at=now()
    where order_id=p_order_id and transfer_status='blocked';

  update public.commerce_payment_events
    set processed_at=now()
    where provider_event_id=p_provider_event_id;

  return jsonb_build_object(
    'matched',true,
    'already_finalized',false,
    'order_id',p_order_id,
    'transaction_id',v_tx.id,
    'entitlement_count',v_entitlement_count,
    'posting_id',v_posting
  );
end;
$$;

revoke all on function public.commerce_finalize_stripe_checkout(uuid,uuid,text,text,text,text,text,bigint,text,text,jsonb) from public;
revoke all on function public.commerce_finalize_stripe_checkout(uuid,uuid,text,text,text,text,text,bigint,text,text,jsonb) from anon;
revoke all on function public.commerce_finalize_stripe_checkout(uuid,uuid,text,text,text,text,text,bigint,text,text,jsonb) from authenticated;
grant execute on function public.commerce_finalize_stripe_checkout(uuid,uuid,text,text,text,text,text,bigint,text,text,jsonb) to service_role;
