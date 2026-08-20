create table if not exists public.money_postings (
  posting_id uuid primary key,
  account_id uuid not null,
  reference_type text not null,
  reference_id text not null,
  currency text not null,
  entries_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (account_id, reference_type, reference_id, currency)
);

alter table public.money_postings enable row level security;
revoke all on table public.money_postings from public, anon, authenticated;
grant select, insert on table public.money_postings to service_role;

insert into public.money_postings(posting_id,account_id,reference_type,reference_id,currency,entries_hash,metadata,created_at)
select posting_id, account_id, reference_type, reference_id, currency, null,
       coalesce((array_agg(metadata order by created_at asc))[1], '{}'::jsonb), min(created_at)
from public.money_ledger_entries
group by posting_id, account_id, reference_type, reference_id, currency
on conflict do nothing;

create or replace function public.money_engine_post(
  p_account_id uuid,
  p_reference_type text,
  p_reference_id text,
  p_currency text,
  p_entries jsonb,
  p_metadata jsonb default '{}'::jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_posting uuid := gen_random_uuid();
  v_existing uuid;
  v_existing_hash text;
  v_entries_hash text;
  v_debits bigint;
  v_credits bigint;
  e jsonb;
begin
  if p_account_id is null or jsonb_typeof(p_entries) <> 'array' then raise exception 'invalid_posting_input'; end if;
  if coalesce(trim(p_reference_type),'') = '' or coalesce(trim(p_reference_id),'') = '' then raise exception 'invalid_reference'; end if;
  if upper(coalesce(p_currency,'')) !~ '^[A-Z]{3}$' then raise exception 'invalid_currency'; end if;

  select coalesce(sum((x->>'amount_minor')::bigint),0) into v_debits
    from jsonb_array_elements(p_entries) x where x->>'direction'='debit';
  select coalesce(sum((x->>'amount_minor')::bigint),0) into v_credits
    from jsonb_array_elements(p_entries) x where x->>'direction'='credit';
  if v_debits <= 0 or v_debits <> v_credits then raise exception 'unbalanced_posting'; end if;
  if exists (
    select 1 from jsonb_array_elements(p_entries) x
    where coalesce(x->>'ledger_account','') = ''
       or x->>'direction' not in ('debit','credit')
       or coalesce((x->>'amount_minor')::bigint,0) <= 0
  ) then raise exception 'invalid_ledger_entry'; end if;

  v_entries_hash := encode(extensions.digest(convert_to(p_entries::text,'UTF8'),'sha256'::text),'hex');

  insert into public.money_postings(posting_id,account_id,reference_type,reference_id,currency,entries_hash,metadata)
  values(v_posting,p_account_id,trim(p_reference_type),trim(p_reference_id),upper(p_currency),v_entries_hash,coalesce(p_metadata,'{}'::jsonb))
  on conflict (account_id,reference_type,reference_id,currency) do nothing;

  select posting_id, entries_hash into v_existing, v_existing_hash
  from public.money_postings
  where account_id=p_account_id and reference_type=trim(p_reference_type)
    and reference_id=trim(p_reference_id) and currency=upper(p_currency);

  if v_existing is null then raise exception 'posting_reservation_failed'; end if;
  if v_existing <> v_posting then
    if v_existing_hash is not null and v_existing_hash <> v_entries_hash then raise exception 'idempotency_conflict'; end if;
    return v_existing;
  end if;

  for e in select * from jsonb_array_elements(p_entries)
  loop
    insert into public.money_ledger_entries(posting_id,account_id,ledger_account,direction,amount_minor,currency,reference_type,reference_id,metadata)
    values(v_posting,p_account_id,e->>'ledger_account',e->>'direction',(e->>'amount_minor')::bigint,upper(p_currency),trim(p_reference_type),trim(p_reference_id),coalesce(p_metadata,'{}'::jsonb));
  end loop;
  return v_posting;
end;
$$;

revoke execute on function public.money_engine_post(uuid,text,text,text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.money_engine_post(uuid,text,text,text,jsonb,jsonb) to service_role;
