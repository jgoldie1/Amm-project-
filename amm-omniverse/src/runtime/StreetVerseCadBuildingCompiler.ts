export type CadUnit='m'|'mm'|'ft'|'in'
export type CadSystem='structure'|'architecture'|'stairs'|'elevator'|'plumbing'|'electrical'|'hvac'|'fire-safety'|'accessibility'|'collision'|'navigation'|'facade'|'lighting'
export type CadSourceRights='tryamm-created'|'owner-authorized'|'licensed'|'open-data'|'resident-authorized'|'reference-only'

export interface CadSourceReference{
  id:string
  kind:'photo'|'scan'|'blueprint'|'floor-plan'|'measurement'|'map-data'|'street-reference'|'3d-model'
  uri?:string
  rights:CadSourceRights
  authorized:boolean
  persistentAssetAllowed:boolean
  notes?:string
}

export interface CadPoint2{ x:number; y:number }
export interface CadPoint3{ x:number; y:number; z:number }

export interface CadWall{
  id:string
  levelId:string
  from:CadPoint2
  to:CadPoint2
  height:number
  thickness:number
  exterior:boolean
  material?:string
}

export interface CadOpening{
  id:string
  wallId:string
  kind:'door'|'window'|'storefront'|'garage'
  offset:number
  width:number
  height:number
  sillHeight?:number
  accessible?:boolean
}

export interface CadRoom{
  id:string
  levelId:string
  label:string
  use:'residential'|'classroom'|'gym'|'hall'|'bathroom'|'kitchen'|'office'|'retail'|'utility'|'lobby'|'storage'|'other'
  polygon:CadPoint2[]
  ceilingHeight:number
  publicAccess:boolean
  currentPrivateInterior:boolean
}

export interface CadStair{
  id:string
  fromLevelId:string
  toLevelId:string
  origin:CadPoint3
  width:number
  rise:number
  run:number
  treadCount:number
  handrails:boolean
  emergencyEgress:boolean
}

export interface CadElevator{
  id:string
  servedLevelIds:string[]
  shaftOrigin:CadPoint3
  shaftSize:{width:number;depth:number}
  cabSize:{width:number;depth:number;height:number}
  accessible:boolean
  publicUse:boolean
}

export interface CadPipeRun{
  id:string
  kind:'cold-water'|'hot-water'|'sanitary'|'storm'|'sprinkler'
  diameterMm:number
  points:CadPoint3[]
  fixtureIds:string[]
  publishExactRoute:boolean
}

export interface CadFixture{
  id:string
  kind:'sink'|'toilet'|'shower'|'tub'|'faucet'|'drain'|'water-heater'|'sprinkler-head'
  roomId:string
  position:CadPoint3
}

export interface CadLevel{
  id:string
  label:string
  elevation:number
  floorToFloorHeight:number
  slabThickness:number
}

export interface CadFacadeWrap{
  id:string
  face:'north'|'south'|'east'|'west'|'roof'
  sourceReferenceIds:string[]
  materialPreset:string
  photorealisticTarget:boolean
  confidence:number
}

export interface StreetVerseCadDocument{
  schema:'tryamm.streetverse.cad.v1'
  id:string
  buildingPassportId:string
  name:string
  unit:CadUnit
  geoAnchor?:{lat:number;lng:number;headingDeg?:number}
  levels:CadLevel[]
  walls:CadWall[]
  openings:CadOpening[]
  rooms:CadRoom[]
  stairs:CadStair[]
  elevators:CadElevator[]
  pipeRuns:CadPipeRun[]
  fixtures:CadFixture[]
  facadeWraps:CadFacadeWrap[]
  sources:CadSourceReference[]
  systems:CadSystem[]
  metadata:{
    authoringMode:'holographic-cad'
    exactCurrentSecuritySystemsNeverPublish:true
    currentPrivateInteriorsNeverAutoPublish:true
    googleStreetViewReferenceOnly:true
  }
}

export interface CadValidationResult{
  valid:boolean
  errors:string[]
  warnings:string[]
  publishableSourceIds:string[]
}

export interface CadBuildPlan{
  schema:'tryamm.streetverse.cad-build-plan.v1'
  cadId:string
  buildingPassportId:string
  orderedStages:string[]
  generatedObjects:{
    structural:number
    walls:number
    openings:number
    rooms:number
    stairs:number
    elevators:number
    plumbingRuns:number
    fixtures:number
    facadeWraps:number
  }
  outputs:[
    'game-geometry',
    'collision',
    'navigation',
    'interaction-graph',
    'lod-plan',
    'holographic-preview',
    'cad-export'
  ]
  privacyRedactions:string[]
  sourceWarnings:string[]
  createdAt:string
}

const PERSISTENT_RIGHTS=new Set<CadSourceRights>(['tryamm-created','owner-authorized','licensed','open-data','resident-authorized'])

