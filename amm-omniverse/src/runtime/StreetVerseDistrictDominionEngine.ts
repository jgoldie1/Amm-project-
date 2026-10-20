/**
 * Original StreetVerse district-control / civic city-building rehearsal.
 * STRICTLY LOCAL: no live multiplayer wins, money, property rights, payouts,
 * external account mutations, or server-side entitlements.
 */
export type DistrictId='circle-park'|'taylor-street'|'little-italy'
export type CrewId='west-side-creators'|'lakefront-legends'|'neutral'
export type BuildId='park'|'studio'|'housing'|'transit'|'market'|'clinic'
export type MissionId='race'|'creator-pk'|'community'|'festival'
export type District={
 id:DistrictId;title:string;region:string;influence:number;rivalInfluence:number;
 owner:CrewId;prosperity:number;happiness:number;buildings:BuildId[];rounds:number
}
export type HistoryEntry={key:number;message:string;district:DistrictId}
export type DominionState={
 schema:'tryamm.streetverse.district-dominion.preview.v1';mode:'LOCAL_DEMO';season:1;
 playerCrew:'west-side-creators';rivalCrew:'lakefront-legends';district:DistrictId;
 credits:number;xp:number;turns:number;districts:District[];history:HistoryEntry[];updatedAt:string
}
export const DOMINION_KEY='tryamm.streetverse.district-dominion.preview.v1'
export const DISTRICTS=[
 {id:'circle-park',title:'Circle Park',region:'Near West Side',color:'#64e9ad'},
 {id:'taylor-street',title:'Taylor Street',region:'UIC / Taylor',color:'#ffc37d'},
 {id:'little-italy',title:'Little Italy',region:'Chicago cultural district',color:'#91c9ff'},
] as const
export const BUILDS=[
 {id:'park',label:'Community Park',cost:90,happiness:12,prosperity:4,influence:8,icon:'🌳'},
 {id:'studio',label:'Holo Music Studio',cost:140,happiness:5,prosperity:13,influence:12,icon:'🎵'},
 {id:'housing',label:'Accessible Housing',cost:180,happiness:14,prosperity:8,influence:9,icon:'🏘️'},
 {id:'transit',label:'Transit Hub',cost:160,happiness:9,prosperity:12,influence:8,icon:'🚈'},
 {id:'market',label:'Creator Marketplace',cost:130,happiness:5,prosperity:17,influence:11,icon:'🛍️'},
 {id:'clinic',label:'Community Health Center',cost:150,happiness:16,prosperity:5,influence:7,icon:'🏥'},
] as const
export const MISSIONS=[
 {id:'race',label:'Chicago Street Circuit',description:'Beat fictional AI rivals in a marked race.',gain:24,credits:65,xp:90,icon:'🏎️'},
 {id:'creator-pk',label:'PK Talent Showcase',description:'Win by talent and participation, not gifts.',gain:28,credits:58,xp:95,icon:'🎤'},
 {id:'community',label:'Neighborhood Support',description:'Complete a fictional community-support mission.',gain:20,credits:75,xp:105,icon:'🤝'},
 {id:'festival',label:'Holo Music Festival',description:'Stage an inclusive live-entertainment challenge.',gain:22,credits:80,xp:100,icon:'🎶'},
] as const
const ids= DISTRICTS.map(d=>d.id) as readonly string[]
const crewIds=['west-side-creators','lakefront-legends','neutral'] as const
const buildIds=BUILDS.map(d=>d.id) as readonly string[]
const bound=(x:number,low:number,high:number)=>Math.max(low,Math.min(high,Number.isFinite(x)?x:low))
const validInt=(value:unknown,low:number,high:number,fallback:number)=>typeof value==='number'&&Number.isFinite(value)?Math.round(bound(value,low,high)):fallback
const initialDistricts=():District[]=>DISTRICTS.map((d,i)=>({
 id:d.id,title:d.title,region:d.region,influence:i===0?25:5,rivalInfluence:i===0?55:35,
 owner:'neutral',prosperity:35,happiness:55,buildings:[],rounds:0,
}))
export function createDominion():DominionState{
 return{schema:'tryamm.streetverse.district-dominion.preview.v1',mode:'LOCAL_DEMO',season:1,
  playerCrew:'west-side-creators',rivalCrew:'lakefront-legends',district:'circle-park',
  credits:300,xp:0,turns:0,districts:initialDistricts(),history:[],updatedAt:new Date().toISOString()}
}
export function normalizeDominion(input:unknown):DominionState{
 const empty=createDominion()
 if(!input||typeof input!=='object')return empty
 const v=input as Partial<DominionState>
 if(v.schema!==empty.schema||!Array.isArray(v.districts))return empty
 const districts=initialDistricts().map(original=>{
  const raw=v.districts?.find(d=>d&&d.id===original.id)
  if(!raw)return original
  return{...original,
   influence:validInt(raw.influence,0,100,original.influence),
   rivalInfluence:validInt(raw.rivalInfluence,0,100,original.rivalInfluence),
   owner:crewIds.includes(raw.owner)?raw.owner:'neutral' as CrewId,
   prosperity:validInt(raw.prosperity,0,100,original.prosperity),
   happiness:validInt(raw.happiness,0,100,original.happiness),
   buildings:Array.from(new Set(Array.isArray(raw.buildings)?raw.buildings.filter(x=>buildIds.includes(x)):[])).slice(0,6) as BuildId[],
   rounds:validInt(raw.rounds,0,10000,0)}
 })
 const history=Array.isArray(v.history)?v.history.slice(-5).flatMap(x=>
  x&&ids.includes(x.district)&&typeof x.message==='string'?
  [{key:validInt(x.key,0,1000000,0),message:x.message.slice(0,150),district:x.district}]:[]):[]
 return{...empty,
  district:ids.includes(String(v.district))?v.district as DistrictId:empty.district,
  credits:validInt(v.credits,0,100000,300),xp:validInt(v.xp,0,10000000,0),
  turns:validInt(v.turns,0,100000,0),districts,history}
}
const logAction=(s:DominionState,message:string):DominionState=>({
 ...s,history:[...s.history,{key:s.turns,message,district:s.district}].slice(-5),
 updatedAt:new Date().toISOString()
})
export function selectDistrict(s:DominionState,id:DistrictId):DominionState{
 return ids.includes(id)?{...s,district:id}:s
}
export function playMission(s:DominionState,id:MissionId):DominionState{
 const mission=MISSIONS.find(x=>x.id===id)
 if(!mission)return s
 const current=s.districts.find(x=>x.id===s.district)
 if(!current)return s
 const d:District={...current,rounds:current.rounds+1,
  influence:bound(current.influence+mission.gain,0,100),
  rivalInfluence:bound(current.rivalInfluence-8,0,100),
  happiness:bound(current.happiness+(id==='community'?7:0),0,100),
  prosperity:bound(current.prosperity+(id==='festival'||id==='creator-pk'?4:0),0,100)}
 if(d.influence>=75&&d.influence>d.rivalInfluence)d.owner='west-side-creators'
 const turns=s.turns+1
 if(turns%3===0){
  d.rivalInfluence=bound(d.rivalInfluence+12,0,100)
  d.influence=bound(d.influence-5,0,100)
  if(d.rivalInfluence>=75&&d.rivalInfluence>d.influence)d.owner='lakefront-legends'
 }
 return logAction({...s,turns,credits:bound(s.credits+mission.credits,0,100000),xp:bound(s.xp+mission.xp,0,10000000),
  districts:s.districts.map(x=>x.id===s.district?d:x)},
  mission.label+' complete: +'+mission.gain+' influence and '+mission.credits+' simulation credits.')
}
export function buildCity(s:DominionState,id:BuildId):DominionState{
 const item=BUILDS.find(x=>x.id===id)
 const current=s.districts.find(x=>x.id===s.district)
 if(!item||!current||s.credits<item.cost||current.buildings.includes(id))return s
 const d:District={...current,rounds:current.rounds+1,buildings:[...current.buildings,id],
  happiness:bound(current.happiness+item.happiness,0,100),
  prosperity:bound(current.prosperity+item.prosperity,0,100),
  influence:bound(current.influence+item.influence,0,100)}
 if(d.influence>=75&&d.influence>d.rivalInfluence)d.owner='west-side-creators'
 return logAction({...s,turns:s.turns+1,credits:s.credits-item.cost,xp:s.xp+15,
  districts:s.districts.map(x=>x.id===s.district?d:x)},
  item.label+' built for '+item.cost+' simulation credits.')
}
export function dominionMetrics(s:DominionState){
 return{districtsHeld:s.districts.filter(d=>d.owner==='west-side-creators').length,total:3,
  buildings:s.districts.reduce((n,d)=>n+d.buildings.length,0),
  averageHappiness:Math.round(s.districts.reduce((n,d)=>n+d.happiness,0)/3),
  verifiedOnlineWins:0,realMoney:0,ranked:false}
}
export function loadDominion():DominionState{
 if(typeof window==='undefined')return createDominion()
 try{const value=localStorage.getItem(DOMINION_KEY);return value&&value.length<24000?normalizeDominion(JSON.parse(value)):createDominion()}catch{return createDominion()}
}
export function saveDominion(s:DominionState){
 if(typeof window!=='undefined')try{localStorage.setItem(DOMINION_KEY,JSON.stringify(s))}catch{}
 return s
}
