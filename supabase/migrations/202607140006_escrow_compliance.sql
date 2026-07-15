create table if not exists public.escrow_accounts (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete cascade,
  seller_id uuid references auth.users(id) on delete set null,
  order_id text,
  amount numeric not null check (amount > 0),
  currency text not null default 'USD',
  release_rule text not null,
  status text not null default 'funding-pending',
  tax_reserve_amount numeric not null default 0,
  dispute_window_hours integer not null default 72,
  funded_at timestamptz,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.compliance_cases (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  subject_type text not null,
  subject_id text,
  country text,
  checks jsonb not null default '[]'::jsonb,
  status text not null default 'review-required',
  risk_level text not null default 'medium',
  human_counsel_required boolean not null default false,
  findings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.escrow_accounts enable row level security;
alter table public.compliance_cases enable row level security;

create policy "Buyers read own escrow" on public.escrow_accounts for select using (buyer_id=auth.uid() or seller_id=auth.uid());
create policy "Buyers create escrow" on public.escrow_accounts for insert with check (buyer_id=auth.uid());
create policy "Owners read compliance cases" on public.compliance_cases for select using (owner_id=auth.uid());
create policy "Owners create compliance cases" on public.compliance_cases for insert with check (owner_id=auth.uid());
create policy "Owners update compliance cases" on public.compliance_cases for update using (owner_id=auth.uid()) with check (owner_id=auth.uid());

create index if not exists escrow_buyer_idx on public.escrow_accounts(buyer_id,created_at desc);
create index if not exists compliance_owner_idx on public.compliance_cases(owner_id,created_at desc);