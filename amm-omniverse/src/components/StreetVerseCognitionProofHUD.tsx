import {useEffect,useState} from 'react'
import type {StreetVerseCognitionProofState} from '../runtime/StreetVerseCognitionProofRuntime'

const DEFAULT:StreetVerseCognitionProofState={
 active:false,status:'idle',npcId:null,action:null,nodeId:null,nodeLabel:null,startedAt:null,completedAt:null,
 stages:{sense:false,decide:false,reserve:false,move:false,remember:false},receiptId:null,
 message:'Start AI Proof and move near a resident.',authority:'RUNTIME_EVIDENCE',
}

export default function StreetVerseCognitionProofHUD(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState<StreetVerseCognitionProofState>(DEFAULT)

 useEffect(()=>{
  const onState=(event:Event)=>{const next=(event as CustomEvent<StreetVerseCognitionProofState>).detail;if(next){setState(next);setOpen(true)}}
  const onToggle=()=>setOpen(value=>!value)
  addEventListener('tryamm:cognition-proof-state',onState)
  addEventListener('tryamm:streetverse-cognition-proof-toggle',onToggle)
  return()=>{removeEventListener('tryamm:cognition-proof-state',onState);removeEventListener('tryamm:streetverse-cognition-proof-toggle',onToggle)}
 },[])

 if(!open)return null
 const rows=[
  ['SENSE','Detect player',state.stages.sense],
  ['DECIDE','Choose behavior',state.stages.decide],
  ['RESERVE','Claim world object',state.stages.reserve],
  ['MOVE','Reach selected object',state.stages.move],
  ['REMEMBER','Persist outcome',state.stages.remember],
 ] as const

 return <aside aria-label="StreetVerse cognition gameplay proof" style={{
  position:'fixed',left:'max(10px, env(safe-area-inset-left))',right:'max(10px, env(safe-area-inset-right))',
  top:'max(150px, calc(env(safe-area-inset-top) + 142px))',zIndex:44500,pointerEvents:'auto',
  border:'1px solid #7cf5b488',borderRadius:16,background:'rgba(4,11,15,.95)',color:'#f3fffa',
  boxShadow:'0 18px 48px #000c',padding:11,fontFamily:'system-ui, sans-serif',
 }}>
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',gap:8}}>
   <div>
    <div style={{fontSize:10,fontWeight:950,letterSpacing:1.2,color:'#8dffc3'}}>AI GAMEPLAY PROOF</div>
    <div style={{fontSize:8,opacity:.7,marginTop:2}}>SENSE → DECIDE → WORLD USE → MOVE → REMEMBER</div>
   </div>
   <button aria-label="Close AI gameplay proof" onClick={()=>setOpen(false)} style={{width:38,height:38,borderRadius:999,border:'1px solid #ffffff33',background:'#101a1e',color:'#fff',fontSize:18,fontWeight:900}}>×</button>
  </div>

  <div style={{marginTop:9,display:'grid',gap:5}}>
   {rows.map(([name,label,done])=><div key={name} style={{display:'grid',gridTemplateColumns:'62px 1fr 24px',alignItems:'center',gap:7,padding:'7px 8px',borderRadius:10,border:'1px solid #203b34',background:done?'rgba(37,132,82,.17)':'rgba(255,255,255,.025)'}}>
    <strong style={{fontSize:9,color:done?'#91ffc1':'#d3e7de'}}>{name}</strong>
    <span style={{fontSize:9,opacity:.82}}>{label}</span>
    <span aria-label={done?'complete':'pending'} style={{fontSize:14,textAlign:'center'}}>{done?'✓':'○'}</span>
   </div>)}
  </div>

  <div style={{marginTop:8,padding:'8px 9px',borderRadius:10,background:'#07151a',border:'1px solid #183a43',fontSize:9,lineHeight:1.35}}>
   {state.message}
  </div>

  {(state.npcId||state.action||state.nodeLabel)&&<div style={{marginTop:7,fontSize:8,opacity:.78}}>
   {state.npcId&&<span>NPC <strong>{state.npcId}</strong></span>}
   {state.action&&<span> • ACTION <strong>{state.action}</strong></span>}
   {state.nodeLabel&&<span> • OBJECT <strong>{state.nodeLabel}</strong></span>}
  </div>}

  {state.status==='passed'&&<div style={{marginTop:8,border:'1px solid #45e98b88',background:'rgba(26,111,63,.20)',borderRadius:10,padding:8}}>
   <div style={{fontSize:10,fontWeight:950,color:'#83ffb3'}}>LOCKED IN ✓</div>
   <div style={{fontSize:8,marginTop:2}}>Gameplay receipt: {state.receiptId||'stored'}</div>
   <div style={{fontSize:8,opacity:.7}}>This proves the client runtime loop executed in gameplay; it is not a server certification.</div>
  </div>}

  <div style={{display:'flex',gap:7,marginTop:9}}>
   <button onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-cognition-proof-start'))} style={{flex:1,minHeight:42,borderRadius:12,border:'1px solid #58f2a0',background:'#0c2a1c',color:'#dffff0',fontWeight:950,fontSize:10}}>
    {state.status==='running'?'RESTART PROOF':'RUN AI PROOF'}
   </button>
   <button onClick={()=>dispatchEvent(new CustomEvent('tryamm:streetverse-cognition-proof-reset'))} style={{minWidth:72,minHeight:42,borderRadius:12,border:'1px solid #4b6973',background:'#0a151b',color:'#fff',fontWeight:900,fontSize:9}}>RESET</button>
  </div>
 </aside>
}
