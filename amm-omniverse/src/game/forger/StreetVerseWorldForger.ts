export type ForgeAssetKind='building'|'character'|'vehicle'|'prop'|'street-furniture'|'infrastructure'
export type ForgeSourceKind=
  |'owner-authorized-photo'
  |'user-capture'
  |'permissioned-scan'
  |'licensed-plan'
  |'open-gis'
  |'open-data'
  |'street-view-reference'
  |'conceptual'

export type ForgeStage=
  |'brief'
  |'source-check'
  |'cad-plan'
  |'mesh'
  |'rig'
  |'materials'
  |'texture-wrap'
  |'collision-nav'
  |'interactions'
  |'lod-mobile'
  |'guardian-qa'
  |'founder-preview'
  |'ready'

export interface ForgeSource{
  id:string
  kind:ForgeSourceKind
  uri?:string
  rightsCleared:boolean
  referenceOnly?:boolean
  capturedAt?:string
  notes?:string
}

export interface CadRoom{
  id:string
  label:string
  level:number
  widthM:number
  depthM:number
  heightM:number
  purpose:'classroom'|'gym'|'hall'|'office'|'residential'|'retail'|'restroom'|'mechanical'|'storage'|'lobby'|'other'
  accessible:boolean
}

export interface CadVerticalCore{
  id:string
  kind:'stairs'|'elevator'|'ramp'
  fromLevel:number
  toLevel:number
  accessible:boolean
}

export interface CadUtilityGraph{
  plumbing:{
    fixtures:Array<{id:string;kind:'sink'|'toilet'|'shower'|'drain'|'other';roomId?:string}>
    risers:string[]
    drains:string[]
  }
  electrical:{
    panels:string[]
    circuits:Array<{id:string;zone:string}>
    emergencyLighting:boolean
  }
  hvac:{
    zones:string[]
    equipment:string[]
  }
}

export interface BuildingCadPlan{
  schema:'tryamm.world-forger.cad.v1'
  id:string
  label:string
  footprintM:{width:number;depth:number}
  levels:Array<{index:number;heightM:number;label:string}>
  rooms:CadRoom[]
  verticalCores:CadVerticalCore[]
  utilities:CadUtilityGraph
  accessibility:{
    accessibleEntrances:number
    accessibleRoutes:string[]
    elevatorRequired:boolean
  }
  confidence:{
    footprint:number
    levels:number
    interior:number
    utilities:number
  }
  sourceIds:string[]
  conceptualOnly:boolean
}

export interface ForgeRecipe{
  id:string
  label:string
  kind:ForgeAssetKind
  districtId:string
  sourceIds:string[]
  cadPlanId?:string
  meshy:{
    required:boolean
    target:'text-to-3d'|'image-to-3d'|'rig'|'animation'|'none'
    prompt:string
    rigProfile?:'humanoid'|'vehicle'|'mechanical'|'none'
  }
  materials:{
    pbr:boolean
    textureWrap:'authorized-reference'|'procedural'|'hybrid'
    maxTextureSize:number
    mobileTextureSize:number
  }
  runtime:{
    collision:boolean
    navMesh:boolean
    lodLevels:number
    mobileTriangleBudget:number
    desktopTriangleBudget:number
    interactive:boolean
  }
  rights:{
    sourceReviewRequired:boolean
    likenessReviewRequired:boolean
    streetViewReferenceOnly:boolean
  }
  stage:ForgeStage
  warnings:string[]
}

export interface NeighborhoodForgeCell{
  id:string
  name:string
  city:'Chicago'
  districtGroup:'West Side'
  anchors:string[]
  firstWave:boolean
  gameplay:{
    missionTypes:string[]
    businessSlots:number
    residentCapacity:number
    trafficCapacity:number
    emergencySlots:number
  }
  build:{
    streets:boolean
    buildings:boolean
    interiors:'none'|'selected-authorized'
    trees:boolean
    traffic:boolean
    residents:boolean
    transit:boolean
  }
}

