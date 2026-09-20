import {STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS,STREETVERSE_TIME_MACHINE_PRESENT_DAY_EFFECTS} from '../config/streetverseChicagoHistoricalCampaigns'

const KEY='tryamm.streetverse.history-legacy.v1'
let installed=false

type HistoryChoice='A'|'B'|'C'
type HistoryState={
 completed:string[]
 titles:string[]
 affinity:number
 choices:Record<string,HistoryChoice>
 lastEra?:string
 updatedAt?:string
}

function read():HistoryState{
 try{return {...{completed:[],titles:[],affinity:0,choices:{}},...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return{completed:[],titles:[],affinity:0,choices:{}}}
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
 window.addEventListener('tryamm:rp-choice-selected',(event:Event)=>{
  const d=(event as CustomEvent<{choice?:HistoryChoice;campaignId?:string;routeDescription?:string}>).detail||{}
  if(!d.campaignId||!d.choice)return
  const state=read()
  const next={...state,choices:{...(state.choices||{}),[d.campaignId]:d.choice}}
  write(next)
  window.dispatchEvent(new CustomEvent('tryamm:history-route-locked',{detail:{campaignId:d.campaignId,choice:d.choice,routeDescription:d.routeDescription||''}}))
 })
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
  const choice=state.choices?.[campaign.id]
  const next={...state,completed,titles,affinity:state.affinity+1,lastEra:campaign.era}
  write(next)
  window.dispatchEvent(new CustomEvent('tryamm:history-present-day-unlock',{detail:{
    campaignId:campaign.id,
    unlocks:campaign.unlocks,
    effects:STREETVERSE_TIME_MACHINE_PRESENT_DAY_EFFECTS.effects,
    choice,
    route:choice?campaign.routes[choice]:undefined,
    state:next,
  }}))
  window.dispatchEvent(new CustomEvent('tryamm:toast',{detail:{message:`${campaign.title} archived • present-day history unlocks added.`}}))
 })
 window.dispatchEvent(new CustomEvent('tryamm:history-campaign-ready',{detail:{campaigns:STREETVERSE_CHICAGO_HISTORY_CAMPAIGNS.length,persistent:true}}))
}
