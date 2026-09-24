export type IntelligenceLane =
  | 'local_chicago'
  | 'us_national'
  | 'africa_nigeria'
  | 'brics_emerging_markets'
  | 'global_international'
  | 'business_funding'
  | 'creator_economy'
  | 'mobility_logistics'
  | 'weather_environment'
  | 'public_safety'
  | 'sports_culture'
  | 'streetverse_missions'

export type NewsDesk =
  | 'local_news'
  | 'national_news'
  | 'international_news'
  | 'entertainment'
  | 'weather'
  | 'traffic'
  | 'sports'
  | 'business'
  | 'community'
  | 'public_safety'
  | 'creator_culture'

export type OraclePurpose =
  | 'sparrow_map'
  | 'streetverse_mission'
  | 'daily_brief'
  | 'business_opportunity'
  | 'mobility_routing'
  | 'environment_context'
  | 'public_alert'
  | 'newsroom'

export type VerificationState='unverified'|'corroborated'|'verified'|'official'

export type OracleSignal={
  id:string
  lane:IntelligenceLane
  desk:NewsDesk
  purposes:OraclePurpose[]
  headline:string
  summary:string
  region:string
  sourceName:string
  sourceType:'licensed_api'|'rss_atom'|'public_open_data'|'official_feed'|'community_submission'|'partner_push'|'simulation'
  sourceUrl?:string|null
  canonicalUrl?:string|null
  publishedAt?:string|null
  providerTimestamp?:string|null
  ingestedAt:string
  verification:VerificationState
  confidence:number
  freshness:number
  geo?:{lat:number;lng:number;precision:'city'|'neighborhood'|'block'|'point'}
  privacy:'public'|'consented'|'aggregated'|'simulation'
  live:boolean
  provider?:string|null
}

export const STREETVERSE_ORACLE_PROFILE={
  name:'TRYAMM StreetVerse Global Oracle',
  version:'1.0.0',
  mission:'Turn approved public, licensed, consented and simulated information into source-labeled context for Sparrow, StreetVerse and TRYAMM without granting unverified data live authority.',
  geographies:[
    'Chicago and Illinois',
    'United States',
    'Africa with Nigeria priority',
    'BRICS and emerging markets',
    'Global / international',
  ],
  lanes:[
    'local_chicago','us_national','africa_nigeria','brics_emerging_markets','global_international',
    'business_funding','creator_economy','mobility_logistics','weather_environment','public_safety',
    'sports_culture','streetverse_missions',
  ] as IntelligenceLane[],
  newsroomDesks:[
    'local_news','national_news','international_news','entertainment','weather','traffic',
    'sports','business','community','public_safety','creator_culture',
  ] as NewsDesk[],
  hostRoles:[
    'Local News Host',
    'National News Anchor',
    'International News Anchor',
    'Entertainment Host',
    'Weather Host / Meteorologist',
    'Traffic + Mobility Host',
    'Sports Host',
    'Business + Funding Host',
    'Community Correspondent',
    'Public Safety Desk Host',
    'Creator + Culture Host',
  ],
  outputs:[
    'Sparrow map signal',
    'StreetVerse mission seed',
    'daily brief',
    'business opportunity',
    'mobility context',
    'environment context',
    'verified public alert',
    'newsroom card',
  ],
  sourceRules:[
    'No source becomes live until its license, terms, attribution, retention and rate limits are recorded.',
    'Prefer official APIs, public open-data portals, licensed feeds and RSS/Atom over HTML scraping.',
    'Never bypass paywalls, robots controls, authentication, technical access controls or publisher restrictions.',
    'Do not ingest full copyrighted articles unless the license or site terms explicitly permit it.',
    'AI may summarize, cluster, translate and rank, but may not upgrade an unverified signal to verified.',
    'Public-safety partner feeds require a signed contract, server-side credentials, explicit permitted purposes and retention limits.',
    'No private-person tracking, private plate publication, doxxing, camera-avoidance routing or live tactical tracking.',
  ],
  retention:{
    rawSourcePayload:'shortest practical period; delete or irreversibly de-identify after normalization unless compliance requires retention',
    normalizedSignal:'retain only fields needed for product, audit, safety or legal requirements',
    preciseLocation:'only when source terms and product purpose permit it; otherwise reduce to neighborhood/city precision',
  },
} as const

export const ORACLE_PROVIDER_REGISTRY=[
  {id:'omni-news',label:'OmniNews licensed/public news',lane:'global_international',mode:'registered',live:false,requires:['approved source license','server ingestion','verification workflow']},
  {id:'weather',label:'Weather / environmental data',lane:'weather_environment',mode:'registered',live:false,requires:['approved provider','provider timestamps','attribution']},
  {id:'mobility',label:'Transit / traffic / logistics',lane:'mobility_logistics',mode:'registered',live:false,requires:['approved provider','freshness SLA','route-use terms']},
  {id:'civic-open-data',label:'Civic public open data',lane:'local_chicago',mode:'registered',live:false,requires:['dataset terms','freshness label','privacy review']},
  {id:'soundthinking-shotspotter',label:'SoundThinking ShotSpotter partner feed',lane:'public_safety',mode:'provider_gated',live:false,requires:['licensed agency/partner access','official push/API documentation','server-side authentication','purpose limitation','retention policy']},
] as const

const clamp=(value:number)=>Math.max(0,Math.min(1,value))

export function freshnessScore(publishedAt?:string|null,now=Date.now()){
  if(!publishedAt)return 0.25
  const ageHours=Math.max(0,(now-new Date(publishedAt).getTime())/36e5)
  if(ageHours<=1)return 1
  if(ageHours<=6)return .9
  if(ageHours<=24)return .75
  if(ageHours<=72)return .55
  if(ageHours<=168)return .35
  return .15
}

export function confidenceScore(input:{verification?:VerificationState;sourceType?:OracleSignal['sourceType'];corroborations?:number}){
  const verification=input.verification||'unverified'
  const base={unverified:.2,corroborated:.6,verified:.82,official:.92}[verification]
  const sourceBoost={
    licensed_api:.06,rss_atom:0,public_open_data:.04,official_feed:.08,
    community_submission:-.08,partner_push:.06,simulation:-.15,
  }[input.sourceType||'simulation']
  return clamp(base+sourceBoost+Math.min(.08,Math.max(0,input.corroborations||0)*.02))
}

export function normalizeOracleSignal(input:Partial<OracleSignal>&Pick<OracleSignal,'id'|'lane'|'headline'|'summary'|'region'|'sourceName'|'sourceType'>):OracleSignal{
  const publishedAt=input.publishedAt||null
  const verification=input.verification||'unverified'
  return {
    id:input.id,
    lane:input.lane,
    desk:input.desk||'international_news',
    purposes:input.purposes||['newsroom'],
    headline:String(input.headline).slice(0,240),
    summary:String(input.summary).slice(0,1200),
    region:String(input.region).slice(0,120),
    sourceName:String(input.sourceName).slice(0,160),
    sourceType:input.sourceType,
    sourceUrl:input.sourceUrl||null,
    canonicalUrl:input.canonicalUrl||input.sourceUrl||null,
    publishedAt,
    providerTimestamp:input.providerTimestamp||null,
    ingestedAt:input.ingestedAt||new Date().toISOString(),
    verification,
    confidence:input.confidence??confidenceScore({verification,sourceType:input.sourceType}),
    freshness:input.freshness??freshnessScore(publishedAt),
    geo:input.geo,
    privacy:input.privacy||'public',
    live:Boolean(input.live&&['verified','official'].includes(verification)&&input.privacy!=='simulation'),
    provider:input.provider||null,
  }
}
