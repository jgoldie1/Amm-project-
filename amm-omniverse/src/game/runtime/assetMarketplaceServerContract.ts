import type { AssetLicenseScope } from './assetMarketplaceEconomy'

export interface CreateAssetCheckoutRequest {
  listingId: string
  buyerUserId: string
}

export interface VerifiedPaymentEvent {
  provider: 'stripe'|'other'
  providerEventId: string
  providerPaymentId: string
  listingId: string
  buyerUserId: string
  sellerUserId: string
  assetPassportId: string
  grossMinor: number
  taxMinor: number
  processingFeeMinor: number
  currency: string
  verifiedByServer: boolean
}

export interface MarketplaceLedgerEntry {
  id: string
  transactionId: string
  account: 'creator'|'tryamm'|'reserve'
  amountMinor: number
  currency: string
  source: 'asset-sale'|'refund'|'chargeback'|'reserve-release'|'payout'
  createdAt: string
}

export interface AssetPurchaseResult {
  transactionId: string
  entitlementId: string
  assetPassportId: string
  buyerUserId: string
  licenseScope: AssetLicenseScope
  ledgerEntryIds: string[]
}

export const ASSET_MARKETPLACE_SERVER_FLOW = [
  'AUTHENTICATE_BUYER',
  'LOAD_PUBLISHED_LISTING',
  'LOAD_CERTIFIED_ASSET_AND_RIGHTS',
  'VERIFY_PRICE_SERVER_SIDE',
  'CREATE_PROVIDER_CHECKOUT',
  'VERIFY_PROVIDER_WEBHOOK_SIGNATURE',
  'DEDUPLICATE_PROVIDER_EVENT',
  'CALCULATE_NET_SETTLEMENT',
  'WRITE_TRANSACTION',
  'WRITE_ENTITLEMENT',
  'WRITE_40_40_20_LEDGER',
  'RETURN_PURCHASE_STATE',
] as const

export function acceptPaymentEvent(event: VerifiedPaymentEvent): boolean {
  return event.verifiedByServer &&
    event.grossMinor > 0 &&
    event.currency.length === 3 &&
    Boolean(event.providerEventId && event.providerPaymentId)
}

// Idempotency must key on providerEventId/providerPaymentId. Never trust client price, split,
// entitlement, balance or payment-success claims. The server reloads the listing and asset rights
// before checkout and again before final entitlement/ledger writes.
