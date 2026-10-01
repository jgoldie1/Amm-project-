export type AiTicketInput={ticketId:string;kind:string;text:string;language?:string}
export function aiTicketAssist(i:AiTicketInput){return{ticketId:i.ticketId,tasks:['classify','summarize','translate-if-needed','detect-duplicate','flag-risk','draft-response'],finalDecisionRequiredFromHuman:true}}
export const AI_TICKET_GUARDRAILS={noAutonomousSensitiveApproval:true,noAutonomousBan:true,noPaymentAuthority:true,noRoleDelegation:true,minimumNecessaryData:true} as const
