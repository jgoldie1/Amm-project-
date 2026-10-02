import type {BuildingPassport,BuildingBehaviorNode,BuildingSource} from '../game/runtime/holographicBuildingReconstruction'

export type CADUnit='m'
export type CADPrimitiveKind=
  |'foundation'
  |'floor-slab'
  |'wall'
  |'roof'
  |'door-opening'
  |'window-opening'
  |'stair'
  |'elevator-shaft'
  |'plumbing-run'
  |'drain-run'
  |'electrical-run'
  |'hvac-run'
  |'collision'
  |'navmesh-zone'

export type CADPrimitive={
  id:string
  kind:CADPrimitiveKind
  levelId?:string
  roomId?:string
  dimensionsM?:{x:number;y:number;z:number}
  positionM?:{x:number;y:number;z:number}
  rotationDeg?:{x:number;y:number;z:number}
  metadata?:Record<string,string|number|boolean>
}

export type FacadeWrapSource={
  sourceId:string
  uri:string
  side:'front'|'rear'|'left'|'right'|'roof'|'interior'
  authorized:boolean
  persistentTextureAllowed:boolean
  provenance:'licensed'|'owner-authorized'|'resident-authorized'|'tryamm-created'|'open-data'|'reference-only'
}

export type CADBuildRequest={
  id:string
  name:string
  city:string
  district:string
  passport?:BuildingPassport
  sources:BuildingSource[]
  facadeWraps?:FacadeWrapSource[]
  target:'streetverse'|'streetverse-global'
  fidelity:'mobile'|'balanced'|'cinematic'
  includeInteriors:boolean
  includeUtilities:boolean
  includeInteractiveRigging:boolean
  requestedBy:'founder'|'cursor'|'benny'|'hologpt'|'construct'|'system'
}

export type CADBuildStage=
  |'SOURCE_TRUTH'
  |'CAD_FOOTPRINT'
  |'CAD_STRUCTURE'
  |'CAD_INTERIORS'
  |'CAD_STAIRS_ELEVATORS'
  |'CAD_UTILITIES'
  |'MESH_GENERATION'
  |'AUTHORIZED_TEXTURE_WRAP'
  |'INTERACTIVE_RIGGING'
  |'COLLISION_NAVMESH'
  |'LOD_MOBILE_OPTIMIZATION'
  |'HOLOFORGE_PACKAGE'
  |'GAMEPLAY_BINDINGS'
  |'GAME_OPS_QA'
  |'FOUNDER_PREVIEW'

export type CADBuildPlan={
  schema:'tryamm.cad-holobuild.v1'
  id:string
  request:CADBuildRequest
  units:CADUnit
  stages:{id:CADBuildStage;state:'ready'|'blocked'|'skipped';reason?:string}[]
  cad:CADPrimitive[]
  sourcePolicy:{
    googleStreetView:'reference-navigation-only'
    persistentTextureSources:string[]
    blockedTextureSources:string[]
  }
  mesh:{
    format:'glb'
    geometrySource:'cad-solids+meshy+holographic-reconstruction'
    characterRiggingSeparate:true
    buildingRigging:['doors','windows','stairs','elevators','lights','plumbing-fixtures','appliances']
  }
  materials:{
    pbr:true
    photorealisticWrap:'authorized-sources-only'
    channels:['baseColor','normal','roughness','metalness','ao','emissive']
  }
  gameplay:{
    collision:true
    navmesh:true
    accessibility:true
    missionBindings:true
    emergencyBindings:true
    dayNightBindings:true
  }
  optimization:{
    lodLevels:number
    textureMaxPx:number
    triangleBudget:number
    streamingCells:true
    mobileFallback:true
  }
  warnings:string[]
  executionReady:boolean
}

const FIDELITY={
  mobile:{lodLevels:2,textureMaxPx:1024,triangleBudget:45000},
  balanced:{lodLevels:3,textureMaxPx:2048,triangleBudget:140000},
  cinematic:{lodLevels:3,textureMaxPx:4096,triangleBudget:500000},
} as const

const stage=(id:CADBuildStage,state:'ready'|'blocked'|'skipped',reason?:string)=>({id,state,reason})

function authorizedSources(sources:BuildingSource[]){
  return sources.filter(source=>source.authorized)
}

