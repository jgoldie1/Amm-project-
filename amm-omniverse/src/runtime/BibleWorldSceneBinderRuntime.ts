import type {TimeMachineWorldFoundryPlan} from './TimeMachineWorldFoundryRuntime'
import type {BibleWorldCertificationState,BibleWorldPreviewReceipt} from './BibleWorldCertificationRuntime'

export type BibleScenePlacement={
 id:string;assetId:string;kind:string;label:string;x:number;y:number;z:number;rotationY:number;
 artifactUrl:string|null;placeholder:boolean;truthLabel:string;interactive:boolean;collisionTarget:boolean;navigationTarget:boolean
}
export type BibleWorldScenePackage={
 schema:'tryamm.metaverse-bible.scene-package.v1';planId:string;title:string;era:string;truthLabel:string;
 previewOnly:true;productionPublishAllowed:false;createdAt:string;
 placements:BibleScenePlacement[];navNodes:Array<{id:string;x:number;z:number;label:string}>;
 interactions:Array<{id:string;kind:'study'|'portal'|'mission'|'reflection';label:string;placementId?:string;target?:string}>;
 missingArtifacts:string[];providerArtifacts:number;certificationMissing:string[];
}

const KEY='tryamm.metaverse-bible.scene-package.v1'
let installed=false
let activePlan:TimeMachineWorldFoundryPlan|null=null
let certification:BibleWorldCertificationState|null=null
const previews=new Map<string,BibleWorldPreviewReceipt>()
const emit=(name:string,detail:unknown)=>window.dispatchEvent(new CustomEvent(name,{detail}))

