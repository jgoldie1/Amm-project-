export type Web3AssetKind = 'NFT_1369' | 'HOLOGRAPHIC_ASSET' | 'GAME_ITEM' | 'TICKET' | 'MEMBERSHIP' | 'DIGITAL_TWIN_ASSET'
export type ChainSettlementState = 'RECORDED' | 'CONFIRMED' | 'RECONCILED' | 'REVERSED' | 'DISPUTED'

export type DigitalItemPassport = {
  assetId: string
  kind: Web3AssetKind
  issuerId: string
  creatorId?: string
  series?: '1369'
  serialNumber?: number
  maxSupply?: number
  mediaHash: string
  rightsUri?: string
  utility: string[]
  transferPolicy: 'NON_TRANSFERABLE' | 'ALLOWLISTED' | 'TRANSFERABLE'
  royaltyBps?: number
}

export type ChainProof = {
  proofId: string
  assetId?: string
  sourceEventId: string
  chain: string
  txHash?: string
  state: ChainSettlementState
  recordedAt: string
}

export type SettlementAllocation = {
  participantId: string
  role: 'MERCHANT' | 'CREATOR' | 'SCOUT' | 'TRYAMM' | 'ELIGIBLE_1369_PARTICIPANT'
  amountMinor: number
}

export type SettlementAuthorityInput = {
  settlementId: string
  sourceEventId: string
  fundedAmountMinor: number
  currency: 'USD'
  providerPaymentVerified: boolean
  refundWindowSatisfied: boolean
  fraudReviewPassed: boolean
  allocations: SettlementAllocation[]
}

export function validateDigitalItemPassport(passport: DigitalItemPassport) {
  if (!passport.assetId || !passport.issuerId || !passport.mediaHash) throw new Error('Digital Item Passport identity/provenance required')
  if (passport.series === '1369') {
    if (!passport.serialNumber || passport.serialNumber < 1 || passport.serialNumber > 1369) throw new Error('NFT 1369 serial must be 1..1369')
    if (passport.maxSupply !== 1369) throw new Error('NFT 1369 max supply must equal 1369')
  }
  if (passport.royaltyBps !== undefined && (!Number.isInteger(passport.royaltyBps) || passport.royaltyBps < 0 || passport.royaltyBps > 10000)) throw new Error('Royalty basis points out of range')
  return passport
}

export function authorizeSettlement(input: SettlementAuthorityInput) {
  if (!input.providerPaymentVerified) throw new Error('Verified provider payment required')
  if (!input.refundWindowSatisfied) throw new Error('Refund/chargeback gate not satisfied')
  if (!input.fraudReviewPassed) throw new Error('Fraud review required')
  if (!Number.isInteger(input.fundedAmountMinor) || input.fundedAmountMinor < 0) throw new Error('Funded amount must be a non-negative integer')
  const allocated = input.allocations.reduce((sum, row) => sum + row.amountMinor, 0)
  if (allocated !== input.fundedAmountMinor) throw new Error('Settlement allocations must reconcile exactly to funded amount')
  if (input.allocations.some((row) => !Number.isInteger(row.amountMinor) || row.amountMinor < 0)) throw new Error('Settlement allocations must be non-negative integers')
  return { ...input, state: 'AUTHORIZED' as const }
}

export function reconcileChainProof(proof: ChainProof, expectedSourceEventId: string) {
  if (proof.sourceEventId !== expectedSourceEventId) return { ...proof, state: 'DISPUTED' as const }
  if (proof.state !== 'CONFIRMED' && proof.state !== 'RECORDED') throw new Error('Only recorded/confirmed proofs can reconcile')
  return { ...proof, state: 'RECONCILED' as const }
}

export const WEB3_SETTLEMENT_TRUTH =
  'Blockchain records ownership/proof events; the accounting ledger determines real-money obligations; authorized payment providers move real money. XP and Holo Credits remain non-cash unless a separately approved compliant mechanism is established.'

export const WEB3_PRODUCTION_GATES = [
  'wallet-recovery-and-key-security',
  'rights-and-ip-registry',
  'server-authoritative-settlement',
  'refund-chargeback-reversal',
  'idempotency-and-double-pay-protection',
  'chain-accounting-reconciliation',
  'treasury-separation',
  'fraud-and-sybil-controls',
  'privacy-data-minimization',
  'tax-audit-records',
  'emergency-pause-controls',
  'observability-and-disaster-recovery',
  'jurisdiction-age-identity-gates-where-required',
] as const
