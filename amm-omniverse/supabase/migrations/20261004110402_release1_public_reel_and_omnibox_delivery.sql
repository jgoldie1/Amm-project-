create table if not exists public.media_publications (
  id uuid primary key default gen_random_uuid(),
  media_id uuid not null references public.media_catalog(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  publish_job_id uuid references public.media_publish_jobs(id) on delete set null,
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
  unique(media_id,owner_id,destination)
);

create index if not exists media_publications_owner_created_idx on public.media_publications(owner_id,created_at desc);
create index if not exists media_publications_destination_status_idx on public.media_publications(destination,status,created_at desc);

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

alter table public.media_publications enable row level security;
alter table public.media_moderation_appeals enable row level security;

revoke all on public.media_publications from anon,authenticated;
revoke all on public.media_moderation_appeals from anon,authenticated;
grant select on public.media_publications to anon,authenticated;
grant select,insert on public.media_moderation_appeals to authenticated;

drop policy if exists media_publications_owner_read on public.media_publications;
create policy media_publications_owner_read on public.media_publications
for select to authenticated using ((select auth.uid()) is not null and (select auth.uid())=owner_id);

drop policy if exists media_publications_public_read on public.media_publications;
create policy media_publications_public_read on public.media_publications
for select to anon using (status='delivered' and moderation_status in ('approved','restored'));

drop policy if exists media_moderation_appeals_owner_read on public.media_moderation_appeals;
create policy media_moderation_appeals_owner_read on public.media_moderation_appeals
for select to authenticated using ((select auth.uid()) is not null and (select auth.uid())=owner_id);

drop policy if exists media_moderation_appeals_owner_insert on public.media_moderation_appeals;
create policy media_moderation_appeals_owner_insert on public.media_moderation_appeals
for insert to authenticated with check ((select auth.uid()) is not null and (select auth.uid())=owner_id);

create or replace function public.release1_deliver_publication(
  p_job_id uuid,p_destination text,p_public_slug text,p_caption text default ''
) returns public.media_publications
language plpgsql security definer set search_path=public,pg_temp
as $$
declare
  v_uid uuid:=auth.uid();
  v_job public.media_publish_jobs;
  v_media public.media_catalog;
  v_row public.media_publications;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if p_destination not in ('reel','omnibox','all-american-network','servants-of-christ-network','creator-profile') then raise exception 'invalid_destination'; end if;

  select * into v_job from public.media_publish_jobs
  where id=p_job_id and owner_id=v_uid and status in ('queued','processing') for update;
  if not found then raise exception 'publish_job_not_processable'; end if;
  if not (p_destination=any(v_job.destinations)) then raise exception 'destination_not_in_job'; end if;

  select * into v_media from public.media_catalog where id=v_job.media_id and owner_id=v_uid;
  if not found then raise exception 'media_not_found'; end if;
  if v_media.processing_status<>'ready' then raise exception 'media_not_ready'; end if;
  if coalesce(v_media.moderation_status,'pending')<>'approved' then raise exception 'moderation_review_required'; end if;
  if coalesce(v_media.rights_status,'') not in ('original','licensed','public_domain','creator_authorized') then raise exception 'rights_clearance_required'; end if;

  insert into public.media_publications(
    media_id,owner_id,publish_job_id,destination,status,public_slug,caption,moderation_status,
    monetization_status,reason_code,evidence,delivered_at,updated_at
  ) values (
    v_media.id,v_uid,v_job.id,p_destination,'delivered',p_public_slug,coalesce(p_caption,''),
    v_media.moderation_status,'gated',null,jsonb_build_object('source','release1-delivery-transition','validated',true),now(),now()
  )
  on conflict (media_id,owner_id,destination) do update set
    publish_job_id=excluded.publish_job_id,status='delivered',public_slug=excluded.public_slug,
    caption=excluded.caption,moderation_status=excluded.moderation_status,reason_code=null,
    evidence=excluded.evidence,delivered_at=excluded.delivered_at,updated_at=excluded.updated_at
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.release1_deliver_publication(uuid,text,text,text) from public,anon;
grant execute on function public.release1_deliver_publication(uuid,text,text,text) to authenticated;
