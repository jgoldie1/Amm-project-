export type StayComplianceStatus='PENDING_REVIEW'|'APPROVED'|'BLOCKED'
export type StayReservationStatus='REQUESTED'|'HELD'|'CONFIRMED'|'CHECKED_IN'|'CHECKED_OUT'|'CANCELLED'
export type AgencyMemberAgeBand='ADULT'|'TEEN'|'CHILD'
export type AgencyRole='OWNER'|'MANAGER'|'COACH'|'CREATOR'
export type FamilyRole='GUARDIAN'|'ADULT'|'TEEN'|'CHILD'

export interface TryammStayListing{
  listingId:string
  hostId:string
  propertyId:string
  complianceStatus:StayComplianceStatus
  hostIdentityVerified:boolean
  jurisdictionEvidenceIds:string[]
  accessibilityFeatures:string[]
  maxGuests:number
  active:boolean
}

export interface StayReservationRequest{
  reservationId:string
  listing:TryammStayListing
  guestId:string
  checkIn:string
  checkOut:string
  guestCount:number
  availabilityHoldId?:string
  paymentAuthorizationEvidenceId?:string
  guestIdentityVerified:boolean
}

export interface CreatorAgencyMembership{
  membershipId:string
  agencyId:string
  creatorId:string
  role:AgencyRole
  ageBand:AgencyMemberAgeBand
  creatorConsent:boolean
  contractEvidenceId?:string
  commissionBps:number
  guardianConsentEvidenceId?:string
  ageComplianceReviewed:boolean
  active:boolean
}

export interface FamilyMemberProfile{
  memberId:string
  role:FamilyRole
  ageAppropriateProfile:boolean
  guardianApprovalRequiredForLive:boolean
  guardianApprovalRequiredForSpending:boolean
  guardianApprovalRequiredForAgency:boolean
}

export interface FamilyLiveRequest{
  member:FamilyMemberProfile
  guardianApprovalEvidenceId?:string
  ageComplianceReviewed:boolean
  moderationLaneReady:boolean
  preciseLocationSharing:boolean
}

export const TRYAMM_STAYS={
  brandName:'TRYAMM Stays',
  positioning:'Host-and-stay marketplace connected to PropertyVerse, StreetVerse, creator LIVE tours, suppliers, maintenance, logistics and the TRYAMM commerce stack.',
  surfaces:['host dashboard','guest search','PropertyVerse stay view','StreetVerse property preview','availability calendar','reservation inbox','cleaning/maintenance board','accessible-stay filters','LIVE property tour','guest messaging','check-in workflow','review and issue workflow'],
  workflow:['property.listed','host.identity.verified','jurisdiction.reviewed','availability.published','reservation.requested','reservation.held','payment.authorized','reservation.confirmed','checkin.ready','guest.checked_in','guest.checked_out','property.inspected','host.payout.settled'],
  authorityBoundary:'Availability, reservation confirmation, payment, deposit/refund, taxes, check-in credentials and host payout remain server/provider authoritative. A client preview cannot create booking truth.',
  integrationBoundary:'No Airbnb partnership, API connection or inventory synchronization is implied unless a separately approved provider integration is configured and verified.',
} as const

export const TRYAMM_CREATOR_AGENCIES={
  brandName:'TRYAMM Creator Agencies',
  surfaces:['agency profile','talent roster','creator invitation inbox','creator consent','manager roles','LIVE schedule','PK team planner','campaign board','brand-deal workspace','training/coaching','moderation dashboard','earnings analytics','contract and commission evidence','agency performance dashboard'],
  capabilities:['recruit consenting creators','schedule LIVE sessions','organize PK teams and panels','assign coaching/training','manage approved campaigns','request creator deliverables','view permissioned analytics','track contract terms and renewal'],
  earningsRule:'Creator, agency and platform money splits are calculated by authoritative settlement services from valid agreements. An agency dashboard cannot rewrite balances or seize creator earnings.',
  minorRule:'Teen/child agency participation is blocked unless age compliance is reviewed and required guardian/legal consent evidence exists. Local law and platform policy still apply.',
} as const

