/** All American App Store + CrossVerse independent distribution gate.
 * Approval policy only. Does not distribute binaries, process payments,
 * bypass OS protections, or assert that a processor accepts the product.
 */
export type Channel='own-web-store'|'desktop-download'|'vr-device-store'|'mobile-platform-store'
export type ProductLane='general'|'mature-story'|'adult-device'
export type DistributionProof={
  ageAssured:boolean;adultOptIn:boolean;regionAllowed:boolean;contentReviewed:boolean;
  processorApproved:boolean;deviceVendorApproved:boolean;binarySigned:boolean;malwareScanned:boolean;
  artifactChecksumVerified:boolean;licenseReviewed:boolean;privacyReviewed:boolean;
  platformTermsReviewed:boolean;consentRevocable:boolean;uninstallAndStopAvailable:boolean;
}
export function assessCrossVerseDistribution(channel:Channel,lane:ProductLane,p:DistributionProof){
 const blocks:string[]=[]
 if(!p.contentReviewed||!p.licenseReviewed||!p.privacyReviewed)blocks.push('content_rights_privacy_review_missing')
 if(!p.platformTermsReviewed)blocks.push('distribution_terms_not_reviewed')
 if(!p.binarySigned||!p.malwareScanned||!p.artifactChecksumVerified)blocks.push('binary_integrity_unverified')
 if(!p.processorApproved)blocks.push('payment_processor_not_approved')
 if(lane!=='general'&&(!p.ageAssured||!p.adultOptIn||!p.regionAllowed))blocks.push('adult_eligibility_missing')
 if(lane==='adult-device'&&(!p.deviceVendorApproved||!p.consentRevocable||!p.uninstallAndStopAvailable))blocks.push('device_safety_unverified')
 if(lane==='adult-device'&&channel==='mobile-platform-store')blocks.push('adult_device_mainstream_channel_blocked')
 return{eligibleForHumanReview:blocks.length===0,blocks,mayAutoPublish:false,requiresRealProviderVerification:true}
}
export const STORE_DELIVERY_DESIGN=Object.freeze({
 productsSeparatedByAgeLane:true,mainstreamBundleContainsAdultDeviceCode:false,
 verifiedDownloadsOnly:true,automaticSideload:false,hiddenUnlocks:false,
 separateCrossVerseConsents:true, paymentsServerVerified:true,
 deviceOutputLocalOptIn:true,privacyMinimization:true
})
