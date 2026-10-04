import {registerAssetRights,type AssetRightsCategory} from '../data/assetRightsRegistry'
import {createAssetFactoryJob,type AssetKind} from '../data/TryammAssetForge'
import {TRYAMM_NATIVE_ASSET_FOUNDRY} from '../data/TryammNativeAssetFoundry'
import {getStreetVerseAsset,type StreetVerseAssetKind} from '../data/streetverseAssetRegistry'

export type CleanRoomKind=
 |'building'
 |'interior'
 |'vehicle'
 |'prop'
 |'environment'
 |'character'
 |'animal'
 |'texture'
 |'animation'
 |'audio'
 |'ui'
 |'business-brand'
 |'mission-object'

export type CleanRoomReason=
 |'rights-not-cleared'
 |'license-incompatible'
 |'likeness-not-cleared'
 |'trademark-not-cleared'
 |'private-or-sensitive'
 |'source-terms-blocked'
 |'missing-source'
 |'manual-original-request'

export type FunctionalRequirement={
 id:string
 label:string
 value:string|number|boolean
 source:'public-fact'|'gameplay-requirement'|'tryamm-design'|'authorized-source'|'accessibility-requirement'
}

export type MindOverMatterOriginalJob={
 schema:'tryamm.mind-over-matter.clean-room.v1'
 id:string
 targetId:string
 targetLabel:string
 kind:CleanRoomKind
 reason:CleanRoomReason
 createdAt:string
 seed:string
 status:'queued'|'spec-ready'|'generation-ready'|'review-required'|'certified'
 blockedReferenceIds:string[]
 allowedInputs:string[]
 forbiddenInputs:string[]
 functionalRequirements:FunctionalRequirement[]
 originalityRules:string[]
 outputPlan:{
  geometry:string[]
  materials:string[]
  motion:string[]
  audio:string[]
  identity:string[]
  runtime:string[]
 }
 assetFactoryJob?:ReturnType<typeof createAssetFactoryJob>
 productionMutation:false
 humanReviewRequired:true
}

type RuntimeState={
 jobs:MindOverMatterOriginalJob[]
 lastJob:MindOverMatterOriginalJob|null
}

const STORAGE='tryamm.mind-over-matter.clean-room.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

function slug(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'original'
}

function stableSeed(input:string){
 let hash=2166136261>>>0
 for(const c of input){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619)>>>0}
 return `mom-${hash.toString(16).padStart(8,'0')}`
}

function readState():RuntimeState{
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE)||'null')
  return{
   jobs:Array.isArray(parsed?.jobs)?parsed.jobs.slice(-100):[],
   lastJob:parsed?.lastJob||null,
  }
 }catch{return{jobs:[],lastJob:null}}
}

function persist(state:RuntimeState){
 try{localStorage.setItem(STORAGE,JSON.stringify({...state,jobs:state.jobs.slice(-100)}))}catch{}
}

function assetKindFor(kind:CleanRoomKind):AssetKind|undefined{
 if(kind==='character')return'character'
 if(kind==='animal')return'animal'
 if(kind==='vehicle')return'vehicle'
 if(kind==='building'||kind==='interior')return'building'
 if(kind==='environment')return'environment'
 if(kind==='prop'||kind==='texture'||kind==='ui'||kind==='business-brand'||kind==='mission-object')return'prop'
 return undefined
}

function cleanRoomKindFromStreetVerse(kind:StreetVerseAssetKind|undefined):CleanRoomKind{
 if(kind==='character'||kind==='npc')return'character'
 if(kind==='vehicle'||kind==='watercraft')return'vehicle'
 if(kind==='building')return'building'
 if(kind==='interior')return'interior'
 if(kind==='animal')return'animal'
 if(kind==='environment')return'environment'
 if(kind==='audio')return'audio'
 return'prop'
}

function rightsCategoryFor(kind:CleanRoomKind):AssetRightsCategory{
 if(kind==='character')return'character'
 if(kind==='vehicle')return'vehicle'
 if(kind==='building'||kind==='interior')return'building'
 if(kind==='texture')return'texture'
 if(kind==='animation')return'animation'
 if(kind==='audio')return'audio'
 if(kind==='business-brand')return'trademark'
 if(kind==='environment')return'environment'
 return'other'
}

