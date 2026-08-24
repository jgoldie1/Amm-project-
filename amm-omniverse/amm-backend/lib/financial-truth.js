'use strict'

const positive = value => Math.max(0, Math.round(Number(value) || 0))
const currencyCode = value => String(value || 'USD').trim().toUpperCase().slice(0, 3)

function computeExpectedSettlement({ grossMinor=0, feeMinor=0, refundMinor=0 }) {
  return Math.max(0, positive(grossMinor) - positive(feeMinor) - positive(refundMinor))
}

function reconciliationStatus({ expectedSettlementMinor=0, netSettlementMinor=0, providerSettled=false }) {
  if (!providerSettled) return 'pending'
  return positive(netSettlementMinor) === positive(expectedSettlementMinor) ? 'matched' : 'mismatch'
}

function allocateProtectedCapital(input={}) {
  let remaining = positive(input.realCashMinor)
  const take = requested => {
    const amount = Math.min(remaining, positive(requested))
    remaining -= amount
    return amount
  }

  const allocation = {
    requiredLiabilitiesMinor: take(input.requiredLiabilitiesMinor),
    taxReserveMinor: take(input.taxReserveMinor),
    refundReserveMinor: take(input.refundReserveMinor),
    operatingReserveMinor: take(input.operatingReserveMinor),
    growthInventoryMinor: take(input.growthInventoryMinor),
    approvedDistributionMinor: take(input.approvedDistributionMinor),
    manufacturing12dMinor: take(input.requested12dMinor),
  }
  allocation.unallocatedMinor = remaining
  allocation.currency = currencyCode(input.currency)
  return allocation
}

function assertAllocationConservesCash(sourceAmountMinor, allocation) {
  const used = [
    allocation.requiredLiabilitiesMinor,
    allocation.taxReserveMinor,
    allocation.refundReserveMinor,
    allocation.operatingReserveMinor,
    allocation.growthInventoryMinor,
    allocation.approvedDistributionMinor,
    allocation.manufacturing12dMinor,
    allocation.unallocatedMinor,
  ].reduce((sum, value) => sum + positive(value), 0)
  if (used !== positive(sourceAmountMinor)) throw new Error('Capital allocation does not conserve source cash')
}

async function recordReconciliation({ supabase, event }) {
  if (!event?.canonicalEventId || !event?.provider || !event?.providerEventId) throw new Error('canonicalEventId, provider and providerEventId are required')
  const grossMinor = positive(event.grossMinor)
  const feeMinor = positive(event.feeMinor)
  const refundMinor = positive(event.refundMinor)
  const expectedSettlementMinor = computeExpectedSettlement({ grossMinor, feeMinor, refundMinor })
  const netSettlementMinor = positive(event.netSettlementMinor)
  const status = reconciliationStatus({ expectedSettlementMinor, netSettlementMinor, providerSettled:Boolean(event.providerSettled) })
  const now = new Date().toISOString()

  const row = {
    canonical_event_id: String(event.canonicalEventId),
    provider: String(event.provider).toLowerCase(),
    provider_event_id: String(event.providerEventId),
    ledger_entry_id: event.ledgerEntryId || null,
    payment_intent_id: event.paymentIntentId || null,
    currency: currencyCode(event.currency),
    gross_minor: grossMinor,
    fee_minor: feeMinor,
    refund_minor: refundMinor,
    net_settlement_minor: netSettlementMinor,
    expected_settlement_minor: expectedSettlementMinor,
    status,
    provider_settled_at: event.providerSettledAt || null,
    reconciled_at: status === 'matched' ? now : null,
    metadata: event.metadata || {},
    updated_at: now,
  }

  const { data, error } = await supabase.from('finance_reconciliation_events')
    .upsert(row, { onConflict:'provider,provider_event_id' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

async function createCapitalAllocation({ supabase, allocationEventId, input, requestedBy }) {
  if (!allocationEventId) throw new Error('allocationEventId is required')
  const allocation = allocateProtectedCapital(input)
  assertAllocationConservesCash(input.realCashMinor, allocation)

  const row = {
    allocation_event_id: String(allocationEventId),
    currency: allocation.currency,
    source_amount_minor: positive(input.realCashMinor),
    required_liabilities_minor: allocation.requiredLiabilitiesMinor,
    tax_reserve_minor: allocation.taxReserveMinor,
    refund_reserve_minor: allocation.refundReserveMinor,
    operating_reserve_minor: allocation.operatingReserveMinor,
    growth_inventory_minor: allocation.growthInventoryMinor,
    approved_distribution_minor: allocation.approvedDistributionMinor,
    manufacturing_12d_minor: allocation.manufacturing12dMinor,
    unallocated_minor: allocation.unallocatedMinor,
    policy_snapshot: {
      sequence:['required-liabilities','tax','refund-reserve','operating-reserve','growth-inventory','approved-distribution','manufacturing-12d'],
      requestedBy: requestedBy || null,
      requested12dMinor: positive(input.requested12dMinor),
      rule:'12D receives only cash remaining after all prior protected buckets.',
    },
    status:'proposed',
  }

  const { data, error } = await supabase.from('finance_capital_allocations')
    .upsert(row, { onConflict:'allocation_event_id' })
    .select('*')
    .single()
  if (error) throw error
  return data
}

module.exports = {
  positive,
  computeExpectedSettlement,
  reconciliationStatus,
  allocateProtectedCapital,
  assertAllocationConservesCash,
  recordReconciliation,
  createCapitalAllocation,
}
