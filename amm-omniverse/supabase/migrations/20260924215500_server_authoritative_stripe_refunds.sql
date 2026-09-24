-- Server-authoritative Stripe refund/reversal authority.
-- A verified Stripe Refund event is the only path that may reverse commerce ledger state.

create table if not exists public.commerce_refunds (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references public.commerce_payment_transactions(id) on delete restrict,
  order_id uuid not null references public.commerce_orders(id) on delete restrict,
  buyer_id uuid not null references auth.users(id) on delete restrict,
  provider text not null default 'stripe',
  provider_event_id text not null,
  provider_refund_id text not null,
  provider_payment_id text not null,
  amount_cents bigint not null check (amount_cents > 0),
  currency text not null,
  status text not null check (status in ('pending','succeeded','failed')),
  reason text,
  payload jsonb not null default '{}'::jsonb,
  verified_at timestamptz not null default now(),
  applied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider,provider_refund_id)
);

create index if not exists commerce_refunds_transaction_idx
  on public.commerce_refunds(transaction_id,created_at);
create index if not exists commerce_refunds_order_idx
  on public.commerce_refunds(order_id,created_at);
create index if not exists commerce_refunds_provider_event_idx
  on public.commerce_refunds(provider,provider_event_id);

create table if not exists public.commerce_refund_allocations (
  id uuid primary key default gen_random_uuid(),
  refund_id uuid not null references public.commerce_refunds(id) on delete restrict,
  original_ledger_entry_id uuid not null references public.commerce_ledger_entries(id) on delete restrict,
  reversal_ledger_entry_id uuid not null references public.commerce_ledger_entries(id) on delete restrict,
  amount_cents bigint not null check (amount_cents > 0),
  created_at timestamptz not null default now(),
  unique(refund_id,original_ledger_entry_id)
);

create index if not exists commerce_refund_allocations_original_idx
  on public.commerce_refund_allocations(original_ledger_entry_id);

alter table public.commerce_refunds enable row level security;
alter table public.commerce_refund_allocations enable row level security;
revoke all on table public.commerce_refunds from public,anon,authenticated;
revoke all on table public.commerce_refund_allocations from public,anon,authenticated;
grant select,insert,update,delete on table public.commerce_refunds to service_role;
grant select,insert,update,delete on table public.commerce_refund_allocations to service_role;

create or replace function public.apply_verified_stripe_refund(
  p_provider_event_id text,
  p_provider_refund_id text,
  p_provider_payment_id text,
  p_amount_cents bigint,
  p_currency text,
  p_reason text,
  p_verified_at timestamptz,
  p_event_payload jsonb default '{}'::jsonb
) returns jsonb
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_tx public.commerce_payment_transactions%rowtype;
  v_refund public.commerce_refunds%rowtype;
  v_total_before bigint := 0;
  v_total_after bigint := 0;
  v_original_credit_total bigint := 0;
  v_original_credit_count integer := 0;
  v_prior_target_total bigint := 0;
  v_target_cumulative bigint := 0;
  v_prior_reversed bigint := 0;
  v_delta bigint := 0;
  v_delta_total bigint := 0;
  v_reversal_entry_id uuid;
  v_clearing_entry_id uuid;
  v_full_refund boolean := false;
  original_row record;
