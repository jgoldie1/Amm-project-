export type MarketplaceAdjustmentKind = 'refund'|'partial-refund'|'chargeback'|'chargeback-reversal'|'tax'|'payment-fee'|'payout'|'reserve-release'
export type MarketplaceAdjustmentState = 'pending'|'verified'|'settled'|'reversed'|'failed'

export interface MarketplaceMoney {
  amountMinor: number
  currency: string
}

export interface MarketplaceAdjustment {
  id: string
  transactionId: string
  kind: MarketplaceAdjustmentKind
  state: MarketplaceAdjustmentState
  money: MarketplaceMoney
  reason?: string
  externalReference?: string
  createdAt: string
  verifiedAt?: string
}

export interface MarketplaceSettlementPolicy {
  // Taxes and processor fees are accounted for before distributable net revenue.
  splitBasis: 'net-after-tax-and-processing'
  creatorBasisPoints: 4_000
  tryammBasisPoints: 4_000
  reserveBasisPoints: 2_000
  minimumPayoutMinor: number
  payoutDelayDays: number
}

export interface MarketplaceSettlement {
  transactionId: string
  gross: MarketplaceMoney
  taxMinor: number
  processingFeeMinor: number
  refundableMinor: number
  distributableNetMinor: number
  creatorMinor: number
  tryammMinor: number
  reserveMinor: number
  settled: boolean
}

export function calculateMarketplaceSettlement(input: {
  grossMinor: number
  currency: string
  taxMinor: number
  processingFeeMinor: number
}): MarketplaceSettlement {
  const deductions = Math.max(0, input.taxMinor) + Math.max(0, input.processingFeeMinor)
  const net = Math.max(0, input.grossMinor - deductions)
  const creator = Math.floor(net * 0.4)
  const tryamm = Math.floor(net * 0.4)
  const reserve = net - creator - tryamm
  return {
    transactionId: '',
    gross: { amountMinor: input.grossMinor, currency: input.currency },
    taxMinor: Math.max(0, input.taxMinor),
    processingFeeMinor: Math.max(0, input.processingFeeMinor),
    refundableMinor: input.grossMinor,
    distributableNetMinor: net,
    creatorMinor: creator,
    tryammMinor: tryamm,
    reserveMinor: reserve,
    settled: false,
  }
}

export function shouldHoldPayout(input: {
  rightsDispute: boolean
  chargebackOpen: boolean
  fraudReview: boolean
  refundPending: boolean
}): boolean {
  return input.rightsDispute || input.chargebackOpen || input.fraudReview || input.refundPending
}

// Server-authoritative only. Payment-provider webhooks/verified server events must drive adjustments.
// Never trust client-reported refund, chargeback, tax, fee, or payout state.
