import {useEffect,useMemo,useState} from 'react'
import {
  FAMILY_TO_UNIVERSAL_MISSION,
  UNIVERSAL_MISSIONS,
  UNIVERSAL_MISSION_WORLD_LABELS,
  getUniversalMission,
  type UniversalMission,
  type UniversalMissionAction,
  type UniversalMissionEvent,
  type UniversalMissionStep,
  type UniversalMissionWorld,
} from '../data/universalMissionRegistry'

type MissionProgress={
  missionId:string
  step:number
  status:'active'|'complete'
  startedAt:string
  completedAt?:string
  choices:Record<string,string>
}

type WorldState={
  completedMissionIds:string[]
  consequenceTags:string[]
  history:{missionId:string;title:string;world:UniversalMissionWorld;tags:string[];completedAt:string}[]
}

const KEY='tryamm:universal-mission.progress.v1'
const WORLD_KEY='tryamm:universal-mission.world-state.v2'

function normalizeProgress(value:any):MissionProgress|null{
  if(!value||typeof value!=='object'||!getUniversalMission(String(value.missionId||'')))return null
  return {
    missionId:String(value.missionId),
    step:Math.max(0,Number(value.step)||0),
    status:value.status==='complete'?'complete':'active',
    startedAt:String(value.startedAt||new Date().toISOString()),
    completedAt:value.completedAt?String(value.completedAt):undefined,
    choices:value.choices&&typeof value.choices==='object'?value.choices:{},
  }
}

function readProgress():MissionProgress|null{
  if(typeof localStorage==='undefined')return null
  try{return normalizeProgress(JSON.parse(localStorage.getItem(KEY)||'null'))}catch{return null}
}

function saveProgress(value:MissionProgress|null){
  if(typeof localStorage==='undefined')return
  try{
    if(value)localStorage.setItem(KEY,JSON.stringify(value))
    else localStorage.removeItem(KEY)
  }catch{}
}

function emptyWorldState():WorldState{return {completedMissionIds:[],consequenceTags:[],history:[]}}

function readWorldState():WorldState{
  if(typeof localStorage==='undefined')return emptyWorldState()
  try{
    const raw=JSON.parse(localStorage.getItem(WORLD_KEY)||'null')||{}
    return {
      completedMissionIds:Array.isArray(raw.completedMissionIds)?raw.completedMissionIds.map(String):[],
      consequenceTags:Array.isArray(raw.consequenceTags)?raw.consequenceTags.map(String):[],
      history:Array.isArray(raw.history)?raw.history.slice(0,40):[],
    }
  }catch{return emptyWorldState()}
}

function saveWorldState(state:WorldState){
  if(typeof localStorage==='undefined')return
  try{localStorage.setItem(WORLD_KEY,JSON.stringify(state))}catch{}
}

function choiceTags(mission:UniversalMission,progress:MissionProgress){
  const tags:string[]=[]
  for(const step of mission.steps){
    const selected=progress.choices[step.id]
    const choice=step.choices?.find(item=>item.id===selected)
    if(choice)tags.push(...choice.impactTags)
  }
  return tags
}

function completeStoredMission(current:MissionProgress,mission:UniversalMission){
  const completedAt=new Date().toISOString()
  const done:MissionProgress={...current,status:'complete',completedAt}
  saveProgress(done)
  const previous=readWorldState()
  const tags=[...(mission.consequenceTags||[]),...choiceTags(mission,current)]
  const next:WorldState={
    completedMissionIds:Array.from(new Set([...previous.completedMissionIds,mission.id])),
    consequenceTags:Array.from(new Set([...previous.consequenceTags,...tags])),
    history:[{missionId:mission.id,title:mission.title,world:mission.world,tags,completedAt},...previous.history].slice(0,40),
  }
  saveWorldState(next)
  dispatchEvent(new CustomEvent('tryamm:universal-mission-complete',{detail:{missionId:mission.id,title:mission.title,world:mission.world,rewardXp:mission.rewardXp,financialReward:false,tags,choices:current.choices}}))
  dispatchEvent(new CustomEvent('tryamm:world-consequence-apply',{detail:{missionId:mission.id,world:mission.world,tags,choices:current.choices,completedAt}}))
  dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:mission.id,id:mission.id,label:mission.title,xp:mission.rewardXp,financialReward:false,source:'universal-mission-director',tags}}))
  return {progress:done,worldState:next}
}

