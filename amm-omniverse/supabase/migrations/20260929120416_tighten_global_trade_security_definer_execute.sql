-- Restrict reviewed global-trade SECURITY DEFINER RPCs to server authority.
-- Applied live via Supabase migration 20260929120416.

revoke execute on function public.global_trade_pipeline_summary() from public, anon, authenticated;
grant execute on function public.global_trade_pipeline_summary() to service_role;

revoke execute on function public.global_trade_set_intake_status(uuid,text,text) from public, anon, authenticated;
grant execute on function public.global_trade_set_intake_status(uuid,text,text) to service_role;
