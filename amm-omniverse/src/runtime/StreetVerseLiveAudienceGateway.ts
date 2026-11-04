import type {StreamPlatform} from './UniversalCreatorStreamBridge'

/**
 * Platform-neutral, permission-gated gameplay events.
 * This module does NOT connect to an external platform or validate webhook signatures.
 * The server must authenticate the broadcaster, verify provider event signatures, and
 * deduplicate events before submitting them here. No financial event is accepted.
 */
export type AudienceAction='vote-next-mission'|'cheer'|'request-emote'|'join-queue'
export type AudienceEvent={
  platform:StreamPlatform;eventId:string;sessionId:string;actorId:string;
  action:AudienceAction;value:string;receivedAt:string;
  providerVerified:boolean;moderatorApproved:boolean
}
export type AudienceDecision={allowed:boolean;reason:string;action?:AudienceAction;value?:string}
export const STREETVERSE_AUDIENCE_POLICY={
  externalControlDefault:false,
  requireVerifiedProvider:true,
  requireModeratorApproval:true,
  requireActiveGameSession:true,
  platformGiftsNeverBuyGameOutcomes:true,
  gameControlsNeverExecuteArbitraryChat:true,
  neverCollectCredentialsFromChat:true
} as const
const ACTIONS:ReadonlySet<AudienceAction>=new Set(['vote-next-mission','cheer','request-emote','join-queue'])
const VALID_EMOTES=new Set(['wave','dance','thumbsup','clap','yes','no'])
const VALID_MISSIONS=new Set(['circle-park','taylor-street','studio-check-in','ride-share-demo'])
export function evaluateAudienceEvent(event:AudienceEvent,opts:{sessionId:string;enabled:boolean;allowedPlatforms:ReadonlySet<StreamPlatform>;seenIds:ReadonlySet<string>}):AudienceDecision{
  if(!opts.enabled)return{allowed:false,reason:'AUDIENCE_INTERACTION_DISABLED'}
  if(event.sessionId!==opts.sessionId)return{allowed:false,reason:'SESSION_MISMATCH'}
  if(!event.providerVerified)return{allowed:false,reason:'UNVERIFIED_PLATFORM_EVENT'}
  if(!event.moderatorApproved)return{allowed:false,reason:'MODERATOR_APPROVAL_REQUIRED'}
  if(!opts.allowedPlatforms.has(event.platform))return{allowed:false,reason:'PLATFORM_NOT_APPROVED'}
  if(!event.eventId||!event.actorId||opts.seenIds.has(event.platform+':'+event.eventId))return{allowed:false,reason:'DUPLICATE_OR_INVALID'}
  if(!ACTIONS.has(event.action))return{allowed:false,reason:'ACTION_NOT_ALLOWED'}
  if(event.action==='request-emote'&&!VALID_EMOTES.has(event.value))return{allowed:false,reason:'EMOTE_NOT_ALLOWED'}
  if(event.action==='vote-next-mission'&&!VALID_MISSIONS.has(event.value))return{allowed:false,reason:'MISSION_NOT_ALLOWED'}
  if(event.action==='join-queue'&&event.value!=='request')return{allowed:false,reason:'QUEUE_REQUEST_INVALID'}
  if(event.action==='cheer'&&event.value!=='cheer')return{allowed:false,reason:'CHEER_INVALID'}
  return{allowed:true,reason:'APPROVED',action:event.action,value:event.value}
}
/** Never dispatch a side effect before provider verification and session approval. */
export function publishApprovedAudienceEvent(event:AudienceEvent,decision:AudienceDecision){
  if(!decision.allowed||typeof window==='undefined')return false
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-live-audience-approved',{detail:{
    source:'streetverse-live-audience-gateway',platform:event.platform,
    eventId:event.eventId,sessionId:event.sessionId,action:decision.action,value:decision.value,
    financialReward:false,autoExecute:false
  }}))
  return true
}
