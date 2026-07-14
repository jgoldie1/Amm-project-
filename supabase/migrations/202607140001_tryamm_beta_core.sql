create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text not null default 'member' check (role in ('member','creator','vendor','agent','driver','courier','moderator','admin')),
  accessibility jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('reel','drama','music','stream','holo-ad','podcast','course','game-asset')),
  title text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft','review','published','blocked','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.game_saves (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  game_id text not null,
  state jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  unique(owner_id, game_id)
);

create table if not exists public.collectibles (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid references auth.users(id) on delete set null,
  slug text not null unique,
  title text not null,
  rarity text not null default 'common',
  price_minor bigint not null default 0 check (price_minor >= 0),
  currency text not null default 'USD',
  metadata jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.collectible_ownership (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  collectible_id uuid not null references public.collectibles(id) on delete cascade,
  quantity integer not null default 1 check (quantity > 0),
  acquired_at timestamptz not null default now(),
  unique(owner_id, collectible_id)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references auth.users(id) on delete restrict,
  provider text not null,
  provider_reference text unique,
  status text not null default 'pending' check (status in ('pending','paid','failed','refunded','cancelled')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.call_center_interactions (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  channel text not null,
  customer_reference text,
  transcript text,
  summary text,
  disposition text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.daw_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  bpm integer not null default 120 check (bpm between 20 and 400),
  musical_key text,
  project jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.content_items enable row level security;
alter table public.game_saves enable row level security;
alter table public.collectibles enable row level security;
alter table public.collectible_ownership enable row level security;
alter table public.orders enable row level security;
alter table public.call_center_interactions enable row level security;
alter table public.daw_projects enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "content public published or own" on public.content_items for select using (status = 'published' or auth.uid() = owner_id);
create policy "content insert own" on public.content_items for insert with check (auth.uid() = owner_id);
create policy "content update own" on public.content_items for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "content delete own" on public.content_items for delete using (auth.uid() = owner_id);
create policy "game saves own all" on public.game_saves for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "collectibles public read" on public.collectibles for select using (active = true);
create policy "ownership own read" on public.collectible_ownership for select using (auth.uid() = owner_id);
create policy "orders own read" on public.orders for select using (auth.uid() = buyer_id);
create policy "call center own all" on public.call_center_interactions for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "daw own all" on public.daw_projects for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
