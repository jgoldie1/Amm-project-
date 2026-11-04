export type HoloAdProduct={id:string;name:string;billing:'subscription'|'cpm'|'cpc'|'flat'|'revenue-share';audience:string;includes:string[];providerGated?:boolean}

export const HOLO_AD_PRODUCTS:HoloAdProduct[]=[
{id:'boost',name:'Creator & Business Boost',billing:'flat',audience:'creators and local businesses',includes:['feed placement','regional targeting','campaign analytics','CTA routing']},
{id:'network',name:'All American Network Sponsorship',billing:'flat',audience:'brands and businesses',includes:['channel sponsorship','show sponsorship','LIVE placement','creator integrations']},
{id:'marketplace',name:'Marketplace Sponsored Listing',billing:'cpc',audience:'vendors and service providers',includes:['search boost','category placement','local/global discovery','conversion tracking']},
{id:'diaspora',name:'Diaspora Market Campaign',billing:'cpm',audience:'cross-border and diaspora businesses',includes:['Nigeria/South Africa/Haiti lanes','diaspora audience segments','creator partnerships','localized language/currency creative']},
{id:'xr',name:'Holo XR Brand Experience',billing:'flat',audience:'brands, venues and creators',includes:['AR placement','VR/MR experience sponsorship','3D product showcase','StreetVerse event integration'],providerGated:true},
{id:'business-os',name:'Business OS Growth Suite',billing:'subscription',audience:'SMBs and organizations',includes:['Holo Ads','AI call center','marketplace','broadcasting','CRM/lead intents','analytics']},
]

import {TRYAMM_PLACEMENT_SURFACES,type PlacementSurface} from './TryammPlacementBriefRuntime'
export type HoloAdDraftInput={productId?:string;market?:string;objective?:string;advertiserName?:string;productName?:string;concept?:string;surfaces?:string[]}
const sanitized=(v:unknown,max:number)=>String(v??'').replace(/[<>\u0000-\u001f]/g,'').trim().slice(0,max)
/** Client preview only; no inventory reservation, payment or automatic publication. */
export function prepareHoloAdDraft(input:HoloAdDraftInput){
 const product=HOLO_AD_PRODUCTS.find(p=>p.id===input.productId)
 if(!product)return null
 const allowed=new Set<string>(TRYAMM_PLACEMENT_SURFACES.map(s=>s.id))
 const surfaces:PlacementSurface[]=Array.isArray(input.surfaces)
  ?Array.from(new Set(input.surfaces.filter((s):s is PlacementSurface=>typeof s==='string'&&allowed.has(s)))).slice(0,5):[]
 return{
  id:'ad-draft-'+Date.now(),product,
  market:sanitized(input.market||'global',90),objective:sanitized(input.objective||'awareness',100),
  advertiserName:sanitized(input.advertiserName,90),
  productName:sanitized(input.productName||input.concept,100),
  surfaces,status:'draft' as const,persisted:false as const,published:false as const,
  billingStatus:'provider-gated' as const,serverVerified:false as const,billable:false as const,
  rightsStatus:'review-required' as const,disclosure:'ADVERTISEMENT (draft only)' as const
 }
}

let installed=false
export function installHoloAdsRevenueRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:holo-ads-products',{detail:{schema:'tryamm.holo.ads.v1',products:HOLO_AD_PRODUCTS,policy:{consent:'Use consent and platform policy for personalization.',sensitive:'Do not target or infer sensitive traits for ad delivery.',claims:'Advertisers remain responsible for truthful lawful claims.',billing:'Real campaign charges require an approved payment provider and server-confirmed payment state.'}}}))
 queueMicrotask(publish)
 window.addEventListener('tryamm:holo-ads-request',publish)
 window.addEventListener('tryamm:holo-ads-create-campaign',(e:Event)=>{
   const d=(e as CustomEvent<HoloAdDraftInput>).detail||{}
   const draft=prepareHoloAdDraft(d)
   if(!draft){
     window.dispatchEvent(new CustomEvent('tryamm:holo-ads-campaign-rejected',{detail:{reason:'unsupported_holo_ads_product'}}))
     return
   }
   // Preview-only draft data is neither stored in a campaign service nor billed.
   window.dispatchEvent(new CustomEvent('tryamm:holo-ads-campaign-draft',{detail:draft}))
 })
 ;(window as any).__showHoloAds=()=>publish()
}
