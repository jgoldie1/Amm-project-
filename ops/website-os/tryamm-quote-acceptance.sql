-- Staging only. Apply after backup / security review / separate acceptance drill.
create table if not exists public.tryamm_order_acceptance_tokens (
 token_hash text primary key check(token_hash ~ '^[0-9a-f]{64}$'),
 order_id uuid not null references public.tryamm_website_orders(id),
 quote_fingerprint text not null check(quote_fingerprint ~ '^[0-9a-f]{64}$'),
 email text not null,
 expires_at timestamptz not null,
 consumed_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists tryamm_acceptance_order_idx on public.tryamm_order_acceptance_tokens(order_id,created_at desc);
alter table public.tryamm_order_acceptance_tokens enable row level security;
revoke all on public.tryamm_order_acceptance_tokens from public,anon,authenticated;
grant select,insert,update on public.tryamm_order_acceptance_tokens to service_role;

create or replace function public.tryamm_accept_quote(p_token_hash text)
returns jsonb
language plpgsql security invoker set search_path=''
as $$
declare
 t public.tryamm_order_acceptance_tokens%rowtype;
 o public.tryamm_website_orders%rowtype;
 current_fingerprint text;
begin
 if p_token_hash !~ '^[0-9a-f]{64}$' then raise exception 'Invalid acceptance proof'; end if;
 select * into t from public.tryamm_order_acceptance_tokens
 where token_hash=p_token_hash for update;
 if not found or t.consumed_at is not null or t.revoked_at is not null or t.expires_at<=now()
 then raise exception 'Quote acceptance link invalid or expired'; end if;
 select * into o from public.tryamm_website_orders where id=t.order_id for update;
 if not found or o.status<>'quote-approved' then raise exception 'Quote no longer approvable'; end if;
 current_fingerprint:=encode(extensions.digest(
 concat_ws(E'\n',o.id::text,o.price_cents::text,o.currency,o.package_id,o.description,o.terms)::bytea,'sha256'),'hex');
 if current_fingerprint<>t.quote_fingerprint then raise exception 'Quote terms changed'; end if;
 update public.tryamm_order_acceptance_tokens set consumed_at=now() where token_hash=p_token_hash;
 update public.tryamm_website_orders set customer_accepted_at=now(),status='customer-accepted',updated_at=now()
 where id=o.id and status='quote-approved';
 return jsonb_build_object('accepted',true,'orderId',o.id);
end $$;
-- extensions.digest depends on pgcrypto installed in Supabase's extensions schema.
-- Verify extension location and exact function signature before staging execution.
revoke all on function public.tryamm_accept_quote(text) from public,anon,authenticated;
grant execute on function public.tryamm_accept_quote(text) to service_role;
