-- Staging migration only. Install after backups and ownership checks.
-- Payment is NEVER inferred from a browser callback or order state request.
create table if not exists public.tryamm_website_orders (
 id uuid primary key,
 owner_id text not null,
 campaign_id uuid not null references public.tryamm_campaigns(id),
 lead_id uuid not null references public.tryamm_campaign_leads(id),
 package_id text not null check(package_id in ('preview','experience','digital-twin')),
 price_cents integer not null check(price_cents > 0),
 currency text not null default 'usd' check(currency='usd'),
 description text not null,
 terms text not null,
 status text not null default 'quote-pending'
 check(status in ('quote-pending','quote-approved','customer-accepted','payment-pending','paid-verified','building','review-ready','delivered','cancelled','refunded')),
 customer_accepted_at timestamptz,
 verified_paid_at timestamptz,
 stripe_session_id text unique,
 fulfillment_approved_at timestamptz,
 delivered_at timestamptz,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (lead_id)
);
create index if not exists tryamm_website_orders_owner_idx on public.tryamm_website_orders(owner_id,created_at desc);
alter table public.tryamm_website_orders enable row level security;
revoke all on public.tryamm_website_orders from public,anon,authenticated;
grant select,insert,update on public.tryamm_website_orders to service_role;
-- Before enabling checkout, create an independently audited transactional Postgres
-- function that claims Stripe sessions, verifies amount, currency, and quote version,
-- atomically records payment and creates a fulfillment outbox entry.
-- Customer acceptance must use a verified session or scoped signed token,
-- never owner impersonation or a customer email typed into a form.
