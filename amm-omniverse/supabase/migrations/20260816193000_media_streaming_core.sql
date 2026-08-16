create table if not exists public.media_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null default '',
  media_kind text not null check (media_kind in ('music','video','movie','episode','podcast','replay')),
  lane text not null default 'Originals',
  access_type text not null default 'FREE' check (access_type in ('FREE','MEMBER','PPV')),
  storage_bucket text,
  storage_path text,
  external_stream_url text,
  poster_url text,
  captions_url text,
  rating text not null default 'TV-PG',
  published boolean not null default false,
  creator_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  source text not null,
  source_ref text,
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,media_id,source,source_ref)
);

create table if not exists public.media_watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  position_seconds numeric not null default 0 check (position_seconds >= 0),
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  primary key(user_id,media_id)
);

alter table public.media_catalog enable row level security;
alter table public.media_entitlements enable row level security;
alter table public.media_watch_history enable row level security;

drop policy if exists media_catalog_public_read on public.media_catalog;
create policy media_catalog_public_read on public.media_catalog for select using (published = true);

drop policy if exists media_entitlements_self_read on public.media_entitlements;
create policy media_entitlements_self_read on public.media_entitlements for select using (auth.uid() = user_id);

drop policy if exists media_watch_self_read on public.media_watch_history;
create policy media_watch_self_read on public.media_watch_history for select using (auth.uid() = user_id);
drop policy if exists media_watch_self_insert on public.media_watch_history;
create policy media_watch_self_insert on public.media_watch_history for insert with check (auth.uid() = user_id);
drop policy if exists media_watch_self_update on public.media_watch_history;
create policy media_watch_self_update on public.media_watch_history for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

revoke insert, update, delete on public.media_catalog from anon, authenticated;
revoke insert, update, delete on public.media_entitlements from anon, authenticated;
