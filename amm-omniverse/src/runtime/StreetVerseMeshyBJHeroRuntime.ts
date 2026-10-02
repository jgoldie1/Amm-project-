import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'
import {BJ_STUBBS_BODY_PROFILE} from '../data/StreetVerseBJBodyProfile'
import {resolvePublishedMeshyAsset,resetPublishedMeshyManifest} from './StreetVerseMeshyAssetManifest'
import {canClaimPhotoMatched} from '../data/StreetVerseCharacterReferenceAuthorization'

export const BJ_MESHY_V6_ASSET={
  id:'streetverse-bj-stubbs-meshy-v6',
  characterId:'bj-stubbs',
  filename:'SV_HERO_BJ_STUBBS_V6.glb',
  url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb',
  targetHeightMeters:BJ_STUBBS_BODY_PROFILE.heightMeters,
  authority:'meshy-rigged-glb',
  fallback:'streetverse-bj-stubbs-photomatched',
  referenceAuthorized:true,
  certifiedLikeness:false,
} as const

type Motion='idle'|'walk'|'run'

export type StreetVerseMeshyBJHeroHandle={
  object:THREE.Object3D
  mixer:THREE.AnimationMixer|null
  clips:readonly THREE.AnimationClip[]
  morphTargetNames:readonly string[]
  tick:(nowMs:number,state:{moving:boolean;running?:boolean;talking?:boolean;liveTalkLevel?:number})=>void
  dispose:()=>void
}

const loader=new GLTFLoader()
let availabilityPromise:Promise<boolean>|null=null

async function assetExists(url:string){
  if(!availabilityPromise){
    availabilityPromise=(async()=>{
      const controller=new AbortController()
      const timer=window.setTimeout(()=>controller.abort(),1800)
      try{
        const response=await fetch(url,{method:'HEAD',cache:'no-store',signal:controller.signal})
        const contentType=(response.headers.get('content-type')||'').toLowerCase()
        return response.ok&&!contentType.includes('text/html')&&!contentType.includes('application/xhtml+xml')
      }catch{return false}
      finally{window.clearTimeout(timer)}
    })()
  }
  return availabilityPromise
}

function materializeAnimationMap(clips:readonly THREE.AnimationClip[]){
  const find=(patterns:RegExp[])=>clips.find(clip=>patterns.some(pattern=>pattern.test(clip.name)))
  return {
    idle:find([/idle/i,/stand/i,/breath/i]),
    walk:find([/walk/i,/locomotion/i]),
    run:find([/run/i,/jog/i,/sprint/i]),
  }
}

function collectMorphMeshes(root:THREE.Object3D){
  const meshes:THREE.Mesh[]=[]
  const names=new Set<string>()
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh)||!node.morphTargetDictionary||!node.morphTargetInfluences)return
    meshes.push(node)
    Object.keys(node.morphTargetDictionary).forEach(name=>names.add(name))
  })
  return {meshes,names:[...names]}
}

function setMorph(mesh:THREE.Mesh,patterns:RegExp[],value:number){
  if(!mesh.morphTargetDictionary||!mesh.morphTargetInfluences)return false
  const entry=Object.entries(mesh.morphTargetDictionary).find(([name])=>patterns.some(pattern=>pattern.test(name)))
  if(!entry)return false
  mesh.morphTargetInfluences[entry[1]]=THREE.MathUtils.clamp(value,0,1)
  return true
}

function disposeObject(root:THREE.Object3D){
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    node.geometry?.dispose()
    const materials=Array.isArray(node.material)?node.material:[node.material]
    materials.forEach(material=>{
      const m=material as THREE.Material&Record<string,unknown>
      for(const value of Object.values(m))if(value instanceof THREE.Texture)value.dispose()
      material.dispose()
    })
  })
  root.removeFromParent()
}

