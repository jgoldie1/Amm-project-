export type BillingCadence = 'UNSET'
export type PassportStatus = 'draft' | 'capturing' | 'ai_draft' | 'owner_review' | 'approved' | 'published' | 'rejected'

export type CaptureSurface =
  | 'front'
  | 'left'
  | 'right'
  | 'rear'
  | 'entrance'
  | 'interior'
  | 'signage'
  | 'counter'
  | 'menu'
  | 'product_display'

export type CaptureAsset = {
  id: string
  surface: CaptureSurface
  mediaUrl: string
  capturedAt: string
  consentId: string
  containsPeople?: boolean
  approvedForAi: boolean
}

export type BusinessCaptureConsent = {
  id: string
  businessId: string
  authorizedBy: string
  authorizedAt: string
  scope: CaptureSurface[]
  permitsAiDraft: boolean
  permitsStreetVersePublication: boolean
  revokedAt?: string
}

export type ExtractedFact = {
  field: 'business_name' | 'sign_text' | 'menu_item' | 'product' | 'price' | 'hours' | 'layout_note'
  value: string
  confidence: number
  sourceAssetId: string
  ownerDecision: 'pending' | 'accepted' | 'corrected' | 'removed'
  correctedValue?: string
}

export type BusinessPassport = {
  id: string
  ownerAccountId: string
  merchantId?: string
  businessName: string
  planId?: string
  billingCadence: BillingCadence
  status: PassportStatus
  referralScoutId?: string
  consent: BusinessCaptureConsent
  captures: CaptureAsset[]
  extractedFacts: ExtractedFact[]
  streetVerseStoreId?: string
  createdAt: string
  updatedAt: string
}

export const BUSINESS_PLAN_PRICING_POLICY = Object.freeze({
  hardcodedPassportPricesAllowed: false,
  passportStoresSelectionOnly: true,
  authoritativePricingRequiredBeforeCheckout: true,
  sourceOfTruth: 'authoritative-pricing-or-offer-service',
  draftBillingCadence: 'UNSET',
} as const)

export const SCAN_TO_TWIN_FLOW = [
  'QR_OR_INVITE',
  'AUTHORIZED_CONSENT',
  'GUIDED_CAPTURE',
  'AI_EXTRACTION',
  'DRAFT_TWIN',
  'OWNER_REVIEW',
  'CORRECT_REMOVE_APPROVE',
  'PLAN_SELECTION',
  'AUTHORITATIVE_PRICE_RESOLUTION',
  'PUBLISH_STREETVERSE',
  'CATALOG_INVENTORY',
  'CREATOR_CAMPAIGN',
  'ORDER_FULFILLMENT_LEDGER',
] as const

export function validateCaptureAsset(asset: CaptureAsset, consent: BusinessCaptureConsent) {
  if (asset.consentId !== consent.id) return { ok: false, reason: 'Capture is not bound to active consent' } as const
  if (consent.revokedAt) return { ok: false, reason: 'Capture consent was revoked' } as const
  if (!consent.scope.includes(asset.surface)) return { ok: false, reason: 'Capture surface is outside consent scope' } as const
  if (!asset.approvedForAi) return { ok: false, reason: 'Asset is not approved for AI processing' } as const
  return { ok: true, reason: 'Capture accepted for draft processing' } as const
}

export function passportCanPublish(passport: BusinessPassport) {
  if (passport.consent.revokedAt) return { ok: false, reason: 'Consent revoked' } as const
  if (!passport.consent.permitsStreetVersePublication) return { ok: false, reason: 'Publication consent required' } as const
  if (passport.status !== 'approved') return { ok: false, reason: 'Owner approval required before publication' } as const
  const unresolved = passport.extractedFacts.filter((fact) => fact.ownerDecision === 'pending')
  if (unresolved.length) return { ok: false, reason: 'Every extracted fact must be reviewed by the owner' } as const
  return { ok: true, reason: 'Passport is eligible for StreetVerse publication' } as const
}

export function ownerApprovedFacts(passport: BusinessPassport) {
  return passport.extractedFacts
    .filter((fact) => fact.ownerDecision === 'accepted' || fact.ownerDecision === 'corrected')
    .map((fact) => ({
      field: fact.field,
      value: fact.ownerDecision === 'corrected' ? fact.correctedValue ?? fact.value : fact.value,
      sourceAssetId: fact.sourceAssetId,
      confidence: fact.confidence,
    }))
}
