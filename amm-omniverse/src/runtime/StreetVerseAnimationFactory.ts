import * as THREE from 'three'

/** Reusable Animation Factory: every imported GLB clip is indexed, not just a fixed eight-clip list. */
export type AnimationIntent='idle'|'walk'|'run'|'talk'|'listen'|'wave'|'sit'|'drive'|'enter'|'exit'|'dance'|'gesture'|'injured'|'custom'
export type AnimationRecord={name:string;duration:number;intent:AnimationIntent}
const classify=(name:string):AnimationIntent=>{
 const n=name.toLowerCase()
 if(/walk|stroll|stride/.test(n))return 'walk'
 if(/run|sprint|jog/.test(n))return 'run'
 if(/talk|speak|dialog|conversation/.test(n))return 'talk'
 if(/listen|hear/.test(n))return 'listen'
 if(/wave|greet/.test(n))return 'wave'
 if(/sit|seated/.test(n))return 'sit'
 if(/drive|steer/.test(n))return 'drive'
 if(/enter|mount/.test(n))return 'enter'
 if(/exit|dismount/.test(n))return 'exit'
 if(/dance/.test(n))return 'dance'
 if(/injur|limp|hurt/.test(n))return 'injured'
 if(/idle|breath|stand|rest/.test(n))return 'idle'
 if(/gesture|point|nod|thumb|hand/.test(n))return 'gesture'
 return 'custom'
}
export function createStreetVerseAnimationFactory(root:THREE.Object3D,clips:readonly THREE.AnimationClip[]){
 const mixer=new THREE.AnimationMixer(root)
 const catalog:AnimationRecord[]=clips.map(clip=>({name:clip.name,duration:clip.duration,intent:classify(clip.name)}))
 const byName=new Map<string,THREE.AnimationClip>()
 const byIntent=new Map<AnimationIntent,THREE.AnimationClip[]>()
 for(const clip of clips){
  byName.set(clip.name.toLowerCase(),clip)
  const intent=classify(clip.name)
  byIntent.set(intent,[...(byIntent.get(intent)||[]),clip])
 }
 let active:THREE.AnimationAction|null=null
 let current:string|null=null
 const play=(intentOrName:AnimationIntent|string,options:{fadeSeconds?:number;variant?:number;once?:boolean}={})=>{
  const variants=byIntent.get(intentOrName as AnimationIntent)
  const clip=variants?.length?variants[Math.abs(Math.trunc(options.variant||0))%variants.length]:byName.get(intentOrName.toLowerCase())
  if(!clip)return false
  if(current===clip.name&&active?.isRunning())return true
  const next=mixer.clipAction(clip)
  next.reset()
  next.setLoop(options.once?THREE.LoopOnce:THREE.LoopRepeat,options.once?1:Infinity)
  next.clampWhenFinished=Boolean(options.once)
  next.enabled=true
  next.setEffectiveWeight(1)
  if(active&&active!==next)active.fadeOut(Math.max(0,options.fadeSeconds??0.2))
  next.fadeIn(Math.max(0,options.fadeSeconds??0.2)).play()
  active=next;current=clip.name
  return true
 }
 return {mixer,catalog,play,has:(intent:AnimationIntent)=>Boolean(byIntent.get(intent)?.length),update:(delta:number)=>mixer.update(Math.max(0,Math.min(delta,0.05))),stop:()=>{mixer.stopAllAction();active=null;current=null},dispose:()=>{mixer.stopAllAction();mixer.uncacheRoot(root)},get current(){return current}}
}
