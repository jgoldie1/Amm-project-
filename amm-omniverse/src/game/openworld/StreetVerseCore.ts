export type DistrictId = 'kingdom-core'|'market-mile'|'sound-river'|'judah-heights'|'harbor'|'industrial'|'holo-quarter'
export type Activity = 'walk'|'drive'|'shop'|'work'|'mission'|'sport'|'music'|'social'|'property'|'holo'
export type ReputationLane = 'civic'|'business'|'creator'|'street'|'security'

export type Vec3 = { x:number; y:number; z:number }
export type PlayerWorldState = {
  playerId:string
  district:DistrictId
  position:Vec3
  cash:number
  holoCredits:number
  health:number
  stamina:number
  vehicleId?:string
  propertyIds:string[]
  businessIds:string[]
  reputation:Record<ReputationLane,number>
  wantedLevel:0|1|2|3|4|5
  activeMissionId?:string
}

export type VehicleState = {
  id:string
  kind:'car'|'motorcycle'|'truck'|'boat'|'aircraft'|'ev'|'future'
  position:Vec3
  speed:number
  health:number
  energy:number
  ownerPlayerId?:string
}

export type NPCState = {
  id:string
  role:'civilian'|'worker'|'creator'|'merchant'|'security'|'driver'|'official'|'performer'
  district:DistrictId
  position:Vec3
  mood:'calm'|'busy'|'happy'|'alert'|'afraid'
  scheduleSlot:'home'|'commute'|'work'|'leisure'|'event'|'sleep'
  memoryTags:string[]
}

export type BusinessState = {
  id:string
  ownerPlayerId?:string
  district:DistrictId
  kind:'club'|'studio'|'store'|'restaurant'|'logistics'|'garage'|'media'|'real-estate'|'creator-space'
  level:number
  revenuePerTick:number
  open:boolean
}

export type Mission = {
  id:string
  title:string
  district:DistrictId
  kind:'delivery'|'race'|'business'|'rescue'|'investigation'|'creator'|'community'|'security'|'property'
  rewardCash:number
  rewardXp:number
  heatDelta:number
  repLane:ReputationLane
  repDelta:number
}

export type StreetVerseState = {
  worldTimeMinutes:number
  weather:'clear'|'rain'|'storm'|'fog'|'snow'|'heat'
  player:PlayerWorldState
  vehicles:VehicleState[]
  npcs:NPCState[]
  businesses:BusinessState[]
  missions:Mission[]
}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function createStreetVerseState(playerId='player-1'):StreetVerseState {
  return {
    worldTimeMinutes: 8*60,
    weather:'clear',
    player:{
      playerId,district:'kingdom-core',position:{x:0,y:0,z:0},cash:2500,holoCredits:100,
      health:100,stamina:100,propertyIds:[],businessIds:[],wantedLevel:0,
      reputation:{civic:10,business:5,creator:10,street:0,security:0}
    },
    vehicles:[
      {id:'starter-ev',kind:'ev',position:{x:8,y:0,z:4},speed:0,health:100,energy:100,ownerPlayerId:playerId},
      {id:'city-car-1',kind:'car',position:{x:22,y:0,z:14},speed:0,health:100,energy:100}
    ],
    npcs:Array.from({length:20},(_,i)=>({
      id:`npc-${i+1}`,role:(['civilian','worker','creator','merchant','driver'] as const)[i%5],district:'kingdom-core',
      position:{x:(i%5)*6-12,y:0,z:Math.floor(i/5)*7-10},mood:'calm',scheduleSlot:'work',memoryTags:[]
    })),
    businesses:[
      {id:'creator-studio-1',district:'kingdom-core',kind:'studio',level:1,revenuePerTick:25,open:true},
      {id:'market-shop-1',district:'market-mile',kind:'store',level:1,revenuePerTick:18,open:true}
    ],
    missions:[
      {id:'m-delivery-1',title:'Creator Gear Delivery',district:'market-mile',kind:'delivery',rewardCash:250,rewardXp:80,heatDelta:0,repLane:'business',repDelta:2},
      {id:'m-race-1',title:'Midnight EV Circuit',district:'holo-quarter',kind:'race',rewardCash:500,rewardXp:140,heatDelta:1,repLane:'street',repDelta:3},
      {id:'m-community-1',title:'Restore the Block',district:'judah-heights',kind:'community',rewardCash:350,rewardXp:160,heatDelta:-1,repLane:'civic',repDelta:5},
      {id:'m-creator-1',title:'Holo Concert Setup',district:'sound-river',kind:'creator',rewardCash:450,rewardXp:150,heatDelta:0,repLane:'creator',repDelta:4}
    ]
  }
}

