-- STAGING ONLY. Adds a one-attempt Stripe test-mode Checkout reservation.
-- Keep checkout disabled until staging concurrency and recovery tests pass.
alter table public.tryamm_website_orders
 add column if not exists checkout_attempt_id uuid,
 add column if not exists checkout_reserved_at timestamptz;
create unique index if not exists tryamm_checkout_attempt_unique
 on public.tryamm_website_orders(checkout_attempt_id) where checkout_attempt_id is not null;

create or replace function public.tryamm_reserve_order_checkout(p_order_id uuid,p_owner_id text)
returns jsonb language plpgsql security invoker set search_path=''
as $$
declare o public.tryamm_website_orders%rowtype;
begin
 select * into o from public.tryamm_website_orders
 where id=p_order_id and owner_id=p_owner_id for update;
 if not found then raise exception 'Order not found'; end if;
 if o.status not in ('customer-accepted','payment-pending')
 then raise exception 'Customer acceptance is required'; end if;
 if o.customer_accepted_at is null then raise exception 'Customer acceptance proof required'; end if;
 if o.checkout_attempt_id is not null then
  return jsonb_build_object('attemptId',o.checkout_attempt_id,'sessionId',o.stripe_session_id,'reserved',false);
 end if;
 update public.tryamm_website_orders
 set checkout_attempt_id=extensions.gen_random_uuid(),checkout_reserved_at=now(),updated_at=now()
 where id=o.id returning * into o;
 return jsonb_build_object('attemptId',o.checkout_attempt_id,'sessionId',o.stripe_session_id,'reserved',true);
end $$;

create or replace function public.tryamm_bind_order_checkout(
 p_order_id uuid,p_owner_id text,p_attempt_id uuid,p_session_id text
) returns jsonb language plpgsql security invoker set search_path=''
as $$
declare o public.tryamm_website_orders%rowtype;
begin
 if p_session_id !~ '^cs_test_[a-zA-Z0-9_]+$' then raise exception 'Test mode only'; end if;
 select * into o from public.tryamm_website_orders
 where id=p_order_id and owner_id=p_owner_id for update;
 if not found then raise exception 'Order not found'; end if;
 if o.checkout_attempt_id is distinct from p_attempt_id or o.customer_accepted_at is null
 then raise exception 'Invalid reserved checkout attempt'; end if;
 if o.stripe_session_id is not null then
  if o.stripe_session_id=p_session_id then
   return jsonb_build_object('bound',true,'alreadyBound',true);
  end if;
  raise exception 'Checkout already linked to a different Stripe session';
 end if;
 if o.status <> 'customer-accepted' then raise exception 'Order no longer payable'; end if;
 update public.tryamm_website_orders set stripe_session_id=p_session_id,status='payment-pending',updated_at=now()
 where id=o.id;
 return jsonb_build_object('bound',true,'alreadyBound',false);
end $$;
revoke all on function public.tryamm_reserve_order_checkout(uuid,text) from public,anon,authenticated;
revoke all on function public.tryamm_bind_order_checkout(uuid,text,uuid,text) from public,anon,authenticated;
grant execute on function public.tryamm_reserve_order_checkout(uuid,text) to service_role;
grant execute on function public.tryamm_bind_order_checkout(uuid,text,uuid,text) to service_role;
-- Do not automatically clear a reservation after a timeout: Stripe may have created
-- the Checkout session even if the response was lost. Reconcile by idempotency key first.
