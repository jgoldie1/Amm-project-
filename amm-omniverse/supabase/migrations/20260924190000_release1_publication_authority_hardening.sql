-- Release 1 security hardening: publication delivery/moderation state is authoritative.
-- Creator clients may read their own rows and submit appeals, but may not directly
-- insert/update canonical public delivery rows.

alter table public.media_publications enable row level security;

drop policy if exists media_publications_owner_insert on public.media_publications;
drop policy if exists media_publications_owner_update on public.media_publications;

-- Preserve creator visibility of their own publication state.
drop policy if exists media_publications_owner_read on public.media_publications;
create policy media_publications_owner_read on public.media_publications
for select to authenticated using ((select auth.uid()) = owner_id);

-- Public projection remains limited to delivered and approved/restored rows.
drop policy if exists media_publications_public_read on public.media_publications;
create policy media_publications_public_read on public.media_publications
for select to anon using (
  status = 'delivered'
  and moderation_status in ('approved','restored')
);

-- Appeals remain creator-writable; canonical publication state does not.
alter table public.media_moderation_appeals enable row level security;
