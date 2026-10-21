create table public.studio_businesses(
 id uuid primary key default gen_random_uuid(), owner_id uuid not null references auth.users(id),
 name text not null check(length(name) between 1 and 200), data jsonb not null check(octet_length(data::text)<14000),
 price_cents integer not null check(price_cents between 0 and 99900), commission_bps integer not null default 0 check(commission_bps between 0 and 5000), agent_reference text not null default '' check(length(agent_reference)<=200),
 approved boolean not null default false, revision integer not null default 1, created_at timestamptz not null default now()
);
create table public.studio_orders(
 id uuid primary key default gen_random_uuid(), business_id uuid not null references public.studio_businesses(id),owner_id uuid not null references auth.users(id),customer_id uuid not null references auth.users(id),request_key uuid not null,
 input jsonb not null, requirements text not null check(length(requirements)<=3000), snapshot jsonb not null,
 price_cents integer not null, commission_bps integer not null, agent_reference text not null,
 commerce_id uuid unique references public.commerce_orders(id), job_id uuid references public.ai_cafe_jobs(id),job_key uuid not null default gen_random_uuid(),
 state text not null default 'received' check(state in ('received','draft','reviewed','published')),revision integer not null default 1,
 reviewed_hash text, published_html text, published_at timestamptz,created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
 unique(customer_id,request_key)
);
create index studio_orders_owner on public.studio_orders(owner_id,created_at desc);
create index studio_orders_customer on public.studio_orders(customer_id,created_at desc);
create table public.studio_order_events(id uuid primary key default gen_random_uuid(),order_id uuid not null references public.studio_orders(id),actor_id uuid not null,action text not null,revision integer not null,details jsonb not null default '{}',created_at timestamptz not null default now());
create index studio_events_order on public.studio_order_events(order_id,created_at);
create table public.studio_expenses(id uuid primary key default gen_random_uuid(),owner_id uuid not null references auth.users(id),request_key uuid not null,amount_cents integer not null check(amount_cents between 1 and 10000000),description text not null check(length(description) between 1 and 300),incurred_on date not null default current_date,created_at timestamptz not null default now(),unique(owner_id,request_key));
create table public.studio_budgets(owner_id uuid primary key references auth.users(id),monthly_limit_cents integer not null default 0 check(monthly_limit_cents between 0 and 10000000));
alter table public.studio_businesses enable row level security;
alter table public.studio_orders enable row level security;
alter table public.studio_order_events enable row level security;
alter table public.studio_expenses enable row level security;
alter table public.studio_budgets enable row level security;
revoke all on public.studio_businesses,public.studio_orders,public.studio_order_events,public.studio_expenses,public.studio_budgets from public,anon,authenticated;
grant all on public.studio_businesses,public.studio_orders,public.studio_order_events,public.studio_expenses,public.studio_budgets to service_role;

