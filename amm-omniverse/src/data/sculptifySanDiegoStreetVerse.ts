import type {UniversalMission} from './universalMissionRegistry'

export type SculptifyRpRole='wellness-host'|'academy-mentor'|'store-merchant'|'street-team'|'creator'
export type SculptifyDominanceTier='startup'|'neighborhood-anchor'|'district-leader'|'san-diego-powerhouse'|'global-wellness-partner'

export const SCULPTIFY_STREETVERSE_SAN_DIEGO={
  businessId:'sculptifyltd-san-diego',
  brandName:'SculptifyLTD',
  city:'San Diego',
  region:'California',
  country:'United States',
  world:'streetverse-global',
  category:'wellness',
  businessPassportRequired:true,
  merchantVerificationRequiredForCommerce:true,
  publicProfessionalEmailPreferred:true,
  surfaces:[
    'StreetVerse San Diego virtual storefront',
    'Business QR Passport',
    'HoloGPT concierge powered by Stubbs AI',
    'Sculptify Academy',
    'Sculptify Staffing',
    'Sculptify Store',
    'Template Studio',
  ],
  channels:['streetverse','marketplace','booking','reels','live','holo-ads','academy','staffing','templates'],
  route:'/streetverse?global=1&city=san-diego&business=sculptifyltd',
  partnerCode:'SV-SCULPTIFY-SD',
} as const

export const SCULPTIFY_RP_ROLES:{id:SculptifyRpRole;label:string;purpose:string;reputationTag:string}[]=[
  {id:'wellness-host',label:'Wellness Host',purpose:'Welcome visitors, explain approved services and guide them toward booking.',reputationTag:'sculptify-wellness-trust'},
  {id:'academy-mentor',label:'Academy Mentor',purpose:'Guide players through education, skills and verified training pathways.',reputationTag:'sculptify-academy-reputation'},
  {id:'store-merchant',label:'Store Merchant',purpose:'Run the virtual store, approved product discovery and owner-reviewed commerce.',reputationTag:'sculptify-commerce-reputation'},
  {id:'street-team',label:'Street Team Partner',purpose:'Grow StreetVerse through transparent QR referrals and verified activation, never raw-signup farming.',reputationTag:'sculptify-partner-reputation'},
  {id:'creator',label:'Creator / Storyteller',purpose:'Create original San Diego wellness, business and Academy media moments.',reputationTag:'sculptify-creator-reputation'},
]

export const SCULPTIFY_DOMINANCE_TIERS:{tier:SculptifyDominanceTier;minReputation:number;label:string;unlocks:string[]}[]=[
  {tier:'startup',minReputation:0,label:'Sculptify Startup',unlocks:['virtual storefront','Business QR Passport','starter missions']},
  {tier:'neighborhood-anchor',minReputation:250,label:'Neighborhood Anchor',unlocks:['featured local mission rotation','community collaboration missions']},
  {tier:'district-leader',minReputation:750,label:'Wellness District Leader',unlocks:['Academy mentor missions','staffing opportunity missions','district promotion eligibility']},
  {tier:'san-diego-powerhouse',minReputation:1800,label:'San Diego Wellness Powerhouse',unlocks:['city showcase events','premium creator collaboration eligibility','city business challenge missions']},
  {tier:'global-wellness-partner',minReputation:4000,label:'Global Wellness Partner',unlocks:['StreetVerse Global wellness exchange missions','multi-city template/business mentorship missions']},
]

export const SCULPTIFY_REPUTATION_EVENTS={
  verifiedServiceCompletion:40,
  verifiedStoreOrder:20,
  approvedAcademyCompletion:60,
  verifiedStaffingPlacement:80,
  verifiedStreetVerseActivation:25,
  approvedCreatorOutput:15,
  verifiedLocalBusinessCollaboration:50,
} as const

