import type {BuildingPassport} from '../game/runtime/holographicBuildingReconstruction'

export type CadSourceFormat='dwg'|'dxf'|'ifc'|'svg-floorplan'|'glb'|'point-cloud'|'manual-measurement'
export type CadSourceRole='geometry'|'floor-plan'|'structure'|'mep'|'facade-reference'|'navigation-reference'
export type CadSourceRights='open-data'|'licensed'|'owner-authorized'|'resident-authorized'|'tryamm-created'|'reference-only'

export interface CadBimSource{
  id:string
  format:CadSourceFormat
  role:CadSourceRole
  uri?:string
  rights:CadSourceRights
  authorized:boolean
  scaleToMeters:number
  coordinateSystem?:string
  notes?:string
}

export interface CadLevelPlan{
  id:string
  label:string
  elevationM:number
  heightM:number
  floorPlateAreaM2?:number
  roomIds:string[]
}

export interface CadVerticalSystem{
  id:string
  kind:'stairs'|'elevator'|'ramp'
  levelIds:string[]
  accessible:boolean
  generatedWhenApplicable:boolean
}

export interface CadUtilitySystem{
  id:string
  kind:'cold-water'|'hot-water'|'sanitary-drain'|'storm-drain'|'electrical'|'hvac'|'fire-sprinkler'
  levelIds:string[]
  schematicOnly:boolean
}

export interface CadFacadeWrap{
  id:string
  side:'north'|'south'|'east'|'west'|'roof'
  sourceId:string
  use:'alignment-reference'|'persistent-material'
  photorealisticTarget:boolean
}

export interface CadBuildingInput{
  id:string
  passportId:string
  name:string
  city:string
  sources:CadBimSource[]
  levels:CadLevelPlan[]
  verticalSystems:CadVerticalSystem[]
  utilities:CadUtilitySystem[]
  facadeWraps:CadFacadeWrap[]
  requestedOutputs:Array<'game-glb'|'collision'|'navmesh'|'floorplan-svg'|'ifc-json'|'lod-pack'>
}

export interface HolographicCadBuildPlan{
  schema:'tryamm.holographic-cad-building.v1'
  id:string
  passportId:string
  name:string
  city:string
  geometry:{
    sourceIds:string[]
    levelCount:number
    normalizeToMeters:true
    outputs:CadBuildingInput['requestedOutputs']
  }
  construction:{
    structure:true
    floors:true
    rooms:true
    doorsAndWindows:true
    stairs:boolean
    elevators:boolean
    ramps:boolean
    plumbing:boolean
    electrical:boolean
    hvac:boolean
    fireProtection:boolean
  }
  photorealWrap:{
    enabled:boolean
    persistentMaterialSourceIds:string[]
    referenceOnlySourceIds:string[]
    rule:string
  }
  gameRuntime:{
    collisions:true
    navmesh:true
    accessibilityRoutes:true
    lodStreaming:true
    interactableDoors:true
    interactableElevators:boolean
    interactablePlumbing:boolean
  }
  warnings:string[]
  blockedReasons:string[]
  readyForFounderPreview:boolean
  createdAt:string
}

const PERSISTENT_RIGHTS=new Set<CadSourceRights>(['open-data','licensed','owner-authorized','resident-authorized','tryamm-created'])

export function validateCadBimInput(input:CadBuildingInput){
  const errors:string[]=[]
  if(!input.id.trim())errors.push('cad-building-id-required')
  if(!input.passportId.trim())errors.push('building-passport-id-required')
  if(!input.name.trim())errors.push('building-name-required')
  if(!input.city.trim())errors.push('building-city-required')
  if(input.sources.length===0)errors.push('at-least-one-source-required')
  if(!input.sources.some(source=>source.authorized))errors.push('authorized-source-required')
  if(input.levels.length===0)errors.push('at-least-one-level-required')
  for(const source of input.sources){
    if(!Number.isFinite(source.scaleToMeters)||source.scaleToMeters<=0)errors.push(`invalid-scale:${source.id}`)
  }
  const knownLevels=new Set(input.levels.map(level=>level.id))
  for(const system of input.verticalSystems){
    if(system.levelIds.some(id=>!knownLevels.has(id)))errors.push(`vertical-system-level-missing:${system.id}`)
  }
  for(const utility of input.utilities){
    if(utility.levelIds.some(id=>!knownLevels.has(id)))errors.push(`utility-level-missing:${utility.id}`)
  }
  return errors
}

