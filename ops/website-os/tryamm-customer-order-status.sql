-- Staging only; no changes applied to production.
-- Single-purpose customer order status links are read-only, expiring and tenant-scoped.
create table if not exists public.tryamm_order_status_tokens (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 order_id uuid not null references public.tryamm_website_orders(id),
 customer_email text not null,
 expires_at timestamptz not null,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists tryamm_order_status_tokens_order_idx on public.tryamm_order_status_tokens(order_id,created_at desc);
alter table public.tryamm_order_status_tokens enable row level security;
revoke all on public.tryamm_order_status_tokens from public, anon, authenticated;
grant select,insert,update on public.tryamm_order_status_tokens to service_role;
-- No direct browser access. All tokens are hashed; the raw secret is only emailed
-- to the inquiry's recorded customer address. Never embed secret in analytics.
