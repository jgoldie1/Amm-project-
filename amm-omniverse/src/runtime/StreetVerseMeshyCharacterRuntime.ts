import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  STREETVERSE_MESHY_CHARACTER_SLOTS,
  streetVerseMeshyCharacterUrl,
  type StreetVerseMeshyCharacterSlot,
} from '../data/streetVerseMeshyCharacterSlots'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'
import {resolvePublishedMeshyAsset,resetPublishedMeshyManifest} from './StreetVerseMeshyAssetManifest'
import {TRYAMM_NATIVE_RUNTIME_ASSETS} from '../data/TryammNativeRuntimeAssetCatalog'

const loader=new GLTFLoader()
const availability=new Map<string,Promise<boolean>>()
const NATIVE_RESIDENT_URLS=[TRYAMM_NATIVE_RUNTIME_ASSETS.residentA.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentB.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentC.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentD.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentE.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentF.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentG.url,TRYAMM_NATIVE_RUNTIME_ASSETS.residentH.url] as const

async function assetExists(url:string){
  if(!availability.has(url)){
    availability.set(url,(async()=>{
      try{
        const response=await fetch(url,{method:'HEAD',cache:'no-store'})
        const contentType=(response.headers.get('content-type')||'').toLowerCase()
        return response.ok&&!contentType.includes('text/html')&&!contentType.includes('application/xhtml+xml')
      }catch{return false}
    })())
  }
  return availability.get(url)!
}

export type StreetVerseMeshyLoadedCharacter={
  slot:StreetVerseMeshyCharacterSlot
  object:THREE.Object3D
  sourceUrl:string
  mixer:THREE.AnimationMixer|null
  clips:THREE.AnimationClip[]
  tick:(nowMs:number,state:{moving:boolean;running?:boolean})=>void
  dispose:()=>void
}

export async function loadStreetVerseMeshyCharacter(slotId:string):Promise<StreetVerseMeshyLoadedCharacter|null>{
  const slot=STREETVERSE_MESHY_CHARACTER_SLOTS.find(x=>x.id===slotId)
  if(!slot)return null
  const cityScope=typeof document!=='undefined'?(document.documentElement.dataset.streetverseCity||'global'):'global'
  const published=await resolvePublishedMeshyAsset(slot.id,cityScope)
  const staticMeshyUrl=streetVerseMeshyCharacterUrl(slot)
  const staticMeshyReady=published?.url?false:await assetExists(staticMeshyUrl)
  const nativeUrl=NATIVE_RESIDENT_URLS[slot.fallbackResidentIndex%NATIVE_RESIDENT_URLS.length]
  const sourceUrl=published?.url||(staticMeshyReady?staticMeshyUrl:nativeUrl)
  const nativeFallback=!published?.url&&!staticMeshyReady
  try{
    const gltf=await loader.loadAsync(sourceUrl)
    const object=gltf.scene
    object.name=`${nativeFallback?'native':'meshy'}-${slot.id}`
    object.userData={
      ...object.userData,
      streetVerseMeshy:!nativeFallback,
      tryammNativeFallback:nativeFallback,
      slotId:slot.id,
      ageLane:slot.ageLane,
      heritage:slot.heritage,
      adultLaneEligible:slot.adultLaneEligible,
      sourceUrl,
      riggedGlbPreferred:true,
      upgradePending:nativeFallback,
    }
    normalizeStreetVerseHumanHeight(object,slot.targetHeightMeters)
    object.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.castShadow=true
        node.receiveShadow=true
        node.frustumCulled=true
      }
    })
    const companionClips:THREE.AnimationClip[]=[]
    for(const [url,name] of [[published?.walkUrl,'walk'],[published?.runUrl,'run']] as const){
      if(!url)continue
      try{
        const companion=await loader.loadAsync(url)
        for(const clip of companion.animations||[]){const cloned=clip.clone();cloned.name=name;companionClips.push(cloned)}
      }catch{}
    }
    const clips=[...(gltf.animations||[]),...companionClips]
    const mixer=clips.length?new THREE.AnimationMixer(object):null
    const find=(patterns:RegExp[])=>clips.find(clip=>patterns.some(pattern=>pattern.test(clip.name)))
    const animationMap={
      idle:find([/idle/i,/stand/i,/breath/i]),
      walk:find([/walk/i,/locomotion/i]),
      run:find([/run/i,/jog/i,/sprint/i]),
    }
    let active='';let activeAction:THREE.AnimationAction|null=null;let previousNow=performance.now()
    const tick=(nowMs:number,state:{moving:boolean;running?:boolean})=>{
      const motion=state.running?'run':state.moving?'walk':'idle'
      if(mixer&&active!==motion){
        const clip=animationMap[motion]||animationMap.walk||animationMap.idle||clips[0]
        if(clip){
          const next=mixer.clipAction(clip);next.enabled=true;next.reset().play()
          if(activeAction&&activeAction!==next)activeAction.crossFadeTo(next,.16,false)
          activeAction=next;active=motion
        }
      }
      const dt=THREE.MathUtils.clamp((nowMs-previousNow)/1000,0,.05);previousNow=nowMs;mixer?.update(dt)
    }
    const dispose=()=>{
      mixer?.stopAllAction()
      object.traverse(node=>{
        if(!(node instanceof THREE.Mesh))return
        node.geometry?.dispose()
        const mats=Array.isArray(node.material)?node.material:[node.material]
        mats.forEach(material=>material?.dispose())
      })
      object.removeFromParent()
    }
    window.dispatchEvent(new CustomEvent(nativeFallback?'tryamm:native-character-ready':'tryamm:meshy-character-ready',{detail:{
      slotId:slot.id,
      filename:slot.filename,
      ageLane:slot.ageLane,
      adultLaneEligible:slot.adultLaneEligible,
      targetHeightMeters:slot.targetHeightMeters,
      sourceUrl,
      clipNames:clips.map(clip=>clip.name),
      animated:Boolean(mixer),
      source:nativeFallback?'tryamm-native':'meshy',
      upgradePending:nativeFallback,
    }}))
    return {slot,object,sourceUrl,mixer,clips,tick,dispose}
  }catch(error){
    window.dispatchEvent(new CustomEvent('tryamm:meshy-character-fallback',{detail:{
      slotId:slot.id,
      filename:slot.filename,
      fallbackResidentIndex:slot.fallbackResidentIndex,
      error:String(error),
    }}))
    return null
  }
}

export async function loadAvailableStreetVerseMeshyCharacters(limit=8){
  const out:StreetVerseMeshyLoadedCharacter[]=[]
  for(const slot of STREETVERSE_MESHY_CHARACTER_SLOTS){
    if(out.length>=Math.max(1,limit))break
    const loaded=await loadStreetVerseMeshyCharacter(slot.id)
    if(loaded)out.push(loaded)
  }
  return out
}

export function resetStreetVerseMeshyAvailabilityCache(){
  availability.clear()
  resetPublishedMeshyManifest()
}
