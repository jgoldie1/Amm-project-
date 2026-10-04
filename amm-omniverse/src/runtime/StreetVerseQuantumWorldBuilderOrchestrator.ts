import {CHICAGO_AREA_COMPILER_STAGES} from '../game/runtime/chicagoCommunityAreaCompiler'
import {WORLD_FORGER_PIPELINE} from '../game/forger/StreetVerseWorldForger'
import {STREETVERSE_ORACLE_PROFILE} from '../services/streetverseOracle'
import {getOracleCloudStatus} from '../services/oracleCloud'

export type WorldBuildScale='west'|'chicago'|'illinois'|'usa'|'world'
export type WorldBuildTaskState='ready'|'blocked'|'running'|'passed'|'failed'|'approval-required'
export type WorldBuildStage=
 |'source-discovery'
 |'rights-provenance'
 |'original-fallback'
 |'geospatial'
 |'cad-reconstruction'
 |'asset-forge'
 |'construct-placement'
 |'living-world'
 |'missions-economy'
 |'mobile-lod'
 |'qa-certification'

export type WorldBuildSourceRequirement={
 id:string
 label:string
 preferred:string[]
 allowed:string[]
 prohibited:string[]
 required:boolean
}

export type WorldBuildTask={
 id:string
 stage:WorldBuildStage
 label:string
 state:WorldBuildTaskState
 dependencies:string[]
 parallelGroup:number
 autoExecutable:boolean
 approvalRequired:boolean
 outputs:string[]
}

export type WorldBuildTarget={
 id:string
 label:string
 scale:WorldBuildScale
 status?:string
 communityAreaNumber?:string
 cityId?:string
 stateId?:string
 metadata?:Record<string,unknown>
}

export type QuantumWorldBuildPlan={
 schema:'tryamm.streetverse.quantum-world-builder.v1'
 id:string
 target:WorldBuildTarget
 createdAt:string
 quantumMeaning:string
 oracle:{
  profile:string
  cloudReturnMode:string
  sourceRules:readonly string[]
  requirements:WorldBuildSourceRequirement[]
 }
 cursorConstruct:{
  authority:'proposal-and-orchestration'
  productionMutation:false
  approvalRequiredForPublish:true
  responsibilities:string[]
 }
 worldForger:{
  pipeline:readonly string[]
  responsibilities:string[]
 }
 construct:{
  responsibilities:string[]
 }
 tasks:WorldBuildTask[]
 certificationGates:string[]
}

type State={
 activePlan:QuantumWorldBuildPlan|null
 history:QuantumWorldBuildPlan[]
}

const STORAGE_KEY='tryamm.streetverse.quantum-world-builder.v1'
let installed=false

const emit=(name:string,detail:unknown)=>{if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))}

function slug(value:string){
 return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'target'
}

function readState():State{
 try{
  const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null')
  return {
   activePlan:parsed?.activePlan||null,
   history:Array.isArray(parsed?.history)?parsed.history.slice(-20):[],
  }
 }catch{return{activePlan:null,history:[]}}
}

function persist(state:State){
 try{localStorage.setItem(STORAGE_KEY,JSON.stringify({...state,history:state.history.slice(-20)}))}catch{}
}

