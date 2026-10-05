import {createProductionTransformationManifest} from '../data/GenieBottleAssetTransformationEngine'
import type {AssetKind} from '../data/TryammAssetForge'

export type TimeMachineFoundryMode='HISTORY'|'RECONSTRUCTION'|'SIMULATION'|'ADVENTURE'|'ENGINEERING'|'SPACE'
export type FoundryEvidence='verified-source'|'source-backed'|'mixed'|'conceptual'|'missing'
export type FoundryAssetState='recipe-ready'|'preview-queued'|'preview-ready'|'preview-degraded'|'review-required'|'production-requested'|'failed'

export type TimeMachineFoundryAsset={
 id:string;label:string;kind:AssetKind;purpose:string;evidence:FoundryEvidence;
 requestedLook:string;qualityTier:'mobile'|'premium'|'hero';state:FoundryAssetState;
 genieWinner:string;genieScore:number;genieEvidenceState:string;holoForgeId?:string;provider?:string;message?:string
}

export type TimeMachineWorldFoundryRequest={
 id?:string;title:string;era?:string;mode?:TimeMachineFoundryMode|string;evidenceLevel?:string;
 description?:string;objective?:string;source?:string;cityId?:string;neighborhoodId?:string;
 historicalUrl?:string;featuredBook?:string;requestedAssets?:Array<Partial<TimeMachineFoundryAsset>&{label:string;kind:AssetKind}>;
 autoPreview?:boolean
}

export type TimeMachineWorldFoundryPlan={
 schema:'tryamm.time-machine.world-foundry.v1';id:string;title:string;era:string;mode:TimeMachineFoundryMode;
 source:string;createdAt:string;evidenceLevel:string;truthLabel:string;objective:string;historicalUrl?:string;
 stages:readonly string[];assets:TimeMachineFoundryAsset[];previewOnly:true;productionMutation:false;
 requiresHumanReview:true;publishAllowed:false;blockers:string[];receipts:string[]
}

type State={activePlan:TimeMachineWorldFoundryPlan|null;history:TimeMachineWorldFoundryPlan[]}
const KEY='tryamm.time-machine.world-foundry.v1'
let installed=false
const emit=(name:string,detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}
const slug=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'scene'

