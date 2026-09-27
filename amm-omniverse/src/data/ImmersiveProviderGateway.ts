import type {DeviceCommand} from './ImmersiveConsentEventRuntime'

export type ImmersiveProviderId='lovense'|'generic-haptics'
export interface ProviderDispatchContext{sessionId:string;adultVerified:boolean;consentVerified:boolean;privateSession:boolean}
export interface ProviderDispatchResult{accepted:boolean;provider:ImmersiveProviderId;reason?:string}

export interface ImmersiveProviderAdapter{
 id:ImmersiveProviderId
 dispatch(command:DeviceCommand,ctx:ProviderDispatchContext):Promise<ProviderDispatchResult>
 stop(ctx:ProviderDispatchContext):Promise<void>
}

export class ImmersiveProviderGateway{
 private providers=new Map<ImmersiveProviderId,ImmersiveProviderAdapter>()
 register(adapter:ImmersiveProviderAdapter){this.providers.set(adapter.id,adapter)}
 async dispatch(providerId:ImmersiveProviderId,command:DeviceCommand,ctx:ProviderDispatchContext){
  if(!ctx.adultVerified||!ctx.consentVerified||!ctx.privateSession)
   return{accepted:false,provider:providerId,reason:'consent-gate'} satisfies ProviderDispatchResult
  const provider=this.providers.get(providerId)
  if(!provider)return{accepted:false,provider:providerId,reason:'provider-unavailable'} satisfies ProviderDispatchResult
  return provider.dispatch(command,ctx)
 }
 async emergencyStop(providerId:ImmersiveProviderId,ctx:ProviderDispatchContext){
  await this.providers.get(providerId)?.stop(ctx)
 }
}

export const PROVIDER_GATEWAY_SECURITY={
 secrets:'Provider credentials/tokens never belong in browser bundles or world manifests.',
 transport:'Use authenticated server-side/provider-approved transport where required.',
 logging:'Log command class/result and consent audit reference, not intimate raw telemetry.',
 failure:'Provider timeout/error fails closed; never replay a stale command after consent changes.',
 stop:'Emergency stop is high priority and must not wait behind normal effect queues.',
 rateLimits:'Apply provider and per-session command rate limits to prevent runaway event loops.',
}
