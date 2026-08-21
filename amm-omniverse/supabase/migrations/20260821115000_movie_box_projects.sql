create table if not exists public.movie_box_projects (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 title text not null, source_world text, status text not null default 'draft' check(status in ('draft','editing','rendering','ready','published','archived')),
 rights_state text not null default 'review-required', project_state jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.movie_box_scenes (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.movie_box_projects(id) on delete cascade,
 scene_index integer not null check(scene_index>=0), title text not null default 'Scene', source_checkpoint jsonb not null default '{}'::jsonb,
 camera jsonb not null default '{}'::jsonb, characters jsonb not null default '[]'::jsonb, audio jsonb not null default '{}'::jsonb,
 lottie_overlays jsonb not null default '[]'::jsonb, duration_ms bigint not null default 0 check(duration_ms>=0), updated_at timestamptz not null default now(), unique(project_id,scene_index));
create table if not exists public.movie_box_exports (
 id uuid primary key default gen_random_uuid(), project_id uuid not null references public.movie_box_projects(id) on delete cascade,
 format text not null check(format in ('webm','mp4','reel','project-json')), state text not null default 'queued' check(state in ('queued','rendering','ready','failed','cancelled')),
 rights_snapshot jsonb not null default '{}'::jsonb, output_ref text, error_message text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
alter table public.movie_box_projects enable row level security; alter table public.movie_box_scenes enable row level security; alter table public.movie_box_exports enable row level security;
revoke all on public.movie_box_projects from anon; revoke all on public.movie_box_scenes from anon; revoke all on public.movie_box_exports from anon;
create policy "movie owner projects" on public.movie_box_projects for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "movie owner scenes" on public.movie_box_scenes for all to authenticated using(exists(select 1 from public.movie_box_projects p where p.id=project_id and p.user_id=(select auth.uid()))) with check(exists(select 1 from public.movie_box_projects p where p.id=project_id and p.user_id=(select auth.uid())));
create policy "movie owner exports read" on public.movie_box_exports for select to authenticated using(exists(select 1 from public.movie_box_projects p where p.id=project_id and p.user_id=(select auth.uid())));
-- Render/export completion writes are trusted-server operations; client cannot mark an export ready.
