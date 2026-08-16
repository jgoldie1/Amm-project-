-- Canonical TryAMM Media Core for OmniPlayer, Isaiah AI TV, HoloDrama, AnimeVerse, music and LIVE replays.
-- Additive/idempotent: preserves existing rows and normalizes older field names where present.
create extension if not exists pgcrypto;

create table if not exists public.media_catalog (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid,
  slug text,
  title text not null,
  description text default '',
  media_kind text not null default 'video',
  lane text default 'originals',
  access_type text not null default 'FREE',
  storage_bucket text,
  storage_path text,
  external_stream_url text,
  poster_url text,
  captions_url text,
  rating text default 'TV-PG',
  duration_seconds integer,
  published boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- If an earlier media_catalog shape exists, add canonical columns without destroying data.
alter table public.media_catalog add column if not exists creator_user_id uuid;
alter table public.media_catalog add column if not exists slug text;
alter table public.media_catalog add column if not exists description text default '';
alter table public.media_catalog add column if not exists media_kind text;
alter table public.media_catalog add column if not exists lane text default 'originals';
alter table public.media_catalog add column if not exists access_type text default 'FREE';
alter table public.media_catalog add column if not exists storage_bucket text;
alter table public.media_catalog add column if not exists storage_path text;
alter table public.media_catalog add column if not exists external_stream_url text;
alter table public.media_catalog add column if not exists poster_url text;
alter table public.media_catalog add column if not exists captions_url text;
alter table public.media_catalog add column if not exists rating text default 'TV-PG';
alter table public.media_catalog add column if not exists duration_seconds integer;
alter table public.media_catalog add column if not exists published boolean default false;
alter table public.media_catalog add column if not exists metadata jsonb default '{}'::jsonb;
alter table public.media_catalog add column if not exists created_at timestamptz default now();
alter table public.media_catalog add column if not exists updated_at timestamptz default now();

-- Copy legacy aliases only when those columns exist.
do $$ begin
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='media_catalog' and column_name='media_type') then
    execute 'update public.media_catalog set media_kind=coalesce(media_kind,media_type) where media_kind is null';
  end if;
  if exists(select 1 from information_schema.columns where table_schema='public' and table_name='media_catalog' and column_name='external_playback_url') then
    execute 'update public.media_catalog set external_stream_url=coalesce(external_stream_url,external_playback_url) where external_stream_url is null';
  end if;
end $$;

update public.media_catalog set media_kind=coalesce(nullif(media_kind,''),'video');
update public.media_catalog set access_type=upper(coalesce(nullif(access_type,''),'FREE'));
update public.media_catalog set access_type='FREE' where access_type not in ('FREE','MEMBER','PPV');
update public.media_catalog set slug=lower(regexp_replace(title,'[^a-zA-Z0-9]+','-','g')) where slug is null or slug='';
create unique index if not exists media_catalog_slug_uq on public.media_catalog(slug) where slug is not null;
create index if not exists idx_media_catalog_published on public.media_catalog(published,created_at desc);

create table if not exists public.media_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  entitlement_type text not null check (entitlement_type in ('member','ppv','grant','owner')),
  source_order_id uuid references public.commerce_orders(id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists media_entitlements_source_uq on public.media_entitlements(user_id,media_id,entitlement_type,coalesce(source_order_id,'00000000-0000-0000-0000-000000000000'::uuid));
create index if not exists idx_media_entitlements_user on public.media_entitlements(user_id,media_id);

create table if not exists public.media_watch_history (
  user_id uuid not null,
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  position_seconds numeric not null default 0,
  completed boolean not null default false,
  last_watched_at timestamptz not null default now(),
  primary key(user_id,media_id)
);

alter table public.media_catalog enable row level security;
alter table public.media_entitlements enable row level security;
alter table public.media_watch_history enable row level security;

revoke all on public.media_catalog from anon;
revoke all on public.media_entitlements from anon;
revoke all on public.media_watch_history from anon;
grant select on public.media_catalog to authenticated;
grant select on public.media_entitlements to authenticated;
grant select,insert,update on public.media_watch_history to authenticated;

drop policy if exists media_catalog_authenticated_read on public.media_catalog;
create policy media_catalog_authenticated_read on public.media_catalog for select to authenticated using (published=true or creator_user_id=auth.uid());
drop policy if exists media_entitlements_self_read on public.media_entitlements;
create policy media_entitlements_self_read on public.media_entitlements for select to authenticated using (user_id=auth.uid());
drop policy if exists media_watch_self_read on public.media_watch_history;
create policy media_watch_self_read on public.media_watch_history for select to authenticated using (user_id=auth.uid());
drop policy if exists media_watch_self_insert on public.media_watch_history;
create policy media_watch_self_insert on public.media_watch_history for insert to authenticated with check (user_id=auth.uid());
drop policy if exists media_watch_self_update on public.media_watch_history;
create policy media_watch_self_update on public.media_watch_history for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- Catalog publishing, external stream URL changes, entitlement grants/revocations and storage paths are service-role responsibilities.
