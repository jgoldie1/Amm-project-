create or replace function public.redeem_founder_priority_invite(p_code text)
returns table(entitlement_id uuid, invite_label text, status text)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_hash text;
  v_inv public.tryamm_founder_priority_invites%rowtype;
  v_ent public.tryamm_founder_priority_entitlements%rowtype;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  v_hash := encode(digest(upper(trim(coalesce(p_code,''))), 'sha256'),'hex');
  select * into v_inv from public.tryamm_founder_priority_invites
    where code_hash=v_hash and active=true
    for update;
  if not found then raise exception 'PRIORITY_INVITE_NOT_FOUND'; end if;
  if v_inv.expires_at is not null and v_inv.expires_at <= now() then raise exception 'PRIORITY_INVITE_EXPIRED'; end if;
  if v_inv.uses >= v_inv.max_uses then raise exception 'PRIORITY_INVITE_LIMIT_REACHED'; end if;
  if exists(select 1 from public.tryamm_founder_priority_entitlements where user_id=v_user) then raise exception 'PRIORITY_ALREADY_CLAIMED'; end if;
  insert into public.tryamm_founder_priority_entitlements(user_id,invite_id,status)
    values(v_user,v_inv.id,'available') returning * into v_ent;
  update public.tryamm_founder_priority_invites set uses=uses+1 where id=v_inv.id;
  return query select v_ent.id,v_inv.label,v_ent.status;
end;$$;

revoke all on function public.redeem_founder_priority_invite(text) from public,anon;
grant execute on function public.redeem_founder_priority_invite(text) to authenticated;

create or replace function public.create_founder_priority_agency(
  p_name text,
  p_markets text[] default '{}',
  p_specialties text[] default '{}'
)
returns table(agency_id uuid, agency_slug text, agency_status text, priority_lane boolean)
language plpgsql
security definer
set search_path=public
as $$
declare
  v_user uuid := auth.uid();
  v_ent public.tryamm_founder_priority_entitlements%rowtype;
  v_agency public.tryamm_agencies%rowtype;
  v_slug text;
begin
  if v_user is null then raise exception 'AUTH_REQUIRED'; end if;
  select * into v_ent from public.tryamm_founder_priority_entitlements
    where user_id=v_user and status='available' for update;
  if not found then raise exception 'PRIORITY_ENTITLEMENT_REQUIRED'; end if;
  if trim(coalesce(p_name,''))='' then raise exception 'AGENCY_NAME_REQUIRED'; end if;
  v_slug := regexp_replace(lower(trim(p_name)),'[^a-z0-9]+','-','g');
  v_slug := trim(both '-' from v_slug);
  if v_slug='' then raise exception 'AGENCY_NAME_REQUIRED'; end if;
  if exists(select 1 from public.tryamm_agencies where slug=v_slug) then
    v_slug := left(v_slug,50)||'-'||substr(replace(gen_random_uuid()::text,'-',''),1,8);
  end if;
  insert into public.tryamm_agencies(owner_user_id,name,slug,markets,specialties,status,priority_lane,priority_reason)
    values(v_user,left(trim(p_name),100),left(v_slug,60),coalesce(p_markets,'{}'),coalesce(p_specialties,'{}'),'pending',true,'founder-priority-invite')
    returning * into v_agency;
  insert into public.tryamm_agency_memberships(agency_id,user_id,role,status)
    values(v_agency.id,v_user,'owner','active');
  update public.tryamm_founder_priority_entitlements
    set status='used',used_at=now(),agency_id=v_agency.id where id=v_ent.id;
  return query select v_agency.id,v_agency.slug,v_agency.status,v_agency.priority_lane;
end;$$;

revoke all on function public.create_founder_priority_agency(text,text[],text[]) from public,anon;
grant execute on function public.create_founder_priority_agency(text,text[],text[]) to authenticated;

comment on function public.create_founder_priority_agency(text,text[],text[]) is 'Consumes a founder-priority entitlement to create a priority-lane agency. Agency remains pending until mandatory verification/compliance gates are complete.';
