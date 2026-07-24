create extension if not exists pgcrypto;

create table if not exists public.business_accounts (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null,
  business_name text not null,
  business_type text not null,
  country_code text not null default 'US',
  currency text not null default 'USD',
  status text not null default 'pending',
  plan_id text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_locations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  name text not null,
  address jsonb not null default '{}'::jsonb,
  phone text,
  email text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.storefronts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  slug text not null unique,
  title text not null,
  description text,
  storefront_type text not null default 'retail',
  status text not null default 'draft',
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.storefront_items (
  id uuid primary key default gen_random_uuid(),
  storefront_id uuid not null references public.storefronts(id) on delete cascade,
  item_type text not null default 'product',
  name text not null,
  description text,
  price numeric(18,2) not null default 0,
  currency text not null default 'USD',
  active boolean not null default true,
  inventory_quantity integer,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_menus (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.restaurant_menu_items (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references public.restaurant_menus(id) on delete cascade,
  name text not null,
  description text,
  price numeric(18,2) not null default 0,
  currency text not null default 'USD',
  active boolean not null default true,
  modifiers jsonb not null default '[]'::jsonb,
  dietary_tags text[] not null default '{}'
);

create table if not exists public.commerce_orders (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_accounts(id) on delete cascade,
  customer_user_id uuid,
  order_type text not null default 'storefront',
  status text not null default 'pending',
  subtotal numeric(18,2) not null default 0,
  taxes numeric(18,2) not null default 0,
  fees numeric(18,2) not null default 0,
  total numeric(18,2) not null default 0,
  currency text not null default 'USD',
  payment_provider text,
  payment_reference text,
  revenue_policy_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.promo_codes (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.business_accounts(id) on delete cascade,
  code text not null unique,
  reward_type text not null,
  reward_value numeric(18,2) not null default 0,
  currency text not null default 'USD',
  max_uses integer,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.referral_attribution (
  id uuid primary key default gen_random_uuid(),
  referrer_user_id uuid not null,
  referred_user_id uuid not null,
  promo_code text,
  status text not null default 'pending',
  qualified_reward numeric(18,2) not null default 1.00,
  currency text not null default 'USD',
  qualified_at timestamptz,
  created_at timestamptz not null default now(),
  unique(referrer_user_id, referred_user_id)
);

create index if not exists idx_business_accounts_owner on public.business_accounts(owner_user_id);
create index if not exists idx_storefronts_business on public.storefronts(business_id);
create index if not exists idx_orders_business on public.commerce_orders(business_id, created_at desc);

alter table public.business_accounts enable row level security;
alter table public.business_locations enable row level security;
alter table public.storefronts enable row level security;
alter table public.storefront_items enable row level security;
alter table public.commerce_orders enable row level security;

drop policy if exists business_owner_select on public.business_accounts;
create policy business_owner_select on public.business_accounts for select to authenticated
using (auth.uid() = owner_user_id);
