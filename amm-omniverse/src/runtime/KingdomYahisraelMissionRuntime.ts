import {KINGDOM_YAHISRAEL_MISSIONS,kingdomMissionById} from '../data/KingdomYahisraelMissionRegistry'

type MissionState={id:string;state:'started'|'local-complete-requested'|'external-handoff'|'completion-requested';updatedAt:number;source:string}
const KEY='tryamm.kingdom-yahisrael.mission-state.v1'
let installed=false

function read():Record<string,MissionState>{try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch{return{}}}
function write(v:Record<string,MissionState>){try{localStorage.setItem(KEY,JSON.stringify(v))}catch{};window.dispatchEvent(new CustomEvent('tryamm:kingdom-mission-state',{detail:{missions:v,catalog:KINGDOM_YAHISRAEL_MISSIONS}}))}
function save(id:string,state:MissionState['state'],source:string){
 const catalog=kingdomMissionById(id);if(!catalog)return
 const all=read();all[id]={id,state,updatedAt:Date.now(),source};write(all)
}

export function installKingdomYahisraelMissionRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 window.addEventListener('tryamm:mission-started',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{},id=String(d.missionId||'')
  const m=kingdomMissionById(id);if(!m)return
  save(id,m.mode==='external'?'external-handoff':'started','kingdom-bridge')
 })
 window.addEventListener('tryamm:kingdom-activity-completed',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{},id=String(d.missionId||'')
  const m=kingdomMissionById(id);if(!m||m.mode!=='local')return
  save(id,'local-complete-requested','kingdom-local-activity')
 })
 window.addEventListener('tryamm:mission-completion-request',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{},id=String(d.missionId||'')
  if(!kingdomMissionById(id))return
  save(id,'completion-requested','server-ledger-request')
 })
 write(read())
 window.dispatchEvent(new CustomEvent('tryamm:kingdom-mission-runtime-ready',{detail:{count:KINGDOM_YAHISRAEL_MISSIONS.length,serverRewardAuthority:true,clientPayouts:false}}))
}
