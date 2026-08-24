export type GrowthChannel={id:string;label:string;role:string;status:'source-ready'|'credential-required'|'external-account-required'}

export const QUANTUM_GROWTH_LANES:GrowthChannel[]=[
  {id:'ai-cafe',label:'AI Café',role:'Daily culture/content engine: creator interviews, coffee-table debates, music previews, campus/workforce stories, GameVerse watch parties and sponsor-ready shows.',status:'source-ready'},
  {id:'discord',label:'Discord Community',role:'Community command center for launch team, creators, gamers, students, faith/community rooms, beta testers, feedback, watch parties and events.',status:'external-account-required'},
  {id:'telegram',label:'Quantum Telegram',role:'Broadcast channels, opt-in groups, bot commands, multilingual launch alerts, creator drops, Holo Clip links, beta-tester coordination and community funnels.',status:'external-account-required'},
  {id:'zapier-mcp',label:'Quantum Zapier / Zapier MCP',role:'Automation bridge for approved external apps: route content, leads, launch alerts, creator submissions, support tickets and campaign events without hard-coding credentials into TRYAMM.',status:'credential-required'},
  {id:'social-share',label:'Share Once → Everywhere',role:'Package one approved Reel/Holo Clip with captions, translations, alt text, thumbnail and deep link for supported social destinations.',status:'source-ready'},
  {id:'network-tv',label:'TRYAMM Network TV',role:'Turn LIVE sessions into replay, TV episode, podcast, Holo Clip and campaign packages.',status:'source-ready'},
]

export const VIRAL_CONTENT_LOOP=[
  'create-one-source-asset',
  'generate-short-hook',
  'caption-and-translate',
  'accessibility-metadata',
  'publish-tryamm-first',
  'fanout-authorized-social-targets',
  'discord-community-drop',
  'telegram-broadcast-drop',
  'track-clicks-and-signups',
  'clip-best-community-reaction',
  'feed-reaction-back-into-next-post'
] as const

export const SAFETY_GATES={
  noSpam:true,
  noFakeEngagement:true,
  noMassDMWithoutConsent:true,
  noCredentialInSource:true,
  honorPlatformRateLimits:true,
  humanApprovalForHighRiskPosts:true,
  releaseBranchIsolation:true,
} as const