function sourceRequirements(target:WorldBuildTarget):WorldBuildSourceRequirement[]{
 const realWorld=target.scale!=='world'||target.cityId!=='simulation'
 return [
  {
   id:'official-boundaries',
   label:'Official / open administrative boundaries',
   preferred:['official municipal/state/federal GIS','public open-data portal'],
   allowed:['open GIS','licensed map data'],
   prohibited:['private location databases','circumvented map endpoints'],
   required:true,
  },
  {
   id:'roads-transit',
   label:'Roads, sidewalks, transit and mobility graph',
   preferred:['official transportation open data','licensed/open GIS','approved transit feeds'],
   allowed:['public open data','licensed APIs','OpenStreetMap-compatible source with attribution'],
   prohibited:['scraped proprietary map tiles','bypassed access controls'],
   required:true,
  },
  {
   id:'building-footprints',
   label:'Building footprints, parcels and height evidence',
   preferred:['official building/parcel open data','open GIS','owner-authorized survey/CAD'],
   allowed:['public open data','licensed plans','permissioned scans'],
   prohibited:['private floor plans','security-sensitive infrastructure detail'],
   required:realWorld,
  },
  {
   id:'visual-reference',
   label:'Exterior visual reference',
   preferred:['owner-authorized photos','user captures with rights','commercially licensed imagery'],
   allowed:['street-view as reference only','public-domain imagery where verified'],
   prohibited:['copying proprietary imagery into owned textures','paywall/robots bypass'],
   required:false,
  },
  {
   id:'interiors',
   label:'Interior reconstruction evidence',
   preferred:['owner-authorized floor plans','permissioned scans','authorized photos'],
   allowed:['conceptual interiors clearly labeled as conceptual'],
   prohibited:['inferred private interiors presented as fact','current security/access-control detail'],
   required:false,
  },
  {
   id:'business-community',
   label:'Business, landmark and community anchors',
   preferred:['official business/open-data sources','owner-authorized Business Passport','public institutional directories'],
   allowed:['public web metadata with terms respected','community submissions with consent'],
   prohibited:['private-person tracking','unlicensed copyrighted content replication'],
   required:true,
  },
 ]
}

function makeTasks(target:WorldBuildTarget):WorldBuildTask[]{
 const prefix=slug(target.id||target.label)
 const tasks:WorldBuildTask[]=[
  {id:`${prefix}:discover`,stage:'source-discovery',label:'Oracle source discovery manifest',state:'ready',dependencies:[],parallelGroup:1,autoExecutable:true,approvalRequired:false,outputs:['source manifest','provider candidates','freshness/coverage report']},
  {id:`${prefix}:rights`,stage:'rights-provenance',label:'Rights + provenance review',state:'blocked',dependencies:[`${prefix}:discover`],parallelGroup:2,autoExecutable:true,approvalRequired:true,outputs:['rights ledger','approved source set','blocked-source report']},
  {id:`${prefix}:original`,stage:'original-fallback',label:'Mind Over Matter original fallback',state:'blocked',dependencies:[`${prefix}:rights`],parallelGroup:3,autoExecutable:true,approvalRequired:true,outputs:['original replacement specs','clean-room manifests','native foundry jobs','fictionalized equivalents where required']},
  {id:`${prefix}:geo`,stage:'geospatial',label:'Compile boundaries, roads, transit and footprints',state:'blocked',dependencies:[`${prefix}:rights`],parallelGroup:3,autoExecutable:true,approvalRequired:false,outputs:['district graph','road graph','building footprints','landmark anchors']},
  {id:`${prefix}:cad`,stage:'cad-reconstruction',label:'Generate CAD reconstruction plans',state:'blocked',dependencies:[`${prefix}:geo`],parallelGroup:4,autoExecutable:true,approvalRequired:false,outputs:['building CAD plans','levels','stairs/elevator rules','utility placeholders','confidence metadata']},
  {id:`${prefix}:assets`,stage:'asset-forge',label:'Forge buildings, props, vehicles and environment assets',state:'blocked',dependencies:[`${prefix}:cad`],parallelGroup:5,autoExecutable:true,approvalRequired:true,outputs:['GLB/PBR asset jobs','material recipes','mobile LOD jobs','provenance metadata']},
  {id:`${prefix}:place`,stage:'construct-placement',label:'Cursor Construct placement + interaction plan',state:'blocked',dependencies:[`${prefix}:assets`,`${prefix}:geo`],parallelGroup:6,autoExecutable:true,approvalRequired:false,outputs:['world anchors','collision/nav targets','interaction anchors','build patch proposal']},
  {id:`${prefix}:living`,stage:'living-world',label:'Attach population, traffic, ecology and services',state:'blocked',dependencies:[`${prefix}:place`],parallelGroup:7,autoExecutable:true,approvalRequired:false,outputs:['synthetic population rules','traffic/transit','trees/ecology','police/fire/EMS/service slots']},
  {id:`${prefix}:missions`,stage:'missions-economy',label:'Attach missions, jobs, businesses and creator economy',state:'blocked',dependencies:[`${prefix}:place`],parallelGroup:7,autoExecutable:true,approvalRequired:false,outputs:['mission graph','business slots','jobs','rewards hooks','Reel capture hooks']},
  {id:`${prefix}:lod`,stage:'mobile-lod',label:'Generate streaming cells + mobile LOD budgets',state:'blocked',dependencies:[`${prefix}:living`,`${prefix}:missions`],parallelGroup:8,autoExecutable:true,approvalRequired:false,outputs:['streaming cells','LOD manifest','mobile budgets','fallback geometry']},
  {id:`${prefix}:qa`,stage:'qa-certification',label:'Navigation, collision, provenance, accessibility and performance QA',state:'blocked',dependencies:[`${prefix}:lod`],parallelGroup:9,autoExecutable:false,approvalRequired:true,outputs:['QA evidence','known limitations','founder preview','certification decision']},
 ]
 return tasks
}

