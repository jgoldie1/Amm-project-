import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export type FamilyMemberRole='guardian'|'adult'|'teen'|'child'

export type StayReservationInput={
  listingId:string
  checkIn:string
  checkOut:string
  guestCount:number
}

export type AgencyContractProposalInput={
  membershipId:string
  commissionBps:number
  contractEvidenceId:string
  guardianConsentEvidenceId?:string
  ageComplianceReviewed?:boolean
}

export type FamilyInvitationInput={
  familyGroupId:string
  userId:string
  role:FamilyMemberRole
  guardianApprovalEvidenceId?:string
}

function requireClient(){
  const sb=getSupabaseClient()
  if(!sb)throw new Error('Supabase is not configured for this client')
  return sb
}

async function requireUserId(){
  const userId=await getAuthenticatedUserId()
  if(!userId)throw new Error('Authenticated TRYAMM user required')
  return userId
}

function requireText(value:string,label:string){
  const clean=value.trim()
  if(!clean)throw new Error(`${label} is required`)
  return clean
}

export async function requestStayReservation(input:StayReservationInput){
  const sb=requireClient()
  const guestUserId=await requireUserId()
  if(!Number.isInteger(input.guestCount)||input.guestCount<1||input.guestCount>50)throw new Error('Guest count must be between 1 and 50')
  const listingId=requireText(input.listingId,'Listing')
  const checkIn=requireText(input.checkIn,'Check-in')
  const checkOut=requireText(input.checkOut,'Check-out')
  const {data,error}=await sb.from('tryamm_stay_reservations').insert({
    listing_id:listingId,
    guest_user_id:guestUserId,
    check_in:checkIn,
    check_out:checkOut,
    guest_count:input.guestCount,
    status:'requested',
  }).select('*').single()
  if(error)throw error
  return data
}

export async function listStayReservations(){
  const sb=requireClient()
  await requireUserId()
  const {data,error}=await sb.from('tryamm_stay_reservations').select('*').order('created_at',{ascending:false})
  if(error)throw error
  return data??[]
}

export async function proposeAgencyContract(input:AgencyContractProposalInput){
  const sb=requireClient()
  const proposedByUserId=await requireUserId()
  if(!Number.isInteger(input.commissionBps)||input.commissionBps<0||input.commissionBps>10_000)throw new Error('Commission must be between 0 and 10000 basis points')
  const membershipId=requireText(input.membershipId,'Agency membership')
  const contractEvidenceId=requireText(input.contractEvidenceId,'Contract evidence')
  const {data,error}=await sb.from('tryamm_agency_contracts').insert({
    membership_id:membershipId,
    proposed_by_user_id:proposedByUserId,
    commission_bps:input.commissionBps,
    status:'proposed',
    contract_evidence_id:contractEvidenceId,
    guardian_consent_evidence_id:input.guardianConsentEvidenceId?.trim()||null,
    age_compliance_reviewed:input.ageComplianceReviewed===true,
  }).select('*').single()
  if(error)throw error
  return data
}

export async function listAgencyContracts(){
  const sb=requireClient()
  await requireUserId()
  const {data,error}=await sb.from('tryamm_agency_contracts').select('*').order('created_at',{ascending:false})
  if(error)throw error
  return data??[]
}

export async function createFamilyGroup(name:string){
  const sb=requireClient()
  const ownerUserId=await requireUserId()
  const cleanName=requireText(name,'Family group name')
  if(cleanName.length>80)throw new Error('Family group name must be 80 characters or fewer')
  const {data,error}=await sb.from('tryamm_family_groups').insert({
    owner_user_id:ownerUserId,
    name:cleanName,
    status:'active',
  }).select('*').single()
  if(error)throw error
  return data
}

export async function listFamilyGroups(){
  const sb=requireClient()
  await requireUserId()
  const {data,error}=await sb.from('tryamm_family_groups').select('*').order('created_at',{ascending:false})
  if(error)throw error
  return data??[]
}

export async function inviteFamilyMember(input:FamilyInvitationInput){
  const sb=requireClient()
  await requireUserId()
  const familyGroupId=requireText(input.familyGroupId,'Family group')
  const userId=requireText(input.userId,'Family member')
  if((input.role==='teen'||input.role==='child')&&!input.guardianApprovalEvidenceId?.trim())throw new Error('Guardian approval evidence is required for a minor family invitation')
  const {data,error}=await sb.from('tryamm_family_memberships').insert({
    family_group_id:familyGroupId,
    user_id:userId,
    role:input.role,
    status:'invited',
    guardian_approval_evidence_id:input.guardianApprovalEvidenceId?.trim()||null,
  }).select('*').single()
  if(error)throw error
  return data
}

export async function listFamilyMemberships(){
  const sb=requireClient()
  await requireUserId()
  const {data,error}=await sb.from('tryamm_family_memberships').select('*').order('created_at',{ascending:false})
  if(error)throw error
  return data??[]
}
