-- PREPARED, NOT APPLIED.
-- Apply only after the actual Supabase project is connected and reviewed.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  account_type text not null default 'person' check (account_type in ('person','student','creator','business','courier','admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.accessibility_passports (
  user_id uuid primary key references auth.users(id) on delete cascade,
  preferences jsonb not null default '{}'::jsonb,
  opportunity_needs jsonb not null default '[]'::jsonb,
  communication_preference text,
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'draft',
  digital_twin jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.jarvis_agent_grants (
  id uuid primary key default gen_random_uuid(),
  account_user_id uuid not null references auth.users(id) on delete cascade,
  business_id uuid references public.businesses(id) on delete cascade,
  agent_id text not null,
  permission_level text not null,
  allowed_actions jsonb not null default '[]'::jsonb,
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  account_user_id uuid references auth.users(id) on delete set null,
  business_id uuid references public.businesses(id) on delete set null,
  actor_type text not null,
  actor_id text not null,
  action text not null,
  target_type text,
  target_id text,
  correlation_id text not null,
  authorization_basis text,
  result text not null,
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now()
);

create table if not exists public.marketplace_orders (
  id uuid primary key default gen_random_uuid(),
  buyer_user_id uuid not null references auth.users(id) on delete restrict,
  seller_business_id uuid not null references public.businesses(id) on delete restrict,
  state text not null default 'cart',
  totals jsonb not null default '{}'::jsonb,
  fulfillment jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.marketplace_orders(id) on delete cascade,
  source_user_id uuid references auth.users(id) on delete set null,
  state text not null,
  public_message text,
  location jsonb,
  eta_minutes integer,
  occurred_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.accessibility_passports enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.jarvis_agent_grants enable row level security;
alter table public.audit_events enable row level security;
alter table public.marketplace_orders enable row level security;
alter table public.delivery_events enable row level security;

create policy "profiles_select_own" on public.profiles for select to authenticated using ((select auth.uid()) = user_id);
create policy "profiles_insert_own" on public.profiles for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "profiles_update_own" on public.profiles for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "accessibility_select_own" on public.accessibility_passports for select to authenticated using ((select auth.uid()) = user_id);
create policy "accessibility_insert_own" on public.accessibility_passports for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "accessibility_update_own" on public.accessibility_passports for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "business_select_member" on public.businesses for select to authenticated using (
  owner_user_id = (select auth.uid()) or exists (
    select 1 from public.business_members bm where bm.business_id = id and bm.user_id = (select auth.uid())
  )
);
create policy "business_insert_owner" on public.businesses for insert to authenticated with check (owner_user_id = (select auth.uid()));
create policy "business_update_owner" on public.businesses for update to authenticated using (owner_user_id = (select auth.uid())) with check (owner_user_id = (select auth.uid()));

create policy "business_member_select_related" on public.business_members for select to authenticated using (
  user_id = (select auth.uid()) or exists (
    select 1 from public.businesses b where b.id = business_id and b.owner_user_id = (select auth.uid())
  )
);
create policy "business_member_owner_manage" on public.business_members for all to authenticated using (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_user_id = (select auth.uid()))
) with check (
  exists (select 1 from public.businesses b where b.id = business_id and b.owner_user_id = (select auth.uid()))
);

create policy "agent_grants_select_owner" on public.jarvis_agent_grants for select to authenticated using (account_user_id = (select auth.uid()));
create policy "agent_grants_owner_manage" on public.jarvis_agent_grants for all to authenticated using (account_user_id = (select auth.uid())) with check (account_user_id = (select auth.uid()));

create policy "orders_select_buyer_or_seller" on public.marketplace_orders for select to authenticated using (
  buyer_user_id = (select auth.uid()) or exists (
    select 1 from public.businesses b where b.id = seller_business_id and (b.owner_user_id = (select auth.uid()) or exists (
      select 1 from public.business_members bm where bm.business_id = b.id and bm.user_id = (select auth.uid())
    ))
  )
);
create policy "orders_insert_buyer" on public.marketplace_orders for insert to authenticated with check (buyer_user_id = (select auth.uid()));
create policy "orders_update_related" on public.marketplace_orders for update to authenticated using (
  buyer_user_id = (select auth.uid()) or exists (
    select 1 from public.businesses b where b.id = seller_business_id and b.owner_user_id = (select auth.uid())
  )
) with check (
  buyer_user_id = buyer_user_id
);

create policy "delivery_select_related" on public.delivery_events for select to authenticated using (
  exists (
    select 1 from public.marketplace_orders o
    where o.id = order_id and (
      o.buyer_user_id = (select auth.uid()) or exists (
        select 1 from public.businesses b where b.id = o.seller_business_id and (b.owner_user_id = (select auth.uid()) or exists (
          select 1 from public.business_members bm where bm.business_id = b.id and bm.user_id = (select auth.uid())
        ))
      )
    )
  )
);

-- audit_events intentionally has no direct client INSERT policy.
-- Production audit writes should occur through a trusted server path with explicit authorization.

-- Before applying: review UPDATE policies, add grants required by Data API configuration,
-- run Supabase advisors, and test cross-account access attempts.
