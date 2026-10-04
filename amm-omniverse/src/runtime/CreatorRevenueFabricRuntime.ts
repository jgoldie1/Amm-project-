export type RevenueSurface=
  |'reel'
  |'live'
  |'world-object'
  |'business-passport'
  |'mission'
  |'campus-event'
  |'crossverse'
  |'omnibox-asset'
  |'venue'

export type RevenueChannel=
  |'product-sale'
  |'service-booking'
  |'event-ticket'
  |'subscription'
  |'verified-gift'
  |'sponsored-mission'
  |'creator-affiliate'
  |'scout-referral'
  |'asset-license'
  |'remix-license'
  |'virtual-rental'
  |'business-campaign'
  |'digital-twin-sponsorship'

export type RevenueAttribution={
  creatorId?:string
  merchantId?:string
  scoutId?:string
  sponsorId?:string
  sourceContentId?:string
  sourceVerse?:'streetverse'|'campusverse'|'crossverse'
  passportId?:string
  storeId?:string
}

export type RevenueIntent={
  schema:'tryamm.revenue.intent.v1'
  id:string
  surface:RevenueSurface
  channel:RevenueChannel
  attribution:RevenueAttribution
  itemId?:string
  missionId?:string
  eventId?:string
  assetId?:string
  currency?:string
  amountMinor?:number
  metadata?:Record<string,unknown>
  requiresServerVerification:true
  clientMayCreatePayableBalance:false
}

export type RevenueBundle={
  schema:'tryamm.revenue.bundle.v1'
  id:string
  title:string
  surface:RevenueSurface
  sourceId:string
  attribution:RevenueAttribution
  intents:RevenueIntent[]
  createdAt:string
}

declare global{
  interface Window{
    __TRYAMM_REVENUE_FABRIC__?:{
      version:string
      createBundle:(input:Omit<RevenueBundle,'schema'|'id'|'createdAt'>)=>RevenueBundle
      requestCheckout:(intent:RevenueIntent)=>void
      requestSponsoredMission:(detail:Record<string,unknown>)=>void
      requestRemixLicense:(detail:Record<string,unknown>)=>void
    }
  }
}

const uid=(prefix:string)=>prefix+'-'+Date.now()+'-'+Math.random().toString(36).slice(2,8)

function safeIntent(intent:RevenueIntent):RevenueIntent{
  return{
    ...intent,
    schema:'tryamm.revenue.intent.v1',
    requiresServerVerification:true,
    clientMayCreatePayableBalance:false,
    attribution:{...intent.attribution},
    amountMinor:Number.isFinite(intent.amountMinor)?Math.max(0,Math.floor(Number(intent.amountMinor))):undefined,
  }
}

export function installCreatorRevenueFabricRuntime(){
  if(typeof window==='undefined')return()=>{}
  if(window.__TRYAMM_REVENUE_FABRIC__)return()=>{}

  const createBundle=(input:Omit<RevenueBundle,'schema'|'id'|'createdAt'>):RevenueBundle=>{
    const bundle:RevenueBundle={
      schema:'tryamm.revenue.bundle.v1',
      id:uid('rev-bundle'),
      title:String(input.title||'TRYAMM Revenue Bundle').slice(0,160),
      surface:input.surface,
      sourceId:String(input.sourceId||'').slice(0,180),
      attribution:{...input.attribution},
      intents:(input.intents||[]).map(safeIntent),
      createdAt:new Date().toISOString(),
    }
    window.dispatchEvent(new CustomEvent('tryamm:revenue-bundle-created',{detail:bundle}))
    window.dispatchEvent(new CustomEvent('tryamm:crossverse-creator-publish',{detail:{
      schema:'tryamm.crossverse.creator.v1',
      creatorId:bundle.attribution.creatorId,
      passportId:bundle.attribution.passportId,
      origin:bundle.attribution.sourceVerse||'streetverse',
      contentType:'product',
      contentId:bundle.sourceId,
      monetizationEligible:bundle.intents.length>0,
      serverVerifiedValue:false,
    }}))
    return bundle
  }

  const requestCheckout=(intent:RevenueIntent)=>{
    const clean=safeIntent(intent)
    window.dispatchEvent(new CustomEvent('tryamm:commerce-intent-request',{detail:{
      ...clean,
      authority:'server',
      settlement:'transaction-orchestrator',
      attributionLocked:true,
    }}))
  }

  const requestSponsoredMission=(detail:Record<string,unknown>)=>{
    window.dispatchEvent(new CustomEvent('tryamm:sponsored-mission-request',{detail:{
      ...detail,
      source:'creator-revenue-fabric',
      rewardAuthority:'server-ledger',
      sponsorFundingRequired:true,
      creatorAttributionPreserved:true,
      scoutAttributionPreserved:true,
    }}))
  }

  const requestRemixLicense=(detail:Record<string,unknown>)=>{
    window.dispatchEvent(new CustomEvent('tryamm:remix-license-request',{detail:{
      ...detail,
      source:'creator-revenue-fabric',
      licenseAuthority:'server',
      originalCreatorAttributionRequired:true,
      derivativeRevenueShareRequiresVerifiedSettlement:true,
    }}))
  }

  const onReel=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:revenue-surface-available',{detail:{
      surface:'reel',
      sourceId:String(d.contentId||d.reelId||''),
      channels:['product-sale','event-ticket','subscription','verified-gift','creator-affiliate','remix-license'],
    }}))
  }

  const onLive=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:revenue-surface-available',{detail:{
      surface:'live',
      sourceId:String(d.roomId||d.sessionId||''),
      channels:['verified-gift','product-sale','event-ticket','subscription','business-campaign'],
    }}))
  }

  const onBusiness=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:revenue-surface-available',{detail:{
      surface:'business-passport',
      sourceId:String(d.passportId||d.storeId||''),
      channels:['product-sale','service-booking','creator-affiliate','scout-referral','business-campaign','digital-twin-sponsorship'],
    }}))
  }

  const onLensScan=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:scene-to-sale-candidate',{detail:{
      ...d,
      source:'quantum-holo-lens',
      checkoutRequiresVerifiedMerchant:true,
      priceAuthority:'authoritative-pricing-or-offer-service',
      attributionPreserved:true,
    }}))
  }

  window.addEventListener('tryamm:reel-published',onReel as EventListener)
  window.addEventListener('tryamm:live-session',onLive as EventListener)
  window.addEventListener('tryamm:business-passport-storefront-draft',onBusiness as EventListener)
  window.addEventListener('tryamm:business-lens-discovery',onLensScan as EventListener)

  window.__TRYAMM_REVENUE_FABRIC__={
    version:'1.0.0',
    createBundle,
    requestCheckout,
    requestSponsoredMission,
    requestRemixLicense,
  }

  window.dispatchEvent(new CustomEvent('tryamm:revenue-fabric-ready',{detail:{
    version:'1.0.0',
    multiChannelBundles:true,
    sceneToSale:true,
    sponsoredMissions:true,
    remixLicensing:true,
    virtualRentals:true,
    creatorAffiliate:true,
    scoutReferral:true,
    digitalTwinSponsorship:true,
    serverAuthoritativeSettlement:true,
  }}))

  return()=>{
    window.removeEventListener('tryamm:reel-published',onReel as EventListener)
    window.removeEventListener('tryamm:live-session',onLive as EventListener)
    window.removeEventListener('tryamm:business-passport-storefront-draft',onBusiness as EventListener)
    window.removeEventListener('tryamm:business-lens-discovery',onLensScan as EventListener)
    delete window.__TRYAMM_REVENUE_FABRIC__
  }
}
