create sequence if not exists public.set_apart_chain_block_number_seq;

create table if not exists public.set_apart_chain_blocks (
  block_number bigint primary key default nextval('public.set_apart_chain_block_number_seq'),
  event_id text not null unique,
  event_type text not null,
  resource_ref text not null,
  payload_hash text not null,
  platform_block_hash text,
  previous_block_hash text,
  block_hash text not null unique,
  classification text not null default 'SET_APART_COMMUNITY',
  created_at timestamptz not null default now(),
  constraint set_apart_payload_hash_sha256 check (payload_hash ~ '^[0-9a-fA-F]{64}$'),
  constraint set_apart_platform_hash_sha256 check (platform_block_hash is null or platform_block_hash ~ '^[0-9a-fA-F]{64}$'),
  constraint set_apart_block_hash_sha256 check (block_hash ~ '^[0-9a-fA-F]{64}$'),
  constraint set_apart_event_type_allowed check (event_type in ('SABBATH','NEW_MOON','COVENANT','MINISTRY_SERVICE','EDUCATION','LEGACY','COMMUNITY_RECORD','CHARITY_SERVICE')),
  constraint set_apart_classification_allowed check (classification in ('SET_APART_COMMUNITY','FAITH_ATTESTATION','LEGACY_ATTESTATION','SERVICE_ATTESTATION'))
);

alter table public.set_apart_chain_blocks enable row level security;
revoke all on table public.set_apart_chain_blocks from anon, authenticated;
revoke all on sequence public.set_apart_chain_block_number_seq from anon, authenticated;

drop function if exists public.anchor_set_apart_chain_event(text,text,text,text,text,text);
create or replace function public.anchor_set_apart_chain_event(
  p_event_id text,
  p_event_type text,
  p_resource_ref text,
  p_payload_hash text,
  p_platform_block_hash text default null,
  p_classification text default 'SET_APART_COMMUNITY'
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing public.set_apart_chain_blocks%rowtype;
  v_number bigint;
  v_previous text;
  v_block_hash text;
  v_created timestamptz := clock_timestamp();
  v_event_type text := upper(trim(p_event_type));
  v_classification text := upper(trim(coalesce(p_classification,'SET_APART_COMMUNITY')));
begin
  if coalesce(trim(p_event_id),'')='' or coalesce(v_event_type,'')='' or coalesce(trim(p_resource_ref),'')='' then
    raise exception 'invalid_set_apart_anchor_input';
  end if;
  if v_event_type not in ('SABBATH','NEW_MOON','COVENANT','MINISTRY_SERVICE','EDUCATION','LEGACY','COMMUNITY_RECORD','CHARITY_SERVICE') then
    raise exception 'invalid_set_apart_event_type';
  end if;
  if v_classification not in ('SET_APART_COMMUNITY','FAITH_ATTESTATION','LEGACY_ATTESTATION','SERVICE_ATTESTATION') then
    raise exception 'invalid_set_apart_classification';
  end if;
  if p_payload_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'payload_hash_must_be_sha256_hex';
  end if;
  if p_platform_block_hash is not null and p_platform_block_hash !~ '^[0-9a-fA-F]{64}$' then
    raise exception 'platform_block_hash_must_be_sha256_hex';
  end if;

  perform pg_advisory_xact_lock(814900272);

  select * into v_existing from public.set_apart_chain_blocks where event_id=trim(p_event_id);
  if found then
    if v_existing.event_type <> v_event_type
       or v_existing.resource_ref <> trim(p_resource_ref)
       or lower(v_existing.payload_hash) <> lower(p_payload_hash)
       or coalesce(lower(v_existing.platform_block_hash),'') <> coalesce(lower(p_platform_block_hash),'')
       or v_existing.classification <> v_classification then
      raise exception 'set_apart_anchor_idempotency_conflict';
    end if;
    return jsonb_build_object(
      'network','tryamm-set-apart-kingdom-chain-v1',
      'displayName','Kingdom of Yahisrale — Set Apart',
      'eventId',v_existing.event_id,
      'blockNumber',v_existing.block_number,
      'blockHash',v_existing.block_hash,
      'previousBlockHash',v_existing.previous_block_hash,
      'platformBlockHash',v_existing.platform_block_hash,
      'classification',v_existing.classification,
      'committedAt',v_existing.created_at
    );
  end if;

  select block_hash into v_previous from public.set_apart_chain_blocks order by block_number desc limit 1;
  v_number := nextval('public.set_apart_chain_block_number_seq');
  v_block_hash := encode(extensions.digest(
    concat_ws('|',v_number::text,trim(p_event_id),v_event_type,trim(p_resource_ref),lower(p_payload_hash),coalesce(lower(p_platform_block_hash),''),coalesce(v_previous,''),v_classification,v_created::text),
    'sha256'::text
  ),'hex');

  insert into public.set_apart_chain_blocks(block_number,event_id,event_type,resource_ref,payload_hash,platform_block_hash,previous_block_hash,block_hash,classification,created_at)
  values(v_number,trim(p_event_id),v_event_type,trim(p_resource_ref),lower(p_payload_hash),lower(p_platform_block_hash),v_previous,v_block_hash,v_classification,v_created);

  return jsonb_build_object(
    'network','tryamm-set-apart-kingdom-chain-v1',
    'displayName','Kingdom of Yahisrale — Set Apart',
    'eventId',trim(p_event_id),
    'blockNumber',v_number,
    'blockHash',v_block_hash,
    'previousBlockHash',v_previous,
    'platformBlockHash',lower(p_platform_block_hash),
    'classification',v_classification,
    'committedAt',v_created
  );
end;
$$;

revoke all on function public.anchor_set_apart_chain_event(text,text,text,text,text,text) from public, anon, authenticated;
grant execute on function public.anchor_set_apart_chain_event(text,text,text,text,text,text) to service_role;

comment on table public.set_apart_chain_blocks is 'TRYAMM Layer 3 Set Apart / Kingdom of Yahisrale faith-community attestation hash chain. Not a payment ledger and not a claim of governmental, citizenship, tax, or legal sovereignty.';
comment on function public.anchor_set_apart_chain_event(text,text,text,text,text,text) is 'Server-only Set Apart attestation anchor. Does not authorize payments, civil status, governmental authority, tax status, or regulated actions.';