create table if not exists public.internal_chain_blocks (
  block_number bigint primary key,
  event_id text not null unique,
  event_type text not null,
  resource_ref text not null,
  payload_hash text not null,
  previous_block_hash text,
  block_hash text not null unique,
  created_at timestamptz not null
);

create sequence if not exists public.internal_chain_block_number_seq;
select setval('public.internal_chain_block_number_seq', greatest(coalesce((select max(block_number) from public.internal_chain_blocks),0),1), coalesce((select max(block_number) from public.internal_chain_blocks),0) > 0);

alter table public.internal_chain_blocks enable row level security;
revoke all on table public.internal_chain_blocks from public, anon, authenticated;
grant select, insert on table public.internal_chain_blocks to service_role;
revoke all on sequence public.internal_chain_block_number_seq from public, anon, authenticated;
grant usage, select on sequence public.internal_chain_block_number_seq to service_role;

create or replace function public.anchor_internal_chain_event(
  p_event_id text,
  p_event_type text,
  p_resource_ref text,
  p_payload_hash text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.internal_chain_blocks%rowtype;
  v_number bigint;
  v_previous text;
  v_block_hash text;
  v_created timestamptz := clock_timestamp();
begin
  if coalesce(trim(p_event_id),'')='' or coalesce(trim(p_event_type),'')='' or coalesce(trim(p_resource_ref),'')='' then
    raise exception 'invalid_anchor_input';
  end if;
  if p_payload_hash !~ '^[0-9a-fA-F]{64}$' then raise exception 'payload_hash_must_be_sha256_hex'; end if;

  perform pg_advisory_xact_lock(814900271);

  select * into v_existing from public.internal_chain_blocks where event_id=trim(p_event_id);
  if found then
    if v_existing.event_type <> trim(p_event_type)
       or v_existing.resource_ref <> trim(p_resource_ref)
       or lower(v_existing.payload_hash) <> lower(p_payload_hash) then
      raise exception 'anchor_idempotency_conflict';
    end if;
    return jsonb_build_object(
      'network','tryamm-internal-hash-chain-v1',
      'eventId',v_existing.event_id,
      'blockNumber',v_existing.block_number,
      'blockHash',v_existing.block_hash,
      'previousBlockHash',v_existing.previous_block_hash,
      'committedAt',v_existing.created_at
    );
  end if;

  select block_hash into v_previous from public.internal_chain_blocks order by block_number desc limit 1;
  v_number := nextval('public.internal_chain_block_number_seq');
  v_block_hash := encode(extensions.digest(
    concat_ws('|',v_number::text,trim(p_event_id),trim(p_event_type),trim(p_resource_ref),lower(p_payload_hash),coalesce(v_previous,''),v_created::text),
    'sha256'::text
  ),'hex');

  insert into public.internal_chain_blocks(block_number,event_id,event_type,resource_ref,payload_hash,previous_block_hash,block_hash,created_at)
  values(v_number,trim(p_event_id),trim(p_event_type),trim(p_resource_ref),lower(p_payload_hash),v_previous,v_block_hash,v_created);

  return jsonb_build_object(
    'network','tryamm-internal-hash-chain-v1',
    'eventId',trim(p_event_id),
    'blockNumber',v_number,
    'blockHash',v_block_hash,
    'previousBlockHash',v_previous,
    'committedAt',v_created
  );
end;
$$;

revoke execute on function public.anchor_internal_chain_event(text,text,text,text) from public, anon, authenticated;
grant execute on function public.anchor_internal_chain_event(text,text,text,text) to service_role;