function allowedInputs(kind:CleanRoomKind){
 const shared=[
  'gameplay requirements written by TRYAMM',
  'public factual measurements and non-expressive data',
  'open/official GIS where terms permit',
  'TRYAMM-owned procedural recipes',
  'authorized user-supplied references',
  'public-domain or commercially licensed inputs with provenance',
 ]
 if(kind==='building'||kind==='interior')return[
  ...shared,
  'lawfully available footprint/height/floor-count facts',
  'conceptual room program created from gameplay needs',
  'accessibility and building-code-inspired functional requirements without copying protected plans',
 ]
 if(kind==='character')return[
  ...shared,
  'synthetic identity descriptors',
  'authorized likeness only when consent is recorded',
  'original wardrobe/color/material combinations',
 ]
 if(kind==='business-brand')return[
  ...shared,
  'generic business category and service requirements',
  'original TRYAMM-created name/logo/signage',
 ]
 return shared
}

function forbiddenInputs(kind:CleanRoomKind){
 const shared=[
  'uncleared copyrighted source files',
  'scraped proprietary textures/models/audio',
  'paywall/robots/authentication bypass output',
  'restricted source payloads retained after rejection',
  'instructions to reproduce a protected asset nearly identically',
 ]
 if(kind==='building'||kind==='interior')return[
  ...shared,
  'private floor plans without authorization',
  'current security/access-control layouts',
  'uncleared proprietary facade imagery used as texture',
 ]
 if(kind==='character')return[
  ...shared,
  'uncleared real-person face/body likeness',
  'distinctive protected character design copied from another franchise',
 ]
 if(kind==='business-brand')return[
  ...shared,
  'uncleared trademark/logo/trade dress',
  'brand-confusing name or signage',
 ]
 return shared
}

function outputPlan(kind:CleanRoomKind){
 const base={
  geometry:[] as string[],
  materials:['owned PBR parameter recipe','procedural or TRYAMM-owned texture slots'],
  motion:[] as string[],
  audio:[] as string[],
  identity:['originality manifest','asset passport seed','rights record status ORIGINAL after review'],
  runtime:['collision/interaction metadata as applicable','mobile/web LOD plan','performance budget','accessibility hooks'],
 }
 switch(kind){
  case'building':return{...base,geometry:['original massing from factual footprint/height constraints','modular facade system','original entrances/stairs/elevator placement where gameplay requires','conceptual interiors only where authorized data is absent'],motion:[],audio:['generic authored ambience hooks']}
  case'interior':return{...base,geometry:['original room layout driven by gameplay program','accessible route graph','original fixtures/furniture placeholders'],motion:[],audio:['generic authored room-tone hooks']}
  case'vehicle':return{...base,geometry:['original body proportions and panel language','generic wheel/door/seat rig points'],motion:['original suspension/door/wheel animation profile'],audio:['original/synthesized engine and interaction sound palette']}
  case'character':return{...base,geometry:['synthetic original body/head proportions','original wardrobe/hair/accessory combination'],motion:['Mind Over Matter original motion blueprint','owned/cleared retargeted locomotion'],audio:['original synthetic/authorized voice slot']}
  case'animal':return{...base,geometry:['species-appropriate original mesh proportions'],motion:['original locomotion blueprint'],audio:['original/licensed species ambience slot']}
  case'texture':return{...base,geometry:[],materials:['procedural material graph','original pattern/noise composition','TRYAMM-owned decal set'],motion:[],audio:[]}
  case'animation':return{...base,geometry:[],materials:[],motion:['Mind Over Matter feature-vector generation','similarity-distance gate','original transitions and finale'],audio:[]}
  case'audio':return{...base,geometry:[],materials:[],motion:[],audio:['original synthesis/recording brief','layered transient/body/tail design','loudness/mobile mix targets']}
  case'ui':return{...base,geometry:['original layout primitives'],materials:['original iconography/type/layout tokens'],motion:['original micro-interactions'],audio:['optional original UI earcons']}
  case'business-brand':return{...base,geometry:['original storefront/signage kit'],materials:['original logo/color/type/signage system'],motion:['optional original sign/advert animation'],audio:['optional original brand sonic mark']}
  case'mission-object':return{...base,geometry:['original gameplay-readable prop silhouette'],motion:['original interaction animation'],audio:['original interaction SFX']}
  default:return{...base,geometry:['owned procedural geometry'],motion:[],audio:[]}
 }
}

