/** Deterministic, fictional NPC activity director. No real customers, payments or shipments. */
import {initialLivingWorldState,type LivingStore} from './StreetVerseLivingStoreRuntime'
export type CityActivity='commute'|'browse'|'work'|'shop'|'deliver'|'socialize'
export type CityActor={id:string;storeId:string;activity:CityActivity;phase:number}
export type CitySnapshot={hour:number;day:number;actors:CityActor[];footTraffic:Record<string,number>;deliveryDemand:string[];era:string}
const stores=initialLivingWorldState().stores
export function citySnapshot(tick:number,era='present'):CitySnapshot{
 const safeTick=Number.isSafeInteger(tick)&&tick>=0?tick:0
 const hour=Math.floor(safeTick/4)%24,day=Math.floor(safeTick/96)
 const activities:CityActivity[]=hour<6?['socialize','commute']:hour<10?['commute','work']:hour<18?['browse','shop','work','deliver']:['socialize','browse','deliver']
 const actors=stores.flatMap((store:LivingStore,i)=>Array.from({length:3},(_,j)=>({id:store.id+'-npc-'+j,storeId:store.id,activity:activities[(safeTick+i+j)%activities.length],phase:(safeTick+j*3)%24})))
 const footTraffic=Object.fromEntries(stores.map(s=>[s.id,actors.filter(a=>a.storeId===s.id&&['browse','shop'].includes(a.activity)).length]))
 const deliveryDemand=stores.filter((s,i)=>(safeTick+i)%7===0).map(s=>s.id)
 return {hour,day,actors,footTraffic,deliveryDemand,era}
}
export function nextCityTick(tick:number):number{return Number.isSafeInteger(tick)&&tick>=0&&tick<10000000?tick+1:0}
