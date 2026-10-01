export type TicketAdminRole='ticket-agent'|'senior-ticket-agent'|'ticket-supervisor'|'trust-safety-admin'|'founder'
export type TicketDecision='approve'|'decline'|'request-info'|'escalate'|'cancel'
export type TicketRisk='routine'|'elevated'|'sensitive'|'critical'
export const TICKET_ADMIN_PERMISSIONS={
 'ticket-agent':['routine-review','request-info'],
 'senior-ticket-agent':['routine-review','request-info','routine-approve','routine-decline'],
 'ticket-supervisor':['routine-review','request-info','routine-approve','routine-decline','elevated-review','assign'],
 'trust-safety-admin':['routine-review','request-info','routine-approve','routine-decline','elevated-review','assign','safety-hold','safety-escalate'],
 founder:['routine-review','request-info','routine-approve','routine-decline','elevated-review','assign','safety-hold','safety-escalate','critical-review','role-delegation']
} as const
export const TICKET_OPERATIONS={leastPrivilege:true,separationOfDuties:true,allAdminActionsAudited:true,mfaForPrivilegedRoles:true,aiMayTriage:true,aiMayTranslate:true,aiMaySummarize:true,aiMayDraftReply:true,aiCannotFinalApproveSensitive:true,aiCannotMoveMoney:true,aiCannotBanWithoutPolicyAuthority:true,founderEscalationForCritical:true} as const
export function requiredRole(risk:TicketRisk):TicketAdminRole{return risk==='critical'?'founder':risk==='sensitive'?'trust-safety-admin':risk==='elevated'?'ticket-supervisor':'senior-ticket-agent'}
export function routeTicket(risk:TicketRisk,aiConfidence:number){if(aiConfidence<.75)return{queue:'human-review',role:requiredRole(risk)};return{queue:risk==='routine'?'standard':'priority',role:requiredRole(risk)}}
