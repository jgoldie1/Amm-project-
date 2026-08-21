create or replace function public.redeem_creator_invite(p_code text)
returns table(invite_id uuid, agency_id uuid, source_platform text, code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_invite public.tryamm_creator_invites%rowtype;
begin
  if v_user is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_invite
  from public.tryamm_creator_invites
  where upper(tryamm_creator_invites.code) = upper(trim(p_code))
    and active = true
  for update;

  if not found then raise exception 'INVITE_NOT_FOUND'; end if;
  if v_invite.expires_at is not null and v_invite.expires_at <= now() then raise exception 'INVITE_EXPIRED'; end if;
  if v_invite.max_uses is not null and v_invite.uses >= v_invite.max_uses then raise exception 'INVITE_LIMIT_REACHED'; end if;
  if exists(select 1 from public.tryamm_creator_attribution a where a.user_id=v_user) then raise exception 'ATTRIBUTION_ALREADY_LOCKED'; end if;

  insert into public.tryamm_creator_attribution(user_id,invite_id,agency_id,source_platform)
  values(v_user,v_invite.id,v_invite.agency_id,v_invite.source_platform);

  if v_invite.agency_id is not null then
    insert into public.tryamm_agency_memberships(agency_id,user_id,role,status)
    values(v_invite.agency_id,v_user,'creator','active')
    on conflict (agency_id,user_id) do update set role='creator',status='active';
  end if;

  update public.tryamm_creator_invites set uses=uses+1 where id=v_invite.id;

  return query select v_invite.id,v_invite.agency_id,v_invite.source_platform,v_invite.code;
end;
$$;

revoke all on function public.redeem_creator_invite(text) from public;
grant execute on function public.redeem_creator_invite(text) to authenticated;

comment on function public.redeem_creator_invite(text) is 'Atomic authenticated invite redemption. Locks invite usage, preserves immutable first-touch attribution, joins an agency as creator when applicable, and creates no monetary entitlement by itself.';
