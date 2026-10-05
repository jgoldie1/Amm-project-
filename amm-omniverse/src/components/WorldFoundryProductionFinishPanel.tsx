import {useEffect,useMemo,useState} from 'react'
import type {TimeMachineWorldFoundryPlan} from '../runtime/TimeMachineWorldFoundryRuntime'
import type {BibleWorldProductionEvidenceState} from '../runtime/BibleWorldProductionEvidenceRuntime'
import type {BibleWorldPromotionState} from '../runtime/BibleWorldPromotionRuntime'

type StepKind='NO_PLAN'|'PROVIDER_GENERATION'|'SYNC_ARTIFACTS'|'INTERNAL_VERIFY_ARTIFACTS'|'WORLD_QA'|'MOBILE'|'ACCESSIBILITY'|'HUMAN_REVIEW'|'CREATE_CANDIDATE'|'STAGE'|'PUBLISH_PROOF'|'DONE'
type FinishStep={kind:StepKind;label:string;detail:string;actionable:boolean}

async function sampleFrames(ms=1600){
 return new Promise<{fps:number;frames:number;durationMs:number}>(resolve=>{let frames=0,start=0;const step=(now:number)=>{if(!start)start=now;frames++;if(now-start>=ms){resolve({fps:Math.round(frames*1000/(now-start)),frames,durationMs:Math.round(now-start)});return}requestAnimationFrame(step)};requestAnimationFrame(step)})
}
const ref=(prefix:string)=>prefix+':'+new Date().toISOString()

