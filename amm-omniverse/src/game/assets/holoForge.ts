export type HoloForgeAssetKind='character'|'building'|'vehicle'|'prop'|'vegetation'|'environment'
export type HoloForgeReferencePolicy='original-generated'|'authorized-reference'|'licensed-source'
export type HoloForgeStage='requested'|'rights-cleared'|'master-ready'|'optimized'|'qa-ready'|'certified'|'rejected'

export type HoloForgeAssetRequest={
 id:string
 kind:HoloForgeAssetKind
 title:string
 worldId:string
 neighborhoodId?:string
 prompt:string
 referencePolicy:HoloForgeReferencePolicy
 provenance?:string
 target:'web-mobile'|'web-desktop'|'unity'|'unreal'|'godot'
}

export type HoloForgeBudget={
 maxTriangles:number
 maxTextureSize:1024|2048|4096
 lods:2|3
 collisionRequired:boolean
}

export type HoloForgeManifest={
 request:HoloForgeAssetRequest
 stage:HoloForgeStage
 budget:HoloForgeBudget
 outputs:{masterGlb?:string;lod0?:string;lod1?:string;lod2?:string;thumbnail?:string}
 semanticTags:string[]
 checks:{provenance:boolean;materials:boolean;collision:boolean;lods:boolean;performance:boolean;humanApproval:boolean}
}

export function budgetFor(request:HoloForgeAssetRequest):HoloForgeBudget{
 const mobile=request.target==='web-mobile'
 return {maxTriangles:mobile?(request.kind==='character'?45000:60000):120000,maxTextureSize:mobile?2048:4096,lods:3,collisionRequired:request.kind!=='vegetation'}
}

export function createHoloForgeManifest(request:HoloForgeAssetRequest):HoloForgeManifest{
 const provenance=request.referencePolicy==='original-generated'||Boolean(request.provenance?.trim())
 return {request,stage:provenance?'rights-cleared':'requested',budget:budgetFor(request),outputs:{},semanticTags:[request.kind,request.worldId,request.neighborhoodId].filter(Boolean) as string[],checks:{provenance,materials:false,collision:request.kind==='vegetation',lods:false,performance:false,humanApproval:false}}
}

export function canCertifyHoloForgeAsset(manifest:HoloForgeManifest){
 const c=manifest.checks
 return c.provenance&&c.materials&&c.collision&&c.lods&&c.performance&&c.humanApproval&&Boolean(manifest.outputs.masterGlb)
}
