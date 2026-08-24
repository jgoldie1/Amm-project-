-- TRYAMM unified release state
-- SIGN IN -> PASSPORT -> STREETVERSE -> MISSION -> XP -> REWARD -> MEDIA -> COMMERCE

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text unique,
  is_creator boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.player_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.users(id) on delete cascade,
  xp bigint default 0,
  level integer default 1,
  tokens bigint default 100,
  avatar jsonb default '{}'::jsonb,
  avatar_id text,
  current_world_id text default 'streetverse',
  current_verse text default 'streetverse',
  checkpoint jsonb default '{}'::jsonb,
  inventory jsonb default '[]'::jsonb,
  accessibility_profile jsonb default '{}'::jsonb,
  revision bigint default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.player_state add column if not exists avatar_id text;
alter table public.player_state add column if not exists current_world_id text default 'streetverse';
alter table public.player_state add column if not exists current_verse text default 'streetverse';
alter table public.player_state add column if not exists checkpoint jsonb default '{}'::jsonb;
alter table public.player_state add column if not exists inventory jsonb default '[]'::jsonb;
alter table public.player_state add column if not exists accessibility_profile jsonb default '{}'::jsonb;
alter table public.player_state add column if not exists revision bigint default 0;
alter table public.player_state add column if not exists created_at timestamptz default now();

create table if not exists public.streetverse_mission_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  character_id text not null default 'player',
  mission_id text not null,
  beat_id text not null default 'start',
  status text not null default 'active' check (status in ('active','paused','completed','failed')),
  choice jsonb default '{}'::jsonb,
  runtime_state jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_streetverse_mission_runs_user on public.streetverse_mission_runs(user_id, updated_at desc);

create table if not exists public.media_catalog (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.users(id) on delete cascade,
  brand text not null default 'TRYAMM',
  title text not null,
  media_type text not null check (media_type in ('video','image','gif','audio','reel','movie','episode','live-replay')),
  rights_status text not null default 'original',
  visibility text not null default 'private' check (visibility in ('private','unlisted','public')),
  manifest jsonb default '{}'::jsonb,
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_media_catalog_owner on public.media_catalog(owner_id, created_at desc);

create table if not exists public.media_publish_jobs (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  owner_id uuid not null references public.users(id) on delete cascade,
  destinations text[] not null default '{}',
  status text not null default 'queued' check (status in ('queued','processing','published','failed','blocked')),
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','rejected')),
  monetization_status text not null default 'gated' check (monetization_status in ('gated','eligible','disabled')),
  error_code text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_media_publish_jobs_owner on public.media_publish_jobs(owner_id, created_at desc);

create or replace function public.tryamm_bootstrap_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users(id,name,email,created_at,updated_at)
  values(new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(coalesce(new.email,''),'@',1)), new.email, now(), now())
  on conflict(id) do update set email=excluded.email, updated_at=now();

  insert into public.player_state(user_id)
  values(new.id)
  on conflict(user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists tryamm_on_auth_user_created on auth.users;
create trigger tryamm_on_auth_user_created
after insert or update of email on auth.users
for each row execute function public.tryamm_bootstrap_user();

insert into public.users(id,name,email)
select id, coalesce(raw_user_meta_data->>'full_name', split_part(coalesce(email,''),'@',1)), email
from auth.users
on conflict(id) do update set email=excluded.email, updated_at=now();

insert into public.player_state(user_id)
select id from public.users
on conflict(user_id) do nothing;

alter table public.users enable row level security;
alter table public.player_state enable row level security;
alter table public.streetverse_mission_runs enable row level security;
alter table public.media_catalog enable row level security;
alter table public.media_publish_jobs enable row level security;

do $$ begin
  create policy tryamm_users_self on public.users for select using (auth.uid()=id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tryamm_player_self on public.player_state for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tryamm_missions_self on public.streetverse_mission_runs for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tryamm_media_self on public.media_catalog for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy tryamm_publish_jobs_self on public.media_publish_jobs for all using (auth.uid()=owner_id) with check (auth.uid()=owner_id);
exception when duplicate_object then null; end $$;
