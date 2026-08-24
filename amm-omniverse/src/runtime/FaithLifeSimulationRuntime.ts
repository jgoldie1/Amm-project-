import { useGameStore } from '../game/state/useGameStore'

export type FaithTier={
  id:string
  label:string
  minFaith:number
  minLevel:number
  focus:string[]
  unlocks:string[]
}

export const FAITH_TIERS:FaithTier[]=[
  {id:'seeker',label:'Seeker',minFaith:0,minLevel:1,focus:['learning','reflection','community introduction'],unlocks:['guided faith missions','community service']},
  {id:'student',label:'Student',minFaith:25,minLevel:2,focus:['study','discipline','service'],unlocks:['study missions','mentor conversations']},
  {id:'servant',label:'Servant',minFaith:50,minLevel:3,focus:['service','care','peace'],unlocks:['service projects','safe-passage support']},
  {id:'builder',label:'Community Builder',minFaith:80,minLevel:5,focus:['mentorship','family','neighborhood building'],unlocks:['mentorship missions','community events']},
  {id:'watchman',label:'Watchman',minFaith:120,minLevel:8,focus:['wisdom','prevention','protection'],unlocks:['guardian support','de-escalation missions']},
  {id:'shepherd',label:'Shepherd',minFaith:170,minLevel:12,focus:['leadership','care','teaching'],unlocks:['leadership missions','youth guidance']},
  {id:'ambassador',label:'Ambassador',minFaith:230,minLevel:18,focus:['peace','global service','cross-cultural respect'],unlocks:['international service missions','global community diplomacy']},
  {id:'steward',label:'Kingdom Steward',minFaith:300,minLevel:25,focus:['legacy','stewardship','global responsibility'],unlocks:['legacy missions','world stewardship arcs']},
]

const KEY='tryamm_faith_simulation_progress_v1'
let installed=false

function tierFor(faith:number,level:number){
  return [...FAITH_TIERS].reverse().find(t=>faith>=t.minFaith&&level>=t.minLevel)||FAITH_TIERS[0]
}
function publish(){
  const {player}=useGameStore.getState()
  const tier=tierFor(Number(player.faith||0),Number(player.level||1))
  const detail={
    foundation:'faith-based-life-simulation',
    faith:Number(player.faith||0),
    level:Number(player.level||1),
    tier,
    tiers:FAITH_TIERS,
    principle:'Every game lane lives inside one faith-centered life simulation; choices can grow service, wisdom, reputation, family legacy, creativity, business, and community responsibility.',
  }
  try{localStorage.setItem(KEY,JSON.stringify({faith:detail.faith,level:detail.level,tierId:tier.id,savedAt:Date.now()}))}catch{}
  document.documentElement.dataset.streetverseFaithTier=tier.id
  window.dispatchEvent(new CustomEvent('tryamm:faith-simulation-state',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-level-context',{detail:{level:detail.level,faith:detail.faith,faithTier:tier.id}}))
}

export function installFaithLifeSimulationRuntime(){
  if(installed||typeof window==='undefined')return
  installed=true
  queueMicrotask(publish)
  useGameStore.subscribe(()=>publish())
  window.addEventListener('tryamm:faith-simulation-request',publish)
}
