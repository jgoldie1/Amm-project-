create table public.private_memory_documents (
 user_id uuid not null references auth.users(id) on delete cascade,
 namespace text not null check(namespace in ('world','catalog','business')),
 payload jsonb not null check(octet_length(payload::text)<=262144),
 previous_payload jsonb check(octet_length(previous_payload::text)<=262144),
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 primary key(user_id,namespace)
);
alter table public.private_memory_documents enable row level security;
revoke all on public.private_memory_documents from public,anon,authenticated;
grant select,insert,update,delete on public.private_memory_documents to authenticated;
create policy memory_read on public.private_memory_documents for select to authenticated using((select auth.uid())=user_id);
create policy memory_insert on public.private_memory_documents for insert to authenticated with check((select auth.uid())=user_id);
create policy memory_update on public.private_memory_documents for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
create policy memory_delete on public.private_memory_documents for delete to authenticated using((select auth.uid())=user_id);
create function public.stamp_private_memory() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if TG_OP='INSERT' then
  new.revision=1; new.previous_payload=null;
 else
  if new.user_id<>old.user_id or new.namespace<>old.namespace then raise exception 'memory_identity_immutable'; end if;
  new.revision=old.revision+1; new.previous_payload=old.payload;
 end if;
 new.updated_at=clock_timestamp(); return new;
end $$;
revoke all on function public.stamp_private_memory() from public,anon,authenticated;
create trigger stamp_private_memory before insert or update on public.private_memory_documents for each row execute function public.stamp_private_memory();