export async function loadStreetVerseMeshyBJHero():Promise<StreetVerseMeshyBJHeroHandle|null>{
  const verifiedPhotoMatch=canClaimPhotoMatched(BJ_MESHY_V6_ASSET.characterId)
  const cityScope=typeof document!=='undefined'?(document.documentElement.dataset.streetverseCity||'global'):'global'
  const published=await resolvePublishedMeshyAsset('sv-bj-stubbs-v6',cityScope)
  const sourceUrl=published?.url||BJ_MESHY_V6_ASSET.url
  if(!(await assetExists(sourceUrl))){
    window.dispatchEvent(new CustomEvent('tryamm:bj-meshy-v6-unavailable',{detail:{
      characterId:BJ_MESHY_V6_ASSET.characterId,
      assetId:BJ_MESHY_V6_ASSET.id,
      url:sourceUrl,
      fallback:BJ_MESHY_V6_ASSET.fallback,
    }}))
    return null
  }

  try{
    const gltf=await loader.loadAsync(sourceUrl)
    const object=gltf.scene
    object.name='meshy-bj-stubbs-v6'
    normalizeStreetVerseHumanHeight(object,BJ_MESHY_V6_ASSET.targetHeightMeters)
    object.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.castShadow=true
        node.receiveShadow=true
        node.frustumCulled=true
      }
    })
    object.userData={
      ...object.userData,
      characterId:BJ_MESHY_V6_ASSET.characterId,
      displayName:'BJ Stubbs',
      namedCharacter:true,
      identityContinuityKey:BJ_MESHY_V6_ASSET.characterId,
      visualAuthority:BJ_MESHY_V6_ASSET.authority,
      meshAssetId:BJ_MESHY_V6_ASSET.id,
      referenceMatchedPreview:true,
      photoMatched:verifiedPhotoMatch,
      certifiedLikeness:verifiedPhotoMatch,
      meshyV6:true,
    }

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
    const animations=materializeAnimationMap(clips)
    const morphs=collectMorphMeshes(object)
    let activeMotion:Motion|null=null
    let activeAction:THREE.AnimationAction|null=null
    let previousNow=performance.now()

    const setMotion=(motion:Motion)=>{
      if(!mixer||activeMotion===motion)return
      const clip=animations[motion]||animations.walk||animations.idle||clips[0]
      if(!clip)return
      const next=mixer.clipAction(clip)
      next.enabled=true
      next.setEffectiveWeight(1)
      next.setEffectiveTimeScale(motion==='run'?1.08:1)
      next.reset().play()
      if(activeAction&&activeAction!==next)activeAction.crossFadeTo(next,.18,false)
      activeAction=next
      activeMotion=motion
    }

    const tick:StreetVerseMeshyBJHeroHandle['tick']=(nowMs,state)=>{
      const dt=THREE.MathUtils.clamp((nowMs-previousNow)/1000,0,.05)
      previousNow=nowMs
      setMotion(state.running?'run':state.moving?'walk':'idle')
      mixer?.update(dt)

      const t=nowMs*.001
      const blinkClock=t%4.6
      const blink=blinkClock>4.36?Math.sin(((blinkClock-4.36)/.24)*Math.PI):0
      const synthetic=state.talking?THREE.MathUtils.clamp((Math.sin(t*12.4)+Math.sin(t*7.1+1.2)+1.0)/3,0,1):0
      const jaw=Math.max(synthetic,THREE.MathUtils.clamp(state.liveTalkLevel||0,0,1))*.82
      for(const mesh of morphs.meshes){
        setMorph(mesh,[/jaw.?open/i,/mouth.?open/i,/viseme.?aa/i,/aa/i],jaw)
        setMorph(mesh,[/eye.?blink.?left/i,/blink.?l/i],blink)
        setMorph(mesh,[/eye.?blink.?right/i,/blink.?r/i],blink)
      }
    }

    window.dispatchEvent(new CustomEvent('tryamm:bj-meshy-v6-ready',{detail:{
      characterId:BJ_MESHY_V6_ASSET.characterId,
      assetId:BJ_MESHY_V6_ASSET.id,
      url:sourceUrl,
      clipNames:clips.map(clip=>clip.name),
      morphTargetNames:morphs.names,
      targetHeightMeters:BJ_MESHY_V6_ASSET.targetHeightMeters,
      authoritative3DMesh:true,
      referenceMatchedPreview:true,
      photoMatched:verifiedPhotoMatch,
      certifiedLikeness:verifiedPhotoMatch,
      proceduralFallbackSuppressed:true,
    }}))

    return {
      object,
      mixer,
      clips,
      morphTargetNames:morphs.names,
      tick,
      dispose:()=>{
        mixer?.stopAllAction()
        disposeObject(object)
      },
    }
  }catch(error){
    window.dispatchEvent(new CustomEvent('tryamm:bj-meshy-v6-error',{detail:{
      characterId:BJ_MESHY_V6_ASSET.characterId,
      assetId:BJ_MESHY_V6_ASSET.id,
      error:String(error),
      fallback:BJ_MESHY_V6_ASSET.fallback,
    }}))
    return null
  }
}

export function resetStreetVerseMeshyBJAvailability(){
  availabilityPromise=null
  resetPublishedMeshyManifest()
}
