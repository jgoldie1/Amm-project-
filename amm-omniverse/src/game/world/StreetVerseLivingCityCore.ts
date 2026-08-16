export type DistrictId='kingdom-square'|'river-north'|'south-market'|'harbor'|'university'|'industrial'|'holo-district'
export type Weather='clear'|'rain'|'storm'|'fog'|'snow'
export type NpcMood='calm'|'busy'|'happy'|'angry'|'afraid'|'curious'
export type EventKind='traffic'|'crime'|'rescue'|'concert'|'sports'|'business'|'weather'|'community'|'delivery'|'security'

export type Vec3={x:number;y:number;z:number}
export type TrafficVehicle={id:string;district:DistrictId;position:Vec3;speed:number;route:string[];yielding:boolean;disabled:boolean}
export type SecurityUnit={id:string;district:DistrictId;position:Vec3;alert:number;targetPlayerId?:string;state:'patrol'|'investigate'|'pursuit'|'assist'|'return'}
export type NpcMemory={eventId:string;summary:string;sentiment:number;timestamp:number}
export type LivingNpc={id:string;name:string;district:DistrictId;homeDistrict:DistrictId;workDistrict:DistrictId;position:Vec3;mood:NpcMood;schedule:'home'|'commute'|'work'|'leisure'|'sleep';memory:NpcMemory[];relationship:number}
export type Property={id:string;district:DistrictId;name:string;type:'apartment'|'house'|'business'|'garage'|'studio'|'club'|'warehouse';ownerPlayerId?:string;enterable:boolean;interiorSceneId:string;value:number;incomePerTick:number}
export type DynamicEvent={id:string;kind:EventKind;district:DistrictId;title:string;severity:number;startedAt:number;expiresAt:number;resolved:boolean;missionHook?:string}
export type PlayerWorldState={id:string;district:DistrictId;position:Vec3;cash:number;wanted:number;reputation:{community:number;business:number;creator:number;street:number;security:number};ownedPropertyIds:string[]}
export type LivingCityState={clockMinutes:number;day:number;weather:Weather;traffic:TrafficVehicle[];security:SecurityUnit[];npcs:LivingNpc[];properties:Property[];events:DynamicEvent[];players:PlayerWorldState[]}

const clamp=(n:number,min=0,max=100)=>Math.max(min,Math.min(max,n))
const rnd=(min:number,max:number)=>Math.random()*(max-min)+min

export function createLivingCity():LivingCityState{
 const districts:DistrictId[]=['kingdom-square','river-north','south-market','harbor','university','industrial','holo-district']
 const traffic=Array.from({length:42},(_,i):TrafficVehicle=>({id:`traffic-${i}`,district:districts[i%districts.length],position:{x:rnd(-500,500),y:0,z:rnd(-500,500)},speed:rnd(8,22),route:[`node-${i%12}`,`node-${(i+1)%12}`],yielding:false,disabled:false}))
 const security=Array.from({length:14},(_,i):SecurityUnit=>({id:`security-${i}`,district:districts[i%districts.length],position:{x:rnd(-350,350),y:0,z:rnd(-350,350)},alert:0,state:'patrol'}))
 const npcs=Array.from({length:84},(_,i):LivingNpc=>({id:`npc-${i}`,name:`Citizen ${i+1}`,district:districts[i%districts.length],homeDistrict:districts[i%districts.length],workDistrict:districts[(i+2)%districts.length],position:{x:rnd(-600,600),y:0,z:rnd(-600,600)},mood:'calm',schedule:'home',memory:[],relationship:0}))
 const properties:Property[]=[
  {id:'prop-apartment-1',district:'kingdom-square',name:'Kingdom Heights Apartment',type:'apartment',enterable:true,interiorSceneId:'interior-apartment-a',value:95000,incomePerTick:0},
  {id:'prop-studio-1',district:'holo-district',name:'Holo Creator Studio',type:'studio',enterable:true,interiorSceneId:'interior-studio-a',value:180000,incomePerTick:450},
  {id:'prop-garage-1',district:'industrial',name:'Volcano Garage',type:'garage',enterable:true,interiorSceneId:'interior-garage-a',value:140000,incomePerTick:250},
  {id:'prop-club-1',district:'river-north',name:'Judah Nights',type:'club',enterable:true,interiorSceneId:'interior-club-a',value:420000,incomePerTick:900},
  {id:'prop-warehouse-1',district:'harbor',name:'Harbor Logistics Hub',type:'warehouse',enterable:true,interiorSceneId:'interior-warehouse-a',value:310000,incomePerTick:700}
 ]
 return {clockMinutes:8*60,day:1,weather:'clear',traffic,security,npcs,properties,events:[],players:[]}
}

export function addPlayer(state:LivingCityState,id:string):LivingCityState{
 if(state.players.some(p=>p.id===id)) return state
 return {...state,players:[...state.players,{id,district:'kingdom-square',position:{x:0,y:0,z:0},cash:5000,wanted:0,reputation:{community:0,business:0,creator:0,street:0,security:0},ownedPropertyIds:[]}]}
}

