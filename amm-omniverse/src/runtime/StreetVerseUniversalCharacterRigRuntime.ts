import * as THREE from 'three'

/** Reusable rig auditor and injury animation layer.
 * Important: mappings and blending cannot manufacture missing bone weights, topology,
 * muscles, garments, physics, or facial blendshapes. Fail the production-quality gate.
 */
export type RigQuality='production'|'prototype'|'incomplete'
export type InjuryMotion='neutral'|'stagger'|'guard'|'limp'|'recover'
export type RigAudit={
 characterId:string;quality:RigQuality;boneCount:number;skinnedMeshes:number;animationCount:number;
 mappedBones:Readonly<Record<string,string>>;missingRequired:readonly string[];
 skinWeightErrors:number;zeroWeightVertices:number;
 warnings:readonly string[];
}
const BONES:Record<string,readonly RegExp[]>={
 hips:[/^hips?$/i,/pelvis/i,/mixamorig.?hips/i],
 spine:[/^spine(1|01)?$/i,/spine_?01/i,/abdomen/i],
 chest:[/^spine(2|02)$/i,/chest/i,/upper.?spine/i],
 neck:[/neck/i],head:[/^head/i],
 leftUpperArm:[/left.?upper.?arm/i,/leftarm/i,/upperarm.?l/i],
 rightUpperArm:[/right.?upper.?arm/i,/rightarm/i,/upperarm.?r/i],
 leftForeArm:[/left.?fore.?arm/i,/left.?lower.?arm/i,/forearm.?l/i],
 rightForeArm:[/right.?fore.?arm/i,/right.?lower.?arm/i,/forearm.?r/i],
 leftHand:[/left.?hand/i,/hand.?l$/i],
 rightHand:[/right.?hand/i,/hand.?r$/i],
 leftUpperLeg:[/left.?up.?leg/i,/left.?thigh/i,/thigh.?l/i],
 rightUpperLeg:[/right.?up.?leg/i,/right.?thigh/i,/thigh.?r/i],
 leftLowerLeg:[/left.?leg(?!.*up)/i,/left.?calf/i,/left.?shin/i,/calf.?l/i],
 rightLowerLeg:[/right.?leg(?!.*up)/i,/right.?calf/i,/right.?shin/i,/calf.?r/i],
 leftFoot:[/left.?foot/i,/foot.?l$/i],
 rightFoot:[/right.?foot/i,/foot.?r$/i],
}
const REQUIRED=['hips','spine','chest','head','leftUpperArm','rightUpperArm','leftForeArm','rightForeArm','leftHand','rightHand','leftUpperLeg','rightUpperLeg','leftLowerLeg','rightLowerLeg','leftFoot','rightFoot'] as const
const MOTIONS:Record<InjuryMotion,RegExp[]>={neutral:[/idle/i,/stand/i],stagger:[/stagger/i,/hit.?react/i,/impact/i],guard:[/guard/i,/hurt/i,/flinch/i],limp:[/limp/i,/injur.?walk/i],recover:[/recover/i,/stand.?up/i]}
function mappedSkeleton(root:THREE.Object3D){
 const all:THREE.Bone[]=[]
 const ids=new Set<string>()
 root.traverse(obj=>{if(obj instanceof THREE.SkinnedMesh){for(const bone of obj.skeleton.bones){if(!ids.has(bone.uuid)){ids.add(bone.uuid);all.push(bone)}}}})
 const mapped:Record<string,THREE.Bone>={}
 for(const [key,patterns] of Object.entries(BONES)){
  const bone=all.find(candidate=>patterns.some(pattern=>pattern.test(candidate.name)))
  if(bone)mapped[key]=bone
 }
 return {all,mapped}
}
export function auditStreetVerseRig(characterId:string,root:THREE.Object3D,clips:readonly THREE.AnimationClip[]):RigAudit{
 const {all,mapped}=mappedSkeleton(root)
 let skinnedMeshes=0,skinWeightErrors=0,zeroWeightVertices=0
 const warnings:string[]=[]
 root.traverse(obj=>{
  if(!(obj instanceof THREE.SkinnedMesh))return
  skinnedMeshes++
  const weights=obj.geometry.getAttribute('skinWeight')
  const indices=obj.geometry.getAttribute('skinIndex')
  if(!weights||!indices){skinWeightErrors++;return}
  // Validate each sampled vertex: finite weights and normalized sums.
  const sample=Math.min(weights.count,1200)
  for(let i=0;i<sample;i++){
   let total=0
   for(let k=0;k<Math.min(weights.itemSize,4);k++){
    const v=weights.getComponent(i,k)
    if(!Number.isFinite(v)||v<0||v>1){skinWeightErrors++;continue}
    total+=v
   }
   if(total<.01)zeroWeightVertices++
   else if(Math.abs(total-1)>.08)skinWeightErrors++
  }
 })
 const missingRequired=REQUIRED.filter(key=>!mapped[key])
 if(missingRequired.length)warnings.push('Missing anatomical bone mappings: '+missingRequired.join(', '))
 if(all.length<65)warnings.push('Below preferred 65-joint hero target; this alone does not establish quality')
 if(skinWeightErrors||zeroWeightVertices)warnings.push('Skin-weight audit needs rig-authoring repair')
 if(!clips.some(x=>/walk/i.test(x.name)))warnings.push('No walking clip')
 if(!clips.some(x=>/idle/i.test(x.name)))warnings.push('No idle clip')
 const production=skinnedMeshes>0&&missingRequired.length===0&&skinWeightErrors===0&&zeroWeightVertices===0&&all.length>=65
 const prototype=skinnedMeshes>0&&all.length>=16&&missingRequired.length<=6
 return {characterId,quality:production?'production':prototype?'prototype':'incomplete',boneCount:all.length,skinnedMeshes,animationCount:clips.length,mappedBones:Object.fromEntries(Object.entries(mapped).map(([name,b])=>[name,b.name])),missingRequired,skinWeightErrors,zeroWeightVertices,warnings}
}
export function createUniversalInjuryAnimationController(characterId:string,root:THREE.Object3D,clips:readonly THREE.AnimationClip[]){
 const audit=auditStreetVerseRig(characterId,root,clips)
 const {mapped}=mappedSkeleton(root)
 const mixer=new THREE.AnimationMixer(root)
 const actions:Partial<Record<InjuryMotion,THREE.AnimationAction>>={}
 for(const [motion,patterns] of Object.entries(MOTIONS) as [InjuryMotion,RegExp[]][]){
  const clip=clips.find(c=>patterns.some(re=>re.test(c.name)))
  if(clip){actions[motion]=mixer.clipAction(clip);actions[motion]!.enabled=true;actions[motion]!.setEffectiveWeight(0)}
 }
 // This controller owns only reaction clips. Idle/walk remain with the character's existing mixer.
 let current:InjuryMotion='neutral',weight=0,disposed=false
 const active=new Set<THREE.AnimationAction>()
 const setPose=(pose:InjuryMotion,degree=1)=>{
  if(disposed)return
  current=pose;weight=THREE.MathUtils.clamp(degree,0,1)
  const next=actions[pose]
  for(const action of active)if(action!==next){action.fadeOut(.20);active.delete(action)}
  if(next&&pose!=='neutral'){
   next.reset();next.play();next.setEffectiveWeight(weight);next.fadeIn(.20);active.add(next)
  }
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-character-rig-motion',{detail:{characterId,pose,weight,hasAuthoredClip:Boolean(next),quality:audit.quality,fictional:true}}))
 }
 // Separate reaction clips can be authored in Blender; no synthetic skinning repair is claimed.
 return {
  audit,setPose,
  tick(deltaSeconds:number){
   if(disposed)return
   mixer.update(Math.min(.1,Math.max(0,deltaSeconds)))
   // Without an authored reaction clip, only mild mapped-neck/head tilt is used.
   // Any physically accurate injury animation still requires corrective rigging and authoring.
   if(!actions[current]){
    const head=mapped.head
    if(head){const desired=current==='stagger'?.06:current==='guard'?-.05:current==='limp'?.03:0
     head.rotation.z=THREE.MathUtils.damp(head.rotation.z,desired*weight,8,Math.min(.1,Math.max(0,deltaSeconds)))}
   }
  },
  dispose(){disposed=true;mixer.stopAllAction();mixer.uncacheRoot(root);active.clear()},
 }
}
export const STREETVERSE_CHARACTER_RIG_CONTRACT={
 requiredBoneRoles:REQUIRED,preferredHeroJointRange:[65,100] as const,
 requiredMotions:['idle','walk','run','sit','enter-vehicle','exit-vehicle','stagger','guard','limp','recover'] as const,
 requireRigAuditBeforeProduction:true,requireReviewedSkinWeights:true,requireClothingFitReview:true,
 sharedMedicalEvents:true,myceliumLivingWorldLink:true,placeholderCannotPassCertification:true,
} as const
