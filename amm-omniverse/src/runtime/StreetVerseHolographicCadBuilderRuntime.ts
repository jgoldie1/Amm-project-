import {
  cadPlanFromBuildingPassport,
  compileCadBuildingPlan,
  type CadBuildingInput,
  type HolographicCadBuildPlan,
} from './StreetVerseCadBimBridge'
import type {BuildingPassport} from '../game/runtime/holographicBuildingReconstruction'

let installed=false
let lastPlan:HolographicCadBuildPlan|undefined

const emit=(name:string,detail:unknown)=>{
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(name,{detail}))
}

function publishSystem(status:'loading'|'ready'|'degraded'|'blocked',reason?:string,evidence?:Record<string,unknown>){
  emit('tryamm:system-fabric-signal',{
    system:'streetverse-world',
    status,
    source:'holographic-cad-builder',
    reason,
    evidence,
  })
}

export function compileStreetVerseCadBuilding(input:CadBuildingInput){
  publishSystem('loading','Compiling authorized CAD/BIM sources into a game-ready architectural twin.',{buildingId:input.id})
  const plan=compileCadBuildingPlan(input)
  lastPlan=plan

  if(plan.blockedReasons.length){
    publishSystem('blocked','CAD/BIM building plan is blocked by source or geometry validation.',{
      buildingId:plan.id,
      blockedReasons:plan.blockedReasons,
      warnings:plan.warnings,
    })
    emit('tryamm:cad-building-blocked',plan)
    return plan
  }

  publishSystem(plan.warnings.length?'degraded':'ready',plan.warnings.length?'CAD/BIM building compiled with review warnings.':undefined,{
    buildingId:plan.id,
    passportId:plan.passportId,
    levelCount:plan.geometry.levelCount,
    construction:plan.construction,
    outputs:plan.geometry.outputs,
  })

  emit('tryamm:cad-building-ready',plan)
  emit('tryamm:construct:targets',[{
    id:plan.id,
    label:plan.name,
    kind:'unknown',
    x:0,
    z:0,
    metadata:{
      source:'holographic-cad-builder',
      passportId:plan.passportId,
      levelCount:plan.geometry.levelCount,
      photorealWrap:plan.photorealWrap.enabled,
      stairs:plan.construction.stairs,
      elevators:plan.construction.elevators,
      plumbing:plan.construction.plumbing,
    },
  }])
  return plan
}

export function compileStreetVerseBuildingPassport(passport:BuildingPassport){
  return compileStreetVerseCadBuilding(cadPlanFromBuildingPassport(passport))
}

export function getLastCadBuildingPlan(){
  return lastPlan?structuredClone(lastPlan):undefined
}

export function installStreetVerseHolographicCadBuilder(){
  if(installed||typeof window==='undefined')return()=>{}
  installed=true

  const onCompile=(event:Event)=>{
    const input=(event as CustomEvent<CadBuildingInput>).detail
    if(input)compileStreetVerseCadBuilding(input)
  }
  const onPassport=(event:Event)=>{
    const passport=(event as CustomEvent<BuildingPassport>).detail
    if(passport)compileStreetVerseBuildingPassport(passport)
  }
  const onQuery=()=>{
    if(lastPlan)emit('tryamm:cad-building-ready',lastPlan)
  }

  window.addEventListener('tryamm:cad-building-compile',onCompile)
  window.addEventListener('tryamm:cad-building-from-passport',onPassport)
  window.addEventListener('tryamm:cad-building-query',onQuery)

  ;(window as Window&{__tryammCadBuilder?:unknown}).__tryammCadBuilder={
    compile:compileStreetVerseCadBuilding,
    compilePassport:compileStreetVerseBuildingPassport,
    last:getLastCadBuildingPlan,
  }

  emit('tryamm:cad-builder-ready',{
    schema:'tryamm.holographic-cad-building.v1',
    capabilities:[
      'cad-dwg-reference',
      'cad-dxf-reference',
      'bim-ifc-reference',
      'floor-plan-svg',
      'point-cloud',
      'game-glb-output-plan',
      'stairs',
      'elevators',
      'ramps',
      'plumbing-schematic',
      'electrical-schematic',
      'hvac-schematic',
      'collision',
      'navmesh',
      'accessibility-routes',
      'photoreal-facade-wrap-with-rights-gate',
      'lod-streaming',
    ],
  })

  return()=>{
    window.removeEventListener('tryamm:cad-building-compile',onCompile)
    window.removeEventListener('tryamm:cad-building-from-passport',onPassport)
    window.removeEventListener('tryamm:cad-building-query',onQuery)
    delete (window as Window&{__tryammCadBuilder?:unknown}).__tryammCadBuilder
    installed=false
  }
}
