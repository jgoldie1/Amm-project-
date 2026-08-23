create or replace function public.reality_lab_is_member(p_instance_id uuid, p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select auth.uid() is not null
     and (p_user_id is null or p_user_id = auth.uid())
     and exists (
       select 1 from public.reality_lab_instance_members m
       where m.instance_id = p_instance_id and m.user_id = auth.uid()
     );
$$;

do $$
declare r record;
begin
  for r in
    select p.oid::regprocedure as signature
    from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prosecdef
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', r.signature);
    execute format('grant execute on function %s to service_role', r.signature);
  end loop;
end $$;

grant execute on function public.claim_live_room(text,text,text) to authenticated;
grant execute on function public.create_founder_priority_agency(text,text[],text[]) to authenticated;
grant execute on function public.game_move_player(uuid,text,jsonb,jsonb,jsonb,text) to authenticated;
grant execute on function public.reality_lab_create_instance(text) to authenticated;
grant execute on function public.reality_lab_is_member(uuid,uuid) to authenticated;
grant execute on function public.reality_lab_join_instance(text) to authenticated;
grant execute on function public.reality_lab_submit_puzzle_action(uuid,bigint,text,integer) to authenticated;
grant execute on function public.redeem_creator_invite(text) to authenticated;
grant execute on function public.redeem_founder_priority_invite(text) to authenticated;
grant execute on function public.redeem_tryamm_code(text) to authenticated;
grant execute on function public.send_live_gift(uuid,text,text) to authenticated;
grant execute on function public.set_live_presence(text,boolean,boolean,text) to authenticated;
