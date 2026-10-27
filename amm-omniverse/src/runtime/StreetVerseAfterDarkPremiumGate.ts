/** StreetVerse optional After Dark premium narrative gate.
 * Entitlements must come from trusted server validation, never from client claims.
 * No purchases or content generation happens in this module.
 */
export type AfterDarkScene='romance-story'|'private-date'|'nightlife'|'cinematic-fade'
export type PremiumProof={
  ageAssured:boolean; adultLaneOptIn:boolean; jurisdictionAllows:boolean;
  consentCurrent:boolean; participantsAdults:boolean; noBlockedParticipants:boolean;
  serverEntitlementVerified:boolean; serverEntitlementActive:boolean;
}
export function checkAfterDarkPremium(scene:AfterDarkScene,proof:PremiumProof){
 const reasons:string[]=[]
 if(!proof.ageAssured||!proof.participantsAdults)reasons.push('adult_verification_required')
 if(!proof.adultLaneOptIn)reasons.push('adult_lane_opt_in_required')
 if(!proof.jurisdictionAllows)reasons.push('jurisdiction_blocked')
 if(!proof.consentCurrent||!proof.noBlockedParticipants)reasons.push('consent_or_safety_block')
 if(!proof.serverEntitlementVerified||!proof.serverEntitlementActive)reasons.push('verified_pass_required')
 return{allowed:reasons.length===0,reasons,scene,renderMode:scene==='cinematic-fade'?'fade_to_black':'non_explicit_story'}
}
export const AFTER_DARK_PREMIUM_RULES=Object.freeze({
 pricesConfigured:false,checkoutConnected:false,ageServiceConnected:false,
 serverSideEntitlementsOnly:true,explicitSexScenesEnabled:false,
 paidRealPersonIntimacy:false,paidSexualServices:false,
 publicGameplayDefault:'general-audience',separateAdultDiscovery:true,
 creatorAndPerformerConsentRequired:true,privateContentNotForReels:true
})