begin
  if coalesce(p_provider_event_id,'')='' or coalesce(p_provider_refund_id,'')='' or coalesce(p_provider_payment_id,'')='' then
    raise exception 'verified_refund_identifiers_required';
  end if;
  if p_amount_cents is null or p_amount_cents <= 0 or coalesce(p_currency,'')='' then
    raise exception 'verified_refund_amount_required';
  end if;

  select * into v_tx
  from public.commerce_payment_transactions
  where provider='stripe' and provider_payment_id=p_provider_payment_id
  order by created_at asc
  limit 1
  for update;

  if not found then raise exception 'refund_payment_not_found'; end if;
  if upper(coalesce(v_tx.currency,'')) <> upper(p_currency) then raise exception 'refund_currency_mismatch'; end if;
  if coalesce(v_tx.status,'') <> 'paid' then raise exception 'refund_transaction_not_paid'; end if;

  select * into v_refund
  from public.commerce_refunds
  where provider='stripe' and provider_refund_id=p_provider_refund_id
  for update;

  if found and v_refund.applied_at is not null and v_refund.status='succeeded' then
    if v_refund.transaction_id <> v_tx.id
       or v_refund.amount_cents <> p_amount_cents
       or upper(v_refund.currency) <> upper(p_currency) then
      raise exception 'refund_evidence_reuse_detected';
    end if;
    return jsonb_build_object(
      'applied',false,'duplicate',true,'refundId',v_refund.id,
      'transactionId',v_tx.id,'orderId',v_tx.order_id
    );
  end if;

  select coalesce(sum(amount_cents),0) into v_total_before
  from public.commerce_refunds
  where transaction_id=v_tx.id and status='succeeded' and applied_at is not null;

  v_total_after := v_total_before + p_amount_cents;
  if v_total_after > v_tx.amount_cents then raise exception 'refund_exceeds_transaction'; end if;

  if v_refund.id is null then
    insert into public.commerce_refunds(
      transaction_id,order_id,buyer_id,provider,provider_event_id,provider_refund_id,
      provider_payment_id,amount_cents,currency,status,reason,payload,verified_at
    ) values (
      v_tx.id,v_tx.order_id,v_tx.buyer_id,'stripe',p_provider_event_id,p_provider_refund_id,
      p_provider_payment_id,p_amount_cents,upper(p_currency),'succeeded',nullif(p_reason,''),
      coalesce(p_event_payload,'{}'::jsonb),coalesce(p_verified_at,now())
    ) returning * into v_refund;
  else
    if v_refund.transaction_id <> v_tx.id then raise exception 'refund_evidence_reuse_detected'; end if;
    update public.commerce_refunds
      set provider_event_id=p_provider_event_id,
          amount_cents=p_amount_cents,
          currency=upper(p_currency),
          status='succeeded',
          reason=nullif(p_reason,''),
          payload=coalesce(p_event_payload,'{}'::jsonb),
          verified_at=coalesce(p_verified_at,now()),
          updated_at=now()
      where id=v_refund.id
      returning * into v_refund;
  end if;

  select count(*),coalesce(sum(amount_cents),0)
    into v_original_credit_count,v_original_credit_total
  from public.commerce_ledger_entries
  where transaction_id=v_tx.id
    and direction='credit'
    and ledger_account in ('seller_payable','platform_revenue','commerce_reserve');

  if v_original_credit_count <= 0 or v_original_credit_total <> v_tx.amount_cents then
    raise exception 'refund_original_ledger_mismatch';
  end if;

  for original_row in
    select le.*,
           row_number() over(order by le.id) as rn,
           count(*) over() as cnt
    from public.commerce_ledger_entries le
    where le.transaction_id=v_tx.id
      and le.direction='credit'
      and le.ledger_account in ('seller_payable','platform_revenue','commerce_reserve')
    order by le.id
  loop
    if original_row.rn < original_row.cnt then
      v_target_cumulative := floor(
        original_row.amount_cents::numeric * v_total_after::numeric / v_tx.amount_cents::numeric
      )::bigint;
    else
      v_target_cumulative := v_total_after - v_prior_target_total;
    end if;

    select coalesce(sum(a.amount_cents),0) into v_prior_reversed
    from public.commerce_refund_allocations a
    join public.commerce_refunds r on r.id=a.refund_id
    where a.original_ledger_entry_id=original_row.id
      and r.status='succeeded'
      and r.applied_at is not null;

    v_delta := v_target_cumulative - v_prior_reversed;
    if v_delta < 0 then raise exception 'refund_reversal_regression'; end if;

    if v_delta > 0 then
      insert into public.commerce_ledger_entries(
        transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency,seller_key
      ) values (
        v_tx.id,v_tx.order_id,
        'stripe-refund:'||p_provider_refund_id||':reverse:'||original_row.id,
        original_row.ledger_account,'debit',v_delta,upper(p_currency),original_row.seller_key
      ) returning id into v_reversal_entry_id;

      insert into public.commerce_refund_allocations(
        refund_id,original_ledger_entry_id,reversal_ledger_entry_id,amount_cents
      ) values (v_refund.id,original_row.id,v_reversal_entry_id,v_delta);

      v_delta_total := v_delta_total + v_delta;
    end if;

    v_prior_target_total := v_prior_target_total + v_target_cumulative;
  end loop;

  if v_delta_total <> p_amount_cents then raise exception 'refund_reversal_unbalanced'; end if;

  insert into public.commerce_ledger_entries(
    transaction_id,order_id,entry_key,ledger_account,direction,amount_cents,currency
  ) values (
    v_tx.id,v_tx.order_id,'stripe-refund:'||p_provider_refund_id||':clearing',
    'stripe_clearing','credit',p_amount_cents,upper(p_currency)
  ) returning id into v_clearing_entry_id;

  v_full_refund := v_total_after = v_tx.amount_cents;

  if v_full_refund then
    update public.commerce_entitlements
      set status='refunded',
          metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
            'refundState','full',
            'refundedCents',v_total_after,
            'providerRefundId',p_provider_refund_id,
            'refundedAt',coalesce(p_verified_at,now())
          )
      where transaction_id=v_tx.id;

    update public.commerce_orders
      set status='refunded',
          metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
            'refundState','full',
            'refundedCents',v_total_after,
            'lastProviderRefundId',p_provider_refund_id
          ),
          updated_at=now()
      where id=v_tx.order_id;
  else
    update public.commerce_entitlements
      set metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
            'refundState','partial',
            'refundedCents',v_total_after,
            'lastProviderRefundId',p_provider_refund_id
          )
      where transaction_id=v_tx.id;

    update public.commerce_orders
      set metadata=coalesce(metadata,'{}'::jsonb) || jsonb_build_object(
            'refundState','partial',
            'refundedCents',v_total_after,
            'lastProviderRefundId',p_provider_refund_id
          ),
          updated_at=now()
      where id=v_tx.order_id;
  end if;

  update public.commerce_refunds
    set applied_at=now(),updated_at=now()
    where id=v_refund.id;

  update public.commerce_payment_events
    set order_id=v_tx.order_id,processed_at=coalesce(processed_at,now())
    where provider='stripe' and provider_event_id=p_provider_event_id;

  return jsonb_build_object(
    'applied',true,'duplicate',false,'refundId',v_refund.id,
    'transactionId',v_tx.id,'orderId',v_tx.order_id,
    'amountCents',p_amount_cents,'cumulativeRefundedCents',v_total_after,
    'fullRefund',v_full_refund,'reversalAmountCents',v_delta_total,
    'clearingEntryId',v_clearing_entry_id
  );
end;
$$;

revoke all on function public.apply_verified_stripe_refund(text,text,text,bigint,text,text,timestamptz,jsonb) from public;
revoke all on function public.apply_verified_stripe_refund(text,text,text,bigint,text,text,timestamptz,jsonb) from anon;
revoke all on function public.apply_verified_stripe_refund(text,text,text,bigint,text,text,timestamptz,jsonb) from authenticated;
grant execute on function public.apply_verified_stripe_refund(text,text,text,bigint,text,text,timestamptz,jsonb) to service_role;
