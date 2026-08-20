export type MinistryEntityType = 'church' | 'ministry' | 'religious_trust' | 'nonprofit' | 'other'
export type MinistryVerificationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED'

export interface MinistryOnboardingProfile {
  ministryId: string
  legalName: string
  doingBusinessAs?: string
  entityType: MinistryEntityType
  countryCode: string
  stateOrRegion?: string
  registrationNumber?: string
  taxIdLast4?: string
  authorizedSignerName: string
  authorizedSignerRole: string
  signerEmail: string
  payoutProvider?: 'stripe_connect' | 'paypal' | 'other'
  payoutAccountRef?: string
  taxStatusClaim?: 'tax_exempt' | 'taxable' | 'unknown'
  supportingDocumentRefs: string[]
  offeringPurposes: Array<'general' | 'tithe' | 'building_fund' | 'missions' | 'benevolence' | 'youth' | 'other'>
  status: MinistryVerificationStatus
  complianceAccepted: boolean
}

export interface MinistryUnlockDecision {
  offeringsUnlocked: boolean
  liveFundraisingUnlocked: boolean
  settlementUnlocked: boolean
  blockers: string[]
}

export function evaluateMinistryUnlock(profile: MinistryOnboardingProfile): MinistryUnlockDecision {
  const blockers: string[] = []
  if (!profile.legalName.trim()) blockers.push('Legal ministry/entity name is required.')
  if (!profile.authorizedSignerName.trim()) blockers.push('Authorized signer is required.')
  if (!profile.signerEmail.trim()) blockers.push('Signer email is required.')
  if (!profile.complianceAccepted) blockers.push('Required terms/compliance acknowledgement must be accepted.')
  if (profile.supportingDocumentRefs.length === 0) blockers.push('At least one supporting entity/authorization document is required.')
  if (!profile.payoutAccountRef) blockers.push('Verified ministry-owned payout account is required.')
  if (profile.status !== 'VERIFIED') blockers.push('Backend ministry verification must be VERIFIED.')

  const unlocked = blockers.length === 0
  return {
    offeringsUnlocked: unlocked,
    liveFundraisingUnlocked: unlocked,
    settlementUnlocked: unlocked,
    blockers,
  }
}

export type FaithQuest = {
  id: string
  title: string
  xp: number
  category: 'welcome' | 'study' | 'service' | 'community' | 'music' | 'attendance'
  repeatable: boolean
  monetary: false
}

// Gamification is spiritual/community engagement only. XP, badges and streaks
// never become donation credit, withdrawal rights, investment value or cash.
export const SERVANTS_OF_CHRIST_MEMBER_QUESTS: FaithQuest[] = [
  { id: 'soc-welcome', title: 'Complete your welcome profile', xp: 100, category: 'welcome', repeatable: false, monetary: false },
  { id: 'soc-study-1', title: 'Complete a Bible study lesson', xp: 75, category: 'study', repeatable: true, monetary: false },
  { id: 'soc-live', title: 'Attend a LIVE teaching session', xp: 50, category: 'attendance', repeatable: true, monetary: false },
  { id: 'soc-prayer', title: 'Join a prayer/community session', xp: 40, category: 'community', repeatable: true, monetary: false },
  { id: 'soc-service', title: 'Log an approved service/community activity', xp: 125, category: 'service', repeatable: true, monetary: false },
  { id: 'soc-music', title: 'Participate in Set Apart Music', xp: 60, category: 'music', repeatable: true, monetary: false },
]

export function levelFromFaithXp(xp: number) {
  const safe = Math.max(0, Math.floor(xp))
  return 1 + Math.floor(Math.sqrt(safe / 100))
}
