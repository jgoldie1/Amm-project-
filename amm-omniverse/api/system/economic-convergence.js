export default function handler(_req, res) {
  const grossMinor = 10000
  const units = 10
  const unitPriceMinor = 1000
  const taxMinor = 800
  const refundReserveMinor = 500
  const operatingReserveMinor = 700
  const distributionMinor = 1000
  const protectedMinor = taxMinor + refundReserveMinor + operatingReserveMinor + distributionMinor
  const availableForPlatformMinor = grossMinor - protectedMinor

  const proof = {
    schema: 'tryamm.economic-convergence.v1',
    ok: true,
    synthetic: true,
    movesRealMoney: false,
    issuesRealOwnership: false,
    commerce: {
      intentMinor: grossMinor,
      serverRecomputedMinor: units * unitPriceMinor,
      reconciled: units * unitPriceMinor === grossMinor,
    },
    moneyEngine: {
      grossMinor,
      protectedMinor,
      availableForPlatformMinor,
      accountingInvariant: grossMinor === protectedMinor + availableForPlatformMinor,
    },
    wallet: {
      withdrawableMinor: 0,
      pendingDistributionMinor: distributionMinor,
      settlementRequired: true,
    },
    ownership: {
      requestedUnits: units,
      pendingUnits: units,
      settledUnits: 0,
      complianceState: 'sandbox-only',
      regulatedPartnerRequired: true,
      providerSettlementRequired: true,
    },
    distribution: {
      liabilityMinor: distributionMinor,
      paidMinor: 0,
      status: 'synthetic-pending',
    },
    evidence: {
      financialTruthRequired: true,
      idempotencyRequired: true,
      providerWebhookRequiredForSettlement: true,
    },
  }

  res.setHeader('Cache-Control', 'no-store')
  res.status(200).json(proof)
}
