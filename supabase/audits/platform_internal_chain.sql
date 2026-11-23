-- Run with owner read access. Empty results mean all stored rows passed.
with ordered as (
  select b.*, row_number() over w as expected_number,
    lag(block_hash) over w as expected_parent
  from public.internal_chain_blocks b window w as (order by block_number)
)
select block_number from ordered
where block_number <> expected_number or previous_block_hash is distinct from expected_parent
   or block_hash <> public.internal_chain_hash(block_number,event_id,event_type,resource_ref,
      payload_hash,previous_block_hash,created_at)
order by block_number;
