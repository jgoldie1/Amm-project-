create table if not exists public.marketplace_merchants(
 id text primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 store_name text not null,
 slug text not null unique,
 legal_business_name text,
 description text,
 country text not null default 'US',
 categories jsonb not null default '[]'::jsonb,
 logo_url text,
 banner_url text,
 status text not null default 'pending' check(status in ('pending','approved','rejected','suspended')),
 stripe_account_id text,
 stripe_onboarding_complete boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 reviewed_at timestamptz
);

create table if not exists public.marketplace_products(
 id text primary key,
 merchant_id text not null references public.marketplace_merchants(id) on delete cascade,
 store_slug text not null,
 name text not null,
 description text,
 product_type text not null check(product_type in ('product','service','digital')),
 price_cents bigint not null check(price_cents >= 50),
 currency text not null default 'usd',
 image_url text,
 stock bigint,
 active boolean not null default true,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders(
 id text primary key,
 buyer_id uuid not null references auth.users(id) on delete restrict,
 merchant_id text not null references public.marketplace_merchants(id) on delete restrict,
 product_id text not null references public.marketplace_products(id) on delete restrict,
 quantity integer not null default 1 check(quantity between 1 and 99),
 subtotal_cents bigint not null check(subtotal_cents >= 0),
 platform_fee_cents bigint not null default 0 check(platform_fee_cents >= 0),
 status text not null default 'checkout_created',
 stripe_session_id text,
 stripe_payment_status text,
 inventory_applied boolean not null default false,
 paid_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

alter table public.marketplace_merchants enable row level security;
alter table public.marketplace_products enable row level security;
alter table public.marketplace_orders enable row level security;

create policy "marketplace merchant owner read" on public.marketplace_merchants for select using(auth.uid()=user_id or status='approved');
create policy "marketplace merchant owner insert" on public.marketplace_merchants for insert with check(auth.uid()=user_id);
create policy "marketplace merchant owner update" on public.marketplace_merchants for update using(auth.uid()=user_id) with check(auth.uid()=user_id);

create policy "marketplace products public read" on public.marketplace_products for select using(active=true);
create policy "marketplace products merchant insert" on public.marketplace_products for insert with check(exists(select 1 from public.marketplace_merchants m where m.id=merchant_id and m.user_id=auth.uid() and m.status='approved'));
create policy "marketplace products merchant update" on public.marketplace_products for update using(exists(select 1 from public.marketplace_merchants m where m.id=merchant_id and m.user_id=auth.uid())) with check(exists(select 1 from public.marketplace_merchants m where m.id=merchant_id and m.user_id=auth.uid()));

create policy "marketplace orders buyer seller read" on public.marketplace_orders for select using(auth.uid()=buyer_id or exists(select 1 from public.marketplace_merchants m where m.id=merchant_id and m.user_id=auth.uid()));
create policy "marketplace orders buyer insert" on public.marketplace_orders for insert with check(auth.uid()=buyer_id);

create index if not exists marketplace_merchants_user_idx on public.marketplace_merchants(user_id,updated_at desc);
create index if not exists marketplace_merchants_status_idx on public.marketplace_merchants(status,updated_at desc);
create index if not exists marketplace_products_merchant_idx on public.marketplace_products(merchant_id,active,updated_at desc);
create index if not exists marketplace_products_store_idx on public.marketplace_products(store_slug,active,updated_at desc);
create index if not exists marketplace_orders_buyer_idx on public.marketplace_orders(buyer_id,created_at desc);
create index if not exists marketplace_orders_merchant_idx on public.marketplace_orders(merchant_id,created_at desc);