export const SCULPTIFY_PARTNER_REFERRAL_POLICY={
  referralCode:'SV-SCULPTIFY-SD',
  initialPartnerShareBps:500,
  shareBasis:'eligible-net-tryamm-platform-revenue',
  initialTermMonths:12,
  paysForRawScan:false,
  paysForRawSignup:false,
  verifiedActivationRequired:true,
  eligibleRevenueRequired:true,
  oneLevelOnly:true,
  selfReferralFiltered:true,
  duplicateReferralFiltered:true,
  fraudReviewRequired:true,
  refundsAndChargebacksReverseShare:true,
  serverAuthoritativeAttribution:true,
  serverAuthoritativeSettlement:true,
  clientCanEditShare:false,
  contractMayOverrideDefault:true,
  note:'The 5% starter share applies only to eligible net TRYAMM platform revenue attributed to a verified referred user, not to the merchant/creator gross sale. It is a proposed default until partner terms and payout infrastructure are activated.',
} as const

export function sculptifyDominanceTier(reputation:number){
  const safe=Math.max(0,Number.isFinite(reputation)?reputation:0)
  return [...SCULPTIFY_DOMINANCE_TIERS].reverse().find(item=>safe>=item.minReputation)??SCULPTIFY_DOMINANCE_TIERS[0]
}

