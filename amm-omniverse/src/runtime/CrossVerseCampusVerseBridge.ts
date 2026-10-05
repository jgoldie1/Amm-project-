export type TryammVerse='streetverse'|'campusverse'|'crossverse'

export type CrossVerseTravelDetail={
  from:TryammVerse
  to:TryammVerse
  destination?:string
  campusId?:string
  source?:string
  playerId?:string
  creatorId?:string
  passportId?:string
}

export type CrossVerseCreatorEnvelope={
  schema:'tryamm.crossverse.creator.v1'
  creatorId?:string
  playerId?:string
  passportId?:string
  origin:TryammVerse
  contentType:'reel'|'live'|'mission'|'product'|'asset'|'campus-event'
  contentId?:string
  omniBoxId?:string
  missionId?:string
  ledgerRef?:string
  monetizationEligible:boolean
  serverVerifiedValue:boolean
}

const BRIDGE_VERSION='1.0.0'

const safeText=(value:unknown,max=160)=>String(value??'').replace(/[<>]/g,'').slice(0,max)

function normalizeTravel(detail:CrossVerseTravelDetail){
  return{
    from:detail.from,
    to:detail.to,
    destination:safeText(detail.destination),
    campusId:safeText(detail.campusId),
    source:safeText(detail.source||'crossverse-campusverse-bridge'),
    playerId:safeText(detail.playerId),
    creatorId:safeText(detail.creatorId),
    passportId:safeText(detail.passportId),
  }
}

function normalizeCreator(detail:Partial<CrossVerseCreatorEnvelope>):CrossVerseCreatorEnvelope{
  return{
    schema:'tryamm.crossverse.creator.v1',
    creatorId:safeText(detail.creatorId),
    playerId:safeText(detail.playerId),
    passportId:safeText(detail.passportId),
    origin:detail.origin||'streetverse',
    contentType:detail.contentType||'reel',
    contentId:safeText(detail.contentId),
    omniBoxId:safeText(detail.omniBoxId),
    missionId:safeText(detail.missionId),
    ledgerRef:safeText(detail.ledgerRef),
    monetizationEligible:Boolean(detail.monetizationEligible),
    serverVerifiedValue:Boolean(detail.serverVerifiedValue),
  }
}

export function installCrossVerseCampusVerseBridge(){
  if(typeof window==='undefined')return()=>{}
  const w=window as typeof window & {__TRYAMM_CROSSVERSE_CAMPUSVERSE_BRIDGE__?:{version:string}}

  if(w.__TRYAMM_CROSSVERSE_CAMPUSVERSE_BRIDGE__)return()=>{}

  const forwardCampusTravel=(event:Event)=>{
    const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const travel=normalizeTravel({
      from:'streetverse',
      to:'campusverse',
      destination:String(detail.destination??detail.label??''),
      campusId:String(detail.campusId??detail.campus??''),
      source:'tryamm:campusverse-travel',
      playerId:String(detail.playerId??''),
      creatorId:String(detail.creatorId??''),
      passportId:String(detail.passportId??''),
    })
    window.dispatchEvent(new CustomEvent('tryamm:crossverse-travel',{detail:travel}))
  }

  const forwardCreator=(event:Event)=>{
    const detail=(event as CustomEvent<Partial<CrossVerseCreatorEnvelope>>).detail||{}
    const envelope=normalizeCreator(detail)
    window.dispatchEvent(new CustomEvent('tryamm:crossverse-creator-publish',{detail:envelope}))
  }

  const forwardHoloGift=(event:Event)=>{
    const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:crossverse-holo-gift',{detail:{
      giftType:safeText(detail.giftType||detail.label),
      label:safeText(detail.label),
      tier:safeText(detail.tier),
      lottieKey:safeText(detail.lottieKey),
      spatialMode:safeText(detail.spatialMode),
      visualOnly:Boolean(detail.previewOnly)||!Boolean(detail.moneyMoved),
      moneyMoved:Boolean(detail.moneyMoved),
      withdrawable:false,
      serverVerifiedValue:Boolean(detail.moneyMoved)&&Boolean(detail.serverVerifiedValue),
      source:'tryamm:holo-gift',
    }}))
  }

  const forwardCreditEntitlement=(event:Event)=>{
    const detail=(event as CustomEvent<Record<string,unknown>>).detail||{}
    window.dispatchEvent(new CustomEvent('tryamm:crossverse-credit-state',{detail:{
      itemId:safeText(detail.itemId),
      label:safeText(detail.label),
      effect:safeText(detail.effect),
      channel:safeText(detail.channel),
      sourceId:safeText(detail.entitlementId||detail.sourceId),
      closedLoop:true,
      cashValueMinor:0,
      withdrawable:false,
    }}))
  }

  const requestTravel=(event:Event)=>{
    const detail=(event as CustomEvent<CrossVerseTravelDetail>).detail
    if(!detail)return
    const travel=normalizeTravel(detail)
    if(travel.to==='campusverse'){
      window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:travel}))
    }
    window.dispatchEvent(new CustomEvent('tryamm:verse-state-transfer',{detail:{
      ...travel,
      preserve:['playerId','creatorId','passportId','mission','inventory','omnibox','ledger'],
      moneyAuthority:'server-ledger',
    }}))
  }

  window.addEventListener('tryamm:campusverse-travel',forwardCampusTravel as EventListener)
  window.addEventListener('tryamm:reel-published',forwardCreator as EventListener)
  window.addEventListener('tryamm:omnibox-published',forwardCreator as EventListener)
  window.addEventListener('tryamm:creator-commerce-published',forwardCreator as EventListener)
  window.addEventListener('tryamm:crossverse-travel-request',requestTravel as EventListener)
  window.addEventListener('tryamm:holo-gift',forwardHoloGift as EventListener)
  window.addEventListener('tryamm:holo-play-entitlement-applied',forwardCreditEntitlement as EventListener)

  w.__TRYAMM_CROSSVERSE_CAMPUSVERSE_BRIDGE__=Object.freeze({version:BRIDGE_VERSION})
  window.dispatchEvent(new CustomEvent('tryamm:crossverse-campusverse-bridge-ready',{detail:{
    version:BRIDGE_VERSION,
    preservesPlayerState:true,
    preservesCreatorState:true,
    preservesPassport:true,
    connectsCampusVerse:true,
    connectsReels:true,
    connectsOmniBox:true,
    connectsCreatorCommerce:true,
    connectsHoloGifts:true,
    connectsCreditEntitlements:true,
    serverAuthoritativeLedger:true,
  }}))

  return()=>{
    window.removeEventListener('tryamm:campusverse-travel',forwardCampusTravel as EventListener)
    window.removeEventListener('tryamm:reel-published',forwardCreator as EventListener)
    window.removeEventListener('tryamm:omnibox-published',forwardCreator as EventListener)
    window.removeEventListener('tryamm:creator-commerce-published',forwardCreator as EventListener)
    window.removeEventListener('tryamm:crossverse-travel-request',requestTravel as EventListener)
    window.removeEventListener('tryamm:holo-gift',forwardHoloGift as EventListener)
    window.removeEventListener('tryamm:holo-play-entitlement-applied',forwardCreditEntitlement as EventListener)
    delete w.__TRYAMM_CROSSVERSE_CAMPUSVERSE_BRIDGE__
  }
}
