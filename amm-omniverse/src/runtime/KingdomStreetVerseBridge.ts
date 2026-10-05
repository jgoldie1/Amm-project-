export type KingdomBridgeEvent =
  | 'KINGDOM_READY'
  | 'KINGDOM_DESTINATION_ENTERED'
  | 'KINGDOM_CITIZEN_INTERACTION'
  | 'KINGDOM_PORTAL_REQUEST'
  | 'PLAYER_MOVED'
  | 'VEHICLE_ENTERED'
  | 'VEHICLE_EXITED'
  | 'WAYPOINT_SET'
  | 'WAYPOINT_REACHED'
  | 'MISSION_STARTED'
  | 'MISSION_COMPLETED'
  | 'REEL_CAPTURE_REQUEST'
  | 'OMNIBOX_SAVE_REQUEST'
  | 'CAMPUSVERSE_TRAVEL_REQUEST'
  | 'CROSSVERSE_TRAVEL_REQUEST'

export type KingdomBridgePayload={
  type:KingdomBridgeEvent
  playerId?:string
  creatorId?:string
  passportId?:string
  missionId?:string
  vehicleId?:string
  district?:string
  destination?:string
  x?:number
  y?:number
  z?:number
  contentId?:string
  citizenId?:string
  role?:string
  household?:string
  source?:string
}

const clean=(v:unknown,max=180)=>String(v??'').replace(/[<>]/g,'').slice(0,max)

export function installKingdomStreetVerseBridge(){
  if(typeof window==='undefined')return()=>{}
  const w=window as typeof window & {__TRYAMM_KINGDOM_STREETVERSE_BRIDGE__?:{version:string}}

  if(w.__TRYAMM_KINGDOM_STREETVERSE_BRIDGE__)return()=>{}

  const forward=(payload:KingdomBridgePayload)=>{
    const base={
      playerId:clean(payload.playerId),
      creatorId:clean(payload.creatorId),
      passportId:clean(payload.passportId),
      missionId:clean(payload.missionId),
      vehicleId:clean(payload.vehicleId),
      district:clean(payload.district),
      destination:clean(payload.destination),
      x:Number.isFinite(payload.x)?Number(payload.x):undefined,
      y:Number.isFinite(payload.y)?Number(payload.y):undefined,
      z:Number.isFinite(payload.z)?Number(payload.z):undefined,
      contentId:clean(payload.contentId),
      citizenId:clean(payload.citizenId),
      role:clean(payload.role),
      household:clean(payload.household),
      source:clean(payload.source||'streetverse-kingdom'),
      authority:'client-gameplay',
    }

    switch(payload.type){
      case 'KINGDOM_READY':
        window.dispatchEvent(new CustomEvent('tryamm:kingdom-ready',{detail:{...base,sharedState:true}}))
        break
      case 'KINGDOM_DESTINATION_ENTERED':
        window.dispatchEvent(new CustomEvent('tryamm:kingdom-destination-entered',{detail:base}))
        break
      case 'KINGDOM_CITIZEN_INTERACTION':
        window.dispatchEvent(new CustomEvent('tryamm:kingdom-citizen-interaction',{detail:base}))
        break
      case 'KINGDOM_PORTAL_REQUEST': {
        const allowed=new Set(['/kingdom-of-yahisrael','/kingdom-workbook','/metaverse-bible','/faithverse','/ethiopian-bible','/kingdoms-press','/servants-of-christ','/network'])
        if(allowed.has(base.destination))window.dispatchEvent(new CustomEvent('tryamm:kingdom-portal-request',{detail:base}))
        break
      }
      case 'PLAYER_MOVED':
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-moved',{detail:base}))
        break
      case 'VEHICLE_ENTERED':
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-entered',{detail:base}))
        break
      case 'VEHICLE_EXITED':
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-exited',{detail:base}))
        break
      case 'WAYPOINT_SET':
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-waypoint-set',{detail:base}))
        break
      case 'WAYPOINT_REACHED':
        window.dispatchEvent(new CustomEvent('tryamm:streetverse-waypoint-reached',{detail:base}))
        break
      case 'MISSION_STARTED':
        window.dispatchEvent(new CustomEvent('tryamm:mission-started',{detail:base}))
        break
      case 'MISSION_COMPLETED':
        window.dispatchEvent(new CustomEvent('tryamm:mission-completion-request',{detail:{
          ...base,
          payoutAuthority:'server-ledger',
          verified:false,
        }}))
        break
      case 'REEL_CAPTURE_REQUEST':
        window.dispatchEvent(new CustomEvent('tryamm:reel-capture-request',{detail:{
          ...base,
          origin:'streetverse-kingdom',
          target:'omnibox',
        }}))
        break
      case 'OMNIBOX_SAVE_REQUEST':
        window.dispatchEvent(new CustomEvent('tryamm:omnibox-save-request',{detail:{
          ...base,
          origin:'streetverse-kingdom',
        }}))
        break
      case 'CAMPUSVERSE_TRAVEL_REQUEST':
        window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{
          ...base,
          from:'streetverse',
          to:'campusverse',
        }}))
        break
      case 'CROSSVERSE_TRAVEL_REQUEST':
        window.dispatchEvent(new CustomEvent('tryamm:crossverse-travel-request',{detail:{
          ...base,
          from:'streetverse',
          to:'crossverse',
        }}))
        break
    }

    window.dispatchEvent(new CustomEvent('tryamm:verse-state-transfer',{detail:{
      ...base,
      eventType:payload.type,
      preserve:['playerId','creatorId','passportId','mission','inventory','omnibox','ledger'],
      moneyAuthority:'server-ledger',
    }}))
  }

  const onMessage=(event:MessageEvent)=>{
    if(event.origin!==window.location.origin)return
    const data=event.data
    if(!data||typeof data!=='object')return
    if(data.channel!=='tryamm:streetverse-kingdom')return
    if(typeof data.type!=='string')return
    forward(data as KingdomBridgePayload)
  }

  const onCustom=(event:Event)=>{
    const detail=(event as CustomEvent<KingdomBridgePayload>).detail
    if(detail&&detail.type)forward(detail)
  }

  window.addEventListener('message',onMessage)
  window.addEventListener('tryamm:kingdom-event',onCustom as EventListener)

  w.__TRYAMM_KINGDOM_STREETVERSE_BRIDGE__=Object.freeze({version:'1.0.0'})
  window.dispatchEvent(new CustomEvent('tryamm:kingdom-streetverse-bridge-ready',{detail:{
    version:'1.0.0',
    playerState:true,
    creatorState:true,
    passport:true,
    missions:true,
    reels:true,
    omnibox:true,
    campusverse:true,
    crossverse:true,
    serverAuthoritativeMoney:true,
    yahisraelLivingWorld:true,
    safeKingdomPortals:true,
  }}))

  return()=>{
    window.removeEventListener('message',onMessage)
    window.removeEventListener('tryamm:kingdom-event',onCustom as EventListener)
    delete w.__TRYAMM_KINGDOM_STREETVERSE_BRIDGE__
  }
}
