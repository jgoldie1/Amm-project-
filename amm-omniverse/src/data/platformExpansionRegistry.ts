export type IntegrationTarget={id:string;label:string;region:string;category:string;mode:'native'|'api'|'share'|'inspiration';status:'existing'|'wire'|'credential-required'|'research'}

export type ExpansionModule={
  id:string
  label:string
  category:'creator'|'finance'|'workforce'|'education'|'faith'|'media'|'commerce'|'ai'
  status:'existing'|'wire'|'verify'|'planned'
  launchPriority:'launch'|'phase-2'|'phase-3'
  outcome:string
}

export const CORE_VERTICALS=[
  'Live + CreatorVerse','HoloVerse','HoloMusic','GameVerse','Ride','Delivery','Marketplace + BusinessVerse',
  'HoloGPT AI Ecosystem','HoloPay','OmniCare','EducationVerse','HoloHardware','Developer Ecosystem',
  'Omni Communications','Omni Box','StarVerse','PropertyVerse','SpaceOS','All American University','Holo Search','Holo Ads',
  'Omni Reel','Holo Credit','WorkVerse Services','Poyo AI','Faith Learning','All American Jobs'
] as const

// Canonical expansion registry. A module appearing here means it is part of the product/launch contract;
// status must remain verify/planned until its route, backend contract, persistence and production smoke test pass.
export const PLATFORM_EXPANSION_MODULES:ExpansionModule[]=[
  {id:'omni-reel',label:'Omni Reel',category:'media',status:'wire',launchPriority:'launch',outcome:'Short-form creator publishing, clips, green-screen layers, stickers, reusable media and creator monetization.'},
  {id:'omni-serials',label:'Omni Serialized Stories',category:'media',status:'planned',launchPriority:'phase-2',outcome:'Original mobile-first episodic movies and series with creator revenue sharing; inspired by the short-drama category without copying another service.'},
  {id:'poyo-ai',label:'Poyo AI',category:'ai',status:'planned',launchPriority:'phase-2',outcome:'A distinct AI creation and productivity lane that can feed creator, business, education and service workflows.'},
  {id:'holo-credit',label:'Holo Credit',category:'finance',status:'verify',launchPriority:'launch',outcome:'Credit-readiness, responsible financing discovery and transaction-linked financial education, gated behind compliance and verified providers.'},
  {id:'workverse-services',label:'WorkVerse Services Marketplace',category:'workforce',status:'planned',launchPriority:'launch',outcome:'Original freelance-services marketplace for gigs, contracts, portfolios, verified work, ratings, training and payouts.'},
  {id:'all-american-jobs',label:'All American Jobs',category:'workforce',status:'planned',launchPriority:'launch',outcome:'Connects platform demand to paid jobs, apprenticeships, creator work, remote work, local services and business staffing.'},
  {id:'aau-prek-phd',label:'All American University — Pre-K to PhD',category:'education',status:'verify',launchPriority:'launch',outcome:'One lifelong learning identity spanning early learning, K-12 support, college pathways, graduate study and continuing education.'},
  {id:'aau-trades',label:'All American University — Trades + Certifications',category:'education',status:'verify',launchPriority:'launch',outcome:'Job-linked trade training, certifications, skills verification and pathways from learning to paid work.'},
  {id:'pelo-hebrew',label:'Pelo Hebrew Learning',category:'faith',status:'planned',launchPriority:'phase-2',outcome:'Language learning with lessons, pronunciation practice, reading exercises and community study tools.'},
  {id:'faith-bible',label:'Faith Bible Experience',category:'faith',status:'planned',launchPriority:'phase-2',outcome:'A rights-cleared Bible reading, study, audio, learning and immersive education experience with source/translation provenance.'},
  {id:'creator-income-loop',label:'Creator Income Loop',category:'creator',status:'wire',launchPriority:'launch',outcome:'Connects live, reels, serialized media, marketplace sales, services, ads, sponsored missions and eligible rewards to auditable earnings.'},
  {id:'seller-growth-loop',label:'Seller + Customer Growth Loop',category:'commerce',status:'planned',launchPriority:'launch',outcome:'Recruit high-quality sellers, activate storefronts, drive discovery, convert customers and retain both sides through analytics and incentives.'},
]

export const REGIONAL_INTEGRATIONS:IntegrationTarget[]=[
  {id:'whatsapp',label:'WhatsApp',region:'Global',category:'Messaging/Commerce',mode:'api',status:'credential-required'},
  {id:'line',label:'LINE',region:'Japan/Thailand/Taiwan',category:'Messaging/Social',mode:'share',status:'wire'},
  {id:'wechat',label:'WeChat',region:'China',category:'Messaging/Commerce',mode:'api',status:'research'},
  {id:'douyin',label:'Douyin',region:'China',category:'Short Video',mode:'share',status:'research'},
  {id:'xiaohongshu',label:'Xiaohongshu / RED',region:'China',category:'Social/Commerce',mode:'share',status:'research'},
  {id:'bilibili',label:'Bilibili',region:'China',category:'Video/Community',mode:'share',status:'research'},
  {id:'qq',label:'QQ',region:'China',category:'Messaging/Community',mode:'share',status:'research'},
  {id:'kakao',label:'KakaoTalk',region:'South Korea',category:'Messaging/Social',mode:'share',status:'wire'},
  {id:'naver',label:'Naver',region:'South Korea',category:'Search/Content',mode:'inspiration',status:'research'},
  {id:'zalo',label:'Zalo',region:'Vietnam',category:'Messaging/Social',mode:'share',status:'wire'},
  {id:'grab',label:'Grab',region:'Southeast Asia',category:'Ride/Delivery/Payments',mode:'inspiration',status:'research'},
  {id:'gojek',label:'Gojek',region:'Southeast Asia',category:'Ride/Delivery/Payments',mode:'inspiration',status:'research'},
  {id:'paypay',label:'PayPay',region:'Japan',category:'Payments',mode:'inspiration',status:'research'},
  {id:'rakuten',label:'Rakuten',region:'Japan',category:'Commerce/Rewards',mode:'inspiration',status:'research'},
  {id:'mercari',label:'Mercari',region:'Japan',category:'Marketplace',mode:'inspiration',status:'research'},
]

export const SOCIAL_SHARE_TARGETS=['TikTok','Instagram','YouTube','Facebook','X','Threads','Snapchat','LinkedIn','WhatsApp','Telegram','LINE','KakaoTalk','Zalo'] as const
