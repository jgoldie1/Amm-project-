export type RpgSkill='street'|'business'|'creator'|'tech'|'driving'|'rescue'|'leadership'|'investigation'
export type RpgFaction='community'|'business'|'creators'|'public-service'|'underground'|'academy'
export type RpgRelationship={characterId:string;trust:number;respect:number;history:string[];lastInteractionAt:string}
export type StreetVerseRpgState={
  version:1
  level:number
  xp:number
  skillPoints:number
  credits:number
  heat:number
  influence:number
  skills:Record<RpgSkill,number>
  factions:Record<RpgFaction,number>
  relationships:Record<string,RpgRelationship>
  inventory:string[]
  completedQuestIds:string[]
  activeQuestIds:string[]
  titles:string[]
  choices:string[]
  updatedAt:string
}

const KEY='tryamm.streetverse.rpg-core.v1'
const clamp=(v:number,min=0,max=100)=>Math.max(min,Math.min(max,v))
const SKILLS:RpgSkill[]=['street','business','creator','tech','driving','rescue','leadership','investigation']
const FACTIONS:RpgFaction[]=['community','business','creators','public-service','underground','academy']

function defaults():StreetVerseRpgState{
  return {
    version:1,
    level:1,
    xp:0,
    skillPoints:0,
    credits:0,
    heat:0,
    influence:0,
    skills:Object.fromEntries(SKILLS.map(k=>[k,1])) as Record<RpgSkill,number>,
    factions:Object.fromEntries(FACTIONS.map(k=>[k,0])) as Record<RpgFaction,number>,
    relationships:{},
    inventory:['Omni Passport'],
    completedQuestIds:[],
    activeQuestIds:[],
    titles:[],
    choices:[],
    updatedAt:new Date().toISOString(),
  }
}

