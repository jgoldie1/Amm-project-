-- Revenue Beta hardening: financial reversals, distributed rate limits, media authorization, safety.

alter table if exists public.commerce_orders
  add column if not exists refunded_amount numeric(18,2) not null default 0,
  add column if not exists creator_reversed_amount numeric(18,2) not null default 0,
  add column if not exists dispute_amount numeric(18,2) not null default 0;

create table if not exists public.api_rate_limits (
  bucket_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.api_rate_limits enable row level security;
revoke all on public.api_rate_limits from anon, authenticated;

create or replace function public.consume_rate_limit(p_bucket_key text, p_limit integer, p_window_seconds integer default 60)
returns table(allowed boolean, remaining integer, reset_at timestamptz)
language plpgsql security definer set search_path=public as $$
declare v_now timestamptz:=now(); v_start timestamptz; v_count integer;
begin
  if p_limit < 1 or p_window_seconds < 1 then raise exception 'Invalid rate limit'; end if;
  insert into public.api_rate_limits(bucket_key,window_started_at,request_count,updated_at)
  values(p_bucket_key,v_now,1,v_now)
  on conflict(bucket_key) do update set
    window_started_at=case when public.api_rate_limits.window_started_at + make_interval(secs=>p_window_seconds) <= v_now then v_now else public.api_rate_limits.window_started_at end,
    request_count=case when public.api_rate_limits.window_started_at + make_interval(secs=>p_window_seconds) <= v_now then 1 else public.api_rate_limits.request_count+1 end,
    updated_at=v_now
  returning window_started_at,request_count into v_start,v_count;
  return query select v_count<=p_limit, greatest(p_limit-v_count,0), v_start+make_interval(secs=>p_window_seconds);
end;$$;
revoke execute on function public.consume_rate_limit(text,integer,integer) from anon, authenticated;

create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  creator_user_id uuid null references auth.users(id) on delete set null,
  title text not null,
  media_kind text not null check(media_kind in ('music','video','movie','episode','podcast','replay','live-recording')),
  access_type text not null default 'free' check(access_type in ('free','member','ppv','private')),
  entitlement_key text null,
  storage_bucket text not null default 'media-private',
  storage_path text not null,
  poster_bucket text null,
  poster_path text null,
  captions_bucket text null,
  captions_path text null,
  status text not null default 'processing' check(status in ('processing','ready','blocked','archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(storage_bucket,storage_path)
);
create index if not exists media_assets_ready_idx on public.media_assets(status,access_type,created_at desc);
create index if not exists media_assets_owner_idx on public.media_assets(owner_user_id,created_at desc);
alter table public.media_assets enable row level security;
drop policy if exists media_assets_owner_read on public.media_assets;
create policy media_assets_owner_read on public.media_assets for select using(owner_user_id=auth.uid() or creator_user_id=auth.uid());
revoke insert,update,delete on public.media_assets from anon,authenticated;

create table if not exists public.media_watch_history (
  user_id uuid not null references auth.users(id) on delete cascade,
  media_asset_id uuid not null references public.media_assets(id) on delete cascade,
  position_seconds numeric(12,2) not null default 0,
  duration_seconds numeric(12,2) not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key(user_id,media_asset_id)
);
alter table public.media_watch_history enable row level security;
drop policy if exists media_watch_self_all on public.media_watch_history;
create policy media_watch_self_all on public.media_watch_history for all using(user_id=auth.uid()) with check(user_id=auth.uid());

create table if not exists public.user_blocks (
  blocker_user_id uuid not null references auth.users(id) on delete cascade,
  blocked_user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(blocker_user_id,blocked_user_id),
  check(blocker_user_id<>blocked_user_id)
);
create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null,
  target_id text not null,
  reason text not null,
  details text not null default '',
  status text not null default 'open' check(status in ('open','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.user_blocks enable row level security;
alter table public.content_reports enable row level security;
drop policy if exists user_blocks_self on public.user_blocks;
create policy user_blocks_self on public.user_blocks for all using(blocker_user_id=auth.uid()) with check(blocker_user_id=auth.uid());
drop policy if exists content_reports_self_insert on public.content_reports;
create policy content_reports_self_insert on public.content_reports for insert with check(reporter_user_id=auth.uid());
drop policy if exists content_reports_self_read on public.content_reports;
create policy content_reports_self_read on public.content_reports for select using(reporter_user_id=auth.uid());

-- Keep search history private and bounded by scheduled cleanup; clients cannot enumerate other users.
revoke insert,update,delete on public.omninet_queries from anon,authenticated;
