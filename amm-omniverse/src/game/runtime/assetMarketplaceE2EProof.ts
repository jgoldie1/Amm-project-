export const TWENTY_FIVE_DOLLAR_ASSET_TEST = {
  listing: {
    title: 'Creator Mask Asset',
    grossMinor: 2500,
    currency: 'USD',
    mode: 'sale',
  },
  requiredProof: [
    'seller-authenticated',
    'asset-certified',
    'rights-verified',
    'listing-published',
    'server-price-verified',
    'payment-provider-event-verified',
    'provider-event-idempotent',
    'transaction-persisted',
    'entitlement-persisted',
    'creator-ledger-written',
    'tryamm-ledger-written',
    'reserve-ledger-written',
    'purchase-reloads-from-server',
    'asset-can-be-equipped-or-spawned',
    'refund-reverses-or-adjusts-ledger',
    'audit-trail-complete',
  ],
} as const

export interface AssetCommerceProof {
  exactSha: string
  deploymentId: string
  transactionId: string
  providerPaymentId: string
  entitlementId: string
  ledgerEntryIds: string[]
  refundTransactionId?: string
  deviceProofId?: string
  passed: boolean
}

export function isCompleteAssetCommerceProof(proof: AssetCommerceProof): boolean {
  return Boolean(
    proof.exactSha &&
    proof.deploymentId &&
    proof.transactionId &&
    proof.providerPaymentId &&
    proof.entitlementId &&
    proof.ledgerEntryIds.length === 3 &&
    proof.deviceProofId &&
    proof.passed
  )
}

// Test fixture only. The $25 mask is not a Nike/Pooh Shiesty-branded commercial product.
// Protected names, logos, likenesses or trade dress require appropriate rights before publication.