export function createMindOverMatterOriginalJob(input:{
 targetId:string
 targetLabel:string
 kind:CleanRoomKind
 reason:CleanRoomReason
 blockedReferenceIds?:string[]
 functionalRequirements?:FunctionalRequirement[]
}):MindOverMatterOriginalJob{
 const seed=stableSeed(`${input.targetId}:${input.kind}:${input.reason}`)
 const mapped=assetKindFor(input.kind)
 return{
  schema:'tryamm.mind-over-matter.clean-room.v1',
  id:`mom-${slug(input.targetId)}-${slug(input.kind)}-${seed.slice(-8)}`,
  targetId:input.targetId,
  targetLabel:input.targetLabel,
  kind:input.kind,
  reason:input.reason,
  createdAt:new Date().toISOString(),
  seed,
  status:'spec-ready',
  blockedReferenceIds:[...new Set(input.blockedReferenceIds||[])],
  allowedInputs:allowedInputs(input.kind),
  forbiddenInputs:forbiddenInputs(input.kind),
  functionalRequirements:input.functionalRequirements||[],
  originalityRules:[
   'Preserve required function, scale, navigation and gameplay semantics; do not preserve protected expressive details.',
   'Do not copy logos, trade dress, distinctive decorative motifs, character likenesses, proprietary textures, private plans or signature audio.',
   'Use blocked references only to record that they are unavailable; do not use their expressive content as generation input.',
   'When only factual constraints are known, generate a clearly original design inside those constraints.',
   'If a real location cannot be lawfully reconstructed with enough evidence, publish an original fictionalized equivalent and label it as such.',
   'Every generated fallback requires visual/originality review before production certification.',
  ],
  outputPlan:outputPlan(input.kind),
  assetFactoryJob:mapped?createAssetFactoryJob(`mom-${slug(input.targetId)}-${slug(input.kind)}`,mapped,'mobile'):undefined,
  productionMutation:false,
  humanReviewRequired:true,
 }
}

function recordPendingOriginalRights(job:MindOverMatterOriginalJob){
 const assetId=job.assetFactoryJob?.id||job.id
 registerAssetRights({
  assetId,
  category:rightsCategoryFor(job.kind),
  status:'PENDING_REVIEW',
  source:'TRYAMM Mind Over Matter Clean-Room Generator',
  creatorOrLicensor:'TRYAMM',
  commercialUse:false,
  derivativeUse:false,
  likenessConsent:job.kind==='character'?false:undefined,
  trademarkClearance:job.kind==='business-brand'?false:undefined,
  reviewedBy:'pending-human-review',
  notes:'Original replacement specification generated without using blocked expressive source content. It remains blocked from production until originality/visual review and normal asset certification pass.',
 })
 return assetId
}

function approveOriginalRights(job:MindOverMatterOriginalJob,reviewedBy='founder-or-release-guardian'){
 const assetId=job.assetFactoryJob?.id||job.id
 registerAssetRights({
  assetId,
  category:rightsCategoryFor(job.kind),
  status:'ORIGINAL',
  source:'TRYAMM Mind Over Matter Clean-Room Generator',
  creatorOrLicensor:'TRYAMM',
  commercialUse:true,
  derivativeUse:true,
  likenessConsent:job.kind==='character'?true:undefined,
  trademarkClearance:job.kind==='business-brand'?true:undefined,
  reviewedBy,
  reviewedAt:new Date().toISOString(),
  notes:'Clean-room original replacement approved after human originality/visual review. Normal runtime/performance/asset certification still applies.',
 })
 return assetId
}

function publish(state:RuntimeState){
 persist(state)
 emit('tryamm:mind-over-matter-clean-room-state',{
  ...state,
  generator:'Mind Over Matter Clean-Room',
  nativeFoundry:TRYAMM_NATIVE_ASSET_FOUNDRY.id,
  policy:{
   replaceBlockedInsteadOfCopying:true,
   preserveFunctionNotProtectedExpression:true,
   productionMutation:false,
   humanReviewRequired:true,
  },
 })
}

