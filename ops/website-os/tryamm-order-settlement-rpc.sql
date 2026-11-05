-- PRE-RELEASE REVIEW ONLY. Apply after schema backup, staging tests, and owner approval.
-- Invoked solely by a server-side Stripe-verified adapter with Supabase service_role.
-- No PUBLIC/anon/authenticated execution, no browser keys.
create table if not exists public.tryamm_order_payment_events (
 id text primary key,
 order_id uuid not null references public.tryamm_website_orders(id),
 stripe_session_id text not null,
 amount_cents integer not null,
 currency text not null,
 recorded_at timestamptz not null default now()
);
create table if not exists public.tryamm_order_outbox (
 id uuid primary key default gen_random_uuid(),
 order_id uuid not null references public.tryamm_website_orders(id),
 event_type text not null check(event_type in ('order.payment_verified')),
 status text not null default 'pending' check(status in ('pending','processing','delivered','failed')),
 created_at timestamptz not null default now(),
 unique(order_id,event_type)
);
alter table public.tryamm_order_payment_events enable row level security;
alter table public.tryamm_order_outbox enable row level security;
revoke all on public.tryamm_order_payment_events from public,anon,authenticated;
revoke all on public.tryamm_order_outbox from public,anon,authenticated;
grant select,insert on public.tryamm_order_payment_events to service_role;
grant select,insert,update on public.tryamm_order_outbox to service_role;

create or replace function public.tryamm_settle_website_order(
 p_order_id uuid,
 p_session_id text,
 p_event_id text,
 p_amount_cents integer,
 p_currency text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
 v_order public.tryamm_website_orders%rowtype;
 v_applied boolean := false;
begin
 if p_session_id !~ '^cs_(test_|live_)[a-zA-Z0-9_]+$'
 or p_event_id !~ '^evt_[a-zA-Z0-9]+$'
 or p_amount_cents is null or p_amount_cents <= 0
 then raise exception 'Invalid Stripe settlement evidence'; end if;
 select * into v_order from public.tryamm_website_orders where id=p_order_id for update;
 if not found then raise exception 'Website order not found'; end if;
 if v_order.stripe_session_id is distinct from p_session_id
 or v_order.price_cents <> p_amount_cents
 or v_order.currency <> lower(p_currency)
 then raise exception 'Session or amount does not match approved order'; end if;
 if v_order.status in ('paid-verified','building','review-ready','delivered','refunded') then
  return jsonb_build_object('applied',false,'reason','ALREADY_SETTLED','orderId',p_order_id);
 end if;
 if v_order.status <> 'payment-pending' or v_order.customer_accepted_at is null then
  raise exception 'Customer acceptance and payment-pending order required'; end if;
 insert into public.tryamm_order_payment_events(id,order_id,stripe_session_id,amount_cents,currency)
 values(p_event_id,p_order_id,p_session_id,p_amount_cents,lower(p_currency))
 on conflict (id) do nothing;
 if not found then raise exception 'Duplicate Stripe event ID already recorded for another attempt'; end if;
 update public.tryamm_website_orders
 set status='paid-verified',verified_paid_at=now(),updated_at=now()
 where id=p_order_id and status='payment-pending';
 if not found then raise exception 'Concurrent settlement conflict'; end if;
 insert into public.tryamm_order_outbox(order_id,event_type)
 values(p_order_id,'order.payment_verified')
 on conflict(order_id,event_type) do nothing;
 v_applied := true;
 return jsonb_build_object('applied',v_applied,'reason','PAYMENT_VERIFIED','orderId',p_order_id);
end $$;
revoke all on function public.tryamm_settle_website_order(uuid,text,text,integer,text) from public,anon,authenticated;
grant execute on function public.tryamm_settle_website_order(uuid,text,text,integer,text) to service_role;
-- Must be exercised against a staging DB with two concurrent webhook deliveries
-- before enabling any production payment flag.
