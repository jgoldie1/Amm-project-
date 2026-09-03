import { useEffect, useMemo, useState } from 'react'

type PlayerPos={x:number;z:number;vehicle?:boolean}
type Telemetry={entered?:boolean;speed?:number}
type SyncedProgress={xp?:number}
const XP_KEY='tryamm.streetverse.xp.v1'
const RACE_KEY='tryamm.streetverse.drive-mission.v1'
const CHECKPOINTS=[
  {label:'South Loop Start',x:0,z:48},
  {label:'Marketplace Turn',x:48,z:-48},
  {label:'River Cut',x:0,z:0},
  {label:'Lakefront Finish',x:48,z:48},
]
function loadXp(){try{return Number(localStorage.getItem(XP_KEY)||0)||0}catch{return 0}}
function loadBest(){try{return Number(JSON.parse(localStorage.getItem(RACE_KEY)||'{}')?.bestMs)||0}catch{return 0}}

export default function StreetVerseDriveMission(){
  const [pos,setPos]=useState<PlayerPos|null>(null)
  const [driving,setDriving]=useState(false)
  const [active,setActive]=useState(false)
  const [checkpoint,setCheckpoint]=useState(0)
  const [startedAt,setStartedAt]=useState(0)
  const [elapsed,setElapsed]=useState(0)
  const [xp,setXp]=useState(loadXp)
  const [best,setBest]=useState(loadBest)
  const [complete,setComplete]=useState(false)
  const target=CHECKPOINTS[checkpoint]
  const distance=useMemo(()=>pos&&target?Math.hypot(pos.x-target.x,pos.z-target.z):Infinity,[pos,target])

  const start=()=>{
    if(!driving)return
    setComplete(false);setCheckpoint(0);setElapsed(0);const now=performance.now();setStartedAt(now);setActive(true)
    dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{id:'chicago-circuit-01',label:'Chicago Circuit 01',checkpoints:CHECKPOINTS.length}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-race-target',{detail:{checkpoint:0,total:CHECKPOINTS.length,...CHECKPOINTS[0]}}))
  }

  useEffect(()=>{
    const onProgress=(e:Event)=>{const value=Number((e as CustomEvent<SyncedProgress>).detail?.xp);if(Number.isFinite(value)&&value>=0)setXp(value)}
    addEventListener('tryamm:streetverse-progress-loaded',onProgress)
    addEventListener('tryamm:streetverse-progress-synced',onProgress)
    return()=>{removeEventListener('tryamm:streetverse-progress-loaded',onProgress);removeEventListener('tryamm:streetverse-progress-synced',onProgress)}
  },[])

  useEffect(()=>{
    const onPos=(e:Event)=>{const d=(e as CustomEvent<PlayerPos>).detail;if(Number.isFinite(d?.x)&&Number.isFinite(d?.z))setPos(d)}
    const onVehicle=(e:Event)=>{const d=(e as CustomEvent<Telemetry>).detail||{};setDriving(Boolean(d.entered));if(!d.entered&&active){setActive(false);setCheckpoint(0);dispatchEvent(new CustomEvent('tryamm:streetverse-race-target-clear'))}}
    const onTelemetry=(e:Event)=>{const d=(e as CustomEvent<Telemetry>).detail||{};if(typeof d.entered==='boolean')setDriving(d.entered)}
    const onStartRequest=()=>start()
    addEventListener('tryamm:streetverse-player-position',onPos)
    addEventListener('tryamm:streetverse-vehicle-controlled',onVehicle)
    addEventListener('tryamm:streetverse-drive-telemetry',onTelemetry)
    addEventListener('tryamm:streetverse-drive-mission-start-request',onStartRequest)
    return()=>{removeEventListener('tryamm:streetverse-player-position',onPos);removeEventListener('tryamm:streetverse-vehicle-controlled',onVehicle);removeEventListener('tryamm:streetverse-drive-telemetry',onTelemetry);removeEventListener('tryamm:streetverse-drive-mission-start-request',onStartRequest)}
  },[active,driving])

  useEffect(()=>{
    if(!active||!startedAt)return
    const id=setInterval(()=>setElapsed(performance.now()-startedAt),100)
    return()=>clearInterval(id)
  },[active,startedAt])

  useEffect(()=>{
    if(!active||!driving||!target||distance>8)return
    if(checkpoint<CHECKPOINTS.length-1){
      const next=checkpoint+1;setCheckpoint(next)
      dispatchEvent(new CustomEvent('tryamm:streetverse-race-checkpoint',{detail:{checkpoint:next,total:CHECKPOINTS.length,label:CHECKPOINTS[next].label}}))
      dispatchEvent(new CustomEvent('tryamm:streetverse-race-target',{detail:{checkpoint:next,total:CHECKPOINTS.length,...CHECKPOINTS[next]}}))
      dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'checkpoint'}}))
      return
    }
    const finalMs=Math.max(1,performance.now()-startedAt)
    const earned=250
    const nextXp=xp+earned
    setXp(nextXp);setElapsed(finalMs);setActive(false);setComplete(true);setCheckpoint(0)
    const nextBest=!best||finalMs<best?finalMs:best;setBest(nextBest)
    try{localStorage.setItem(XP_KEY,String(nextXp));localStorage.setItem(RACE_KEY,JSON.stringify({bestMs:nextBest,lastMs:finalMs,completedAt:new Date().toISOString()}))}catch{}
    dispatchEvent(new CustomEvent('tryamm:streetverse-race-target-clear'))
    dispatchEvent(new CustomEvent('tryamm:streetverse-xp-earned',{detail:{source:'drive-mission',mission:'Chicago Circuit 01',xp:earned,totalXp:nextXp,timeMs:finalMs}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{id:'chicago-circuit-01',label:'Chicago Circuit 01',xp:earned,timeMs:finalMs,financialReward:false}}))
    dispatchEvent(new CustomEvent('tryamm:streetverse-drive-sound',{detail:{kind:'mission-complete'}}))
  },[active,driving,target,distance,checkpoint,startedAt,xp,best])

  const openReel=()=>dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse-race',title:'Chicago Circuit 01',caption:`Chicago Circuit complete • ${formatMs(elapsed)} • #TRYAMM #StreetVerse`}}))

  return <div style={{position:'fixed',left:12,top:112,zIndex:16997,width:'min(88vw,300px)',padding:10,borderRadius:14,background:'#030914e8',border:'1px solid #ffcc6666',color:'#fff',fontFamily:'system-ui,sans-serif',boxShadow:'0 10px 28px #0008'}}>
    <div style={{fontSize:9,fontWeight:950,color:'#ffd86c',letterSpacing:1}}>DRIVE MISSION • CHICAGO CIRCUIT 01</div>
    <div style={{marginTop:5,fontSize:12,fontWeight:900}}>{active?`CHECKPOINT ${checkpoint+1}/${CHECKPOINTS.length} • ${target.label}`:complete?'MISSION COMPLETE':'ENTER A CAR TO START'}</div>
    <div style={{marginTop:4,fontSize:10,color:'#b9c9d7',lineHeight:1.4}}>{active?`${Number.isFinite(distance)?distance.toFixed(0):'--'}m to target • ${formatMs(elapsed)}`:`District XP ${xp}${best?` • Best ${formatMs(best)}`:''}`}</div>
    <div style={{display:'flex',gap:6,marginTop:8,flexWrap:'wrap'}}>
      {!active&&<button disabled={!driving} onClick={start} style={{...btn,opacity:driving?1:.45}}>{driving?'START RACE':'NEED VEHICLE'}</button>}
      {complete&&<button onClick={openReel} style={btn}>🎥 REEL</button>}
      {active&&<button onClick={()=>{setActive(false);setCheckpoint(0);dispatchEvent(new CustomEvent('tryamm:streetverse-race-target-clear'))}} style={btn}>CANCEL</button>}
    </div>
  </div>
}

function formatMs(ms:number){const s=Math.max(0,ms)/1000;const m=Math.floor(s/60);return `${m}:${(s-m*60).toFixed(1).padStart(4,'0')}`}
const btn:React.CSSProperties={minHeight:36,padding:'0 10px',borderRadius:999,border:'1px solid #ffd86c88',background:'#111a26',color:'#fff',fontSize:9,fontWeight:950,cursor:'pointer'}
