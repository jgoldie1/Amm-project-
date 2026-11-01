import {AnimationClip,AnimationMixer,Bone,Mesh,Object3D,SkinnedMesh} from 'three';
import type {SkeletonAudit} from './StreetVerseDeluxeStudio';
export function inspectLoadedAvatar(root:Object3D,animations:AnimationClip[]):SkeletonAudit{
 const bones=new Set<string>(),morphTargets=new Set<string>();let meshCount=0,skinnedMeshCount=0;
 root.traverse(object=>{
  if(object instanceof Bone)bones.add(object.name);
  if(object instanceof Mesh){meshCount++;for(const name of Object.keys(object.morphTargetDictionary||{}))morphTargets.add(name)}
  if(object instanceof SkinnedMesh){skinnedMeshCount++;for(const bone of object.skeleton.bones)bones.add(bone.name)}
 });
 return {bones:[...bones],morphTargets:[...morphTargets],animations:animations.map(clip=>clip.name),meshCount,skinnedMeshCount};
}
export function createAvatarPerformance(root:Object3D,clips:AnimationClip[]){
 const mixer=new AnimationMixer(root);const actions=new Map(clips.map(clip=>[clip.name,mixer.clipAction(clip)]));
 function play(name:string,fadeSeconds=0.2){const action=actions.get(name);if(!action)return false;
  for(const [key,other] of actions){if(key!==name&&other.isRunning())other.fadeOut(fadeSeconds)}
  action.reset().fadeIn(fadeSeconds).play();return true;
 }
 function expression(names:string[],strength=1){let applied=0;root.traverse(object=>{
  if(!(object instanceof Mesh)||!object.morphTargetDictionary||!object.morphTargetInfluences)return;
  for(const name of names){const idx=object.morphTargetDictionary[name];if(idx!==undefined){object.morphTargetInfluences[idx]=Math.max(0,Math.min(1,strength));applied++}}
 });return applied}
 return {mixer,play,expression,update:(deltaSeconds:number)=>mixer.update(Math.max(0,Math.min(deltaSeconds,0.1))),stop:()=>mixer.stopAllAction()};
}
// Attach to a trusted GLTFLoader result. No remote file fetch, AI model, or proprietary retargeter required.
