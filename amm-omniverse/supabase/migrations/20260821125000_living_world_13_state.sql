create table if not exists public.living_world_spaces (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 world_id text not null check(world_id in ('my-world','we-are-the-world')), title text not null, visibility text not null default 'private' check(visibility in ('private','friends','public')),
 state jsonb not null default '{}'::jsonb, reputation bigint not null default 0, updated_at timestamptz not null default now());
create table if not exists public.living_world_relationships (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 world_id text not null, entity_ref text not null, relationship_state jsonb not null default '{}'::jsonb, updated_at timestamptz not null default now(), unique(user_id,world_id,entity_ref));
create table if not exists public.living_world_travel_log (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 from_world text, to_world text not null, region_id text, mission_ref text, checkpoint jsonb not null default '{}'::jsonb, created_at timestamptz not null default now());
alter table public.living_world_spaces enable row level security; alter table public.living_world_relationships enable row level security; alter table public.living_world_travel_log enable row level security;
revoke all on public.living_world_spaces from anon; revoke all on public.living_world_relationships from anon; revoke all on public.living_world_travel_log from anon;
create policy "owner spaces" on public.living_world_spaces for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "owner relationships" on public.living_world_relationships for all to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy "owner travel" on public.living_world_travel_log for select to authenticated using((select auth.uid())=user_id);
-- travel-log writes should come from trusted runtime/server after validated world transition/checkpoint events.
