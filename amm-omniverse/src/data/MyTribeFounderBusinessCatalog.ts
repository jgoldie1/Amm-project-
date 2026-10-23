export const MY_TRIBE_FOUNDER_BUSINESSES = [
  {id:'accessible-product-shop',name:'Independent Living Product Shop',audiences:['mobility','stroke','all'],services:['approved affiliate product referrals','adaptive living guides'],requiresApproval:['affiliate seller terms'],worlds:['Chicago','Newerica','Global']},
  {id:'virtual-support',name:'MiddleVerse Accessible Virtual Office',audiences:['blind','Deaf','mobility','cognitive','all'],services:['email and chat support','remote scheduling','customer intake'],requiresApproval:['client agreement','privacy controls'],worlds:['Chicago','Newerica','Global']},
  {id:'caption-and-media',name:'Caption & Accessible Media Studio',audiences:['Deaf','hard-of-hearing','blind','all'],services:['captions and transcripts','audio description','accessible creator videos'],requiresApproval:['quality review','creator permissions'],worlds:['Chicago','Newerica','Global']},
  {id:'screen-reader-testing',name:'Blind-Led Accessibility Testing Studio',audiences:['blind','low-vision','all'],services:['screen reader usability feedback','voice-first navigation reviews','accessible document feedback'],requiresApproval:['tester training','clear scope (not automatic certification)'],worlds:['Chicago','Newerica','Global']},
  {id:'accessible-websites',name:'Accessible Websites & Digital Product Studio',audiences:['all'],services:['business templates','accessible storefront setup','digital courses and guides'],requiresApproval:['owner sign-off','secure checkout testing'],worlds:['Chicago','Newerica','Global']},
  {id:'own-idea',name:'Build Your Own Business',audiences:['all'],services:['custom approved business path'],requiresApproval:['regulatory review where applicable','owner sign-off'],worlds:['Chicago','Newerica','Global']},
] as const;
export const MY_TRIBE_CROSSVERSE_RULES = {
  marketplaceId:'stubbs-mobility360-my-tribe',
  ownerConsentRequired:true,
  membershipFree:true,
  realMoneyNeedsVerifiedServerRecord:true,
  storefrontCreationStatus:'planned',
  rpRpgStatus:'narrative discovery only until world placement and game backend verified',
  supportModes:['keyboard','screen-reader','captions','voice-friendly','reduced-motion','text-chat'],
  destinations:['StreetVerse Chicago','StreetVerse Newerica','StreetVerse Global Open World','CrossVerse','MiddleVerse'],
} as const;
