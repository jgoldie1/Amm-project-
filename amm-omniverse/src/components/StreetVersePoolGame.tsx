import {useState} from 'react'
import {STREETVERSE_POOL_MODES,requestPoolReward,type StreetVersePoolMode} from '../data/streetVersePoolActivities'
import type {StreetVerseSwimStroke} from '../runtime/StreetVerseUnderwaterPoolRuntime'

const STROKES:StreetVerseSwimStroke[]=['freestyle','breaststroke','backstroke','dolphin']

export default function StreetVersePoolGame({poolId,onClose}:{poolId:string;onClose:()=>void}){
 const [mode,setMode]=useState<StreetVersePoolMode>('free-swim')
 const [score,setScore]=useState(0)
 const [status,setStatus]=useState('CHOOSE A POOL ACTIVITY')
 const [immersive,setImmersive]=useState(false)
 const [strokeIndex,setStrokeIndex]=useState(0)
 const stroke=STROKES[strokeIndex]
 const start=(id:StreetVersePoolMode)=>{setMode(id);setScore(0);const m=STREETVERSE_POOL_MODES.find(x=>x.id===id)!;setStatus(m.label.toUpperCase()+' • STARTED');window.dispatchEvent(new CustomEvent('tryamm:pool-session-start',{detail:{poolId,mode:id}}))}
 const enterWater=()=>{setImmersive(true);window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-enter',{detail:{poolId,mode,stroke}}))}
 const command=(command:string)=>window.dispatchEvent(new CustomEvent('tryamm:pool-swim-command',{detail:{poolId,mode,stroke,command}}))
 const cycleStroke=()=>{const next=(strokeIndex+1)%STROKES.length;setStrokeIndex(next);window.dispatchEvent(new CustomEvent('tryamm:pool-swim-stroke',{detail:{poolId,stroke:STROKES[next]}}))}
 const act=()=>{const next=score+1;setScore(next);setStatus(mode.toUpperCase().replaceAll('-',' ')+' • '+next);window.dispatchEvent(new CustomEvent('tryamm:pool-session-progress',{detail:{poolId,mode,score:next}}));if([3,5,10].includes(next))window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'pool-'+mode,poolId,score:next}}))}
 const climbOut=()=>{window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-exit',{detail:{poolId}}));setImmersive(false)}
 const close=()=>{window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-exit',{detail:{poolId}}));onClose()}
 const finish=()=>{const m=STREETVERSE_POOL_MODES.find(x=>x.id===mode)!;requestPoolReward({poolId,mode,score,xp:m.xp});window.dispatchEvent(new CustomEvent('tryamm:pool-underwater-exit',{detail:{poolId}}));onClose()}
 if(immersive)return <section aria-label="Underwater swimming controls" style={{position:'fixed',left:10,right:10,bottom:'max(10px,env(safe-area-inset-bottom))',zIndex:46000,padding:10,borderRadius:16,background:'#05243bc9',color:'#fff',backdropFilter:'blur(5px)'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><strong>UNDERWATER • {stroke.toUpperCase()}</strong><button onClick={climbOut} style={{minHeight:44,borderRadius:12,fontWeight:950}}>CLIMB OUT</button></div>
  <button onClick={cycleStroke} style={{width:'100%',minHeight:44,marginTop:7,borderRadius:12,fontWeight:900}}>STROKE STYLE • {stroke.toUpperCase()}</button>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7,marginTop:7}}>
   <button onClick={()=>command('left')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>↶ TURN</button>
   <button onClick={()=>command('stroke')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>🏊 STROKE</button>
   <button onClick={()=>command('right')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>TURN ↷</button>
   <button onClick={()=>command('dive')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>↓ DIVE</button>
   <button onClick={()=>command('kick')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>KICK</button>
   <button onClick={()=>command('ascend')} style={{minHeight:50,borderRadius:12,fontWeight:950}}>↑ ASCEND</button>
  </div>
  <button onClick={()=>command('surface')} style={{width:'100%',minHeight:46,marginTop:7,borderRadius:12,fontWeight:950}}>SURFACE</button>
  <small style={{display:'block',marginTop:7}}>One-hand swim HUD • bubbles • underwater camera • depth motion • stroke animation.</small>
 </section>
 return <section aria-label="StreetVerse pool activities" style={{position:'fixed',inset:12,zIndex:46000,overflow:'auto',padding:14,borderRadius:18,background:'#061723f5',color:'#fff'}}>
  <button onClick={close} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← POOL</button>
  <h2>STREETVERSE POOL</h2><p aria-live="polite">{status}</p>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   {STREETVERSE_POOL_MODES.map(m=><button key={m.id} onClick={()=>start(m.id)} style={{minHeight:54,borderRadius:12,fontWeight:900,textAlign:'left'}}>{m.label}<small style={{display:'block'}}>+{m.xp} XP target</small></button>)}
  </div>
  <button onClick={enterWater} style={{width:'100%',minHeight:58,marginTop:10,borderRadius:14,fontWeight:950,fontSize:17}}>🌊 ENTER WATER • IMMERSIVE SWIM</button>
  <button onClick={act} style={{width:'100%',minHeight:52,marginTop:8,borderRadius:14,fontWeight:950}}>DO {mode.toUpperCase().replaceAll('-',' ')}</button>
  <button onClick={finish} style={{width:'100%',minHeight:50,marginTop:8,borderRadius:12,fontWeight:950}}>FINISH • VALIDATE REWARD</button>
  <small style={{display:'block',marginTop:10}}>Freestyle • breaststroke • backstroke • dolphin. One-button lane assist • low-impact mode • spectator mode • reduced motion.</small>
 </section>
}
