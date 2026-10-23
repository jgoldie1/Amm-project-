/** TRYAMM unified social/world entry manifest.
 * Reuses existing modules; integrations marked pending are not claimed as live.
 */
export const TRYAMM_SOCIAL_WORLD_EXPERIENCE={
 id:'tryamm-social-world-v1',
 home:'social-feed',
 lanes:[
  {id:'reels',label:'REELS',route:'/reels',experience:'vertical-feed',status:'existing-route'},
  {id:'live',label:'LIVE',route:'/live',experience:'broadcast',status:'existing-route'},
  {id:'panels',label:'LIVE Panels',route:'/live',experience:'3-to-20-creator-panel',status:'backend-exists-device-verification-needed'},
  {id:'omega',label:'OMEGA PK',route:'/crossverse-live.html',experience:'global-ranked-and-creative-events',status:'preview-requires-server-verified-results'},
  {id:'streetverse',label:'StreetVerse',route:'/streetverse-living-district.html',experience:'roleplay-and-city-economy',status:'prototype'},
  {id:'holo',label:'HoloVerse',route:'/holoverse',experience:'immersive-world',status:'verify-runtime'},
  {id:'radio',label:'Radio',route:'/holo-radio-streetverse.html',experience:'licensed-audio',status:'existing-route'},
  {id:'network',label:'All American Network',route:'/network',experience:'broadcast-channels',status:'existing-route'},
  {id:'commerce',label:'Marketplace',route:'/streetverse-business.html',experience:'creator-commerce',status:'payment-verification-required'},
 ] as const,
 crossVerse:{source:'CrossVerseLivePK',roomAuthority:'api/live/panel.js',spectatorCannotChangeScores:true,giftsMustBeVerified:true,resultsMustBeServerAuthoritative:true},
 immersive:{modes:['mobile-2d','web-3d','vr-xr-ready-adapter'],actualVRHardwareVerified:false,spatialAvatarsVerified:false,deviceConsentRequired:true},
 economy:{realMoneyRequiresVerifiedPayment:true,noClientSidePayouts:true,fictionalGameCreditsSeparate:true,serverLedger:'edge-earnings-ledger'},
 creator:{replayToReels:'requires-consent-and-processing',socialEmbeds:'platform-permission-required',mediaRightsRequired:true,translationCaptionsRequired:true},
 accessibility:{touchTargetsAtLeast44px:true,captions:true,oneHandFlow:true,reducedMotion:true},
} as const
export function getTryammSocialWorldEntry(id:string){return TRYAMM_SOCIAL_WORLD_EXPERIENCE.lanes.find(x=>x.id===id)||null}
