-- Grant limits are lifetime limits. Raising the limit requires fresh owner approval.
create table public.drama_creator_passes (
  user_id uuid primary key references auth.users(id),
  credit_limit integer not null check (credit_limit between 0 and 400),
  used_units integer not null default 0 check (used_units >= 0),
  approved_by uuid not null references auth.users(id)
);
alter table public.drama_creator_passes enable row level security;
revoke all on public.drama_creator_passes from public, anon, authenticated;
grant select, insert, update on public.drama_creator_passes to service_role;

create function public.claim_drama_creator_render(p_user_id uuid, p_source_id text)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare
  pass public.drama_creator_passes%rowtype;
  receipt public.tryamm_credit_entitlements%rowtype;
begin
  if p_source_id is null or p_source_id !~ '^drama-pass:[a-zA-Z0-9_-]{1,80}$' then
    raise exception 'invalid_drama_reference';
  end if;
  select * into pass from public.drama_creator_passes where user_id=p_user_id for update;
  if not found or pass.credit_limit=0 then raise exception 'drama_pass_inactive'; end if;
  select * into receipt from public.tryamm_credit_entitlements where user_id=p_user_id and source_id=p_source_id;
  if found then
    if receipt.item_id <> 'premium-reel-render' or receipt.metadata->>'funding' is distinct from 'owner-pass' then raise exception 'reference_conflict'; end if;
  else
    if pass.used_units+40>pass.credit_limit then raise exception 'drama_pass_limit'; end if;
    if exists(select 1 from public.tryamm_credit_wallets where user_id=p_user_id and (status<>'active' or play_refund_debt_units>0)) then raise exception 'credit_wallet_not_spendable'; end if;
    insert into public.tryamm_credit_entitlements(user_id,item_id,entitlement_type,source_id,metadata)
      values(p_user_id,'premium-reel-render','media-tool',p_source_id,'{"funding":"owner-pass","cashValueMinor":0,"creatorCashPayout":false}');
    update public.drama_creator_passes set used_units=used_units+40 where user_id=p_user_id returning * into pass;
  end if;
  return jsonb_build_object('sourceId',p_source_id,'remainingUnits',greatest(0,pass.credit_limit-pass.used_units),'walletDebit',0);
end $$;
revoke all on function public.claim_drama_creator_render(uuid,text) from public,anon,authenticated;
grant execute on function public.claim_drama_creator_render(uuid,text) to service_role;

create function public.approve_drama_creator_pass(p_user_id uuid,p_limit integer,p_owner uuid)
returns void language sql security invoker set search_path=public as $$
  insert into public.drama_creator_passes(user_id,credit_limit,approved_by) values(p_user_id,p_limit,p_owner)
  on conflict(user_id) do update set credit_limit=excluded.credit_limit,approved_by=excluded.approved_by;
$$;
revoke all on function public.approve_drama_creator_pass(uuid,integer,uuid) from public,anon,authenticated;
grant execute on function public.approve_drama_creator_pass(uuid,integer,uuid) to service_role;
