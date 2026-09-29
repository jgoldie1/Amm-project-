export type AssetRights='reference-only'|'commercial-licensed'|'owner-authorized'|'contributor-authorized'|'tryamm-created'|'unknown'
export type AssetKind='photo'|'video'|'floor-plan'|'blueprint'|'scan'|'map-data'|'3d-model'|'audio'|'document'
export type AssetView='front'|'rear'|'left'|'right'|'roof'|'interior'|'site'|'unknown'

export interface ReconstructionAsset {
 id:string; buildingPassportId:string; kind:AssetKind; view:AssetView; era?:string;
 rights:AssetRights; source:string; confidence:'verified'|'probable'|'unverified';
 containsCurrentPrivateInterior?:boolean; containsSensitiveInfrastructure?:boolean;
}

export interface ContinuityPassport {
 productionId:string; locationId:string; era:string; characters:string[];
 wardrobe:Record<string,string>; vehicles:string[]; weather:string; timeOfDay:string;
 visualRules:string[]; cameraRules:string[];
}

export interface ClipManifest {
 id:string; productionId:string; intendedOrder?:number; durationSeconds?:number;
 locationId:string; opening:string; ending:string; dialogueCue?:string;
 cameraDirection?:string; characters:string[]; continuityTags:string[];
}

export const RECONSTRUCTION_INTERACTIONS=[
 'door','window','stairs','elevator','sink','faucet','toilet','drain','light',
 'appliance','parking-space','storefront','leaseable-space'
] as const

export function canPublishAsset(asset:ReconstructionAsset){
 if(asset.rights==='unknown'||asset.rights==='reference-only')return false
 if(asset.containsCurrentPrivateInterior||asset.containsSensitiveInfrastructure)return false
 return true
}

export function reconstructionCoverage(assets:ReconstructionAsset[]){
 const views=['front','rear','left','right','roof','site'] as const
 return Object.fromEntries(views.map(view=>[view,assets.some(a=>a.view===view&&canPublishAsset(a))]))
}

export function suggestClipOrder(clips:ClipManifest[]){
 const explicit=[...clips].filter(c=>Number.isFinite(c.intendedOrder)).sort((a,b)=>(a.intendedOrder??999)-(b.intendedOrder??999))
 const unresolved=clips.filter(c=>!Number.isFinite(c.intendedOrder))
 return [...explicit,...unresolved]
}

export const CIRCLE_PARK_CONTINUITY:ContinuityPassport={
 productionId:'circle-park-showcase-v1',
 locationId:'chi-circle-park-1111-laflin',
 era:'present-to-resident-memory',
 characters:['James / Meet the Stubbs cast as separately approved'],
 wardrobe:{James:'lock from approved character reference before generation'},
 vehicles:[],
 weather:'lock across adjoining exterior clips unless story transition requires change',
 timeOfDay:'lock across adjoining clips',
 visualRules:['preserve building identity between shots','do not invent verified historical details','clearly distinguish reconstruction from sourced fact'],
 cameraRules:['each clip opening must match prior clip handoff','record camera direction and ending frame','cinematic master may exceed mobile game LOD']
}
