/** Optional StreetVerse haptic capabilities registry.
 * Pure opt-in policy: never pairs with, scans, or controls a device.
 * No remote physical output or sexual-device commands are implemented.
 */
export type HapticClass='phone-vibration'|'gamepad-rumble'|'wearable-vest'|'xr-controller'|'adult-private-accessory'
export type HapticRequest={device:HapticClass;userInitiated:boolean;localOwnerApproved:boolean;enabled:boolean;ageAssured:boolean;adultLane:boolean;consentActive:boolean;stopControlAvailable:boolean;compatible:boolean;level:number;durationMs:number}
export function validateHapticRequest(r:HapticRequest){
 const blocked:string[]=[]
 if(!r.userInitiated||!r.enabled||!r.localOwnerApproved)blocked.push('local_opt_in_required')
 if(!r.consentActive||!r.stopControlAvailable)blocked.push('consent_or_stop_missing')
 if(!r.compatible)blocked.push('unsupported_device')
 if(!Number.isFinite(r.level)||r.level<0||r.level>0.3||!Number.isFinite(r.durationMs)||r.durationMs<0||r.durationMs>200)blocked.push('bounded_feedback_required')
 if(r.device==='adult-private-accessory')blocked.push('integration_not_enabled')
 if(r.device==='adult-private-accessory'&&(!r.ageAssured||!r.adultLane))blocked.push('adult_access_required')
 return{allowed:blocked.length===0,reasons:blocked,mode:'local_only' as const}
}
export const HAPTICS_POLICY=Object.freeze({
 allOffByDefault:true,automaticPairing:false,thirdPartySdkInstalled:false,
 remoteUserCommands:false,intimateDeviceOutputEnabled:false,
 paymentOrTipTriggeredActions:false,deviceIdsStored:false,
 immediateUserStopRequired:true,silentFallback:true
})