function buildPlan(target:WorldBuildTarget):QuantumWorldBuildPlan{
 const cloud=getOracleCloudStatus()
 return{
  schema:'tryamm.streetverse.quantum-world-builder.v1',
  id:`qwb-${slug(target.scale)}-${slug(target.id||target.label)}-${Date.now()}`,
  target,
  createdAt:new Date().toISOString(),
  quantumMeaning:'Software acceleration using parallel jobs, dependency graphs, caching, incremental rebuilds and automated verification; no claim of quantum-computer execution.',
  oracle:{
   profile:STREETVERSE_ORACLE_PROFILE.name,
   cloudReturnMode:cloud.mode,
   sourceRules:STREETVERSE_ORACLE_PROFILE.sourceRules,
   requirements:sourceRequirements(target),
  },
  cursorConstruct:{
   authority:'proposal-and-orchestration',
   productionMutation:false,
   approvalRequiredForPublish:true,
   responsibilities:[
    'turn verified source manifests into build tasks',
    'create dependency-aware execution order',
    'bind tasks to World Forger recipes and Construct targets',
    'generate code/asset patch proposals for a trusted build worker',
    'surface blockers, confidence and missing-source gaps',
    'route uncleared assets into Mind Over Matter clean-room replacements instead of copying or stalling',
   ],
  },
  worldForger:{
   pipeline:WORLD_FORGER_PIPELINE,
   responsibilities:[
    'CAD planning',
    'mesh and rig recipes',
    'PBR materials and lawful texture wrap',
    'collision/navigation',
    'interactions',
    'mobile LOD',
   ],
  },
  construct:{
   responsibilities:[
    'place verified assets into world coordinates',
    'route player and QA agents',
    'scan collisions/navigation',
    'attach mission/business/campus anchors',
    'show build progress and unresolved targets in the World Builder',
   ],
  },
  tasks:makeTasks(target),
  certificationGates:[
   'source rights/provenance recorded',
   'blocked/uncleared sources replaced with approved originals or clearly labeled conceptual equivalents',
   'no prohibited/private/sensitive source leakage',
   'navigation and collision pass',
   'mobile performance pass',
   'accessibility baseline pass',
   'living-world systems connected',
   'mission start/end/reward path works',
   'founder preview approves production label',
  ],
 }
}

function publish(state:State){
 persist(state)
 emit('tryamm:quantum-world-builder-state',{
  ...state,
  chicagoCompilerStages:CHICAGO_AREA_COMPILER_STAGES,
  worldForgerPipeline:WORLD_FORGER_PIPELINE,
 })
}

