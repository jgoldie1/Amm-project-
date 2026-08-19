create extension if not exists pgcrypto;

create table if not exists public.tryamm_passports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.tryamm_businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  status text not null default 'draft' check (status in ('draft','active','suspended','closed')),
  profile jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tryamm_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.tryamm_businesses(id) on delete set null,
  kind text not null check (kind in ('marketplace','food','package','service')),
  status text not null default 'created' check (status in ('created','payment_pending','paid_sandbox','confirmed','preparing','in_transit','delivered','problem','cancelled','refunded')),
  total_minor integer not null check (total_minor >= 0),
  currency text not null default 'USD',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tryamm_delivery_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.tryamm_orders(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  state text not null,
  public_message text not null,
  eta_minutes integer,
  occurred_at timestamptz not null default now()
);

create table if not exists public.tryamm_approval_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending','approved','denied','executed','expired')),
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

create table if not exists public.tryamm_audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  target_type text,
  target_id text,
  result text not null,
  correlation_id text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.tryamm_sandbox_payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid not null references public.tryamm_orders(id) on delete cascade,
  amount_minor integer not null check (amount_minor >= 0),
  currency text not null default 'USD',
  status text not null default 'created' check (status in ('created','authorized','captured','failed','voided')),
  provider text not null default 'tryamm_sandbox',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.tryamm_passports enable row level security;
alter table public.tryamm_businesses enable row level security;
alter table public.tryamm_orders enable row level security;
alter table public.tryamm_delivery_events enable row level security;
alter table public.tryamm_approval_requests enable row level security;
alter table public.tryamm_audit_events enable row level security;
alter table public.tryamm_sandbox_payments enable row level security;

create policy "passport_owner_all" on public.tryamm_passports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "business_owner_all" on public.tryamm_businesses for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "order_buyer_all" on public.tryamm_orders for all using (auth.uid() = buyer_id) with check (auth.uid() = buyer_id);
create policy "delivery_order_owner_all" on public.tryamm_delivery_events for all
  using (exists (select 1 from public.tryamm_orders o where o.id = order_id and o.buyer_id = auth.uid()))
  with check (actor_id = auth.uid() and exists (select 1 from public.tryamm_orders o where o.id = order_id and o.buyer_id = auth.uid()));
create policy "approval_owner_all" on public.tryamm_approval_requests for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "audit_owner_select" on public.tryamm_audit_events for select using (auth.uid() = actor_id);
create policy "audit_owner_insert" on public.tryamm_audit_events for insert with check (auth.uid() = actor_id);
create policy "sandbox_payment_owner_all" on public.tryamm_sandbox_payments for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists tryamm_businesses_owner_idx on public.tryamm_businesses(owner_id, created_at desc);
create index if not exists tryamm_orders_buyer_idx on public.tryamm_orders(buyer_id, created_at desc);
create index if not exists tryamm_delivery_order_idx on public.tryamm_delivery_events(order_id, occurred_at);
create index if not exists tryamm_audit_actor_idx on public.tryamm_audit_events(actor_id, occurred_at desc);
