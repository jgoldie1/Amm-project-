-- Defense in depth: creator invite redemption is authenticated-only.
revoke all on function public.redeem_creator_invite(text) from public, anon;
grant execute on function public.redeem_creator_invite(text) to authenticated;