function levelFor(xp:number){return Math.max(1,Math.floor(Math.sqrt(Math.max(0,xp)/220))+1)}
function clone<T>(value:T):T{return JSON.parse(JSON.stringify(value)) as T}
function save(state:StreetVerseRpgState){if(typeof localStorage!=='undefined')try{localStorage.setItem(KEY,JSON.stringify(state))}catch{}}
function load():StreetVerseRpgState{
  if(typeof localStorage==='undefined')return defaults()
  try{
    const raw=JSON.parse(localStorage.getItem(KEY)||'null')
    if(raw?.version!==1)return defaults()
    const next={...defaults(),...raw}
    next.skills={...defaults().skills,...raw.skills}
    next.factions={...defaults().factions,...raw.factions}
    next.relationships=raw.relationships&&typeof raw.relationships==='object'?raw.relationships:{}
    next.inventory=Array.isArray(raw.inventory)?raw.inventory.map(String):['Omni Passport']
    next.completedQuestIds=Array.isArray(raw.completedQuestIds)?raw.completedQuestIds.map(String):[]
    next.activeQuestIds=Array.isArray(raw.activeQuestIds)?raw.activeQuestIds.map(String):[]
    next.titles=Array.isArray(raw.titles)?raw.titles.map(String):[]
    next.choices=Array.isArray(raw.choices)?raw.choices.map(String):[]
    next.level=levelFor(Number(next.xp)||0)
    return next
  }catch{return defaults()}
}
function emit(state:StreetVerseRpgState,reason:string){
  state.updatedAt=new Date().toISOString()
  save(state)
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:rpg-state',{detail:{...clone(state),reason}}))
}
function reward(state:StreetVerseRpgState,{xp=0,credits=0,skill,faction,influence=0,heat=0}:{xp?:number;credits?:number;skill?:RpgSkill;faction?:RpgFaction;influence?:number;heat?:number}){
  const before=state.level
  state.xp=Math.max(0,state.xp+xp)
  state.credits=Math.max(0,state.credits+credits)
  state.influence=clamp(state.influence+influence)
  state.heat=clamp(state.heat+heat)
  if(skill)state.skills[skill]=clamp(state.skills[skill]+Math.max(1,Math.round(xp/140)),1,100)
  if(faction)state.factions[faction]=clamp(state.factions[faction]+Math.max(1,Math.round(xp/120)),-100,100)
  state.level=levelFor(state.xp)
  if(state.level>before)state.skillPoints+=state.level-before
}
function relationship(state:StreetVerseRpgState,characterId:string,deltaTrust:number,deltaRespect:number,history:string){
  const prev=state.relationships[characterId]||{characterId,trust:0,respect:0,history:[],lastInteractionAt:new Date().toISOString()}
  state.relationships[characterId]={
    ...prev,
    trust:clamp(prev.trust+deltaTrust,-100,100),
    respect:clamp(prev.respect+deltaRespect,-100,100),
    history:[history,...prev.history].slice(0,30),
    lastInteractionAt:new Date().toISOString(),
  }
}
export function installStreetVerseRpgCore(){
  if(typeof window==='undefined')return()=>{}
  let state=load()
  const publish=(reason:string)=>emit(state,reason)

  const onMissionStart=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const id=String(d.missionId||d.id||'')
    if(id&&!state.activeQuestIds.includes(id))state.activeQuestIds.push(id)
    publish('mission-start')
  }
  const onMissionComplete=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const id=String(d.missionId||d.id||'mission-'+Date.now())
    state.activeQuestIds=state.activeQuestIds.filter(x=>x!==id)
    if(!state.completedQuestIds.includes(id))state.completedQuestIds.push(id)
    const text=JSON.stringify(d).toLowerCase()
    let skill:RpgSkill='street', faction:RpgFaction='community'
    if(text.includes('business')||text.includes('delivery')){skill='business';faction='business'}
    else if(text.includes('creator')||text.includes('reel')||text.includes('live')){skill='creator';faction='creators'}
    else if(text.includes('fire')||text.includes('rescue')||text.includes('ems')){skill='rescue';faction='public-service'}
    else if(text.includes('school')||text.includes('academy')){skill='leadership';faction='academy'}
    else if(text.includes('investigat')||text.includes('crime')){skill='investigation';faction='community'}
    reward(state,{xp:Number(d.xp||d.rewardXp||160),credits:Number(d.credits||0),skill,faction,influence:2,heat:text.includes('crime')?-1:0})
    publish('mission-complete')
  }
  const onNpc=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const id=String(d.characterId||d.npcId||d.npc||d.name||'unknown')
    relationship(state,id,1,1,String(d.text||d.dialogue||'conversation'))
    reward(state,{xp:8,skill:'leadership',influence:1})
    publish('npc-interaction')
  }
  const onChoice=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const token=[d.missionId,d.stepId,d.choiceId].filter(Boolean).join(':')
    if(token&&!state.choices.includes(token))state.choices.push(token)
    reward(state,{xp:10,skill:'leadership'})
    publish('choice')
  }
  const onGameplay=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const action=String(d.action||'')
    if(action==='complete-delivery')reward(state,{xp:35,credits:25,skill:'driving',faction:'business'})
    if(action==='open-business')reward(state,{xp:60,skill:'business',faction:'business',influence:3})
    if(action==='complete-transit-mission')reward(state,{xp:50,skill:'driving',faction:'community'})
    if(action==='host-creator-event')reward(state,{xp:55,skill:'creator',faction:'creators',influence:4})
    if(action==='public-safety-mission')reward(state,{xp:55,skill:'rescue',faction:'public-service',heat:-4})
    publish('gameplay-action')
  }
  const onIncident=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const kind=String(d.kind||'')
    if(/crime|shoot|gun/i.test(kind))state.heat=clamp(state.heat+4)
    if(/fire|wreck|rescue/i.test(kind))reward(state,{xp:12,skill:'rescue'})
    publish('incident')
  }
  const onItem=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    const id=String(d.itemId||d.id||'')
    if(id&&!state.inventory.includes(id))state.inventory.push(id)
    publish('inventory')
  }
  const onMod=(event:Event)=>{
    const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
    if(String(d.id||'').includes('starter'))reward(state,{xp:20,skill:'tech'})
    publish('mod')
  }
  const onRequest=()=>publish('request')

  addEventListener('tryamm:streetverse-mission-start',onMissionStart)
  addEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
  addEventListener('tryamm:npc-conversation',onNpc)
  addEventListener('tryamm:universal-mission-choice',onChoice)
  addEventListener('tryamm:streetverse-gameplay-action',onGameplay)
  addEventListener('tryamm:city-incident',onIncident)
  addEventListener('tryamm:inventory-item-granted',onItem)
  addEventListener('tryamm:mod-installed',onMod)
  addEventListener('tryamm:rpg-state-request',onRequest)

  publish('startup')
  window.dispatchEvent(new CustomEvent('tryamm:rpg-core-ready',{detail:{
    version:'1.0.0',
    persistent:true,
    skills:SKILLS,
    factions:FACTIONS,
    relationships:true,
    inventory:true,
    quests:true,
    reputation:true,
    choices:true,
    cityBridge:true,
    modPassBridge:true,
  }}))

  return()=>{
    removeEventListener('tryamm:streetverse-mission-start',onMissionStart)
    removeEventListener('tryamm:streetverse-mission-complete',onMissionComplete)
    removeEventListener('tryamm:npc-conversation',onNpc)
    removeEventListener('tryamm:universal-mission-choice',onChoice)
    removeEventListener('tryamm:streetverse-gameplay-action',onGameplay)
    removeEventListener('tryamm:city-incident',onIncident)
    removeEventListener('tryamm:inventory-item-granted',onItem)
    removeEventListener('tryamm:mod-installed',onMod)
    removeEventListener('tryamm:rpg-state-request',onRequest)
  }
}
