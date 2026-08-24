export type IntegrationTarget={id:string;label:string;region:string;category:string;mode:'native'|'api'|'share'|'inspiration';status:'existing'|'wire'|'credential-required'|'research'}

export const CORE_VERTICALS=[
  'Live + CreatorVerse','HoloVerse','HoloMusic','GameVerse','Ride','Delivery','Marketplace + BusinessVerse',
  'HoloGPT AI Ecosystem','HoloPay','OmniCare','EducationVerse','HoloHardware','Developer Ecosystem',
  'Omni Communications','Omni Box','StarVerse','PropertyVerse','SpaceOS','All American University','Holo Search','Holo Ads'
] as const

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
