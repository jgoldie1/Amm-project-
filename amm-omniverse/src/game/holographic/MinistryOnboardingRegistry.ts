export type MinistryExemptionStatus='not-provided'|'not-exempt'|'pending'|'self-described-exempt'|'verified'
export type MinistryRole='minister'|'pastor'|'rabbi'|'teacher'|'administrator'|'ministry-leader'|'other'

export interface MinistryOnboardingProfile{
 id:string
 ministryName:string
 leaderName:string
 role:MinistryRole
 faithTradition?:string
 description?:string
 city?:string
 state?:string
 country?:string
 website?:string
 publicContact?:string
 exemptionStatus:MinistryExemptionStatus
 exemptionBasis?:string
 exemptionReference?:string
 verificationDocumentIds?:string[]
 donationEnabled:boolean
 programs:string[]
 createdAt:number
 updatedAt:number
}

export const MINISTRY_BUILDER_MODULES=[
 'public ministry profile',
 'FaithVerse destination',
 'worship and teaching schedule',
 'Holo LIVE ministry channel',
 'scripture and study library',
 'music and praise',
 'prayer and testimony',
 'youth learning',
 'community service programs',
 'food and clothing support',
 'events and ministry showcase',
 'volunteer onboarding',
 'donation and fund-purpose pages',
 'merchandise and media',
 'replay and Reels distribution',
 'All American Network distribution eligibility',
] as const

export const EXEMPTION_ONBOARDING_FIELDS=[
 'organization legal name',
 'public ministry name',
 'jurisdiction',
 'organization type',
 'EIN or applicable tax identifier when required',
 'claimed exemption basis',
 'determination or recognition reference when applicable',
 'effective date when applicable',
 'supporting document references',
 'authorized representative attestation',
] as const

export const MINISTRY_ONBOARDING_RULES={
 selfReportedStatusIsNotVerification:true,
 platformDoesNotGrantTaxExemption:true,
 taxDeductibilityNotAssumed:true,
 sensitiveTaxIdentifiersNeverPublic:true,
 supportingDocumentsPrivateByDefault:true,
 verificationRequiresAuthorizedEvidence:true,
 statusCanExpireOrRequireReverification:true,
 donationsRequirePurposeAndReceiptRecords:true,
 restrictedFundsTrackedSeparately:true,
 commerceRevenueTrackedSeparately:true,
 serverVerifiedPaymentsRequired:true,
 minorsRequireApplicableSafeguards:true,
} as const

export const ministryCapabilities=(status:MinistryExemptionStatus)=>({
 buildMinistry:true,
 publishPrograms:true,
 scheduleLive:true,
 recruitVolunteers:true,
 sellApprovedMerchandise:true,
 acceptSupport:status!=='not-provided',
 displayVerifiedExemptionBadge:status==='verified',
 claimTaxDeductibleDonations:status==='verified',
})

/**
 * TRYAMM records and, where configured, verifies exemption evidence.
 * It does not create or award government tax-exempt status. Jurisdiction-
 * specific filings and determinations remain with the appropriate authority.
 */
