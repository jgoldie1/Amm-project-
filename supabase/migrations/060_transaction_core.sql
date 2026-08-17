-- TRYAMM transactional core.
-- This ledger intentionally uses platform text IDs so the existing TRYAMM auth system
-- can be hardened now without pretending its usr_* identifiers are Supabase auth UUIDs.

create table if not exists public.marketplace_inventory_state(
  product_id text primary key,
  stock bigint,
  active boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.marketplace_inventory_state enable row level security;

create table if not exists public.marketplace_transaction_orders(
  order_id text primary key,
  buyer_id text not null,
  merchant_id text not null,
  product_id text not null,
  quantity integer not null check(quantity between 1 and 99),
  subtotal_cents bigint not null check(subtotal_cents>=0),
  platform_fee_cents bigint not null default 0 check(platform_fee_cents>=0),
  currency text not null default 'usd',
  stripe_session_id text,
  stripe_payment_status text,
  status text not null default 'created',
  inventory_applied boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz
);
create index if not exists marketplace_transaction_orders_buyer_idx on public.marketplace_transaction_orders(buyer_id,created_at desc);
create index if not exists marketplace_transaction_orders_merchant_idx on public.marketplace_transaction_orders(merchant_id,created_at desc);
alter table public.marketplace_transaction_orders enable row level security;

create table if not exists public.marketplace_inventory_reservations(
  id uuid primary key default gen_random_uuid(),
  product_id text not null,
  order_id text not null references public.marketplace_transaction_orders(order_id) on delete cascade,
  quantity integer not null check(quantity > 0),
  status text not null default 'reserved' check(status in ('reserved','committed','released','expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  committed_at timestamptz,
  released_at timestamptz,
  unique(order_id, product_id)
);
create index if not exists marketplace_inventory_reservations_product_idx on public.marketplace_inventory_reservations(product_id,status,expires_at);
create index if not exists marketplace_inventory_reservations_order_idx on public.marketplace_inventory_reservations(order_id,status);
alter table public.marketplace_inventory_reservations enable row level security;

create table if not exists public.provider_webhook_events(
  provider text not null,
  event_id text not null,
  event_type text not null,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  status text not null default 'received' check(status in ('received','processed','failed','ignored')),
  attempts integer not null default 0,
  payload jsonb not null default '{}'::jsonb,
  last_error text,
  primary key(provider,event_id)
);
alter table public.provider_webhook_events enable row level security;

create table if not exists public.domain_events(
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id text not null,
  idempotency_key text not null unique,
  payload jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  processed_at timestamptz
);
create index if not exists domain_events_aggregate_idx on public.domain_events(aggregate_type,aggregate_id,occurred_at desc);
alter table public.domain_events enable row level security;

create table if not exists public.outbox_messages(
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.domain_events(id) on delete cascade,
  topic text not null,
  destination text,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check(status in ('pending','processing','delivered','failed','dead-letter')),
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  locked_at timestamptz,
  delivered_at timestamptz,
  last_error text,
  created_at timestamptz not null default now(),
  unique(event_id,topic,destination)
);
create index if not exists outbox_pending_idx on public.outbox_messages(status,next_attempt_at,created_at);
alter table public.outbox_messages enable row level security;

create table if not exists public.idempotency_keys(
  scope text not null,
  key text not null,
  request_hash text,
  response_code integer,
  response_body jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now()+interval '24 hours'),
  primary key(scope,key)
);
alter table public.idempotency_keys enable row level security;

create or replace function public.upsert_marketplace_inventory(p_product_id text,p_stock bigint,p_active boolean default true)
returns void language sql security definer set search_path=public as $$
  insert into public.marketplace_inventory_state(product_id,stock,active,updated_at)
  values(p_product_id,p_stock,coalesce(p_active,true),now())
  on conflict(product_id) do update set stock=excluded.stock,active=excluded.active,updated_at=now();
$$;

create or replace function public.create_marketplace_transaction_order(
  p_order_id text,p_buyer_id text,p_merchant_id text,p_product_id text,p_quantity integer,
  p_subtotal_cents bigint,p_platform_fee_cents bigint,p_currency text
) returns jsonb language plpgsql security definer set search_path=public as $$
begin
  insert into public.marketplace_transaction_orders(order_id,buyer_id,merchant_id,product_id,quantity,subtotal_cents,platform_fee_cents,currency,status)
  values(p_order_id,p_buyer_id,p_merchant_id,p_product_id,p_quantity,p_subtotal_cents,p_platform_fee_cents,lower(coalesce(p_currency,'usd')),'created')
  on conflict(order_id) do nothing;
  return jsonb_build_object('ok',true,'order_id',p_order_id);
end;$$;

create or replace function public.set_marketplace_checkout_session(p_order_id text,p_session_id text)
returns void language sql security definer set search_path=public as $$
  update public.marketplace_transaction_orders set stripe_session_id=p_session_id,status='checkout_created',updated_at=now() where order_id=p_order_id;
$$;

create or replace function public.reserve_marketplace_inventory(
  p_product_id text,p_order_id text,p_quantity integer,p_expires_at timestamptz
) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_stock bigint;v_reserved bigint;
begin
  if p_quantity is null or p_quantity<=0 then raise exception 'invalid_quantity';end if;
  select stock into v_stock from public.marketplace_inventory_state where product_id=p_product_id and active=true for update;
  if not found then raise exception 'inventory_state_missing';end if;
  if v_stock is null then return jsonb_build_object('reserved',true,'digital',true,'available',null);end if;
  update public.marketplace_inventory_reservations set status='expired',released_at=now()
   where product_id=p_product_id and status='reserved' and expires_at<=now();
  select coalesce(sum(quantity),0) into v_reserved from public.marketplace_inventory_reservations
   where product_id=p_product_id and status='reserved' and expires_at>now();
  if v_stock-v_reserved<p_quantity then return jsonb_build_object('reserved',false,'reason','insufficient_stock','available',greatest(v_stock-v_reserved,0));end if;
  insert into public.marketplace_inventory_reservations(product_id,order_id,quantity,expires_at)
  values(p_product_id,p_order_id,p_quantity,p_expires_at)
  on conflict(order_id,product_id) do update set quantity=excluded.quantity,expires_at=excluded.expires_at,status='reserved',released_at=null;
  return jsonb_build_object('reserved',true,'digital',false,'available',v_stock-v_reserved-p_quantity);
end;$$;

create or replace function public.commit_marketplace_order(p_order_id text,p_payment_status text default 'paid')
returns jsonb language plpgsql security definer set search_path=public as $$
declare r record;v_status text;
begin
  select status into v_status from public.marketplace_transaction_orders where order_id=p_order_id for update;
  if not found then raise exception 'order_not_found';end if;
  if v_status='paid' then return jsonb_build_object('ok',true,'idempotent',true);end if;
  for r in select * from public.marketplace_inventory_reservations where order_id=p_order_id and status='reserved' for update loop
    if r.expires_at<=now() then raise exception 'reservation_expired';end if;
    update public.marketplace_inventory_state set stock=greatest(0,stock-r.quantity),updated_at=now() where product_id=r.product_id and stock is not null;
    update public.marketplace_inventory_reservations set status='committed',committed_at=now() where id=r.id;
  end loop;
  update public.marketplace_transaction_orders set status='paid',stripe_payment_status=p_payment_status,inventory_applied=true,paid_at=coalesce(paid_at,now()),updated_at=now() where order_id=p_order_id;
  return jsonb_build_object('ok',true,'idempotent',false);
end;$$;

create or replace function public.release_marketplace_reservation(p_order_id text,p_status text default 'released')
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  update public.marketplace_inventory_reservations set status=case when p_status='expired' then 'expired' else 'released' end,released_at=now()
   where order_id=p_order_id and status='reserved';get diagnostics v_count=row_count;
  update public.marketplace_transaction_orders set status=case when p_status='expired' then 'expired' else 'payment_failed' end,updated_at=now() where order_id=p_order_id and status<>'paid';
  return v_count;
end;$$;

revoke all on function public.upsert_marketplace_inventory(text,bigint,boolean) from public;
revoke all on function public.create_marketplace_transaction_order(text,text,text,text,integer,bigint,bigint,text) from public;
revoke all on function public.set_marketplace_checkout_session(text,text) from public;
revoke all on function public.reserve_marketplace_inventory(text,text,integer,timestamptz) from public;
revoke all on function public.commit_marketplace_order(text,text) from public;
revoke all on function public.release_marketplace_reservation(text,text) from public;
