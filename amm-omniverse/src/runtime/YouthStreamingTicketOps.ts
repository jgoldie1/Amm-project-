export type YouthTicketKind='go-live'|'guest-seat'|'family-event'|'creator-coaching'|'support'
export type YouthTicketRisk='routine'|'elevated'|'sensitive'
export type YouthStreamingTicket={id:string;minorUserId:string;kind:YouthTicketKind;status:'requested'|'guardian-review'|'admin-review'|'approved'|'declined'|'expired'|'cancelled';guardianConsentRequired:boolean;guardianApproved:boolean;createdAt:number;expiresAt:number;assignedAdminId?:string}
export const YOUTH_STREAMING_POLICY={
 protectedLane:true,
 adultAdminOnly:true,
 guardianConsentForPaidOrPublicHosting:true,
 directAdultMinorPrivateMessagingDisabled:true,
 twoAdultEscalationForSensitiveCases:true,
 youthSafetyTrainingRequired:true,
 mfaRequired:true,
 auditedActions:true,
 locationSharingOffByDefault:true,
 giftsAndPaidFeaturesFollowYouthControls:true,
 aiMayTriageTranslateSummarize:true,
 aiCannotFinalApproveSensitive:true,
 aiCannotContactMinorPrivately:true
} as const
export function youthTicketReady(t:YouthStreamingTicket,now=Date.now()){if(now>=t.expiresAt)return false;if(t.guardianConsentRequired&&!t.guardianApproved)return false;return t.status==='approved'}
export function youthQueue(risk:YouthTicketRisk){return risk==='sensitive'?'youth-trust-safety':risk==='elevated'?'youth-supervisor':'youth-standard'}
