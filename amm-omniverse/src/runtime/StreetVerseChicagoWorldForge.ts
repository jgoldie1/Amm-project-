import {CHICAGO_BUILD_GRID} from '../data/StreetVerseChicagoBuildGrid'
import {createStreetVerseAssetRequirements} from './StreetVersePhotorealPipeline'
import {BUILDING_RECONSTRUCTION_STAGES,type BuildingReconstructionStage} from '../game/runtime/holographicBuildingReconstruction'
import {CHICAGO_AREA_COMPILER_STAGES} from '../game/runtime/chicagoCommunityAreaCompiler'
import {WORLD_CERTIFICATION_CHECKS} from '../game/simulation/worldBuilderPipeline'

export type WorldForgeTargetKind='building'|'block'|'corridor'|'neighborhood'|'community-area'
export type WorldForgeSourceKind='owner-photo'|'licensed-photo'|'scan'|'floor-plan'|'blueprint'|'open-data'|'street-view-reference'|'manual-measurement'

export interface WorldForgeSource{
  id:string
  kind:WorldForgeSourceKind
  uri?:string
  authorized:boolean
  rights:'owner-authorized'|'commercial-licensed'|'open-data'|'reference-only'|'unknown'
  mayUseAsTexture:boolean
  note?:string
}

export interface WorldForgeRequest{
  id:string
  label:string
  targetKind:WorldForgeTargetKind
  chicagoZoneId?:string
  communityAreaId?:number
  sources:WorldForgeSource[]
  floors?:number
  includeInterior?:boolean
  includeStairs?:boolean
  includeElevator?:boolean
  includePlumbing?:boolean
  includeElectrical?:boolean
  includeHVAC?:boolean
  includeFireSafety?:boolean
  includeGameplay?:boolean
  includeBusinesses?:boolean
  includeTraffic?:boolean
  includePopulation?:boolean
  providerGenerationApproved?:boolean
}

export interface WorldForgePlan{
  schema:'tryamm.streetverse.world-forge.v1'
  request:WorldForgeRequest
  target:{
    grid?:string
    x?:number
    z?:number
    radius?:number
  }
  pipeline:{
    cad:string[]
    reconstruction:BuildingReconstructionStage[]
    photoreal:string[]
    gameplay:string[]
    qa:string[]
  }
  outputs:{
    cadSource:string[]
    runtime:string[]
    textures:string[]
    metadata:string[]
  }
  providerTasks:{
    meshy:string[]
    cursorConstruct:string[]
    approvalRequired:boolean
  }
  sourcePolicy:{
    usableSources:string[]
    referenceOnlySources:string[]
    blockedTextureSources:string[]
  }
  commercialHooks:string[]
  warnings:string[]
  readyForGeneration:boolean
  createdAt:string
}

export const WEST_SIDE_WORLD_FORGE_PRESETS:WorldForgeRequest[]=[
  {
    id:'circle-park-complete',
    label:'Circle Park Complete Build',
    targetKind:'block',
    chicagoZoneId:'circle-park',
    sources:[],
    floors:3,
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:true,includeTraffic:true,includePopulation:true,
  },
  {
    id:'thomas-jefferson-school-complete',
    label:'Thomas Jefferson School Complete Build',
    targetKind:'building',
    chicagoZoneId:'near-west',
    sources:[],
    floors:3,
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:false,includeTraffic:true,includePopulation:true,
  },
  {
    id:'roosevelt-road-corridor',
    label:'Roosevelt Road Corridor',
    targetKind:'corridor',
    chicagoZoneId:'roosevelt-road',
    sources:[],
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:true,includeTraffic:true,includePopulation:true,
  },
  {
    id:'taylor-street-corridor',
    label:'Taylor Street Corridor',
    targetKind:'corridor',
    chicagoZoneId:'taylor-street',
    sources:[],
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:true,includeTraffic:true,includePopulation:true,
  },
  {
    id:'near-west-neighborhood',
    label:'Near West Side Neighborhood',
    targetKind:'neighborhood',
    chicagoZoneId:'near-west',
    sources:[],
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:true,includeTraffic:true,includePopulation:true,
  },
  {
    id:'pilsen-neighborhood',
    label:'Pilsen Neighborhood',
    targetKind:'neighborhood',
    chicagoZoneId:'pilsen',
    sources:[],
    includeInterior:true,includeStairs:true,includeElevator:true,includePlumbing:true,includeElectrical:true,includeHVAC:true,includeFireSafety:true,
    includeGameplay:true,includeBusinesses:true,includeTraffic:true,includePopulation:true,
  },
]

export const STREET_VIEW_REFERENCE_RULE={
  kind:'street-view-reference' as const,
  role:'visual reference only unless separately licensed/authorized for the intended reuse',
  mayUseAsTexture:false,
  scrapeIntoGame:false,
  reason:'Use reference imagery to understand shape, proportion, signage placement and context; build TRYAMM-owned or properly licensed geometry/textures instead of copying reference imagery into production assets.',
} as const

function sourcePolicy(sources:WorldForgeSource[]){
  const usable=sources.filter(source=>source.authorized&&source.rights!=='unknown')
  const referenceOnly=usable.filter(source=>source.rights==='reference-only'||source.kind==='street-view-reference')
  const blockedTexture=usable.filter(source=>!source.mayUseAsTexture||source.rights==='reference-only'||source.kind==='street-view-reference')
  return{
    usableSources:usable.map(source=>source.id),
    referenceOnlySources:referenceOnly.map(source=>source.id),
    blockedTextureSources:blockedTexture.map(source=>source.id),
  }
}

