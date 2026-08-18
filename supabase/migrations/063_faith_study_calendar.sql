-- TRYAMM optional faith/community study persistence.
-- Participation is voluntary and separate from general platform authorization.

create table if not exists public.faith_preferences(
  user_id text primary key,
  sabbath_method text not null default 'friday-sunset-to-saturday-sunset',
  new_moon_method text not null default 'community-declared',
  timezone text not null default 'America/Chicago',
  latitude double precision,
  longitude double precision,
  reflect_mode boolean not null default true,
  pause_commerce boolean not null default false,
  quiet_notifications boolean not null default true,
  show_study_prompts boolean not null default true,
  community_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.faith_preferences enable row level security;

create table if not exists public.faith_new_moon_events(
  id uuid primary key default gen_random_uuid(),
  community_id text,
  method text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  declared_by text,
  source text,
  verified boolean not null default false,
  notes text,
  created_by text,
  created_at timestamptz not null default now()
);
create index if not exists faith_new_moon_start_idx on public.faith_new_moon_events(starts_at desc);
alter table public.faith_new_moon_events enable row level security;

create table if not exists public.faith_study_notes(
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  collection_id text,
  book text,
  chapter text,
  verse text,
  note_text text not null,
  tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists faith_study_notes_user_idx on public.faith_study_notes(user_id,created_at desc);
alter table public.faith_study_notes enable row level security;

create table if not exists public.faith_bookmarks(
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  collection_id text,
  book text,
  chapter text,
  verse text,
  label text,
  created_at timestamptz not null default now()
);
create index if not exists faith_bookmarks_user_idx on public.faith_bookmarks(user_id,created_at desc);
alter table public.faith_bookmarks enable row level security;

create table if not exists public.faith_study_plans(
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  title text not null,
  observance text not null default 'custom',
  references_json jsonb not null default '[]'::jsonb,
  notes text,
  public boolean not null default false,
  created_at timestamptz not null default now()
);
alter table public.faith_study_plans enable row level security;

create table if not exists public.faith_text_sources(
  id uuid primary key default gen_random_uuid(),
  name text not null,
  language text not null default 'English',
  license text not null,
  source_url text,
  verified boolean not null default false,
  created_by text,
  created_at timestamptz not null default now()
);
alter table public.faith_text_sources enable row level security;

-- These tables are server-mediated for the current TRYAMM account model.
-- Keep anon/authenticated roles from bypassing the server authorization layer.
revoke all on table public.faith_preferences from anon, authenticated;
revoke all on table public.faith_new_moon_events from anon, authenticated;
revoke all on table public.faith_study_notes from anon, authenticated;
revoke all on table public.faith_bookmarks from anon, authenticated;
revoke all on table public.faith_study_plans from anon, authenticated;
revoke all on table public.faith_text_sources from anon, authenticated;
