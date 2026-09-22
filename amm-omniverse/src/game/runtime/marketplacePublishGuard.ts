export type MarketplaceModerationRisk = 'copyright'|'trademark'|'counterfeit'|'malware'|'adult'|'regulated-goods'|'fraud'|'privacy'|'unsafe-file'|'other'
export type MarketplaceModerationDecision = 'allow'|'review'|'restrict'|'reject'

export interface MarketplaceSafetyReview {
  id: string
  listingId: string
  assetPassportId: string
  risks: MarketplaceModerationRisk[]
  decision: MarketplaceModerationDecision
  reviewer: 'guardian'|'human'
  evidenceIds: string[]
  notes: string[]
  reviewedAt: string
}

export interface MarketplacePublishGate {
  assetCertified: boolean
  rightsVerified: boolean
  provenanceAuthorized: boolean
  sellerControlsAsset: boolean
  malwareScanPassed: boolean
  duplicateScanPassed: boolean
  moderationApproved: boolean
  priceAndLicenseValid: boolean
  payoutAccountReady: boolean
}

export function canPublishToMarketplace(gate: MarketplacePublishGate): boolean {
  return Object.values(gate).every(Boolean)
}

export interface MarketplaceListingAudit {
  listingId: string
  assetPassportId: string
  exactAssetFingerprint: string
  exactTermsVersion: string
  exactLicenseVersion: string
  publishedAt: string
  retiredAt?: string
}

// Physical regulated goods are not part of the general creator-asset marketplace.
// Digital game assets still require moderation, age/content classification where appropriate,
// provenance, rights verification and platform safety review.
