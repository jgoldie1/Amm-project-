export type AssetOfferMode = 'free'|'sale'|'license'
export type AssetLicenseScope = 'personal'|'tryamm-worlds'|'commercial-creator'|'custom'
export type AssetListingState = 'draft'|'review'|'published'|'suspended'|'retired'

export interface AssetMarketplaceListing {
  id: string
  assetPassportId: string
  sellerUserId: string
  state: AssetListingState
  mode: AssetOfferMode
  priceMinor?: number
  currency?: string
  licenseScope: AssetLicenseScope
  customLicenseText?: string
  derivativeWorksAllowed: boolean
  attributionRequired: boolean
  commercialUseAllowed: boolean
  createdAt: string
}

export interface AssetEntitlement {
  id: string
  listingId: string
  assetPassportId: string
  buyerUserId: string
  sellerUserId: string
  licenseScope: AssetLicenseScope
  grantedAt: string
  transactionId?: string
  revokedAt?: string
}

export interface AssetRevenueSplit {
  payee: 'creator'|'tryamm'|'business'|'agent'
  basisPoints: number
  accountId?: string
}

export interface VerifiedAssetSaleReceipt {
  id: string
  listingId: string
  assetPassportId: string
  buyerUserId: string
  sellerUserId: string
  transactionId: string
  grossMinor: number
  currency: string
  splits: AssetRevenueSplit[]
  verifiedAt: string
}

export function validateRevenueSplits(splits: AssetRevenueSplit[]): string[] {
  const errors: string[] = []
  const total = splits.reduce((sum, split) => sum + split.basisPoints, 0)
  if (total !== 10_000) errors.push('Revenue splits must total 10000 basis points.')
  if (splits.some(split => split.basisPoints < 0 || split.basisPoints > 10_000)) {
    errors.push('Each revenue split must be between 0 and 10000 basis points.')
  }
  return errors
}

export function canPublishAssetListing(input: {
  assetCertified: boolean
  provenanceAuthorized: boolean
  sellerControlsAsset: boolean
  listing: AssetMarketplaceListing
}): boolean {
  return input.assetCertified &&
    input.provenanceAuthorized &&
    input.sellerControlsAsset &&
    input.listing.state === 'review' &&
    (input.listing.mode === 'free' || Boolean(input.listing.currency && input.listing.priceMinor && input.listing.priceMinor > 0))
}

export function canSpawnMarketplaceAsset(input: {
  entitlement?: AssetEntitlement
  buyerUserId: string
  assetPassportId: string
}): boolean {
  return Boolean(
    input.entitlement &&
    input.entitlement.buyerUserId === input.buyerUserId &&
    input.entitlement.assetPassportId === input.assetPassportId &&
    !input.entitlement.revokedAt
  )
}

// Financial authority remains server-side. Client listings and entitlements are display/input contracts only.
// Never mint an entitlement or creator balance from client state alone.
