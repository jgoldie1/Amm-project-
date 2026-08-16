create table if not exists public.media_catalog (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid,
  title text not null,
  description text default '',
  media_type text not null check (media_type in ('music','podcast','video','movie','episode','live_replay','music_video','holodrama','anime','xr')),
  lane text default 'originals',
  access_type text not null default 'free' check (access_type in ('free','member','ppv')),
  storage_bucket text,
  storage_path text,
  external_playback_url text,
  poster_url text,
  duration_seconds integer,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.media_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  entitlement_type text not null check (entitlement_type in ('member','ppv','grant','owner')),
  source_order_id uuid references public.commerce_orders(id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique(user_id,media_id,entitlement_type,source_order_id)
);

create table if not exists public.media_watch_history (
  user_id uuid not null,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  position_seconds integer not null default 0,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  primary key(user_id,media_id)
);

create index if not exists idx_media_catalog_published on public.media_catalog(published,created_at desc);
create index if not exists idx_media_entitlements_user on public.media_entitlements(user_id,media_id);

alter table public.media_catalog enable row level security;
alter table public.media_entitlements enable row level security;
alter table public.media_watch_history enable row level security;

revoke all on public.media_catalog from anon;
revoke all on public.media_entitlements from anon;
revoke all on public.media_watch_history from anon;

grant select on public.media_catalog to authenticated;
grant select on public.media_entitlements to authenticated;
grant select,insert,update on public.media_watch_history to authenticated;

create policy media_catalog_authenticated_read on public.media_catalog for select to authenticated using (published = true or creator_user_id = auth.uid());
create policy media_entitlements_self_read on public.media_entitlements for select to authenticated using (user_id = auth.uid());
create policy media_watch_self_read on public.media_watch_history for select to authenticated using (user_id = auth.uid());
create policy media_watch_self_insert on public.media_watch_history for insert to authenticated with check (user_id = auth.uid());
create policy media_watch_self_update on public.media_watch_history for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Catalog publishing and entitlement grants are server/service-role responsibilities.
