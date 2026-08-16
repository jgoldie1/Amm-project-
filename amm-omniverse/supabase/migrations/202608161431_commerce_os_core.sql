-- Commerce OS core: fixed-price, offers, auctions, LIVE shopping, B2B,
-- creator attribution, buyer protection/disputes, and AI shopping sessions.

create table if not exists public.commerce_listings (
  id uuid primary key default gen_random_uuid(), seller_user_id uuid not null, business_id uuid null,
  title text not null, description text null,
  listing_type text not null default 'fixed' check (listing_type in ('fixed','auction','offer','live','preorder','service','digital','wholesale')),
  status text not null default 'draft' check (status in ('draft','active','paused','sold','ended','removed')),
  currency text not null default 'USD', price numeric(18,2) null, compare_at_price numeric(18,2) null,
  quantity_available integer null, sku text null, media jsonb not null default '[]'::jsonb,
  attributes jsonb not null default '{}'::jsonb, fulfillment jsonb not null default '{}'::jsonb,
  safety_flags jsonb not null default '{}'::jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.commerce_offers (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.commerce_listings(id) on delete cascade,
  buyer_user_id uuid not null, amount numeric(18,2) not null, currency text not null default 'USD',
  status text not null default 'pending' check (status in ('pending','accepted','declined','countered','expired','withdrawn')),
  counter_amount numeric(18,2) null, message text null, expires_at timestamptz null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.commerce_auctions (
  listing_id uuid primary key references public.commerce_listings(id) on delete cascade,
  starts_at timestamptz not null, ends_at timestamptz not null, starting_bid numeric(18,2) not null,
  reserve_price numeric(18,2) null, buy_now_price numeric(18,2) null, bid_increment numeric(18,2) not null default 1,
  anti_sniping_seconds integer not null default 120,
  status text not null default 'scheduled' check (status in ('scheduled','live','ended','cancelled'))
);

create table if not exists public.commerce_bids (
  id uuid primary key default gen_random_uuid(), listing_id uuid not null references public.commerce_listings(id) on delete cascade,
  bidder_user_id uuid not null, amount numeric(18,2) not null, created_at timestamptz not null default now()
);

create table if not exists public.commerce_live_sessions (
  id uuid primary key default gen_random_uuid(), host_user_id uuid not null, business_id uuid null,
  live_room_name text not null, title text not null,
  status text not null default 'scheduled' check (status in ('scheduled','live','paused','ended','cancelled')),
  featured_listing_ids uuid[] not null default '{}', pinned_listing_id uuid null, replay_url text null,
  starts_at timestamptz null, ended_at timestamptz null, created_at timestamptz not null default now()
);

create table if not exists public.commerce_b2b_catalogs (
  id uuid primary key default gen_random_uuid(), seller_user_id uuid not null, business_id uuid null,
  name text not null, currency text not null default 'USD', rules jsonb not null default '{}'::jsonb,
  active boolean not null default true, created_at timestamptz not null default now()
);

create table if not exists public.commerce_b2b_prices (
  catalog_id uuid not null references public.commerce_b2b_catalogs(id) on delete cascade,
  listing_id uuid not null references public.commerce_listings(id) on delete cascade,
  min_quantity integer not null default 1, unit_price numeric(18,2) not null,
  primary key(catalog_id,listing_id,min_quantity)
);

create table if not exists public.commerce_attribution (
  id uuid primary key default gen_random_uuid(), listing_id uuid null references public.commerce_listings(id) on delete set null,
  creator_user_id uuid null, campaign_id text null, source text not null, medium text null, session_id text null,
  metadata jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create table if not exists public.commerce_disputes (
  id uuid primary key default gen_random_uuid(), order_ref text not null, opened_by_user_id uuid not null, seller_user_id uuid null,
  reason text not null, details text null, evidence jsonb not null default '{}'::jsonb,
  status text not null default 'open' check (status in ('open','under_review','seller_response','buyer_response','resolved_buyer','resolved_seller','refunded','closed')),
  moderation_report_id uuid null references public.moderation_reports(id) on delete set null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists public.commerce_ai_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid null, session_key text not null, intent text null,
  constraints jsonb not null default '{}'::jsonb, recommendations jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists commerce_listings_seller_status_idx on public.commerce_listings(seller_user_id,status,created_at desc);
create index if not exists commerce_listings_type_status_idx on public.commerce_listings(listing_type,status,created_at desc);
create index if not exists commerce_offers_listing_status_idx on public.commerce_offers(listing_id,status,created_at desc);
create index if not exists commerce_bids_listing_amount_idx on public.commerce_bids(listing_id,amount desc,created_at asc);
create index if not exists commerce_live_room_idx on public.commerce_live_sessions(live_room_name,status);
create index if not exists commerce_disputes_status_idx on public.commerce_disputes(status,created_at desc);

alter table public.commerce_listings enable row level security;
alter table public.commerce_offers enable row level security;
alter table public.commerce_auctions enable row level security;
alter table public.commerce_bids enable row level security;
alter table public.commerce_live_sessions enable row level security;
alter table public.commerce_b2b_catalogs enable row level security;
alter table public.commerce_b2b_prices enable row level security;
alter table public.commerce_attribution enable row level security;
alter table public.commerce_disputes enable row level security;
alter table public.commerce_ai_sessions enable row level security;

revoke all on public.commerce_disputes from anon;
revoke all on public.commerce_ai_sessions from anon;
