import * as THREE from 'three'
/**
 * Three.js / WebGL analogue to Unity Animation Rigging's procedural reach targets.
 * Only bind to ACTUAL skinned GLBs with named hand/forearm/upper-arm bones.
 * This deliberately does not fake IK on unrigged BJ V12 or Unity import support.
 */
export type InteractionName='reach'|'wave'|'hold-rail'|'open-door'|'carry-parcel'
export type RigInspection={
 valid:boolean;mode:'skinned-rig'|'missing-skeleton'|'incomplete-rig';skinnedMeshCount:number;
 bones:Record<'leftHand'|'rightHand'|'leftForeArm'|'rightForeArm'|'leftUpperArm'|'rightUpperArm',THREE.Bone|null>;
 missing:string[];proceduralIKCertified:false
}
const NAMES={
 leftHand:['LeftHand','mixamorigLeftHand','hand_l','left_hand','Hand.L'],
 rightHand:['RightHand','mixamorigRightHand','hand_r','right_hand','Hand.R'],
 leftForeArm:['LeftForeArm','mixamorigLeftForeArm','lowerarm_l','left_forearm','Forearm.L'],
 rightForeArm:['RightForeArm','mixamorigRightForeArm','lowerarm_r','right_forearm','Forearm.R'],
 leftUpperArm:['LeftArm','mixamorigLeftArm','upperarm_l','left_upperarm','UpperArm.L'],
 rightUpperArm:['RightArm','mixamorigRightArm','upperarm_r','right_upperarm','UpperArm.R'],
} satisfies Record<string,readonly string[]>
const ordered=Object.keys(NAMES) as Array<keyof typeof NAMES>
export function inspectStreetVerseInteractionRig(root:THREE.Object3D):RigInspection{
 const meshes:THREE.SkinnedMesh[]=[]
 root.traverse(o=>{if((o as THREE.SkinnedMesh).isSkinnedMesh)meshes.push(o as THREE.SkinnedMesh)})
 const bones=Object.fromEntries(ordered.map(name=>[name,null])) as RigInspection['bones']
 if(!meshes.length)return {valid:false,mode:'missing-skeleton',skinnedMeshCount:0,bones,missing:[...ordered],proceduralIKCertified:false}
 const found=meshes.flatMap(mesh=>mesh.skeleton?.bones||[])
 for(const key of ordered){
  const aliases=NAMES[key].map(x=>x.toLowerCase())
  bones[key]=found.find(bone=>aliases.includes(bone.name.toLowerCase()))||null
 }
 const missing=ordered.filter(k=>!bones[k])
 return {valid:missing.length===0,mode:missing.length?'incomplete-rig':'skinned-rig',skinnedMeshCount:meshes.length,bones,missing,proceduralIKCertified:false}
}
export type HandPlan={accepted:boolean;reason:string;action:InteractionName;hand:'left'|'right';target:THREE.Vector3|null;maxReachMeters:number;requiresValidatedArmRig:true;actualAnimationPlayed:false}
const ACTIONS:readonly InteractionName[]=['reach','wave','hold-rail','open-door','carry-parcel']
export function planProceduralHandInteraction(root:THREE.Object3D,action:InteractionName,hand:'left'|'right',worldTarget:THREE.Vector3):HandPlan{
 const inspection=inspectStreetVerseInteractionRig(root)
 const base={action,hand,target:null,maxReachMeters:0.85,requiresValidatedArmRig:true as const,actualAnimationPlayed:false as const}
 if(!ACTIONS.includes(action)||!['left','right'].includes(hand))return {...base,accepted:false,reason:'Unsupported interaction'}
 if(!inspection.valid)return {...base,accepted:false,reason:'Skinned arm/hand bones missing: '+inspection.missing.join(', ')}
 if(![worldTarget.x,worldTarget.y,worldTarget.z].every(Number.isFinite))return {...base,accepted:false,reason:'Invalid target'}
 const bone=inspection.bones[hand==='left'?'leftHand':'rightHand']!
 root.updateMatrixWorld(true);const origin=bone.getWorldPosition(new THREE.Vector3())
 const offset=worldTarget.clone().sub(origin)
 if(offset.length()>base.maxReachMeters)return {...base,accepted:false,reason:'Target beyond comfortable reach'}
 return {...base,accepted:true,reason:'Preview target validated; two-bone IK solver, animation mixer and real device tests still required.',target:worldTarget.clone()}
}
/** Validated target is a nonmutating preview; never directly overwrites clips or ragdoll. */
export function previewProceduralHandTarget(root:THREE.Object3D,action:InteractionName,hand:'left'|'right',target:THREE.Vector3){
 const p=planProceduralHandInteraction(root,action,hand,target)
 return {ok:p.accepted,reason:p.reason,requestedAction:action,rigVerified:p.accepted,ikApplied:false,animationPlayed:false,productionCertified:false}
}
