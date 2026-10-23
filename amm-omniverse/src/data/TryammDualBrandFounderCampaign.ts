/** Two-brand founder campaign: planned cohorts, never invented enrolled business owners. */
export const TRYAMM_DUAL_BRAND_CAMPAIGN={
 operator:'TRYAMM LLC',
 brands:[
  {id:'newumerica',name:'BJ Stubbs Newumerica',site:'/newumerica-tech-superstore.html',audience:'gamers and creators',offer:['VR and MR accessory concepts','computer gear concepts','private-label techwear','Omni deck and digital goods'],status:'catalog-preview'},
  {id:'mobility360',name:'Stubbs Mobility 360',site:'/mobility360.html',audience:'people seeking accessible independent-living tools',offer:['51 research-stage product concepts in ten departments','adaptive daily-living guides','accessible comparison tools'],status:'research-preview-no-approved-products'},
 ],
 communityPrograms:[
  {id:'founders-20',name:'20 Founding Businesses',slots:20,filledVerified:0,focus:'entrepreneurship onboarding and business-in-a-box',state:'recruiting-plan'},
  {id:'access-founders-10',name:'10 Disability-Owned Business Launches',slots:10,filledVerified:0,focus:'accessible e-commerce and remote-service businesses',state:'recruiting-plan'},
 ],
 sharedServices:['business-passports','MiddleVerse remote services','accessible web templates','Holo Ads','CrossVerse creator distribution','server-verified marketplace','customer support'],
 guardrails:{separateMerchants:true,separateProductClaims:true,separateTaxesAndBooks:true,consentBeforePublicFounderListing:true,noGuaranteedEarnings:true,noDisabilityEligibilityAssumptions:true,accessibleWorkflows:true,checkoutMustBeVerified:true}
} as const