export function tickStreetVerse(state:StreetVerseState,deltaSeconds:number):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  next.worldTimeMinutes=(next.worldTimeMinutes+deltaSeconds/6)%1440
  const hour=Math.floor(next.worldTimeMinutes/60)
  for(const npc of next.npcs){
    npc.scheduleSlot = hour<6?'sleep':hour<9?'commute':hour<17?'work':hour<22?'leisure':'home'
    if(next.player.wantedLevel>=3 && distance(npc.position,next.player.position)<25) npc.mood='alert'
  }
  for(const b of next.businesses){
    b.open = hour>=8 && hour<23
    if(b.ownerPlayerId===next.player.playerId && b.open) next.player.cash += b.revenuePerTick*(deltaSeconds/60)
  }
  next.player.stamina=clamp(next.player.stamina+deltaSeconds*.4,0,100)
  return next
}

export function movePlayer(state:StreetVerseState,dx:number,dz:number,sprint=false):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  const cost=sprint?1.5:.4
  if(sprint && next.player.stamina<=0) return next
  next.player.position.x+=dx*(sprint?1.75:1)
  next.player.position.z+=dz*(sprint?1.75:1)
  next.player.stamina=clamp(next.player.stamina-cost,0,100)
  return next
}

export function enterVehicle(state:StreetVerseState,vehicleId:string):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  const v=next.vehicles.find(v=>v.id===vehicleId)
  if(!v || distance(v.position,next.player.position)>6) return next
  next.player.vehicleId=vehicleId
  return next
}

export function driveVehicle(state:StreetVerseState,throttle:number,steer:number,deltaSeconds:number):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  const v=next.vehicles.find(v=>v.id===next.player.vehicleId)
  if(!v) return next
  v.speed=clamp(v.speed+throttle*18*deltaSeconds-(throttle===0?8*deltaSeconds:0),0,220)
  v.energy=clamp(v.energy-Math.abs(throttle)*.03*deltaSeconds,0,100)
  const meters=v.speed/3.6*deltaSeconds
  v.position.x+=Math.sin(steer)*meters
  v.position.z+=Math.cos(steer)*meters
  next.player.position={...v.position}
  return next
}

export function startMission(state:StreetVerseState,missionId:string):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  if(next.missions.some(m=>m.id===missionId)) next.player.activeMissionId=missionId
  return next
}

export function completeMission(state:StreetVerseState,missionId:string):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  const m=next.missions.find(m=>m.id===missionId)
  if(!m || next.player.activeMissionId!==missionId) return next
  next.player.cash+=m.rewardCash
  next.player.reputation[m.repLane]=clamp(next.player.reputation[m.repLane]+m.repDelta,-100,100)
  next.player.wantedLevel=clamp(next.player.wantedLevel+m.heatDelta,0,5) as 0|1|2|3|4|5
  next.player.activeMissionId=undefined
  return next
}

export function buyBusiness(state:StreetVerseState,businessId:string,price:number):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  const b=next.businesses.find(b=>b.id===businessId)
  if(!b || b.ownerPlayerId || next.player.cash<price) return next
  next.player.cash-=price
  b.ownerPlayerId=next.player.playerId
  next.player.businessIds.push(businessId)
  next.player.reputation.business=clamp(next.player.reputation.business+5,-100,100)
  return next
}

export function addHeat(state:StreetVerseState,amount:number):StreetVerseState {
  const next=structuredClone(state) as StreetVerseState
  next.player.wantedLevel=clamp(next.player.wantedLevel+amount,0,5) as 0|1|2|3|4|5
  return next
}

function distance(a:Vec3,b:Vec3){ return Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z) }
