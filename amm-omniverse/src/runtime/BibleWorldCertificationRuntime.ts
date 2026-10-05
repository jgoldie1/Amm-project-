export type BibleWorldCertificationCheck=
 'source-label'|'all-preview-receipts'|'provider-artifacts'|'collision-verified'|'navigation-verified'|'mobile-performance-verified'|'accessibility-verified'|'human-visual-review'

export type BibleWorldPreviewReceipt={
 id:string;kind:string;status:string;provider:string;degraded?:boolean;previewOnly?:boolean;
 worldSessionId?:string|null;integration?:{collision?:boolean;navigation?:boolean;lod?:boolean;spawnable?:boolean};output?:unknown;message?:string
}

export type BibleWorldCertificationState={
 schema:'tryamm.metaverse-bible.world-certification.v1'
 planId:string|null;title:string;era:string;truthLabel:string;
 assetCount:number;previewCount:number;previews:BibleWorldPreviewReceipt[];
 checks:Record<BibleWorldCertificationCheck,boolean>;
 declaredTargets:{collision:boolean;navigation:boolean;lod:boolean};
 missing:BibleWorldCertificationCheck[];
 previewHandoffAllowed:boolean;
 productionPublishAllowed:boolean;
 previewOnly:true;
 humanReviewRequired:true;
 updatedAt:string;
}

const KEY='tryamm.metaverse-bible.world-certification.v1'
let installed=false
const CHECKS:BibleWorldCertificationCheck[]=['source-label','all-preview-receipts','provider-artifacts','collision-verified','navigation-verified','mobile-performance-verified','accessibility-verified','human-visual-review']
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

