export type MeshyGenerationKind='text-to-3d'|'image-to-3d'|'multi-image-to-3d'
export type MeshyGenerationRequest={kind:MeshyGenerationKind;prompt?:string;imageUrl?:string;imageUrls?:string[];assetId:string}
export type MeshyTaskSnapshot={id:string;status:string;progress:number;glb?:string|null}
export const MESHY_ORCHESTRATOR={generateRoute:'/api/meshy/generate',taskRoute:'/api/meshy/task',authenticated:true,serverSecretOnly:true,pollIntervalMs:5000,maxPolls:120,publishOnlyCompletedGlb:true} as const
export function generationBody(r:MeshyGenerationRequest){if(r.kind==='text-to-3d')return{type:r.kind,prompt:r.prompt};if(r.kind==='image-to-3d')return{type:r.kind,image_url:r.imageUrl};return{type:r.kind,image_urls:r.imageUrls}}
export function pollUrl(kind:MeshyGenerationKind,id:string){return `/api/meshy/task?type=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`}
export function isMeshyReady(t:MeshyTaskSnapshot){return ['SUCCEEDED','SUCCESS','COMPLETED'].includes(String(t.status).toUpperCase())&&Boolean(t.glb)}
export const STREETVERSE_MESHY_QUEUE=[
 {assetId:'sv-fire-engine-global-v1',kind:'text-to-3d',prompt:'game-ready realistic modern fire engine, PBR, optimized open-world vehicle, ladder, hose and equipment compartments, clean topology, no manufacturer trademarks, neutral identity panels for runtime regional flags'},
 {assetId:'sv-bj-stubbs-v6',kind:'image-to-3d',prompt:'BJ character uses approved reference-image workflow; do not fabricate likeness from text'},
 {assetId:'sv-circle-park-building-kit-v1',kind:'text-to-3d',prompt:'game-ready Chicago neighborhood modular brick residential building kit, PBR, optimized real-time geometry, doors windows stoops storefront-compatible ground floor'}
] as const
