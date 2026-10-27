/** StreetVerse original next-generation feature compatibility/rollout gates.
 * Planning only: not XR rendering, holography, AI gameplay or online authority.
 */
export type Surface='flat'|'vr'|'ar'|'mr'|'holo-display'
export type Experience='emergent-world'|'creation-tools'|'living-npcs'|'sportverse'|'creator-media'|'persistent-world'|'adaptive-access'
export type FeatureCapability={surface:Surface;userOptIn:boolean;deviceSupported:boolean;oneHandAlternative:boolean;reducedMotionAlternative:boolean;consentForSensors:boolean;licensedAssets:boolean;testedOnDevice:boolean}
export function authorizeExperience(c:FeatureCapability){
 const reasons:string[]=[]
 if(!c.userOptIn)reasons.push('opt_in_required')
 if(!c.deviceSupported)reasons.push('device_unsupported')
 if(!c.oneHandAlternative||!c.reducedMotionAlternative)reasons.push('accessibility_fallback_missing')
 if(!c.licensedAssets)reasons.push('rights_not_cleared')
 if(!c.testedOnDevice)reasons.push('device_proof_missing')
 if(c.surface!=='flat'&&!c.consentForSensors)reasons.push('sensor_consent_required')
 return{ready:reasons.length===0,reasons,defaultSurface:'flat' as const}
}
export const ORIGINAL_GAMEPLAY_PILLARS:Readonly<Experience[]>=Object.freeze([
 'emergent-world','creation-tools','living-npcs','sportverse','creator-media','persistent-world','adaptive-access'
])
export const NEXT_GEN_RELEASE_POLICY=Object.freeze({
 defaultSurface:'flat',cameraOffByDefault:true,micOffByDefault:true,
 paidXRDependenciesAllowed:false,realMoneyRewardsWithoutServerProof:false,
 automaticWorldReplacement:false,unlicensedGameAssetsAllowed:false,
 physicalHolographicHardwareRequired:false
})
