import {buildCADHoloBuildPlan,type CADBuildPlan,type CADBuildRequest} from './StreetVerseCADHoloBuildPipeline'
import {westSideBuildRequest,westSideBuildWave,type WestSideBuildZoneId} from '../data/StreetVerseWestSideBuildRegistry'

export type CADBuildRuntimeState={
  schema:'tryamm.cad-holobuild.runtime.v1'
  active?:CADBuildPlan
  history:{id:string;name:string;executionReady:boolean;warnings:string[];at:string}[]
  productionMutation:false
  founderApprovalRequired:true
  updatedAt:string
}

let installed=false
let state:CADBuildRuntimeState={
  schema:'tryamm.cad-holobuild.runtime.v1',
  history:[],
  productionMutation:false,
  founderApprovalRequired:true,
  updatedAt:new Date().toISOString(),
}

const emit=(name:string,detail:unknown)=>{
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}
const copy=()=>({...state,history:state.history.map(item=>({...item})),active:state.active?{...state.active}:undefined})
const now=()=>new Date().toISOString()

function forgePayload(plan:CADBuildPlan){
  const refs=plan.request.sources.filter(source=>source.authorized).map(source=>source.uri)
  return{
    source:'cad-holobuild-runtime',
    planId:plan.id,
    name:plan.request.name,
    kind:'building',
    target:plan.request.target,
    prompt:[
      `Build ${plan.request.name} as a StreetVerse gameplay building/world cell.`,
      'Use the approved CAD structure as geometry authority.',
      'Generate/refine mesh, UVs and PBR materials.',
      'Wrap only imagery explicitly cleared for persistent texture use.',
      'Preserve doors, windows, stairs, elevators, utilities, collision, navmesh, accessibility and gameplay anchors.',
      'Create LOD/mobile fallbacks and package as GLB + manifest.',
    ].join(' '),
    references:refs,
    rightsConfirmed:refs.length>0,
    gameplayRole:'interactive StreetVerse environment / missions / emergency / creator gameplay',
    budget:plan.optimization,
    productionMutation:false,
    requiresFounderApproval:true,
  }
}

function publish(){
  state={...state,updatedAt:now()}
  try{sessionStorage.setItem('tryamm.cad-holobuild.runtime.v1',JSON.stringify(state))}catch{}
  emit('tryamm:cad-holobuild-state',copy())
}

export function proposeCADHoloBuild(request:CADBuildRequest){
  const plan=buildCADHoloBuildPlan(request)
  state={
    ...state,
    active:plan,
    history:[{id:plan.id,name:plan.request.name,executionReady:plan.executionReady,warnings:[...plan.warnings],at:now()},...state.history].slice(0,40),
  }
  emit('tryamm:shared-world-context-query',{
    surface:'cursor',
    query:request.name,
    selectedId:request.id,
    city:request.city,
    mode:'propose-build',
  })
  emit('tryamm:construct:build-proposal',{
    planId:plan.id,
    name:request.name,
    cad:plan.cad,
    stages:plan.stages,
    productionMutation:false,
    requiresApproval:true,
  })
  emit('tryamm:holo-forge-build-request',forgePayload(plan))
  emit('tryamm:streetverse-cad-build-plan',plan)
  emit('tryamm:system-fabric-signal',{
    system:'streetverse-world',
    status:plan.executionReady?'ready':'degraded',
    source:'cad-holobuild-runtime',
    reason:plan.executionReady?undefined:'CAD/HoloBuild proposal has blocked stages; source truth/review is required before exact reconstruction.',
    evidence:{planId:plan.id,name:request.name,executionReady:plan.executionReady,warnings:plan.warnings},
  })
  publish()
  return plan
}

export function proposeWestSideZone(zoneId:WestSideBuildZoneId){
  return proposeCADHoloBuild({...westSideBuildRequest(zoneId),requestedBy:'cursor'})
}

