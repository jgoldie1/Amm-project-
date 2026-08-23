import { useEffect, useMemo, useRef, useState } from 'react'
import { useGameStore } from '../game/state/useGameStore'
import { createStreetVerseMission, isBackendConfigured, listStreetVerseMissions, patchPlayerState, updateStreetVerseMission } from '../services/omniverseApi'

type Vec={x:number;y:number}
type Shop={id:string;name:string;pos:Vec;color:string}
type CloudState='checking'|'cloud'|'local'|'syncing'|'error'

const W=1000,H=640
const SHOPS:Shop[]=[
  {id:'shop-a',name:'Soul Records',pos:{x:180,y:145},color:'#4FE3FF'},
  {id:'shop-b',name:'Creator Corner',pos:{x:795,y:165},color:'#E8B944'},
  {id:'shop-c',name:'Kingdom Sounds',pos:{x:780,y:500},color:'#ff6fae'},
]
const START={x:120,y:500}
const SAVE_KEY='tryamm.playable-beta.v1'

function clamp(v:number,min:number,max:number){return Math.max(min,Math.min(max,v))}
function dist(a:Vec,b:Vec){return Math.hypot(a.x-b.x,a.y-b.y)}
function localSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}}

export default function PlayableBeta({onClose}:{onClose:()=>void}){
  const completeMission=useGameStore(s=>s.completeMission)
  const startMission=useGameStore(s=>s.startMission)
  const mission=useGameStore(s=>s.missions.find(m=>m.id==='m1'))
  const player=useGameStore(s=>s.player)
  const initial=localSave()
  const [pos,setPos]=useState<Vec>(initial.pos||START)
  const [visited,setVisited]=useState<string[]>(initial.visited||[])
  const [started,setStarted]=useState(()=>mission?.status==='active')
  const [message,setMessage]=useState('Reach all 3 record shops. Use WASD / arrows or the touch controls.')
  const [cloudState,setCloudState]=useState<CloudState>(isBackendConfigured()?'checking':'local')
  const [missionRunId,setMissionRunId]=useState<string|null>(null)
  const keys=useRef(new Set<string>())

  const completed=visited.length===SHOPS.length
  const progress=Math.round((visited.length/SHOPS.length)*100)

  useEffect(()=>{
    if(!isBackendConfigured()){setCloudState('local');return}
    let cancelled=false
    ;(async()=>{
      try{
        const runs=await listStreetVerseMissions()
        if(cancelled)return
        const run=runs.find(item=>item.mission_id==='m1')
        if(run){
          setMissionRunId(run.id)
          const state=run.runtime_state||{}
          const cloudPos=(state as any).pos
          const cloudVisited=(state as any).visited
          if(cloudPos&&typeof cloudPos.x==='number'&&typeof cloudPos.y==='number')setPos(cloudPos)
          if(Array.isArray(cloudVisited))setVisited(cloudVisited.filter((x:any)=>typeof x==='string'))
          if(run.status==='active')setStarted(true)
        }
        setCloudState('cloud')
      }catch{
        if(!cancelled)setCloudState('local')
      }
    })()
    return()=>{cancelled=true}
  },[])

  useEffect(()=>{
    const down=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d','W','A','S','D'].includes(e.key)){e.preventDefault();keys.current.add(e.key.toLowerCase())}}
    const up=(e:KeyboardEvent)=>keys.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown',down,{passive:false});window.addEventListener('keyup',up)
    let raf=0,last=performance.now()
    const tick=(now:number)=>{
      const dt=Math.min(.04,(now-last)/1000);last=now
      if(started&&!completed){
        const s=260*dt;let dx=0,dy=0
        if(keys.current.has('w')||keys.current.has('arrowup'))dy-=s
        if(keys.current.has('s')||keys.current.has('arrowdown'))dy+=s
        if(keys.current.has('a')||keys.current.has('arrowleft'))dx-=s
        if(keys.current.has('d')||keys.current.has('arrowright'))dx+=s
        if(dx||dy)setPos(p=>({x:clamp(p.x+dx,28,W-28),y:clamp(p.y+dy,28,H-28)}))
      }
      raf=requestAnimationFrame(tick)
    }
    raf=requestAnimationFrame(tick)
    return()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',down);window.removeEventListener('keyup',up)}
  },[started,completed])

  useEffect(()=>{
    if(!started)return
    for(const shop of SHOPS){
      if(!visited.includes(shop.id)&&dist(pos,shop.pos)<58){
        const next=[...visited,shop.id];setVisited(next);setMessage(`Delivered to ${shop.name}. ${SHOPS.length-next.length} stop${SHOPS.length-next.length===1?'':'s'} left.`)
      }
    }
  },[pos,started,visited])

  useEffect(()=>{
    localStorage.setItem(SAVE_KEY,JSON.stringify({pos,visited,updatedAt:new Date().toISOString()}))
    if(cloudState!=='cloud'||!missionRunId)return
    const timer=window.setTimeout(async()=>{
      try{
        await Promise.all([
          updateStreetVerseMission(missionRunId,{runtime_state:{pos,visited,progress},beat_id:completed?'complete':`delivery-${visited.length}`,status:completed?'completed':'active'}),
          patchPlayerState({current_world_id:'streetverse',current_verse:'middleverse',checkpoint:{world:'streetverse',mission_id:'m1',pos,visited,progress,updated_at:new Date().toISOString()}})
        ])
      }catch{setCloudState('error')}
    },900)
    return()=>window.clearTimeout(timer)
  },[pos,visited,progress,completed,cloudState,missionRunId])

  useEffect(()=>{
    if(completed&&mission?.status!=='complete'){
      completeMission('m1');setMessage('MISSION COMPLETE — First Drop delivered to all 3 shops. Progress saved.')
    }
  },[completed,mission?.status,completeMission])

  const nearest=useMemo(()=>SHOPS.filter(s=>!visited.includes(s.id)).sort((a,b)=>dist(pos,a.pos)-dist(pos,b.pos))[0],[pos,visited])

  const begin=async()=>{
    setStarted(true)
    if(mission?.status==='available')startMission('m1')
    setMessage('First Drop started. Deliver the album to all 3 shops.')
    if(cloudState==='cloud'&&!missionRunId){
      try{
        setCloudState('syncing')
        const run=await createStreetVerseMission({mission_id:'m1',character_id:'player',beat_id:'start',runtime_state:{pos,visited,progress:0}})
        setMissionRunId(run.id);setCloudState('cloud')
      }catch{setCloudState('local')}
    }
  }
  const reset=()=>{setPos(START);setVisited([]);setStarted(false);localStorage.removeItem(SAVE_KEY);setMessage('Beta reset. Start the mission when ready.')}
  const nudge=(dx:number,dy:number)=>setPos(p=>({x:clamp(p.x+dx,28,W-28),y:clamp(p.y+dy,28,H-28)}))
  const saveLabel=cloudState==='cloud'?'CLOUD SAVE ✓':cloudState==='syncing'?'SYNCING…':cloudState==='checking'?'CHECKING CLOUD…':cloudState==='error'?'CLOUD RETRY NEEDED':'LOCAL SAVE ✓'

  return <div role="dialog" aria-label="TRYAMM Playable Beta" style={{position:'fixed',inset:0,zIndex:14000,background:'#02050b',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',overflow:'auto'}}>
    <div style={{maxWidth:1180,margin:'0 auto',padding:'14px 14px 90px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:12}}>
        <div><div style={{fontSize:10,color:'#4FE3FF',fontWeight:950,letterSpacing:3}}>GAMEVERSE • PLAYABLE BETA</div><h1 style={{margin:'4px 0 0',fontSize:'clamp(24px,4vw,42px)'}}>StreetVerse: First Drop</h1></div>
        <button onClick={onClose} aria-label="Close playable beta" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #3d536c',background:'#0c1520',color:'#fff',fontSize:22}}>×</button>
      </header>

      <div style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 280px',gap:12}} className="pb-layout">
        <section style={{position:'relative',aspectRatio:`${W}/${H}`,minHeight:360,border:'1px solid #1f4560',borderRadius:22,overflow:'hidden',background:'linear-gradient(135deg,#07131b,#081020 55%,#120a18)'}}>
          <div style={{position:'absolute',inset:0,backgroundImage:'linear-gradient(#4fe3ff0e 1px,transparent 1px),linear-gradient(90deg,#4fe3ff0e 1px,transparent 1px)',backgroundSize:'48px 48px'}}/>
          <div style={{position:'absolute',left:'7%',top:'47%',width:'86%',height:38,borderRadius:12,background:'#17202b',border:'1px solid #293746'}}/>
          <div style={{position:'absolute',left:'47%',top:'8%',width:38,height:'84%',borderRadius:12,background:'#17202b',border:'1px solid #293746'}}/>
          {SHOPS.map(shop=><div key={shop.id} style={{position:'absolute',left:`${shop.pos.x/W*100}%`,top:`${shop.pos.y/H*100}%`,transform:'translate(-50%,-50%)',width:86,height:70,border:`2px solid ${visited.includes(shop.id)?'#5cff9c':shop.color}`,borderRadius:14,background:'#08121bcc',display:'grid',placeItems:'center',textAlign:'center',fontSize:10,fontWeight:900,boxShadow:`0 0 30px ${shop.color}22`}}><div><div style={{fontSize:20}}>{visited.includes(shop.id)?'✓':'♫'}</div>{shop.name}</div></div>)}
          <div aria-label="player" style={{position:'absolute',left:`${pos.x/W*100}%`,top:`${pos.y/H*100}%`,transform:'translate(-50%,-50%)',width:34,height:34,borderRadius:'50%',background:'radial-gradient(circle,#fff,#4FE3FF 45%,#1460aa)',border:'2px solid #fff',boxShadow:'0 0 28px #4FE3FF',transition:'left 40ms linear,top 40ms linear'}}/>
          {nearest&&<div style={{position:'absolute',left:12,top:12,padding:'8px 10px',borderRadius:12,background:'#040910cc',border:'1px solid #32475b',fontSize:10}}>NEXT: {nearest.name} • {Math.round(dist(pos,nearest.pos))}m</div>}
          <div style={{position:'absolute',right:12,top:12,padding:'8px 10px',borderRadius:12,background:'#040910cc',border:'1px solid #32475b',fontSize:10}}>{saveLabel}</div>
        </section>

        <aside style={{display:'grid',gap:10,alignContent:'start'}}>
          <div style={{padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c'}}><div style={{fontSize:9,color:'#E8B944',fontWeight:900}}>MISSION</div><strong>First Drop</strong><p style={{fontSize:12,color:'#9fb2c8',lineHeight:1.5}}>Deliver the creator album to all three shops.</p><div style={{height:8,borderRadius:99,background:'#172130',overflow:'hidden'}}><div style={{width:`${progress}%`,height:'100%',background:'linear-gradient(90deg,#4FE3FF,#5cff9c)'}}/></div><div style={{fontSize:10,marginTop:7}}>{visited.length}/3 stops • {progress}%</div></div>
          <div style={{padding:14,border:'1px solid #294058',borderRadius:16,background:'#08111c',fontSize:11,lineHeight:1.5}}><div>Player: <b>{player.name||'Guest Pilot'}</b></div><div>Cash: <b>${player.cash}</b></div><div>XP: <b>{player.xp}</b></div><div>Level: <b>{player.level}</b></div></div>
          <div aria-live="polite" style={{padding:14,border:'1px solid #3b3652',borderRadius:16,background:'#100d19',fontSize:11,lineHeight:1.5,minHeight:70}}>{message}</div>
          {!started&&!completed&&<button onClick={begin} style={{border:0,borderRadius:14,padding:14,fontWeight:950,background:'linear-gradient(135deg,#4FE3FF,#7aa7ff)',color:'#04111a'}}>START PLAYABLE BETA</button>}
          <button onClick={reset} style={{border:'1px solid #39495b',borderRadius:14,padding:12,fontWeight:900,background:'#101722',color:'#fff'}}>RESET BETA</button>
        </aside>
      </div>

      <div style={{display:'grid',placeItems:'center',marginTop:14}}>
        <div style={{display:'grid',gridTemplateColumns:'58px 58px 58px',gap:6,userSelect:'none'}}>
          <span/><button aria-label="Move up" onClick={()=>nudge(0,-34)} style={pad}>▲</button><span/>
          <button aria-label="Move left" onClick={()=>nudge(-34,0)} style={pad}>◀</button><button aria-label="Move down" onClick={()=>nudge(0,34)} style={pad}>▼</button><button aria-label="Move right" onClick={()=>nudge(34,0)} style={pad}>▶</button>
        </div>
      </div>

      <div style={{marginTop:16,padding:13,border:'1px solid #253345',borderRadius:14,color:'#8da2b8',fontSize:10,lineHeight:1.55}}>PLAYABLE BETA scope: browser controls and mission progression are active. Signed-in players use durable TRYAMM cloud checkpoints when the production API is configured; unsigned or offline players fall back to local save. Authoritative multiplayer and real-money game rewards remain separately gated.</div>
    </div>
    <style>{`@media(max-width:820px){.pb-layout{grid-template-columns:1fr!important}}`}</style>
  </div>
}

const pad:React.CSSProperties={width:58,height:50,borderRadius:13,border:'1px solid #3a5067',background:'#0d1823',color:'#fff',fontSize:18,fontWeight:900,touchAction:'manipulation'}
