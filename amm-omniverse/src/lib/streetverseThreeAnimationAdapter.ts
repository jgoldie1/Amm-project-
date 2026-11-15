import * as THREE from 'three'
import {inspectAnimations,StreetVerseAnimationFactory,type AnimationRole,type PlaybackRequest} from './streetverseAnimationFactory'

/** Attach this adapter to a GLTFLoader result after its GLB is actually loaded. */
export function createStreetVerseThreeAnimationController(
 characterId:string,
 gltf:{scene:THREE.Group;animations:THREE.AnimationClip[]},
 onStatus:(status:string)=>void=()=>{}
){
 const mixer=new THREE.AnimationMixer(gltf.scene)
 const clips=new Map(gltf.animations.map(clip=>[clip.name,clip]))
 const actions=new Map<string,THREE.AnimationAction>()
 let active:THREE.AnimationAction|undefined
 const adapter={
  play({clip,fadeSeconds,loop}:PlaybackRequest){
   const source=clips.get(clip)
   if(!source){onStatus('Missing GLB clip: '+clip);return}
   let action=actions.get(clip)
   if(!action){action=mixer.clipAction(source);actions.set(clip,action)}
   action.setLoop(loop?THREE.LoopRepeat:THREE.LoopOnce,loop?Infinity:1)
   action.clampWhenFinished=!loop
   if(active!==action){active?.fadeOut(fadeSeconds);action.reset().fadeIn(fadeSeconds).play();active=action}
  },
  stop(){mixer.stopAllAction();active=undefined}
 }
 const factory=new StreetVerseAnimationFactory(adapter)
 const joints=new Set<string>()
 gltf.scene.traverse(node=>{if((node as THREE.Bone).isBone)joints.add(node.uuid)})
 const manifest=factory.register(inspectAnimations(characterId,'loaded-gltf',gltf.animations.map(clip=>({name:clip.name,duration:clip.duration})),joints.size))
 const play=(role:AnimationRole)=>{const result=factory.play(characterId,role);if(!result.ok)onStatus(result.reason||'Animation unavailable');return result}
 return {
  manifest,play,
  onRPEvent:(event:Parameters<typeof factory.onRPEvent>[1])=>{const result=factory.onRPEvent(characterId,event);if(!result.ok)onStatus(result.reason||'Animation unavailable');return result},
  update:(seconds:number)=>{if(Number.isFinite(seconds)&&seconds>0)mixer.update(Math.min(seconds,0.1))},
  dispose:()=>{adapter.stop();mixer.uncacheRoot(gltf.scene);actions.clear()}
 }
}
