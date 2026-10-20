import type {ForgeAssetKind,ForgeTarget} from '../ai/holoForgeGameEngine'

export type WorldForgeKind=
  |'person'
  |'npc'
  |'vehicle'
  |'building'
  |'interior'
  |'street'
  |'neighborhood'
  |'prop'
  |'environment'

export type WorldForgeSourceKind=
  |'prompt'
  |'photo'
  |'multi-view-photos'
  |'scan'
  |'blueprint'
  |'floor-plan'
  |'cad'
  |'glb'
  |'licensed-reference'

export type WorldForgeStageId=
  |'brief'
  |'rights'
  |'cad-structure'
  |'surface-reconstruction'
  |'mesh'
  |'rig-kinematics'
  |'materials'
  |'world-semantics'
  |'accessibility'
  |'lod-performance'
  |'qa'
  |'publish'

export type WorldForgeStage={
  id:WorldForgeStageId
  label:string
  purpose:string
  required:boolean
  technologies:string[]
  output:string[]
}

export type WorldForgeRequest={
  name:string
  kind:WorldForgeKind
  target:ForgeTarget
  prompt:string
  sources:WorldForgeSourceKind[]
  rightsConfirmed:boolean
  realPerson:boolean
  likenessAuthorized:boolean
  needsInterior?:boolean
  needsMEP?:boolean
  needsRig?:boolean
  needsPhysics?:boolean
  needsMissions?:boolean
}

export type WorldForgePlan={
  id:string
  name:string
  kind:WorldForgeKind
  target:ForgeTarget
  assetKind:ForgeAssetKind
  stages:WorldForgeStage[]
  sourceStrategy:string[]
  outputs:string[]
  safetyGates:string[]
  executionNotes:string[]
  commercialReadyWhen:string[]
  architectureReady:true
  publishBlockedReasons:string[]
}

const slug=(value:string)=>value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'world-asset'

function toForgeKind(kind:WorldForgeKind):ForgeAssetKind{
  if(kind==='person')return'character'
  if(kind==='npc')return'npc'
  if(kind==='vehicle')return'vehicle'
  if(kind==='building'||kind==='interior')return'building'
  if(kind==='street'||kind==='neighborhood'||kind==='environment')return'environment'
  return'prop'
}

function stage(id:WorldForgeStageId,label:string,purpose:string,technologies:string[],output:string[],required=true):WorldForgeStage{
  return{id,label,purpose,technologies,output,required}
}

export const WORLD_FORGER_TECHNOLOGY_MAP={
  intent:['HoloGPT','Stubbs AI','TRYAMM System Fabric'],
  codeAndAssembly:['Cursor/engineering workflow','Construct Engine','Benny Cursor Construct Bridge'],
  cad:['TRYAMM CAD layer','building passports','floor plans','blueprints','measurements'],
  geometry:['Holo Forge','Meshy adapter','TRYAMM Native Asset Foundry','Construct geometry'],
  people:['Avatar Multi-View Mesh Pipeline','humanoid rig','facial blendshapes','animation retargeting'],
  vehicles:['vehicle-shell CAD','StreetVerse Physical Vehicle Rig','doors','seats','steering','lights','physics'],
  buildings:['Holographic Building Reconstruction','stairs','elevators','doors','windows','utility graphs','collision','navigation'],
  materials:['PBR materials','UV wrap','texture atlas','photo/reference wrap with rights'],
  worlds:['World Compiler','StreetVerse streaming cells','mission graph','Global city style packs'],
  optimization:['LOD','mesh compression','texture budgets','mobile fallback'],
  qa:['Guardian','Game Ops','System Fabric','visual/device contracts'],
} as const