function advanceStoredMission(expectedMissionId?:string,expectedStep?:number){
  const current=readProgress()
  if(!current||current.status!=='active')return current
  if(expectedMissionId&&current.missionId!==expectedMissionId)return current
  if(expectedStep!==undefined&&current.step!==expectedStep)return current
  const mission=getUniversalMission(current.missionId)
  if(!mission)return current
  if(current.step>=mission.steps.length-1)return completeStoredMission(current,mission).progress
  const next:MissionProgress={...current,step:current.step+1}
  saveProgress(next)
  const nextStep=mission.steps[next.step]
  dispatchEvent(new CustomEvent('tryamm:universal-mission-objective',{detail:{missionId:mission.id,step:next.step,objective:nextStep?.detail,choices:next.choices}}))
  return next
}

function runAction(action:UniversalMissionAction|undefined){
  if(!action)return
  if(action==='open-media-studio'){
    dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'universal-mission-director',mode:'64-track'}}))
    return
  }
  if(action==='open-streetverse'){window.location.href='/streetverse';return}
  if(action==='open-streetverse-global'){window.location.href='/streetverse?global=1&city=chicago';return}
  if(action==='open-we-are-the-world'){window.location.href='/we-are-the-world';return}
  if(action==='open-starverse'){window.location.href='/starverse';return}
  if(action==='open-gameverse'){
    const show=(window as any).__showGameVerse
    if(typeof show==='function')show('living-quest')
    else window.location.href='/?open=gameverse'
    return
  }
  if(action==='open-meet-the-stubbs'){window.location.href='/streetverse/meet-the-stubbs';return}
  if(action==='open-after-dark-alpha'){
    window.dispatchEvent(new CustomEvent('tryamm:open-after-dark-alpha',{detail:{source:'living-mission-director'}}))
  }
}

function expectedEvent(step:UniversalMissionStep,progress:MissionProgress):UniversalMissionEvent{
  if(step.eventByChoice&&step.choiceSourceStepId){
    const selected=progress.choices[step.choiceSourceStepId]
    return step.eventByChoice[selected]||step.event||'manual'
  }
  return step.event||'manual'
}

function expectedAction(step:UniversalMissionStep,progress:MissionProgress):UniversalMissionAction|undefined{
  if(step.actionByChoice&&step.choiceSourceStepId){
    const selected=progress.choices[step.choiceSourceStepId]
    return step.actionByChoice[selected]||step.action
  }
  return step.action
}

function matchesDetail(step:UniversalMissionStep,detail:any){
  if(!step.match)return true
  return Object.entries(step.match).every(([key,value])=>String(detail?.[key]??'').toLowerCase()===String(value).toLowerCase())
}

function signalFromBrowserEvent(name:string,detail:any):UniversalMissionEvent|null{
  if(name==='tryamm:stubbs-family-interaction')return detail?.type==='store'?'store-interaction':'family-interaction'
  if(name==='tryamm:media-studio-open')return 'media-open'
  if(name==='tryamm:media-studio-project-started')return 'media-project'
  if(name==='tryamm:media-studio-output-ready'||name==='tryamm:media-publish-queued')return 'media-output'
  if(name==='tryamm:streetverse-vehicle-controlled')return detail?.entered===false?'vehicle-exit':detail?.entered===true?'vehicle-enter':null
  if(name==='tryamm:streetverse-world-event-join')return 'world-event-join'
  if(name==='tryamm:streetverse-checkpoint')return 'street-checkpoint'
  if(name==='tryamm:streetverse-mission-complete')return 'mission-complete'
  if(name==='tryamm:hero-realms-encounter-complete')return 'hero-encounter-complete'
  if(name==='tryamm:after-dark-state'){
    if(detail?.stage==='complete')return 'after-dark-complete'
    if(detail?.approach)return 'after-dark-approach'
  }
  return null
}

