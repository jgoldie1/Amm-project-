-- STAGING ONLY. Apply after backup and tenant-isolation review.
-- A review is never proof of a deployed site; customer approval precedes final delivery.
alter table public.tryamm_website_orders add column if not exists review_url text;
alter table public.tryamm_website_orders add column if not exists review_submitted_at timestamptz;
alter table public.tryamm_website_orders add column if not exists customer_review_approved_at timestamptz;
alter table public.tryamm_website_orders add column if not exists customer_review_notes text;
alter table public.tryamm_website_orders add column if not exists delivery_reference text;

create table if not exists public.tryamm_order_review_tokens(
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 order_id uuid not null references public.tryamm_website_orders(id),
 customer_email text not null,
 expires_at timestamptz not null,
 consumed_at timestamptz,
 revoked_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists tryamm_order_review_tokens_order_idx on public.tryamm_order_review_tokens(order_id,created_at desc);
alter table public.tryamm_order_review_tokens enable row level security;
revoke all on public.tryamm_order_review_tokens from public,anon,authenticated;
grant select,insert,update on public.tryamm_order_review_tokens to service_role;

create or replace function public.tryamm_owner_prepare_review(
 p_order_id uuid,p_owner_id text,p_review_url text
) returns jsonb language plpgsql security invoker set search_path=''
as $$
declare o public.tryamm_website_orders%rowtype;
begin
 if p_review_url !~ '^https://[^[:space:]]+$' or length(p_review_url)>500
 then raise exception 'Review site must be HTTPS'; end if;
 select * into o from public.tryamm_website_orders where id=p_order_id and owner_id=p_owner_id for update;
 if not found then raise exception 'Owned order not found'; end if;
 if o.verified_paid_at is null or o.status not in ('paid-verified','building','review-ready')
 then raise exception 'Verified payment required before presenting a website review'; end if;
 if o.status='review-ready' and o.review_url is distinct from p_review_url
 then raise exception 'Changing a submitted preview requires an explicit new review cycle'; end if;
 if o.status='review-ready' then
  return jsonb_build_object('prepared',true,'alreadyPrepared',true);
 end if;
 update public.tryamm_website_orders
 set status='review-ready',review_url=p_review_url,review_submitted_at=now(),customer_review_approved_at=null,updated_at=now()
 where id=p_order_id;
 return jsonb_build_object('prepared',true,'alreadyPrepared',false);
end $$;

create or replace function public.tryamm_customer_approve_review(
 p_token_hash text,p_approve boolean,p_notes text
) returns jsonb language plpgsql security invoker set search_path=''
as $$
declare t public.tryamm_order_review_tokens%rowtype; o public.tryamm_website_orders%rowtype;
begin
 if p_token_hash !~ '^[a-f0-9]{64}$' then raise exception 'Invalid review token'; end if;
 if p_notes is null or length(trim(p_notes))>1000 then raise exception 'Review comment too long'; end if;
 select * into t from public.tryamm_order_review_tokens where token_hash=p_token_hash for update;
 if not found or t.expires_at<=now() or t.consumed_at is not null or t.revoked_at is not null
 then raise exception 'Review token expired or already used'; end if;
 select * into o from public.tryamm_website_orders where id=t.order_id for update;
 if not found or o.status<>'review-ready' or o.verified_paid_at is null or o.review_url is null
 then raise exception 'Order is not reviewable'; end if;
 if not exists(select 1 from public.tryamm_campaign_leads l where l.id=o.lead_id and lower(l.email)=t.customer_email)
 then raise exception 'Review recipient no longer matches customer'; end if;
 update public.tryamm_order_review_tokens set consumed_at=now() where token_hash=p_token_hash;
 if p_approve then
  update public.tryamm_website_orders set customer_review_approved_at=now(),customer_review_notes=left(p_notes,1000),updated_at=now() where id=o.id;
 else
  update public.tryamm_website_orders set status='building',customer_review_approved_at=null,review_url=null,
   customer_review_notes=left(p_notes,1000),updated_at=now() where id=o.id;
 end if;
 return jsonb_build_object('recorded',true,'approved',p_approve,'orderId',o.id);
end $$;

create or replace function public.tryamm_owner_finalize_delivery(
 p_order_id uuid,p_owner_id text,p_delivery_reference text
) returns jsonb language plpgsql security invoker set search_path=''
as $$
declare o public.tryamm_website_orders%rowtype;
begin
 if p_delivery_reference is null or length(trim(p_delivery_reference))<12 or length(p_delivery_reference)>500
 then raise exception 'Verifiable delivery evidence required'; end if;
 select * into o from public.tryamm_website_orders where id=p_order_id and owner_id=p_owner_id for update;
 if not found then raise exception 'Owned order not found'; end if;
 if o.status<>'review-ready' or o.verified_paid_at is null or o.customer_review_approved_at is null
 then raise exception 'Verified payment and buyer preview approval required'; end if;
 update public.tryamm_website_orders set status='delivered',delivered_at=now(),
 delivery_reference=p_delivery_reference,updated_at=now() where id=o.id;
 return jsonb_build_object('delivered',true,'orderId',o.id);
end $$;
revoke all on function public.tryamm_owner_prepare_review(uuid,text,text) from public,anon,authenticated;
revoke all on function public.tryamm_customer_approve_review(text,boolean,text) from public,anon,authenticated;
revoke all on function public.tryamm_owner_finalize_delivery(uuid,text,text) from public,anon,authenticated;
grant execute on function public.tryamm_owner_prepare_review(uuid,text,text) to service_role;
grant execute on function public.tryamm_customer_approve_review(text,boolean,text) to service_role;
grant execute on function public.tryamm_owner_finalize_delivery(uuid,text,text) to service_role;
