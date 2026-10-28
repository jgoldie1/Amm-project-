import * as THREE from 'three'

/** Physical model validation before placing imported meshes in a playable scene. */
export type AssetFitProfile='door'|'human'|'vehicle'|'appliance'|'fixture'|'building'
const TARGET_METERS:Record<AssetFitProfile,number>={door:2.05,human:1.8,vehicle:4.5,appliance:1,fixture:.65,building:12}
export type AssetFitResult={ok:boolean;scale:number;reason?:string;originalMeters?:[number,number,number];fittedMeters?:[number,number,number]}
/**
 * GLB units are assumed meters; importer proposes a size and NEVER silently
 * commits it. Building footprints and specific car dimensions require
 * explicit, reviewed width/depth measurements rather than auto fitting.
 */
export function suggestAssetFit(model:THREE.Object3D,profile:AssetFitProfile,options:{targetMeters?:number;minScale?:number;maxScale?:number}={}):AssetFitResult{
 model.updateWorldMatrix(true,true)
 const bounds=new THREE.Box3().setFromObject(model)
 if(bounds.isEmpty())return {ok:false,scale:1,reason:'Model has no measurable geometry'}
 const size=bounds.getSize(new THREE.Vector3())
 const dimensions:[number,number,number]=[size.x,size.y,size.z]
 if(dimensions.some(n=>!Number.isFinite(n)||n<=0.001||n>1e5))return {ok:false,scale:1,reason:'Implausible or degenerate bounds',originalMeters:dimensions}
 const measured=profile==='vehicle'?Math.max(size.x,size.z):size.y
 const target=options.targetMeters??TARGET_METERS[profile]
 if(!Number.isFinite(target)||target<=0)return {ok:false,scale:1,reason:'Invalid target dimension'}
 const scale=target/measured
 const min=options.minScale??0.01,max=options.maxScale??100
 if(!Number.isFinite(scale)||scale<min||scale>max)return {ok:false,scale,reason:'Scale outside review limits',originalMeters:dimensions}
 return {ok:true,scale,originalMeters:dimensions,fittedMeters:dimensions.map(x=>Number((x*scale).toFixed(3))) as [number,number,number]}
}
export function applyReviewedAssetFit(model:THREE.Object3D,result:AssetFitResult,approved:boolean){
 if(!approved||!result.ok)throw new Error('Asset dimensions must be reviewed before placement')
 model.scale.multiplyScalar(result.scale)
}