export default function UniversalMissionDirector({defaultWorld='streetverse'}:{defaultWorld?:UniversalMissionWorld}){
  const [open,setOpen]=useState(false)
  const [world,setWorld]=useState<UniversalMissionWorld>(defaultWorld)
  const [progress,setProgress]=useState<MissionProgress|null>(()=>readProgress())
  const [worldState,setWorldState]=useState<WorldState>(()=>readWorldState())
  const missions=useMemo(()=>UNIVERSAL_MISSIONS.filter(m=>m.world===world),[world])
  const active=progress?getUniversalMission(progress.missionId):undefined
  const step=active&&progress?active.steps[Math.min(progress.step,active.steps.length-1)]:undefined
  const activeSignal=step&&progress?expectedEvent(step,progress):'manual'
  const activeAction=step&&progress?expectedAction(step,progress):undefined

  const start=(mission:UniversalMission)=>{
    const next:MissionProgress={missionId:mission.id,step:0,status:'active',startedAt:new Date().toISOString(),choices:{}}
    saveProgress(next);setProgress(next);setWorld(mission.world);setOpen(true)
    dispatchEvent(new CustomEvent('tryamm:universal-mission-start',{detail:{missionId:mission.id,title:mission.title,world:mission.world,steps:mission.steps.length,rewardXp:mission.rewardXp,dynamic:Boolean(mission.dynamic),coOp:Boolean(mission.coOp)}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:mission.id,id:mission.id,title:mission.title,objective:mission.steps[0]?.detail||mission.summary,source:'universal-mission-director'}}))
  }

  const advance=()=>{
    const next=advanceStoredMission()
    if(next)setProgress(next)
    setWorldState(readWorldState())
  }

  const choose=(stepId:string,choiceId:string)=>{
    const current=readProgress()
    const mission=current?getUniversalMission(current.missionId):undefined
    if(!current||!mission||current.status!=='active')return
    const currentStep=mission.steps[current.step]
    if(currentStep?.id!==stepId||!currentStep.choices?.some(choice=>choice.id===choiceId))return
    const next:MissionProgress={...current,choices:{...current.choices,[stepId]:choiceId}}
    saveProgress(next);setProgress(next)
    const choice=currentStep.choices.find(item=>item.id===choiceId)
    dispatchEvent(new CustomEvent('tryamm:universal-mission-choice',{detail:{missionId:mission.id,stepId,choiceId,impactTags:choice?.impactTags||[]}}))
    const advanced=advanceStoredMission(mission.id,current.step)
    if(advanced)setProgress(advanced)
  }

  useEffect(()=>{
    const browserEvents=[
      'tryamm:stubbs-family-interaction',
      'tryamm:media-studio-open',
      'tryamm:media-studio-project-started',
      'tryamm:media-studio-output-ready',
      'tryamm:media-publish-queued',
      'tryamm:streetverse-vehicle-controlled',
      'tryamm:streetverse-world-event-join',
      'tryamm:streetverse-checkpoint',
      'tryamm:streetverse-mission-complete',
      'tryamm:hero-realms-encounter-complete',
      'tryamm:after-dark-state',
    ] as const
    const onSignal=(event:Event)=>{
      const detail=(event as CustomEvent<any>).detail||{}
      const signal=signalFromBrowserEvent(event.type,detail)
      if(!signal)return
      const current=readProgress()
      const mission=current?getUniversalMission(current.missionId):undefined
      if(!current||!mission||current.status!=='active')return
      const currentStep=mission.steps[current.step]
      if(!currentStep||expectedEvent(currentStep,current)!==signal||!matchesDetail(currentStep,detail))return
      const next=advanceStoredMission(mission.id,current.step)
      if(next)setProgress(next)
      setWorldState(readWorldState())
    }
    browserEvents.forEach(name=>addEventListener(name,onSignal as EventListener))
    const openMission=(event:Event)=>{
      const detail=(event as CustomEvent<{missionId?:string;start?:boolean}>).detail||{}
      const mission=getUniversalMission(detail.missionId)
      if(!mission)return
      setWorld(mission.world);setOpen(true)
      if(detail.start)start(mission)
    }
    const familyAccepted=(event:Event)=>{
      const detail=(event as CustomEvent<{id?:string;missionId?:string}>).detail||{}
      const id=String(detail.id||detail.missionId||'')
      const universalId=FAMILY_TO_UNIVERSAL_MISSION[id]
      const mission=getUniversalMission(universalId)
      if(!mission)return
      start(mission)
      if(universalId==='brielle-64-track-welcome'){
        const next=advanceStoredMission(universalId,0)
        if(next)setProgress(next)
      }
    }
    addEventListener('tryamm:universal-mission-open',openMission)
    addEventListener('tryamm:stubbs-family-mission-accepted',familyAccepted)
    return()=>{
      browserEvents.forEach(name=>removeEventListener(name,onSignal as EventListener))
      removeEventListener('tryamm:universal-mission-open',openMission)
      removeEventListener('tryamm:stubbs-family-mission-accepted',familyAccepted)
    }
  },[])

  const btn:React.CSSProperties={minHeight:42,borderRadius:11,border:'1px solid #4f718c',background:'#0a1722',color:'#fff',fontWeight:900,fontSize:10,padding:'8px 10px',touchAction:'manipulation'}

  if(!open)return <button aria-label="Open Universal Mission Director" onClick={()=>setOpen(true)} style={{...btn,position:'fixed',right:12,bottom:'max(90px,calc(env(safe-area-inset-bottom) + 90px))',zIndex:47020,borderColor:'#ffd45e88',background:'#171205ee',color:'#ffe89b',boxShadow:'0 10px 30px #0009'}}>MISSIONS</button>

  return <section aria-label="Universal Mission Director" style={{position:'fixed',inset:'max(72px,calc(env(safe-area-inset-top) + 58px)) 8px max(12px,env(safe-area-inset-bottom))',zIndex:47030,maxWidth:440,margin:'0 auto',border:'1px solid #5be7ff88',borderRadius:18,background:'rgba(3,10,17,.98)',boxShadow:'0 22px 70px #000d',color:'#fff',fontFamily:'system-ui,sans-serif',overflow:'hidden',display:'flex',flexDirection:'column'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',padding:11,borderBottom:'1px solid #243b4d'}}>
      <div><b style={{fontSize:13}}>LIVING MISSION DIRECTOR</b><div style={{fontSize:9,color:'#8feeff'}}>Choices • gameplay signals • persistent consequences • cross-world progression</div></div>
      <button aria-label="Close mission director" onClick={()=>setOpen(false)} style={{...btn,minWidth:44,fontSize:18}}>×</button>
    </header>
    <div style={{padding:10,overflowY:'auto'}}>
      {active&&progress?.status==='active'&&step&&<section style={{padding:11,border:'1px solid #ffd45e66',borderRadius:14,background:'#171205',marginBottom:10}}>
        <div style={{display:'flex',gap:5,flexWrap:'wrap',fontSize:8,fontWeight:950}}>
          <span style={{color:'#ffd45e'}}>ACTIVE • {UNIVERSAL_MISSION_WORLD_LABELS[active.world]}</span>
          {active.dynamic&&<span style={{color:'#8feeff'}}>• DYNAMIC</span>}
          {active.coOp&&<span style={{color:'#a8ffbf'}}>• CO-OP READY</span>}
          {active.night&&<span style={{color:'#d58cff'}}>• AFTER DARK</span>}
          {active.adultOnly&&<span style={{color:'#ffd184'}}>• 21+ GATED</span>}
        </div>
        <b style={{display:'block',marginTop:4}}>{active.title}</b>
        <div style={{fontSize:11,color:'#d7d0b1',marginTop:5}}>Objective {progress.step+1}/{active.steps.length}: <b>{step.label}</b></div>
        <div style={{fontSize:10,lineHeight:1.45,marginTop:4,color:'#b9c6d0'}}>{step.detail}</div>
        {step.choices?.length?<div style={{display:'grid',gap:6,marginTop:9}}>{step.choices.map(choice=><button key={choice.id} onClick={()=>choose(step.id,choice.id)} style={{...btn,textAlign:'left',borderColor:'#b794ff88',background:'#130d22'}}><b>{choice.label}</b><span style={{display:'block',fontSize:9,opacity:.75,marginTop:2}}>{choice.detail}</span></button>)}</div>:null}
        {!step.choices&&<div style={{display:'grid',gridTemplateColumns:activeAction?'1fr 1fr':'1fr',gap:6,marginTop:8}}>
          {activeAction?<button onClick={()=>{setOpen(false);runAction(activeAction)}} style={btn}>GO / OPEN</button>:null}
          {activeSignal==='manual'?<button onClick={advance} style={{...btn,borderColor:'#78ffb488',color:'#bfffd8'}}>{progress.step===active.steps.length-1?'FINISH MISSION':'OBJECTIVE DONE'}</button>:<div aria-live="polite" style={{...btn,display:'grid',placeItems:'center',borderColor:'#5be7ff66',color:'#aeefff',cursor:'default'}}>AUTO-CHECK • {activeSignal.replaceAll('-',' ').toUpperCase()}</div>}
        </div>}
        {Object.keys(progress.choices).length>0&&<div style={{fontSize:9,color:'#bca8ff',marginTop:8}}>Story choices: {Object.values(progress.choices).join(' • ')}</div>}
      </section>}
      {active&&progress?.status==='complete'&&<section style={{padding:11,border:'1px solid #78ffb466',borderRadius:14,background:'#07170e',marginBottom:10}}><b style={{color:'#9dffc2'}}>MISSION COMPLETE ✓</b><div style={{fontSize:10,marginTop:4}}>{active.title} • {active.rewardXp} XP mission reward record created.</div></section>}
      {worldState.consequenceTags.length>0&&<section style={{padding:9,border:'1px solid #304f43',borderRadius:12,background:'#07140e',marginBottom:9}}><b style={{fontSize:9,color:'#9dffc2'}}>WORLD CONSEQUENCES REMEMBERED</b><div style={{fontSize:9,color:'#a9c3b2',marginTop:4,lineHeight:1.45}}>{worldState.consequenceTags.slice(-8).join(' • ')}</div></section>}
      <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:7}}>
        {(Object.keys(UNIVERSAL_MISSION_WORLD_LABELS) as UniversalMissionWorld[]).map(key=><button key={key} onClick={()=>setWorld(key)} style={{...btn,whiteSpace:'nowrap',minHeight:36,background:world===key?'#123047':'#09131c',borderColor:world===key?'#5be7ff':'#294252'}}>{UNIVERSAL_MISSION_WORLD_LABELS[key]}</button>)}
      </div>
      <div style={{display:'grid',gap:7}}>
        {missions.map(m=>{
          const locked=Boolean(m.requiresAnyTags?.length&&!m.requiresAnyTags.some(tag=>worldState.consequenceTags.includes(tag)))
          return <article key={m.id} style={{padding:10,border:'1px solid #22394a',borderRadius:13,background:locked?'#0b0d10':'#07121b',opacity:locked?0.72:1}}>
            <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:12}}>{m.title}</b><span style={{fontSize:9,color:locked?'#7e8998':'#8effb7'}}>{locked?'LOCKED':m.rewardXp+' XP'}</span></div>
            <div style={{fontSize:10,color:'#a8bac7',lineHeight:1.45,marginTop:4}}>{m.summary}</div>
            <div style={{display:'flex',gap:5,flexWrap:'wrap',fontSize:8,marginTop:6,color:'#9fb2c0'}}><span>{m.steps.length} OBJECTIVES</span>{m.dynamic&&<span>• DYNAMIC STORY</span>}{m.coOp&&<span>• CO-OP</span>}{m.night&&<span>• AFTER DARK</span>}{m.adultOnly&&<span>• 21+ GATE</span>}{worldState.completedMissionIds.includes(m.id)&&<span style={{color:'#9dffc2'}}>• COMPLETED BEFORE</span>}</div>
            {locked?<div style={{fontSize:9,color:'#d7b98d',marginTop:5}}>Story unlock: complete an earlier route that creates {m.requiresAnyTags?.join(' / ')}</div>:null}
            {m.unlocks?.length?<div style={{fontSize:9,color:'#bca8ff',marginTop:5}}>Unlocks: {m.unlocks.join(' • ')}</div>:null}
            <button disabled={locked} onClick={()=>!locked&&start(m)} style={{...btn,width:'100%',marginTop:7,borderColor:locked?'#3a4149':'#5be7ff88',opacity:locked?0.55:1}}>{locked?'LOCKED BY YOUR STORY':progress?.missionId===m.id&&progress.status==='active'?'RESTART / FOCUS':'START MISSION'}</button>
          </article>
        })}
      </div>
    </div>
  </section>
}
