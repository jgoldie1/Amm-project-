import { QuantumAdaptiveRuntime, type PlayerSignal, type QuantumEntity } from '../engine/quantum/QuantumAdaptiveRuntime'

export type WorldQuality = 'ultra'|'high'|'balanced'|'data-saver'
export type WorldWeather = 'clear'|'golden_hour'|'rain'|'fog'|'storm'
export type WorldPeriod = 'dawn'|'day'|'dusk'|'night'

export type NPCScheduleStop = {
  startHour:number
  endHour:number
  activity:'home'|'commute'|'work'|'school'|'shop'|'eat'|'event'|'patrol'|'sleep'
  locationId:string
}

export type LivingNPC = {
  id:string
  role:string
  position:{x:number;y:number;z:number}
  schedule:NPCScheduleStop[]
  activeActivity?:NPCScheduleStop['activity']
  activeLocationId?:string
  importance?:number
}

export type TrafficProfile = {
  density:number
  pedestrianDensity:number
  transitDensity:number
  deliveryDensity:number
  emergencyDensity:number
}

export type WorldBudget = {
  quality:WorldQuality
  npcHz:number
  trafficHz:number
  weatherHz:number
  maxNearNPCs:number
  maxTrafficVehicles:number
  interiorRadius:number
  wildlifeRadius:number
  shadowScale:number
  effectsScale:number
}

export type LivingWorldSnapshot = {
  hour:number
  period:WorldPeriod
  weather:WorldWeather
  traffic:TrafficProfile
  budget:WorldBudget
  npcStates:Array<{id:string;activity:string;locationId:string}>
  streamedEntityCount:number
  generatedAt:number
}

const budgets:Record<WorldQuality,WorldBudget>={
  ultra:{quality:'ultra',npcHz:30,trafficHz:30,weatherHz:12,maxNearNPCs:160,maxTrafficVehicles:140,interiorRadius:220,wildlifeRadius:500,shadowScale:1,effectsScale:1},
  high:{quality:'high',npcHz:20,trafficHz:20,weatherHz:8,maxNearNPCs:110,maxTrafficVehicles:100,interiorRadius:180,wildlifeRadius:400,shadowScale:.85,effectsScale:.85},
  balanced:{quality:'balanced',npcHz:12,trafficHz:12,weatherHz:5,maxNearNPCs:70,maxTrafficVehicles:65,interiorRadius:130,wildlifeRadius:280,shadowScale:.65,effectsScale:.65},
  'data-saver':{quality:'data-saver',npcHz:6,trafficHz:6,weatherHz:2,maxNearNPCs:36,maxTrafficVehicles:32,interiorRadius:80,wildlifeRadius:160,shadowScale:.4,effectsScale:.4},
}

function periodForHour(hour:number):WorldPeriod {
  if(hour<6)return 'night'
  if(hour<9)return 'dawn'
  if(hour<18)return 'day'
  if(hour<21)return 'dusk'
  return 'night'
}

function scheduleAt(npc:LivingNPC,hour:number){
  const normalized=((hour%24)+24)%24
  return npc.schedule.find(stop=>stop.startHour<=stop.endHour
    ? normalized>=stop.startHour&&normalized<stop.endHour
    : normalized>=stop.startHour||normalized<stop.endHour)
}

function trafficFor(period:WorldPeriod,weather:WorldWeather):TrafficProfile {
  const base=period==='day'?1:period==='dawn'||period==='dusk'?.78:.48
  const weatherPenalty=weather==='storm'?.55:weather==='rain'?.78:weather==='fog'?.72:1
  return {
    density:Math.min(1,base*weatherPenalty),
    pedestrianDensity:Math.min(1,(period==='night'?.38:base)*weatherPenalty),
    transitDensity:Math.min(1,(period==='night'?.45:.85)*weatherPenalty),
    deliveryDensity:Math.min(1,(period==='night'?.5:.7)*(weather==='storm'?1.2:1)),
    emergencyDensity:weather==='storm'?.85:weather==='rain'?.45:.22,
  }
}

export class StreetVerseLivingWorldRuntime {
  private quantum=new QuantumAdaptiveRuntime()
  private quality:WorldQuality='balanced'
  private weather:WorldWeather='clear'
  private hour=12
  private npcs=new Map<string,LivingNPC>()
  private lastSnapshot:LivingWorldSnapshot|null=null

  setClock(hour:number){this.hour=((hour%24)+24)%24}
  setWeather(weather:WorldWeather){this.weather=weather}
  setQuality(quality:WorldQuality){this.quality=quality}
  registerNPC(npc:LivingNPC){this.npcs.set(npc.id,npc)}
  unregisterNPC(id:string){this.npcs.delete(id)}
  getSnapshot(){return this.lastSnapshot}

