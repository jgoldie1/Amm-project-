export type ControllerRiskInput={playerId:string;deviceId:string;sessionId:string;ipHash?:string;at:number;accepted:boolean;reason:string}
type Bucket={windowStart:number;attempts:number;rejects:number;bindingFailures:number;replays:number}
const buckets=new Map<string,Bucket>()
const WINDOW=10_000,MAX_ATTEMPTS=180,MAX_REJECTS=18,MAX_BINDING=4,MAX_REPLAYS=3
export function inspectControllerRisk(e:ControllerRiskInput){
 const key=e.sessionId+':'+e.deviceId
 let b=buckets.get(key)
 if(!b||e.at-b.windowStart>WINDOW)b={windowStart:e.at,attempts:0,rejects:0,bindingFailures:0,replays:0}
 b.attempts++;if(!e.accepted)b.rejects++;if(e.reason==='binding')b.bindingFailures++;if(e.reason==='replay')b.replays++;buckets.set(key,b)
 const revoke=b.bindingFailures>=MAX_BINDING||b.replays>=MAX_REPLAYS
 const throttle=b.attempts>MAX_ATTEMPTS||b.rejects>MAX_REJECTS
 return{allow:!revoke&&!throttle,revokeSession:revoke,throttle,risk:revoke?'critical':throttle?'high':b.rejects>5?'elevated':'normal',audit:{...e,ipHash:e.ipHash||'not-collected'}}
}
export const CONTROLLER_ABUSE_SHIELD={rawIpNotRequired:true,hashedNetworkSignalOptional:true,noLiveChatTrust:true,noPkTrust:true,automaticRevocation:true,rateLimitWindowMs:WINDOW,failClosedOnReplayAttack:true} as const
