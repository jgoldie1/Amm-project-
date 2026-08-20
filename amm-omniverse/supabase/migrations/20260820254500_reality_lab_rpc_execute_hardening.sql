begin;

revoke execute on function public.reality_lab_create_instance(text) from public, anon;
revoke execute on function public.reality_lab_join_instance(text) from public, anon;
revoke execute on function public.reality_lab_submit_puzzle_action(uuid,bigint,text,integer) from public, anon;
revoke execute on function public.reality_lab_is_member(uuid,uuid) from public, anon;

grant execute on function public.reality_lab_create_instance(text) to authenticated;
grant execute on function public.reality_lab_join_instance(text) to authenticated;
grant execute on function public.reality_lab_submit_puzzle_action(uuid,bigint,text,integer) to authenticated;
grant execute on function public.reality_lab_is_member(uuid,uuid) to authenticated;

commit;
