-- Release 1: narrow authoritative publication transition.
-- SECURITY DEFINER bypasses media_publications RLS only inside this validated function.
-- A creator may invoke it only for a publish job they own; delivery is allowed only
-- when the server-side media row is already ready, moderated and rights-cleared.

create or replace function public.release1_deliver_publication(
  p_job_id uuid,
  p_destination text,
  p_public_slug text,
  p_caption text default ''
) returns public.media_publications
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_uid uuid := auth.uid();
  v_job public.media_publish_jobs;
  v_media public.media_catalog;
  v_row public.media_publications;
begin
  if v_uid is null then raise exception 'authentication_required'; end if;
  if p_destination not in ('reel','omnibox','all-american-network','servants-of-christ-network','creator-profile') then
    raise exception 'invalid_destination';
  end if;

  select * into v_job from public.media_publish_jobs
   where id=p_job_id and owner_id=v_uid and status in ('queued','processing') for update;
  if not found then raise exception 'publish_job_not_processable'; end if;
  if not (p_destination = any(v_job.destinations)) then raise exception 'destination_not_in_job'; end if;

  select * into v_media from public.media_catalog
   where id=v_job.media_id and owner_id=v_uid;
  if not found then raise exception 'media_not_found'; end if;
  if v_media.processing_status <> 'ready' then raise exception 'media_not_ready'; end if;
  if coalesce(v_media.moderation_status,'pending') not in ('approved','restored') then raise exception 'moderation_review_required'; end if;
  if coalesce(v_media.rights_status,'') not in ('original','licensed','cleared') then raise exception 'rights_clearance_required'; end if;

  insert into public.media_publications(
    media_id,owner_id,publish_job_id,destination,status,public_slug,caption,
    moderation_status,monetization_status,reason_code,evidence,delivered_at,updated_at
  ) values (
    v_media.id,v_uid,v_job.id,p_destination,'delivered',p_public_slug,coalesce(p_caption,''),
    v_media.moderation_status,'gated',null,
    jsonb_build_object('source','release1-delivery-transition','validated',true),now(),now()
  )
  on conflict (media_id,owner_id,destination) do update set
    publish_job_id=excluded.publish_job_id,status='delivered',public_slug=excluded.public_slug,
    caption=excluded.caption,moderation_status=excluded.moderation_status,
    reason_code=null,evidence=excluded.evidence,delivered_at=excluded.delivered_at,updated_at=excluded.updated_at
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.release1_deliver_publication(uuid,text,text,text) from public;
grant execute on function public.release1_deliver_publication(uuid,text,text,text) to authenticated;
