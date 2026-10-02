import {cloneWorldForgePreset,createStreetVerseWorldForgePlan,type WorldForgePlan,type WorldForgeRequest} from './StreetVerseChicagoWorldForge'

let installed=false
let lastPlan:WorldForgePlan|null=null

function emit(name:string,detail:unknown){
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

export function getStreetVerseWorldForgePlan(){return lastPlan?structuredClone(lastPlan):null}

export function proposeStreetVerseWorldForge(request:WorldForgeRequest){
  const plan=createStreetVerseWorldForgePlan(request)
  lastPlan=plan
  emit('tryamm:streetverse-world-forge-plan',{plan,productionMutation:false,providerGenerationStarted:false})
  emit('tryamm:system-fabric-signal',{system:'streetverse-world',status:'loading',source:'streetverse-world-forge',reason:`World Forge plan created for ${request.label}`,evidence:{planId:request.id}})
  emit('tryamm:shared-world-context-query',{surface:'construct',query:request.label,selectedId:request.chicagoZoneId,city:'Chicago',mode:'propose-build'})
  emit('tryamm:construct:targets',[{
    id:`forge:${request.id}`,
    label:request.label,
    kind:'mission',
    x:plan.target.x??0,
    z:plan.target.z??0,
    metadata:{worldForge:true,targetKind:request.targetKind,grid:plan.target.grid||''},
  }])
  return structuredClone(plan)
}

export function proposeWestSidePreset(id:string){
  return proposeStreetVerseWorldForge(cloneWorldForgePreset(id))
}

export function requestWorldForgeProviderTasks(){
  if(!lastPlan)return null
  const detail={
    plan:lastPlan,
    approvalRequired:lastPlan.providerTasks.approvalRequired,
    automaticProviderCharge:false,
    automaticProductionMutation:false,
    meshyTasks:lastPlan.providerTasks.meshy,
    cursorConstructTasks:lastPlan.providerTasks.cursorConstruct,
  }
  emit('tryamm:streetverse-world-forge-provider-proposal',detail)
  return detail
}

export function markWorldForgeEvidence(stage:string,passed:boolean,evidence:Record<string,unknown>={}){
  if(!lastPlan)return null
  emit('tryamm:streetverse-world-forge-evidence',{planId:lastPlan.request.id,stage,passed,evidence,at:new Date().toISOString()})
  if(!passed){
    emit('tryamm:system-fabric-signal',{system:'streetverse-world',status:'degraded',source:'streetverse-world-forge',reason:`World Forge stage failed: ${stage}`,evidence})
    emit('tryamm:streetverse-runtime-error',{stage:'world',reason:`World Forge stage failed: ${stage}`,source:'streetverse-world-forge',fatal:false,evidence})
  }
  return{stage,passed,evidence}
}

export function installStreetVerseWorldForgeRuntime(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true

  const onPreset=(event:Event)=>{
    const detail=(event as CustomEvent<{id?:string}>).detail||{}
    proposeWestSidePreset(String(detail.id||'circle-park-complete'))
  }
  const onRequest=(event:Event)=>{
    const detail=(event as CustomEvent<WorldForgeRequest>).detail
    if(detail?.id&&detail?.label)proposeStreetVerseWorldForge(detail)
  }
  const onProvider=()=>{requestWorldForgeProviderTasks()}
  const onQuery=()=>{if(lastPlan)emit('tryamm:streetverse-world-forge-plan',{plan:lastPlan,productionMutation:false,providerGenerationStarted:false})}

  window.addEventListener('tryamm:streetverse-world-forge-preset',onPreset)
  window.addEventListener('tryamm:streetverse-world-forge-request',onRequest)
  window.addEventListener('tryamm:streetverse-world-forge-provider-proposal-request',onProvider)
  window.addEventListener('tryamm:streetverse-world-forge-query',onQuery)

  ;(window as Window&{__tryammWorldForge?:unknown}).__tryammWorldForge={
    preset:proposeWestSidePreset,
    propose:proposeStreetVerseWorldForge,
    providerProposal:requestWorldForgeProviderTasks,
    plan:getStreetVerseWorldForgePlan,
    evidence:markWorldForgeEvidence,
  }

  emit('tryamm:streetverse-world-forge-ready',{
    city:'Chicago',
    presets:['circle-park-complete','thomas-jefferson-school-complete','roosevelt-road-corridor','taylor-street-corridor','near-west-neighborhood','pilsen-neighborhood'],
    cad:true,
    interiors:true,
    stairs:true,
    elevator:true,
    plumbing:true,
    electrical:true,
    hvac:true,
    photorealWrap:true,
    providerGenerationAutomatic:false,
    productionMutationAutomatic:false,
  })

  return()=>{
    window.removeEventListener('tryamm:streetverse-world-forge-preset',onPreset)
    window.removeEventListener('tryamm:streetverse-world-forge-request',onRequest)
    window.removeEventListener('tryamm:streetverse-world-forge-provider-proposal-request',onProvider)
    window.removeEventListener('tryamm:streetverse-world-forge-query',onQuery)
    delete (window as Window&{__tryammWorldForge?:unknown}).__tryammWorldForge
    installed=false
  }
}
