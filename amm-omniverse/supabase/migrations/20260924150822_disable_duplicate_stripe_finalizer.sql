-- Disable the unused duplicate Stripe finalizer that was created out-of-band.
-- Keep its empty legacy table in place for non-destructive cleanup, but remove all
-- execute authority so the Money Engine finalizer is the only active server path.

do $do$
begin
  if to_regprocedure('public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb)') is not null then
    execute 'revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from public';
    execute 'revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from anon';
    execute 'revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from authenticated';
    execute 'revoke all on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) from service_role';
    execute 'comment on function public.apply_verified_stripe_checkout(uuid,uuid,text,text,text,bigint,text,timestamptz,jsonb) is ''Deprecated and disabled. Canonical Stripe finalization is public.commerce_finalize_stripe_checkout(), which posts to the Money Engine.''';
  end if;
end
$do$;
