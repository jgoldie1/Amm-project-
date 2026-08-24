export type HoloAdProduct={id:string;name:string;billing:'subscription'|'cpm'|'cpc'|'flat'|'revenue-share';audience:string;includes:string[];providerGated?:boolean}

export const HOLO_AD_PRODUCTS:HoloAdProduct[]=[
{id:'boost',name:'Creator & Business Boost',billing:'flat',audience:'creators and local businesses',includes:['feed placement','regional targeting','campaign analytics','CTA routing']},
{id:'network',name:'All American Network Sponsorship',billing:'flat',audience:'brands and businesses',includes:['channel sponsorship','show sponsorship','LIVE placement','creator integrations']},
{id:'marketplace',name:'Marketplace Sponsored Listing',billing:'cpc',audience:'vendors and service providers',includes:['search boost','category placement','local/global discovery','conversion tracking']},
{id:'diaspora',name:'Diaspora Market Campaign',billing:'cpm',audience:'cross-border and diaspora businesses',includes:['Nigeria/South Africa/Haiti lanes','diaspora audience segments','creator partnerships','localized language/currency creative']},
{id:'xr',name:'Holo XR Brand Experience',billing:'flat',audience:'brands, venues and creators',includes:['AR placement','VR/MR experience sponsorship','3D product showcase','StreetVerse event integration'],providerGated:true},
{id:'business-os',name:'Business OS Growth Suite',billing:'subscription',audience:'SMBs and organizations',includes:['Holo Ads','AI call center','marketplace','broadcasting','CRM/lead intents','analytics']},
]

let installed=false
export function installHoloAdsRevenueRuntime(){
 if(installed||typeof window==='undefined')return;installed=true
 const publish=()=>window.dispatchEvent(new CustomEvent('tryamm:holo-ads-products',{detail:{schema:'tryamm.holo.ads.v1',products:HOLO_AD_PRODUCTS,policy:{consent:'Use consent and platform policy for personalization.',sensitive:'Do not target or infer sensitive traits for ad delivery.',claims:'Advertisers remain responsible for truthful lawful claims.',billing:'Real campaign charges require an approved payment provider and server-confirmed payment state.'}}}))
 queueMicrotask(publish)
 window.addEventListener('tryamm:holo-ads-request',publish)
 window.addEventListener('tryamm:holo-ads-create-campaign',(e:Event)=>{
   const d=(e as CustomEvent<any>).detail||{}
   const product=HOLO_AD_PRODUCTS.find(p=>p.id===String(d.productId||''))
   window.dispatchEvent(new CustomEvent('tryamm:holo-ads-campaign-draft',{detail:{id:`ad-${Date.now()}`,product,market:d.market||'global',objective:d.objective||'awareness',status:'draft',billingStatus:'provider-gated'}}))
 })
 ;(window as any).__showHoloAds=()=>publish()
}
