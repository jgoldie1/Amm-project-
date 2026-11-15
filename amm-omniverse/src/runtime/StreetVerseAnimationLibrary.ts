import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import type {AnimationRecord} from './StreetVerseAnimationFactory'

/** A manifest records the actual sources of the proposed 87-clip library; no missing clip is invented. */
export type StreetVerseAnimationSource={id:string;url:string;expectedClips?:number;license?:string;rig?:string}
export type AnimationLibraryResult={clips:THREE.AnimationClip[];catalog:AnimationRecord[];failures:{id:string;reason:string}[]}
export const STREETVERSE_ANIMATION_LIBRARY_TARGET=87
export function validateAnimationSources(sources:readonly StreetVerseAnimationSource[]){
 const ids=new Set<string>()
 for(const source of sources){
  if(!source.id||ids.has(source.id))throw new Error('Animation source ID missing or duplicated')
  if(!source.url.startsWith('/assets/animations/'))throw new Error('Animation source must use a local, reviewed asset path')
  if(source.url.includes('..'))throw new Error('Animation source path traversal blocked')
  if(source.expectedClips!==undefined&&(!Number.isSafeInteger(source.expectedClips)||source.expectedClips<1))throw new Error('Invalid expected clip count')
  ids.add(source.id)
 }
}
export async function loadStreetVerseAnimationLibrary(sources:readonly StreetVerseAnimationSource[],loader=new GLTFLoader()):Promise<AnimationLibraryResult>{
 validateAnimationSources(sources)
 const clips:THREE.AnimationClip[]=[]
 const failures:AnimationLibraryResult['failures']=[]
 for(const source of sources){
  try{
   const gltf=await loader.loadAsync(source.url)
   if(!gltf.animations.length)throw new Error('No animation clips in source')
   if(source.expectedClips!==undefined&&gltf.animations.length!==source.expectedClips)throw new Error('Clip count differs from manifest')
   for(const clip of gltf.animations)clips.push(clip.clone())
  }catch(error){failures.push({id:source.id,reason:error instanceof Error?error.message:String(error)})}
 }
 return {clips,catalog:clips.map(clip=>({name:clip.name,duration:clip.duration,intent:'custom'})),failures}
}
/** External skeletons must be retargeted before their tracks can be used on BJ. */
export function requireCompatibleAnimationTracks(clips:readonly THREE.AnimationClip[],rigNodeNames:ReadonlySet<string>){
 const accepted:THREE.AnimationClip[]=[]
 const rejected:{clip:string;missingNodes:string[]}[]=[]
 for(const clip of clips){
  const missingNodes=[...new Set(clip.tracks.map(track=>track.name.split('.')[0]).filter(node=>!rigNodeNames.has(node)))]
  if(missingNodes.length)rejected.push({clip:clip.name,missingNodes})
  else accepted.push(clip)
 }
 return {accepted,rejected}
}
