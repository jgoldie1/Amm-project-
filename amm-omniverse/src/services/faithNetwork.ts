export type FaithRole = 'pastor' | 'minister' | 'moderator' | 'member'

export interface FaithNetwork {
  slug: string
  name: string
  ministryName: string
  leaderDisplayName: string
  leaderRole: FaithRole
  channels: Array<'live' | 'sermons' | 'bible-study' | 'prayer' | 'music' | 'community'>
  offeringsEnabled: boolean
  legalEntityVerified: boolean
  paymentAccountVerified: boolean
  taxStatusVerified: boolean
}

export const SERVANTS_OF_CHRIST_NETWORK: FaithNetwork = {
  slug: 'servants-of-christ',
  name: 'Servants of Christ Network',
  ministryName: 'Servants of Christ',
  leaderDisplayName: 'Kofi Ofri',
  leaderRole: 'pastor',
  channels: ['live', 'sermons', 'bible-study', 'prayer', 'music', 'community'],
  offeringsEnabled: false,
  legalEntityVerified: false,
  paymentAccountVerified: false,
  taxStatusVerified: false,
}

export interface OfferingGateInput {
  authenticatedDonor: boolean
  ministryLegalEntityVerified: boolean
  ministryPaymentAccountVerified: boolean
  donationTermsAccepted: boolean
  restrictedPurpose?: string
}

export function canAcceptOffering(input: OfferingGateInput) {
  const blockers: string[] = []
  if (!input.authenticatedDonor) blockers.push('Authenticate donor/session.')
  if (!input.ministryLegalEntityVerified) blockers.push('Verify the ministry/trust/church legal recipient before enabling offerings.')
  if (!input.ministryPaymentAccountVerified) blockers.push('Connect and verify the ministry-owned payment/payout account.')
  if (!input.donationTermsAccepted) blockers.push('Present and accept offering/donation terms and any required disclosures.')
  return { allowed: blockers.length === 0, blockers }
}

// Offerings must be accounted for separately from creator gifts and TRYAMM operating revenue.
// Money Engine records provider fees, restricted-purpose metadata where applicable, refunds,
// ministry payable/settlement, and TRYAMM fees only when contractually/legal permitted.
export const OFFERING_LEDGER_FLOW = [
  'payment_provider',
  'money_engine',
  'offering_ledger',
  'restricted_purpose_metadata',
  'internal_blockchain_receipt',
  'ministry_settlement',
  'audit',
] as const
