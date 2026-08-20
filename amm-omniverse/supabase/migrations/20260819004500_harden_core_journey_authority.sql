-- TRYAMM authoritative core journey hardening
-- Reconciles database constraints with the sandbox Money Engine and Holo Delivery state machine,
-- adds seller/buyer participant visibility, and removes duplicate core indexes.

alter table public.tryamm_orders drop constraint if exists tryamm_orders_status_check;
alter table public.tryamm_orders drop constraint if exists tryamm_orders_total_nonnegative;
alter table public.tryamm_orders add constraint tryamm_orders_status_check check (
  status in (
    'created','payment_pending','paid_sandbox','confirmed','merchant_accepted','preparing',
    'ready_for_pickup','courier_assigned','picked_up','in_transit','arriving','delivered',
    'problem','cancelled','refunded'
  )
);
alter table public.tryamm_orders drop constraint if exists tryamm_orders_currency_check;
alter table public.tryamm_orders add constraint tryamm_orders_currency_check check (currency ~ '^[A-Z]{3}$');

alter table public.tryamm_sandbox_payments drop constraint if exists tryamm_sandbox_payments_status_check;
alter table public.tryamm_sandbox_payments drop constraint if exists tryamm_sandbox_payments_amount_nonnegative;
alter table public.tryamm_sandbox_payments add constraint tryamm_sandbox_payments_status_check check (status in ('recorded','reversed'));
alter table public.tryamm_sandbox_payments drop constraint if exists tryamm_sandbox_payments_currency_check;
alter table public.tryamm_sandbox_payments add constraint tryamm_sandbox_payments_currency_check check (currency ~ '^[A-Z]{3}$');

alter table public.tryamm_delivery_events drop constraint if exists tryamm_delivery_events_state_check;
alter table public.tryamm_delivery_events add constraint tryamm_delivery_events_state_check check (
  state in (
    'confirmed','merchant_accepted','preparing','ready_for_pickup','courier_assigned',
    'picked_up','in_transit','arriving','delivered','problem','cancelled','refunded'
  )
);
alter table public.tryamm_delivery_events drop constraint if exists tryamm_delivery_events_eta_check;
alter table public.tryamm_delivery_events add constraint tryamm_delivery_events_eta_check check (eta_minutes is null or eta_minutes >= 0);

create index if not exists tryamm_audit_target_time_idx
  on public.tryamm_audit_events(target_id, occurred_at desc)
  where target_id is not null;
create index if not exists tryamm_approval_requests_user_created_idx
  on public.tryamm_approval_requests(user_id, created_at desc);
create index if not exists tryamm_delivery_events_actor_time_idx
  on public.tryamm_delivery_events(actor_id, occurred_at desc);

-- The browser may read only rows it participates in. Protected writes are performed by tryamm-core
-- after independently validating the authenticated JWT and action-specific authorization.
drop policy if exists order_buyer_select on public.tryamm_orders;
drop policy if exists order_business_owner_select on public.tryamm_orders;
drop policy if exists order_participant_select on public.tryamm_orders;
create policy order_participant_select
on public.tryamm_orders
for select
to authenticated
using (
  buyer_id = (select auth.uid())
  or (
    business_id is not null and exists (
      select 1
      from public.tryamm_businesses b
      where b.id = tryamm_orders.business_id
        and b.owner_id = (select auth.uid())
    )
  )
);

drop policy if exists delivery_order_owner_select on public.tryamm_delivery_events;
drop policy if exists delivery_business_owner_select on public.tryamm_delivery_events;
drop policy if exists delivery_participant_select on public.tryamm_delivery_events;
create policy delivery_participant_select
on public.tryamm_delivery_events
for select
to authenticated
using (
  exists (
    select 1
    from public.tryamm_orders o
    left join public.tryamm_businesses b on b.id = o.business_id
    where o.id = tryamm_delivery_events.order_id
      and (o.buyer_id = (select auth.uid()) or b.owner_id = (select auth.uid()))
  )
);

-- Remove duplicate indexes retained from earlier iterative migrations.
drop index if exists public.tryamm_audit_actor_idx;
drop index if exists public.tryamm_delivery_order_idx;
drop index if exists public.tryamm_orders_buyer_idx;