export function proposeWestSideWave(priority:1|2|3=1){
  const plans=westSideBuildWave(priority).map(request=>proposeCADHoloBuild({...request,requestedBy:'construct'}))
  emit('tryamm:west-side-cad-build-wave',{
    priority,
    count:plans.length,
    plans:plans.map(plan=>({id:plan.id,name:plan.request.name,executionReady:plan.executionReady,warnings:plan.warnings})),
    productionMutation:false,
    requiresFounderApproval:true,
  })
  return plans
}

export function getCADHoloBuildState(){return copy()}

export function installStreetVerseCADHoloBuildRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true

  const onCursor=(event:Event)=>{
    const detail=(event as CustomEvent<{zoneId?:WestSideBuildZoneId;request?:CADBuildRequest}>).detail||{}
    if(detail.request)proposeCADHoloBuild({...detail.request,requestedBy:'cursor'})
    else if(detail.zoneId)proposeWestSideZone(detail.zoneId)
  }
  const onBuild=(event:Event)=>{
    const detail=(event as CustomEvent<{request?:CADBuildRequest}>).detail||{}
    if(detail.request)proposeCADHoloBuild(detail.request)
  }
  const onWave=(event:Event)=>{
    const detail=(event as CustomEvent<{priority?:1|2|3}>).detail||{}
    proposeWestSideWave(detail.priority||1)
  }
  const onQuery=()=>publish()

  window.addEventListener('tryamm:cursor-cad-build-request',onCursor)
  window.addEventListener('tryamm:holographic-building-build-request',onBuild)
  window.addEventListener('tryamm:west-side-build-wave-request',onWave)
  window.addEventListener('tryamm:cad-holobuild-query',onQuery)

  ;(window as Window&{
    __tryammCADHoloBuild?:{
      state:()=>CADBuildRuntimeState
      westSide:(zoneId:WestSideBuildZoneId)=>CADBuildPlan
      wave:(priority?:1|2|3)=>CADBuildPlan[]
    }
    __showCADHoloBuild?:()=>void
  }).__tryammCADHoloBuild={
    state:getCADHoloBuildState,
    westSide:proposeWestSideZone,
    wave:proposeWestSideWave,
  }

  ;(window as Window&{__showCADHoloBuild?:()=>void}).__showCADHoloBuild=()=>{
    emit('tryamm:west-side-build-wave-request',{priority:1,source:'hologpt-command'})
    emit('tryamm:hologpt-study-context',{detail:{prompt:[
      'TRYAMM CAD / HOLOBUILD is online.',
      'Priority 1 West Side build wave includes Circle Park, Thomas Jefferson gameplay school, and Roosevelt/Taylor gameplay corridor.',
      'Pipeline: source truth → CAD structure → interiors/stairs/elevator/utilities → mesh → authorized PBR wrap → building rigs → collision/navmesh → LOD/mobile → HoloForge package → gameplay bindings → Game Ops QA.',
      'Google Street View is reference/navigation only; do not scrape/persist Street View pixels as game textures.',
      'Explain the active build plan and the first blocked stage. Do not claim exact photoreal reconstruction unless source truth and texture rights are verified.',
    ].join('\n')}})
  }

  emit('tryamm:cad-holobuild-ready',{
    pipeline:'CAD → HoloBuild → Mesh → Wrap → Rig → Game',
    cursor:true,bennyConstruct:true,holoForge:true,meshy:true,gameOps:true,systemFabric:true,
    productionMutation:false,founderApprovalRequired:true,
  })
  publish()

  return()=>{
    window.removeEventListener('tryamm:cursor-cad-build-request',onCursor)
    window.removeEventListener('tryamm:holographic-building-build-request',onBuild)
    window.removeEventListener('tryamm:west-side-build-wave-request',onWave)
    window.removeEventListener('tryamm:cad-holobuild-query',onQuery)
    delete (window as Window&{__tryammCADHoloBuild?:unknown}).__tryammCADHoloBuild
    delete (window as Window&{__showCADHoloBuild?:unknown}).__showCADHoloBuild
    installed=false
  }
}