export const TRYAMM_FAMILY_STREAMING={
  brandName:'TRYAMM Family Groups',
  surfaces:['family group','separate member profiles','shared watchlist','family LIVE room','group chat','household subscription view','guardian approvals','spending controls','age-appropriate discovery','family creator team','shared calendar','accessibility preferences'],
  privacy:['separate profile history','precise location off by default','minimum necessary data sharing','guardian-visible approval events without exposing unrelated private account data'],
  safety:['age-appropriate discovery','moderation lane required for minor LIVE participation','guardian approval gates where configured/required','no automatic agency enrollment','no automatic pooling of wallets or creator earnings'],
  accessibility:['captions','translation','screen-reader structure','voice navigation','large controls','reduced motion','low-bandwidth viewing'],
} as const

export const STAYS_AGENCY_FAMILY_CONNECTIONS={
  stays:['PropertyVerse','StreetVerse','Supplier Network','Global Supply Chain','TRYAMM LIVE','Omni Cash/payment providers','EPIC Training'],
  agency:['TRYAMM LIVE','PK/panels','Reels','Creator Commerce','EPIC Training','moderation','settlement ledger'],
  family:['TRYAMM LIVE','Reels','watch/discovery','accessibility','moderation','subscriptions','creator tools'],
} as const

export function validateStayReservationRequest(request:StayReservationRequest,nowMs=Date.now()){
  const reasons:string[]=[]
  const checkInMs=Date.parse(request.checkIn)
  const checkOutMs=Date.parse(request.checkOut)
  if(!request.reservationId.trim()||!request.guestId.trim())reasons.push('missing-reservation-identity')
  if(!request.listing.active)reasons.push('listing-inactive')
  if(request.listing.complianceStatus!=='APPROVED')reasons.push('listing-compliance-not-approved')
  if(!request.listing.hostIdentityVerified)reasons.push('host-identity-not-verified')
  if(!request.guestIdentityVerified)reasons.push('guest-identity-not-verified')
  if(!Number.isInteger(request.guestCount)||request.guestCount<1||request.guestCount>request.listing.maxGuests)reasons.push('guest-count-invalid')
  if(!Number.isFinite(checkInMs)||!Number.isFinite(checkOutMs)||checkInMs>=checkOutMs||checkOutMs<=nowMs)reasons.push('stay-dates-invalid')
  if(!request.availabilityHoldId?.trim())reasons.push('availability-hold-required')
  if(!request.paymentAuthorizationEvidenceId?.trim())reasons.push('payment-authorization-required')
  return{allowed:reasons.length===0,reasons}
}

export function validateCreatorAgencyMembership(membership:CreatorAgencyMembership){
  const reasons:string[]=[]
  if(!membership.membershipId.trim()||!membership.agencyId.trim()||!membership.creatorId.trim())reasons.push('missing-membership-identity')
  if(!membership.active)reasons.push('membership-inactive')
  if(!membership.creatorConsent)reasons.push('creator-consent-required')
  if(!membership.contractEvidenceId?.trim())reasons.push('contract-evidence-required')
  if(!Number.isInteger(membership.commissionBps)||membership.commissionBps<0||membership.commissionBps>10_000)reasons.push('commission-invalid')
  if(membership.ageBand!=='ADULT'){
    if(!membership.ageComplianceReviewed)reasons.push('minor-age-compliance-review-required')
    if(!membership.guardianConsentEvidenceId?.trim())reasons.push('minor-guardian-consent-required')
  }
  return{allowed:reasons.length===0,reasons}
}

export function evaluateFamilyLiveAccess(request:FamilyLiveRequest){
  const reasons:string[]=[]
  const isMinor=request.member.role==='TEEN'||request.member.role==='CHILD'
  if(!request.member.ageAppropriateProfile)reasons.push('age-appropriate-profile-required')
  if(isMinor&&!request.ageComplianceReviewed)reasons.push('minor-age-compliance-review-required')
  if(isMinor&&!request.moderationLaneReady)reasons.push('minor-moderation-lane-required')
  if(request.member.guardianApprovalRequiredForLive&&!request.guardianApprovalEvidenceId?.trim())reasons.push('guardian-live-approval-required')
  if(isMinor&&request.preciseLocationSharing)reasons.push('minor-precise-location-sharing-blocked')
  return{allowed:reasons.length===0,reasons}
}

export function mayStayClientConfirmReservationOrPayout(){return false as const}
export function mayAgencySeizeCreatorEarnings(){return false as const}
export function mayAgencyChangeCommissionWithoutCreatorAgreement(){return false as const}
export function mayMinorJoinAgencyWithoutGuardianReview(){return false as const}
export function mayFamilyPoolWalletsByDefault(){return false as const}
export function mayFamilySharePreciseLocationByDefault(){return false as const}