export function createStreetVerseWorldForgePlan(request:WorldForgeRequest):WorldForgePlan{
  const zone=request.chicagoZoneId?CHICAGO_BUILD_GRID.find(item=>item.id===request.chicagoZoneId):undefined
  const policy=sourcePolicy(request.sources)
  const warnings:string[]=[]
  if(request.sources.some(source=>!source.authorized))warnings.push('One or more sources are not authorized and will not be used for production.')
  if(request.sources.some(source=>source.kind==='street-view-reference'&&source.mayUseAsTexture))warnings.push('Street-view reference cannot be treated as a production texture source by this pipeline.')
  if(request.sources.length===0)warnings.push('No reference sources attached yet; compiler can create a procedural blockout, not a verified photoreal reconstruction.')
  if(request.targetKind==='building'&&request.includeElevator&&Number(request.floors||0)<2)warnings.push('Elevator requested for a low-rise building; keep only when the design/use case needs it.')

  const cad=[
    'SITE_AND_FOOTPRINT',
    'PARAMETRIC_STRUCTURAL_SHELL',
    request.includeInterior?'ROOM_AND_INTERIOR_LAYOUT':'EXTERIOR_ONLY',
    request.includeStairs?'STAIRS_AND_VERTICAL_CIRCULATION':'NO_STAIRS',
    request.includeElevator?'ELEVATOR_SHAFT_AND_LANDINGS':'NO_ELEVATOR',
    request.includePlumbing?'PLUMBING_SUPPLY_DRAIN_FIXTURES':'NO_PLUMBING',
    request.includeElectrical?'ELECTRICAL_LIGHTING_INTERACTIONS':'NO_ELECTRICAL',
    request.includeHVAC?'HVAC_ZONES_AND_VENTS':'NO_HVAC',
    request.includeFireSafety?'EGRESS_FIRE_SAFETY_ACCESSIBILITY':'BASE_EGRESS_ONLY',
    'FACADE_OPENINGS_AND_ROOF',
    'COLLISION_NAVMESH_STREAMING_CELLS',
  ]

  const photoreal=createStreetVerseAssetRequirements('building','premium')
  const gameplay=[
    request.includeGameplay?'MISSIONS_AND_INTERACTIONS':'NO_GAMEPLAY',
    request.includeBusinesses?'BUSINESS_STORE_FRONTS':'NO_BUSINESS_LAYER',
    request.includeTraffic?'ROAD_TRAFFIC_TRANSIT':'NO_TRAFFIC_LAYER',
    request.includePopulation?'NPC_POPULATION_ROUTINES':'NO_POPULATION_LAYER',
    'DOORS_WINDOWS_LIGHTS_AUDIO',
    'TIME_WEATHER_DAY_NIGHT',
    'ACCESSIBILITY_ONE_HAND_ROUTE',
  ]

  const providerTasks={
    meshy:[
      'Generate/retopologize facade props only where procedural/CAD geometry is insufficient.',
      'Generate optimized GLB props, furniture, vehicles or character-adjacent assets from approved briefs.',
      'Texture/PBR assistance only from TRYAMM-owned, licensed, or otherwise authorized source material.',
    ],
    cursorConstruct:[
      'Turn approved building brief into CAD/geometry tasks.',
      'Write/repair scene integration code, collisions, doors, stairs, elevators and interaction anchors.',
      'Connect generated assets to the StreetVerse scene registry, mission system, Game Ops and System Fabric.',
    ],
    approvalRequired:request.providerGenerationApproved!==true,
  }

  return{
    schema:'tryamm.streetverse.world-forge.v1',
    request,
    target:{grid:zone?.grid,x:zone?.x,z:zone?.z,radius:zone?.radius},
    pipeline:{
      cad,
      reconstruction:[...BUILDING_RECONSTRUCTION_STAGES],
      photoreal:[...photoreal.stages],
      gameplay,
      qa:[...WORLD_CERTIFICATION_CHECKS,...CHICAGO_AREA_COMPILER_STAGES.slice(-5),'GAME_OPS_E2E','PHYSICAL_IPHONE_VISUAL_PROOF'],
    },
    outputs:{
      cadSource:['IFC/STEP/DXF or equivalent parametric source when available','Blender source for art pass'],
      runtime:['GLB/GLTF','collision mesh','navmesh','LOD/HLOD cells'],
      textures:['KTX2/WebP PBR sets','TRYAMM-created or properly licensed facade/trim materials'],
      metadata:['Building Passport','rights/provenance manifest','mission anchors','business/property hooks','Game Ops evidence'],
    },
    providerTasks,
    sourcePolicy:policy,
    commercialHooks:[
      'PropertyVerse building/property digital twin',
      'business/storefront onboarding',
      'creator/reality-show location',
      'mission sponsorship and local advertising subject to product rules',
      'authorized 3D asset marketplace/licensing',
      'construction/design visualization services where appropriate',
    ],
    warnings,
    readyForGeneration:policy.usableSources.length>0||request.sources.length===0,
    createdAt:new Date().toISOString(),
  }
}

export function cloneWorldForgePreset(id:string){
  const preset=WEST_SIDE_WORLD_FORGE_PRESETS.find(item=>item.id===id)||WEST_SIDE_WORLD_FORGE_PRESETS[0]
  return structuredClone(preset)
}
