export type OpsTool='mission.read'|'creator.job.read'|'commerce.order.read'|'support.ticket.create'|'team.message.draft';
export type OpsRole='player'|'creator'|'support'|'admin';
export type OpsRequest={tool:OpsTool;actorId:string;role:OpsRole;resourceOwnerId?:string;payload?:Record<string,unknown>};
export type OpsDecision={allowed:boolean;reason:string;requiresConfirmation:boolean};
const permissions:Record<OpsRole,readonly OpsTool[]>={
 player:['mission.read','support.ticket.create'],
 creator:['mission.read','creator.job.read','support.ticket.create','team.message.draft'],
 support:['support.ticket.create','team.message.draft'],
 admin:['mission.read','creator.job.read','commerce.order.read','support.ticket.create','team.message.draft']
};
export function authorizeOpsRequest(req:OpsRequest):OpsDecision{
 if(!req.actorId||!permissions[req.role]?.includes(req.tool))return {allowed:false,reason:'Role not permitted',requiresConfirmation:false};
 if(req.resourceOwnerId&&req.resourceOwnerId!==req.actorId&&req.role!=='admin'&&req.role!=='support')return {allowed:false,reason:'Resource ownership mismatch',requiresConfirmation:false};
 if(req.tool==='commerce.order.read'&&req.role!=='admin')return {allowed:false,reason:'Commerce records require authorized administration',requiresConfirmation:false};
 return {allowed:true,reason:'Policy allows tool request; server must recheck authentication and ownership',requiresConfirmation:req.tool==='support.ticket.create'||req.tool==='team.message.draft'};
}
export type OpsAudit={requestId:string;actorId:string;tool:OpsTool;allowed:boolean;timestamp:string};
export function redactOpsAudit(req:OpsRequest,decision:OpsDecision,requestId:string):OpsAudit{return {requestId,actorId:req.actorId,tool:req.tool,allowed:decision.allowed,timestamp:new Date().toISOString()}}
 // No real MCP network transport, external account access, or automatic sending.
