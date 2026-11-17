import {useState} from 'react'
import {newPoolPractice,shootPoolPractice,poolPracticeReceipt,POOL_POCKETS,type PoolState} from '../runtime/GameVersePoolPractice.mjs'
import {loadGameVersePractice,saveGameVersePractice} from '../services/gameversePracticeCloud'
const key='tryamm.gameverse.pool-practice.v1'
const button:React.CSSProperties={minHeight:48,padding:'9px 14px',borderRadius:10,border:'1px solid #80eac1',background:'#123f43',color:'#fff',fontWeight:850,touchAction:'manipulation'}
const load=():PoolState=>{try{const x=JSON.parse(localStorage.getItem(key)||'null');if(x?.schema==='tryamm.gameverse.pool-practice.v1'&&x.cashValue===0&&Number.isInteger(x.shots)&&x.shots>=0&&x.shots<=12)return x}catch{}return newPoolPractice()}
export default function GameVersePoolPractice({onClose}:{onClose:()=>void}){
 const [state,setState]=useState<PoolState>(load),[angle,setAngle]=useState(0),[power,setPower]=useState(7),[message,setMessage]=useState('Aim and take a practice shot. No bets, coins, tickets or prizes.')
 const [revision,setRevision]=useState(0)
 const save=(next:PoolState)=>{setState(next);try{localStorage.setItem(key,JSON.stringify(next))}catch{setMessage('Local save unavailable; in-session play still works.')}}
 const shoot=()=>{const result=shootPoolPractice(state,angle,power);if(result.ok)save(result.state);setMessage(result.message||result.error||'Shot processed.')}
 const test=()=>{const result=shootPoolPractice(newPoolPractice(),0,7);save(result.state);setMessage('ONE PUSH STRAIGHT SHOT: '+(result.state.potted?'POCKETED':'NOT POCKETED')+' • no cash or credits.')}
 const cloudLoad=async()=>{try{const receipt=await loadGameVersePractice<PoolState>('pool-practice');if(!receipt){setMessage('No cloud pool practice yet.');return}setRevision(receipt.revision);save(receipt.state);setMessage('Authenticated cloud snapshot restored.')}catch(e){setMessage(String(e instanceof Error?e.message:e))}}
 const cloudSave=async()=>{try{const rev=await saveGameVersePractice('pool-practice',state,revision);setRevision(rev);setMessage('Authenticated pool snapshot saved. No payouts or rewards.')}catch(e){setMessage(String(e instanceof Error?e.message:e))}}
 const download=()=>{const blob=new Blob([JSON.stringify(poolPracticeReceipt(state),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='gameverse-pool-practice-receipt.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 return <section role="dialog" aria-modal="true" aria-label="GameVerse pool practice" style={{position:'fixed',inset:0,zIndex:19000,overflowY:'auto',background:'#071921',color:'#fff',padding:16,fontFamily:'system-ui'}}>
  <div style={{maxWidth:850,margin:'auto',display:'grid',gap:14}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><strong>🎱 GAMEVERSE • POOL PRACTICE</strong><p style={{fontSize:13}}>Two-ball pocket drill with simple cushion/collision physics. No wagers or real rankings.</p></div><button style={button} onClick={onClose}>CLOSE</button></header>
   <svg width="100%" viewBox="0 0 600 300" role="img" aria-label="Pool table with cue ball, target ball and highlighted pockets" style={{maxHeight:310,border:'8px solid #613b20',borderRadius:18,background:'#176b53'}}>
    {POOL_POCKETS.map(([x,y],i)=><circle key={i} cx={x} cy={y} r={18} fill="#08151b"/>)}
    <circle cx={state.cue.x} cy={state.cue.y} r={10} fill="#fff" stroke="#12242a" strokeWidth="2"/>
    {!state.potted&&<circle cx={state.target.x} cy={state.target.y} r={10} fill="#ffbb36" stroke="#2a1500" strokeWidth="2"/>}
   </svg>
   <label>Aim angle: {angle} degrees <input aria-label="Aim angle" type="range" min={-60} max={60} step={5} value={angle} onChange={e=>setAngle(Number(e.target.value))} style={{width:'100%',minHeight:44}}/></label>
   <label>Shot strength: {power} <input aria-label="Shot strength" type="range" min={1} max={10} value={power} onChange={e=>setPower(Number(e.target.value))} style={{width:'100%',minHeight:44}}/></label>
   <div role="status" aria-live="polite">{message} | Shots: {state.shots} | Target pocketed: {state.potted?'YES':'NO'}</div>
   <div style={{display:'flex',flexWrap:'wrap',gap:8}}><button style={button} disabled={state.complete} onClick={shoot}>TAKE SHOT</button><button style={button} onClick={test}>ONE PUSH • TEST STRAIGHT SHOT</button><button style={button} onClick={()=>{save(newPoolPractice());setMessage('New practice started.')}}>RESET</button><button style={button} onClick={()=>{const s=load();setState(s);setMessage('Reloaded available local save.')}}>RELOAD</button><button style={button} onClick={download}>EXPORT JSON</button><button style={button} onClick={cloudSave}>CLOUD SAVE (LOGIN)</button><button style={button} onClick={cloudLoad}>CLOUD RESTORE</button></div>
   <small>Skill-only local practice, not certified 8-ball, online pool, professional physics or money gaming.</small>
  </div>
 </section>
}
