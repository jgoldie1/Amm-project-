export type DistrictId='kingdom-core'|'marketplace-mile'|'creator-district'|'harbor-industrial'|'university-medical'|'suburbs'|'holo-heights'
export type TrafficMode='normal'|'rush'|'event'|'weather'|'emergency'
export type SecurityResponse='observe'|'warn'|'intercept'|'pursuit'|'contain'|'stand-down'
export type MemoryKind='helped'|'harmed'|'trade'|'conversation'|'mission'|'witnessed'|'relationship'
export type PropertyKind='apartment'|'house'|'garage'|'studio'|'storefront'|'club'|'warehouse'|'office'
export type CityEventKind='concert'|'sports'|'market'|'weather'|'traffic'|'rescue'|'community'|'creator'|'security'|'festival'

export interface TrafficAgent { id:string; district:DistrictId; lane:number; speed:number; desiredSpeed:number; route:string[]; stopped:boolean; emergency:boolean }
export interface SecurityUnit { id:string; district:DistrictId; response:SecurityResponse; targetPlayerId?:string; distance:number; awareness:number; deescalation:number }
export interface NpcMemory { id:string; npcId:string; playerId:string; kind:MemoryKind; sentiment:number; importance:number; summary:string; createdAt:number; expiresAt?:number }
export interface PropertyState { id:string; ownerId?:string; district:DistrictId; kind:PropertyKind; interiorSceneId:string; value:number; incomePerDay:number; condition:number; access:'public'|'private'|'invite'|'business-hours' }
export interface CityEvent { id:string; district:DistrictId; kind:CityEventKind; title:string; startsAt:number; endsAt:number; populationBoost:number; trafficMultiplier:number; safetyRisk:number; rewards?:{xp?:number;cash?:number} }

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))

export function updateTraffic(agent:TrafficAgent, mode:TrafficMode, dt:number, congestion:number){
  const modeFactor=mode==='rush'?.72:mode==='event'?.62:mode==='weather'?.58:mode==='emergency'?agent.emergency?1.18:.45:1
  const target=Math.max(0,agent.desiredSpeed*modeFactor*(1-clamp(congestion,0,100)/180))
  const delta=target-agent.speed
  return {...agent,speed:Math.max(0,agent.speed+Math.sign(delta)*Math.min(Math.abs(delta),8*dt)),stopped:target<1}
}

export function chooseSecurityResponse(heat:number,distance:number,playerThreat:number,deescalating:boolean):SecurityResponse{
  if(deescalating&&heat<=2) return 'stand-down'
  if(heat<=0) return 'observe'
  if(heat===1) return distance<12?'warn':'observe'
  if(heat===2) return distance<18?'intercept':'warn'
  if(heat<=4) return playerThreat>65?'contain':'pursuit'
  return 'contain'
}

export function updateSecurityUnit(unit:SecurityUnit,heat:number,playerThreat:number,deescalating:boolean){
  const response=chooseSecurityResponse(heat,unit.distance,playerThreat,deescalating)
  return {...unit,response,awareness:clamp(unit.awareness+(response==='observe'?1:4)),deescalation:clamp(unit.deescalation+(deescalating?8:-2))}
}

export function remember(memory:NpcMemory[],entry:Omit<NpcMemory,'id'|'createdAt'>,now=Date.now()){
  const id=`mem-${entry.npcId}-${entry.playerId}-${now}`
  const next=[...memory,{...entry,id,createdAt:now}]
  return next.filter(m=>!m.expiresAt||m.expiresAt>now).sort((a,b)=>(b.importance*Math.abs(b.sentiment))-(a.importance*Math.abs(a.sentiment))).slice(0,50)
}

export function npcAttitude(memory:NpcMemory[],npcId:string,playerId:string){
  const relevant=memory.filter(m=>m.npcId===npcId&&m.playerId===playerId)
  if(!relevant.length) return 0
  const weighted=relevant.reduce((sum,m)=>sum+m.sentiment*(m.importance/100),0)
  return clamp(weighted,-100,100)
}

export function buyProperty(property:PropertyState,playerId:string,cash:number){
  if(property.ownerId) return {ok:false,property,cash,reason:'already-owned'}
  if(cash<property.value) return {ok:false,property,cash,reason:'insufficient-funds'}
  return {ok:true,property:{...property,ownerId:playerId,access:'private' as const},cash:cash-property.value}
}

export function propertyDailyIncome(properties:PropertyState[],playerId:string){
  return properties.filter(p=>p.ownerId===playerId).reduce((sum,p)=>sum+Math.round(p.incomePerDay*(p.condition/100)),0)
}

export function activeCityEvents(events:CityEvent[],now=Date.now()){ return events.filter(e=>e.startsAt<=now&&e.endsAt>=now) }

export function districtSimulationModifiers(events:CityEvent[],district:DistrictId,now=Date.now()){
  const active=activeCityEvents(events,now).filter(e=>e.district===district)
  return active.reduce((acc,e)=>({
    population:acc.population+e.populationBoost,
    traffic:acc.traffic*e.trafficMultiplier,
    safetyRisk:clamp(acc.safetyRisk+e.safetyRisk,0,100),
    xp:acc.xp+(e.rewards?.xp||0),cash:acc.cash+(e.rewards?.cash||0)
  }),{population:0,traffic:1,safetyRisk:0,xp:0,cash:0})
}

export const defaultProperties:PropertyState[]=[
  {id:'apt-kingdom-01',district:'kingdom-core',kind:'apartment',interiorSceneId:'interior-apartment-a',value:18000,incomePerDay:0,condition:100,access:'private'},
  {id:'garage-market-01',district:'marketplace-mile',kind:'garage',interiorSceneId:'interior-garage-a',value:42000,incomePerDay:240,condition:92,access:'business-hours'},
  {id:'studio-creator-01',district:'creator-district',kind:'studio',interiorSceneId:'interior-studio-a',value:65000,incomePerDay:430,condition:95,access:'business-hours'},
  {id:'club-holo-01',district:'holo-heights',kind:'club',interiorSceneId:'interior-holo-club-a',value:140000,incomePerDay:1200,condition:88,access:'business-hours'}
]

export function seedCityEvents(now=Date.now()):CityEvent[]{
  const hour=60*60*1000
  return [
    {id:'evt-hoops',district:'kingdom-core',kind:'sports',title:'Court Kings Night',startsAt:now,endsAt:now+3*hour,populationBoost:600,trafficMultiplier:1.35,safetyRisk:8,rewards:{xp:150}},
    {id:'evt-creator',district:'creator-district',kind:'creator',title:'All American Showcase',startsAt:now+hour,endsAt:now+5*hour,populationBoost:900,trafficMultiplier:1.45,safetyRisk:5,rewards:{xp:200,cash:250}},
    {id:'evt-market',district:'marketplace-mile',kind:'market',title:'Night Market',startsAt:now,endsAt:now+6*hour,populationBoost:450,trafficMultiplier:1.2,safetyRisk:4,rewards:{cash:100}}
  ]
}
