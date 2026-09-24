-- Applied to production as Supabase migration 20260924213641_allow_digital_commerce_fulfillment.
-- Adds digital delivery semantics without changing existing pickup/delivery rows.

alter table public.commerce_orders
  drop constraint if exists commerce_orders_fulfillment_check;

alter table public.commerce_orders
  add constraint commerce_orders_fulfillment_check
  check (fulfillment in ('pickup','delivery','digital'));
