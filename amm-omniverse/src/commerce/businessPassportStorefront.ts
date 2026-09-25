import type { BusinessPassport } from './businessPassport.ts'
import { ownerApprovedFacts, passportCanPublish } from './businessPassport.ts'
import type { MerchantProfile, ProductListing } from './merchantOnboarding.ts'

export type StreetVerseStorefrontDraft = {
  storeId: string
  passportId: string
  merchant: MerchantProfile
  listings: ProductListing[]
  sourceAssetIds: string[]
  referralScoutId?: string
  publicationState: 'draft' | 'owner_approved' | 'publish_eligible'
}

function slug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'business'
}

function approvedValues(passport: BusinessPassport, field: 'menu_item' | 'product' | 'price') {
  return ownerApprovedFacts(passport).filter((fact) => fact.field === field)
}

export function buildStreetVerseStorefrontDraft(passport: BusinessPassport): StreetVerseStorefrontDraft {
  const facts = ownerApprovedFacts(passport)
  const businessName = facts.find((fact) => fact.field === 'business_name')?.value || passport.businessName
  const merchantId = passport.merchantId || `merchant-${slug(businessName)}-${passport.id}`
  const storeId = passport.streetVerseStoreId || `streetverse-${slug(businessName)}-${passport.id}`
  const products = [...approvedValues(passport, 'product'), ...approvedValues(passport, 'menu_item')]
  const prices = approvedValues(passport, 'price')

  const merchant: MerchantProfile = {
    merchantId,
    businessName,
    channels: ['ai-storefront', 'streetverse'],
    physicalLocations: [],
    // Passport approval is not seller/KYB verification.
    verification: 'draft',
  }

  const listings: ProductListing[] = products.map((product, index) => {
    const price = prices[index]
    const parsed = price ? Number(price.value.replace(/[^0-9.]/g, '')) : Number.NaN
    const priceCents = Number.isFinite(parsed) && parsed > 0 ? Math.round(parsed * 100) : 0
    return {
      sku: `draft-${merchantId}-${index + 1}`,
      merchantId,
      title: product.value,
      description: 'Owner-reviewed Scan-to-Twin draft listing. Final commerce review required.',
      category: product.field === 'menu_item' ? 'menu' : 'product',
      priceCents,
      currency: 'USD',
      stockOnHand: 0,
      variants: [],
      media: [],
      fulfillment: [],
      worldPlacement: { world: 'streetverse', storeId },
      status: 'draft',
    }
  })

  return {
    storeId,
    passportId: passport.id,
    merchant,
    listings,
    sourceAssetIds: [...new Set(facts.map((fact) => fact.sourceAssetId))],
    referralScoutId: passport.referralScoutId,
    publicationState: passport.status === 'approved' ? 'owner_approved' : 'draft',
  }
}

export function storefrontCanPublish(passport: BusinessPassport, draft: StreetVerseStorefrontDraft) {
  const passportGate = passportCanPublish(passport)
  if (!passportGate.ok) return passportGate
  if (draft.passportId !== passport.id) return { ok: false, reason: 'Storefront draft is not bound to this Passport' } as const
  if (draft.merchant.verification !== 'verified') return { ok: false, reason: 'Merchant verification required before commerce publication' } as const
  if (draft.listings.some((listing) => listing.status === 'active')) {
    return { ok: false, reason: 'Scan-to-Twin cannot silently activate commerce listings' } as const
  }
  return { ok: true, reason: 'Owner-approved storefront may proceed to catalog and publication review' } as const
}