export function installMindOverMatterCleanRoomRuntime(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=readState()
 publish(state)

 const create=(detail:any)=>{
  if(!detail?.targetId||!detail?.targetLabel||!detail?.kind)return
  const job=createMindOverMatterOriginalJob({
   targetId:String(detail.targetId),
   targetLabel:String(detail.targetLabel),
   kind:detail.kind as CleanRoomKind,
   reason:(detail.reason||'manual-original-request') as CleanRoomReason,
   blockedReferenceIds:Array.isArray(detail.blockedReferenceIds)?detail.blockedReferenceIds.map(String):[],
   functionalRequirements:Array.isArray(detail.functionalRequirements)?detail.functionalRequirements:[],
  })
  recordPendingOriginalRights(job)
  state={jobs:[...state.jobs,job].slice(-100),lastJob:job}
  publish(state)
  emit('tryamm:mind-over-matter-original-job-created',job)
  emit('tryamm:asset-forge-original-fallback',{job})
  emit('tryamm:ai-cafe-task',{
   workstream:'assets',
   title:`Mind Over Matter: create original ${job.kind} replacement for ${job.targetLabel}`,
   priority:'high',
   metadata:{jobId:job.id,reason:job.reason,productionMutation:false},
  })
 }

 addEventListener('tryamm:mind-over-matter-original-request',(event:Event)=>create((event as CustomEvent).detail||{}))
 addEventListener('tryamm:mind-over-matter-original-bundle-request',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.targetId||!d.targetLabel)return
  const kinds:CleanRoomKind[]=Array.isArray(d.kinds)&&d.kinds.length?d.kinds:[
   'building','interior','vehicle','prop','environment','character','animal',
   'texture','animation','audio','ui','business-brand','mission-object',
  ]
  for(const kind of kinds)create({
   targetId:`${d.targetId}:${kind}`,
   targetLabel:`${d.targetLabel} • ${kind}`,
   kind,
   reason:d.reason||'manual-original-request',
   blockedReferenceIds:d.blockedReferenceIds,
   functionalRequirements:d.functionalRequirements,
  })
 })
 addEventListener('tryamm:mind-over-matter-original-review',(event:Event)=>{
  const d=(event as CustomEvent<{jobId?:string;approved?:boolean;reviewedBy?:string}>).detail||{}
  if(!d.jobId)return
  const job=state.jobs.find(item=>item.id===d.jobId)
  if(!job)return
  if(d.approved){
   approveOriginalRights(job,d.reviewedBy||'founder-or-release-guardian')
   const approved={...job,status:'certified' as const}
   state={jobs:state.jobs.map(item=>item.id===job.id?approved:item),lastJob:state.lastJob?.id===job.id?approved:state.lastJob}
   publish(state)
   emit('tryamm:mind-over-matter-original-approved',{jobId:job.id,assetId:job.assetFactoryJob?.id||job.id})
  }else{
   const review={...job,status:'review-required' as const}
   state={jobs:state.jobs.map(item=>item.id===job.id?review:item),lastJob:state.lastJob?.id===job.id?review:state.lastJob}
   publish(state)
  }
 })
 addEventListener('tryamm:oracle-source-blocked',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  create({
   targetId:d.targetId||d.id,
   targetLabel:d.targetLabel||d.label||'Blocked world asset',
   kind:d.kind||'prop',
   reason:d.reason||'source-terms-blocked',
   blockedReferenceIds:d.sourceId?[String(d.sourceId)]:d.blockedReferenceIds,
   functionalRequirements:d.functionalRequirements,
  })
 })
 addEventListener('tryamm:asset-rights-blocked',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  create({
   targetId:d.assetId||d.targetId,
   targetLabel:d.label||d.assetId||'Blocked asset',
   kind:d.kind||'prop',
   reason:d.reason||'rights-not-cleared',
   blockedReferenceIds:d.assetId?[String(d.assetId)]:[],
   functionalRequirements:d.functionalRequirements,
  })
 })
 addEventListener('tryamm:streetverse-asset-blocked',(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  const asset=d.id?getStreetVerseAsset(String(d.id)):undefined
  create({
   targetId:d.id||'streetverse-blocked-asset',
   targetLabel:asset?.label||d.id||'Blocked StreetVerse asset',
   kind:cleanRoomKindFromStreetVerse(asset?.kind),
   reason:'rights-not-cleared',
   blockedReferenceIds:d.id?[String(d.id)]:[],
   functionalRequirements:[
    {id:'preserve-gameplay-role',label:'Preserve gameplay role',value:true,source:'gameplay-requirement'},
    {id:'replace-protected-expression',label:'Replace protected expressive details with original TRYAMM design',value:true,source:'tryamm-design'},
   ],
  })
 })
 addEventListener('tryamm:mind-over-matter-clean-room-request-state',()=>publish(state))
 emit('tryamm:mind-over-matter-clean-room-ready',{
  cleanRoom:true,
  nativeFoundry:TRYAMM_NATIVE_ASSET_FOUNDRY.id,
  replacementKinds:['building','interior','vehicle','prop','environment','character','animal','texture','animation','audio','ui','business-brand','mission-object'],
  productionMutation:false,
  humanReviewRequired:true,
 })
}