function behaviorPrimitives(behaviors:BuildingBehaviorNode[]):CADPrimitive[]{
  return behaviors.flatMap((node,index)=>{
    const common={levelId:node.levelId,roomId:node.roomId,metadata:{interactive:node.interactive,sourceBehavior:node.kind}}
    if(node.kind==='stairs')return[{id:`cad-stair-${node.id}`,kind:'stair' as const,...common}]
    if(node.kind==='elevator')return[{id:`cad-elevator-${node.id}`,kind:'elevator-shaft' as const,...common}]
    if(node.kind==='toilet'||node.kind==='sink'||node.kind==='shower')return[
      {id:`cad-water-${node.id}-${index}`,kind:'plumbing-run' as const,...common},
      {id:`cad-drain-${node.id}-${index}`,kind:'drain-run' as const,...common},
    ]
    if(node.kind==='hvac')return[{id:`cad-hvac-${node.id}`,kind:'hvac-run' as const,...common}]
    if(node.kind==='light'||node.kind==='television'||node.kind==='speaker'||node.kind==='appliance')return[{id:`cad-power-${node.id}`,kind:'electrical-run' as const,...common}]
    if(node.kind==='door')return[{id:`cad-door-${node.id}`,kind:'door-opening' as const,...common}]
    if(node.kind==='window')return[{id:`cad-window-${node.id}`,kind:'window-opening' as const,...common}]
    return[]
  })
}

function levelPrimitives(passport:BuildingPassport):CADPrimitive[]{
  return passport.levels.flatMap(level=>[
    {id:`cad-slab-${level.id}`,kind:'floor-slab' as const,levelId:level.id,positionM:{x:0,y:level.elevationM,z:0},metadata:{heightM:level.heightM}},
    {id:`cad-wall-shell-${level.id}`,kind:'wall' as const,levelId:level.id,positionM:{x:0,y:level.elevationM+level.heightM/2,z:0},metadata:{generatedShell:true,heightM:level.heightM}},
  ])
}

function wrapPolicy(wraps:FacadeWrapSource[]){
  const persistent=wraps.filter(item=>item.authorized&&item.persistentTextureAllowed&&item.provenance!=='reference-only')
  const blocked=wraps.filter(item=>!persistent.includes(item))
  return{
    persistentTextureSources:persistent.map(item=>item.sourceId),
    blockedTextureSources:blocked.map(item=>item.sourceId),
  }
}

