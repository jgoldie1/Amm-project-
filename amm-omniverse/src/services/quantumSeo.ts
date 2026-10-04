export type SeoChannel='website'|'local-profile'|'marketplace'|'reels'|'live'|'streetverse'|'video'|'image'|'product'|'multilingual'
export type SeoTask={id:string;channel:SeoChannel;title:string;status:'todo'|'ready'|'blocked'|'done';evidence?:string}
export type QuantumSeoPlan={businessId:string;domain?:string;tasks:SeoTask[];score:number;blockers:string[]}

export const QUANTUM_SEO_RULES={
 whiteHatOnly:true,
 noFakeReviews:true,
 noLinkSchemes:true,
 noKeywordStuffing:true,
 noCloaking:true,
 structuredData:true,
 accessibilityAndPerformance:true,
 firstPartyAnalytics:true,
} as const

export function buildQuantumSeoPlan(input:{businessId:string;domain?:string;hasAnalytics?:boolean;hasBusinessProfile?:boolean;hasProducts?:boolean;hasVideo?:boolean;multilingual?:boolean}):QuantumSeoPlan{
 const tasks:SeoTask[]=[
  {id:'technical',channel:'website',title:'Technical SEO: crawlability, canonical URLs, sitemap, robots, metadata and performance',status:input.domain?'ready':'blocked'},
  {id:'schema',channel:'website',title:'Structured data for organization, products, services, events and local business',status:input.domain?'ready':'blocked'},
  {id:'local',channel:'local-profile',title:'Local profile consistency, categories, hours, services and verified business information',status:input.hasBusinessProfile?'ready':'todo'},
  {id:'marketplace',channel:'marketplace',title:'Marketplace titles, descriptions, product attributes and internal discovery',status:input.hasProducts?'ready':'todo'},
  {id:'reels',channel:'reels',title:'Reel captions, topics, transcripts, thumbnails and business calls-to-action',status:input.hasVideo?'ready':'todo'},
  {id:'live',channel:'live',title:'LIVE titles, event pages, replay metadata and commerce links',status:input.hasVideo?'ready':'todo'},
  {id:'streetverse',channel:'streetverse',title:'StreetVerse business location, category, services, mission hooks and digital-twin discovery',status:'ready'},
  {id:'multilingual',channel:'multilingual',title:'Localized pages and hreflang/country targeting where appropriate',status:input.multilingual?'ready':'todo'},
  {id:'analytics',channel:'website',title:'First-party search, conversion and attribution analytics',status:input.hasAnalytics?'ready':'todo'},
 ]
 const blockers=tasks.filter(t=>t.status==='blocked').map(t=>t.id)
 const ready=tasks.filter(t=>t.status==='ready'||t.status==='done').length
 return{businessId:input.businessId,domain:input.domain,tasks,score:Math.round(ready/tasks.length*100),blockers}
}

export const QUANTUM_SEO_VALUE='Search + discovery optimization across public web, TRYAMM surfaces and StreetVerse using verified business data, structured content and measurable conversion signals.'