create function public.studio_action(p_user uuid,p_action text,p_data jsonb) returns jsonb language plpgsql security invoker set search_path='' as $$
declare b public.studio_businesses;o public.studio_orders;j public.ai_cafe_jobs;c uuid;v jsonb;amount integer;
begin
 if p_user is null or octet_length(p_data::text)>20000 then raise exception 'invalid_request';end if;
 if p_action='business' then
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,31));
  if (select count(*) from public.studio_businesses where owner_id=p_user)>=100 then raise exception 'business_limit';end if;
  insert into public.studio_businesses(owner_id,name,data,price_cents,commission_bps,agent_reference,approved) values(p_user,p_data->>'name',p_data->'data',(p_data->>'priceCents')::integer,(p_data->>'commissionBps')::integer,coalesce(p_data->>'agentReference',''),true) returning * into b;
  return to_jsonb(b);
 elsif p_action='intake' then
  perform pg_advisory_xact_lock(hashtextextended(p_user::text,32));
  select * into o from public.studio_orders where customer_id=p_user and request_key=(p_data->>'requestKey')::uuid;
  if found then
   if o.input<>p_data->'input' or o.requirements<>p_data->>'requirements' or o.business_id<>(p_data->>'businessId')::uuid then raise exception 'request_conflict';end if;
   return to_jsonb(o);
  end if;
  select * into b from public.studio_businesses where id=(p_data->>'businessId')::uuid and approved=true;
  if not found then raise exception 'business_unavailable';end if;
  if (select count(*) from public.studio_orders where customer_id=p_user and created_at>now()-interval '24 hours')>=10 then raise exception 'intake_limit';end if;
  if b.price_cents>0 then
   insert into public.commerce_orders(buyer_id,client_order_id,currency,subtotal_cents,fulfillment,status,idempotency_key,metadata) values(p_user,'studio-'||(p_data->>'requestKey'),'USD',b.price_cents,'digital','pending_payment','studio-'||p_user::text||'-'||(p_data->>'requestKey'),jsonb_build_object('studio',true)) returning id into c;
   insert into public.commerce_order_items(order_id,product_id,seller_key,product_name,unit_amount_cents,quantity,line_total_cents) values(c,'studio-website','tryamm-platform','Reviewed website delivery',b.price_cents,1,b.price_cents);
   insert into public.commerce_seller_allocations(order_id,seller_key,gross_cents,platform_fee_cents,seller_net_cents,reserve_cents,transfer_status) values(c,'tryamm-platform',b.price_cents,b.price_cents,0,0,'blocked');
  end if;
  insert into public.studio_orders(business_id,owner_id,customer_id,request_key,input,requirements,snapshot,price_cents,commission_bps,agent_reference,commerce_id)
  values(b.id,b.owner_id,p_user,(p_data->>'requestKey')::uuid,p_data->'input',p_data->>'requirements',to_jsonb(b),b.price_cents,b.commission_bps,b.agent_reference,c) returning * into o;
 elsif p_action='expense' then
  insert into public.studio_expenses(owner_id,request_key,amount_cents,description,incurred_on) values(p_user,(p_data->>'requestKey')::uuid,(p_data->>'amountCents')::integer,p_data->>'description',(p_data->>'incurredOn')::date) on conflict(owner_id,request_key) do nothing;
  if not exists(select 1 from public.studio_expenses where owner_id=p_user and request_key=(p_data->>'requestKey')::uuid and amount_cents=(p_data->>'amountCents')::integer and description=p_data->>'description' and incurred_on=(p_data->>'incurredOn')::date) then raise exception 'request_conflict';end if;
  return jsonb_build_object('saved',true);
 elsif p_action='budget' then
  insert into public.studio_budgets(owner_id,monthly_limit_cents) values(p_user,(p_data->>'limitCents')::integer) on conflict(owner_id) do update set monthly_limit_cents=excluded.monthly_limit_cents;
  return jsonb_build_object('saved',true);
 else
  select * into o from public.studio_orders where id=(p_data->>'id')::uuid and (owner_id=p_user or customer_id=p_user) for update;
  if not found then raise exception 'order_not_found';end if;
  if o.revision is distinct from (p_data->>'revision')::integer then raise exception 'revision_conflict';end if;
  if p_action in ('execute','review','publish','unpublish') and o.owner_id<>p_user then raise exception 'owner_required';end if;
  if p_action='revise' then
   if o.state='published' then raise exception 'unpublish_before_revision';end if;
   if o.revision>=50 then raise exception 'revision_limit';end if;
   update public.studio_orders set requirements=p_data->>'requirements',input=p_data->'input',state='received',job_id=null,job_key=gen_random_uuid(),reviewed_hash=null,revision=revision+1,updated_at=now() where id=o.id returning * into o;
  elsif p_action='execute' then
   if o.state='published' then raise exception 'unpublish_before_revision';end if;
   -- Approved services/rates are immutable per order; customer notes are not instructions.
   v=o.input||jsonb_build_object('services',coalesce(o.snapshot->'data'->>'services',''),'description',coalesce(o.snapshot->'data'->>'description',''),'headline',coalesce(o.snapshot->'data'->>'headline',''));
   select * into j from public.ai_cafe_submit(o.owner_id,o.job_key,v);
   update public.studio_orders set job_id=j.id,state='draft',updated_at=now() where id=o.id returning * into o;
  elsif p_action='review' then
   select * into j from public.ai_cafe_jobs where id=o.job_id and user_id=o.owner_id and status='succeeded';
   if not found or coalesce(j.output->>'sha256','') is distinct from p_data->>'hash' then raise exception 'completed_draft_required';end if;
   update public.studio_orders set state='reviewed',reviewed_hash=j.output->>'sha256',updated_at=now() where id=o.id returning * into o;
  elsif p_action='publish' then
   select * into j from public.ai_cafe_jobs where id=o.job_id and user_id=o.owner_id and status='succeeded';
   if not found or o.state not in ('reviewed','published') or o.reviewed_hash is distinct from j.output->>'sha256' then raise exception 'review_required';end if;
   if o.price_cents>0 and not exists(select 1 from public.commerce_payment_transactions t where t.order_id=o.commerce_id and t.buyer_id=o.customer_id and t.status='paid' and t.provider='stripe' and t.amount_cents=o.price_cents and upper(t.currency)='USD' and t.metadata->>'livemode'='true' and not exists(select 1 from public.commerce_refunds r where r.transaction_id=t.id and r.status='succeeded')) then raise exception 'verified_live_payment_required';end if;
   update public.studio_orders set state='published',published_html=j.output->>'html',published_at=now(),updated_at=now() where id=o.id returning * into o;
  elsif p_action='unpublish' then
   update public.studio_orders set state='reviewed',published_html=null,published_at=null,updated_at=now() where id=o.id returning * into o;
  else raise exception 'unsupported_action';end if;
 end if;
 insert into public.studio_order_events(order_id,actor_id,action,revision,details) values(o.id,p_user,p_action,o.revision,jsonb_build_object('jobId',o.job_id,'state',o.state));
 return to_jsonb(o);
