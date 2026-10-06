import {useEffect,useState} from 'react'
import type {OmniLiveSuperRoomState,OmniLiveLayout} from '../runtime/OmniLiveSuperRoomRuntime'

export default function LiveSuperRoomControls({providerConfigured,connected}:{providerConfigured:boolean;connected:boolean}){
 const [state,setState]=useState<OmniLiveSuperRoomState|null>(null)
 const [program,setProgram]=useState('')
 useEffect(()=>{const onState=(event:Event)=>setState((event as CustomEvent<OmniLiveSuperRoomState>).detail||null);addEventListener('tryamm:omni-live-super-room-state',onState);return()=>removeEventListener('tryamm:omni-live-super-room-state',onState)},[])
 const layout=(next:OmniLiveLayout)=>dispatchEvent(new CustomEvent('tryamm:live-super-room-layout',{detail:{layout:next,seatCount:state?.seatCount||4}}))
 const seats=(count:4|6|9|12)=>dispatchEvent(new CustomEvent('tryamm:live-super-room-layout',{detail:{layout:state?.layout||'grid',seatCount:count}}))
 const addProgram=()=>{const label=program.trim();if(!label)return;dispatchEvent(new CustomEvent('tryamm:live-program-upsert',{detail:{id:'program-'+Date.now(),label,enabled:true}}));setProgram('')}
 const capture=()=>dispatchEvent(new CustomEvent('tryamm:open-reel-creator',{detail:{source:'live-super-room',mode:'live-highlight',roomId:state?.roomId||'tryamm-live'}}))
 if(!state)return null
 return <section style={panel}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><div style={eyebrow}>LIVE SUPER ROOM</div><b>Multi-Guest • PK • Audience Program</b></div><span style={{fontSize:9,color:providerConfigured?'#7dffad':'#ffd36c'}}>{providerConfigured?'PROVIDER READY':'PROVIDER GATED'}</span></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6,marginTop:9}}>{(['panel','grid','fixed'] as OmniLiveLayout[]).map(x=><button key={x} onClick={()=>layout(x)} style={{...btn,borderColor:state.layout===x?'#72efff':'#315061'}}>{x.toUpperCase()}</button>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6,marginTop:6}}>{([4,6,9,12] as const).map(n=><button key={n} onClick={()=>seats(n)} style={{...btn,borderColor:state.seatCount===n?'#e394ff':'#315061'}}>{n} SEATS</button>)}</div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:5,marginTop:8}}>{state.seats.map(seat=><div key={seat.id} style={seatBox}><div style={{fontSize:18}}>{seat.mode==='audio'?'🎙':seat.mode==='video'?'📹':'＋'}</div><div style={{fontSize:8,fontWeight:900,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{seat.displayName}</div></div>)}</div>
  {state.requests.length>0&&<div style={{marginTop:8}}><div style={eyebrow}>GUEST REQUESTS</div>{state.requests.map(req=><div key={req.id} style={{display:'flex',gap:6,alignItems:'center',marginTop:5}}><span style={{flex:1,fontSize:10}}>{req.displayName} • {req.mode}</span><button disabled={!connected||!providerConfigured} onClick={()=>dispatchEvent(new CustomEvent('tryamm:live-guest-accept',{detail:{id:req.id}}))} style={btn}>ACCEPT</button></div>)}</div>}
  <div style={{marginTop:10,padding:9,borderRadius:12,border:'1px solid #5a395f',background:'#160b1d'}}><div style={eyebrow}>PK / MATCH</div><div style={{display:'flex',gap:7,alignItems:'center',marginTop:6}}><button disabled={!connected||!providerConfigured} onClick={()=>dispatchEvent(new CustomEvent('tryamm:live-super-room-pk',{detail:{enabled:!state.pk.enabled,opponentRoomId:null,left:0,right:0}}))} style={{...btn,flex:1,borderColor:state.pk.enabled?'#ff5b7a':'#5b4361'}}>{state.pk.enabled?'END PK':'START PK'}</button><span style={{fontSize:10}}>SCORE {state.pk.left} — {state.pk.right}</span></div></div>
  <div style={{marginTop:10}}><div style={eyebrow}>AUDIENCE PROGRAM LIST</div><div style={{display:'flex',gap:6,marginTop:6}}><input value={program} onChange={e=>setProgram(e.target.value)} placeholder="Q&A, song, challenge…" style={input}/><button onClick={addProgram} style={btn}>ADD</button></div><div style={{display:'grid',gap:5,marginTop:6}}>{state.programs.filter(x=>x.enabled).map(p=><div key={p.id} style={{display:'grid',gridTemplateColumns:'1fr auto auto',gap:6,alignItems:'center',fontSize:9}}><span>{p.label}</span><span>👍 {p.votes}</span><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:live-program-vote',{detail:{programId:p.id}}))} style={mini}>VOTE</button></div>)}</div></div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6,marginTop:10}}><button onClick={capture} style={btn}>🎬 LIVE → REEL</button><button onClick={()=>dispatchEvent(new CustomEvent('tryamm:live-shopping-product-browser-open',{detail:{source:'live-super-room'}}))} style={btn}>🛍 PIN PRODUCT</button></div>
  {!providerConfigured&&<p style={{fontSize:9,lineHeight:1.4,color:'#ffd88e',marginBottom:0}}>Room layout, program list and Reel handoff work now. Real guest camera/mic seats and PK room links stay disabled until LiveKit production credentials pass verification.</p>}
 </section>
}

const panel:React.CSSProperties={marginTop:12,padding:11,borderRadius:14,border:'1px solid #3c6678',background:'#06111af0',color:'#fff'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.5,color:'#6eeaff',fontWeight:950}
const btn:React.CSSProperties={minHeight:36,padding:'6px 8px',borderRadius:9,border:'1px solid #315061',background:'#0a1a25',color:'#fff',fontSize:8,fontWeight:950,touchAction:'manipulation'}
const mini:React.CSSProperties={minHeight:30,padding:'4px 7px',borderRadius:8,border:'1px solid #315061',background:'#0a1a25',color:'#fff',fontSize:8,fontWeight:900}
const seatBox:React.CSSProperties={minHeight:58,padding:6,borderRadius:10,border:'1px solid #294859',background:'#08151e',display:'grid',placeItems:'center',textAlign:'center'}
const input:React.CSSProperties={minWidth:0,flex:1,minHeight:36,borderRadius:9,border:'1px solid #315061',background:'#030a11',color:'#fff',padding:'0 9px',fontSize:10}