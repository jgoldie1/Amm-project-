export type MarketplaceControlState = 'pass'|'fail'|'review'|'not-applicable'

export interface MarketplaceLaunchControl {
  id: string
  state: MarketplaceControlState
  evidenceId?: string
  note?: string
}

export interface MarketplaceLaunchReadiness {
  termsOfSale: MarketplaceLaunchControl
  creatorSellerAgreement: MarketplaceLaunchControl
  privacyAndRetention: MarketplaceLaunchControl
  dmcaAgentAndPolicy: MarketplaceLaunchControl
  repeatInfringerPolicy: MarketplaceLaunchControl
  refundPolicy: MarketplaceLaunchControl
  taxConfiguration: MarketplaceLaunchControl
  payoutIdentityVerification: MarketplaceLaunchControl
  sanctionsAndFraudControls: MarketplaceLaunchControl
  minorSellerControls: MarketplaceLaunchControl
  customerSupportAndAppeals: MarketplaceLaunchControl
  accessibility: MarketplaceLaunchControl
  disasterRecovery: MarketplaceLaunchControl
  reconciliation: MarketplaceLaunchControl
  observabilityAndAlerts: MarketplaceLaunchControl
}

export function marketplaceLaunchBlockers(readiness: MarketplaceLaunchReadiness): string[] {
  return Object.entries(readiness)
    .filter(([, control]) => control.state !== 'pass' && control.state !== 'not-applicable')
    .map(([name]) => name)
}

export function canEnableRealMoneyMarketplace(readiness: MarketplaceLaunchReadiness): boolean {
  return marketplaceLaunchBlockers(readiness).length === 0
}

export interface MarketplaceDailyReconciliation {
  date: string
  currency: string
  providerGrossMinor: number
  providerRefundMinor: number
  providerChargebackMinor: number
  providerFeeMinor: number
  ledgerNetMinor: number
  differenceMinor: number
  reconciled: boolean
  evidenceIds: string[]
}

export function reconcileMarketplaceDay(input: Omit<MarketplaceDailyReconciliation,'differenceMinor'|'reconciled'>): MarketplaceDailyReconciliation {
  const providerNet = input.providerGrossMinor - input.providerRefundMinor - input.providerChargebackMinor - input.providerFeeMinor
  const difference = providerNet - input.ledgerNetMinor
  return { ...input, differenceMinor: difference, reconciled: difference === 0 }
}

// Real-money launch must fail closed. A missing operational/legal/compliance control is a blocker,
// not a warning. This is an engineering readiness contract, not legal or tax advice.
