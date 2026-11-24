-- Private Realtime inboxes. Only the server function can deliver a signal.
create policy "Read own Greenville phone inbox" on realtime.messages
for select to authenticated using (realtime.topic() = 'gv-phone:' || (select auth.uid())::text);

create policy "Isolate Greenville phone inboxes" on realtime.messages as restrictive
for select to public using (coalesce(realtime.topic(),'') not like 'gv-phone:%' or
  realtime.topic() = 'gv-phone:' || (select auth.uid())::text);

create policy "Prevent direct Greenville phone broadcasts" on realtime.messages as restrictive
for insert to public with check (coalesce(realtime.topic(),'') not like 'gv-phone:%');

create table public.greenville_phone_ring_limit (
  caller uuid primary key references auth.users(id) on delete cascade,
  last_ring timestamptz not null
);
alter table public.greenville_phone_ring_limit enable row level security;
revoke all on public.greenville_phone_ring_limit from public, anon, authenticated;

create function public.greenville_phone_signal(recipient uuid, call_id uuid, kind text, body text default '')
returns void language plpgsql security definer set search_path = '' as $$
declare sender uuid := auth.uid();
begin
  if sender is null or recipient is null or recipient = sender or call_id is null
    or kind is null or kind not in ('ring','accept','offer','answer','end','pin')
    or body is null or octet_length(body) > 32768
    or (kind not in ('offer','answer') and body <> '') then
    raise exception 'Invalid phone signal';
  end if;
  if kind = 'ring' then
    insert into public.greenville_phone_ring_limit as limits values(sender, now())
    on conflict (caller) do update set last_ring = excluded.last_ring
      where limits.last_ring < now() - interval '8 seconds';
    if not found then raise exception 'Wait before calling again'; end if;
  end if;
  perform realtime.send(jsonb_build_object('sender',sender,'id',call_id,'kind',kind,'body',body),
    'signal','gv-phone:' || recipient::text,true);
end;
$$;
revoke all on function public.greenville_phone_signal(uuid,uuid,text,text) from public, anon;
grant execute on function public.greenville_phone_signal(uuid,uuid,text,text) to authenticated;
