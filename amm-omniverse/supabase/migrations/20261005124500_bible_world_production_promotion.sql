-- Metaverse Bible / Time Machine production promotion receipts.
-- Preview packages can become immutable release candidates only after the
-- Bible world certification runtime reports every production gate passed.
-- Actual production publication remains an explicit, server-recorded action.

create table if not exists public.tryamm_bible_world_releases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  release_key text not null unique,
  plan_id text not null,
  title text not null,
  era text not null default '',
  truth_label text not null,
  version integer not null default 1 check (version > 0),
  state text not null default 'candidate'
    check (state in ('candidate','staged','published','rolled-back','rejected')),
  scene_package jsonb not null,
  certification jsonb not null,
  asset_manifest jsonb not null default '[]'::jsonb,
  manifest_sha256 text not null,
  production_publish_allowed boolean not null default false,
  human_review_passed boolean not null default false,
  rollback_of uuid references public.tryamm_bible_world_releases(id) on delete set null,
  promoted_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tryamm_bible_world_releases_user_idx
  on public.tryamm_bible_world_releases(user_id,created_at desc);
create index if not exists tryamm_bible_world_releases_plan_idx
  on public.tryamm_bible_world_releases(plan_id,version desc);

alter table public.tryamm_bible_world_releases enable row level security;
revoke insert,update,delete on public.tryamm_bible_world_releases from anon,authenticated;
grant select on public.tryamm_bible_world_releases to authenticated;

drop policy if exists tryamm_bible_world_releases_read_own on public.tryamm_bible_world_releases;
create policy tryamm_bible_world_releases_read_own
on public.tryamm_bible_world_releases
for select to authenticated
using ((select auth.uid())=user_id);

comment on table public.tryamm_bible_world_releases is
'Immutable/versioned release receipts for certified Metaverse Bible worlds. Candidate/staged states are not proof of production publication.';
