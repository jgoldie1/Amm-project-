import {useEffect,useState} from 'react'
import type {BibleWorldPromotionState} from '../runtime/BibleWorldPromotionRuntime'

export default function BibleWorldPromotionPanel({compact=false}:{compact?:boolean}){
 const [state,setState]=useState<BibleWorldPromotionState|null>(null)
 const [status,setStatus]=useState('Waiting for a fully certified Bible world.')
 useEffect(()=>{
  const on=(event:Event)=>{const s=(event as CustomEvent<BibleWorldPromotionState>).detail;if(s?.schema==='tryamm.metaverse-bible.promotion.v1'){setState(s);setStatus(s.eligible?'All production certification gates passed. Release candidate can be created.':s.blockers.join(' • ')||'Promotion is blocked.')}}
  const err=(event:Event)=>setStatus(String((event as CustomEvent<any>).detail?.error||'Promotion failed'))
  const staged=()=>setStatus('Release staged. Final production publish remains an explicit internal/server action.')
  window.addEventListener('tryamm:bible-world-promotion-state',on as EventListener)
  window.addEventListener('tryamm:bible-world-promotion-error',err as EventListener)
  window.addEventListener('tryamm:bible-world-release-staged',staged)
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request-state'))
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'refresh'}}))
  return()=>{
   window.removeEventListener('tryamm:bible-world-promotion-state',on as EventListener)
   window.removeEventListener('tryamm:bible-world-promotion-error',err as EventListener)
   window.removeEventListener('tryamm:bible-world-release-staged',staged)
  }
 },[])
 const active=state?.activeRelease
 const releaseKey=String(active?.release_key||active?.releaseKey||'')
 const releaseState=String(active?.state||'none').toUpperCase()
 const create=()=>{setStatus('Creating immutable release candidate…');window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'candidate'}}))}
 const stage=()=>{setStatus('Staging certified world release…');window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'stage',releaseKey}}))}
 const artifactCount=state?.scene?String(state.scene.providerArtifacts)+'/'+String(state.scene.placements.length):'0/0'
 return <section aria-label='Metaverse Bible world promotion' style={{padding:compact?10:14,border:'1px solid #4c7b5d',borderRadius:15,background:'linear-gradient(145deg,#07150d,#0b0d0a)',color:'#fff'}}>
  <div style={{fontSize:8,letterSpacing:1.6,color:'#85f0ad',fontWeight:950}}>METAVERSE BIBLE • PASS 4 • WORLD PROMOTION</div>
  <h3 style={{margin:'5px 0',fontSize:compact?14:19}}>Preview → certified release candidate → staged world → explicit publish</h3>
  <p style={copy}>This is the step after Holo Lab preview and Hebrew School handoff. No placeholder geometry can enter a release candidate. Publishing stays fail-closed until server authorization records the final action.</p>
  <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(155px,1fr))',gap:6,marginTop:9}}>
   <Metric label='SCENE PACKAGE' value={state?.scene?'READY':'WAITING'} ok={Boolean(state?.scene)}/>
   <Metric label='CERTIFICATION' value={state?.certification?.productionPublishAllowed?'PASSED':'BLOCKED'} ok={Boolean(state?.certification?.productionPublishAllowed)}/>
   <Metric label='PROVIDER ARTIFACTS' value={artifactCount} ok={Boolean(state?.scene&&state.scene.missingArtifacts.length===0&&state.scene.providerArtifacts===state.scene.placements.length)}/>
   <Metric label='ACTIVE RELEASE' value={releaseState} ok={releaseState==='CANDIDATE'||releaseState==='STAGED'||releaseState==='PUBLISHED'}/>
  </div>
  {!!state?.blockers?.length&&<div style={{marginTop:8,padding:9,borderRadius:9,border:'1px solid #765d34',background:'#1a1308',fontSize:8,color:'#ffd292'}}>{state.blockers.map(x=><div key={x}>○ {x}</div>)}</div>}
  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:9}}>
   <button disabled={!state?.eligible} onClick={create} style={{...button,opacity:state?.eligible?1:.42}}>CREATE RELEASE CANDIDATE</button>
   <button disabled={!releaseKey||String(active?.state)!=='candidate'} onClick={stage} style={{...button,borderColor:'#72d8ff88',background:'#08222d',opacity:releaseKey&&String(active?.state)==='candidate'?1:.42}}>STAGE CERTIFIED WORLD</button>
  </div>
  {active&&<div style={{...card,marginTop:8}}><div style={eyebrow}>VERSIONED RELEASE</div><div style={{fontSize:10,fontWeight:900}}>{releaseKey||active.title}</div><div style={{fontSize:8,color:'#a9bab2',marginTop:4}}>VERSION {active.version||'?'} • {releaseState} • MANIFEST {String(active.manifest_sha256||active.manifestSha256||'pending').slice(0,16)}</div></div>}
  <div style={{...card,marginTop:8}}><div style={eyebrow}>IMMUTABLE / ROLLBACK POLICY</div><div style={{fontSize:8,color:'#b7c6bd',lineHeight:1.5}}>Certified artifacts are versioned. New generation creates a new version. Production publishing is server-controlled. Earlier published versions remain rollback targets instead of being overwritten.</div></div>
  <div role='status' style={{fontSize:8,color:'#c8d5cd',marginTop:7}}>{status}</div>
 </section>
}
function Metric({label,value,ok}:{label:string;value:string;ok:boolean}){return <div style={{padding:9,borderRadius:10,border:`1px solid ${ok?'#52d88455':'#665b3e'}`,background:ok?'#092115':'#15120b'}}><div style={eyebrow}>{label}</div><div style={{fontSize:11,fontWeight:950,color:ok?'#97ffb8':'#ffd79a',marginTop:3}}>{value}</div></div>}
const copy:React.CSSProperties={fontSize:9,color:'#b9c6bf',lineHeight:1.55}
const button:React.CSSProperties={minHeight:40,borderRadius:9,border:'1px solid #6ee69877',background:'#0b2a18',color:'#fff',fontWeight:950,padding:'0 11px'}
const card:React.CSSProperties={padding:9,borderRadius:10,border:'1px solid #344a3b',background:'#08110b'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.2,color:'#8ee8ab',fontWeight:950}