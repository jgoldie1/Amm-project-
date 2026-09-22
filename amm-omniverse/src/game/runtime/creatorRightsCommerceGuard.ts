export type CreatorRightsStatus = 'unverified'|'evidence-submitted'|'verified'|'disputed'|'restricted'
export type CreatorContentType = 'music'|'image'|'video'|'nft-media'|'3d-asset'|'game-asset'|'fashion'|'other'

export interface CreatorRightsPassport {
  id: string
  contentId: string
  ownerUserId: string
  contentType: CreatorContentType
  status: CreatorRightsStatus
  evidenceIds: string[]
  sourceFingerprint?: string
  licenseId?: string
  allowsMarketplaceSale: boolean
  allowsCommercialUse: boolean
  allowsDerivatives: boolean
  verifiedAt?: string
  disputedAt?: string
}

export interface RightsCommerceHold {
  id: string
  contentId: string
  sellerUserId: string
  reason: 'dmca-dispute'|'ownership-dispute'|'license-expired'|'fraud-review'|'manual-review'
  listingSuspended: boolean
  newSalesBlocked: boolean
  unsettledPayoutHeld: boolean
  existingEntitlementsPreserved: boolean
  openedAt: string
  releasedAt?: string
}

export interface RightsAuditEvent {
  id: string
  contentId: string
  actorType: 'creator'|'claimant'|'admin'|'system'
  actorId?: string
  action: string
  evidenceIds: string[]
  createdAt: string
}

export function canMonetizeCreatorContent(passport: CreatorRightsPassport, activeHold?: RightsCommerceHold): boolean {
  return passport.status === 'verified' &&
    passport.allowsMarketplaceSale &&
    !activeHold
}

export function commerceHoldForRightsDispute(input: {
  id: string
  contentId: string
  sellerUserId: string
  reason: RightsCommerceHold['reason']
  openedAt: string
}): RightsCommerceHold {
  return {
    ...input,
    listingSuspended: true,
    newSalesBlocked: true,
    unsettledPayoutHeld: true,
    existingEntitlementsPreserved: true,
  }
}

// A rights dispute freezes new monetization without silently deleting evidence or rewriting transaction history.
// Existing buyer entitlements are preserved by default pending a lawful/admin determination.
// Payout holds affect unsettled proceeds only; released funds require a separate recovery/legal process.
