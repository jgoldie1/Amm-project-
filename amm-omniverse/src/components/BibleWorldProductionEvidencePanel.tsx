import {useEffect,useState} from 'react'
import type {BibleWorldProductionEvidenceState} from '../runtime/BibleWorldProductionEvidenceRuntime'

async function sampleFrames(ms=1600){
 return new Promise<{fps:number;frames:number;durationMs:number}>(resolve=>{
  let frames=0,start=0
  const step=(now:number)=>{if(!start)start=now;frames++;if(now-start>=ms){resolve({fps:Math.round(frames*1000/(now-start)),frames,durationMs:Math.round(now-start)});return}requestAnimationFrame(step)}
  requestAnimationFrame(step)
 })
}
const nowRef=(prefix:string)=>prefix+':'+new Date().toISOString()

export default function BibleWorldProductionEvidencePanel({compact=false}:{compact?:boolean}){
 const [state,setState]=useState<BibleWorldProductionEvidenceState|null>(null)
 const [status,setStatus]=useState('Pass 5 waits for a Bible world scene package.')
 const [humanReviewed,setHumanReviewed]=useState(false)
 useEffect(()=>{
  const on=(e:Event)=>{const d=(e as CustomEvent<BibleWorldProductionEvidenceState>).detail;if(d?.schema==='tryamm.metaverse-bible.production-evidence.v1')setState(d)}
  const ok=(e:Event)=>setStatus(`Evidence submitted for internal verification • ${String((e as CustomEvent<any>).detail?.count||0)} receipt(s).`)
  const err=(e:Event)=>setStatus(String((e as CustomEvent<any>).detail?.error||'Evidence operation failed'))
  window.addEventListener('tryamm:bible-world-production-evidence-state',on as EventListener)
  window.addEventListener('tryamm:bible-world-production-evidence-submitted',ok as EventListener)
  window.addEventListener('tryamm:bible-world-production-evidence-error',err as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request-state'))
  return()=>{window.removeEventListener('tryamm:bible-world-production-evidence-state',on as EventListener);window.removeEventListener('tryamm:bible-world-production-evidence-submitted',ok as EventListener);window.removeEventListener('tryamm:bible-world-production-evidence-error',err as EventListener)}
 },[])
 const request=(detail:any)=>window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail}))
 const syncArtifacts=()=>{setStatus('Submitting exact provider-artifact receipts for verification…');request({action:'sync-provider-artifacts'})}
 const mobile=async()=>{
  if(!state?.planId){setStatus('Build a Bible world scene first.');return}
  setStatus('Capturing a real browser frame sample…')
  const frames=await sampleFrames()
  request({action:'submit',item:{evidenceType:'mobile-performance',source:'holo-lab-client-sample',reference:nowRef('mobile-frame-sample'),metrics:{...frames,viewport:{width:innerWidth,height:innerHeight},dpr:devicePixelRatio,touchPoints:navigator.maxTouchPoints||0,userAgent:navigator.userAgent},notes:'Measured browser sample submitted for internal verification; not self-certified.'}})
 }
 const access=()=>{
  if(!state?.planId){setStatus('Build a Bible world scene first.');return}
  const interactive=[...document.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[role="button"]')].filter(x=>x.offsetParent!==null)
  const large=interactive.filter(x=>{const r=x.getBoundingClientRect();return r.width>=44&&r.height>=44}).length
  request({action:'submit',item:{evidenceType:'accessibility',source:'holo-lab-accessibility-snapshot',reference:nowRef('accessibility-snapshot'),metrics:{interactive:interactive.length,largeTargets:large,largeTargetRatio:interactive.length?Number((large/interactive.length).toFixed(3)):1,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,touchPoints:navigator.maxTouchPoints||0},notes:'Automated accessibility snapshot submitted for qualified review; it is not a complete accessibility certification.'}})
 }
 const requestWorldQa=()=>{
  const placements=state?.scene?.placements||[];if(!state?.planId||!placements.length){setStatus('Scene placements are required before collision/navigation QA.');return}
  const items=placements.flatMap(p=>[
   ...(p.collisionTarget?[{evidenceType:'collision',assetId:p.assetId,source:'holo-lab-qa-request',reference:nowRef('collision-qa-request:'+p.assetId),artifactUrl:p.artifactUrl,metrics:{placementId:p.id,x:p.x,y:p.y,z:p.z},notes:'Collision QA requested for this exact placement/artifact. Requires internal/runtime verification.'}]:[]),
   ...(p.navigationTarget?[{evidenceType:'navigation',assetId:p.assetId,source:'holo-lab-qa-request',reference:nowRef('navigation-qa-request:'+p.assetId),artifactUrl:p.artifactUrl,metrics:{placementId:p.id,x:p.x,z:p.z},notes:'Navigation QA requested for this exact placement/artifact. Requires internal/runtime verification.'}]:[]),
  ])
  if(!items.length){setStatus('No collision/navigation targets are declared in this scene.');return}
  request({action:'submit',items});setStatus('Collision/navigation QA receipts submitted for verification.')
 }
 const human=()=>{
  if(!humanReviewed||!state?.planId){setStatus('Confirm that you reviewed the exact current artifacts first.');return}
  request({action:'submit',item:{evidenceType:'human-visual-review',source:'founder-visual-review-submission',reference:nowRef('human-visual-review'),metrics:{exactScenePackage:true,placementCount:state.scene?.placements.length||0,providerPlacementCount:state.providerPlacementCount},notes:'Human visual review receipt submitted; production gate changes only after internal verification.'}})
 }
 const C=state?.verifiedChecks
 return <section aria-label='Metaverse Bible Pass 5 production evidence' style={{padding:compact?10:14,border:'1px solid #6e5ad8',borderRadius:15,background:'linear-gradient(145deg,#100c24,#071019)',color:'#fff'}}>
  <div style={eyebrow}>METAVERSE BIBLE • PASS 5 • PRODUCTION EVIDENCE</div>
  <h3 style={{margin:'5px 0',fontSize:compact?14:19}}>Exact artifacts → QA evidence → human review → release candidate</h3>
  <p style={copy}>Client checks can submit evidence, but they cannot certify themselves. Production promotion now requires server-verified evidence tied to the exact plan and exact provider artifact URLs.</p>
  <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(150px,1fr))',gap:6}}>
   <Metric label='PROVIDER EVIDENCE' value={state?`${state.providerReceiptCount}/${state.providerPlacementCount}`:'0/0'} ok={Boolean(state&&state.providerPlacementCount>0&&state.providerReceiptCount===state.providerPlacementCount)}/>
   <Metric label='COLLISION' value={C?.collision?'VERIFIED':'WAITING'} ok={Boolean(C?.collision)}/>
   <Metric label='NAVIGATION' value={C?.navigation?'VERIFIED':'WAITING'} ok={Boolean(C?.navigation)}/>
   <Metric label='MOBILE' value={C?.mobilePerformance?'VERIFIED':'WAITING'} ok={Boolean(C?.mobilePerformance)}/>
   <Metric label='ACCESSIBILITY' value={C?.accessibility?'VERIFIED':'WAITING'} ok={Boolean(C?.accessibility)}/>
   <Metric label='HUMAN REVIEW' value={C?.humanVisualReview?'VERIFIED':'WAITING'} ok={Boolean(C?.humanVisualReview)}/>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:6,marginTop:9}}>
   <button onClick={()=>{window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-retry-missing-provider-artifacts'));setStatus('Retry queued for missing/degraded provider GLB/PBR artifacts only.')}} style={button}>RETRY MISSING GLB / PBR</button>
   <button onClick={syncArtifacts} style={button}>SYNC EXACT ARTIFACT RECEIPTS</button>
   <button onClick={requestWorldQa} style={button}>REQUEST COLLISION + NAV QA</button>
   <button onClick={mobile} style={button}>CAPTURE MOBILE FRAME SAMPLE</button>
   <button onClick={access} style={button}>CAPTURE ACCESSIBILITY SNAPSHOT</button>
  </div>
  <label style={{display:'flex',gap:8,alignItems:'flex-start',marginTop:9,fontSize:9,color:'#d8d0ff'}}><input type='checkbox' checked={humanReviewed} onChange={e=>setHumanReviewed(e.target.checked)}/><span>I reviewed the exact current provider artifacts/scene visually. Submit my review receipt for internal verification.</span></label>
  <button onClick={human} disabled={!humanReviewed} style={{...button,width:'100%',marginTop:7,opacity:humanReviewed?1:.45}}>SUBMIT HUMAN VISUAL REVIEW RECEIPT</button>
  <div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}><span style={pill}>SUBMITTED {state?.submittedCount||0}</span><span style={pill}>VERIFIED {state?.verifiedCount||0}</span><span style={pill}>SERVER GATE {state?.serverEvidenceReady?'READY':'BLOCKED'}</span></div>
  {!!state?.blockers?.length&&<div style={{marginTop:7,fontSize:8,color:'#ffd29d',lineHeight:1.45}}>{state.blockers.map(x=><div key={x}>○ {x}</div>)}</div>}
  <button onClick={()=>request({action:'refresh'})} style={{...button,width:'100%',marginTop:8}}>REFRESH SERVER EVIDENCE</button>
  <div role='status' style={{fontSize:8,color:'#c9c4dc',marginTop:7}}>{status}</div>
 </section>
}
function Metric({label,value,ok}:{label:string;value:string;ok:boolean}){return <div style={{padding:8,borderRadius:9,border:`1px solid ${ok?'#62e59a55':'#65587b'}`,background:ok?'#092018':'#151020'}}><div style={eyebrow}>{label}</div><div style={{fontSize:10,fontWeight:950,color:ok?'#a4ffc1':'#ffd5a0',marginTop:3}}>{value}</div></div>}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.4,color:'#b8a7ff',fontWeight:950}
const copy:React.CSSProperties={fontSize:9,color:'#c5c0d1',lineHeight:1.55}
const button:React.CSSProperties={minHeight:40,borderRadius:9,border:'1px solid #8d78f477',background:'#21174b',color:'#fff',fontWeight:950,padding:'0 10px'}
const pill:React.CSSProperties={padding:'5px 7px',border:'1px solid #514873',borderRadius:999,fontSize:8,color:'#ddd7ff'}
