import type {DeviceCommand} from './ImmersiveConsentEventRuntime'

export type ImmersiveProviderId='lovense'|'generic-haptics'
export interface ProviderDispatchContext{sessionId:string;adultVerified:boolean;consentVerified:boolean;privateSession:boolean;emergencyStopAvailable:boolean;grantExpiresAt:number;grantRevoked:boolean}
export interface ProviderDispatchResult{accepted:boolean;provider:ImmersiveProviderId;reason?:string}

export interface ImmersiveProviderAdapter{
 id:ImmersiveProviderId
 connected?():Promise<boolean>
 dispatch(command:DeviceCommand,ctx:ProviderDispatchContext):Promise<ProviderDispatchResult>
 stop(ctx:ProviderDispatchContext):Promise<void>
}

export class ImmersiveProviderGateway{
 private providers=new Map<ImmersiveProviderId,ImmersiveProviderAdapter>()
 private stoppedSessions=new Set<string>()
 register(adapter:ImmersiveProviderAdapter){this.providers.set(adapter.id,adapter)}
 async dispatch(providerId:ImmersiveProviderId,command:DeviceCommand,ctx:ProviderDispatchContext){
  if(this.stoppedSessions.has(ctx.sessionId))return{accepted:false,provider:providerId,reason:'session-stopped'} satisfies ProviderDispatchResult
  if(!ctx.adultVerified||!ctx.consentVerified||!ctx.privateSession||!ctx.emergencyStopAvailable||ctx.grantRevoked||Date.now()>=ctx.grantExpiresAt)
   return{accepted:false,provider:providerId,reason:'consent-gate'} satisfies ProviderDispatchResult
  const provider=this.providers.get(providerId)
  if(!provider)return{accepted:false,provider:providerId,reason:'provider-unavailable'} satisfies ProviderDispatchResult
  if(provider.connected&&!(await provider.connected()))return{accepted:false,provider:providerId,reason:'provider-disconnected'} satisfies ProviderDispatchResult
  return provider.dispatch(command,ctx)
 }
 async emergencyStop(providerId:ImmersiveProviderId,ctx:ProviderDispatchContext){
  this.stoppedSessions.add(ctx.sessionId)
  await this.providers.get(providerId)?.stop(ctx)
 }
}

export const PROVIDER_GATEWAY_SECURITY={
 secrets:'Provider credentials/tokens never belong in browser bundles or world manifests.',
 transport:'Use authenticated server-side/provider-approved transport where required.',
 logging:'Log command class/result and consent audit reference, not intimate raw telemetry.',
 failure:'Provider timeout/error fails closed; never replay a stale command after consent changes.',
 stop:'Emergency stop is high priority, permanently closes that session gateway, and must not wait behind normal effect queues.',
 rateLimits:'Apply provider and per-session command rate limits to prevent runaway event loops.',
 expiry:'Every dispatch rechecks expiration/revocation and provider connectivity before hardware receives a command.',
}
