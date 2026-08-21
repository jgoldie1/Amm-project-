import { useState } from 'react'
import { SAMPLE_RIGHTS_REGISTRY } from '../music/SampleRightsRegistry'

export default function SampleRightsCenter(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState<'draft'|'submitted'|'fingerprinting'|'possible-match'|'clearance-needed'|'cleared'|'rejected'|'disputed'>('draft')
 const [trackId,setTrackId]=useState('')
 const [sourceType,setSourceType]=useState('original-recording')
 const submit=()=>{if(!trackId.trim())return;setState('submitted');setTimeout(()=>setState('fingerprinting'),150)}
 const blocked=['clearance-needed','rejected','disputed','possible-match','fingerprinting','submitted'].includes(state)
 return <>
  <button onClick={()=>setOpen(true)} aria-label="Open Sample Rights Center" style={{position:'fixed',right:12,bottom:190,zIndex:9200,border:'1px solid #e8b94488',borderRadius:999,padding:'10px 13px',background:'#171105',color:'#ffe49b',fontWeight:900,cursor:'pointer'}}>🎧 SAMPLE RIGHTS</button>
  {open&&<div role="dialog" aria-label="Sample Rights Center" style={{position:'fixed',inset:0,zIndex:13000,overflowY:'auto',background:'radial-gradient(circle at top,#182334,#04050e 55%)',color:'#fff',padding:18}}><div style={{maxWidth:920,margin:'0 auto'}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:12}}><div><small style={{color:'#4fe3ff',fontWeight:900}}>ANIYAH 64-TRACK • HOLOMUSIC • MOVIE BOX</small><h1>Sample Submission + Detection</h1></div><button onClick={()=>setOpen(false)} aria-label="Close Sample Rights Center">×</button></div>
   <section style={panel}><h2>1. Register the sample</h2><input value={trackId} onChange={e=>setTrackId(e.target.value)} placeholder="Track / project ID" style={input}/><select value={sourceType} onChange={e=>setSourceType(e.target.value)} style={input}>{SAMPLE_RIGHTS_REGISTRY.submission.sourceTypes.map(x=><option key={x}>{x}</option>)}</select><button onClick={submit} style={action}>SUBMIT FOR FINGERPRINTING</button></section>
   <section style={panel}><h2>2. Detection + review</h2><p>Current state: <b>{state}</b></p><p style={muted}>Detection methods: {SAMPLE_RIGHTS_REGISTRY.detection.methods.join(' • ')}</p><p style={muted}>{SAMPLE_RIGHTS_REGISTRY.detection.rule}</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button onClick={()=>setState('possible-match')}>Simulate possible match</button><button onClick={()=>setState('clearance-needed')}>Needs clearance</button><button onClick={()=>setState('cleared')}>Mark cleared (demo only)</button></div></section>
   <section style={panel}><h2>3. Release gate</h2><div style={{fontWeight:950,color:blocked?'#ff9b8d':'#78ffb4'}}>{blocked?'COMMERCIAL RELEASE BLOCKED':'CLEARED FOR NEXT RELEASE CHECK'}</div><p style={muted}>The production backend must verify master rights, composition rights, permitted media, territory, term, monetization and any attribution/revenue-share requirements before commercial publishing.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}}>{['HoloMusic','StarVerse','Movie Box','Game synchronization','All American Network','HoloArena'].map(x=><div key={x} style={card}>{x}: {blocked?'HOLD':'eligible for downstream rights check'}</div>)}</div></section>
  </div></div>}
 </>
}
const panel={border:'1px solid #26394d',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const card={border:'1px solid #26394d',borderRadius:12,padding:11,background:'#0a1420'} as const
const input={display:'block',width:'100%',boxSizing:'border-box',margin:'8px 0',padding:11,borderRadius:10,border:'1px solid #33465a',background:'#07111b',color:'#fff'} as const
const action={padding:'11px 14px',borderRadius:10,border:0,fontWeight:950,cursor:'pointer'} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