function createPlan(state:State,target:WorldBuildTarget){
 const plan=buildPlan(target)
 const next={activePlan:plan,history:[...state.history,plan].slice(-20)}
 publish(next)
 emit('tryamm:oracle-source-discovery-request',{
  planId:plan.id,
  target,
  requirements:plan.oracle.requirements,
  rules:plan.oracle.sourceRules,
  preferredSourceTypes:['official_feed','public_open_data','licensed_api','rss_atom'],
  htmlScraping:'last-resort-and-terms-controlled',
 })
 emit('tryamm:shared-world-context-query',{
  surface:'construct',
  mode:'propose-build',
  query:target.label,
  selectedId:target.id,
  city:target.scale==='chicago'||target.scale==='west'?'Chicago':undefined,
 })
 emit('tryamm:construct:targets',plan.tasks.map((task,index)=>({
  id:task.id,
  label:task.label,
  kind:'portal',
  x:index*4,
  z:index%2?8:-8,
  metadata:{worldBuild:true,stage:task.stage,state:task.state,target:target.label,approvalRequired:task.approvalRequired},
 })))
 return next
}

export function installStreetVerseQuantumWorldBuilderOrchestrator(){
 if(installed||typeof window==='undefined')return
 installed=true
 let state=readState()
 publish(state)

 const request=(event:Event)=>{
  const d=(event as CustomEvent<Partial<WorldBuildTarget>>).detail||{}
  if(!d.id||!d.label||!d.scale)return
  state=createPlan(state,d as WorldBuildTarget)
 }

 const fromWest=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.id||!d.label)return
  state=createPlan(state,{id:String(d.id),label:String(d.label),scale:'west',status:String(d.status||''),metadata:d})
 }
 const fromChicago=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.communityAreaNumber||!d.name)return
  state=createPlan(state,{id:`ca-${d.communityAreaNumber}`,label:String(d.name),scale:'chicago',communityAreaNumber:String(d.communityAreaNumber),status:String(d.status||'BUILDING'),metadata:d})
 }
 const fromIllinois=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.id||!d.label)return
  state=createPlan(state,{id:String(d.id),label:String(d.label),scale:'illinois',status:String(d.status||''),metadata:d})
 }
 const fromState=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.id||!d.label)return
  state=createPlan(state,{id:String(d.id),label:String(d.label),scale:'usa',stateId:String(d.id),status:String(d.status||''),metadata:d})
 }
 const fromWorld=(event:Event)=>{
  const d=(event as CustomEvent<any>).detail||{}
  if(!d.id||!d.name)return
  state=createPlan(state,{id:String(d.id),label:String(d.name),scale:'world',cityId:String(d.id),status:String(d.status||''),metadata:d})
 }
 const update=(event:Event)=>{
  const d=(event as CustomEvent<{taskId?:string;state?:WorldBuildTaskState}>).detail||{}
  if(!d.taskId||!d.state||!state.activePlan)return
  const nextState:WorldBuildTaskState=d.state
  const activePlan:QuantumWorldBuildPlan={...state.activePlan,tasks:state.activePlan.tasks.map(task=>task.id===d.taskId?{...task,state:nextState}:task)}
  state={...state,activePlan,history:state.history.map(plan=>plan.id===activePlan.id?activePlan:plan)}
  publish(state)
 }

 addEventListener('tryamm:quantum-world-builder-request',request)
 addEventListener('tryamm:quantum-world-builder-request-state',()=>publish(state))
 addEventListener('tryamm:streetverse-world-builder-focus',fromWest)
 addEventListener('tryamm:streetverse-community-slice-ready',fromChicago)
 addEventListener('tryamm:streetverse-illinois-build-focus',fromIllinois)
 addEventListener('tryamm:streetverse-state-build-focus',fromState)
 addEventListener('tryamm:streetverse-global-city-focus',fromWorld)
 addEventListener('tryamm:quantum-world-builder-task-update',update)
 emit('tryamm:quantum-world-builder-ready',{
  oracle:STREETVERSE_ORACLE_PROFILE.name,
  cursorConstruct:true,
  worldForger:true,
  construct:true,
  stages:11,
  mindOverMatterCleanRoom:true,
  productionMutation:false,
  publishRequiresApproval:true,
 })
}