export default function WorldFoundryProductionFinishPanel({compact=false}:{compact?:boolean}){
 const [plan,setPlan]=useState<TimeMachineWorldFoundryPlan|null>(null)
 const [evidence,setEvidence]=useState<BibleWorldProductionEvidenceState|null>(null)
 const [promotion,setPromotion]=useState<BibleWorldPromotionState|null>(null)
 const [status,setStatus]=useState('FINISH PASS waits for an active world package.')
 useEffect(()=>{
  const onFoundry=(e:Event)=>setPlan((e as CustomEvent<any>).detail?.activePlan||null)
  const onEvidence=(e:Event)=>{const d=(e as CustomEvent<BibleWorldProductionEvidenceState>).detail;if(d?.schema==='tryamm.metaverse-bible.production-evidence.v1')setEvidence(d)}
  const onPromotion=(e:Event)=>{const d=(e as CustomEvent<BibleWorldPromotionState>).detail;if(d?.schema==='tryamm.metaverse-bible.promotion.v1')setPromotion(d)}
  window.addEventListener('tryamm:time-machine-world-foundry-state',onFoundry as EventListener)
  window.addEventListener('tryamm:bible-world-production-evidence-state',onEvidence as EventListener)
  window.addEventListener('tryamm:bible-world-promotion-state',onPromotion as EventListener)
  window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-request-state'))
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request-state'))
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request-state'))
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'refresh'}}))
  return()=>{window.removeEventListener('tryamm:time-machine-world-foundry-state',onFoundry as EventListener);window.removeEventListener('tryamm:bible-world-production-evidence-state',onEvidence as EventListener);window.removeEventListener('tryamm:bible-world-promotion-state',onPromotion as EventListener)}
 },[])

 const step=useMemo<FinishStep>(()=>{
  if(!plan)return{kind:'NO_PLAN',label:'BUILD / RESTORE ACTIVE WORLD',detail:'No active foundry plan is loaded.',actionable:false}
  const missing=plan.assets.filter(a=>a.state!=='preview-ready'||!a.provider||a.provider==='pending'||a.provider==='holo-router')
  if(missing.length)return{kind:'PROVIDER_GENERATION',label:`GENERATE REAL GLB / PBR • ${missing.length} LEFT`,detail:'Retry only missing/degraded provider artifacts through the existing HoloForge → Holo Gen provider path.',actionable:true}
  const placements=evidence?.scene?.placements||[]
  const providerSubmitted=(evidence?.evidence||[]).filter(x=>x.evidence_type==='provider-artifact'&&x.state==='submitted').length
  if(!evidence?.scene||placements.some(p=>!p.artifactUrl||p.placeholder))return{kind:'SYNC_ARTIFACTS',label:'BIND EXACT ARTIFACTS INTO SCENE',detail:'The walkable scene package does not yet contain real artifact URLs for every placement.',actionable:true}
  if((evidence?.providerReceiptCount||0)<placements.length){
   if(providerSubmitted>=placements.length)return{kind:'INTERNAL_VERIFY_ARTIFACTS',label:'VERIFY PROVIDER RECEIPTS',detail:'Exact artifact receipts are submitted. Internal/server verification must approve them before release value advances.',actionable:false}
   return{kind:'SYNC_ARTIFACTS',label:'SYNC EXACT ARTIFACT RECEIPTS',detail:'Submit the exact artifact URL/placement bindings to Pass 5.',actionable:true}
  }
  if(!evidence.verifiedChecks.collision||!evidence.verifiedChecks.navigation)return{kind:'WORLD_QA',label:'COLLISION + NAVIGATION QA',detail:'Run QA against these exact placed artifacts; submitted evidence still requires server verification.',actionable:true}
  if(!evidence.verifiedChecks.mobilePerformance)return{kind:'MOBILE',label:'CAPTURE MOBILE / IPHONE PERFORMANCE',detail:'Measure the actual browser scene and submit the frame/viewport evidence.',actionable:true}
  if(!evidence.verifiedChecks.accessibility)return{kind:'ACCESSIBILITY',label:'CAPTURE ACCESSIBILITY EVIDENCE',detail:'Submit target-size/reduced-motion/touch evidence for review.',actionable:true}
  if(!evidence.verifiedChecks.humanVisualReview)return{kind:'HUMAN_REVIEW',label:'HUMAN VISUAL REVIEW REQUIRED',detail:'A person must review the exact current artifacts. This step cannot be auto-approved.',actionable:false}
  const active=promotion?.activeRelease as any
  if(promotion?.eligible&&!active)return{kind:'CREATE_CANDIDATE',label:'CREATE IMMUTABLE RELEASE CANDIDATE',detail:'All evidence gates passed. Freeze this exact world package into a versioned candidate.',actionable:true}
  if(active&&String(active.state)==='candidate')return{kind:'STAGE',label:'STAGE CERTIFIED WORLD',detail:'Move the immutable candidate to STAGED. Production remains blocked behind the internal publish gate.',actionable:true}
  if(active&&String(active.state)==='staged')return{kind:'PUBLISH_PROOF',label:'INTERNAL PUBLISH + DEPLOYMENT PROOF',detail:'Next action needs internal authorization, deployment SHA, production probe and iPhone screenshots.',actionable:false}
  if(active&&String(active.state)==='published')return{kind:'DONE',label:'PUBLISHED • PROVE ON IPHONE',detail:'Capture deployment SHA and iPhone screenshots before calling the visual build complete.',actionable:false}
  return{kind:'INTERNAL_VERIFY_ARTIFACTS',label:'REFRESH SERVER EVIDENCE',detail:'Server evidence or release state still needs verification.',actionable:true}
 },[plan,evidence,promotion])

 const run=async()=>{
  setStatus('Running next safe production step…')
  if(step.kind==='PROVIDER_GENERATION'){window.dispatchEvent(new CustomEvent('tryamm:time-machine-world-foundry-retry-missing-provider-artifacts'));setStatus('Provider retry queued for missing/degraded artifacts only.');return}
  if(step.kind==='SYNC_ARTIFACTS'){window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail:{action:'sync-provider-artifacts'}}));setStatus('Exact artifact receipts submitted/synced for verification.');return}
  if(step.kind==='WORLD_QA'){
   const placements=evidence?.scene?.placements||[]
   const items=placements.flatMap(p=>[...(p.collisionTarget?[{evidenceType:'collision',assetId:p.assetId,source:'finish-pass-world-qa',reference:ref('collision:'+p.assetId),artifactUrl:p.artifactUrl,metrics:{placementId:p.id,x:p.x,y:p.y,z:p.z}}]:[]),...(p.navigationTarget?[{evidenceType:'navigation',assetId:p.assetId,source:'finish-pass-world-qa',reference:ref('navigation:'+p.assetId),artifactUrl:p.artifactUrl,metrics:{placementId:p.id,x:p.x,z:p.z}}]:[])])
   window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail:{action:'submit',items}}));setStatus('Collision/navigation receipts submitted; server verification still required.');return
  }
  if(step.kind==='MOBILE'){const frames=await sampleFrames();window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail:{action:'submit',item:{evidenceType:'mobile-performance',source:'finish-pass-mobile-sample',reference:ref('mobile'),metrics:{...frames,viewport:{width:innerWidth,height:innerHeight},dpr:devicePixelRatio,touchPoints:navigator.maxTouchPoints||0,userAgent:navigator.userAgent}}}}));setStatus('Mobile performance sample submitted for verification.');return}
  if(step.kind==='ACCESSIBILITY'){const interactive=[...document.querySelectorAll<HTMLElement>('button,a,input,select,textarea,[role="button"]')].filter(x=>x.offsetParent!==null);const large=interactive.filter(x=>{const r=x.getBoundingClientRect();return r.width>=44&&r.height>=44}).length;window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail:{action:'submit',item:{evidenceType:'accessibility',source:'finish-pass-accessibility',reference:ref('accessibility'),metrics:{interactive:interactive.length,largeTargets:large,largeTargetRatio:interactive.length?Number((large/interactive.length).toFixed(3)):1,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,touchPoints:navigator.maxTouchPoints||0}}}}));setStatus('Accessibility snapshot submitted for verification.');return}
  if(step.kind==='CREATE_CANDIDATE'){window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'candidate'}}));setStatus('Immutable release candidate requested.');return}
  if(step.kind==='STAGE'){const active=promotion?.activeRelease as any;const releaseKey=String(active?.release_key||active?.releaseKey||'');window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'stage',releaseKey}}));setStatus('Staging request sent.');return}
  window.dispatchEvent(new CustomEvent('tryamm:bible-world-production-evidence-request',{detail:{action:'refresh'}}));window.dispatchEvent(new CustomEvent('tryamm:bible-world-promotion-request',{detail:{action:'refresh'}}));setStatus('Server evidence and release state refreshed.')
 }

 const ready=plan?.assets.filter(a=>a.state==='preview-ready').length||0
 return <section aria-label='World Foundry Production Finish Pass' style={{padding:compact?10:14,border:'1px solid #e5b64b88',borderRadius:16,background:'linear-gradient(145deg,#171205,#071019)',color:'#fff'}}>
  <div style={eyebrow}>PASS 6 • FINISH PRODUCTION • DO NOT REBUILD THE ENGINES</div>
  <h3 style={{margin:'5px 0',fontSize:compact?15:20}}>{step.label}</h3>
  <p style={copy}>{step.detail}</p>
  <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><span style={pill}>PLAN {plan?'ACTIVE':'NONE'}</span><span style={pill}>GLB/PBR {ready}/{plan?.assets.length||0}</span><span style={pill}>SERVER EVIDENCE {evidence?.serverEvidenceReady?'READY':'BLOCKED'}</span><span style={pill}>RELEASE {String((promotion?.activeRelease as any)?.state||'NONE').toUpperCase()}</span></div>
  <button onClick={run} disabled={!step.actionable} style={{...button,opacity:step.actionable?1:.45}}>{step.actionable?'RUN NEXT SAFE STEP':'MANUAL / INTERNAL GATE REQUIRED'}</button>
  <div style={{marginTop:7,fontSize:8,color:'#cfc6a9'}}>Time Machine + World Builder + World Forger/CAD + Genie + Mind Over Matter + HoloForge/Holo Gen + Holo Lab are treated as the existing construction stack. This panel advances evidence/release state only.</div>
  <div role='status' style={{fontSize:8,color:'#d9d0b8',marginTop:7}}>{status}</div>
 </section>
}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.5,color:'#f0c65f',fontWeight:950}
const copy:React.CSSProperties={fontSize:9,color:'#c9c2b1',lineHeight:1.55}
const pill:React.CSSProperties={padding:'5px 7px',border:'1px solid #5f5132',borderRadius:999,fontSize:8,color:'#e7ddc2'}
const button:React.CSSProperties={width:'100%',minHeight:42,marginTop:9,borderRadius:10,border:'1px solid #e9c15d88',background:'#332508',color:'#fff6c9',fontWeight:950}