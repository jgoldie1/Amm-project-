create table if not exists public.streetverse_legacy_scenes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  scene_key text not null,
  status text not null check (status in ('draft','rights-review','original-ready','licensed-ready')),
  summary text not null default '',
  rights_proof_id text,
  memory_tags text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, character_id, scene_key)
);

create table if not exists public.streetverse_legacy_memories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null,
  summary text not null,
  tags text[] not null default '{}',
  source text not null default 'player-authored',
  created_at timestamptz not null default now()
);

alter table public.streetverse_legacy_scenes enable row level security;
alter table public.streetverse_legacy_memories enable row level security;

revoke all on table public.streetverse_legacy_scenes from anon;
revoke all on table public.streetverse_legacy_memories from anon;
grant select, insert, update on table public.streetverse_legacy_scenes to authenticated;
grant select, insert on table public.streetverse_legacy_memories to authenticated;

drop policy if exists "legacy scenes owner read" on public.streetverse_legacy_scenes;
drop policy if exists "legacy scenes owner insert" on public.streetverse_legacy_scenes;
drop policy if exists "legacy scenes owner update" on public.streetverse_legacy_scenes;
drop policy if exists "legacy memories owner read" on public.streetverse_legacy_memories;
drop policy if exists "legacy memories owner insert" on public.streetverse_legacy_memories;

create policy "legacy scenes owner read"
on public.streetverse_legacy_scenes for select to authenticated
using ((select auth.uid()) = user_id);

create policy "legacy scenes owner insert"
on public.streetverse_legacy_scenes for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "legacy scenes owner update"
on public.streetverse_legacy_scenes for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "legacy memories owner read"
on public.streetverse_legacy_memories for select to authenticated
using ((select auth.uid()) = user_id);

create policy "legacy memories owner insert"
on public.streetverse_legacy_memories for insert to authenticated
with check ((select auth.uid()) = user_id);

comment on table public.streetverse_legacy_scenes is 'Rights-aware StreetVerse autobiographical scene state. Never stores copyrighted film media by default.';
comment on table public.streetverse_legacy_memories is 'Player-authored autobiographical memories separated from independently verified factual claims.';