function artifactUrl(output:unknown):string|null{
 const visit=(v:any,depth=0):string|null=>{
  if(depth>5||v==null)return null
  if(typeof v==='string'&&(/^(https?:|blob:|data:)/i.test(v)||/\.(glb|gltf|usdz|fbx|obj)(\?|#|$)/i.test(v)))return v
  if(Array.isArray(v)){for(const x of v){const u=visit(x,depth+1);if(u)return u}}
  if(typeof v==='object'){for(const [k,x] of Object.entries(v)){if(/url|uri|artifact|output|file|asset/i.test(k)){const u=visit(x,depth+1);if(u)return u}}for(const x of Object.values(v)){const u=visit(x,depth+1);if(u)return u}}
  return null
 }
 return visit(output)
}

function placementFor(asset:any,index:number):BibleScenePlacement{
 const p=previews.get(asset.id)
 const url=artifactUrl(p?.output)
 const ring=Math.floor(index/6),slot=index%6,angle=(slot/6)*Math.PI*2
 const radius=10+ring*8
 return{
  id:'placement:'+asset.id,assetId:asset.id,kind:String(asset.kind||'prop'),label:String(asset.label||'Bible world asset'),
  x:Number((Math.cos(angle)*radius).toFixed(2)),y:0,z:Number((Math.sin(angle)*radius).toFixed(2)),rotationY:Number((-angle+Math.PI/2).toFixed(3)),
  artifactUrl:url,placeholder:!url,truthLabel:activePlan?.truthLabel||'SOURCE LABEL REQUIRED',interactive:true,
  collisionTarget:Boolean(p?.integration?.collision),navigationTarget:Boolean(p?.integration?.navigation),
 }
}

function buildPackage():BibleWorldScenePackage|null{
 if(!activePlan||!certification||certification.planId!==activePlan.id)return null
 const placements=activePlan.assets.map(placementFor)
 const navNodes=placements.map((p,i)=>({id:'nav:'+p.assetId,x:p.x,z:p.z,label:p.label}));navNodes.unshift({id:'nav:return',x:0,z:0,label:'Hebrew School Return Portal'})
 const interactions=[
  {id:'study-source',kind:'study' as const,label:'Open source-labeled Scripture study',target:'/metaverse-bible'},
  {id:'return-kingdom',kind:'portal' as const,label:'Return to Kingdom Hebrew School',target:'/kingdom'},
  {id:'reflection',kind:'reflection' as const,label:'Record study reflection',target:'/kingdom-workbook'},
  ...placements.slice(0,8).map((p,i)=>({id:'inspect:'+p.assetId,kind:'mission' as const,label:'Inspect '+p.label,placementId:p.id,target:'study-node-'+(i+1)})),
 ]
 const missingArtifacts=placements.filter(p=>p.placeholder).map(p=>p.assetId)
 return{schema:'tryamm.metaverse-bible.scene-package.v1',planId:activePlan.id,title:activePlan.title,era:activePlan.era,truthLabel:activePlan.truthLabel,previewOnly:true,productionPublishAllowed:false,createdAt:new Date().toISOString(),placements,navNodes,interactions,missingArtifacts,providerArtifacts:placements.length-missingArtifacts.length,certificationMissing:certification.missing.map(String)}
}

function publish(){
 const pkg=buildPackage();if(!pkg)return
 try{localStorage.setItem(KEY,JSON.stringify(pkg));localStorage.setItem('tryamm.kingdom.hebrew-school.bible-world-preview.v1',JSON.stringify(pkg))}catch{}
 emit('tryamm:bible-world-scene-package-ready',pkg)
 emit('tryamm:holo-lab-walkable-bible-world-ready',pkg)
 emit('tryamm:kingdom-hebrew-school-world-ready',pkg)
}

export function readBibleWorldScenePackage():BibleWorldScenePackage|null{try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return v?.schema==='tryamm.metaverse-bible.scene-package.v1'?v:null}catch{return null}}

export function installBibleWorldSceneBinderRuntime(){
 if(installed||typeof window==='undefined')return()=>{}
 installed=true
 const onPlan=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(!d?.id&&!d?.planId)return;const p=d.schema==='tryamm.time-machine.world-foundry.v1'?d:d.activePlan;if(p?.id&&/bible|faith|judea|galilee|hebrew|scripture/i.test(String(p.title||'')+' '+String(p.era||''))){activePlan=p;publish()}}
 const onFoundryState=(event:Event)=>{const p=(event as CustomEvent<any>).detail?.activePlan;if(p?.id){activePlan=p;publish()}}
 const onPreview=(event:Event)=>{const p=(event as CustomEvent<BibleWorldPreviewReceipt>).detail;if(p?.id){previews.set(String((p as any).requirements?.assetId||p.id),p);if((p as any).requirements?.assetId)previews.set(String((p as any).requirements.assetId),p);publish()}}
 const onCertification=(event:Event)=>{const s=(event as CustomEvent<BibleWorldCertificationState>).detail;if(s?.schema==='tryamm.metaverse-bible.world-certification.v1'){certification=s;publish()}}
 const request=()=>{const pkg=readBibleWorldScenePackage();if(pkg)emit('tryamm:bible-world-scene-package-ready',pkg)}
 addEventListener('tryamm:time-machine-world-foundry-plan',onPlan as EventListener)
 addEventListener('tryamm:time-machine-world-foundry-state',onFoundryState as EventListener)
 addEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener)
 addEventListener('tryamm:bible-world-certification-state',onCertification as EventListener)
 addEventListener('tryamm:bible-world-scene-package-request',request)
 emit('tryamm:bible-world-scene-binder-ready',{walkablePreviewPackage:true,providerArtifactsOnlyWhenPresent:true,placeholderFallback:true,productionPublishAllowed:false})
 return()=>{removeEventListener('tryamm:time-machine-world-foundry-plan',onPlan as EventListener);removeEventListener('tryamm:time-machine-world-foundry-state',onFoundryState as EventListener);removeEventListener('tryamm:holo-lab-hologram-preview-ready',onPreview as EventListener);removeEventListener('tryamm:bible-world-certification-state',onCertification as EventListener);removeEventListener('tryamm:bible-world-scene-package-request',request);installed=false}
}