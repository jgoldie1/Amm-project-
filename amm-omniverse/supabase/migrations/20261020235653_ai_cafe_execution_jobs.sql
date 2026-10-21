-- Private server-owned queue. Browser users have no direct table/RPC access.
create table public.ai_cafe_jobs (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 request_key uuid not null,
 input jsonb not null check (octet_length(input::text) <= 12000),
 kind text not null default 'website-draft' check (kind = 'website-draft'),
 status text not null default 'queued' check (status in ('queued','running','succeeded','failed')),
 attempts integer not null default 0 check (attempts between 0 and 3),
 lease_token uuid,
 lease_until timestamptz,
 output jsonb check (octet_length(output::text) <= 50000),
 error text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(user_id, request_key)
);
create index ai_cafe_jobs_owner on public.ai_cafe_jobs(user_id, created_at desc);
create index ai_cafe_jobs_queue on public.ai_cafe_jobs(status, created_at);
alter table public.ai_cafe_jobs enable row level security;
revoke all on public.ai_cafe_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.ai_cafe_jobs to service_role;

create function public.ai_cafe_submit(p_user uuid, p_key uuid, p_input jsonb)
returns public.ai_cafe_jobs language plpgsql security invoker set search_path = '' as $$
declare j public.ai_cafe_jobs;
begin
 -- Serializes quota checks and duplicate submission, including concurrent requests.
 perform pg_advisory_xact_lock(87124019);
 select * into j from public.ai_cafe_jobs where user_id=p_user and request_key=p_key;
 if found then
  if j.input <> p_input then raise exception 'idempotency_conflict'; end if;
  return j;
 end if;
 if (select count(*) from public.ai_cafe_jobs where created_at > now()-interval '24 hours') >= 100
 or (select count(*) from public.ai_cafe_jobs where user_id=p_user and created_at > now()-interval '24 hours') >= 10
 then raise exception 'job_quota_exceeded'; end if;
 insert into public.ai_cafe_jobs(user_id,request_key,input) values(p_user,p_key,p_input) returning * into j;
 return j;
end $$;

create function public.ai_cafe_claim(p_user uuid default null, p_id uuid default null)
returns setof public.ai_cafe_jobs language plpgsql security invoker set search_path = '' as $$
declare j public.ai_cafe_jobs;
begin
 update public.ai_cafe_jobs set status='failed', error='attempt_limit', lease_token=null, lease_until=null, updated_at=now()
 where status='running' and lease_until < now() and attempts >= 3
 and (p_user is null or user_id=p_user) and (p_id is null or id=p_id);
 select * into j from public.ai_cafe_jobs
 where (status='queued' or (status='running' and lease_until < now())) and attempts < 3
 and (p_user is null or user_id=p_user) and (p_id is null or id=p_id)
 order by created_at for update skip locked limit 1;
 if not found then return; end if;
 return query update public.ai_cafe_jobs set status='running', attempts=attempts+1,
 lease_token=gen_random_uuid(), lease_until=now()+interval '60 seconds', error=null, updated_at=now()
 where id=j.id returning *;
end $$;

create function public.ai_cafe_finish(p_id uuid, p_token uuid, p_output jsonb, p_error text default null)
returns boolean language plpgsql security invoker set search_path = '' as $$
begin
 if p_output is null and p_error is null then raise exception 'missing_result'; end if;
 update public.ai_cafe_jobs set
 status=case when p_error is null then 'succeeded' when attempts < 3 then 'queued' else 'failed' end,
 output=case when p_error is null then p_output else null end,
 error=case when p_error is null then null else left(p_error,100) end,
 lease_token=null, lease_until=null, updated_at=now()
 where id=p_id and lease_token=p_token and status='running' and lease_until > now();
 return found;
end $$;
revoke all on function public.ai_cafe_submit(uuid,uuid,jsonb) from public, anon, authenticated;
revoke all on function public.ai_cafe_claim(uuid,uuid) from public, anon, authenticated;
revoke all on function public.ai_cafe_finish(uuid,uuid,jsonb,text) from public, anon, authenticated;
grant execute on function public.ai_cafe_submit(uuid,uuid,jsonb) to service_role;
grant execute on function public.ai_cafe_claim(uuid,uuid) to service_role;
grant execute on function public.ai_cafe_finish(uuid,uuid,jsonb,text) to service_role;
