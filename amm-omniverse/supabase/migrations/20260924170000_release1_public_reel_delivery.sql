-- Release 1: canonical public Reel delivery records.
-- media_catalog remains the owned source asset; media_publish_jobs remains the queue.
-- This table is the public delivery projection and is intentionally separate from creator storage.

create table if not exists public.media_publications (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  publish_job_id uuid,
  destination text not null check (destination in ('reel','omnibox','all-american-network','servants-of-christ-network','creator-profile')),
  status text not null default 'processing' check (status in ('processing','delivered','failed','removed','limited','under-review')),
  public_slug text not null unique,
  caption text not null default '',
  moderation_status text not null default 'pending' check (moderation_status in ('pending','approved','limited','rejected','appealed','restored')),
  monetization_status text not null default 'gated' check (monetization_status in ('gated','eligible','held','ineligible')),
  reason_code text,
  evidence jsonb not null default '{}'::jsonb,
  delivered_at timestamptz,
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(media_id, owner_id, destination)
);

create index if not exists media_publications_owner_created_idx on public.media_publications(owner_id, created_at desc);
create index if not exists media_publications_destination_status_idx on public.media_publications(destination, status, created_at desc);

alter table public.media_publications enable row level security;

drop policy if exists media_publications_owner_read on public.media_publications;
create policy media_publications_owner_read on public.media_publications
for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists media_publications_public_read on public.media_publications;
create policy media_publications_public_read on public.media_publications
for select to anon using (status = 'delivered' and moderation_status in ('approved','restored'));

drop policy if exists media_publications_owner_insert on public.media_publications;
create policy media_publications_owner_insert on public.media_publications
for insert to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists media_publications_owner_update on public.media_publications;
create policy media_publications_owner_update on public.media_publications
for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

create table if not exists public.media_moderation_appeals (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.media_publications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'submitted' check (status in ('submitted','under-review','upheld','restored')),
  reason text not null,
  evidence jsonb not null default '{}'::jsonb,
  decision_reason text,
  created_at timestamptz not null default now(),
  decided_at timestamptz
);

alter table public.media_moderation_appeals enable row level security;
drop policy if exists media_moderation_appeals_owner_read on public.media_moderation_appeals;
create policy media_moderation_appeals_owner_read on public.media_moderation_appeals for select to authenticated using ((select auth.uid())=owner_id);
drop policy if exists media_moderation_appeals_owner_insert on public.media_moderation_appeals;
create policy media_moderation_appeals_owner_insert on public.media_moderation_appeals for insert to authenticated with check ((select auth.uid())=owner_id);
