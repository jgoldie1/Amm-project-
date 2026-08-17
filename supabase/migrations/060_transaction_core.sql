-- TRYAMM transactional core: inventory reservations, webhook idempotency, domain events and outbox.

create table if not exists public.marketplace_inventory_reservations(
  id uuid primary key default gen_random_uuid(),
  product_id text not null references public.marketplace_products(id) on delete cascade,
  order_id text not null references public.marketplace_orders(id) on delete cascade,
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
  created_at timestamptz not null default now()
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

create or replace function public.reserve_marketplace_inventory(
  p_product_id text,
  p_order_id text,
  p_quantity integer,
  p_expires_at timestamptz
) returns jsonb
language plpgsql security definer set search_path=public as $$
declare
  v_stock bigint;
  v_reserved bigint;
begin
  if p_quantity is null or p_quantity <= 0 then raise exception 'invalid_quantity'; end if;
  select stock into v_stock from public.marketplace_products where id=p_product_id and active=true for update;
  if not found then raise exception 'product_not_found'; end if;
  if v_stock is null then
    return jsonb_build_object('reserved',true,'digital',true,'available',null);
  end if;
  update public.marketplace_inventory_reservations set status='expired'
    where product_id=p_product_id and status='reserved' and expires_at<=now();
  select coalesce(sum(quantity),0) into v_reserved from public.marketplace_inventory_reservations
    where product_id=p_product_id and status='reserved' and expires_at>now();
  if v_stock-v_reserved < p_quantity then
    return jsonb_build_object('reserved',false,'reason','insufficient_stock','available',greatest(v_stock-v_reserved,0));
  end if;
  insert into public.marketplace_inventory_reservations(product_id,order_id,quantity,expires_at)
  values(p_product_id,p_order_id,p_quantity,p_expires_at)
  on conflict(order_id,product_id) do update set quantity=excluded.quantity,expires_at=excluded.expires_at,status='reserved',released_at=null;
  return jsonb_build_object('reserved',true,'digital',false,'available',v_stock-v_reserved-p_quantity);
end;$$;

create or replace function public.commit_marketplace_order(p_order_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare
  r record;
  v_order public.marketplace_orders%rowtype;
begin
  select * into v_order from public.marketplace_orders where id=p_order_id for update;
  if not found then raise exception 'order_not_found'; end if;
  if v_order.status='paid' then return jsonb_build_object('ok',true,'idempotent',true); end if;
  for r in select * from public.marketplace_inventory_reservations where order_id=p_order_id and status='reserved' for update loop
    if r.expires_at<=now() then raise exception 'reservation_expired'; end if;
    update public.marketplace_products set stock=greatest(0,stock-r.quantity),updated_at=now() where id=r.product_id and stock is not null;
    update public.marketplace_inventory_reservations set status='committed',committed_at=now() where id=r.id;
  end loop;
  update public.marketplace_orders set status='paid',inventory_applied=true,paid_at=coalesce(paid_at,now()),updated_at=now() where id=p_order_id;
  return jsonb_build_object('ok',true,'idempotent',false);
end;$$;

create or replace function public.release_marketplace_reservation(p_order_id text,p_status text default 'released')
returns integer language plpgsql security definer set search_path=public as $$
declare v_count integer;
begin
  update public.marketplace_inventory_reservations
     set status=case when p_status='expired' then 'expired' else 'released' end,released_at=now()
   where order_id=p_order_id and status='reserved';
  get diagnostics v_count=row_count;
  return v_count;
end;$$;

revoke all on function public.reserve_marketplace_inventory(text,text,integer,timestamptz) from public;
revoke all on function public.commit_marketplace_order(text) from public;
revoke all on function public.release_marketplace_reservation(text,text) from public;
