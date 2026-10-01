export type MeshyAssetKind='character'|'vehicle'|'prop'|'building'|'furniture'|'wearable'|'environment'
export type MeshyJob={id:string;kind:MeshyAssetKind;prompt:string;status:'draft'|'submitted'|'polling'|'ready'|'failed';providerTaskId?:string;glbUrl?:string}
export const MESHY_TOOLCHAIN={serverSideOnly:true,secretEnv:'MESHY_API_KEY',neverExposeKeyToClient:true,neverInventTaskIds:true,pollUntilTerminal:true,downloadGlbWhenReady:true,publishOnlyAfterValidation:true,pbrPreferred:true,gameReadyValidation:true,generateRefineDownloadPublish:true} as const
export function makeMeshyJob(kind:MeshyAssetKind,prompt:string):MeshyJob{if(!prompt.trim())throw new Error('meshy-prompt-required');return{id:crypto.randomUUID(),kind,prompt:prompt.trim(),status:'draft'}}
export function canPublishMeshyJob(j:MeshyJob){return j.status==='ready'&&Boolean(j.providerTaskId&&j.glbUrl)}