end $$;
revoke all on function public.studio_action(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.studio_action(uuid,text,jsonb) to service_role;
create table public.studio_backup_runs(id uuid primary key default gen_random_uuid(),object_key text,bytes integer,status text not null check(status in ('succeeded','failed')),created_at timestamptz not null default now());
alter table public.studio_backup_runs enable row level security;
revoke all on public.studio_backup_runs from public,anon,authenticated;
grant all on public.studio_backup_runs to service_role;
create function public.studio_backup_snapshot(p_owner uuid default null) returns jsonb language plpgsql security invoker set search_path='' as $$
declare result jsonb;
begin
 if (select count(*) from public.studio_orders where p_owner is null or owner_id=p_owner)>1000 then raise exception 'backup_size_limit';end if;
 select jsonb_build_object('schema','tryamm.studio-backup.v1','createdAt',now(),
 'businesses',(select coalesce(jsonb_agg(b),'[]') from public.studio_businesses b where p_owner is null or b.owner_id=p_owner),
 'orders',(select coalesce(jsonb_agg(o),'[]') from public.studio_orders o where p_owner is null or o.owner_id=p_owner),
 'events',(select coalesce(jsonb_agg(e),'[]') from public.studio_order_events e join public.studio_orders o on o.id=e.order_id where p_owner is null or o.owner_id=p_owner),
 'jobs',(select coalesce(jsonb_agg(j),'[]') from public.ai_cafe_jobs j where exists(select 1 from public.studio_orders o where o.job_id=j.id and (p_owner is null or o.owner_id=p_owner))),
 'expenses',(select coalesce(jsonb_agg(e),'[]') from public.studio_expenses e where p_owner is null or e.owner_id=p_owner),
 'budgets',(select coalesce(jsonb_agg(b),'[]') from public.studio_budgets b where p_owner is null or b.owner_id=p_owner),
 'memory',(select coalesce(jsonb_agg(m),'[]') from public.private_memory_documents m where m.user_id=p_owner or (p_owner is null and exists(select 1 from public.studio_businesses b where b.owner_id=m.user_id))),
 'paymentEvidence',(select coalesce(jsonb_agg(t),'[]') from public.commerce_payment_transactions t where exists(select 1 from public.studio_orders o where o.commerce_id=t.order_id and (p_owner is null or o.owner_id=p_owner)))) into result;
 if octet_length(result::text)>3000000 then raise exception 'backup_size_limit';end if;
 return result;
end $$;
revoke all on function public.studio_backup_snapshot(uuid) from public,anon,authenticated;
grant execute on function public.studio_backup_snapshot(uuid) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('studio-backups','studio-backups',false,32000000,array['application/gzip']) on conflict(id) do nothing;
