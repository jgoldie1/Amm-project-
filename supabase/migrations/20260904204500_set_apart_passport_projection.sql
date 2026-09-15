create table if not exists public.set_apart_passport_receipts (
  receipt_id uuid primary key default gen_random_uuid(),
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  chain_event_id text not null,
  block_number bigint not null,
  block_hash text not null,
  event_type text not null,
  resource_ref text not null,
  classification text not null,
  display_title text not null,
  display_summary text,
  visibility text not null default 'PRIVATE',
  attested_at timestamptz not null,
  projected_at timestamptz not null default now(),
  unique (owner_user_id, chain_event_id),
  constraint set_apart_passport_block_hash_sha256 check (block_hash ~ '^[0-9a-fA-F]{64}$'),
  constraint set_apart_passport_event_type_allowed check (event_type in ('SABBATH','NEW_MOON','COVENANT','MINISTRY_SERVICE','EDUCATION','LEGACY','COMMUNITY_RECORD','CHARITY_SERVICE')),
  constraint set_apart_passport_classification_allowed check (classification in ('SET_APART_COMMUNITY','FAITH_ATTESTATION','LEGACY_ATTESTATION','SERVICE_ATTESTATION')),
  constraint set_apart_passport_visibility_private check (visibility = 'PRIVATE')
);

create index if not exists set_apart_passport_owner_attested_idx
  on public.set_apart_passport_receipts(owner_user_id, attested_at desc);

alter table public.set_apart_passport_receipts enable row level security;
revoke all on table public.set_apart_passport_receipts from anon, authenticated;
grant select on table public.set_apart_passport_receipts to authenticated;

drop policy if exists "Set Apart Passport owner read" on public.set_apart_passport_receipts;
create policy "Set Apart Passport owner read"
  on public.set_apart_passport_receipts
  for select
  to authenticated
  using (owner_user_id = auth.uid());

create or replace function public.publish_set_apart_passport_receipt(
  p_owner_user_id uuid,
  p_chain_event_id text,
  p_display_title text,
  p_display_summary text default null
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_block public.set_apart_chain_blocks%rowtype;
  v_receipt_id uuid;
begin
  if p_owner_user_id is null
     or coalesce(trim(p_chain_event_id),'')=''
     or coalesce(trim(p_display_title),'')='' then
    raise exception 'invalid_set_apart_passport_projection_input';
  end if;

  if not exists (select 1 from auth.users where id = p_owner_user_id) then
    raise exception 'set_apart_passport_owner_not_found';
  end if;

  select * into v_block
  from public.set_apart_chain_blocks
  where event_id = trim(p_chain_event_id);

  if not found then
    raise exception 'set_apart_chain_event_not_found';
  end if;

  insert into public.set_apart_passport_receipts(
    owner_user_id,
    chain_event_id,
    block_number,
    block_hash,
    event_type,
    resource_ref,
    classification,
    display_title,
    display_summary,
    visibility,
    attested_at
  ) values (
    p_owner_user_id,
    v_block.event_id,
    v_block.block_number,
    v_block.block_hash,
    v_block.event_type,
    v_block.resource_ref,
    v_block.classification,
    trim(p_display_title),
    nullif(trim(coalesce(p_display_summary,'')),''),
    'PRIVATE',
    v_block.created_at
  )
  on conflict (owner_user_id, chain_event_id) do update set
    block_number = excluded.block_number,
    block_hash = excluded.block_hash,
    event_type = excluded.event_type,
    resource_ref = excluded.resource_ref,
    classification = excluded.classification,
    display_title = excluded.display_title,
    display_summary = excluded.display_summary,
    visibility = 'PRIVATE',
    attested_at = excluded.attested_at,
    projected_at = now()
  returning receipt_id into v_receipt_id;

  return v_receipt_id;
end;
$$;

revoke all on function public.publish_set_apart_passport_receipt(uuid,text,text,text) from public, anon, authenticated;
grant execute on function public.publish_set_apart_passport_receipt(uuid,text,text,text) to service_role;

comment on table public.set_apart_passport_receipts is 'Authenticated read-only projection of approved Layer 3 Set Apart attestations. Raw Set Apart chain remains protected and browser users cannot publish or mutate receipts.';
comment on function public.publish_set_apart_passport_receipt(uuid,text,text,text) is 'Trusted-server-only publisher that projects an existing Layer 3 chain event to a private user passport receipt. Does not create chain events or authorize payments, civil status, governmental authority, tax status, regulated actions, or property rights.';
