revoke execute on function public.claim_live_room(text,text,text) from public, anon;
revoke execute on function public.send_live_gift(uuid,text,text) from public, anon;
revoke execute on function public.set_live_presence(text,boolean,boolean,text) from public, anon;

grant execute on function public.claim_live_room(text,text,text) to authenticated, service_role;
grant execute on function public.send_live_gift(uuid,text,text) to authenticated, service_role;
grant execute on function public.set_live_presence(text,boolean,boolean,text) to authenticated, service_role;
