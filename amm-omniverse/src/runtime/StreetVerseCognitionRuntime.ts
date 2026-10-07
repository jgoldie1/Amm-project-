export type StreetVerseCognitionAction=
 |'patrol'|'observe'|'greet'|'assist'|'guide'|'investigate'|'seek-safety'|'deescalate'|'socialize'|'yield-path'

export type StreetVerseCognitionAgentFrame={
 npcId:string
 role?:'resident'|'security'|'guide'|'vendor'|'responder'|'civilian'
 x:number
 z:number
 health?:number
 stress?:number
 coverNearby?:boolean
 crowdDensity?:number
 missionRelevance?:number
}

export type StreetVerseCognitionFrame={
 hero:{id?:string;x:number;z:number;heading?:number;moving?:boolean;vehicle?:boolean}
 agents:StreetVerseCognitionAgentFrame[]
 threatLevel?:number
 noiseLevel?:number
 missionId?:string
}

type AgentMemory={
 npcId:string
 encounters:number
 familiarity:number
 trust:number
 lastSeenHeroAt:number
 lastHeardHeroAt:number
 lastAction:StreetVerseCognitionAction
 lastDecisionAt:number
 recent:string[]
}

type CognitionFeed={
 npcId:string
 role:string
 focus:boolean
 action:StreetVerseCognitionAction
 confidence:number
 distance:number
 navigation:string
 animation:string
 plan:string[]
 scores:Array<{action:StreetVerseCognitionAction;score:number}>
 sense:{seeHero:boolean;hearHero:boolean;distance:number;health:number;stress:number;coverNearby:boolean;crowdDensity:number;weather:string;dayPhase:string;threatLevel:number}
 memory:{encounters:number;familiarity:number;trust:number;recent:string[]}
 reason:string
 at:number
}

const MEMORY_KEY='tryamm:streetverse-cognition-memory:v1'
const clamp01=(n:number)=>Math.max(0,Math.min(1,n))
const clampSigned=(n:number)=>Math.max(-1,Math.min(1,n))
const round=(n:number)=>Math.round(n*100)/100

function loadMemory(){
 const map=new Map<string,AgentMemory>()
 try{
  const parsed=JSON.parse(localStorage.getItem(MEMORY_KEY)||'[]') as AgentMemory[]
  for(const item of parsed.slice(0,64))if(item?.npcId)map.set(item.npcId,item)
 }catch{}
 return map
}

function saveMemory(memory:Map<string,AgentMemory>){
 try{
  const compact=[...memory.values()].sort((a,b)=>b.lastDecisionAt-a.lastDecisionAt).slice(0,64)
  localStorage.setItem(MEMORY_KEY,JSON.stringify(compact))
 }catch{}
}

function defaultMemory(npcId:string):AgentMemory{
 return{npcId,encounters:0,familiarity:0,trust:.5,lastSeenHeroAt:0,lastHeardHeroAt:0,lastAction:'patrol',lastDecisionAt:0,recent:[]}
}

function normalizeAngle(v:number){
 let a=v
 while(a>Math.PI)a-=Math.PI*2
 while(a< -Math.PI)a+=Math.PI*2
 return a
}

function planFor(action:StreetVerseCognitionAction){
 const plans:Record<StreetVerseCognitionAction,string[]>={
  patrol:['scan route','continue routine','recheck surroundings'],
  observe:['orient to stimulus','hold safe distance','re-evaluate intent'],
  greet:['make eye contact','approach conversational range','greet naturally'],
  assist:['assess need','move to useful position','offer help'],
  guide:['confirm mission context','lead toward objective','check player progress'],
  investigate:['locate stimulus','approach cautiously','classify what happened'],
  'seek-safety':['identify safer space','increase distance','reassess threat'],
  deescalate:['create space','use calm verbal cue','monitor response'],
  socialize:['pick nearby social target','join briefly','return to routine'],
  'yield-path':['notice collision risk','step aside','resume route'],
 }
 return plans[action]
}

function navigationFor(action:StreetVerseCognitionAction){
 const nav:Record<StreetVerseCognitionAction,string>={
  patrol:'resume-route',observe:'hold-and-face-hero',greet:'approach-conversation-range',assist:'approach-help-range',
  guide:'lead-to-mission-node',investigate:'approach-stimulus','seek-safety':'increase-distance',
  deescalate:'hold-buffer-zone',socialize:'approach-nearby-resident','yield-path':'step-aside',
 }
 return nav[action]
}

function animationFor(action:StreetVerseCognitionAction){
 const anim:Record<StreetVerseCognitionAction,string>={
  patrol:'walk-relaxed',observe:'idle-alert',greet:'wave-talk',assist:'concerned-talk',guide:'point-walk',
  investigate:'look-around','seek-safety':'fast-walk',deescalate:'open-hands-talk',socialize:'casual-talk','yield-path':'side-step',
 }
 return anim[action]
}

