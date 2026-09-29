export type HoloLabKind='creator-ai'|'media'|'broadcast'|'game-world'|'commerce-ads'|'accessibility'|'robotics-hardware'|'education'|'research'
export type LabStage='idea'|'prototype'|'sandbox'|'review'|'pilot'|'production-candidate'|'retired'

export interface HoloLabProject{
 id:string; title:string; kind:HoloLabKind; stage:LabStage
 ownerId:string; testWorld?:string; productionTarget?:string
 requiresHumanReview:boolean; rightsReview:boolean; safetyReview:boolean
}

export const HOLO_LABS={
 id:'holo-labs',
 name:'Holo Labs',
 mission:'Build, test and certify TRYAMM experiments before production rollout.',
 labs:[
  {id:'ai-media',name:'AI Media Lab',focus:['original shows','reels','avatars','translation','captions','synthetic-media disclosure']},
  {id:'broadcast',name:'Broadcast Lab',focus:['TRYAMM TV','All American Network','Isaiah AI TV','News','StreetVerse Radio','StreetVerse Global','Holo LIVE']},
  {id:'world',name:'World Lab',focus:['StreetVerse cities','digital twins','missions','NPC systems','weather','mobility','CrossVerse']},
  {id:'ads',name:'Commerce & Holo Ads Lab',focus:['campaigns','inventory','ad slots','sponsorship','measurement','verified settlement']},
  {id:'access',name:'Accessibility Lab',focus:['one-hand controls','voice navigation','captions','translation','screen reader','adaptive interfaces']},
  {id:'hardware',name:'Hardware & Robotics Lab',focus:['Holo FON prototypes','wearables','robotics','fabrication concepts','vehicle interfaces']},
  {id:'academy',name:'Learning Lab',focus:['creator training','broadcast training','AI skills','cybersecurity challenges','career pathways']},
 ],
} as const

export const HOLO_LABS_PIPELINE=[
 'idea intake',
 'rights / consent / data review',
 'sandbox prototype',
 'automated tests',
 'human usability and accessibility review',
 'security / safety review',
 'limited pilot',
 'measure reliability, cost and value',
 'production-candidate review',
 'release through the appropriate TRYAMM surface',
] as const

export const HOLO_LABS_RULES={
 experimentsDoNotEqualProductionFeatures:true,
 noAutomaticProductionPromotion:true,
 humanApprovalRequired:true,
 privateUserDataMinimized:true,
 rawSensitiveDataHasDefinedRetention:true,
 likenessAndMediaRightsRequired:true,
 accessibilityReviewRequired:true,
 securityReviewRequired:true,
 hardwareClaimsRequirePhysicalValidation:true,
 regulatedOrSafetyCriticalUsesRequireQualifiedReview:true,
 commercialTransactionsUseServerVerifiedSettlement:true,
} as const
