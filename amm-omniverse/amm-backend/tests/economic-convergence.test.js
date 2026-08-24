const assert = require('assert')
const { runEconomicConvergenceSandbox } = require('../lib/economic-convergence')

const proof = runEconomicConvergenceSandbox({
  grossMinor: 10000,
  units: 10,
  unitPriceMinor: 1000,
  taxMinor: 800,
  refundReserveMinor: 500,
  operatingReserveMinor: 700,
  distributionMinor: 1000,
})

assert.equal(proof.synthetic, true)
assert.equal(proof.movesRealMoney, false)
assert.equal(proof.issuesRealOwnership, false)
assert.equal(proof.commerce.reconciled, true)
assert.equal(proof.moneyEngine.accountingInvariant, true)
assert.equal(proof.wallet.withdrawableMinor, 0)
assert.equal(proof.wallet.pendingDistributionMinor, 1000)
assert.equal(proof.ownership.settledUnits, 0)
assert.equal(proof.ownership.pendingUnits, 10)
assert.equal(proof.ownership.providerSettlementRequired, true)
assert.equal(proof.distribution.paidMinor, 0)
assert.equal(proof.evidence.financialTruthRequired, true)
assert.equal(proof.evidence.regulatedPartnerRequired, true)
assert.equal(proof.ok, true)

assert.throws(() => runEconomicConvergenceSandbox({ grossMinor: 9999, units: 10, unitPriceMinor: 1000 }), /do not reconcile/)
assert.throws(() => runEconomicConvergenceSandbox({ grossMinor: 10000, units: 10, unitPriceMinor: 1000, taxMinor: 9000, refundReserveMinor: 2000 }), /exceed/)

console.log('economic convergence sandbox: PASS')