export function installStreetVerseCognitionRuntime(heroId='bj-stubbs'){
 if(typeof window==='undefined')return{dispose:()=>{},getMemory:()=>[] as AgentMemory[]}

 const memory=loadMemory()
 const lastTick=new Map<string,number>()
 let weather='clear'
 let dayPhase='day'
 let lastSaveAt=0

 const remember=(npcId:string,event:string,now:number)=>{
  const state=memory.get(npcId)||defaultMemory(npcId)
  state.recent=[event,...state.recent.filter(item=>item!==event)].slice(0,5)
  state.lastDecisionAt=now
  memory.set(npcId,state)
  return state
 }

 const choose=(agent:StreetVerseCognitionAgentFrame,frame:StreetVerseCognitionFrame,focusNpcId:string,now:number):CognitionFeed|null=>{
  const mem=memory.get(agent.npcId)||defaultMemory(agent.npcId)
  const dx=frame.hero.x-agent.x,dz=frame.hero.z-agent.z,distance=Math.hypot(dx,dz)
  const cadence=distance<12?220:distance<28?420:distance<55?900:1600
  if(now-(lastTick.get(agent.npcId)||0)<cadence)return null
  lastTick.set(agent.npcId,now)

  const visibilityRadius=weather==='fog'?14:dayPhase==='night'?19:28
  const seeHero=distance<=visibilityRadius
  const noise=clamp01(Number(frame.noiseLevel??(frame.hero.vehicle?0.82:(frame.hero.moving?0.32:0.05))))
  const hearHero=distance<=9+noise*25
  const health=clamp01(Number(agent.health??1))
  const stress=clamp01(Number(agent.stress??0))
  const threat=clamp01(Math.max(Number(frame.threatLevel||0),stress))
  const coverNearby=Boolean(agent.coverNearby)
  const crowd=clamp01(Number(agent.crowdDensity||0))
  const mission=clamp01(Number(agent.missionRelevance||0))
  const near=clamp01(1-distance/18)
  const veryNear=clamp01(1-distance/3.2)
  const role=agent.role||'resident'

  if(seeHero){
   if(now-mem.lastSeenHeroAt>7000)mem.encounters+=1
   mem.lastSeenHeroAt=now
   mem.familiarity=clamp01(mem.familiarity+.008+near*.012)
  }
  if(hearHero)mem.lastHeardHeroAt=now

  const scores:Record<StreetVerseCognitionAction,number>={
   patrol:.24+(seeHero?0:.16),
   observe:(seeHero?0.34:0)+(hearHero?0.18:0)+near*.28+threat*.10,
   greet:(seeHero?0.12:0)+near*.52+mem.familiarity*.20+mem.trust*.12-threat*.42,
   assist:(1-health)*.72+mission*.28+(role==='responder'?0.30:0)+near*.10,
   guide:mission*.82+(role==='guide'?0.28:0)+near*.12,
   investigate:(hearHero&&!seeHero?0.58:0)+noise*.18+threat*.18,
   'seek-safety':threat*.82+(coverNearby?0.10:0)+(1-health)*.28,
   deescalate:(role==='security'&&threat>0.22?0.62:0)+threat*.32+near*.10,
   socialize:crowd*.36+mem.familiarity*.16+(threat<0.2?0.08:0),
   'yield-path':veryNear*.92+(frame.hero.vehicle&&distance<5?0.20:0),
  }

  if(mem.lastAction)scores[mem.lastAction]+=0.07
  if(role==='security'){scores.observe+=.08;scores.patrol+=.08}
  if(role==='resident'&&mem.familiarity>.35)scores.greet+=.08
  if(frame.hero.vehicle&&distance<7){scores.observe+=.08;scores['yield-path']+=.12}

  const ranked=(Object.entries(scores) as Array<[StreetVerseCognitionAction,number]>)
   .map(([action,score])=>({action,score:round(clamp01(score))}))
   .sort((a,b)=>b.score-a.score)
  const winner=ranked[0]
  const runner=ranked[1]
  const action=winner.action
  const confidence=round(clamp01(.5+(winner.score-runner.score)*.9))
  const changed=action!==mem.lastAction

  if(changed){
   mem.lastAction=action
   mem.recent=[action,...mem.recent.filter(item=>item!==action)].slice(0,5)
  }
  if(action==='greet'||action==='assist'||action==='guide')mem.trust=clamp01(mem.trust+.004)
  mem.lastDecisionAt=now
  memory.set(agent.npcId,mem)

  const reason=[
   seeHero?'visual contact':hearHero?'heard movement':'no direct contact',
   distance<8?'close range':distance<24?'mid range':'far range',
   threat>.45?'elevated threat':'normal threat',
   mem.familiarity>.35?'familiar player':'limited familiarity',
  ].join(' • ')

  return{
   npcId:agent.npcId,
   role,
   focus:agent.npcId===focusNpcId,
   action,
   confidence,
   distance:round(distance),
   navigation:navigationFor(action),
   animation:animationFor(action),
   plan:planFor(action),
   scores:ranked.slice(0,4),
   sense:{seeHero,hearHero,distance:round(distance),health:round(health),stress:round(stress),coverNearby,crowdDensity:round(crowd),weather,dayPhase,threatLevel:round(threat)},
   memory:{encounters:mem.encounters,familiarity:round(mem.familiarity),trust:round(mem.trust),recent:[...mem.recent]},
   reason,
   at:now,
  }
 }

 const onFrame=(event:Event)=>{
  const frame=(event as CustomEvent<StreetVerseCognitionFrame>).detail
  if(!frame?.hero||!Array.isArray(frame.agents)||!frame.agents.length)return
  const now=performance.now()
  let focusNpcId=''
  let focusDistance=Infinity
  for(const agent of frame.agents){
   const d=Math.hypot(frame.hero.x-agent.x,frame.hero.z-agent.z)
   if(d<focusDistance){focusDistance=d;focusNpcId=agent.npcId}
  }

  let focused:CognitionFeed|null=null
  for(const agent of frame.agents){
   const feed=choose(agent,frame,focusNpcId,now)
   if(!feed)continue
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-npc-cognition-action',{detail:{
    npcId:feed.npcId,
    action:feed.action,
    navigation:feed.navigation,
    animation:feed.animation,
    confidence:feed.confidence,
    lookAtHero:feed.sense.seeHero&&feed.distance<18,
    source:'cognition-runtime-v1',
   }}))
   window.dispatchEvent(new CustomEvent('tryamm:npc-cognition-feed',{detail:feed}))
   if(feed.focus)focused=feed
  }

  if(focused&&focusDistance<20){
   const target=frame.agents.find(agent=>agent.npcId===focused!.npcId)
   if(target){
    const heroHeading=Number(frame.hero.heading||0)
    const bearing=Math.atan2(target.x-frame.hero.x,-(target.z-frame.hero.z))
    const relative=normalizeAngle(bearing-heroHeading)
    const side=clampSigned(relative/.85)
    window.dispatchEvent(new CustomEvent('tryamm:character-face-pose',{detail:{
     characterId:heroId,
     pose:{
      lookLeft:side<0?Math.abs(side):0,
      lookRight:side>0?side:0,
      browInnerUp:focused.action==='assist'?0.16:(focused.action==='observe'?0.08:0),
     },
     source:'cognition-awareness-v1',
    }}))
    window.dispatchEvent(new CustomEvent('tryamm:bj-cognition-awareness',{detail:{
     characterId:heroId,
     focusNpcId:focused.npcId,
     distance:focused.distance,
     npcAction:focused.action,
     crowdCount:frame.agents.filter(agent=>Math.hypot(frame.hero.x-agent.x,frame.hero.z-agent.z)<12).length,
     missionId:frame.missionId||null,
     source:'cognition-runtime-v1',
    }}))
   }
  }

  if(now-lastSaveAt>10000){lastSaveAt=now;saveMemory(memory)}
 }

 const onWeather=(event:Event)=>{const d=(event as CustomEvent<{weather?:string}>).detail||{};if(d.weather)weather=String(d.weather)}
 const onDayPhase=(event:Event)=>{const d=(event as CustomEvent<{phase?:string}>).detail||{};if(d.phase)dayPhase=String(d.phase)}
 const onPositiveInteraction=(event:Event)=>{
  const d=(event as CustomEvent<{npcId?:string}>).detail||{}
  if(!d.npcId)return
  const m=remember(String(d.npcId),'positive interaction',performance.now())
  m.trust=clamp01(m.trust+.06);m.familiarity=clamp01(m.familiarity+.04)
 }

 window.addEventListener('tryamm:npc-cognition-frame',onFrame)
 window.addEventListener('tryamm:world-weather',onWeather)
 window.addEventListener('tryamm:world-day-phase',onDayPhase)
 window.addEventListener('tryamm:streetverse-character-interaction-complete',onPositiveInteraction)

 queueMicrotask(()=>window.dispatchEvent(new CustomEvent('tryamm:npc-cognition-ready',{detail:{
  version:'v1',
  pipeline:['sense','remember','score','counterfactual-compare','plan','navigate','animate','learn'],
  deterministicCore:true,
  llmRequired:false,
  persistentMemory:true,
  adaptiveCadence:true,
  bjAwareness:true,
  source:'streetverse-cognition-runtime',
 }})))

 return{
  getMemory:()=>[...memory.values()],
  dispose:()=>{
   saveMemory(memory)
   window.removeEventListener('tryamm:npc-cognition-frame',onFrame)
   window.removeEventListener('tryamm:world-weather',onWeather)
   window.removeEventListener('tryamm:world-day-phase',onDayPhase)
   window.removeEventListener('tryamm:streetverse-character-interaction-complete',onPositiveInteraction)
  },
 }
}
