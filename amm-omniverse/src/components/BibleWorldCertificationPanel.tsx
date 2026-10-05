import {useEffect,useState} from 'react'
import type {BibleWorldCertificationState} from '../runtime/BibleWorldCertificationRuntime'

const CHECK_LABELS:Record<string,string>={
 'source-label':'SOURCE LABEL',
 'all-preview-receipts':'ALL PREVIEW RECEIPTS',
 'provider-artifacts':'REAL PROVIDER ARTIFACTS',
 'collision-verified':'COLLISION VERIFIED',
 'navigation-verified':'NAVIGATION VERIFIED',
 'mobile-performance-verified':'MOBILE PERFORMANCE',
 'accessibility-verified':'ACCESSIBILITY',
 'human-visual-review':'HUMAN VISUAL REVIEW',
}

export default function BibleWorldCertificationPanel({compact=false}:{compact?:boolean}){
 const [state,setState]=useState<BibleWorldCertificationState|null>(null)
 const [status,setStatus]=useState('Waiting for a Metaverse Bible world plan.')
 useEffect(()=>{
  const on=(event:Event)=>{const d=(event as CustomEvent<BibleWorldCertificationState>).detail;if(d?.schema==='tryamm.metaverse-bible.world-certification.v1'){setState(d);setStatus(d.productionPublishAllowed?'Production certification gates passed.':d.previewHandoffAllowed?'Preview can be handed to Hebrew School; production remains gated.':'Waiting for complete Holo Lab preview receipts.')}}
  window.addEventListener('tryamm:bible-world-certification-state',on as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-certification-request-state'))
  return()=>window.removeEventListener('tryamm:bible-world-certification-state',on as EventListener)
 },[])
 const handoff=()=>{window.dispatchEvent(new CustomEvent('tryamm:bible-world-hebrew-school-preview-request'));setStatus('Hebrew School preview handoff requested.')}
 return <section aria-label='Metaverse Bible world certification' style={{padding:compact?10:14,border:'1px solid #67572e',borderRadius:14,background:'#100e08',color:'#fff'}}>
  <div style={{fontSize:8,letterSpacing:1.5,color:'#e8c968',fontWeight:950}}>METAVERSE BIBLE • WORLD CERTIFICATION</div>
  <h3 style={{fontSize:compact?13:17,margin:'5px 0'}}>{state?.title||'No Bible-world plan active'}</h3>
  {state&&<><div style={{fontSize:9,color:'#aab9c4'}}>{state.truthLabel}</div>
   <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(150px,1fr))',gap:6,marginTop:9}}>
    {Object.entries(state.checks).map(([key,ok])=><div key={key} style={{padding:8,borderRadius:9,border:`1px solid ${ok?'#52d88455':'#7f6b3b'}`,background:ok?'#0b2416':'#171208',fontSize:8,fontWeight:900,color:ok?'#9dffba':'#ffd99b'}}>{ok?'✓':'○'} {CHECK_LABELS[key]||key.toUpperCase()}</div>)}
   </div>
   <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>
    <span style={pill}>PREVIEWS {state.previewCount}/{state.assetCount}</span>
    <span style={pill}>COLLISION TARGET {state.declaredTargets.collision?'DECLARED':'NO'}</span>
    <span style={pill}>NAV TARGET {state.declaredTargets.navigation?'DECLARED':'NO'}</span>
    <span style={pill}>LOD TARGET {state.declaredTargets.lod?'DECLARED':'NO'}</span>
   </div>
   <button disabled={!state.previewHandoffAllowed} onClick={handoff} style={{...button,opacity:state.previewHandoffAllowed?1:.45}}>SEND PREVIEW TO KINGDOM HEBREW SCHOOL</button>
   <div style={{fontSize:8,color:state.productionPublishAllowed?'#9dffba':'#ffcf8c',marginTop:7}}>PRODUCTION PUBLISH: {state.productionPublishAllowed?'ALLOWED BY CERTIFICATION STATE':'BLOCKED'} • HUMAN REVIEW {state.checks['human-visual-review']?'PASSED':'REQUIRED'}</div>
  </>}
  <div role='status' style={{fontSize:8,color:'#bec8ce',marginTop:7}}>{status}</div>
 </section>
}
const pill:React.CSSProperties={padding:'5px 7px',border:'1px solid #4a5360',borderRadius:999,fontSize:8,color:'#d7e1e7'}
const button:React.CSSProperties={width:'100%',minHeight:40,marginTop:9,borderRadius:9,border:'1px solid #e4c56388',background:'#2c210d',color:'#fff',fontWeight:950}
