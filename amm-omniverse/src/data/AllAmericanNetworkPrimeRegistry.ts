export type NetworkDesk='local'|'national'|'international'|'business'|'crypto-education'|'weather'|'sports'|'culture'|'streetverse'|'faith'|'music'
export type NetworkProgram={id:string;title:string;desk:NetworkDesk;startHour:number;durationMinutes:number;format:'news'|'analysis'|'interview'|'education'|'live'|'magazine'|'weather'|'sports'|'music'|'faith';hostMode:'human'|'human-plus-ai';repeatable:boolean;description:string}

export const ALL_AMERICAN_24_7_CLOCK:NetworkProgram[]=[
 {id:'overnight-world',title:'World Overnight',desk:'international',startHour:0,durationMinutes:180,format:'news',hostMode:'human-plus-ai',repeatable:true,description:'Source-backed international headlines, overnight updates and replay packages.'},
 {id:'early-markets',title:'Early Business & Digital Assets',desk:'business',startHour:3,durationMinutes:120,format:'analysis',hostMode:'human-plus-ai',repeatable:true,description:'Business headlines plus cryptocurrency education and risk-focused market context. No personalized financial advice.'},
 {id:'morning-chicago',title:'All American Morning • Chicago',desk:'local',startHour:5,durationMinutes:180,format:'news',hostMode:'human',repeatable:true,description:'Local news, weather, transit, community, schools, business and StreetVerse Chicago.'},
 {id:'midday-america',title:'Midday America',desk:'national',startHour:8,durationMinutes:180,format:'magazine',hostMode:'human',repeatable:true,description:'National headlines, interviews, business, education and culture.'},
 {id:'streetverse-live',title:'StreetVerse LIVE',desk:'streetverse',startHour:11,durationMinutes:120,format:'live',hostMode:'human',repeatable:true,description:'Creators, missions, businesses, neighborhood stories, LIVE/PK and community coverage.'},
 {id:'crypto-classroom',title:'Crypto Classroom',desk:'crypto-education',startHour:13,durationMinutes:60,format:'education',hostMode:'human-plus-ai',repeatable:true,description:'Blockchain, wallets, custody, scams, stablecoins, smart contracts, regulation, taxes basics, volatility and security.'},
 {id:'business-showcase',title:'All American Business Showcase',desk:'business',startHour:14,durationMinutes:120,format:'interview',hostMode:'human',repeatable:true,description:'Founder stories, local businesses, property projects, OmniCare navigation and creator commerce.'},
 {id:'sports-culture',title:'Sports & Culture Live',desk:'sports',startHour:16,durationMinutes:120,format:'sports',hostMode:'human',repeatable:true,description:'SportsVerse, local sports, creator competitions, music and culture.'},
 {id:'evening-news',title:'All American Evening News',desk:'national',startHour:18,durationMinutes:90,format:'news',hostMode:'human',repeatable:true,description:'Local, national and international evening news with source cards and corrections.'},
 {id:'weather-desk',title:'Weather & Tomorrow',desk:'weather',startHour:19,durationMinutes:30,format:'weather',hostMode:'human-plus-ai',repeatable:true,description:'Source-labeled forecasts, alerts and tomorrow planning.'},
 {id:'all-american-tonight',title:'All American Tonight',desk:'culture',startHour:20,durationMinutes:120,format:'interview',hostMode:'human',repeatable:true,description:'Talk, interviews, entertainment, creator stories and audience interaction.'},
 {id:'musicverse-night',title:'MusicVerse Night Sessions',desk:'music',startHour:22,durationMinutes:90,format:'music',hostMode:'human',repeatable:true,description:'Artist showcases, radio, performances and rights-cleared music programming.'},
 {id:'faith-close',title:'Faith & Community Close',desk:'faith',startHour:23,durationMinutes:60,format:'faith',hostMode:'human',repeatable:true,description:'Faith, testimony, service and community programming in the protected faith lane.'},
]

export const CRYPTO_EDUCATION_SERIES=[
 {id:'crypto-101',title:'Crypto 101',lessons:['What a blockchain is','Why tokens exist','Public vs private keys','Wallet basics','What decentralization does and does not mean']},
 {id:'wallet-safety',title:'Wallet & Security',lessons:['Seed phrase safety','Hardware vs software wallets','Phishing and social engineering','Scam warning signs','Recovery planning']},
 {id:'stablecoins',title:'Stablecoins & Payments',lessons:['Stablecoin models','Reserves and counterparty risk','Cross-border uses','Fees and settlement','Depeg risk']},
 {id:'smart-contracts',title:'Smart Contracts',lessons:['How contracts execute','Gas and fees','Oracles','Common vulnerabilities','Why audits matter']},
 {id:'risk-regulation',title:'Risk, Rules & Taxes Basics',lessons:['Volatility','Liquidity risk','Custody risk','Regulatory basics','Tax-recordkeeping basics']},
] as const

export const ALL_AMERICAN_EDITORIAL_GUARDS={
 sourceAttributionRequired:true,
 unverifiedScraperResultsCannotBecomeBreakingNews:true,
 syntheticMediaDisclosureRequired:true,
 correctionsLogRequired:true,
 sponsorEditorialSeparation:true,
 humanPublishApprovalForAiSegments:true,
 cryptoEducationOnly:true,
 noGuaranteedReturns:true,
 noPersonalizedFinancialAdvice:true,
} as const