export function validateCadDocument(doc:StreetVerseCadDocument):CadValidationResult{
  const errors:string[]=[]
  const warnings:string[]=[]
  if(doc.schema!=='tryamm.streetverse.cad.v1')errors.push('cad-schema-invalid')
  if(!doc.id.trim())errors.push('cad-id-required')
  if(!doc.buildingPassportId.trim())errors.push('building-passport-required')
  if(!doc.levels.length)errors.push('at-least-one-level-required')
  const levelIds=new Set(doc.levels.map(level=>level.id))
  const wallIds=new Set(doc.walls.map(wall=>wall.id))
  const roomIds=new Set(doc.rooms.map(room=>room.id))
  for(const wall of doc.walls){
    if(!levelIds.has(wall.levelId))errors.push(`wall-level-missing:${wall.id}`)
    if(wall.height<=0||wall.thickness<=0)errors.push(`wall-dimensions-invalid:${wall.id}`)
  }
  for(const opening of doc.openings){
    if(!wallIds.has(opening.wallId))errors.push(`opening-wall-missing:${opening.id}`)
    if(opening.width<=0||opening.height<=0)errors.push(`opening-dimensions-invalid:${opening.id}`)
  }
  for(const room of doc.rooms){
    if(!levelIds.has(room.levelId))errors.push(`room-level-missing:${room.id}`)
    if(room.polygon.length<3)errors.push(`room-polygon-invalid:${room.id}`)
    if(room.currentPrivateInterior)warnings.push(`private-interior-redaction-required:${room.id}`)
  }
  for(const stair of doc.stairs){
    if(!levelIds.has(stair.fromLevelId)||!levelIds.has(stair.toLevelId))errors.push(`stair-level-missing:${stair.id}`)
    if(stair.width<=0||stair.treadCount<1)errors.push(`stair-geometry-invalid:${stair.id}`)
  }
  for(const elevator of doc.elevators){
    if(elevator.servedLevelIds.some(id=>!levelIds.has(id)))errors.push(`elevator-level-missing:${elevator.id}`)
    if(elevator.shaftSize.width<=0||elevator.shaftSize.depth<=0)errors.push(`elevator-shaft-invalid:${elevator.id}`)
  }
  for(const run of doc.pipeRuns){
    if(run.points.length<2)errors.push(`pipe-run-too-short:${run.id}`)
    if(run.diameterMm<=0)errors.push(`pipe-diameter-invalid:${run.id}`)
    if(run.publishExactRoute)warnings.push(`exact-utility-route-restricted:${run.id}`)
  }
  for(const fixture of doc.fixtures){
    if(!roomIds.has(fixture.roomId))errors.push(`fixture-room-missing:${fixture.id}`)
  }
  const publishableSourceIds=doc.sources.filter(source=>source.authorized&&source.persistentAssetAllowed&&PERSISTENT_RIGHTS.has(source.rights)).map(source=>source.id)
  for(const source of doc.sources){
    if(source.rights==='reference-only'||!source.persistentAssetAllowed)warnings.push(`reference-only-source-not-embeddable:${source.id}`)
    if(!source.authorized)warnings.push(`unauthorized-source:${source.id}`)
  }
  return{valid:errors.length===0,errors,warnings,publishableSourceIds}
}

export function buildCadConstructionPlan(doc:StreetVerseCadDocument):CadBuildPlan{
  const validation=validateCadDocument(doc)
  if(!validation.valid)throw new Error(`cad-document-invalid:${validation.errors.join(',')}`)
  return{
    schema:'tryamm.streetverse.cad-build-plan.v1',
    cadId:doc.id,
    buildingPassportId:doc.buildingPassportId,
    orderedStages:[
      'LOCK_AUTHORIZED_REFERENCE_SET',
      'NORMALIZE_CAD_SCALE_ORIENTATION',
      'BUILD_STRUCTURE_AND_SLABS',
      'BUILD_EXTERIOR_AND_INTERIOR_WALLS',
      'CUT_DOORS_WINDOWS_STOREFRONTS',
      'BUILD_STAIRS',
      'BUILD_ELEVATOR_SHAFTS_AND_CABS',
      'BUILD_ROOMS_AND_INTERIOR_SHELLS',
      'BUILD_SANITARY_AND_WATER_SIMULATION_GRAPH',
      'BUILD_ELECTRICAL_HVAC_FIRE_SAFETY_INTERACTION_GRAPH',
      'BUILD_ACCESSIBILITY_ROUTES',
      'BUILD_COLLISION_AND_NAVIGATION',
      'APPLY_AUTHORIZED_PHOTOREALISTIC_FACADE_WRAP',
      'GENERATE_GAME_LODS_AND_STREAMING_CELLS',
      'HOLOGRAPHIC_WALKTHROUGH_QA',
      'FOUNDER_ACCEPTANCE',
    ],
    generatedObjects:{
      structural:doc.levels.length,
      walls:doc.walls.length,
      openings:doc.openings.length,
      rooms:doc.rooms.length,
      stairs:doc.stairs.length,
      elevators:doc.elevators.length,
      plumbingRuns:doc.pipeRuns.length,
      fixtures:doc.fixtures.length,
      facadeWraps:doc.facadeWraps.length,
    },
    outputs:['game-geometry','collision','navigation','interaction-graph','lod-plan','holographic-preview','cad-export'],
    privacyRedactions:[
      ...doc.rooms.filter(room=>room.currentPrivateInterior).map(room=>`room:${room.id}`),
      ...doc.pipeRuns.filter(run=>run.publishExactRoute).map(run=>`utility-route:${run.id}`),
      'exact-current-security-systems',
    ],
    sourceWarnings:validation.warnings,
    createdAt:new Date().toISOString(),
  }
}

export function canUseSourceForPhotorealisticWrap(doc:StreetVerseCadDocument,sourceId:string){
  const source=doc.sources.find(item=>item.id===sourceId)
  return Boolean(source&&source.authorized&&source.persistentAssetAllowed&&PERSISTENT_RIGHTS.has(source.rights))
}

export const STREETVERSE_CAD_CAPABILITIES=[
  'walls/floors/roofs',
  'doors/windows/storefronts',
  'stairs',
  'elevator shafts/cabs',
  'rooms/interior shells',
  'plumbing simulation graph',
  'electrical/HVAC/fire-safety interaction graph',
  'accessibility routes',
  'collision/navmesh generation plan',
  'authorized photorealistic facade wraps',
  'holographic walkthrough',
  'LOD/streaming plan',
  'CAD export contract',
] as const
