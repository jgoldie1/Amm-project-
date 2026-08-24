function assertPositiveInt(name, value) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${name} must be a positive integer`)
}

function runEconomicConvergenceSandbox(input = {}) {
  const grossMinor = Number(input.grossMinor ?? 10000)
  const units = Number(input.units ?? 10)
  const unitPriceMinor = Number(input.unitPriceMinor ?? 1000)
  const taxMinor = Number(input.taxMinor ?? 800)
  const refundReserveMinor = Number(input.refundReserveMinor ?? 500)
  const operatingReserveMinor = Number(input.operatingReserveMinor ?? 700)
  const distributionMinor = Number(input.distributionMinor ?? 1000)

  ;[
    ['grossMinor', grossMinor],
    ['units', units],
    ['unitPriceMinor', unitPriceMinor],
  ].forEach(([name, value]) => assertPositiveInt(name, value))

  if (units * unitPriceMinor !== grossMinor) throw new Error('ownership unit economics do not reconcile to gross amount')
  if ([taxMinor, refundReserveMinor, operatingReserveMinor, distributionMinor].some(v => !Number.isInteger(v) || v < 0)) {
    throw new Error('reserve/distribution values must be non-negative integers')
  }

  const protectedMinor = taxMinor + refundReserveMinor + operatingReserveMinor + distributionMinor
  if (protectedMinor > grossMinor) throw new Error('protected liabilities exceed synthetic gross amount')

  const availableForPlatformMinor = grossMinor - protectedMinor
  const canonicalEventId = `sandbox:economic:${grossMinor}:${units}:${taxMinor}:${refundReserveMinor}:${operatingReserveMinor}:${distributionMinor}`

  const proof = {
    schema: 'tryamm.economic-convergence.v1',
    synthetic: true,
    movesRealMoney: false,
    issuesRealOwnership: false,
    canonicalEventId,
    commerce: {
      intentMinor: grossMinor,
      serverRecomputedMinor: units * unitPriceMinor,
      reconciled: true,
    },
    moneyEngine: {
      grossMinor,
      protectedMinor,
      availableForPlatformMinor,
      accountingInvariant: grossMinor === protectedMinor + availableForPlatformMinor,
    },
    wallet: {
      creditMinor: 0,
      pendingDistributionMinor: distributionMinor,
      withdrawableMinor: 0,
      invariant: 'synthetic ownership/distribution evidence never creates withdrawable cash',
    },
    ownership: {
      requestedUnits: units,
      settledUnits: 0,
      pendingUnits: units,
      complianceState: 'sandbox-only',
      providerSettlementRequired: true,
      invariant: 'client cannot issue or settle ownership',
    },
    distribution: {
      liabilityMinor: distributionMinor,
      paidMinor: 0,
      status: 'synthetic-pending',
    },
    evidence: {
      financialTruthRequired: true,
      regulatedPartnerRequired: true,
      providerWebhookRequiredForSettlement: true,
      idempotencyRequired: true,
    },
  }

  proof.ok = Boolean(
    proof.commerce.reconciled &&
    proof.moneyEngine.accountingInvariant &&
    proof.wallet.withdrawableMinor === 0 &&
    proof.ownership.settledUnits === 0 &&
    proof.distribution.paidMinor === 0
  )

  return proof
}

module.exports = { runEconomicConvergenceSandbox }
