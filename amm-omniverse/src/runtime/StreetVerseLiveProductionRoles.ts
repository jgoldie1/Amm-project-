/**
 * Safe integration contract for existing TRYAMM intelligent assistants and mod packs.
 * This is a role/permission plan, not evidence that any autonomous AGI exists.
 */
export type StreetVerseLiveAssistant='crossverse'|'stubbs-ai'|'middleverse-ai'|'lyons-tech-ai'|'jarvis'|'hologpt'
export type LiveProductionTask='check-consent'|'draft-rundown'|'queue-moderation'|'diagnose-stream'|'open-approved-panel'|'stage-mod-overlay'
export type LiveModKind='cosmetic'|'caption'|'accessibility'|'creator-overlay'
export type LiveProductionRequest={
  assistant:StreetVerseLiveAssistant
  task:LiveProductionTask
  sessionId:string
  operatorApproved:boolean
  providerCredentialsPresent?:boolean
  modifiesPayments?:boolean
  executesUntrustedCode?:boolean
  requestedMod?:LiveModKind
}
export const STREETVERSE_LIVE_PRODUCTION_ROLES:Record<StreetVerseLiveAssistant,readonly LiveProductionTask[]>={
  crossverse:['check-consent'],
  'stubbs-ai':['draft-rundown'],
  'middleverse-ai':['queue-moderation'],
  'lyons-tech-ai':['diagnose-stream'],
  jarvis:['open-approved-panel'],
  hologpt:['draft-rundown','open-approved-panel']
}
export const STREETVERSE_LIVE_MOD_POLICY={
  enabledInPublicByDefault:false,
  developerPackSandboxOnly:true,
  approvedKinds:['cosmetic','caption','accessibility','creator-overlay'] as readonly LiveModKind[],
  modsMayNotReadSecrets:true,
  modsMayNotBroadcastWithoutHostConsent:true,
  modsMayNotManipulatePayments:true,
  modsMayNotBypassModeration:true
} as const
export function authorizeLiveProductionRequest(request:LiveProductionRequest):{allowed:boolean;reason:string}{
  if(!request.sessionId||!request.operatorApproved)return{allowed:false,reason:'OPERATOR_APPROVAL_REQUIRED'}
  if(request.modifiesPayments||request.executesUntrustedCode)return{allowed:false,reason:'PROTECTED_ACTION'}
  if(request.providerCredentialsPresent)return{allowed:false,reason:'CREDENTIALS_NOT_ALLOWED_IN_AGENT_TASK'}
  if(request.task==='stage-mod-overlay'&&!request.requestedMod)return{allowed:false,reason:'MOD_REVIEW_REQUIRED'}
  if(!STREETVERSE_LIVE_PRODUCTION_ROLES[request.assistant]?.includes(request.task))return{allowed:false,reason:'TASK_NOT_GRANTED_TO_ASSISTANT'}
  return{allowed:true,reason:'AUTHORIZED_PLANNING_TASK_ONLY'}
}