export function rememberNpc(npc:LivingNpc,event:Omit<NpcMemory,'timestamp'>):LivingNpc{
 const memory=[...npc.memory,{...event,timestamp:Date.now()}].slice(-20)
 return {...npc,memory,relationship:clamp(npc.relationship+event.sentiment,-100,100),mood:event.sentiment>20?'happy':event.sentiment<-20?'angry':npc.mood}
}

export function spawnDynamicEvent(state:LivingCityState,kind:EventKind,district:DistrictId,severity=1):LivingCityState{
 const now=Date.now(); const id=`${kind}-${district}-${now}`
 const titles:Record<EventKind,string>={traffic:'Traffic Incident',crime:'Street Incident',rescue:'Rescue Needed',concert:'Pop-up Concert',sports:'Street Tournament',business:'Business Opportunity',weather:'Weather Hazard',community:'Community Event',delivery:'Priority Delivery',security:'Security Alert'}
 return {...state,events:[...state.events,{id,kind,district,title:titles[kind],severity:clamp(severity,1,5),startedAt:now,expiresAt:now+10*60_000,resolved:false,missionHook:`mission:${kind}:${district}`}].slice(-40)}
}

export function resolveEvent(state:LivingCityState,eventId:string,playerId:string,success=true):LivingCityState{
 const event=state.events.find(e=>e.id===eventId); if(!event) return state
 const events=state.events.map(e=>e.id===eventId?{...e,resolved:true}:e)
 const players=state.players.map(p=>{
  if(p.id!==playerId) return p
  const rep={...p.reputation}; const reward=success?100*event.severity:0
  if(event.kind==='community'||event.kind==='rescue') rep.community=clamp(rep.community+(success?3:-2),-100,100)
  if(event.kind==='business'||event.kind==='delivery') rep.business=clamp(rep.business+(success?3:-2),-100,100)
  if(event.kind==='concert'||event.kind==='sports') rep.creator=clamp(rep.creator+(success?2:0),-100,100)
  if(event.kind==='crime') rep.street=clamp(rep.street+(success?2:-1),-100,100)
  if(event.kind==='security') rep.security=clamp(rep.security+(success?2:-2),-100,100)
  return {...p,cash:p.cash+reward,reputation:rep}
 })
 return {...state,events,players}
}

export function buyProperty(state:LivingCityState,playerId:string,propertyId:string):LivingCityState{
 const property=state.properties.find(p=>p.id===propertyId); const player=state.players.find(p=>p.id===playerId)
 if(!property||!player||property.ownerPlayerId||player.cash<property.value) return state
 return {...state,properties:state.properties.map(p=>p.id===propertyId?{...p,ownerPlayerId:playerId}:p),players:state.players.map(p=>p.id===playerId?{...p,cash:p.cash-property.value,ownedPropertyIds:[...p.ownedPropertyIds,propertyId]}:p)}
}

export function tickLivingCity(state:LivingCityState,deltaMinutes=1):LivingCityState{
 const clockMinutes=(state.clockMinutes+deltaMinutes)%(24*60); const day=state.day+(state.clockMinutes+deltaMinutes>=24*60?1:0)
 const hour=Math.floor(clockMinutes/60)
 const npcs=state.npcs.map(n=>{
  const schedule:LivingNpc['schedule']=hour<6?'sleep':hour<8?'commute':hour<17?'work':hour<22?'leisure':'home'
  const district=schedule==='work'?n.workDistrict:schedule==='commute'?n.district:n.homeDistrict
  return {...n,schedule,district,mood:schedule==='work'?'busy':schedule==='leisure'?'happy':'calm'}
 })
 const traffic=state.traffic.map(v=>({...v,speed:v.disabled?0:Math.max(4,v.speed+rnd(-1,1)),yielding:Math.random()<0.04}))
 const security=state.security.map(u=>{
  const target=state.players.find(p=>p.wanted>20&&p.district===u.district)
  if(target) return {...u,state:'pursuit' as const,targetPlayerId:target.id,alert:clamp(u.alert+10)}
  return {...u,state:u.alert>0?'investigate' as const:'patrol' as const,targetPlayerId:undefined,alert:Math.max(0,u.alert-2)}
 })
 const properties=state.properties.map(p=>p.ownerPlayerId?{...p}:p)
 let players=state.players.map(p=>({...p,wanted:Math.max(0,p.wanted-.2)}))
 for(const prop of properties){ if(prop.ownerPlayerId&&prop.incomePerTick>0) players=players.map(p=>p.id===prop.ownerPlayerId?{...p,cash:p.cash+prop.incomePerTick}:p) }
 const events=state.events.filter(e=>!e.resolved&&e.expiresAt>Date.now()).slice(-40)
 return {...state,clockMinutes,day,npcs,traffic,security,properties,players,events}
}
