import {ASSET_QUALITY_GATES,ASSET_VERSION_POLICY} from '../data/AssetPassportCertification'
import {getAccessToken} from '../services/supabaseClient'
import type {BibleWorldCertificationState} from './BibleWorldCertificationRuntime'
import type {BibleWorldScenePackage} from './BibleWorldSceneBinderRuntime'

export type BibleWorldReleaseSummary={
 id?:string;release_key?:string;releaseKey?:string;plan_id?:string;planId?:string;title?:string;era?:string;
 truth_label?:string;truthLabel?:string;version?:number;state?:string;manifest_sha256?:string;manifestSha256?:string;
 production_publish_allowed?:boolean;human_review_passed?:boolean;created_at?:string;published_at?:string
}

export type BibleWorldPromotionState={
 schema:'tryamm.metaverse-bible.promotion.v1'
 scene: BibleWorldScenePackage|null
 certification:BibleWorldCertificationState|null
 eligible:boolean
 blockers:string[]
 activeRelease:BibleWorldReleaseSummary|null
 releases:BibleWorldReleaseSummary[]
 assetPassportPolicy:typeof ASSET_VERSION_POLICY
 qualityGates:typeof ASSET_QUALITY_GATES
 updatedAt:string
}

const KEY='tryamm.metaverse-bible.promotion.v1'
let installed=false
let state:BibleWorldPromotionState={
 schema:'tryamm.metaverse-bible.promotion.v1',scene:null,certification:null,eligible:false,blockers:[],activeRelease:null,releases:[],
 assetPassportPolicy:ASSET_VERSION_POLICY,qualityGates:ASSET_QUALITY_GATES,updatedAt:new Date().toISOString()
}
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))
const readLocal=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');if(x?.schema==='tryamm.metaverse-bible.promotion.v1')state={...state,...x,assetPassportPolicy:ASSET_VERSION_POLICY,qualityGates:ASSET_QUALITY_GATES}}catch{}}
const persist=()=>{state={...state,...evaluate(state),updatedAt:new Date().toISOString()};try{localStorage.setItem(KEY,JSON.stringify(state))}catch{};emit('tryamm:bible-world-promotion-state',state)}

function evaluate(s:BibleWorldPromotionState){
 const blockers:string[]=[]
 const scene=s.scene,cert=s.certification
 if(!scene)blockers.push('walkable scene package missing')
 if(!cert)blockers.push('certification state missing')
 if(scene&&cert&&scene.planId!==cert.planId)blockers.push('scene/certification plan mismatch')
 if(cert&&cert.productionPublishAllowed!==true)blockers.push('production certification not complete')
 if(cert&&cert.checks['human-visual-review']!==true)blockers.push('human visual review not complete')
 if(scene&&(scene.missingArtifacts?.length||0)>0)blockers.push('placeholder/provider artifacts still missing')
 if(scene&&Number(scene.providerArtifacts||0)<Number(scene.placements?.length||0))blockers.push('not every placement has a provider artifact')
 if(scene&&scene.placements?.some(p=>!p.artifactUrl||p.placeholder))blockers.push('placeholder placement blocks promotion')
 return{eligible:blockers.length===0,blockers}
}
async function token(){const t=await getAccessToken();if(!t)throw new Error('Sign in before creating or staging a Bible world release.');return t}
async function refresh(){
 const t=await token()
 const r=await fetch('/api/metaverse-bible/releases',{headers:{Authorization:`Bearer ${t}`}})
 const d=await r.json().catch(()=>({}))
 if(!r.ok)throw new Error(d?.error||'Unable to load Bible world releases')
 state={...state,releases:Array.isArray(d.releases)?d.releases:[]}
 persist()
 return state
}
async function createCandidate(){
 persist()
 if(!state.eligible||!state.scene||!state.certification)throw new Error(state.blockers.join(' • ')||'Bible world is not eligible for promotion')
 const t=await token()
 const r=await fetch('/api/metaverse-bible/releases',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({scenePackage:state.scene,certification:state.certification})})
 const d=await r.json().catch(()=>({}))
 if(!r.ok)throw new Error(d?.error||'Unable to create Bible world release candidate')
 state={...state,activeRelease:d.release||null,releases:[d.release,...state.releases.filter(x=>(x.release_key||x.releaseKey)!==(d.release?.release_key||d.release?.releaseKey))].filter(Boolean)}
 persist();emit('tryamm:bible-world-release-candidate-ready',{release:d.release,manifest:d.manifest})
 return d
}
async function stage(releaseKey:string){
 const key=String(releaseKey||'').trim();if(!key)throw new Error('Release key is required')
 const t=await token()
 const r=await fetch('/api/metaverse-bible/releases',{method:'PATCH',headers:{'content-type':'application/json',Authorization:`Bearer ${t}`},body:JSON.stringify({releaseKey:key,action:'stage'})})
 const d=await r.json().catch(()=>({}))
 if(!r.ok)throw new Error(d?.error||'Unable to stage Bible world release')
 state={...state,activeRelease:d.release||state.activeRelease}
 await refresh();emit('tryamm:bible-world-release-staged',{release:d.release})
 return d
}
export function readBibleWorldPromotionState(){readLocal();persist();return state}
export function installBibleWorldPromotionRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true;readLocal()
 const onScene=(event:Event)=>{const p=(event as CustomEvent<BibleWorldScenePackage>).detail;if(p?.schema==='tryamm.metaverse-bible.scene-package.v1'){state={...state,scene:p};persist()}}
 const onCert=(event:Event)=>{const c=(event as CustomEvent<BibleWorldCertificationState>).detail;if(c?.schema==='tryamm.metaverse-bible.world-certification.v1'){state={...state,certification:c};persist()}}
 const onRequest=async(event:Event)=>{
  const d=(event as CustomEvent<{action?:string;releaseKey?:string}>).detail||{}
  try{
   if(d.action==='candidate')await createCandidate()
   else if(d.action==='stage')await stage(String(d.releaseKey||state.activeRelease?.release_key||state.activeRelease?.releaseKey||''))
   else await refresh()
  }catch(error){emit('tryamm:bible-world-promotion-error',{action:d.action||'refresh',error:error instanceof Error?error.message:String(error)})}
 }
 const requestState=()=>persist()
 addEventListener('tryamm:bible-world-scene-package-ready',onScene as EventListener)
 addEventListener('tryamm:bible-world-certification-state',onCert as EventListener)
 addEventListener('tryamm:bible-world-promotion-request',onRequest as EventListener)
 addEventListener('tryamm:bible-world-promotion-request-state',requestState)
 persist()
 emit('tryamm:bible-world-promotion-ready',{candidateRequiresFullCertification:true,stagingRequiresCandidate:true,publishRequiresInternalAuthorization:true,rollbackSupported:true,assetVersionPolicy:ASSET_VERSION_POLICY})
 return()=>{
  removeEventListener('tryamm:bible-world-scene-package-ready',onScene as EventListener)
  removeEventListener('tryamm:bible-world-certification-state',onCert as EventListener)
  removeEventListener('tryamm:bible-world-promotion-request',onRequest as EventListener)
  removeEventListener('tryamm:bible-world-promotion-request-state',requestState)
  installed=false
 }
}
