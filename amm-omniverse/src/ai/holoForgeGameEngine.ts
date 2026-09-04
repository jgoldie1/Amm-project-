import type {AIFactoryLaneId,AIFactorySnapshot} from './stubbsAIFactory'
import {laneReady} from './stubbsAIFactory'

export type ForgeAssetKind='character'|'vehicle'|'prop'|'building'|'environment'|'animation'|'vfx'|'audio'|'npc'|'mission'
export type ForgeTarget='streetverse'|'holoverse'|'starverse'|'mobile-safe'|'cinematic'
export type ForgeStageState='software-ready'|'execution-ready'|'blocked'

export type ForgeAssetSpec={
  name:string
  kind:ForgeAssetKind
  target:ForgeTarget
  prompt:string
  references:string[]
  rightsConfirmed:boolean
  gameplayRole:string
}

export type ForgeBudget={maxTriangles:number;maxTextureSize:number;lodCount:number;collisionRequired:boolean;navmeshRequired:boolean;mobileFallbackRequired:boolean}
export type ForgeStage={id:string;label:string;purpose:string;requiredLanes:AIFactoryLaneId[];state:ForgeStageState}
export type ForgePlan={
  id:string
  spec:ForgeAssetSpec
  outputFormat:'glb+manifest'
  budget:ForgeBudget
  stages:ForgeStage[]
  ingestTargets:string[]
  validationGates:string[]
  architectureReady:true
  executionReady:boolean
}

const TARGET_BUDGETS:Record<ForgeTarget,ForgeBudget>={
  streetverse:{maxTriangles:120000,maxTextureSize:2048,lodCount:3,collisionRequired:true,navmeshRequired:true,mobileFallbackRequired:true},
  holoverse:{maxTriangles:180000,maxTextureSize:4096,lodCount:3,collisionRequired:true,navmeshRequired:true,mobileFallbackRequired:true},
  starverse:{maxTriangles:160000,maxTextureSize:4096,lodCount:3,collisionRequired:true,navmeshRequired:false,mobileFallbackRequired:true},
  'mobile-safe':{maxTriangles:25000,maxTextureSize:1024,lodCount:2,collisionRequired:true,navmeshRequired:true,mobileFallbackRequired:true},
  cinematic:{maxTriangles:500000,maxTextureSize:4096,lodCount:2,collisionRequired:false,navmeshRequired:false,mobileFallbackRequired:false},
}

const BASE_STAGES:{id:string;label:string;purpose:string;lanes:AIFactoryLaneId[]}[]=[
  {id:'intent',label:'1. HOLOGPT DESIGN BRIEF',purpose:'Turn creator/gameplay intent into a production spec, constraints and acceptance tests.',lanes:['llm']},
  {id:'rights',label:'2. REFERENCE + RIGHTS GATE',purpose:'Inspect references, provenance, licensing and continuity before generation.',lanes:['vision_ocr','llm']},
  {id:'concept',label:'3. CONCEPT / KEYFRAMES',purpose:'Generate approved visual direction, orthographic views and material references.',lanes:['image','vision_ocr']},
  {id:'geometry',label:'4. 3D / WORLD BUILD',purpose:'Create or refine mesh, topology, scale, pivots, UVs and world-ready geometry.',lanes:['world_3d']},
  {id:'materials',label:'5. MATERIAL + TEXTURE PASS',purpose:'Create PBR materials, texture atlases and consistent visual identity.',lanes:['image','vision_ocr']},
  {id:'behavior',label:'6. RIG / PHYSICS / GAMEPLAY',purpose:'Attach skeleton, animation graph, vehicle/prop physics, sockets and gameplay metadata.',lanes:['world_3d','game_agents']},
  {id:'optimize',label:'7. LOD + PERFORMANCE LAB',purpose:'Generate LODs, collision proxies, mobile variants and enforce frame/memory budgets.',lanes:['world_3d']},
  {id:'qa',label:'8. AI + SIMULATION QA',purpose:'Inspect clipping, scale, collision, navmesh, animation, materials, naming and accessibility.',lanes:['vision_ocr','game_agents']},
  {id:'package',label:'9. HOLO FORGE PACKAGE',purpose:'Emit GLB plus manifest, provenance, checksums, gameplay metadata and fallback assets.',lanes:['llm','world_3d']},
  {id:'ingest',label:'10. WORLD INGEST',purpose:'Register the validated asset with StreetVerse/Holoverse catalogs without bypassing runtime gates.',lanes:['game_agents']},
]

function slug(value:string){return value.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,60)||'asset'}
function stageState(lanes:AIFactoryLaneId[],factory:AIFactorySnapshot):ForgeStageState{
  if(!lanes.length)return 'software-ready'
  return lanes.every(id=>laneReady(factory,id))?'execution-ready':'blocked'
}

export function buildForgePlan(spec:ForgeAssetSpec,factory:AIFactorySnapshot):ForgePlan{
  const stages=BASE_STAGES.map(stage=>({id:stage.id,label:stage.label,purpose:stage.purpose,requiredLanes:stage.lanes,state:stageState(stage.lanes,factory)}))
  const budget=TARGET_BUDGETS[spec.target]
  const ingestTargets=spec.target==='streetverse'?['StreetVerse asset catalog','StreetVerse asset loader','mobile fallback catalog','Reel/cinematic capture']:[`${spec.target} asset catalog`,'Omniverse asset registry','creator media handoff']
  const validationGates=[
    'Rights/provenance record exists before publish.',
    'Scale, pivot, orientation and naming match TRYAMM asset conventions.',
    `Geometry stays within ${budget.maxTriangles.toLocaleString()} triangles for the selected target unless explicitly waived.`,
    `Texture resolution stays within ${budget.maxTextureSize}px and uses a bounded material count.`,
    'No asset replaces a playable control root or breaks existing movement/vehicle contracts.',
    'Collision/navmesh/physics are generated only where the gameplay role requires them.',
    'LOD and mobile fallback are verified before StreetVerse production ingest.',
    'Asset must pass visual, gameplay and performance smoke checks before release.',
  ]
  return {id:`forge-${slug(spec.name)}`,spec,outputFormat:'glb+manifest',budget,stages,ingestTargets,validationGates,architectureReady:true,executionReady:stages.every(stage=>stage.state==='execution-ready')}
}

export const GAME_ENGINE_CELLS=[
  {id:'world-composer',label:'WORLD COMPOSER',purpose:'Roads, buildings, terrain, interiors, lighting, weather and streaming cells.'},
  {id:'holo-forge',label:'HOLO FORGE',purpose:'Asset generation, optimization, provenance, packaging and world ingest.'},
  {id:'agent-studio',label:'NPC / AGENT STUDIO',purpose:'Resident minds, schedules, conversations, goals, crowds and mission actors.'},
  {id:'mission-graph',label:'MISSION GRAPH',purpose:'Natural-language objectives compiled into tested mission/event state machines.'},
  {id:'simulation-lab',label:'SIMULATION LAB',purpose:'Traffic, pedestrians, physics, economy, emergency response and multiplayer load simulation.'},
  {id:'performance-lab',label:'PERFORMANCE LAB',purpose:'Device tiers, LODs, memory budgets, bundle budgets, FPS gates and graceful fallbacks.'},
  {id:'cinematic-director',label:'HOLO DIRECTOR',purpose:'Cutscenes, trailers, mission intros, Replay-to-Reel and feature-length continuity.'},
  {id:'build-farm',label:'BUILD + RELEASE FARM',purpose:'Automated tests, asset validation, staged builds, rollback and production evidence.'},
] as const