export function buildCADHoloBuildPlan(request:CADBuildRequest):CADBuildPlan{
  const passport=request.passport
  const authorized=authorizedSources(request.sources)
  const wraps=request.facadeWraps||[]
  const policy=wrapPolicy(wraps)
  const warnings:string[]=[]
  if(!authorized.length)warnings.push('No authorized reconstruction source is attached.')
  if(wraps.length&&!policy.persistentTextureSources.length)warnings.push('Facade references exist, but none are cleared for persistent texture use.')
  if(!passport)warnings.push('No Building Passport supplied; CAD structure must stay proposal-only until dimensions/levels are reviewed.')

  const cad:CADPrimitive[]=[
    {id:`cad-foundation-${request.id}`,kind:'foundation',metadata:{proposalOnly:!passport}},
    ...(passport?levelPrimitives(passport):[]),
    ...(passport?behaviorPrimitives(passport.behaviors):[]),
  ]
  if(passport){
    cad.push({id:`cad-collision-${request.id}`,kind:'collision',metadata:{derivedFrom:'structural-envelope'}})
    cad.push({id:`cad-navmesh-${request.id}`,kind:'navmesh-zone',metadata:{accessibilityRoutes:passport.safety.accessibleRouteNodeIds.length}})
  }

  const sourceReady=authorized.length>0
  const structureReady=Boolean(passport&&passport.levels.length)
  const textureReady=wraps.length===0||policy.persistentTextureSources.length>0
  const utilityNodes=passport?.behaviors.some(node=>['toilet','sink','shower','hvac','light','appliance'].includes(node.kind))||false
  const rigNodes=passport?.behaviors.some(node=>['door','window','stairs','elevator','light','toilet','sink','shower','appliance'].includes(node.kind))||false

  const stages=[
    stage('SOURCE_TRUTH',sourceReady?'ready':'blocked',sourceReady?undefined:'Attach at least one authorized source.'),
    stage('CAD_FOOTPRINT',structureReady?'ready':'blocked',structureReady?undefined:'Building Passport levels/geometry review required.'),
    stage('CAD_STRUCTURE',structureReady?'ready':'blocked'),
    stage('CAD_INTERIORS',request.includeInteriors?(structureReady?'ready':'blocked'):'skipped'),
    stage('CAD_STAIRS_ELEVATORS',request.includeInteriors?(structureReady?'ready':'blocked'):'skipped'),
    stage('CAD_UTILITIES',request.includeUtilities?(utilityNodes?'ready':'blocked'):'skipped',request.includeUtilities&&!utilityNodes?'Utility behavior nodes/engineering references required.':undefined),
    stage('MESH_GENERATION',structureReady?'ready':'blocked'),
    stage('AUTHORIZED_TEXTURE_WRAP',textureReady?'ready':'blocked',textureReady?undefined:'Use TRYAMM-created, licensed, owner-authorized, resident-authorized, or compatible open-data imagery.'),
    stage('INTERACTIVE_RIGGING',request.includeInteractiveRigging?(rigNodes?'ready':'blocked'):'skipped',request.includeInteractiveRigging&&!rigNodes?'Add behavior nodes for doors/windows/stairs/elevator/fixtures.':undefined),
    stage('COLLISION_NAVMESH',structureReady?'ready':'blocked'),
    stage('LOD_MOBILE_OPTIMIZATION',structureReady?'ready':'blocked'),
    stage('HOLOFORGE_PACKAGE',structureReady&&sourceReady?'ready':'blocked'),
    stage('GAMEPLAY_BINDINGS',structureReady?'ready':'blocked'),
    stage('GAME_OPS_QA',structureReady?'ready':'blocked'),
    stage('FOUNDER_PREVIEW',structureReady&&sourceReady?'ready':'blocked'),
  ] as CADBuildPlan['stages']

  const executionReady=stages.every(item=>item.state!=='blocked')
  const budget=FIDELITY[request.fidelity]
  return{
    schema:'tryamm.cad-holobuild.v1',
    id:`cad-holobuild-${request.id}`,
    request,units:'m',stages,cad,
    sourcePolicy:{
      googleStreetView:'reference-navigation-only',
      persistentTextureSources:policy.persistentTextureSources,
      blockedTextureSources:policy.blockedTextureSources,
    },
    mesh:{
      format:'glb',
      geometrySource:'cad-solids+meshy+holographic-reconstruction',
      characterRiggingSeparate:true,
      buildingRigging:['doors','windows','stairs','elevators','lights','plumbing-fixtures','appliances'],
    },
    materials:{
      pbr:true,
      photorealisticWrap:'authorized-sources-only',
      channels:['baseColor','normal','roughness','metalness','ao','emissive'],
    },
    gameplay:{
      collision:true,navmesh:true,accessibility:true,missionBindings:true,emergencyBindings:true,dayNightBindings:true,
    },
    optimization:{...budget,streamingCells:true,mobileFallback:true},
    warnings,executionReady,
  }
}

export const CAD_HOLOBUILD_PIPELINE={
  name:'TRYAMM CAD → HoloBuild → Mesh → Wrap → Rig → Game',
  tools:['Cursor context','Benny Construct','Building Passport','CAD compiler','Holographic Reconstruction','Meshy/HoloForge','PBR texture wrap','interactive building rig','collision/navmesh','Game Ops','System Fabric'],
  stages:[
    'authorized source truth',
    'CAD footprint/structure',
    'floors/rooms/stairs/elevators',
    'plumbing/drain/electrical/HVAC graphs',
    'mesh generation',
    'authorized photorealistic PBR wrap',
    'interactive rigging',
    'collision + navmesh + accessibility',
    'LOD/mobile optimization',
    'mission/emergency/day-night bindings',
    'Game Ops QA',
    'Founder preview',
  ],
  googleStreetViewPolicy:'navigation/reference only; do not scrape or persist Street View imagery as game textures without separate rights.',
  authority:'proposal and build-plan generation does not publish to production or replace verified geometry without acceptance gates.',
} as const
