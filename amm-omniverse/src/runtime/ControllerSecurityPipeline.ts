import {validateControllerInput,type ControllerInput,type ControllerSession} from './ControllerZeroTrustGuard'
import {inspectControllerRisk} from './ControllerAbuseShield'
export type ControllerDecision={accepted:boolean;reason:string;revokeSession:boolean;throttle:boolean}
export function secureControllerDecision(input:ControllerInput,session:ControllerSession,now=Date.now()):ControllerDecision{
 const base=validateControllerInput(input,session,now)
 const risk=inspectControllerRisk({playerId:input.playerId,deviceId:input.deviceId,sessionId:input.sessionId,at:now,accepted:base.ok,reason:base.reason})
 if(!base.ok)return{accepted:false,reason:base.reason,revokeSession:risk.revokeSession,throttle:risk.throttle}
 if(!risk.allow)return{accepted:false,reason:risk.revokeSession?'risk-revocation':'rate-limit',revokeSession:risk.revokeSession,throttle:risk.throttle}
 return{accepted:true,reason:'accepted',revokeSession:false,throttle:false}
}
export const CONTROLLER_SECURITY_PIPELINE={validateBeforeRiskDecision:true,serverDecisionRequiredBeforeMovement:true,failClosed:true,audiencePathExcluded:true} as const
