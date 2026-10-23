/** TRYAMM LLC umbrella launch map. This software manifest does not create legal entities or licenses. */
export const TRYAMM_LLC_LAUNCH_MAP={
 operator:{legalName:'TRYAMM LLC',entityVerification:'official-record-review-required',einDisplay:'never-publish',ownerAuthority:'verify-before-monetization'},
 worlds:[
  {id:'streetverse',kind:'game-and-social-world',entry:'/streetverse-living-district.html'},
  {id:'holoverse',kind:'immersive-xr-and-construct',entry:'/holoverse'},
  {id:'metaverse',kind:'shared-avatar-and-experiences',entry:'/streetverse-city-arrivals.html'},
  {id:'middleverse',kind:'work-and-business-services',entry:'/streetverse-business.html'},
  {id:'multiverse',kind:'cross-world-navigation-and-media',entry:'/crossverse-live.html'},
  {id:'crossverse',kind:'global-live-streaming',entry:'/crossverse-live.html'},
  {id:'musicverse',kind:'music-and-radio',entry:'/holo-radio-streetverse.html'},
  {id:'faithverse',kind:'faith-content-with-separate-monetization-controls',entry:'/streetverse-living-district.html'}
 ],
 flagship:{id:'bj-stubbs-newumerica',entry:'/bj-stubbs-store.html',state:'catalog-preview'},
 operatingControls:{
  businessOnboarding:['owner-approval','business-passport','merchant-KYC','bank-ownership-verification','product-rights','tax-setup'],
  commerce:['approved-price','verified-checkout','signed-webhook','server-entitlement','refund-dispute-handling','payout-reconciliation'],
  creatorEconomy:['creator-contract','revenue-share-terms','moderation','copyright-licenses','payment-compliance'],
  infrastructure:['tenant-isolation','least-privilege-access','backups','restore-test','cost-budget','security-monitoring'],
  gameplay:['age-rating','accessibility','xr-device-consent','player-safety','fictional-currency-separation'],
 },
 realWorldCompliance:{registeredAgent:'verify',annualFiling:'verify',beneficialOwnership:'check-current-rules',salesTax:'jurisdiction-specific',privacyPolicy:'draft-required',terms:'draft-required',digitalRefundPolicy:'draft-required',musicAndStreamingLicenses:'verify'},
 launchGates:{entityVerified:false,merchantVerified:false,productionPaymentsVerified:false,globalXRVerified:false,individualBusinessesLaunched:false},
} as const
