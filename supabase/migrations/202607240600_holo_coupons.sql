create extension if not exists pgcrypto;

create table if not exists public.holo_coupons (
  id uuid primary key default gen_random_uuid(),
  business_id uuid,
  storefront_id uuid,
  code text not null unique,
  label text not null,
  description text,
  discount_type text not null default 'fixed' check (discount_type in ('fixed','percent','credit','beans','holo_credits')),
  discount_value numeric(18,2) not null default 0,
  currency text not null default 'USD',
  channel_scope text[] not null default array['storefront'],
  first_order_only boolean not null default false,
  min_subtotal numeric(18,2) not null default 0,
  max_redemptions integer,
  redemption_count integer not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  active boolean not null default true,
  referral_attribution_enabled boolean not null default true,
  holo_ad_campaign_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.holo_coupon_redemptions (
  id uuid primary key default gen_random_uuid(),
  coupon_id uuid not null references public.holo_coupons(id) on delete cascade,
  user_id uuid not null,
  order_id uuid,
  channel text not null,
  discount_amount numeric(18,2) not null default 0,
  referral_code text,
  redeemed_at timestamptz not null default now(),
  unique(coupon_id,user_id,order_id)
);

create index if not exists idx_holo_coupons_business on public.holo_coupons(business_id,active);
create index if not exists idx_holo_coupon_redemptions_user on public.holo_coupon_redemptions(user_id,redeemed_at desc);

alter table public.holo_coupons enable row level security;
alter table public.holo_coupon_redemptions enable row level security;
