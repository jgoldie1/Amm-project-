export type OfferingLane = 'shared_use' | 'regulated_investment'
export type OfferingStatus = 'DRAFT' | 'DUE_DILIGENCE' | 'PARTNER_REVIEW' | 'APPROVED' | 'LOCKED'

export type OpportunityAssetType =
  | 'property'
  | 'vehicle'
  | 'farmland'
  | 'equipment'
  | 'creator_asset'
  | 'business_equity'
  | 'tokenized_security'

export interface FractionalOpportunity {
  id: string
  title: string
  assetType: OpportunityAssetType
  lane: OfferingLane
  status: OfferingStatus
  countryCode: string
  expectedProfitOrYield: boolean
  passiveInvestment: boolean
  verifiedTitleOrOwnership: boolean
  valuationVerified: boolean
  insuranceVerified: boolean
  environmentalClearance?: boolean
  regulatedPartnerApproved: boolean
  writtenComplianceApproval: boolean
  custodyOrEscrowApproved: boolean
  offeringDocumentsApproved: boolean
  investorEligibilityEnabled: boolean
}

export interface ComplianceDecision {
  allowed: boolean
  lane: OfferingLane
  blockers: string[]
  nextActions: string[]
}

export function classifyLane(input: Pick<FractionalOpportunity, 'assetType' | 'expectedProfitOrYield' | 'passiveInvestment'>): OfferingLane {
  if (input.expectedProfitOrYield || input.passiveInvestment || input.assetType === 'business_equity' || input.assetType === 'tokenized_security') {
    return 'regulated_investment'
  }
  return 'shared_use'
}

export function evaluateOpportunity(input: FractionalOpportunity): ComplianceDecision {
  const lane = classifyLane(input)
  const blockers: string[] = []
  const nextActions: string[] = []

  if (!input.verifiedTitleOrOwnership) blockers.push('Verify title or legal ownership before accepting funds.')
  if (!input.valuationVerified) blockers.push('Complete an independent or policy-approved valuation.')
  if (!input.insuranceVerified) blockers.push('Verify required insurance/protection coverage.')
  if (input.assetType === 'farmland' && input.environmentalClearance === false) blockers.push('Complete environmental/land-use diligence.')

  if (lane === 'regulated_investment') {
    if (!input.regulatedPartnerApproved) blockers.push('Approved regulated intermediary/partner is required.')
    if (!input.writtenComplianceApproval) blockers.push('Written compliance approval is required.')
    if (!input.custodyOrEscrowApproved) blockers.push('Approved custody/escrow structure is required.')
    if (!input.offeringDocumentsApproved) blockers.push('Approved offering disclosures/documents are required.')
    if (!input.investorEligibilityEnabled) blockers.push('Investor/jurisdiction eligibility controls are required.')
  }

  if (blockers.length) nextActions.push('Keep funding, checkout, transfer and payout controls locked until every blocker is cleared.')
  else nextActions.push('Allow only the approved lane and preserve Money Engine + Internal Blockchain audit evidence.')

  return { allowed: blockers.length === 0, lane, blockers, nextActions }
}

// Stubbs AI may explain requirements, collect structured diligence, flag missing evidence,
// and route a case to human/legal review. It MUST NOT declare an offering SEC-compliant,
// provide legal approval, fabricate title/valuation, or unlock regulated execution itself.
export const COMPLIANCE_AI_BOUNDARY = {
  may: ['explain', 'collect_evidence', 'flag_missing_items', 'summarize_risk', 'route_for_review'],
  mayNot: ['approve_security', 'practice_law', 'fabricate_evidence', 'unlock_execution', 'guarantee_returns'],
} as const

export const FRACTIONAL_REVENUE_SERVICES = [
  'setup',
  'management',
  'reservation_coordination',
  'maintenance_coordination',
  'holographic_tour',
  'ai_services',
  'transfer_resale_administration',
] as const
