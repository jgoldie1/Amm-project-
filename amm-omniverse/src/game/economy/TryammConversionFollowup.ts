export type FunnelStage='scan'|'landing'|'install'|'signup'|'passport-started'|'business-claim-started'|'verified-onboarding'|'first-eligible-purchase'|'repeat'
export type FollowupChannel='in-app'|'email'|'sms'|'push'

export interface ConversionEvent{
 id:string; anonymousJourneyId:string; userId?:string; businessId?:string; scoutId?:string
 campaignId?:string; qrId?:string; stage:FunnelStage; occurredAt:string; verified:boolean
}

export interface FollowupConsent{
 subjectId:string; channels:FollowupChannel[]; marketingAllowed:boolean
 transactionalAllowed:boolean; updatedAt:string
}

export interface FollowupCandidate{
 subjectId:string; lastStage:FunnelStage; lastActivityAt:string
 recommendedNextStep:string; eligibleChannels:FollowupChannel[]
}

export const CONVERSION_FUNNEL:FunnelStage[]=[
 'scan','landing','install','signup','passport-started','business-claim-started',
 'verified-onboarding','first-eligible-purchase','repeat'
]

export const FOLLOWUP_PLAYBOOK={
 scanWithoutInstall:'Show install/PWA reminder only when the person has an allowed reachable channel.',
 installWithoutSignup:'Explain Passport benefits and offer one-tap return to signup.',
 signupWithoutPassport:'Resume Passport at the last incomplete step.',
 businessClaimStarted:'Resume business verification without asking the owner to restart.',
 onboardedWithoutPurchase:'Show relevant tools such as storefront, ads, media, delivery or StreetVerse setup.',
 firstPurchaseWithoutRepeat:'Offer useful service reminders or loyalty benefits based on consent.',
} as const

export const CONVERSION_METRICS=[
 'scan-to-install','install-to-signup','signup-to-passport','business-claim-to-verification',
 'verification-to-first-value','first-value-to-repeat','revenue-per-verified-onboarding',
 'scout-qualified-conversion-rate','campaign-qualified-conversion-rate'
] as const

export const FOLLOWUP_RULES={
 noContactWithoutPermission:true,
 marketingRequiresConsent:true,
 transactionalMessagesSeparateFromMarketing:true,
 honorOptOutImmediately:true,
 frequencyCapsRequired:true,
 quietHoursRequired:true,
 noPurchasedContactLists:true,
 noSensitiveTraitTargeting:true,
 anonymousScansRemainAnonymousUntilUserVoluntarilyIdentifies:true,
 noCrossDeviceIdentityGuessing:true,
 resumeInsteadOfRestartWherePossible:true,
 scoutMaySeeAttributionStatusNotPrivateUserData:true,
 serverVerifiedConversionEvents:true,
 dataMinimizationAndRetentionRequired:true,
} as const

export const nextIncompleteStage=(events:ConversionEvent[])=>{
 const completed=new Set(events.filter(e=>e.verified).map(e=>e.stage))
 return CONVERSION_FUNNEL.find(stage=>!completed.has(stage))??'repeat'
}
