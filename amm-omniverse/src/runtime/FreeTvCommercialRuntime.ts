export type FreeTvCommercialKind='house-promo'|'sponsor-spot'|'creator-promo'|'business-spot'|'public-service'
export type FreeTvCommercialSpot={
  id:string
  title:string
  kind:FreeTvCommercialKind
  durationSeconds:15|30|60
  campaignId?:string
  advertiserId?:string
  mediaUrl?:string
  disclosure:'Advertisement'|'Sponsored'|'TRYAMM Promo'|'Public Service'
  status:'draft'|'approved'|'active'|'paused'
  rightsCleared:boolean
  ageAppropriate:boolean
}
export type FreeTvCommercialBreak={
  id:string
  showId:string
  afterMinute:number
  maxSeconds:number
  spots:FreeTvCommercialSpot[]
}
export type FreeTvCommercialPlan={
  showId:string
  showTitle:string
  durationMinutes:number
  freeAdSupported:true
  breaks:FreeTvCommercialBreak[]
  estimatedAdMinutes:number
  viewerPriceUsd:0
}

const KEY='tryamm.free-tv.commercials.v1'

const housePromos:FreeTvCommercialSpot[]=[
  {id:'promo-streetverse',title:'StreetVerse Chicago',kind:'house-promo',durationSeconds:15,disclosure:'TRYAMM Promo',status:'active',rightsCleared:true,ageAppropriate:true},
  {id:'promo-musicverse',title:'MusicVerse Radio + LIVE',kind:'house-promo',durationSeconds:15,disclosure:'TRYAMM Promo',status:'active',rightsCleared:true,ageAppropriate:true},
  {id:'promo-propertyverse',title:'PropertyVerse',kind:'house-promo',durationSeconds:15,disclosure:'TRYAMM Promo',status:'active',rightsCleared:true,ageAppropriate:true},
  {id:'promo-omnicare',title:'OmniCare 360',kind:'house-promo',durationSeconds:15,disclosure:'TRYAMM Promo',status:'active',rightsCleared:true,ageAppropriate:true},
  {id:'promo-business',title:'All American Marketplace',kind:'house-promo',durationSeconds:15,disclosure:'TRYAMM Promo',status:'active',rightsCleared:true,ageAppropriate:true},
]

function readCustom():FreeTvCommercialSpot[]{
  try{const raw=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(raw)?raw:[]}catch{return[]}
}
function saveCustom(spots:FreeTvCommercialSpot[]){try{localStorage.setItem(KEY,JSON.stringify(spots.slice(-200)))}catch{}}

function breakMinutes(duration:number){
  if(duration<=30)return [14]
  if(duration<=60)return [18,38]
  if(duration<=90)return [18,38,58,78]
  return [18,38,58,78,98]
}

export function buildFreeTvCommercialPlan(showId:string,showTitle:string,durationMinutes:number):FreeTvCommercialPlan{
  const custom=readCustom().filter(s=>s.status==='active'&&s.rightsCleared&&s.ageAppropriate)
  const pool=[...custom,...housePromos]
  const minutes=breakMinutes(durationMinutes).filter(x=>x<durationMinutes)
  const breaks=minutes.map((afterMinute,index)=>{
    const spots:FreeTvCommercialSpot[]=[]
    let total=0
    for(let i=0;i<pool.length&&total<120;i++){
      const spot=pool[(index+i)%pool.length]
      if(total+spot.durationSeconds>120)continue
      spots.push(spot);total+=spot.durationSeconds
    }
    return{id:showId+':break:'+String(index+1),showId,afterMinute,maxSeconds:120,spots}
  })
  const totalSeconds=breaks.reduce((sum,b)=>sum+b.spots.reduce((s,x)=>s+x.durationSeconds,0),0)
  return{showId,showTitle,durationMinutes,freeAdSupported:true,breaks,estimatedAdMinutes:Math.round((totalSeconds/60)*10)/10,viewerPriceUsd:0}
}

function emitPlan(plan:FreeTvCommercialPlan,reason:string){
  window.dispatchEvent(new CustomEvent('tryamm:free-tv-commercial-plan',{detail:{...plan,reason,serverVerificationRequired:true,noFakeImpressions:true}}))
}

export function installFreeTvCommercialRuntime(){
  if(typeof window==='undefined')return()=>{}
  let activePlan:FreeTvCommercialPlan|null=null

  const onPlan=(event:Event)=>{
    const d=(event as CustomEvent<{showId?:string;showTitle?:string;durationMinutes?:number}>).detail||{}
    activePlan=buildFreeTvCommercialPlan(String(d.showId||'aan-show'),String(d.showTitle||'All American Network'),Math.max(15,Number(d.durationMinutes||60)))
    emitPlan(activePlan,'plan')
  }
  const onSpotDraft=(event:Event)=>{
    const d=(event as CustomEvent<Partial<FreeTvCommercialSpot>>).detail||{}
    const custom=readCustom()
    const spot:FreeTvCommercialSpot={
      id:String(d.id||'spot-'+Date.now()),
      title:String(d.title||'Untitled commercial'),
      kind:(d.kind||'business-spot') as FreeTvCommercialKind,
      durationSeconds:([15,30,60].includes(Number(d.durationSeconds))?Number(d.durationSeconds):30) as 15|30|60,
      campaignId:d.campaignId?String(d.campaignId):undefined,
      advertiserId:d.advertiserId?String(d.advertiserId):undefined,
      mediaUrl:d.mediaUrl?String(d.mediaUrl):undefined,
      disclosure:d.disclosure||'Advertisement',
      status:'draft',
      rightsCleared:false,
      ageAppropriate:d.ageAppropriate!==false,
    }
    saveCustom([...custom,spot])
    window.dispatchEvent(new CustomEvent('tryamm:free-tv-commercial-draft',{detail:spot}))
  }
  const onBreak=(event:Event)=>{
    if(!activePlan)return
    const index=Math.max(0,Number((event as CustomEvent<{index?:number}>).detail?.index||0))
    const br=activePlan.breaks[index]||activePlan.breaks[0]
    if(!br)return
    window.dispatchEvent(new CustomEvent('tryamm:free-tv-commercial-break-start',{detail:{
      ...br,
      disclosureRequired:true,
      billing:'verified-delivery-only',
      revenueSettlement:'server-authoritative',
    }}))
  }

  addEventListener('tryamm:free-tv-commercial-plan-request',onPlan)
  addEventListener('tryamm:free-tv-commercial-draft-request',onSpotDraft)
  addEventListener('tryamm:free-tv-commercial-break-request',onBreak)
  return()=>{removeEventListener('tryamm:free-tv-commercial-plan-request',onPlan);removeEventListener('tryamm:free-tv-commercial-draft-request',onSpotDraft);removeEventListener('tryamm:free-tv-commercial-break-request',onBreak)}
}

export const FREE_TV_COMMERCIAL_MODEL={
  viewerPriceUsd:0,
  model:'free-ad-supported-tv',
  formats:['15-second','30-second','60-second','show-sponsor','creator-promo','business-spot','public-service'],
  surfaces:['tryamm-tv','all-american-network','holo-live','replay'],
  rules:['clear-disclosure','age-appropriate','rights-cleared','frequency-capped','verified-delivery-only','server-authoritative-revenue'],
} as const
