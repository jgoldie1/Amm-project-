create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'viewer',
  age_band text,
  language text not null default 'en',
  accessibility_preferences jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.creator_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  total_minutes bigint not null default 0,
  qualified_minutes bigint not null default 0,
  protected_break_minutes bigint not null default 0,
  current_tier text not null default 'starter',
  good_standing boolean not null default true,
  engagement_passed boolean not null default true,
  fraud_passed boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.value_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  creator_earnings numeric(18,2) not null default 0,
  coins bigint not null default 0,
  holo_credits bigint not null default 0,
  beans bigint not null default 0,
  xp bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists public.value_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  value_type text not null,
  amount numeric(20,4) not null,
  event_type text not null,
  reference_id text,
  idempotency_key text unique,
  previous_hash text,
  entry_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_value_ledger_user_created on public.value_ledger(user_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.creator_progress enable row level security;
alter table public.value_balances enable row level security;
alter table public.value_ledger enable row level security;

create policy "profile_own_select" on public.profiles for select to authenticated using (auth.uid() = user_id);
create policy "profile_own_update" on public.profiles for update to authenticated using (auth.uid() = user_id);
create policy "creator_progress_own_select" on public.creator_progress for select to authenticated using (auth.uid() = user_id);
create policy "value_balances_own_select" on public.value_balances for select to authenticated using (auth.uid() = user_id);
create policy "value_ledger_own_select" on public.value_ledger for select to authenticated using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(user_id, display_name)
  values(new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(coalesce(new.email,''),'@',1)))
  on conflict (user_id) do nothing;

  insert into public.creator_progress(user_id) values(new.id) on conflict (user_id) do nothing;
  insert into public.value_balances(user_id) values(new.id) on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_tryamm on auth.users;
create trigger on_auth_user_created_tryamm
after insert on auth.users
for each row execute procedure public.handle_new_user();
