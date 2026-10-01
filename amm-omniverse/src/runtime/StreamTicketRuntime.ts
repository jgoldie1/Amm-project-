export type StreamTicketKind='go-live'|'guest-seat'|'pk-challenge'|'event-stage'|'support'
export type StreamTicket={id:string;requesterId:string;kind:StreamTicketKind;status:'requested'|'approved'|'declined'|'expired'|'cancelled';createdAt:number;expiresAt:number;targetCreatorId?:string;eventId?:string}
export const STREAM_TICKET_POLICY={serverIssued:true,authenticated:true,oneTimeUse:true,expires:true,revocable:true,moderationGate:true,youthSafetyGate:true,approvalDoesNotMoveMoney:true,approvalDoesNotBypassPlatformProviderRules:true} as const
export function newStreamTicket(requesterId:string,kind:StreamTicketKind,ttlMs=15*60*1000):StreamTicket{const now=Date.now();return{id:crypto.randomUUID(),requesterId,kind,status:'requested',createdAt:now,expiresAt:now+ttlMs}}
export function ticketUsable(t:StreamTicket,now=Date.now()){return t.status==='approved'&&now<t.expiresAt}
