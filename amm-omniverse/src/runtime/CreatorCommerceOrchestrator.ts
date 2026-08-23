import { canPlayTrack, type HoloMusicContext, type HoloMusicTrack } from '../music/HoloMusic'

type HighlightSignal={
  missionId:string
  world:string
  locationId?:string
  reason:string
  title:string
  caption:string
  productIds?:string[]
  merchantId?:string
  track?:HoloMusicTrack
}

type WorldBuilderRequest={
  id:string
  prompt:string
  world:string
  requestedAt:string
  requiresValidation:true
  requiresHumanApproval:true
}

let installed=false
let lastMissionComplete=false
let lastHighlightId=''

function emit(name:string,detail:unknown){window.dispatchEvent(new CustomEvent(name,{detail}))}
function deepLink(world:string,missionId?:string,locationId?:string){
  const url=new URL('/streetverse',window.location.origin)
  url.searchParams.set('world',world)
  if(missionId)url.searchParams.set('mission',missionId)
  if(locationId)url.searchParams.set('location',locationId)
  return url.toString()
}

function rightsResult(track:HoloMusicTrack|undefined,context:HoloMusicContext){
  if(!track)return {trackId:null,artistId:null,allowed:false,reason:'no-track-selected'}
  const allowed=canPlayTrack(track,context)
  return {trackId:track.id,artistId:track.artistId,allowed,reason:allowed?'licensed-for-context':'not-licensed-for-context'}
}

function suggestEdit(signal:HighlightSignal){
  return {
    title:signal.title,
    caption:signal.caption,
    suggestedEffects:['world-location-card','mission-complete-sting','quantum-beat-cut-points'],
    suggestedDestinations:['reel','omnibox','creator-profile'],
    deepLink:deepLink(signal.world,signal.missionId,signal.locationId),
    productIds:signal.productIds||[],
    merchantId:signal.merchantId||null,
  }
}

function queueHighlight(signal:HighlightSignal){
  const id=`${signal.missionId}:${signal.locationId||'world'}`
  if(id===lastHighlightId)return
  lastHighlightId=id
  const rights=rightsResult(signal.track,'creator-studio')
  const edit=suggestEdit(signal)
  emit('tryamm:creator-tags-updated',{
    artistId:rights.allowed?rights.artistId:undefined,
    productIds:signal.productIds||[],
    locationIds:signal.locationId?[signal.locationId]:[],
    missionId:signal.missionId,
  })
  emit('tryamm:creator-highlight-ready',{
    id,
    ...signal,
    rights,
    edit,
    capturedAt:new Date().toISOString(),
    requiresRightsVerification:Boolean(signal.track),
  })
  emit('tryamm:media-studio-open',{source:'streetverse',context:'streetverse',world:signal.world,missionId:signal.missionId,highlight:edit})
}

function inspectPlayableBeta(){
  try{
    const raw=localStorage.getItem('tryamm.playable-beta.v1')
    if(!raw)return
    const state=JSON.parse(raw)
    const visited=Array.isArray(state?.visited)?state.visited:[]
    const complete=visited.length>=3
    if(complete&&!lastMissionComplete){
      queueHighlight({
        missionId:'m1',
        world:'streetverse',
        locationId:'first-drop-route',
        reason:'mission-complete',
        title:'StreetVerse: First Drop Complete',
        caption:'First Drop delivered across StreetVerse • Made in TRYAMM',
      })
    }
    lastMissionComplete=complete
  }catch{/* ignore malformed local beta state */}
}

export function installCreatorCommerceOrchestrator(){
  if(installed||typeof window==='undefined')return
  installed=true

  const timer=window.setInterval(inspectPlayableBeta,1200)
  inspectPlayableBeta()

  window.addEventListener('tryamm:streetverse-highlight',(event:Event)=>{
    const d=(event as CustomEvent<HighlightSignal>).detail
    if(d?.missionId&&d?.world)queueHighlight(d)
  })

  window.addEventListener('tryamm:creator-highlight-ready',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    emit('tryamm:creator-ai-edit-suggestion',d.edit||{})
    emit('tryamm:creator-deep-link-ready',{url:d.edit?.deepLink||deepLink('streetverse',d.missionId,d.locationId)})
  })

  window.addEventListener('tryamm:live-gift-event',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    emit('tryamm:creator-engagement-event',{
      kind:'live-gift',
      giftId:d.giftId||null,
      animationId:d.animationId||null,
      creatorId:d.creatorId||null,
      monetary:false,
      requiresServerSettlement:Boolean(d.monetary),
      occurredAt:new Date().toISOString(),
    })
  })

  window.addEventListener('tryamm:creator-commerce-attribution',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    emit('tryamm:creator-settlement-request',{
      ...d,
      clientCanSettle:false,
      requiredServerChecks:['verified-order','creator-attribution','refund-window','ledger-posting'],
    })
  })

  ;(window as any).__tryammWorldBuilder={
    request:(prompt:string,world='streetverse')=>{
      const request:WorldBuilderRequest={id:`world-build-${Date.now()}`,prompt,world,requestedAt:new Date().toISOString(),requiresValidation:true,requiresHumanApproval:true}
      emit('tryamm:world-builder-requested',request)
      return request
    },
  }

  ;(window as any).__tryammCreatorCommerce={
    queueHighlight,
    makeDeepLink:deepLink,
    uninstall:()=>window.clearInterval(timer),
  }
}
