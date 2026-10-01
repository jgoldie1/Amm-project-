export type ControllerInput={sessionId:string;playerId:string;deviceId:string;seq:number;issuedAt:number;action:string;value?:number;signature?:string}
export type ControllerSession={sessionId:string;playerId:string;deviceId:string;expiresAt:number;lastSeq:number;revoked:boolean}

export const CONTROLLER_ZERO_TRUST={
 serverAuthoritativeMovement:true,
 neverTrustClientPlayerId:true,
 bindSessionToPlayerAndDevice:true,
 rejectExpiredSession:true,
 rejectRevokedSession:true,
 rejectReplaySequence:true,
 rejectFutureOrStaleInput:true,
 rateLimitInput:true,
 validateAllowedActions:true,
 remoteAudienceCannotSendControllerInput:true,
 liveChatCannotSendControllerInput:true,
 pkEventsCannotSendControllerInput:true,
 rotateSessionOnReconnect:true,
 disconnectKillSwitch:true,
 auditRejectedInput:true
} as const

const ALLOWED=new Set(['move','look','jump','interact','vehicle-steer','vehicle-throttle','vehicle-brake','menu'])
export function validateControllerInput(input:ControllerInput,session:ControllerSession,now=Date.now()){
 if(session.revoked)return {ok:false,reason:'revoked'}
 if(input.sessionId!==session.sessionId||input.playerId!==session.playerId||input.deviceId!==session.deviceId)return {ok:false,reason:'binding'}
 if(now>session.expiresAt)return {ok:false,reason:'expired'}
 if(input.seq<=session.lastSeq)return {ok:false,reason:'replay'}
 if(Math.abs(now-input.issuedAt)>5000)return {ok:false,reason:'timestamp'}
 if(!ALLOWED.has(input.action))return {ok:false,reason:'action'}
 if(typeof input.value==='number'&&!Number.isFinite(input.value))return {ok:false,reason:'value'}
 return {ok:true,reason:'accepted'}
}
