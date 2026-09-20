import {STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS,STREETVERSE_TIME_MACHINE_PRESENT_DAY_EFFECTS} from '../config/streetverseChicagoHistoricalCampaigns'

const KEY='tryamm.streetverse.history-legacy.v1'
let installed=false

type HistoryState={
 completed:string[]
 titles:string[]
 affinity:number
 lastEra?:string
 updatedAt?:string
}

function read():HistoryState{
 try{return {...{completed:[],titles:[],affinity:0},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{completed:[],titles:[],affinity:0}}
}
function write(state:HistoryState){
 try{localStorage.setItem(KEY,JSON.stringify({...state,updatedAt:new Date().toISOString()}))}catch{}
 window.dispatchEvent(new CustomEvent('tryamm:history-legacy-state',{detail:state}))
}
function campaignForMission(id:string,title:string){
 const q=(id+' '+title).toLowerCase()
 if(q.includes('prohibition'))return STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS.find(c=>c.id==='prohibition-chicago')
 if(q.includes('dojo')||q.includes('martial'))return STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS.find(c=>c.id==='chicago-dojo-wars')
 return undefined
}

export function installStreetVerseHistoryCampaignRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 window.addEventListener('tryamm:time-machine-enter',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const campaign=campaignForMission(String(d.id||''),String(d.title||''))
  if(!campaign)return
  window.dispatchEvent(new CustomEvent('tryamm:rp-choice-open',{detail:{title:`${campaign.title} • choose your path`,campaignId:campaign.id,routes:campaign.routes}}))
  window.dispatchEvent(new CustomEvent('tryamm:history-campaign-enter',{detail:{campaign,evidence:campaign.evidence}}))
 })
 window.addEventListener('tryamm:mission-completed',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.source!=='chicago-time-machine')return
  const campaign=campaignForMission(String(d.missionId||''),String(d.title||''))
  if(!campaign)return
  const state=read()
  const completed=[...new Set([...state.completed,campaign.id])]
  const titles=[...new Set([...state.titles,String(campaign.unlocks?.[0]||'Chicago History Explorer')])]
  const next={...state,completed,titles,affinity:state.affinity+1,lastEra:campaign.era}
  write(next)
  window.dispatchEvent(new CustomEvent('tryamm:history-present-day-unlock',{detail:{
    campaignId:campaign.id,
    unlocks:campaign.unlocks,
    effects:STREETVERSE_TIME_MACHINE_PRESENT_DAY_EFFECTS.effects,
    state:next,
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${campaign.title} archived • present-day history unlocks added.`}}))
 })
 window.dispatchEvent(new CustomEvent('tryamm:history-campaign-ready',{detail:{campaigns:STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS.length,persistent:true}}))
}