  async tick(signal:PlayerSignal):Promise<LivingWorldSnapshot>{
    const period=periodForHour(this.hour)
    const npcStates:Array<{id:string;activity:string;locationId:string}>=[]
    const entities:QuantumEntity[]=[]

    for(const npc of this.npcs.values()){
      const stop=scheduleAt(npc,this.hour)
      const activity=stop?.activity||'home'
      const locationId=stop?.locationId||'home'
      npc.activeActivity=activity
      npc.activeLocationId=locationId
      npcStates.push({id:npc.id,activity,locationId})
      entities.push({id:npc.id,kind:'npc',position:npc.position,importance:npc.importance,currentTier:'T2_DISTRICT',lastActiveAt:Date.now(),metadata:{activity,locationId}})
    }

    const result=await this.quantum.tick(signal,entities)
    const snapshot:LivingWorldSnapshot={
      hour:this.hour,
      period,
      weather:this.weather,
      traffic:trafficFor(period,this.weather),
      budget:budgets[this.quality],
      npcStates,
      streamedEntityCount:result.entities.filter(e=>e.currentTier==='T0_IMMEDIATE'||e.currentTier==='T1_NEAR'||e.currentTier==='T2_DISTRICT').length,
      generatedAt:Date.now(),
    }
    this.lastSnapshot=snapshot
    return snapshot
  }
}

let installed=false
export const streetVerseLivingWorldRuntime=new StreetVerseLivingWorldRuntime()

export function installStreetVerseLivingWorldRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true

  const seed:LivingNPC[]=[
    {id:'pastor-ezra',role:'pastor',position:{x:20,y:0,z:-30},schedule:[{startHour:0,endHour:6,activity:'sleep',locationId:'ezra-home'},{startHour:6,endHour:8,activity:'commute',locationId:'gospel-ave'},{startHour:8,endHour:17,activity:'work',locationId:'faith-center'},{startHour:17,endHour:21,activity:'event',locationId:'gospel-ave'},{startHour:21,endHour:24,activity:'home',locationId:'ezra-home'}]},
    {id:'dj-omni',role:'creator',position:{x:-40,y:0,z:10},schedule:[{startHour:0,endHour:9,activity:'sleep',locationId:'creator-loft'},{startHour:9,endHour:13,activity:'work',locationId:'studio'},{startHour:13,endHour:17,activity:'shop',locationId:'market-plaza'},{startHour:17,endHour:24,activity:'event',locationId:'music-hall'}]},
    {id:'maya-markets',role:'merchant',position:{x:-20,y:0,z:50},schedule:[{startHour:0,endHour:6,activity:'sleep',locationId:'maya-home'},{startHour:6,endHour:8,activity:'commute',locationId:'market-plaza'},{startHour:8,endHour:19,activity:'work',locationId:'yahavah-grocery'},{startHour:19,endHour:22,activity:'shop',locationId:'night-market'},{startHour:22,endHour:24,activity:'home',locationId:'maya-home'}]},
    {id:'officer-knox',role:'police',position:{x:0,y:0,z:-60},schedule:[{startHour:0,endHour:6,activity:'patrol',locationId:'night-patrol'},{startHour:6,endHour:14,activity:'work',locationId:'district-station'},{startHour:14,endHour:22,activity:'patrol',locationId:'streetverse-city'},{startHour:22,endHour:24,activity:'home',locationId:'knox-home'}]},
  ]
  seed.forEach(n=>streetVerseLivingWorldRuntime.registerNPC(n))

  window.addEventListener('tryamm:quantum-lag-buster',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    const fps=Number(d.metrics?.fps||60)
    const rtt=Number(d.metrics?.rtt||0)
    const requested=String(d.quality||'auto')
    let q:WorldQuality=requested==='ultra'||requested==='high'||requested==='balanced'||requested==='data-saver'?requested as WorldQuality:'balanced'
    if(fps<35||rtt>280)q='data-saver'
    else if(fps<50||rtt>160)q='balanced'
    else if(requested==='auto')q='high'
    streetVerseLivingWorldRuntime.setQuality(q)
  })

  window.addEventListener('tryamm:world-clock',(event:Event)=>{
    const d=(event as CustomEvent<any>).detail||{}
    if(Number.isFinite(Number(d.hour)))streetVerseLivingWorldRuntime.setClock(Number(d.hour))
  })
  window.addEventListener('tryamm:world-weather',(event:Event)=>{
    const weather=String((event as CustomEvent<any>).detail?.weather||'') as WorldWeather
    if(['clear','golden_hour','rain','fog','storm'].includes(weather))streetVerseLivingWorldRuntime.setWeather(weather)
  })
  window.addEventListener('tryamm:world-player-signal',(event:Event)=>{
    const signal=(event as CustomEvent<PlayerSignal>).detail
    if(!signal?.position)return
    void streetVerseLivingWorldRuntime.tick(signal).then(snapshot=>{
      window.dispatchEvent(new CustomEvent('tryamm:living-world-state',{detail:snapshot}))
      window.dispatchEvent(new CustomEvent('tryamm:game-health',{detail:{kind:'living-world-tick',severity:'info',message:'Living world adaptive tick',fps:null,streamedEntityCount:snapshot.streamedEntityCount,quality:snapshot.budget.quality}}))
    })
  })
}
