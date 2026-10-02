import {useEffect,useMemo,useState} from 'react'
import {
  FAMILY_TO_UNIVERSAL_MISSION,
  UNIVERSAL_MISSIONS,
  UNIVERSAL_MISSION_WORLD_LABELS,
  getUniversalMission,
  type UniversalMission,
  type UniversalMissionAction,
  type UniversalMissionWorld,
} from '../data/universalMissionRegistry'

type MissionProgress={
  missionId:string
  step:number
  status:'active'|'complete'
  startedAt:string
  completedAt?:string
}

const KEY='tryamm:universal-mission.progress.v1'

function readProgress():MissionProgress|null{
  if(typeof localStorage==='undefined')return null
  try{
    const value=JSON.parse(localStorage.getItem(KEY)||'null') as MissionProgress|null
    return value&&getUniversalMission(value.missionId)?value:null
  }catch{return null}
}

function saveProgress(value:MissionProgress|null){
  if(typeof localStorage==='undefined')return
  try{
    if(value)localStorage.setItem(KEY,JSON.stringify(value))
    else localStorage.removeItem(KEY)
  }catch{}
}

function advanceStoredMission(expectedMissionId?:string,expectedStep?:number){
  const current=readProgress()
  if(!current||current.status!=='active')return current
  if(expectedMissionId&&current.missionId!==expectedMissionId)return current
  if(expectedStep!==undefined&&current.step!==expectedStep)return current
  const mission=getUniversalMission(current.missionId)
  if(!mission)return current
  if(current.step>=mission.steps.length-1){
    const done:MissionProgress={...current,status:'complete',completedAt:new Date().toISOString()}
    saveProgress(done)
    dispatchEvent(new CustomEvent('tryamm:universal-mission-complete',{detail:{missionId:mission.id,title:mission.title,world:mission.world,rewardXp:mission.rewardXp,financialReward:false}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{missionId:mission.id,id:mission.id,label:mission.title,xp:mission.rewardXp,financialReward:false,source:'universal-mission-director'}}))
    return done
  }
  const next:MissionProgress={...current,step:current.step+1}
  saveProgress(next)
  const nextStep=mission.steps[next.step]
  dispatchEvent(new CustomEvent('tryamm:universal-mission-objective',{detail:{missionId:mission.id,step:next.step,objective:nextStep?.detail}}))
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
  if(action==='open-meet-the-stubbs'){window.location.href='/streetverse/meet-the-stubbs'}
}