export const SCULPTIFY_SAN_DIEGO_MISSIONS:UniversalMission[]=[
  {
    id:'sculptify-sd-grand-opening',
    world:'streetverse-global',
    title:'Sculptify San Diego: Grand Opening',
    summary:'Enter the Sculptify business twin, choose a real business role, complete a verified interaction and create a San Diego launch story.',
    rewardXp:420,
    route:SCULPTIFY_STREETVERSE_SAN_DIEGO.route,
    dynamic:true,
    coOp:true,
    consequenceTags:['sculptify-san-diego-open','sculptify-business-passport-active'],
    unlocks:['Sculptify Wellness District missions','Sculptify Street Team missions'],
    steps:[
      {id:'enter-store',label:'Enter Sculptify San Diego',detail:'Open the Sculptify StreetVerse San Diego business twin and review the storefront, Academy, Staffing and Store lanes.',action:'open-sculptify-san-diego',event:'manual'},
      {id:'choose-role',label:'Choose your Sculptify role',detail:'Pick how you want to help the business grow.',choices:[
        {id:'wellness-host',label:'WELLNESS HOST',detail:'Help a visitor understand approved services and move toward booking.',impactTags:['sculptify-wellness-trust']},
        {id:'academy-mentor',label:'ACADEMY MENTOR',detail:'Guide a visitor toward an approved learning/training pathway.',impactTags:['sculptify-academy-reputation']},
        {id:'store-merchant',label:'STORE MERCHANT',detail:'Help a visitor discover an approved product or package.',impactTags:['sculptify-commerce-reputation']},
        {id:'creator',label:'CREATOR',detail:'Create an original Sculptify San Diego media moment.',impactTags:['sculptify-creator-reputation']},
      ]},
      {id:'role-action',label:'Complete the role action',detail:'The mission waits for the matching Sculptify business interaction rather than rewarding a fake checklist.',choiceSourceStepId:'choose-role',actionByChoice:{'wellness-host':'open-sculptify-san-diego','academy-mentor':'open-sculptify-san-diego','store-merchant':'open-sculptify-san-diego',creator:'open-media-studio'},eventByChoice:{'wellness-host':'sculptify-booking-intent','academy-mentor':'sculptify-academy-intent','store-merchant':'sculptify-store-interaction',creator:'media-output'}},
      {id:'launch-story',label:'Create the Grand Opening story',detail:'Create an original Reel or media output documenting the launch, services, Academy, Store or community mission.',action:'open-media-studio',event:'media-output'},
      {id:'close-opening',label:'Close the Grand Opening',detail:'Finish the mission and save Sculptify San Diego as a persistent StreetVerse business consequence.',event:'manual'},
    ],
  },
  {
    id:'sculptify-sd-wellness-district',
    world:'streetverse-global',
    title:'Sculptify RP: Build the Wellness District',
    summary:'Grow positive StreetVerse dominance through service, education, commerce, community and creator choices.',
    rewardXp:620,
    route:SCULPTIFY_STREETVERSE_SAN_DIEGO.route,
    dynamic:true,
    coOp:true,
    requiresAnyTags:['sculptify-san-diego-open'],
    consequenceTags:['sculptify-wellness-district-grown'],
    unlocks:['Sculptify Academy to Career','San Diego Partner Run'],
    steps:[
      {id:'district-brief',label:'Open the Wellness District briefing',detail:'Return to Sculptify San Diego and choose the lane that will grow reputation.',action:'open-sculptify-san-diego',event:'manual'},
      {id:'choose-growth',label:'Choose the growth lane',detail:'Dominance is based on verified positive business impact, not pay-to-win or fake registrations.',choices:[
        {id:'service',label:'SERVICE',detail:'Help create a verified booking/service pathway.',impactTags:['sculptify-service-growth']},
        {id:'academy',label:'ACADEMY',detail:'Help a player enter a legitimate education pathway.',impactTags:['sculptify-academy-growth']},
        {id:'commerce',label:'STORE',detail:'Help with an approved product/store interaction.',impactTags:['sculptify-store-growth']},
        {id:'community',label:'COMMUNITY',detail:'Build a verified local business collaboration.',impactTags:['sculptify-community-growth']},
      ]},
      {id:'growth-action',label:'Prove the growth action',detail:'Complete the real business interaction tied to the selected lane.',choiceSourceStepId:'choose-growth',actionByChoice:{service:'open-sculptify-san-diego',academy:'open-sculptify-san-diego',commerce:'open-sculptify-san-diego',community:'open-sculptify-san-diego'},eventByChoice:{service:'sculptify-booking-intent',academy:'sculptify-academy-intent',commerce:'sculptify-store-interaction',community:'sculptify-business-collaboration'}},
      {id:'district-proof',label:'Create district proof',detail:'Create an original media recap or campaign asset showing the positive business/community result.',action:'open-media-studio',event:'media-output'},
      {id:'district-close',label:'Save district reputation',detail:'Finish the mission and carry the selected reputation tag into future StreetVerse missions.',event:'manual'},
    ],
  },
  {
    id:'sculptify-sd-academy-career',
    world:'streetverse-global',
    title:'Sculptify Academy: Learn → Practice → Opportunity',
    summary:'Turn education into an RP progression path without pretending a private certificate is government licensure or a simulated role is employment.',
    rewardXp:700,
    route:SCULPTIFY_STREETVERSE_SAN_DIEGO.route,
    dynamic:true,
    requiresAnyTags:['sculptify-wellness-district-grown'],
    consequenceTags:['sculptify-academy-career-loop'],
    unlocks:['staffing profile eligibility review','business template mentorship'],
    steps:[
      {id:'academy-enter',label:'Enter Sculptify Academy',detail:'Open the Sculptify Academy lane and choose an approved learning module.',action:'open-sculptify-san-diego',event:'sculptify-academy-intent'},
      {id:'practice',label:'Complete the practice mission',detail:'Complete a simulated business/wellness scenario. Real-world scope, credentials and hands-on requirements remain separate.',event:'sculptify-training-complete'},
      {id:'career-choice',label:'Choose the next opportunity',detail:'Choose employment/staffing review, entrepreneurship/template launch, or continued learning.',choices:[
        {id:'staffing',label:'STAFFING REVIEW',detail:'Prepare a profile for qualification/credential review.',impactTags:['sculptify-staffing-path']},
        {id:'business',label:'START A BUSINESS',detail:'Use the customizable template system to build a business draft.',impactTags:['sculptify-business-builder-path']},
        {id:'learn',label:'KEEP LEARNING',detail:'Continue into another approved module.',impactTags:['sculptify-mastery-path']},
      ]},
      {id:'career-action',label:'Complete the chosen next step',detail:'Advance through a verified staffing, business-builder or learning action.',choiceSourceStepId:'career-choice',actionByChoice:{staffing:'open-sculptify-san-diego',business:'open-sculptify-san-diego',learn:'open-sculptify-san-diego'},eventByChoice:{staffing:'sculptify-staffing-intent',business:'sculptify-template-intent',learn:'sculptify-academy-intent'}},
      {id:'career-close',label:'Save the Academy pathway',detail:'Finish the mission. Simulation does not itself grant employment, licensure or regulated-service authorization.',event:'manual'},
    ],
  },
  {
    id:'sculptify-sd-partner-run',
    world:'streetverse-global',
    title:'Sculptify Street Team: Verified Partner Run',
    summary:'Grow StreetVerse from Sculptify through transparent referral attribution that rewards verified activity, not raw scans or recruitment chains.',
    rewardXp:760,
    route:SCULPTIFY_STREETVERSE_SAN_DIEGO.route,
    dynamic:true,
    coOp:true,
    requiresAnyTags:['sculptify-wellness-district-grown'],
    consequenceTags:['sculptify-street-team-qualified'],
    unlocks:['city partner challenge missions','business partner leaderboard eligibility'],
    steps:[
      {id:'partner-brief',label:'Review the partner rules',detail:'Use Sculptify’s Business QR Passport and referral code. No reward is created for a raw scan or raw signup.',action:'open-sculptify-san-diego',event:'manual'},
      {id:'qr-share',label:'Share the transparent QR/referral',detail:'The player sees what StreetVerse is and chooses whether to join. No automatic account creation or hidden tracking.',event:'sculptify-referral-shared'},
      {id:'verified-activation',label:'Earn a verified activation',detail:'The mission advances only after server-side attribution confirms an eligible referred account activation.',event:'sculptify-referral-verified'},
      {id:'real-activity',label:'Generate real platform activity',detail:'The referred user completes an eligible StreetVerse activity. Cash commission remains separate and requires verified platform revenue.',event:'sculptify-referred-user-active'},
      {id:'partner-close',label:'Close the Partner Run',detail:'Record partner reputation. Any future commission is calculated server-side from declared partner terms and eligible net platform revenue.',event:'manual'},
    ],
  },
  {
    id:'sculptify-sd-city-showcase',
    world:'streetverse-global',
    title:'Sculptify San Diego: City Showcase',
    summary:'A high-tier co-op mission connecting wellness, creator media, local businesses, Academy and StreetVerse growth.',
    rewardXp:980,
    route:SCULPTIFY_STREETVERSE_SAN_DIEGO.route,
    dynamic:true,
    coOp:true,
    requiresAnyTags:['sculptify-street-team-qualified','sculptify-academy-career-loop'],
    consequenceTags:['sculptify-san-diego-showcase-complete'],
    unlocks:['future multi-city Sculptify/StreetVerse exchange'],
    steps:[
      {id:'showcase-open',label:'Open the City Showcase',detail:'Return to Sculptify San Diego and assemble a positive business/community showcase.',action:'open-sculptify-san-diego',event:'manual'},
      {id:'collab',label:'Complete a local collaboration',detail:'Connect Sculptify with another approved local StreetVerse business or creator.',event:'sculptify-business-collaboration'},
      {id:'showcase-media',label:'Create the showcase media',detail:'Create an original Reel/media artifact from the collaboration.',action:'open-media-studio',event:'media-output'},
      {id:'community-result',label:'Complete the community result',detail:'Finish a verified booking, Academy, Store, staffing or StreetVerse activation outcome from the showcase.',event:'sculptify-positive-outcome'},
      {id:'showcase-close',label:'Close the San Diego showcase',detail:'Finish and preserve the city reputation consequence for future multi-city missions.',event:'manual'},
    ],
  },
]
