begin;

alter table public.streetverse_storefronts
  add column if not exists stripe_connected_account_id text,
  add column if not exists stripe_transfers_enabled boolean not null default false,
  add column if not exists payout_status text not null default 'not-connected'
    check (payout_status in ('not-connected','onboarding','restricted','ready','paused'));

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users(id) on delete restrict,
  storefront_id uuid not null references public.streetverse_storefronts(id) on delete restrict,
  seller_user_id uuid not null references auth.users(id) on delete restrict,
  order_type text not null check (order_type in ('goods','service','booking','promotion','business-pro')),
  currency text not null default 'USD',
  gross_amount_cents bigint not null check (gross_amount_cents > 0),
  platform_fee_cents bigint not null check (platform_fee_cents >= 0),
  seller_amount_cents bigint not null check (seller_amount_cents >= 0),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text,
  stripe_charge_id text,
  status text not null default 'created' check (status in ('created','checkout-open','paid','fulfilled','refunded','disputed','cancelled')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (platform_fee_cents + seller_amount_cents = gross_amount_cents)
);

create table if not exists public.marketplace_platform_revenue (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.marketplace_orders(id) on delete restrict,
  revenue_type text not null check (revenue_type in ('transaction-fee','subscription','promotion','software','other')),
  amount_cents bigint not null check (amount_cents >= 0),
  currency text not null default 'USD',
  recognized_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.marketplace_orders enable row level security;
alter table public.marketplace_platform_revenue enable row level security;

create policy "orders_buyer_or_seller_read" on public.marketplace_orders
for select to authenticated using (auth.uid() = buyer_user_id or auth.uid() = seller_user_id);

create policy "platform_revenue_no_client_access" on public.marketplace_platform_revenue
for select to authenticated using (false);

create index if not exists marketplace_orders_storefront_created_idx on public.marketplace_orders(storefront_id, created_at desc);
create index if not exists marketplace_orders_seller_status_idx on public.marketplace_orders(seller_user_id, status);
create index if not exists marketplace_orders_buyer_status_idx on public.marketplace_orders(buyer_user_id, status);

commit;
