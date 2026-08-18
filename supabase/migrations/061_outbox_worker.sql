-- Atomic outbox claiming for retry-safe workers.
create or replace function public.claim_outbox_messages(p_limit integer default 25)
returns setof public.outbox_messages
language plpgsql security definer set search_path=public as $$
begin
 return query
 with picked as (
  select id from public.outbox_messages
   where status in ('pending','failed') and next_attempt_at<=now()
   order by created_at
   for update skip locked
   limit greatest(1,least(coalesce(p_limit,25),100))
 )
 update public.outbox_messages o set status='processing',locked_at=now(),attempts=o.attempts+1
 from picked where o.id=picked.id returning o.*;
end;$$;

create or replace function public.complete_outbox_message(p_id uuid)
returns void language sql security definer set search_path=public as $$
 update public.outbox_messages set status='delivered',delivered_at=now(),locked_at=null,last_error=null where id=p_id;
$$;

create or replace function public.fail_outbox_message(p_id uuid,p_error text,p_dead_letter_after integer default 8)
returns void language sql security definer set search_path=public as $$
 update public.outbox_messages
 set status=case when attempts>=greatest(1,p_dead_letter_after) then 'dead-letter' else 'failed' end,
     locked_at=null,last_error=left(coalesce(p_error,'unknown'),2000),
     next_attempt_at=now()+(least(3600,power(2,least(attempts,12)))::text||' seconds')::interval
 where id=p_id;
$$;

revoke all on function public.claim_outbox_messages(integer) from public;
revoke all on function public.complete_outbox_message(uuid) from public;
revoke all on function public.fail_outbox_message(uuid,text,integer) from public;