function blank():BibleWorldCertificationState{
 return{schema:'tryamm.metaverse-bible.world-certification.v1',planId:null,title:'',era:'',truthLabel:'',assetCount:0,previewCount:0,previews:[],checks:{
  'source-label':false,'all-preview-receipts':false,'provider-artifacts':false,'collision-verified':false,'navigation-verified':false,
  'mobile-performance-verified':false,'accessibility-verified':false,'human-visual-review':false,
 },declaredTargets:{collision:false,navigation:false,lod:false},missing:[...CHECKS],previewHandoffAllowed:false,productionPublishAllowed:false,previewOnly:true,humanReviewRequired:true,updatedAt:new Date().toISOString()}
}
function read():BibleWorldCertificationState{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');if(v?.schema==='tryamm.metaverse-bible.world-certification.v1')return v}catch{}return blank()}
function outputHasArtifact(output:unknown):boolean{
 const visit=(value:any,depth=0):boolean=>{
  if(depth>5||value==null)return false
  if(typeof value==='string')return /^(https?:|blob:|data:)/i.test(value)||/\.(glb|gltf|fbx|obj|usdz|png|jpe?g|webp)(\?|#|$)/i.test(value)
  if(Array.isArray(value))return value.some(x=>visit(x,depth+1))
  if(typeof value==='object')return Object.entries(value).some(([k,v])=>/url|uri|artifact|output|file|asset/i.test(k)&&visit(v,depth+1)||visit(v,depth+1))
  return false
 }
 return visit(output)
}
function recompute(state:BibleWorldCertificationState):BibleWorldCertificationState{
 const relevant=state.previews.filter(p=>p.worldSessionId===state.planId)
 const previewCount=relevant.length
 const checks={...state.checks}
 checks['source-label']=Boolean(state.truthLabel&&state.truthLabel.length>8)
 checks['all-preview-receipts']=state.assetCount>0&&previewCount>=state.assetCount
 checks['provider-artifacts']=checks['all-preview-receipts']&&relevant.every(p=>p.status==='generated'&&!p.degraded&&p.provider!=='holo-router'&&outputHasArtifact(p.output))
 const declaredTargets={
  collision:relevant.some(p=>p.integration?.collision===true),
  navigation:relevant.some(p=>p.integration?.navigation===true),
  lod:relevant.some(p=>p.integration?.lod===true),
 }
 const missing=CHECKS.filter(k=>checks[k]!==true)
 return{...state,previewCount,previews:relevant.slice(-32),checks,declaredTargets,missing,
  previewHandoffAllowed:checks['source-label']&&checks['all-preview-receipts'],
  productionPublishAllowed:missing.length===0,
  previewOnly:true,humanReviewRequired:true,updatedAt:new Date().toISOString()}
}
function save(state:BibleWorldCertificationState){
 const next=recompute(state)
 try{localStorage.setItem(KEY,JSON.stringify(next))}catch{}
 emit('tryamm:bible-world-certification-state',next)
 return next
}
function previewPackage(state:BibleWorldCertificationState){
 return{
  schema:'tryamm.metaverse-bible.hebrew-school-preview.v1',planId:state.planId,title:state.title,era:state.era,truthLabel:state.truthLabel,
  previewCount:state.previewCount,assetCount:state.assetCount,previews:state.previews.map(p=>({id:p.id,kind:p.kind,provider:p.provider,status:p.status,message:p.message||''})),
  previewOnly:true,productionPublishAllowed:false,certificationMissing:state.missing,createdAt:new Date().toISOString(),
 }
}

export function readBibleWorldCertificationState(){return read()}

export function installBibleWorldCertificationRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 let state=read()

 const onPlan=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.planId)return
  const isBible=/bible|judea|galilee|hebrew|scripture|faith/i.test(String(d.title||'')+' '+String(d.era||'')+' '+JSON.stringify(d.assets||[]))
  if(!isBible)return
  state=save({...blank(),planId:String(d.planId),title:String(d.title||'Metaverse Bible World'),era:String(d.era||''),truthLabel:String(d.truthLabel||''),assetCount:Array.isArray(d.assets)?d.assets.length:0,previews:[]})
 }
 const onPreview=(event:Event)=>{
  const p=(event as CustomEvent<BibleWorldPreviewReceipt>).detail
  if(!p?.id||!p.previewOnly||!state.planId||p.worldSessionId!==state.planId)return
  state=save({...state,previews:[...state.previews.filter(x=>x.id!==p.id),p]})
 }
 const onEvidence=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(d.serverVerified!==true||d.source!=='server-production-evidence'||String(d.planId||'')!==String(state.planId||''))return
  const checks={...state.checks}
  for(const k of CHECKS)if(typeof d[k]==='boolean')checks[k]=Boolean(d[k])
  state=save({...state,checks})
 }
 const requestState=()=>{state=save(state)}
 const handoff=()=>{
  state=save(state)
  if(!state.previewHandoffAllowed){emit('tryamm:bible-world-hebrew-school-preview-blocked',{reason:'PREVIEW_RECEIPTS_INCOMPLETE',missing:state.missing,planId:state.planId});return}
  const pkg=previewPackage(state)
  try{localStorage.setItem('tryamm.metaverse-bible.hebrew-school-preview.v1',JSON.stringify(pkg))}catch{}
  emit('tryamm:bible-world-hebrew-school-preview-ready',pkg)
 }

 addEventListener('tryamm:holo-lab-foundry-preview',onPlan as EventListener)
 addEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener)
 addEventListener('tryamm:bible-world-qa-evidence',onEvidence as EventListener)
 addEventListener('tryamm:bible-world-certification-request-state',requestState)
 addEventListener('tryamm:bible-world-hebrew-school-preview-request',handoff)
 state=save(state)
 emit('tryamm:bible-world-certification-ready',{checks:CHECKS,previewCanHandoffBeforeProduction:true,productionFailClosed:true})
 return()=>{
  removeEventListener('tryamm:holo-lab-foundry-preview',onPlan as EventListener)
  removeEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener)
  removeEventListener('tryamm:bible-world-qa-evidence',onEvidence as EventListener)
  removeEventListener('tryamm:bible-world-certification-request-state',requestState)
  removeEventListener('tryamm:bible-world-hebrew-school-preview-request',handoff)
  installed=false
 }
}
