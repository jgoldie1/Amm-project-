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
      const controller=new AbortController()
      const timer=window.setTimeout(()=>controller.abort(),1800)
      try{
        const response=await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal})
        const contentType=(response.headers.get('content-type')||'').toLowerCase()
        return response.ok&&!contentType.includes('text/html')&&!contentType.includes('application/xhtml+xml')
      }catch{return false}
      finally{window.clearTimeout(timer)}
    })())
  }
  return availability.get(url)!
}

function tuneStreetVerseCharacterMaterials(root:THREE.Object3D){
  let meshCount=0,materialCount=0,textureCount=0
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    meshCount++
    const materials=Array.isArray(node.material)?node.material:[node.material]
    for(const material of materials){
      if(!(material instanceof THREE.MeshStandardMaterial)&&!(material instanceof THREE.MeshPhysicalMaterial))continue
      materialCount++
      const name=(node.name+' '+material.name).toLowerCase()
      if(material.map){material.map.colorSpace=THREE.SRGBColorSpace;material.map.anisotropy=Math.max(material.map.anisotropy||1,4);textureCount++}
      if(material.normalMap){material.normalMap.anisotropy=Math.max(material.normalMap.anisotropy||1,4);material.normalScale.set(.78,.78)}
      if(material.roughnessMap)material.roughnessMap.anisotropy=Math.max(material.roughnessMap.anisotropy||1,4)
      if(/skin|face|head|arm|hand|neck/.test(name)){material.roughness=THREE.MathUtils.clamp(material.roughness,.50,.70);material.metalness=0;material.envMapIntensity=.62}
      else if(/eye|cornea|iris/.test(name)){material.roughness=.10;material.metalness=0;material.envMapIntensity=1.05;if(material instanceof THREE.MeshPhysicalMaterial){material.clearcoat=.72;material.clearcoatRoughness=.08}}
      else if(/hair|brow|lash|beard|loc|braid/.test(name)){material.roughness=.80;material.metalness=0;material.envMapIntensity=.38}
      else if(/shirt|top|hood|jacket|pants|jean|cloth|fabric|dress/.test(name)){material.roughness=Math.max(material.roughness,.80);material.metalness=0;material.envMapIntensity=.34}
      else if(/shoe|metal|watch|chain|jewel/.test(name)){material.roughness=THREE.MathUtils.clamp(material.roughness,.24,.62);material.envMapIntensity=.72}
      material.needsUpdate=true
    }
  })
  return{meshCount,materialCount,textureCount}
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
  const publishedReady=published?.url?await assetExists(published.url):false
  const staticMeshyReady=publishedReady?false:await assetExists(staticMeshyUrl)
  const nativeUrl=NATIVE_RESIDENT_URLS[slot.fallbackResidentIndex%NATIVE_RESIDENT_URLS.length]
  const sourceUrl=publishedReady?published!.url:(staticMeshyReady?staticMeshyUrl:nativeUrl)
  const nativeFallback=!publishedReady&&!staticMeshyReady
  if(published?.url&&!publishedReady&&typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:meshy-published-asset-unavailable',{detail:{slotId:slot.id,url:published.url,fallback:nativeUrl,source:'StreetVerseMeshyCharacterRuntime'}}))
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
    const visualMaterials=tuneStreetVerseCharacterMaterials(object)
    object.userData={...object.userData,characterVisualPass:'west-side-character-v3',productionMaterialPass:true,texturePipeline:'pbr-mobile-character-v3',visualMaterials}
    const companionClips:THREE.AnimationClip[]=[]
    const staticStem=staticMeshyUrl.replace(/\.glb$/i,'')
    const companionSources=publishedReady
      ?[[published?.walkUrl,'walk'],[published?.runUrl,'run']]
      :staticMeshyReady
        ?[[`${staticStem}.walk.glb`,'walk'],[`${staticStem}.run.glb`,'run']]
        :[]
    for(const [url,name] of companionSources as Array<[string|null|undefined,string]>){
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
      characterVisualPass:'west-side-character-v3',
      productionMaterialPass:true,
      visualMaterials,
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
