import {useEffect,useState} from 'react'
import BibleWorldCertificationPanel from './BibleWorldCertificationPanel'

type Preview={id:string;kind:string;prompt:string;status:string;provider:string;qualityTier:string;message:string;worldSessionId?:string|null;previewOnly?:boolean}
type Plan={id:string;title:string;era:string;truthLabel:string;assets:Array<{id:string;label:string;kind:string;state:string}>}

export default function HoloLabFoundryPreview(){
 const [plan,setPlan]=useState<Plan|null>(null)
 const [previews,setPreviews]=useState<Preview[]>([])
 const [status,setStatus]=useState('No World Foundry hologram preview queued yet.')
 useEffect(()=>{
  const onPlan=(event:Event)=>{const d=(event as CustomEvent<any>).detail;if(d?.planId){setPlan({id:d.planId,title:d.title||'World Foundry Preview',era:d.era||'',truthLabel:d.truthLabel||'SOURCE LABEL REQUIRED',assets:Array.isArray(d.assets)?d.assets:[]});setStatus('Foundry plan received • waiting for preview artifacts.')}}
  const onPreview=(event:Event)=>{const d=(event as CustomEvent<Preview>).detail;if(!d?.id||!d.previewOnly)return;setPreviews(old=>[...old.filter(x=>x.id!==d.id),d].slice(-24));setStatus(`${d.kind} preview ${d.status} through ${d.provider}.`)}
  const onState=(event:Event)=>{const d=(event as CustomEvent<any>).detail?.activePlan;if(d?.id)setPlan({id:d.id,title:d.title,era:d.era,truthLabel:d.truthLabel,assets:d.assets||[]})}
  window.addEventListener('tryamm:holo-lab-foundry-preview',onPlan as EventListener)
  window.addEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener)
  window.addEventListener('tryamm:time-machine-world-foundry-state',onState as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request-state'))
  return()=>{window.removeEventListener('tryamm:holo-lab-foundry-preview',onPlan as EventListener);window.removeEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener);window.removeEventListener('tryamm:time-machine-world-foundry-state',onState as EventListener)}
 },[])
 return <section style={{padding:14,border:'1px solid #4fe3ff55',borderRadius:16,background:'#06111bdd'}} aria-label='Time Machine Foundry hologram previews'>
  <div style={{fontSize:9,letterSpacing:2,color:'#4fe3ff',fontWeight:950}}>HOLO LAB • FOUNDRY PREVIEW ROOM</div>
  <h2 style={{fontSize:18,margin:'6px 0'}}>{plan?.title||'No active Time Machine world'}</h2>
  {plan&&<div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={pill}>{plan.era}</span><span style={pill}>{plan.truthLabel}</span><span style={pill}>PREVIEW ONLY</span><span style={pill}>NO PRODUCTION MUTATION</span></div>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:7,marginTop:9}}>{previews.length?previews.map(p=><article key={p.id} style={card}><div style={{fontSize:8,color:'#e8b944',fontWeight:950}}>{p.kind.toUpperCase()} • {p.status.toUpperCase()}</div><b style={{fontSize:11}}>{p.qualityTier.toUpperCase()} PREVIEW</b><div style={{fontSize:9,color:'#9fb3c0',lineHeight:1.4,marginTop:4}}>{p.provider} • {p.message}</div></article>):<div style={{fontSize:10,color:'#899ba7'}}>The preview room will populate when HoloForge returns preview receipts. A receipt is not a certified GLB or a production publish.</div>}</div>
  <div style={{marginTop:10}}><BibleWorldCertificationPanel compact/></div>
  <div role='status' style={{fontSize:9,color:'#bdd0db',marginTop:8}}>{status}</div>
 </section>
}
const card:React.CSSProperties={padding:9,borderRadius:11,border:'1px solid #2e485b',background:'#071622'}
const pill:React.CSSProperties={padding:'5px 8px',borderRadius:999,border:'1px solid #35566a',background:'#071722',fontSize:8,color:'#cde8f3'}