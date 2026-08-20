begin;

create table if not exists public.streetverse_biography_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null check (char_length(character_id) between 1 and 128),
  chapter text not null check (char_length(chapter) between 1 and 96),
  region_id text not null check (char_length(region_id) between 1 and 96),
  state jsonb not null default '{}'::jsonb,
  legacy_score integer not null default 0 check (legacy_score >= 0),
  captured_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists streetverse_bio_user_character_time_idx on public.streetverse_biography_snapshots(user_id, character_id, captured_at desc);

create table if not exists public.streetverse_world_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null check (char_length(character_id) between 1 and 128),
  region_id text not null check (char_length(region_id) between 1 and 96),
  entity_id text not null check (char_length(entity_id) between 1 and 160),
  entity_kind text not null check (entity_kind in ('npc','business','school','venue','neighborhood','media','family','career')),
  before_state text not null default 'unknown',
  after_state text not null,
  reason text not null,
  importance integer not null default 50 check (importance between 0 and 100),
  resolved boolean not null default false,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists streetverse_changes_user_character_region_idx on public.streetverse_world_changes(user_id, character_id, region_id, occurred_at desc);

create table if not exists public.streetverse_archive_mission_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null check (char_length(character_id) between 1 and 128),
  mission_id text not null check (char_length(mission_id) between 1 and 160),
  status text not null default 'discovered' check (status in ('discovered','researching','solved','created','preserved')),
  source_url text,
  evidence_class text not null default 'interpretation' check (evidence_class in ('archive-fact','interpretation','family-memory','community-lead','rights-cleared')),
  result_summary text not null default '',
  creator_work_id uuid,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  unique(user_id, character_id, mission_id)
);

create table if not exists public.streetverse_creator_works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null check (char_length(character_id) between 1 and 128),
  title text not null check (char_length(title) between 1 and 200),
  work_type text not null check (work_type in ('music','visual-art','video','writing','performance','interactive-art','business-concept','other')),
  rights_status text not null default 'original-claimed' check (rights_status in ('original-claimed','collaborator-review','rights-review','rights-cleared')),
  provenance jsonb not null default '{}'::jsonb,
  collaborator_splits jsonb not null default '[]'::jsonb,
  source_mission_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists streetverse_creator_works_user_character_idx on public.streetverse_creator_works(user_id, character_id, created_at desc);

alter table public.streetverse_archive_mission_progress
  drop constraint if exists streetverse_archive_mission_progress_creator_work_id_fkey;
alter table public.streetverse_archive_mission_progress
  add constraint streetverse_archive_mission_progress_creator_work_id_fkey
  foreign key (creator_work_id) references public.streetverse_creator_works(id) on delete set null;

alter table public.streetverse_biography_snapshots enable row level security;
alter table public.streetverse_world_changes enable row level security;
alter table public.streetverse_archive_mission_progress enable row level security;
alter table public.streetverse_creator_works enable row level security;

revoke all on public.streetverse_biography_snapshots from anon;
revoke all on public.streetverse_world_changes from anon;
revoke all on public.streetverse_archive_mission_progress from anon;
revoke all on public.streetverse_creator_works from anon;

grant select, insert, update, delete on public.streetverse_biography_snapshots to authenticated;
grant select, insert, update, delete on public.streetverse_world_changes to authenticated;
grant select, insert, update, delete on public.streetverse_archive_mission_progress to authenticated;
grant select, insert, update, delete on public.streetverse_creator_works to authenticated;

do $$
declare t text;
begin
  foreach t in array array['streetverse_biography_snapshots','streetverse_world_changes','streetverse_archive_mission_progress','streetverse_creator_works'] loop
    execute format('drop policy if exists %I on public.%I', t || '_owner_select', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_insert', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_update', t);
    execute format('drop policy if exists %I on public.%I', t || '_owner_delete', t);
    execute format('create policy %I on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t || '_owner_select', t);
    execute format('create policy %I on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t || '_owner_insert', t);
    execute format('create policy %I on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t || '_owner_update', t);
    execute format('create policy %I on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t || '_owner_delete', t);
  end loop;
end $$;

commit;