export const CHICAGO_WEST_SIDE_FORGE_CELLS:NeighborhoodForgeCell[]=[
  {
    id:'circle-park-abla',
    name:'Circle Park / ABLA Legacy District',
    city:'Chicago',districtGroup:'West Side',
    anchors:['Circle Park','Roosevelt Road','Taylor Street','Thomas Jefferson legacy school route'],
    firstWave:true,
    gameplay:{missionTypes:['school-day','repair-and-drive','fire-response','ems-response','creator','business'],businessSlots:24,residentCapacity:450,trafficCapacity:140,emergencySlots:8},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'near-west-side',
    name:'Near West Side',
    city:'Chicago',districtGroup:'West Side',
    anchors:['Taylor Street','Roosevelt Road','medical/campus corridor','marketplace corridor'],
    firstWave:true,
    gameplay:{missionTypes:['creator','business','delivery','medical-support','mobility'],businessSlots:60,residentCapacity:900,trafficCapacity:260,emergencySlots:12},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'north-lawndale',
    name:'North Lawndale',
    city:'Chicago',districtGroup:'West Side',
    anchors:['community corridor','schools','parks','small-business blocks'],
    firstWave:true,
    gameplay:{missionTypes:['community','school','business','repair','public-service'],businessSlots:55,residentCapacity:1000,trafficCapacity:240,emergencySlots:12},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'east-garfield-park',
    name:'East Garfield Park',
    city:'Chicago',districtGroup:'West Side',
    anchors:['park corridor','transit','residential blocks','creator route'],
    firstWave:true,
    gameplay:{missionTypes:['transit','creator','business','community','emergency'],businessSlots:50,residentCapacity:900,trafficCapacity:230,emergencySlots:10},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'west-garfield-park',
    name:'West Garfield Park',
    city:'Chicago',districtGroup:'West Side',
    anchors:['residential blocks','business corridor','park routes'],
    firstWave:true,
    gameplay:{missionTypes:['community','business','mobility','repair','emergency'],businessSlots:44,residentCapacity:850,trafficCapacity:220,emergencySlots:10},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'austin',
    name:'Austin',
    city:'Chicago',districtGroup:'West Side',
    anchors:['commercial corridors','residential blocks','parks','transit'],
    firstWave:true,
    gameplay:{missionTypes:['business','community','sports','mobility','emergency'],businessSlots:80,residentCapacity:1500,trafficCapacity:360,emergencySlots:16},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'humboldt-park',
    name:'Humboldt Park',
    city:'Chicago',districtGroup:'West Side',
    anchors:['park','culture corridor','business blocks','residential blocks'],
    firstWave:false,
    gameplay:{missionTypes:['culture','creator','sports','business','community'],businessSlots:70,residentCapacity:1200,trafficCapacity:280,emergencySlots:12},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'lower-west-side-pilsen',
    name:'Lower West Side / Pilsen',
    city:'Chicago',districtGroup:'West Side',
    anchors:['Pilsen','18th Street corridor','murals','creator/business routes'],
    firstWave:true,
    gameplay:{missionTypes:['creator','culture','food','business','delivery'],businessSlots:75,residentCapacity:1100,trafficCapacity:260,emergencySlots:10},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
  {
    id:'south-lawndale-little-village',
    name:'South Lawndale / Little Village',
    city:'Chicago',districtGroup:'West Side',
    anchors:['Little Village','business corridor','residential blocks','community routes'],
    firstWave:false,
    gameplay:{missionTypes:['business','food','delivery','community','mobility'],businessSlots:85,residentCapacity:1300,trafficCapacity:300,emergencySlots:12},
    build:{streets:true,buildings:true,interiors:'selected-authorized',trees:true,traffic:true,residents:true,transit:true},
  },
]

export const WORLD_FORGER_PIPELINE:ForgeStage[]=[
  'brief','source-check','cad-plan','mesh','rig','materials','texture-wrap',
  'collision-nav','interactions','lod-mobile','guardian-qa','founder-preview','ready',
]

export const WORLD_FORGER_SOURCE_RULES={
  googleStreetView:'reference-only; do not scrape imagery into owned textures or geometry',
  authorizedPhotos:'may drive image-to-3D / texture work within the granted rights',
  openGIS:'preferred for footprints/roads when license and provenance are recorded',
  interiors:'only selected authorized interiors; do not infer or publish private/sensitive interiors',
  realPeople:'require likeness authorization before verified photo-match claims',
} as const

export const WORLD_FORGER_OUTPUTS={
  building:['CAD plan','mesh','PBR materials','authorized/procedural texture wrap','collision','nav','stairs','elevator','utility graph','interactions','mobile LODs'],
  character:['body mesh','rig','face/animation hooks','clothing/materials','LOD','collision capsule','mission identity'],
  vehicle:['body mesh','wheel/door rigs','collision','seat points','lights','audio hooks','LOD'],
  prop:['mesh','materials','collision','interaction hook','LOD'],
  infrastructure:['road/sidewalk mesh','signage','street furniture','utility/mission anchors','collision/nav','LOD'],
} as const

export function validateCadPlan(plan:BuildingCadPlan){
  const errors:string[]=[]
  if(!plan.id.trim())errors.push('cad-id')
  if(plan.footprintM.width<=0||plan.footprintM.depth<=0)errors.push('footprint')
  if(!plan.levels.length)errors.push('levels')
  if(plan.levels.some(level=>level.heightM<=0))errors.push('level-height')
  if(plan.verticalCores.some(core=>core.toLevel<=core.fromLevel))errors.push('vertical-core-range')
  if(plan.accessibility.elevatorRequired&&!plan.verticalCores.some(core=>core.kind==='elevator'&&core.accessible))errors.push('accessible-elevator')
  if(plan.sourceIds.length===0)errors.push('source-provenance')
  return errors
}

export function sourceCanDriveTexture(source:ForgeSource){
  return source.rightsCleared&&!source.referenceOnly&&source.kind!=='street-view-reference'
}

export function validateForgeRecipe(recipe:ForgeRecipe,sources:ForgeSource[],cadPlan?:BuildingCadPlan){
  const errors:string[]=[]
  const sourceMap=new Map(sources.map(source=>[source.id,source]))
  if(!recipe.id.trim())errors.push('recipe-id')
  if(recipe.sourceIds.some(id=>!sourceMap.has(id)))errors.push('missing-source')
  if(recipe.rights.sourceReviewRequired&&recipe.sourceIds.some(id=>!sourceMap.get(id)?.rightsCleared&&sourceMap.get(id)?.kind!=='street-view-reference'))errors.push('source-rights')
  if(recipe.kind==='building'&&recipe.cadPlanId&&!cadPlan)errors.push('cad-plan-missing')
  if(cadPlan&&validateCadPlan(cadPlan).length)errors.push('cad-plan-invalid')
  if(recipe.materials.textureWrap==='authorized-reference'){
    const hasTextureSource=recipe.sourceIds.map(id=>sourceMap.get(id)).some(source=>source&&sourceCanDriveTexture(source))
    if(!hasTextureSource)errors.push('authorized-texture-source-required')
  }
  if(recipe.runtime.lodLevels<2)errors.push('mobile-lod-required')
  if(recipe.runtime.mobileTriangleBudget<=0)errors.push('mobile-triangle-budget')
  if(recipe.runtime.mobileTriangleBudget>recipe.runtime.desktopTriangleBudget)errors.push('mobile-budget-exceeds-desktop')
  return errors
}

export function createBuildingCadPlan(input:{
  id:string
  label:string
  widthM:number
  depthM:number
  floors:number
  floorHeightM?:number
  sourceIds:string[]
  elevator?:boolean
  stairCount?:number
  rooms?:CadRoom[]
  conceptualOnly?:boolean
}):BuildingCadPlan{
  const floors=Math.max(1,Math.min(120,Math.trunc(input.floors||1)))
  const floorHeight=Math.max(2.4,Math.min(8,Number(input.floorHeightM)||3.2))
  const elevator=Boolean(input.elevator||floors>=4)
  const verticalCores:CadVerticalCore[]=[]
  const stairCount=Math.max(1,Math.min(6,Math.trunc(input.stairCount||1)))
  for(let i=0;i<stairCount;i++)verticalCores.push({id:`stairs-${i+1}`,kind:'stairs',fromLevel:0,toLevel:floors-1,accessible:false})
  if(elevator)verticalCores.push({id:'elevator-1',kind:'elevator',fromLevel:0,toLevel:floors-1,accessible:true})
  return{
    schema:'tryamm.world-forger.cad.v1',
    id:input.id,label:input.label,
    footprintM:{width:Math.max(2,Number(input.widthM)||10),depth:Math.max(2,Number(input.depthM)||10)},
    levels:Array.from({length:floors},(_,index)=>({index,heightM:floorHeight,label:index===0?'GROUND':`LEVEL ${index+1}`})),
    rooms:input.rooms||[],
    verticalCores,
    utilities:{
      plumbing:{fixtures:[],risers:floors>1?['water-riser-1']:[],drains:floors>1?['sanitary-stack-1']:[]},
      electrical:{panels:['main-panel'],circuits:[{id:'general-1',zone:'general'}],emergencyLighting:floors>1},
      hvac:{zones:Array.from({length:floors},(_,i)=>`level-${i+1}`),equipment:['conceptual-air-handler']},
    },
    accessibility:{accessibleEntrances:1,accessibleRoutes:['main-accessible-route'],elevatorRequired:floors>=2},
    confidence:{footprint:input.conceptualOnly?0.35:0.7,levels:input.conceptualOnly?0.35:0.65,interior:input.rooms?.length?0.55:0.2,utilities:0.15},
    sourceIds:[...new Set(input.sourceIds)],
    conceptualOnly:Boolean(input.conceptualOnly),
  }
}

export function makeWorldForgeRecipe(input:{
  id:string
  label:string
  kind:ForgeAssetKind
  districtId:string
  sourceIds:string[]
  cadPlanId?:string
  prompt:string
  target?:ForgeRecipe['meshy']['target']
  rigProfile?:ForgeRecipe['meshy']['rigProfile']
  textureWrap?:ForgeRecipe['materials']['textureWrap']
}):ForgeRecipe{
  const kind=input.kind
  const character=kind==='character'
  const vehicle=kind==='vehicle'
  const building=kind==='building'
  return{
    id:input.id,label:input.label,kind,districtId:input.districtId,sourceIds:[...new Set(input.sourceIds)],cadPlanId:input.cadPlanId,
    meshy:{
      required:true,
      target:input.target||(character?'rig':vehicle?'image-to-3d':'text-to-3d'),
      prompt:input.prompt,
      rigProfile:input.rigProfile||(character?'humanoid':vehicle?'vehicle':building?'mechanical':'none'),
    },
    materials:{pbr:true,textureWrap:input.textureWrap||'hybrid',maxTextureSize:2048,mobileTextureSize:1024},
    runtime:{
      collision:true,navMesh:building||kind==='infrastructure',lodLevels:3,
      mobileTriangleBudget:character?65000:vehicle?85000:building?180000:45000,
      desktopTriangleBudget:character?160000:vehicle?220000:building?550000:120000,
      interactive:true,
    },
    rights:{
      sourceReviewRequired:true,
      likenessReviewRequired:character,
      streetViewReferenceOnly:true,
    },
    stage:'brief',warnings:[],
  }
}

export function advanceForgeRecipe(recipe:ForgeRecipe,passed:boolean,warning?:string){
  const next:ForgeRecipe={...recipe,warnings:[...recipe.warnings]}
  if(!passed){
    if(warning)next.warnings.push(warning)
    return next
  }
  const index=WORLD_FORGER_PIPELINE.indexOf(recipe.stage)
  next.stage=WORLD_FORGER_PIPELINE[Math.min(WORLD_FORGER_PIPELINE.length-1,index+1)]
  return next
}

export function forgeCellById(id:string){
  return CHICAGO_WEST_SIDE_FORGE_CELLS.find(cell=>cell.id===id)
}
