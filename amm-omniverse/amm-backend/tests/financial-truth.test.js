'use strict'

const assert = require('assert')
const {
  computeExpectedSettlement,
  reconciliationStatus,
  allocateProtectedCapital,
  assertAllocationConservesCash,
} = require('../lib/financial-truth')

assert.equal(computeExpectedSettlement({ grossMinor:10000, feeMinor:320, refundMinor:500 }), 9180)
assert.equal(reconciliationStatus({ expectedSettlementMinor:9180, netSettlementMinor:9180, providerSettled:true }), 'matched')
assert.equal(reconciliationStatus({ expectedSettlementMinor:9180, netSettlementMinor:9000, providerSettled:true }), 'mismatch')
assert.equal(reconciliationStatus({ expectedSettlementMinor:9180, netSettlementMinor:0, providerSettled:false }), 'pending')

const protectedFirst = allocateProtectedCapital({
  currency:'usd',
  realCashMinor:30000,
  requiredLiabilitiesMinor:10000,
  taxReserveMinor:5000,
  refundReserveMinor:3000,
  operatingReserveMinor:7000,
  growthInventoryMinor:2000,
  approvedDistributionMinor:1000,
  requested12dMinor:10000,
})

assert.deepEqual(protectedFirst, {
  requiredLiabilitiesMinor:10000,
  taxReserveMinor:5000,
  refundReserveMinor:3000,
  operatingReserveMinor:7000,
  growthInventoryMinor:2000,
  approvedDistributionMinor:1000,
  manufacturing12dMinor:2000,
  unallocatedMinor:0,
  currency:'USD',
})
assertAllocationConservesCash(30000, protectedFirst)

const noBypass = allocateProtectedCapital({
  realCashMinor:10000,
  requiredLiabilitiesMinor:10000,
  taxReserveMinor:1000,
  refundReserveMinor:1000,
  operatingReserveMinor:1000,
  growthInventoryMinor:0,
  approvedDistributionMinor:0,
  requested12dMinor:999999,
})
assert.equal(noBypass.manufacturing12dMinor, 0)
assertAllocationConservesCash(10000, noBypass)

console.log('financial truth tests passed')