export function compileCadBuildingPlan(input:CadBuildingInput):HolographicCadBuildPlan{
  const blockedReasons=validateCadBimInput(input)
  const sourceById=new Map(input.sources.map(source=>[source.id,source]))
  const persistentMaterialSourceIds:string[]=[]
  const referenceOnlySourceIds:string[]=[]
  const warnings:string[]=[]

  for(const wrap of input.facadeWraps){
    const source=sourceById.get(wrap.sourceId)
    if(!source){
      warnings.push(`facade-source-missing:${wrap.id}`)
      continue
    }
    if(wrap.use==='persistent-material'){
      if(source.authorized&&PERSISTENT_RIGHTS.has(source.rights))persistentMaterialSourceIds.push(source.id)
      else{
        warnings.push(`facade-material-not-persistable:${source.id}`)
        referenceOnlySourceIds.push(source.id)
      }
    }else referenceOnlySourceIds.push(source.id)
  }

  const stairs=input.verticalSystems.some(system=>system.kind==='stairs')
  const elevators=input.verticalSystems.some(system=>system.kind==='elevator')
  const ramps=input.verticalSystems.some(system=>system.kind==='ramp')
  const plumbing=input.utilities.some(system=>['cold-water','hot-water','sanitary-drain','storm-drain'].includes(system.kind))
  const electrical=input.utilities.some(system=>system.kind==='electrical')
  const hvac=input.utilities.some(system=>system.kind==='hvac')
  const fireProtection=input.utilities.some(system=>system.kind==='fire-sprinkler')

  if(input.levels.length>1&&!stairs&&!elevators&&!ramps)warnings.push('multi-level-building-needs-vertical-circulation-review')
  if(elevators&&!input.verticalSystems.some(system=>system.kind==='elevator'&&system.accessible))warnings.push('elevator-accessibility-review-required')
  if(plumbing&&input.utilities.some(system=>['cold-water','hot-water','sanitary-drain','storm-drain'].includes(system.kind)&&!system.schematicOnly)){
    warnings.push('publish-only-schematic-utility-layouts')
  }

  return{
    schema:'tryamm.holographic-cad-building.v1',
    id:input.id,
    passportId:input.passportId,
    name:input.name,
    city:input.city,
    geometry:{
      sourceIds:input.sources.filter(source=>source.authorized).map(source=>source.id),
      levelCount:input.levels.length,
      normalizeToMeters:true,
      outputs:input.requestedOutputs,
    },
    construction:{
      structure:true,
      floors:true,
      rooms:true,
      doorsAndWindows:true,
      stairs,
      elevators,
      ramps,
      plumbing,
      electrical,
      hvac,
      fireProtection,
    },
    photorealWrap:{
      enabled:persistentMaterialSourceIds.length>0||referenceOnlySourceIds.length>0,
      persistentMaterialSourceIds:Array.from(new Set(persistentMaterialSourceIds)),
      referenceOnlySourceIds:Array.from(new Set(referenceOnlySourceIds)),
      rule:'Reference-only imagery may guide alignment and facade proportions but is not baked into persistent game textures. Persistent facade materials require an authorized/licensed/open/TRYAMM-created source.',
    },
    gameRuntime:{
      collisions:true,
      navmesh:true,
      accessibilityRoutes:true,
      lodStreaming:true,
      interactableDoors:true,
      interactableElevators:elevators,
      interactablePlumbing:plumbing,
    },
    warnings,
    blockedReasons,
    readyForFounderPreview:blockedReasons.length===0,
    createdAt:new Date().toISOString(),
  }
}

export function cadPlanFromBuildingPassport(passport:BuildingPassport):CadBuildingInput{
  const sources:CadBimSource[]=passport.sourceProvenance.map(source=>({
    id:source.id,
    format:source.kind==='cad-dwg'?'dwg':
      source.kind==='cad-dxf'?'dxf':
      source.kind==='bim-ifc'?'ifc':
      source.kind==='floor-plan-svg'?'svg-floorplan':
      source.kind==='point-cloud'?'point-cloud':
      source.kind==='mesh-glb'?'glb':
      source.kind==='measurement'?'manual-measurement':
      'glb',
    role:source.kind==='front-photo'||source.kind==='rear-photo'||source.kind==='left-photo'||source.kind==='right-photo'||source.kind==='aerial-reference'?'facade-reference':
      source.kind==='floor-plan'||source.kind==='floor-plan-svg'?'floor-plan':
      source.kind==='bim-ifc'?'structure':
      'geometry',
    uri:source.uri,
    rights:source.authorized?'owner-authorized':'reference-only',
    authorized:source.authorized,
    scaleToMeters:1,
    notes:source.notes,
  }))

  const verticalSystems:CadVerticalSystem[]=passport.behaviors.filter(node=>['stairs','elevator'].includes(node.kind)).map(node=>({
    id:node.id,
    kind:node.kind as 'stairs'|'elevator',
    levelIds:node.levelId?[node.levelId]:passport.levels.map(level=>level.id),
    accessible:Boolean(node.accessibility?.wheelchairReachable),
    generatedWhenApplicable:true,
  }))

  const utilities:CadUtilitySystem[]=passport.behaviors.filter(node=>['toilet','sink','shower','hvac'].includes(node.kind)).map(node=>({
    id:`utility-${node.id}`,
    kind:node.kind==='hvac'?'hvac':'sanitary-drain',
    levelIds:node.levelId?[node.levelId]:passport.levels.map(level=>level.id),
    schematicOnly:true,
  }))

  return{
    id:`cad-${passport.id}`,
    passportId:passport.id,
    name:passport.name,
    city:passport.city,
    sources,
    levels:passport.levels.map(level=>({...level})),
    verticalSystems,
    utilities,
    facadeWraps:sources.filter(source=>source.role==='facade-reference').map((source,index)=>({
      id:`facade-${source.id}`,
      side:(['north','south','east','west'] as const)[index%4],
      sourceId:source.id,
      use:source.rights==='reference-only'?'alignment-reference':'persistent-material',
      photorealisticTarget:true,
    })),
    requestedOutputs:['game-glb','collision','navmesh','floorplan-svg','ifc-json','lod-pack'],
  }
}