function modeOf(v:unknown):TimeMachineFoundryMode{
 const q=String(v||'RECONSTRUCTION').toUpperCase().replace(/[^A-Z]+/g,'_')
 if(q.includes('HISTORY'))return'HISTORY'
 if(q.includes('ENGINEER'))return'ENGINEERING'
 if(q.includes('SPACE'))return'SPACE'
 if(q.includes('ADVENTURE'))return'ADVENTURE'
 if(q.includes('SIMULATION'))return'SIMULATION'
 return'RECONSTRUCTION'
}
function truthLabel(mode:TimeMachineFoundryMode,evidence:string){
 if(mode==='HISTORY')return'ARCHIVED / VERIFIED OBSERVATION ONLY'
 if(mode==='RECONSTRUCTION')return'SOURCE-GROUNDED RECONSTRUCTION • UNCERTAINTY LABELED'
 if(mode==='ENGINEERING')return'ENGINEERING DIGITAL TWIN / VERSION COMPARISON'
 if(mode==='SPACE')return'OBSERVATION + EPHEMERIS / SIMULATION'
 if(mode==='ADVENTURE')return'FICTIONAL TIME-TRAVEL ENTERTAINMENT'
 return evidence.toLowerCase().includes('documented')?'DOCUMENTED INPUT + SIMULATION':'SIMULATION / WHAT-IF'
}
function read():State{try{const p=JSON.parse(localStorage.getItem(KEY)||'null');return{activePlan:p?.activePlan||null,history:Array.isArray(p?.history)?p.history.slice(-20):[]}}catch{return{activePlan:null,history:[]}}}
function save(state:State){try{localStorage.setItem(KEY,JSON.stringify({...state,history:state.history.slice(-20)}))}catch{}}
function defaultAssets(r:TimeMachineWorldFoundryRequest):Array<{label:string;kind:AssetKind;purpose:string;evidence:FoundryEvidence;qualityTier:'mobile'|'premium'|'hero'}>{
 const q=(r.title+' '+(r.description||'')+' '+(r.objective||'')+' '+(r.source||'')).toLowerCase()
 const faith=/faith|bible|scripture|messiah|judea|galilee|hebrew|jubilee|esther/.test(q)
 const chicago=/chicago|circle park|abla|roosevelt|taylor|pilsen|loop|south side/.test(q)
 const out:Array<{label:string;kind:AssetKind;purpose:string;evidence:FoundryEvidence;qualityTier:'mobile'|'premium'|'hero'}>=[
  {label:faith?'historical Scripture-region environment':chicago?'historical Chicago district environment':'time-scene environment',kind:'environment',purpose:'terrain, streets, sky, ecology and spatial context',evidence:'source-backed',qualityTier:'premium'},
  {label:faith?'period architecture set':chicago?'Chicago architecture set':'scene architecture set',kind:'building',purpose:'walkable exteriors/interiors and landmark silhouettes',evidence:'mixed',qualityTier:'premium'},
  {label:'period prop and interaction set',kind:'prop',purpose:'interactive objects, signage, study/mission objects and set dressing',evidence:'mixed',qualityTier:'premium'},
  {label:faith?'educational historical character cast':'scene character cast',kind:'character',purpose:'source-labeled educational/simulation NPC roles; no unsupported likeness claims',evidence:'conceptual',qualityTier:'premium'},
 ]
 if(chicago)out.push({label:'period mobility set',kind:'vehicle',purpose:'historically appropriate fictionalized mobility and traffic props',evidence:'mixed',qualityTier:'premium'})
 if(/galilee|fishing|boat/.test(q))out.push({label:'Galilee fishing vessel',kind:'vehicle',purpose:'reconstructed educational boat gameplay',evidence:'source-backed',qualityTier:'hero'})
 return out
}
function toAsset(planId:string,r:TimeMachineWorldFoundryRequest,input:{label:string;kind:AssetKind;purpose?:string;evidence?:FoundryEvidence;qualityTier?:'mobile'|'premium'|'hero';requestedLook?:string},index:number):TimeMachineFoundryAsset{
 const id=`${planId}:asset:${index}:${slug(input.label)}`
 const requestedLook=input.requestedLook||`${r.era||'period'} ${input.label}; physically believable first, TRYAMM holographic semantic layer second; source/provenance labels preserved`
 const tournament=createProductionTransformationManifest({
  id,sourceAssetId:`foundry-placeholder:${id}`,kind:input.kind,cityId:r.cityId||(/chicago/i.test(r.title+' '+(r.description||''))?'chicago':'simulation'),
  neighborhoodId:r.neighborhoodId,target:input.qualityTier==='hero'?'cinematic':'web',
  defects:['production artifact missing or incomplete','requires source/provenance labeling','requires mobile/runtime integration'],
  requestedLook,holographicLevel:'integrated',referenceIds:[],oracleApprovedReferenceIds:[],referenceCandidates:[],
 })
 return{id,label:input.label,kind:input.kind,purpose:input.purpose||'time-scene asset',evidence:input.evidence||'conceptual',
  requestedLook,qualityTier:input.qualityTier||'premium',state:'recipe-ready',genieWinner:tournament.recipeWinner.label,
  genieScore:tournament.recipeWinner.weightedScore,genieEvidenceState:tournament.promotion.evidenceState}
}
function compile(req:TimeMachineWorldFoundryRequest):TimeMachineWorldFoundryPlan{
 const id=`tmwf-${slug(req.id||req.title)}-${Date.now().toString(36)}`
 const mode=modeOf(req.mode)
 const inputs=req.requestedAssets?.length?req.requestedAssets.map(x=>({label:x.label,kind:x.kind,purpose:x.purpose,evidence:x.evidence,qualityTier:x.qualityTier,requestedLook:x.requestedLook})):defaultAssets(req)
 const assets=inputs.map((a,i)=>toAsset(id,req,a as any,i))
 const blockers:string[]=['production asset certification not complete','human visual review not complete','world QA/collision/navigation/performance certification not complete']
 if(mode==='HISTORY'&&!req.historicalUrl)blockers.push('history mode requires archived/verified evidence source before exact historical claims')
 return{schema:'tryamm.time-machine.world-foundry.v1',id,title:req.title,era:req.era||'unspecified',mode,source:req.source||'manual',
  createdAt:new Date().toISOString(),evidenceLevel:req.evidenceLevel||'mixed',truthLabel:truthLabel(mode,req.evidenceLevel||'mixed'),
  objective:req.objective||req.description||'Construct a source-labeled immersive time scene.',historicalUrl:req.historicalUrl,
  stages:['RECALL / CURRENT STATE','SOURCE / ARCHIVE EVIDENCE','WORLD BUILDER PLAN','GENIE FOUR-CANDIDATE TOURNAMENT','MIND OVER MATTER ORIGINAL SPEC','HOLOFORGE PREVIEW','HOLO LAB HOLOGRAM PREVIEW','COLLISION / NAV / MOBILE QA','HUMAN VISUAL REVIEW','ASSET PASSPORT / PUBLISH GATE'],
  assets,previewOnly:true,productionMutation:false,requiresHumanReview:true,publishAllowed:false,blockers,receipts:['compiled-foundry-plan','genie-recipes-ready']}
}
function publish(state:State){save(state);emit('tryamm:time-machine-world-foundry-state',state)}
function queuePreview(plan:TimeMachineWorldFoundryPlan){
 emit('tryamm:quantum-world-builder-request',{id:plan.id,label:plan.title,scale:/chicago/i.test(plan.title+' '+plan.source)?'west':'world',cityId:/chicago/i.test(plan.title+' '+plan.source)?'chicago':'simulation',status:'FOUNDRY_PREVIEW',metadata:{era:plan.era,mode:plan.mode,truthLabel:plan.truthLabel,source:plan.source}})
 for(const asset of plan.assets){
  emit('tryamm:mind-over-matter-original-request',{
   targetId:asset.id,targetLabel:asset.label,kind:asset.kind==='environment'?'environment':asset.kind,
   reason:asset.evidence==='missing'?'missing-source':'manual-original-request',
   functionalRequirements:[
    {id:'time-era',label:'Time / era',value:plan.era,source:'public-fact'},
    {id:'truth-label',label:'Visible reconstruction truth label',value:plan.truthLabel,source:'tryamm-design'},
    {id:'gameplay-purpose',label:'Gameplay / study purpose',value:asset.purpose,source:'gameplay-requirement'},
    {id:'one-hand-access',label:'One-hand/mobile accessibility',value:true,source:'accessibility-requirement'},
   ],
  })
  emit('tryamm:holoforge-request',{
   kind:asset.kind,prompt:asset.requestedLook,worldSessionId:plan.id,tags:['time-machine-foundry','holo-lab-preview','preview-only',plan.mode.toLowerCase(),asset.evidence],
   priority:asset.qualityTier==='hero'?'high':'normal',qualityTier:asset.qualityTier,previewOnly:true,
   requirements:{foundryPlanId:plan.id,assetId:asset.id,truthLabel:plan.truthLabel,evidence:asset.evidence,purpose:asset.purpose,productionPublishAllowed:false},
  })
 }
 emit('tryamm:holo-lab-foundry-preview',{planId:plan.id,title:plan.title,era:plan.era,truthLabel:plan.truthLabel,assets:plan.assets,previewOnly:true})
 emit('tryamm:time-machine-foundry-preview-queued',{planId:plan.id,assets:plan.assets.length})
}
async function collectHistoryEvidence(req:TimeMachineWorldFoundryRequest,plan:TimeMachineWorldFoundryPlan){
 if(plan.mode!=='HISTORY')return{plan,ready:true}
 if(!req.historicalUrl){
  emit('tryamm:time-machine-evidence-required',{planId:plan.id,mode:plan.mode,reason:'HISTORY requires an archived/verified source URL before exact historical preview.'})
  return{plan,ready:false}
 }
 try{
  const response=await fetch('/api/time-machine/internet',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'timeline',url:req.historicalUrl,from:req.era,to:req.era,limit:30,commonCrawlLimit:8})})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'historical internet evidence failed'))
  const count=Array.isArray(data?.captures)?data.captures.length:0
  if(count<1){
   const blocked={...plan,blockers:[...plan.blockers,'no archived capture found for HISTORY preview'],receipts:[...plan.receipts,'historical-internet:no-captures']}
   emit('tryamm:time-machine-evidence-state',{planId:plan.id,ready:false,url:data?.url||req.historicalUrl,captures:0,completeness:data?.completeness||'unknown'})
   return{plan:blocked,ready:false}
  }
  const verified={...plan,
   blockers:plan.blockers.filter(x=>!x.includes('history mode requires archived/verified evidence source')),
   receipts:[...plan.receipts,`historical-internet:${count}-observed-captures`]}
  emit('tryamm:time-machine-evidence-state',{planId:plan.id,ready:true,url:data?.url||req.historicalUrl,captures:count,completeness:data?.completeness||'partial-observed-captures-only',warning:data?.warning})
  return{plan:verified,ready:true}
 }catch(error){
  const blocked={...plan,blockers:[...plan.blockers,'historical archive evidence lookup failed'],receipts:[...plan.receipts,'historical-internet:lookup-failed']}
  emit('tryamm:time-machine-evidence-state',{planId:plan.id,ready:false,error:error instanceof Error?error.message:String(error)})
  return{plan:blocked,ready:false}
 }
}
async function handle(req:TimeMachineWorldFoundryRequest,state:State){
 let plan=compile(req)
 let next={activePlan:plan,history:[...state.history,plan].slice(-20)}
 publish(next)
 emit('tryamm:time-machine-world-foundry-plan',plan)
 const evidence=await collectHistoryEvidence(req,plan)
 plan=evidence.plan
 next={activePlan:plan,history:next.history.map(p=>p.id===plan.id?plan:p)}
 publish(next)
 if(evidence.ready)queuePreview(plan)
 else emit('tryamm:time-machine-foundry-preview-blocked',{planId:plan.id,mode:plan.mode,blockers:plan.blockers})
 return next
}
export function installTimeMachineWorldFoundryRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 let state=read();publish(state)
 const request=(event:Event)=>{const d=(event as CustomEvent<TimeMachineWorldFoundryRequest>).detail;if(d?.title)void handle(d,state).then(next=>{state=next})}
 const chrono=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(!d?.name&&!d?.title)return;void handle({id:d.scenarioId||d.id,title:d.name||d.title,era:d.era,mode:d.scenarioType||'RECONSTRUCTION',evidenceLevel:d.evidenceLevel||'mixed',description:d.description,objective:d.objective,source:d.source||'faith-chrono',featuredBook:d.featuredBook,autoPreview:true},state).then(next=>{state=next})}
 const chicago=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(!d?.title)return;void handle({id:d.id,title:d.title,era:d.era,mode:d.mode||'RECONSTRUCTION',evidenceLevel:d.evidence||'mixed',description:d.summary,objective:Array.isArray(d.objectives)?d.objectives.join(' → '):d.objective,source:'chicago-time-machine',cityId:'chicago',neighborhoodId:d.scope,autoPreview:true,historicalUrl:d.historicalUrl},state).then(next=>{state=next})}
 const holo=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{};const plan=state.activePlan;if(!plan||d?.worldSessionId!==plan.id)return
  const assetId=String(d?.requirements?.assetId||'');if(!assetId)return
  const nextPlan={...plan,assets:plan.assets.map(a=>a.id===assetId?{...a,state:d.status==='generated'?'preview-ready':d.status==='degraded'?'preview-degraded':d.status==='failed'?'failed':a.state,holoForgeId:d.id,provider:d.provider,message:d.message}:a)}
  state={...state,activePlan:nextPlan,history:state.history.map(p=>p.id===nextPlan.id?nextPlan:p)};publish(state)
 }
 addEventListener('tryamm:time-machine-world-foundry-request',request)
 addEventListener('tryamm:chrono-run-started',chrono)
 addEventListener('tryamm:time-machine-enter',chicago)
 addEventListener('tryamm:holoforge-asset-ready',holo)
 addEventListener('tryamm:time-machine-world-foundry-request-state',()=>publish(state))
 emit('tryamm:time-machine-world-foundry-ready',{installed:true,uses:['Quantum World Builder','World Forger / CAD','Genie in the Bottle','Mind Over Matter','HoloForge','Holo Gen','Holo Lab','Googolplex receipts'],productionMutation:false,publishRequiresApproval:true})
 return()=>{
  removeEventListener('tryamm:time-machine-world-foundry-request',request)
  removeEventListener('tryamm:chrono-run-started',chrono)
  removeEventListener('tryamm:time-machine-enter',chicago)
  removeEventListener('tryamm:holoforge-asset-ready',holo)
  installed=false
 }
}