export default function UniversalMissionDirector({defaultWorld='streetverse'}:{defaultWorld?:UniversalMissionWorld}){
  const [open,setOpen]=useState(false)
  const [world,setWorld]=useState<UniversalMissionWorld>(defaultWorld)
  const [progress,setProgress]=useState<MissionProgress|null>(()=>readProgress())
  const missions=useMemo(()=>UNIVERSAL_MISSIONS.filter(m=>m.world===world),[world])
  const active=progress?getUniversalMission(progress.missionId):undefined
  const step=active&&progress?active.steps[Math.min(progress.step,active.steps.length-1)]:undefined

  const start=(mission:UniversalMission)=>{
    const next:MissionProgress={missionId:mission.id,step:0,status:'active',startedAt:new Date().toISOString()}
    saveProgress(next);setProgress(next);setWorld(mission.world);setOpen(true)
    dispatchEvent(new CustomEvent('tryamm:universal-mission-start',{detail:{missionId:mission.id,title:mission.title,world:mission.world,steps:mission.steps.length,rewardXp:mission.rewardXp}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:mission.id,id:mission.id,title:mission.title,objective:mission.steps[0]?.detail||mission.summary,source:'universal-mission-director'}}))
  }

  const advance=()=>{const next=advanceStoredMission();if(next)setProgress(next)}

  useEffect(()=>{
    const openMission=(event:Event)=>{
      const detail=(event as CustomEvent<{missionId?:string;start?:boolean}>).detail||{}
      const mission=getUniversalMission(detail.missionId)
      if(!mission)return
      setWorld(mission.world);setOpen(true)
      if(detail.start)start(mission)
    }
    const familyAccepted=(event:Event)=>{
      const id=String((event as CustomEvent<{id?:string;missionId?:string}>).detail?.id||(event as CustomEvent<{missionId?:string}>).detail?.missionId||'')
      const universalId=FAMILY_TO_UNIVERSAL_MISSION[id]
      const mission=getUniversalMission(universalId)
      if(mission)start(mission)
    }
    const familyInteraction=(event:Event)=>{
      const name=String((event as CustomEvent<{name?:string}>).detail?.name||'').toLowerCase()
      const current=readProgress()
      if(!current||current.status!=='active')return
      if(current.missionId==='brielle-64-track-welcome'&&name==='brielle'){
        const next=advanceStoredMission('brielle-64-track-welcome',current.step===0?0:current.step===3?3:-1)
        if(next&&next!==current)setProgress(next)
      }
    }
    const mediaOpened=()=>{
      const current=readProgress()
      if(!current||current.status!=='active')return
      if(current.missionId==='brielle-64-track-welcome'&&current.step===1){const next=advanceStoredMission(current.missionId,1);if(next)setProgress(next)}
      if(current.missionId==='aniyah-64-track-first-session'&&current.step===0){const next=advanceStoredMission(current.missionId,0);if(next)setProgress(next)}
    }
    const mediaOutputReady=()=>{
      const current=readProgress()
      if(!current||current.status!=='active')return
      if(current.missionId==='brielle-64-track-welcome'&&current.step===2){const next=advanceStoredMission(current.missionId,2);if(next)setProgress(next)}
      if(current.missionId==='aniyah-64-track-first-session'&&(current.step===1||current.step===2)){const next=advanceStoredMission(current.missionId,current.step);if(next)setProgress(next)}
    }
    addEventListener('tryamm:universal-mission-open',openMission)
    addEventListener('tryamm:stubbs-family-mission-accepted',familyAccepted)
    addEventListener('tryamm:stubbs-family-interaction',familyInteraction)
    addEventListener('tryamm:media-studio-open',mediaOpened)
    addEventListener('tryamm:media-studio-output-ready',mediaOutputReady)
    addEventListener('tryamm:media-publish-queued',mediaOutputReady)
    return()=>{
      removeEventListener('tryamm:universal-mission-open',openMission)
      removeEventListener('tryamm:stubbs-family-mission-accepted',familyAccepted)
      removeEventListener('tryamm:stubbs-family-interaction',familyInteraction)
      removeEventListener('tryamm:media-studio-open',mediaOpened)
      removeEventListener('tryamm:media-studio-output-ready',mediaOutputReady)
      removeEventListener('tryamm:media-publish-queued',mediaOutputReady)
    }
  },[])

  const btn:React.CSSProperties={minHeight:42,borderRadius:11,border:'1px solid #4f718c',background:'#0a1722',color:'#fff',fontWeight:900,fontSize:10,padding:'8px 10px',touchAction:'manipulation'}

  if(!open)return <button aria-label="Open Universal Mission Director" onClick={()=>setOpen(true)} style={{...btn,position:'fixed',right:12,bottom:'max(90px,calc(env(safe-area-inset-bottom) + 90px))',zIndex:47020,borderColor:'#ffd45e88',background:'#171205ee',color:'#ffe89b',boxShadow:'0 10px 30px #0009'}}>MISSIONS</button>

  return <section aria-label="Universal Mission Director" style={{position:'fixed',inset:'max(72px,calc(env(safe-area-inset-top) + 58px)) 8px max(12px,env(safe-area-inset-bottom))',zIndex:47030,maxWidth:440,margin:'0 auto',border:'1px solid #5be7ff88',borderRadius:18,background:'rgba(3,10,17,.98)',boxShadow:'0 22px 70px #000d',color:'#fff',fontFamily:'system-ui,sans-serif',overflow:'hidden',display:'flex',flexDirection:'column'}}>
    <header style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center',padding:11,borderBottom:'1px solid #243b4d'}}>
      <div><b style={{fontSize:13}}>UNIVERSAL MISSION DIRECTOR</b><div style={{fontSize:9,color:'#8feeff'}}>StreetVerse • Global • We Are the World • Creator • Star • Hero • Omni</div></div>
      <button aria-label="Close mission director" onClick={()=>setOpen(false)} style={{...btn,minWidth:44,fontSize:18}}>×</button>
    </header>
    <div style={{padding:10,overflowY:'auto'}}>
      {active&&progress?.status==='active'&&step&&<section style={{padding:11,border:'1px solid #ffd45e66',borderRadius:14,background:'#171205',marginBottom:10}}>
        <div style={{fontSize:9,color:'#ffd45e',fontWeight:950}}>ACTIVE • {UNIVERSAL_MISSION_WORLD_LABELS[active.world]}</div>
        <b style={{display:'block',marginTop:3}}>{active.title}</b>
        <div style={{fontSize:11,color:'#d7d0b1',marginTop:5}}>Objective {progress.step+1}/{active.steps.length}: <b>{step.label}</b></div>
        <div style={{fontSize:10,lineHeight:1.45,marginTop:4,color:'#b9c6d0'}}>{step.detail}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:8}}>
          {step.action?<button onClick={()=>{setOpen(false);runAction(step.action)}} style={btn}>GO / OPEN</button>:<span/>}
          <button onClick={advance} style={{...btn,borderColor:'#78ffb488',color:'#bfffd8'}}>{progress.step===active.steps.length-1?'FINISH MISSION':'OBJECTIVE DONE'}</button>
        </div>
      </section>}
      {active&&progress?.status==='complete'&&<section style={{padding:11,border:'1px solid #78ffb466',borderRadius:14,background:'#07170e',marginBottom:10}}><b style={{color:'#9dffc2'}}>MISSION COMPLETE ✓</b><div style={{fontSize:10,marginTop:4}}>{active.title} • {active.rewardXp} XP mission reward record created.</div></section>}
      <div style={{display:'flex',gap:5,overflowX:'auto',paddingBottom:7}}>
        {(Object.keys(UNIVERSAL_MISSION_WORLD_LABELS) as UniversalMissionWorld[]).map(key=><button key={key} onClick={()=>setWorld(key)} style={{...btn,whiteSpace:'nowrap',minHeight:36,background:world===key?'#123047':'#09131c',borderColor:world===key?'#5be7ff':'#294252'}}>{UNIVERSAL_MISSION_WORLD_LABELS[key]}</button>)}
      </div>
      <div style={{display:'grid',gap:7}}>
        {missions.map(m=><article key={m.id} style={{padding:10,border:'1px solid #22394a',borderRadius:13,background:'#07121b'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:12}}>{m.title}</b><span style={{fontSize:9,color:'#8effb7'}}>{m.rewardXp} XP</span></div>
          <div style={{fontSize:10,color:'#a8bac7',lineHeight:1.45,marginTop:4}}>{m.summary}</div>
          <div style={{fontSize:9,color:'#7f93a3',marginTop:5}}>{m.steps.length} objectives</div>
          <button onClick={()=>start(m)} style={{...btn,width:'100%',marginTop:7,borderColor:'#5be7ff88'}}>{progress?.missionId===m.id&&progress.status==='active'?'RESTART / FOCUS':'START MISSION'}</button>
        </article>)}
      </div>
    </div>
  </section>
}
