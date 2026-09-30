import {useState} from 'react'
import {STREETVERSE_POOL_MODES,requestPoolReward,type StreetVersePoolMode} from '../data/streetVersePoolActivities'

export default function StreetVersePoolGame({poolId,onClose}:{poolId:string;onClose:()=>void}){
 const [mode,setMode]=useState<StreetVersePoolMode>('free-swim')
 const [score,setScore]=useState(0)
 const [status,setStatus]=useState('CHOOSE A POOL ACTIVITY')
 const start=(id:StreetVersePoolMode)=>{setMode(id);setScore(0);const m=STREETVERSE_POOL_MODES.find(x=>x.id===id)!;setStatus(m.label.toUpperCase()+' • STARTED');window.dispatchEvent(new CustomEvent('tryamm:pool-session-start',{detail:{poolId,mode:id}}))}
 const act=()=>{const next=score+1;setScore(next);setStatus(mode.toUpperCase().replaceAll('-',' ')+' • '+next);window.dispatchEvent(new CustomEvent('tryamm:pool-session-progress',{detail:{poolId,mode,score:next}}));if([3,5,10].includes(next))window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:'pool-'+mode,poolId,score:next}}))}
 const finish=()=>{const m=STREETVERSE_POOL_MODES.find(x=>x.id===mode)!;requestPoolReward({poolId,mode,score,xp:m.xp});onClose()}
 return <section aria-label="StreetVerse pool activities" style={{position:'fixed',inset:12,zIndex:46000,overflow:'auto',padding:14,borderRadius:18,background:'#061723f5',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← POOL</button>
  <h2>STREETVERSE POOL</h2><p aria-live="polite">{status}</p>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
   {STREETVERSE_POOL_MODES.map(m=><button key={m.id} onClick={()=>start(m.id)} style={{minHeight:54,borderRadius:12,fontWeight:900,textAlign:'left'}}>{m.label}<small style={{display:'block'}}>+{m.xp} XP target</small></button>)}
  </div>
  <button onClick={act} style={{width:'100%',minHeight:58,marginTop:10,borderRadius:14,fontWeight:950}}>DO {mode.toUpperCase().replaceAll('-',' ')}</button>
  <button onClick={finish} style={{width:'100%',minHeight:50,marginTop:8,borderRadius:12,fontWeight:950}}>FINISH • VALIDATE REWARD</button>
  <small style={{display:'block',marginTop:10}}>One-button lane assist • low-impact mode • spectator mode • reduced motion. Game activities only.</small>
 </section>
}
