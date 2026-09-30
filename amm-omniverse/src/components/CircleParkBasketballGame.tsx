import {useState} from 'react'
import {CIRCLE_PARK_BASKETBALL,requestBasketballReward,type CircleParkBasketballMove} from '../data/circleParkBasketballGame'
export default function CircleParkBasketballGame({onClose}:{onClose:()=>void}){
 const [score,setScore]=useState(0),[opp,setOpp]=useState(0),[stamina,setStamina]=useState(100),[status,setStatus]=useState('BALL UP • FIRST TO 21'),[freeThrow,setFreeThrow]=useState(false)
 const play=(move:CircleParkBasketballMove)=>{
  const cfg=CIRCLE_PARK_BASKETBALL.moves[move];if(freeThrow&&move!=='freeThrow')return
  const made=Math.random()<cfg.baseMake
  const foul=move!=='freeThrow'&&made&&Math.random()<CIRCLE_PARK_BASKETBALL.andOne.contactChance
  const pts=made?cfg.points:0
  setScore(s=>s+pts);setStamina(s=>Math.max(0,s-cfg.staminaCost))
  if(foul){setFreeThrow(true);setStatus('AND-1! • BASKET COUNTS • 1 FREE THROW')}
  else if(move==='freeThrow'){setFreeThrow(false);setStatus(made?'FREE THROW GOOD • +1':'FREE THROW MISSED')}
  else setStatus(made?(move==='dunk'?'DUNK! • +2':move.toUpperCase()+' GOOD • +'+pts):(move.toUpperCase()+' MISSED'))
  window.dispatchEvent(new CustomEvent('tryamm:circle-park-basketball-play',{detail:{move,made,foul,points:pts,world:'circle-park'}}))
  if(made)window.dispatchEvent(new CustomEvent('tryamm:reel-moment',{detail:{kind:foul?'and-one':move,world:'circle-park',source:'basketball'}}))
 }
 const finish=()=>{requestBasketballReward({score,opponentScore:opp});onClose()}
 return <section aria-label="Circle Park basketball game" style={{position:'fixed',inset:12,zIndex:46000,overflow:'auto',padding:14,borderRadius:18,background:'#07121bf5',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← COURT</button>
  <h2>CIRCLE PARK BASKETBALL</h2><div style={{fontSize:28,fontWeight:950}}>{score} — {opp}</div>
  <p aria-live="polite">{status}</p><small>STAMINA {stamina}% • FIRST TO {CIRCLE_PARK_BASKETBALL.winScore}</small>
  {freeThrow?<button onClick={()=>play('freeThrow')} style={{display:'block',width:'100%',minHeight:58,marginTop:10,borderRadius:14,fontWeight:950,fontSize:18}}>AND-1 FREE THROW</button>:<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:10}}>
   <button onClick={()=>play('dunk')} style={{minHeight:58,borderRadius:14,fontWeight:950}}>DUNK</button>
   <button onClick={()=>play('layup')} style={{minHeight:58,borderRadius:14,fontWeight:950}}>LAYUP</button>
   <button onClick={()=>play('jumper')} style={{minHeight:58,borderRadius:14,fontWeight:950}}>JUMPER</button>
   <button onClick={()=>play('three')} style={{minHeight:58,borderRadius:14,fontWeight:950}}>3-POINTER</button>
  </div>}
  <button onClick={()=>setOpp(o=>o+2)} style={{width:'100%',minHeight:46,marginTop:8,borderRadius:12,fontWeight:900}}>OPPONENT +2</button>
  {(score>=21||opp>=21)&&<button onClick={finish} style={{width:'100%',minHeight:52,marginTop:8,borderRadius:12,fontWeight:950}}>FINISH GAME • VALIDATE REWARD</button>}
  <small style={{display:'block',marginTop:10}}>Modes: shootaround • 1v1 • 2v2 • 3v3. Rewards are server-validated; no real-money wagering.</small>
 </section>
}
