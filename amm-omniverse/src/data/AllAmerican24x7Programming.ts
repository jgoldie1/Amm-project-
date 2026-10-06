export type NetworkProgramMode='human-live'|'human-recorded'|'replay'|'education'|'ai-assisted-disclosed'
export type NetworkChannelId='aan-main'|'aan-news'|'aan-business'|'aan-crypto-education'|'aan-streetverse'|'aan-music'|'aan-sports'|'aan-faith'
export type NetworkProgramSlot=Readonly<{
 id:string;channelId:NetworkChannelId;title:string;formatId:string;startMinute:number;durationMinutes:number;mode:NetworkProgramMode;
 hostRequired:boolean;sourceRequired:boolean;disclosure?:string;repeatable:boolean;
}>

export const ALL_AMERICAN_CHANNELS=[
 {id:'aan-main',label:'All American Network',purpose:'Flagship mixed programming and premieres.'},
 {id:'aan-news',label:'All American News',purpose:'Source-backed local, national, global, business and community news.'},
 {id:'aan-business',label:'All American Business',purpose:'Entrepreneurship, jobs, property, commerce and founder education.'},
 {id:'aan-crypto-education',label:'All American Crypto Education',purpose:'Blockchain and cryptocurrency education, safety, risk and market literacy.'},
 {id:'aan-streetverse',label:'StreetVerse LIVE',purpose:'Live neighborhood missions, creators, businesses and world events.'},
 {id:'aan-music',label:'MusicVerse TV/Radio',purpose:'Artist showcases, performances, interviews and radio simulcast.'},
 {id:'aan-sports',label:'SportsVerse Network',purpose:'Games, analysis, interviews, community sports and competitions.'},
 {id:'aan-faith',label:'Faith & Community',purpose:'Worship, teaching, service, testimony and community life.'},
] as const

export const CRYPTO_EDUCATION_TOPICS=[
 {id:'blockchain-basics',label:'Blockchain Basics',description:'Blocks, consensus, public ledgers, transactions and why networks differ.'},
 {id:'wallet-safety',label:'Wallet & Key Safety',description:'Custody, recovery phrases, phishing, hardware wallets and safe account hygiene.'},
 {id:'scam-watch',label:'Crypto Scam Watch',description:'Common fraud patterns, impersonation, rug-pull warning signs and verification habits.'},
 {id:'stablecoins',label:'Stablecoins Explained',description:'How stablecoins work, reserve models, settlement uses and risks.'},
 {id:'market-structure',label:'Crypto Market Structure',description:'Exchanges, order books, liquidity, custody, spreads, fees and volatility.'},
 {id:'payments',label:'Crypto & Payments',description:'Cross-border settlement concepts, payment rails, merchant use cases and compliance.'},
 {id:'regulation',label:'Rules, Taxes & Compliance Basics',description:'Educational overview of reporting, consumer protection and regulatory concepts; jurisdiction-specific advice requires a qualified professional.'},
 {id:'web3-builders',label:'Web3 Builder Lab',description:'Smart-contract concepts, token design risks, decentralized apps and security reviews.'},
] as const

export const CRYPTO_BROADCAST_RULES={
 educationalOnly:true,
 noPersonalizedInvestmentAdvice:true,
 noGuaranteedReturns:true,
 noPriceTargetsWithoutAttributedSource:true,
 noUndisclosedTokenPromotion:true,
 sponsorDisclosureRequired:true,
 sourceLinksAndTimestampsRequiredForNews:true,
 riskDisclosureRequired:true,
 syntheticHostDisclosureRequired:true,
 transactionsRemainProviderAndComplianceGated:true,
} as const

const SLOTS:NetworkProgramSlot[]=[
 {id:'midnight-replay',channelId:'aan-main',title:'Best of All American Network',formatId:'replay',startMinute:0,durationMinutes:120,mode:'replay',hostRequired:false,sourceRequired:false,repeatable:true},
 {id:'overnight-crypto',channelId:'aan-crypto-education',title:'Crypto Foundations Overnight',formatId:'crypto-education',startMinute:120,durationMinutes:90,mode:'education',hostRequired:false,sourceRequired:false,disclosure:'Educational only — not financial advice.',repeatable:true},
 {id:'overnight-streetverse',channelId:'aan-streetverse',title:'StreetVerse Replay',formatId:'streetverse-live',startMinute:210,durationMinutes:90,mode:'replay',hostRequired:false,sourceRequired:false,repeatable:true},
 {id:'morning-news',channelId:'aan-news',title:'All American Morning News',formatId:'all-american-news',startMinute:300,durationMinutes:120,mode:'human-live',hostRequired:true,sourceRequired:true,repeatable:false},
 {id:'morning-business',channelId:'aan-business',title:'Business & Money Morning',formatId:'business-showcase',startMinute:420,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:true,repeatable:false},
 {id:'crypto-classroom',channelId:'aan-crypto-education',title:'Crypto Classroom',formatId:'crypto-education',startMinute:510,durationMinutes:60,mode:'human-live',hostRequired:true,sourceRequired:true,disclosure:'Educational only — not financial advice.',repeatable:false},
 {id:'streetverse-day',channelId:'aan-streetverse',title:'StreetVerse Live From The World',formatId:'streetverse-live',startMinute:570,durationMinutes:150,mode:'human-live',hostRequired:true,sourceRequired:false,repeatable:false},
 {id:'musicverse-lunch',channelId:'aan-music',title:'MusicVerse Midday',formatId:'musicverse-live',startMinute:720,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:false,repeatable:false},
 {id:'creator-spotlight',channelId:'aan-main',title:'Creator Spotlight',formatId:'creator-spotlight',startMinute:810,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:false,repeatable:false},
 {id:'sports-afternoon',channelId:'aan-sports',title:'SportsVerse Afternoon',formatId:'sports-desk',startMinute:900,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:true,repeatable:false},
 {id:'business-prime',channelId:'aan-business',title:'All American Business Prime',formatId:'business-showcase',startMinute:990,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:true,repeatable:false},
 {id:'evening-news',channelId:'aan-news',title:'All American Evening News',formatId:'all-american-news',startMinute:1080,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:true,repeatable:false},
 {id:'prime-streetverse',channelId:'aan-streetverse',title:'StreetVerse Prime LIVE',formatId:'streetverse-live',startMinute:1170,durationMinutes:120,mode:'human-live',hostRequired:true,sourceRequired:false,repeatable:false},
 {id:'late-crypto',channelId:'aan-crypto-education',title:'Crypto Risk & Scam Watch',formatId:'crypto-education',startMinute:1290,durationMinutes:60,mode:'human-live',hostRequired:true,sourceRequired:true,disclosure:'Educational only — not financial advice.',repeatable:false},
 {id:'late-show',channelId:'aan-main',title:'All American Late Show',formatId:'creator-spotlight',startMinute:1350,durationMinutes:90,mode:'human-live',hostRequired:true,sourceRequired:false,repeatable:false},
]

export const ALL_AMERICAN_24H_TEMPLATE=Object.freeze(SLOTS)

export function slotAtMinute(minute:number){
 const m=((Math.floor(minute)%1440)+1440)%1440
 return ALL_AMERICAN_24H_TEMPLATE.find(s=>m>=s.startMinute&&m<s.startMinute+s.durationMinutes)||ALL_AMERICAN_24H_TEMPLATE[0]
}

export function minuteNow(date=new Date()){return date.getHours()*60+date.getMinutes()}