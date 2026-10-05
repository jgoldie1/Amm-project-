import {useEffect,useState} from 'react'
import {installMetaverseBibleSessionRuntime,readMetaverseBibleSession,resetMetaverseBibleSession,type MetaverseBibleSession} from '../runtime/MetaverseBibleSessionRuntime'

export default function MetaverseBibleProgressPanel(){
 const [session,setSession]=useState<MetaverseBibleSession>(()=>readMetaverseBibleSession())
 const [reflection,setReflection]=useState(()=>readMetaverseBibleSession().reflectionText||'')
 useEffect(()=>{
  const uninstall=installMetaverseBibleSessionRuntime()
  const sync=(e:Event)=>setSession((e as CustomEvent<MetaverseBibleSession>).detail||readMetaverseBibleSession())
  window.addEventListener('tryamm:metaverse-bible-session-state',sync as EventListener)
  setSession(readMetaverseBibleSession())
  return()=>{window.removeEventListener('tryamm:metaverse-bible-session-state',sync as EventListener);uninstall?.()}
 },[])
 const saveReflection=()=>{const text=reflection.trim();if(text.length<8)return;window.dispatchEvent(new CustomEvent('tryamm:metaverse-bible-reflection-saved',{detail:{text,source:'metaverse-bible-progress'}}))}
 const steps=[
  ['SCRIPTURE STUDIED',session.scripture,'Read a connected chapter and intentionally mark it studied.'],
  ['STUDY LAYER',session.studyLayer,'Open Ethiopian canon, KJV 1611, Apocrypha, Hebrew/Paleo-Hebrew or Strong’s.'],
  ['IMMERSIVE WORLD',session.immersive,'Enter Living Scripture World or launch Faith Chrono.'],
  ['REFLECTION',session.reflection,'Save a short private learning reflection.'],
 ] as const
 const count=steps.filter(x=>x[1]).length
 return <section id='metaverse-bible-study-passport' style={shell}>
  <div style={eyebrow}>METAVERSE BIBLE STUDY PASSPORT • {count}/4</div>
  <h2 style={{margin:'6px 0'}}>Study it. Enter it. Reflect on it. Carry it back to the Kingdom.</h2>
  <p style={muted}>This records learning progress, not spiritual status. Completing the four study steps only requests completion of the Kingdom study mission; rewards remain server-authoritative and are never created by this browser panel.</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:7}}>{steps.map(([label,done,copy])=><div key={label} style={{...card,borderColor:done?'#6dffac':'#4f4937'}}><div style={{fontSize:9,color:done?'#8effb7':'#e5c56a',fontWeight:950}}>{done?'✓ COMPLETE':'○ TO DO'} • {label}</div><p style={muted}>{copy}</p></div>)}</div>
  <div style={{...card,marginTop:8}}><div style={eyebrow}>PRIVATE LEARNING REFLECTION</div><textarea value={reflection} onChange={e=>setReflection(e.target.value)} placeholder='What did you learn, what source/layer did you use, and what will you carry back into the Kingdom?' style={area}/><div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:7}}><button onClick={saveReflection} disabled={reflection.trim().length<8} style={button}>SAVE REFLECTION</button><button onClick={()=>{const v=resetMetaverseBibleSession();setSession(v);setReflection('')}} style={secondary}>START NEW STUDY SESSION</button></div></div>
  {session.completionRequested&&<div role='status' style={{marginTop:8,padding:10,borderRadius:11,border:'1px solid #5fe59a77',background:'#092015',fontSize:10,color:'#baffcf'}}>✓ METAVERSE BIBLE STUDY COMPLETE • Kingdom mission completion requested. Server verification/reward remains separate.</div>}
 </section>
}
const shell:React.CSSProperties={marginTop:18,border:'2px solid #7d6732',borderRadius:20,padding:16,background:'linear-gradient(145deg,#171108,#07131a)',color:'#fff'}
const card:React.CSSProperties={padding:11,border:'1px solid #4f4937',borderRadius:13,background:'#0a0b09'}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:1.7,color:'#e5c56a',fontWeight:950}
const muted:React.CSSProperties={fontSize:10,color:'#d7cfb7',lineHeight:1.55}
const area:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:90,marginTop:7,borderRadius:10,border:'1px solid #675833',background:'#070705',color:'#fff',padding:10,fontSize:13}
const button:React.CSSProperties={minHeight:40,borderRadius:10,border:'1px solid #e5c56a88',background:'#2b210d',color:'#fff',fontWeight:950,padding:'0 11px'}
const secondary:React.CSSProperties={...button,border:'1px solid #4f6a78',background:'#071923'}