export type OnboardingStatus='draft'|'documents-submitted'|'review'|'verified'|'restricted'|'suspended'
export type OwnerOperatorOnboarding={
 id:string;userId:string;businessName:string;status:OnboardingStatus;
 identityVerified:boolean;businessVerified:boolean;taxFormStatus:'missing'|'submitted'|'verified';
 operatingAuthorityStatus:'unknown'|'submitted'|'verified'|'not-required'|'failed';
 insuranceStatus:'missing'|'submitted'|'verified'|'expired'|'review';
 cdlStatus:'unknown'|'submitted'|'verified'|'not-applicable';
 medicalCardStatus:'unknown'|'submitted'|'verified'|'not-applicable'|'expired';
 equipmentVerified:boolean;eldStatus:'unknown'|'connected'|'not-required'|'review';
 factoringPreference:'none'|'direct'|'factor';quickPayPreference:boolean;
 bankPayoutStatus:'unconnected'|'pending'|'verified';
 safetyPolicyAccepted:boolean;termsAccepted:boolean;
}

export function evaluateOwnerOperatorOnboarding(x:OwnerOperatorOnboarding){
 const blockers:string[]=[]
 if(!x.identityVerified)blockers.push('identity_required')
 if(!x.businessVerified)blockers.push('business_verification_required')
 if(x.taxFormStatus!=='verified')blockers.push('tax_form_required')
 if(!['verified','not-required'].includes(x.operatingAuthorityStatus))blockers.push('operating_authority_not_verified')
 if(x.insuranceStatus!=='verified')blockers.push('insurance_not_verified')
 if(!['verified','not-applicable'].includes(x.cdlStatus))blockers.push('cdl_not_verified')
 if(!['verified','not-applicable'].includes(x.medicalCardStatus))blockers.push('medical_card_not_verified')
 if(!x.equipmentVerified)blockers.push('equipment_not_verified')
 if(!x.safetyPolicyAccepted)blockers.push('safety_policy_not_accepted')
 if(!x.termsAccepted)blockers.push('terms_not_accepted')
 return{eligible:blockers.length===0,blockers,canReceiveRealLoads:blockers.length===0&&x.status==='verified'}
}

export const OWNER_OPERATOR_ONBOARDING_FLOW=[
 'ACCOUNT / IDENTITY','BUSINESS / TAX PROFILE','OPERATING AUTHORITY','INSURANCE',
 'CDL / MEDICAL CARD WHEN APPLICABLE','TRUCK / TRAILER / EQUIPMENT','ELD / TRACKING READINESS',
 'BANK / PAYOUT SETUP','FACTORING / QUICK PAY PREFERENCE','SAFETY + TERMS','REVIEW','VERIFIED LOAD ACCESS'
] as const