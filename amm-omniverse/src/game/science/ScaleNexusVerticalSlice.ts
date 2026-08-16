export type SliceStage='micro-lab'|'living-earth'|'world-travel'|'street-mission'|'observatory'|'orbit'|'return'

export interface SliceObjective {
  id:string
  stage:SliceStage
  title:string
  event:string
  required:boolean
  completed:boolean
}

export interface VerticalSliceState {
  playerId:string
  stage:SliceStage
  objectiveIndex:number
  objectives:SliceObjective[]
  discoveries:string[]
  xp:number
  destination?:string
  complete:boolean
}

export const SCALE_NEXUS_VERTICAL_SLICE:SliceObjective[]=[
  {id:'vs-01',stage:'micro-lab',title:'Inspect the unknown material sample',event:'microscope.sample.inspected',required:true,completed:false},
  {id:'vs-02',stage:'micro-lab',title:'Record the repeating micro-pattern',event:'discovery.micro-pattern.recorded',required:true,completed:false},
  {id:'vs-03',stage:'living-earth',title:'Open Living Earth and locate the matching signal region',event:'living-earth.region.located',required:true,completed:false},
  {id:'vs-04',stage:'world-travel',title:'Travel to the destination while preserving player state',event:'travel.arrived',required:true,completed:false},
  {id:'vs-05',stage:'street-mission',title:'Complete the local signal relay mission',event:'streetverse.relay.completed',required:true,completed:false},
  {id:'vs-06',stage:'observatory',title:'Use HoloScope to identify the orbital source',event:'holoscope.source.identified',required:true,completed:false},
  {id:'vs-07',stage:'orbit',title:'Reach the orbital gateway and stabilize the relay',event:'living-space.relay.stabilized',required:true,completed:false},
  {id:'vs-08',stage:'return',title:'Return to Earth and complete the research thread',event:'scale-nexus.thread.completed',required:true,completed:false}
]

const ORDER:SliceStage[]=['micro-lab','living-earth','world-travel','street-mission','observatory','orbit','return']

export function createVerticalSliceState(playerId:string):VerticalSliceState{
  return {playerId,stage:'micro-lab',objectiveIndex:0,objectives:SCALE_NEXUS_VERTICAL_SLICE.map(x=>({...x})),discoveries:[],xp:0,complete:false}
}

export function applySliceEvent(state:VerticalSliceState,event:string,payload?:{discoveryId?:string;destination?:string;xp?:number}):VerticalSliceState{
  if(state.complete) return state
  const objectives=state.objectives.map(o=>o.event===event?{...o,completed:true}:o)
  const nextIndex=objectives.findIndex(o=>o.required&&!o.completed)
  const done=nextIndex===-1
  const current=done?objectives[objectives.length-1]:objectives[nextIndex]
  const stage=current.stage
  return {
    ...state,
    objectives,
    objectiveIndex:done?objectives.length:nextIndex,
    stage,
    discoveries:payload?.discoveryId?[...new Set([...state.discoveries,payload.discoveryId])]:state.discoveries,
    destination:payload?.destination??state.destination,
    xp:state.xp+(payload?.xp??0),
    complete:done
  }
}

export function stageProgress(state:VerticalSliceState){
  const completed=state.objectives.filter(x=>x.completed).length
  return {completed,total:state.objectives.length,percent:Math.round(completed/state.objectives.length*100),stageNumber:ORDER.indexOf(state.stage)+1,stageCount:ORDER.length}
}

export const VERTICAL_SLICE_INTEGRATIONS={
  microscope:'QuantumMicroscopeRuntime',
  globe:'LivingEarthGlobe',
  worldStreaming:'LivingEarthWorldStreamingDirector',
  portalLens:'QuantumConeLensRuntime',
  telescope:'QuantumTelescope/HoloScope',
  space:'LivingSpaceRegistry',
  discovery:'ScaleNexusDiscoveryDirector',
  hud:'ScaleNexusDiscoveryHUD',
  ai:'HoloGPT',
  authoritativeState:'game-server',
  engines:['unreal','unity','godot','web']
} as const

export const VERTICAL_SLICE_ACCEPTANCE=[
  'One player identity persists from microscope through Earth, world travel, observatory, orbit, and return.',
  'Inventory, discoveries, mission state, language, accessibility, Teen Takeover settings, and multiplayer party survive every handoff.',
  'Every objective advances from a validated gameplay event rather than an AI-generated claim.',
  'All physical Holo, telescope, and microscope hardware remains optional; software fallbacks complete the entire slice.',
  'The slice can be demonstrated end-to-end before additional world-scale feature expansion.'
] as const
