/**
 * New America / StreetVerse store-distribution planning contract.
 * Does not assert app-store approval or publish/build applications.
 * Keep sensitive adult-device workflows out of general-store launch bundles.
 */
export type ReleaseLane='mainstream-mobile'|'desktop-web'|'adult-separate-review'
export type LaunchFeature='chicago'|'new-america-music'|'sportverse'|'creator-studio'|'one-hand-access'|'romance-fade'|'intimate-device'|'adult-explicit'
const generalFeatures:LaunchFeature[]=['chicago','new-america-music','sportverse','creator-studio','one-hand-access','romance-fade']
export function checkStoreRelease(lane:ReleaseLane,features:LaunchFeature[],proof:{ageReviewed:boolean;rightsReviewed:boolean;mobileGameplayPassed:boolean;platformPolicyReviewed:boolean}){
 const blockers:string[]=[]
 if(!proof.rightsReviewed)blockers.push('rights_review_required')
 if(!proof.mobileGameplayPassed)blockers.push('gameplay_proof_required')
 if(!proof.platformPolicyReviewed)blockers.push('store_policy_review_required')
 if(lane==='mainstream-mobile'&&features.some(f=>!generalFeatures.includes(f)))blockers.push('adult_device_or_explicit_features_not_in_mobile_release')
 if(lane==='adult-separate-review'&&(!proof.ageReviewed||features.includes('adult-explicit')))blockers.push('separate_adult_distribution_review_required')
 return{ready:blockers.length===0,blockers,lane,publication:'manual_review_only' as const}
}
export const NEW_AMERICA_LAUNCH=Object.freeze({
 brand:'New America / StreetVerse',coreLoop:'Chicago mission -> music experience -> creator reel -> progression saved',
 storeBuildIncludesAdultDeviceAdapter:false,storeBuildAutoPublish:false,
 musicLicensesRequired:true,realDeviceEvidenceRequired:true,
})
