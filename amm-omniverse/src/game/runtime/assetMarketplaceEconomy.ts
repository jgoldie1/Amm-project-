export type AssetOfferMode = 'free'|'sale'|'license'
export type AssetLicenseScope = 'personal'|'tryamm-worlds'|'commercial-creator'|'custom'
export type AssetListingState = 'draft'|'review'|'published'|'suspended'|'retired'
export type AssetPriceBand = 'micro'|'standard'|'pro'|'studio'|'enterprise'

export const TRYAMM_ASSET_MARKETPLACE_SPLIT = {
  creatorBasisPoints: 4_000,
  tryammBasisPoints: 4_000,
  reserveBasisPoints: 2_000,
} as const

export const ASSET_PRICE_BANDS_USD = {
  micro: { min: 1, max: 9 },
  standard: { min: 10, max: 49 },
  pro: { min: 50, max: 249 },
  studio: { min: 250, max: 999 },
  enterprise: { min: 1_000, max: null },
} as const

export interface AssetMarketplaceListing {
  id: string
  assetPassportId: string
  sellerUserId: string
  state: AssetListingState
  mode: AssetOfferMode
  priceMinor?: number
  currency?: string
  priceBand?: AssetPriceBand
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
  payee: 'creator'|'tryamm'|'business'|'agent'|'reserve'
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

export function defaultAssetRevenueSplits(): AssetRevenueSplit[] {
  return [
    { payee: 'creator', basisPoints: TRYAMM_ASSET_MARKETPLACE_SPLIT.creatorBasisPoints },
    { payee: 'tryamm', basisPoints: TRYAMM_ASSET_MARKETPLACE_SPLIT.tryammBasisPoints },
    { payee: 'reserve', basisPoints: TRYAMM_ASSET_MARKETPLACE_SPLIT.reserveBasisPoints },
  ]
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

export function priceBandForUsd(usd: number): AssetPriceBand {
  if (usd < 10) return 'micro'
  if (usd < 50) return 'standard'
  if (usd < 250) return 'pro'
  if (usd < 1_000) return 'studio'
  return 'enterprise'
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
// The remaining 20% is an explicit reserve until Founder policy assigns it to business/agent/referral,
// taxes/fees, promotions, community funds, or another verified destination. Never silently allocate it.
// Never mint an entitlement or creator balance from client state alone.