export function buildWorldForgePlan(input:WorldForgeRequest):WorldForgePlan{
  const publishBlockedReasons:string[]=[]
  if(!input.name.trim())publishBlockedReasons.push('asset-name-required')
  if(!input.prompt.trim())publishBlockedReasons.push('production-brief-required')
  if(!input.rightsConfirmed)publishBlockedReasons.push('rights-not-confirmed')
  if(input.realPerson&&!input.likenessAuthorized)publishBlockedReasons.push('real-person-likeness-authorization-required')

  const isPerson=input.kind==='person'||input.kind==='npc'
  const isVehicle=input.kind==='vehicle'
  const isBuilding=input.kind==='building'||input.kind==='interior'
  const isWorld=input.kind==='street'||input.kind==='neighborhood'||input.kind==='environment'
  const needsRig=input.needsRig??(isPerson||isVehicle)
  const needsInterior=input.needsInterior??isBuilding
  const needsMEP=input.needsMEP??isBuilding
  const needsPhysics=input.needsPhysics??(isVehicle||isWorld)
  const needsMissions=input.needsMissions??true

  const stages:WorldForgeStage[]=[
    stage('brief','1. INTENT + ACCEPTANCE BRIEF','Turn the idea into exact scale, gameplay role, device target, visual target and acceptance tests.',
      ['HoloGPT','Stubbs AI','Game Ops'],['production brief','acceptance criteria','asset budget']),
    stage('rights','2. RIGHTS + REFERENCE GATE','Record source provenance, likeness permissions and commercial-use boundaries before generation.',
      ['Asset Rights Registry','Character Likeness Authorization','Guardian'],['rights manifest','reference manifest']),
    stage('cad-structure','3. CAD + STRUCTURE','Create or normalize dimensions, footprint, structural layout, wheelbase/body shell, skeleton proportions or modular world measurements.',
      ['TRYAMM CAD layer','Construct Engine','Building Passports','measurement/blueprint/scan adapters'],['dimensioned CAD/structure spec','anchors/pivots','room/part graph'],
      isVehicle||isBuilding||isWorld),
    stage('surface-reconstruction','4. REFERENCE WRAP / RECONSTRUCTION','Use authorized photos/scans/reference views to recover silhouette, facade/body surfaces and visual continuity.',
      ['Holographic Building Reconstruction','Avatar Multi-View Mesh Pipeline','licensed/reference wrap'],['reconstruction mesh','confidence map','uncertain-region list'],
      input.sources.some(source=>['photo','multi-view-photos','scan','licensed-reference'].includes(source))),
    stage('mesh','5. MESH FORGE','Generate/refine topology, UVs, scale, pivots, collision proxies and production geometry.',
      ['Holo Forge','Meshy adapter','TRYAMM Native Asset Foundry','mesh repair/retopology'],['GLB mesh','UV map','collision proxy']),
    stage('rig-kinematics','6. RIG + KINEMATICS','Attach bones, moving parts, doors, seats, steering, face controls or other gameplay articulation.',
      isPerson?['humanoid rig','facial blendshapes','animation retargeting']:
      isVehicle?['StreetVerse Physical Vehicle Rig','door/seat/steering/light sockets']:
      ['Construct behavior graph'],['rig/kinematic graph','animation sockets','interaction anchors'],needsRig),
    stage('materials','7. PBR + TEXTURE WRAP','Create materials, UV texture wrap, decals, glass, skin/hair/paint and bounded texture atlases.',
      ['PBR material pass','texture atlas','photo/reference wrap'],['PBR materials','texture atlas','material manifest']),
    stage('world-semantics','8. GAMEPLAY + BUILDING SYSTEMS','Attach rooms, stairs, elevators, plumbing/utility graphs, traffic logic, missions, business/job semantics and interaction points.',
      isBuilding?['Building Reconstruction behavior graph','stairs/elevators','utility graphs','navigation']:
      isVehicle?['vehicle gameplay state','repair/drive/exit mission hooks']:
      isPerson?['character development','dialogue/mission actor hooks']:
      ['World Compiler','mission graph','traffic/crowd simulation'],
      [
        needsInterior?'interior room graph':'exterior/gameplay graph',
        needsMEP?'utility/MEP graph':'interaction graph',
        needsMissions?'mission/event hooks':'world metadata',
      ],isBuilding||isVehicle||isPerson||isWorld),
    stage('accessibility','9. ACCESSIBILITY + CONTROL PASS','Verify one-hand play, reachable interactions, accessible routes, captions/visual cues and mobile touch targets.',
      ['Universal Intent Controller','accessibility contracts','Building Passport accessibility'],['accessibility manifest','reachable-route proof']),
    stage('lod-performance','10. LOD + MOBILE PERFORMANCE','Generate LODs, compress meshes/textures, stream world cells and preserve a mobile-safe fallback.',
      ['Quantum slicer/chunk strategy','LOD generator','compression','streaming cells'],['LOD0..n','mobile fallback','performance budget']),
    stage('qa','11. GUARDIAN + GAME OPS QA','Run visual, gameplay, collision, mission, animation, device and rights checks. Fail closed on missing evidence.',
      ['Guardian','StreetVerse Game Ops','TRYAMM System Fabric','CI/device evidence'],['QA report','device/runtime evidence','repair tickets']),
    stage('publish','12. WORLD INGEST','Publish only validated GLB/manifest assets into StreetVerse/Global catalogs with provenance and rollback metadata.',
      ['World Compiler','StreetVerse asset manifest','Omniverse registry'],['GLB + manifest','catalog entry','rollback pointer']),
  ].filter(item=>item.required)

  const sourceStrategy=[
    input.sources.includes('cad')?'Start from CAD/measurements where available.':'Derive dimensional structure from the approved brief/references.',
    input.sources.some(source=>['photo','multi-view-photos','scan'].includes(source))?'Use authorized visual reconstruction for shape/material continuity.':'Use original TRYAMM design language rather than copying unknown third-party identity.',
    'Prefer TRYAMM-native generation/assembly for repeatable world pieces; use provider adapters only as replaceable accelerators.',
    'Preserve one source-of-truth manifest so mesh, rig, textures, collisions, missions and LODs stay attached to the same asset identity.',
  ]

  const outputs=[
    'dimensioned production specification',
    'GLB runtime asset',
    'PBR texture/material package',
    'collision/navigation metadata',
    needsRig?'rig + animation/kinematic graph':'static behavior graph',
    needsInterior?'interior/room graph':'world placement metadata',
    needsMEP?'stairs/elevator/plumbing/utility behavior graph':'interaction graph',
    'LOD/mobile variants',
    'rights/provenance manifest',
    'gameplay/mission hooks',
  ]

  const safetyGates=[
    'No real-person photo match without verified likeness authorization.',
    'No unknown/reference-only third-party asset is promoted to commercial production.',
    'No physical Construct/robotic motion is executed from a World Forger plan without the existing human-approval safety gate.',
    'Game asset generation does not bypass StreetVerse runtime, collision, accessibility, performance or device checks.',
    'Architecture references may guide reconstruction only where the source/use rights permit it.',
  ]

  const executionNotes=[
    isPerson?'People: fit authorized references to a neutral base mesh, rig, facial controls, locomotion and LODs.':'',
    isVehicle?'Vehicles: CAD/body shell → wheels/doors/seats/steering/lights → physics/repair/drive sockets → LODs.':'',
    isBuilding?'Buildings: footprint/floors → structure/facade → rooms → stairs/elevators → plumbing/utility graph → doors/windows → collision/nav/accessibility → texture wrap.':'',
    isWorld?'Neighborhoods: parcel/street cells → buildings/props/traffic/population → mission semantics → streaming/LOD.':'',
  ].filter(Boolean)

  const commercialReadyWhen=[
    'Rights/provenance are documented for every source and generated derivative.',
    'The actual artifact exists and passes geometry/rig/material/collision checks.',
    'StreetVerse gameplay and mobile/device acceptance tests pass on the exact revision.',
    'Performance budgets and fallback assets are verified.',
    'No placeholder/fallback is marketed as a final photoreal or authorized likeness asset.',
  ]

  return{
    id:`world-forge-${slug(input.name)}`,
    name:input.name,
    kind:input.kind,
    target:input.target,
    assetKind:toForgeKind(input.kind),
    stages,
    sourceStrategy,
    outputs,
    safetyGates,
    executionNotes,
    commercialReadyWhen,
    architectureReady:true,
    publishBlockedReasons,
  }
}

export const TRYAMM_WORLD_FORGER={
  name:'TRYAMM World Forger',
  purpose:'One production control plane for creating people, vehicles, buildings, interiors, streets, neighborhoods, props and environments from prompt/reference/CAD/scan through validated StreetVerse ingest.',
  connects:[
    'HoloGPT',
    'Stubbs AI',
    'Cursor/engineering workflow',
    'Construct Engine',
    'CAD/building passports',
    'Holo Forge',
    'Meshy',
    'Avatar Multi-View Mesh Pipeline',
    'Physical Vehicle Rig',
    'Holographic Building Reconstruction',
    'World Compiler',
    'StreetVerse Game Ops',
    'TRYAMM System Fabric',
    'Guardian',
  ],
  oneSourceOfTruth:true,
  providerNeutral:true,
  canCreatePlanForPeople:true,
  canCreatePlanForVehicles:true,
  canCreatePlanForBuildings:true,
  canCreatePlanForNeighborhoods:true,
  productionMutationRequiresExistingApprovalGates:true,
  doesNotClaimAutomaticPhotorealCompletion:true,
} as const
