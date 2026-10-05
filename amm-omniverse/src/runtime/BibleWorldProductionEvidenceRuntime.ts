import {getAccessToken} from '../services/supabaseClient'
import type {BibleWorldScenePackage} from './BibleWorldSceneBinderRuntime'

export type BibleWorldProductionEvidenceType=
 'provider-artifact'|'collision'|'navigation'|'mobile-performance'|'accessibility'|'human-visual-review'

export type BibleWorldEvidenceRow={
 id:string;plan_id:string;asset_id?:string|null;evidence_type:BibleWorldProductionEvidenceType;
 state:'submitted'|'verified'|'rejected'|'superseded';source:string;reference:string;
 artifact_url?:string|null;artifact_sha256?:string|null;metrics?:Record<string,unknown>;notes?:string;
 created_at?:string;verified_at?:string;verified_by?:string
}

export type BibleWorldProductionEvidenceState={
 schema:'tryamm.metaverse-bible.production-evidence.v1'
 planId:string|null
 scene:BibleWorldScenePackage|null
 evidence:BibleWorldEvidenceRow[]
 verifiedChecks:{
  collision:boolean;navigation:boolean;mobilePerformance:boolean;accessibility:boolean;humanVisualReview:boolean
 }
 submittedCount:number
 verifiedCount:number
 providerReceiptCount:number
 providerPlacementCount:number
 serverEvidenceReady:boolean
 blockers:string[]
 updatedAt:string
}

let installed=false
let scene:BibleWorldScenePackage|null=null
let state:BibleWorldProductionEvidenceState={
 schema:'tryamm.metaverse-bible.production-evidence.v1',planId:null,scene:null,evidence:[],
 verifiedChecks:{collision:false,navigation:false,mobilePerformance:false,accessibility:false,humanVisualReview:false},
 submittedCount:0,verifiedCount:0,providerReceiptCount:0,providerPlacementCount:0,serverEvidenceReady:false,blockers:['no active Bible world scene package'],updatedAt:new Date().toISOString()
}
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

async function token(){const t=await getAccessToken();if(!t)throw new Error('Sign in before syncing production evidence.');return t}
function compute(rows:BibleWorldEvidenceRow[]){
 const verified=rows.filter(x=>x.state==='verified')
 const by=(type:BibleWorldProductionEvidenceType)=>verified.filter(x=>x.evidence_type===type)
 const placements=scene?.placements||[]
 const collisionTargets=placements.filter(p=>p.collisionTarget)
 const navTargets=placements.filter(p=>p.navigationTarget)
 const collision=collisionTargets.length>0&&collisionTargets.every(p=>by('collision').some(x=>x.asset_id===p.assetId||!x.asset_id))
 const navigation=navTargets.length>0&&navTargets.every(p=>by('navigation').some(x=>x.asset_id===p.assetId||!x.asset_id))
 const mobilePerformance=by('mobile-performance').length>0
 const accessibility=by('accessibility').length>0
 const humanVisualReview=by('human-visual-review').length>0
 const providerReceiptCount=placements.filter(p=>p.artifactUrl&&!p.placeholder&&by('provider-artifact').some(x=>x.asset_id===p.assetId&&String(x.artifact_url||'')===String(p.artifactUrl||''))).length
 const blockers:string[]=[]
 if(providerReceiptCount<placements.length)blockers.push('exact provider artifact evidence not fully verified')
 if(!collision)blockers.push('collision evidence not verified')
 if(!navigation)blockers.push('navigation evidence not verified')
 if(!mobilePerformance)blockers.push('mobile performance evidence not verified')
 if(!accessibility)blockers.push('accessibility evidence not verified')
 if(!humanVisualReview)blockers.push('human visual review not verified')
 return{
  verifiedChecks:{collision,navigation,mobilePerformance,accessibility,humanVisualReview},
  submittedCount:rows.filter(x=>x.state==='submitted').length,verifiedCount:verified.length,
  providerReceiptCount,providerPlacementCount:placements.length,serverEvidenceReady:blockers.length===0,blockers
 }
}
function publish(rows=state.evidence){
 state={...state,planId:scene?.planId||state.planId,scene,evidence:rows,...compute(rows),updatedAt:new Date().toISOString()}
 emit('tryamm:bible-world-production-evidence-state',state)
 emit('tryamm:bible-world-qa-evidence',{
  'collision-verified':state.verifiedChecks.collision,
  'navigation-verified':state.verifiedChecks.navigation,
  'mobile-performance-verified':state.verifiedChecks.mobilePerformance,
  'accessibility-verified':state.verifiedChecks.accessibility,
  'human-visual-review':state.verifiedChecks.humanVisualReview,
 })
}
async function refresh(){
 const planId=scene?.planId||state.planId;if(!planId){publish([]);return state}
 const t=await token()
 const r=await fetch('/api/metaverse-bible/evidence?planId='+encodeURIComponent(planId),{headers:{Authorization:`Bearer ${t}`}})
 const d=await r.json().catch(()=>({}))
 if(!r.ok)throw new Error(d?.error||'Unable to load production evidence')
 publish(Array.isArray(d.evidence)?d.evidence:[])
 return state
}
async function submit(items:any[]){
 const t=await token()
 const r=await fetch('/api/metaverse-bible/evidence',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({items})})
 const d=await r.json().catch(()=>({}))
 if(!r.ok)throw new Error(d?.error||'Unable to submit production evidence')
 await refresh()
 emit('tryamm:bible-world-production-evidence-submitted',{count:Array.isArray(d.evidence)?d.evidence.length:0,state:d.state||'SUBMITTED_NOT_VERIFIED'})
 return d
}
function artifactItems(pkg:BibleWorldScenePackage){
 return pkg.placements.filter(p=>p.artifactUrl&&!p.placeholder).map(p=>({
  planId:pkg.planId,assetId:p.assetId,evidenceType:'provider-artifact',source:'bible-world-scene-binder',
  reference:`scene-package:${pkg.planId}:${p.id}`,artifactUrl:p.artifactUrl,
  metrics:{placementId:p.id,kind:p.kind,label:p.label,truthLabel:p.truthLabel,collisionTarget:p.collisionTarget,navigationTarget:p.navigationTarget},
  notes:'Exact provider artifact receipt submitted from the current immutable scene package. Submission does not equal verification.'
 }))
}
export function readBibleWorldProductionEvidenceState(){return state}

export function installBibleWorldProductionEvidenceRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onScene=(event:Event)=>{const p=(event as CustomEvent<BibleWorldScenePackage>).detail;if(p?.schema!=='tryamm.metaverse-bible.scene-package.v1')return;const changed=state.planId!==p.planId;scene=p;state={...state,planId:p.planId,scene:p,evidence:changed?[]:state.evidence};publish(state.evidence);void refresh().catch(error=>emit('tryamm:bible-world-production-evidence-error',{error:error instanceof Error?error.message:String(error)}))}
 const onRequest=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const action=String(d.action||'refresh')
  void (async()=>{
   try{
    if(action==='refresh')await refresh()
    else if(action==='sync-provider-artifacts'){
     if(!scene)throw new Error('No active Bible world scene package')
     const items=artifactItems(scene);if(!items.length)throw new Error('No real provider artifact URLs are present yet')
     await submit(items)
    }else if(action==='submit'){
     if(!scene)throw new Error('No active Bible world scene package')
     const items=Array.isArray(d.items)?d.items:[d.item].filter(Boolean)
     await submit(items.map((x:any)=>({...x,planId:scene!.planId})))
    }
   }catch(error){emit('tryamm:bible-world-production-evidence-error',{action,error:error instanceof Error?error.message:String(error)})}
  })()
 }
 addEventListener('tryamm:bible-world-scene-package-ready',onScene as EventListener)
 addEventListener('tryamm:bible-world-production-evidence-request',onRequest as EventListener)
 const onState=()=>publish()
 addEventListener('tryamm:bible-world-production-evidence-request-state',onState)
 emit('tryamm:bible-world-production-evidence-ready',{pass:5,serverVerifiedOnly:true,clientSubmissionNeverEqualsVerification:true,exactArtifactBinding:true})
 return()=>{removeEventListener('tryamm:bible-world-scene-package-ready',onScene as EventListener);removeEventListener('tryamm:bible-world-production-evidence-request',onRequest as EventListener);removeEventListener('tryamm:bible-world-production-evidence-request-state',onState);installed=false}
}
