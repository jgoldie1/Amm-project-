import {STREETVERSE_MESHY_CHARACTER_SLOTS} from '../data/streetVerseMeshyCharacterSlots'

export type MeshyRigFactoryItem={
  assetId:string
  filename:string
  targetHeightMeters:number
  ageLane:string
  rolePool:readonly string[]
  sourceTaskId?:string
  sourceModelUrl?:string
}

export const MESHY_RIG_FACTORY={
  provider:'meshy.ai',
  generateRoute:'/api/meshy/generate',
  rigRoute:'/api/meshy/rig',
  rigTaskRoute:'/api/meshy/rig-task',
  animationRoute:'/api/meshy/animation',
  animationTaskRoute:'/api/meshy/animation-task',
  targetFormat:'glb',
  humanoidOnly:true,
  rigAfterTextOrImageGeneration:true,
  basicWalkRunPreferred:true,
  serverSecretOnly:true,
  authenticated:true,
  publishOnlyAfterSucceeded:true,
  neverInventProviderTaskIds:true,
} as const

export const STREETVERSE_CHARACTER_RIG_QUEUE:readonly MeshyRigFactoryItem[]=[
  {assetId:'sv-james-body-base-v1',filename:'SV_HERO_JAMES_BODY_BASE_V1.glb',targetHeightMeters:1.80,ageLane:'adult',rolePool:['hero-body-base','founder-avatar-base','mission-character']},
  {assetId:'sv-female-body-base-v1',filename:'SV_BODY_FEMALE_BASE_V1.glb',targetHeightMeters:1.68,ageLane:'adult',rolePool:['female-body-base','resident-base','creator-character-base']},
  {assetId:'sv-bj-stubbs-v6',filename:'SV_HERO_BJ_STUBBS_V6.glb',targetHeightMeters:1.82,ageLane:'adult',rolePool:['hero','founder-character','mission-character']},
  ...STREETVERSE_MESHY_CHARACTER_SLOTS.map(slot=>({
    assetId:slot.id,
    filename:slot.filename,
    targetHeightMeters:slot.targetHeightMeters,
    ageLane:slot.ageLane,
    rolePool:slot.rolePool,
  }))
]

export function rigRequestBody(item:MeshyRigFactoryItem){
  if(item.sourceTaskId)return{input_task_id:item.sourceTaskId,height_meters:item.targetHeightMeters}
  if(item.sourceModelUrl)return{model_url:item.sourceModelUrl,height_meters:item.targetHeightMeters}
  throw new Error('meshy-rig-source-required')
}

export function rigOutputReady(task:{status?:string;riggedGlb?:string|null}){
  return String(task.status||'').toUpperCase()==='SUCCEEDED'&&Boolean(task.riggedGlb)
}

export function characterPublishPath(item:MeshyRigFactoryItem){
  return `/tryamm-assets/meshy/characters/${item.filename}`
}
