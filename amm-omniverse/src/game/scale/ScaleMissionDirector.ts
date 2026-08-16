export type ScaleLayer='micro'|'earth'|'space'
export type EngineTarget='unreal'|'unity'|'godot'|'webxr'

export interface ScaleSceneRef {
  layer:ScaleLayer
  sceneId:string
  engineTargets:EngineTarget[]
  entryPoint:string
}

export interface ScaleMissionStep {
  id:string
  layer:ScaleLayer
  scene:ScaleSceneRef
  objective:string
  discoveryTag?:string
  rewardXp?:number
  teenSafe:boolean
}

export interface ScaleMission {
  id:string
  title:string
  summary:string
  steps:ScaleMissionStep[]
  reward:{xp:number;discoveries:string[];holoCredits?:number}
  requires:string[]
  teenSafe:boolean
}

export interface ScalePlayerProgress {
  playerId:string
  missionId:string
  completedStepIds:string[]
  discoveries:string[]
  xp:number
  holoCredits:number
}

export const SCALE_MISSIONS:ScaleMission[]=[
  {
    id:'dust-to-stars',
    title:'Dust to Stars',
    summary:'Trace one material clue from a microscopic sample to an Earth lab and then to an orbital observation.',
    requires:[],teenSafe:true,
    steps:[
      {id:'micro-scan',layer:'micro',scene:{layer:'micro',sceneId:'micro-material-lab',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'sample-bench'},objective:'Inspect the sample and identify its simulated structural pattern.',discoveryTag:'micro-pattern-alpha',rewardXp:120,teenSafe:true},
      {id:'earth-verify',layer:'earth',scene:{layer:'earth',sceneId:'living-earth-science-hub',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'materials-lab'},objective:'Compare the pattern with Earth-side educational reference data.',discoveryTag:'earth-reference-match',rewardXp:180,teenSafe:true},
      {id:'space-observe',layer:'space',scene:{layer:'space',sceneId:'earth-orbit-observatory',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'holoscope-deck'},objective:'Use the HoloScope to complete the orbital observation.',discoveryTag:'orbital-correlation',rewardXp:250,teenSafe:true}
    ],
    reward:{xp:700,discoveries:['dust-to-stars-complete']}
  },
  {
    id:'signal-across-scale',
    title:'Signal Across Scale',
    summary:'Follow a fictional signal from a chip-scale simulation through a city relay and into space.',
    requires:['micro-pattern-alpha'],teenSafe:true,
    steps:[
      {id:'chip-trace',layer:'micro',scene:{layer:'micro',sceneId:'micro-chip-world',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'signal-grid'},objective:'Trace the simulated signal through Chip World.',discoveryTag:'chip-signal-key',rewardXp:150,teenSafe:true},
      {id:'city-relay',layer:'earth',scene:{layer:'earth',sceneId:'streetverse-holo-heights',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'relay-rooftop'},objective:'Find the matching relay pattern in Holo Heights.',discoveryTag:'city-relay-key',rewardXp:220,teenSafe:true},
      {id:'orbital-relay',layer:'space',scene:{layer:'space',sceneId:'orbital-gateway',engineTargets:['unreal','unity','godot','webxr'],entryPoint:'communications-ring'},objective:'Complete the fictional orbital relay puzzle.',discoveryTag:'orbital-signal-key',rewardXp:300,teenSafe:true}
    ],
    reward:{xp:850,discoveries:['signal-across-scale-complete']}
  }
]

export function nextMissionStep(mission:ScaleMission,progress:ScalePlayerProgress){
  return mission.steps.find(step=>!progress.completedStepIds.includes(step.id))??null
}

export function completeMissionStep(mission:ScaleMission,progress:ScalePlayerProgress,stepId:string){
  const step=mission.steps.find(s=>s.id===stepId)
  if(!step||progress.completedStepIds.includes(stepId)) return progress
  const completed=[...progress.completedStepIds,stepId]
  const discoveries=step.discoveryTag&&!progress.discoveries.includes(step.discoveryTag)
    ? [...progress.discoveries,step.discoveryTag]
    : progress.discoveries
  const allDone=mission.steps.every(s=>completed.includes(s.id))
  return {
    ...progress,
    completedStepIds:completed,
    discoveries:allDone?[...new Set([...discoveries,...mission.reward.discoveries])]:discoveries,
    xp:progress.xp+(step.rewardXp??0)+(allDone?mission.reward.xp:0),
    holoCredits:progress.holoCredits+(allDone?(mission.reward.holoCredits??0):0)
  }
}

export interface ScaleHandoff {
  from:ScaleLayer
  to:ScaleLayer
  sceneId:string
  preserve:['player-id','avatar','xp','inventory','discoveries','missions','accessibility','language','teen-safety','party']
  transition:'microscope-zoom'|'globe-zoom'|'telescope-zoom'|'holo-portal'
  holoGptBriefing:boolean
}

export function buildScaleHandoff(from:ScaleLayer,step:ScaleMissionStep):ScaleHandoff{
  const transition=from==='micro'&&step.layer==='earth'?'microscope-zoom'
    :from==='earth'&&step.layer==='space'?'telescope-zoom'
    :from==='space'&&step.layer==='earth'?'globe-zoom'
    :'holo-portal'
  return {from,to:step.layer,sceneId:step.scene.sceneId,preserve:['player-id','avatar','xp','inventory','discoveries','missions','accessibility','language','teen-safety','party'],transition,holoGptBriefing:true}
}

export const SCALE_GAMEPLAY_RULES={
  authoritativeProgression:true,
  aiRole:'HoloGPT may explain, hint, translate, and personalize presentation; it cannot award progression without validated gameplay events.',
  hardwareOptional:true,
  engines:['unreal','unity','godot','webxr'] as EngineTarget[]
} as const
