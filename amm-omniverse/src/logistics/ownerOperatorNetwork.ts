export type OwnerOperatorVerification='draft'|'documents-submitted'|'review'|'verified'|'suspended'
export type OwnerOperatorProfile={
 id:string;userId:string;businessName:string;verification:OwnerOperatorVerification;
 equipment:string[];preferredModes:('ltl'|'ftl'|'local'|'intermodal')[];preferredLanes:string[];
 homeBase?:string;insuranceVerified:boolean;authorityVerified:boolean;identityVerified:boolean;
 acceptsHazmat:boolean;coldChainCapable:boolean;active:boolean
}

export type LoadOffer={
 id:string;shipmentId:string;carrierId?:string;ownerOperatorId?:string;origin:string;destination:string;
 mode:'ltl'|'ftl'|'local'|'intermodal';weightLb:number;rateMinor:number;currency:'USD';
 pickupWindow?:string;deliveryWindow?:string;state:'offered'|'accepted'|'declined'|'expired'|'booked';
 authoritativeRate:boolean;externalBookingConfirmed:boolean
}

export function ownerOperatorReady(profile:OwnerOperatorProfile){
 const blockers:string[]=[]
 if(profile.verification!=='verified')blockers.push('carrier_verification_incomplete')
 if(!profile.identityVerified)blockers.push('identity_not_verified')
 if(!profile.insuranceVerified)blockers.push('insurance_not_verified')
 if(!profile.authorityVerified)blockers.push('operating_authority_not_verified')
 if(!profile.active)blockers.push('carrier_inactive')
 if(!profile.equipment.length)blockers.push('equipment_required')
 return{eligible:blockers.length===0,blockers}
}

export function loadOfferCanAccept(profile:OwnerOperatorProfile,offer:LoadOffer){
 const readiness=ownerOperatorReady(profile)
 const blockers=[...readiness.blockers]
 if(!offer.authoritativeRate)blockers.push('authoritative_rate_required')
 if(offer.state!=='offered')blockers.push('offer_not_open')
 if(!profile.preferredModes.includes(offer.mode))blockers.push('mode_not_supported')
 return{eligible:blockers.length===0,blockers,externalBookingStillRequired:true}
}

export const OWNER_OPERATOR_FLOW=[
 'CREATE PROFILE','VERIFY IDENTITY / BUSINESS','VERIFY INSURANCE / AUTHORITY','ADD EQUIPMENT',
 'SET LANES / MODES','RECEIVE LOAD OFFER','RATE / TERMS REVIEW','ACCEPT / DECLINE',
 'EXTERNAL BOOKING CONFIRMATION','PICKUP','BOL','IN TRANSIT','POD','SETTLEMENT','RATING / REPUTATION'
] as const