-- Run as one migration transaction. Stop on an existing implementation so its
-- receipts, hash format and callers can be reconciled before deployment.
do $$
begin
  if to_regclass('public.internal_chain_blocks') is not null or exists (
    select 1 from pg_proc where pronamespace = 'public'::regnamespace
      and proname = 'anchor_internal_chain_event'
  ) then
    raise exception 'Existing internal chain requires schema and receipt comparison';
  end if;
end $$;

create table public.internal_chain_blocks (
  block_number bigint primary key check (block_number > 0),
  event_id text not null unique,
  event_type text not null,
  resource_ref text not null,
  payload_hash text not null check (payload_hash ~ '^[0-9a-f]{64}$'),
  previous_block_hash text unique references public.internal_chain_blocks(block_hash),
  block_hash text not null unique check (block_hash ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null,
  check ((block_number = 1) = (previous_block_hash is null))
);
alter table public.internal_chain_blocks enable row level security;
revoke all on public.internal_chain_blocks from public, anon, authenticated, service_role;

create function public.internal_chain_hash(
  n bigint, id text, kind text, resource text, payload text, parent text, stamped timestamptz
) returns text language sql stable set search_path = pg_catalog as $$
  select encode(sha256(convert_to(json_build_array(
    'tryamm-platform-v1', n, id, kind, resource, payload, parent,
    to_char(stamped at time zone 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  )::text, 'UTF8')), 'hex')
$$;
revoke all on function public.internal_chain_hash(bigint,text,text,text,text,text,timestamptz)
  from public, anon, authenticated, service_role;

create function public.anchor_internal_chain_event(
  p_event_id text, p_event_type text, p_resource_ref text, p_payload_hash text
) returns jsonb language plpgsql security definer set search_path = pg_catalog as $$
declare
  receipt public.internal_chain_blocks%rowtype;
  tip public.internal_chain_blocks%rowtype;
  stamped timestamptz;
  n bigint;
begin
  p_event_id := btrim(p_event_id);
  p_event_type := btrim(p_event_type);
  p_resource_ref := btrim(p_resource_ref);
  p_payload_hash := lower(p_payload_hash);
  if nullif(p_event_id,'') is null or nullif(p_event_type,'') is null
     or nullif(p_resource_ref,'') is null or p_payload_hash is null
     or p_payload_hash !~ '^[0-9a-f]{64}$' then
    raise exception 'invalid_internal_chain_input' using errcode = '22023';
  end if;

  perform pg_advisory_xact_lock(814900271);
  select * into receipt from public.internal_chain_blocks where event_id = p_event_id;
  if found then
    if (receipt.event_type, receipt.resource_ref, receipt.payload_hash)
      is distinct from (p_event_type, p_resource_ref, p_payload_hash) then
      raise exception 'internal_chain_idempotency_conflict' using errcode = '22023';
    end if;
  else
    select * into tip from public.internal_chain_blocks order by block_number desc limit 1;
    n := coalesce(tip.block_number,0) + 1;
    stamped := clock_timestamp();
    insert into public.internal_chain_blocks values (
      n,p_event_id,p_event_type,p_resource_ref,p_payload_hash,tip.block_hash,
      public.internal_chain_hash(n,p_event_id,p_event_type,p_resource_ref,p_payload_hash,tip.block_hash,stamped),
      stamped
    ) returning * into receipt;
  end if;
  return jsonb_build_object('network','tryamm-platform-v1','eventId',receipt.event_id,
    'blockNumber',receipt.block_number,'blockHash',receipt.block_hash,
    'previousBlockHash',receipt.previous_block_hash,'committedAt',receipt.created_at);
end $$;
revoke all on function public.anchor_internal_chain_event(text,text,text,text)
  from public, anon, authenticated;
grant execute on function public.anchor_internal_chain_event(text,text,text,text) to service_role;

-- Validate historical references too. An orphan must stop the transaction.
alter table public.set_apart_chain_blocks add constraint set_apart_platform_anchor_fk
  foreign key (platform_block_hash) references public.internal_chain_blocks(block_hash);
