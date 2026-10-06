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

type BJFacePose={
  blinkLeft?:number;blinkRight?:number;lookLeft?:number;lookRight?:number;lookUp?:number;lookDown?:number;
  jawOpen?:number;mouthSmile?:number;mouthFrown?:number;mouthWide?:number;mouthNarrow?:number;
  browInnerUp?:number;browDownLeft?:number;browDownRight?:number;cheekRaise?:number;
}

export type StreetVerseMeshyBJHeroHandle={
  object:THREE.Object3D
  mixer:THREE.AnimationMixer|null
  clips:readonly THREE.AnimationClip[]
  morphTargetNames:readonly string[]
  applyFacePose:(pose:BJFacePose)=>number
  tick:(nowMs:number,state:{moving:boolean;running?:boolean;talking?:boolean;liveTalkLevel?:number;focusYaw?:number;breathing?:number;posture?:string;seated?:boolean})=>void
  dispose:()=>void
}

const loader=new GLTFLoader()
const availability=new Map<string,Promise<boolean>>()

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

const BJ_FACE_MORPHS:ReadonlyArray<[keyof BJFacePose,RegExp[]]>=[
  ['blinkLeft',[/eye.?blink.?left/i,/blink.?l/i]],
  ['blinkRight',[/eye.?blink.?right/i,/blink.?r/i]],
  ['lookLeft',[/eye.?look.?out.?left/i,/look.?left/i]],
  ['lookRight',[/eye.?look.?out.?right/i,/look.?right/i]],
  ['lookUp',[/eye.?look.?up/i,/look.?up/i]],
  ['lookDown',[/eye.?look.?down/i,/look.?down/i]],
  ['jawOpen',[/jaw.?open/i,/mouth.?open/i,/viseme.?aa/i,/aa/i]],
  ['mouthSmile',[/mouth.?smile/i,/smile/i]],
  ['mouthFrown',[/mouth.?frown/i,/frown/i]],
  ['mouthWide',[/mouth.?stretch/i,/mouth.?wide/i]],
  ['mouthNarrow',[/mouth.?pucker/i,/mouth.?funnel/i,/mouth.?narrow/i]],
  ['browInnerUp',[/brow.?inner.?up/i]],
  ['browDownLeft',[/brow.?down.?left/i]],
  ['browDownRight',[/brow.?down.?right/i]],
  ['cheekRaise',[/cheek.?squint/i,/cheek.?raise/i]],
]

function setMorph(mesh:THREE.Mesh,patterns:RegExp[],value:number){
  if(!mesh.morphTargetDictionary||!mesh.morphTargetInfluences)return false
  const entry=Object.entries(mesh.morphTargetDictionary).find(([name])=>patterns.some(pattern=>pattern.test(name)))
  if(!entry)return false
  mesh.morphTargetInfluences[entry[1]]=THREE.MathUtils.clamp(value,0,1)
  return true
}

function tuneBJProductionMaterials(root:THREE.Object3D){
  let meshCount=0,materialCount=0,textureCount=0
  root.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    meshCount++
    const materials=Array.isArray(node.material)?node.material:[node.material]
    materials.forEach(material=>{
      if(!(material instanceof THREE.MeshStandardMaterial)&&!(material instanceof THREE.MeshPhysicalMaterial))return
      materialCount++
      const name=(node.name+' '+material.name).toLowerCase()
      material.map&&(material.map.colorSpace=THREE.SRGBColorSpace,textureCount++)
      if(material.emissiveMap)material.emissiveMap.colorSpace=THREE.SRGBColorSpace
      if(/skin|face|head|body|arm|hand|neck/.test(name)){
        material.roughness=THREE.MathUtils.clamp(material.roughness,.42,.68)
        material.metalness=0
        if(material instanceof THREE.MeshPhysicalMaterial){
          material.clearcoat=Math.min(material.clearcoat,.08)
          material.clearcoatRoughness=Math.max(material.clearcoatRoughness,.65)
        }
      }else if(/eye|cornea/.test(name)){
        material.roughness=.12
        material.metalness=0
        if(material instanceof THREE.MeshPhysicalMaterial){material.clearcoat=.75;material.clearcoatRoughness=.08}
      }else if(/hair|brow|lash|beard/.test(name)){
        material.roughness=.72
        material.metalness=0
        material.alphaTest=Math.max(material.alphaTest,.18)
      }else if(/shirt|hood|jacket|pants|jean|cloth|fabric/.test(name)){
        material.roughness=Math.max(material.roughness,.72)
        material.metalness=0
      }else if(/shoe|watch|zip|metal/.test(name)){
        material.roughness=THREE.MathUtils.clamp(material.roughness,.2,.58)
      }
      material.needsUpdate=true
    })
  })
  return {meshCount,materialCount,textureCount}
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
    const productionMaterials=tuneBJProductionMaterials(object)
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
      productionMaterials:true,
      texturePipeline:'pbr-mobile-production-v6',
      lifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v7',
      autonomicLife:true,
      conversationFocus:true,
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
    const findRigNode=(patterns:RegExp[])=>{
      let found:THREE.Object3D|null=null
      object.traverse(node=>{if(!found&&patterns.some(pattern=>pattern.test(node.name)))found=node})
      return found
    }
    const lifeRig={
      head:findRigNode([/^rig[-_ ]?head$/i,/head$/i,/neck/i]),
      spine:findRigNode([/^rig[-_ ]?spine$/i,/upper.?chest/i,/chest/i,/spine/i]),
    }
    const lifeBaseline={
      head:lifeRig.head?.rotation.clone()||null,
      spine:lifeRig.spine?.rotation.clone()||null,
    }
    const applyNaturalRig=(nowMs:number,state:{moving:boolean;talking?:boolean;focusYaw?:number;breathing?:number;posture?:string;seated?:boolean})=>{
      const t=nowMs*.001
      const breathing=THREE.MathUtils.clamp(Number(state.breathing??.15),0,1)
      const breathRate=1.05+breathing*1.45
      const breath=Math.sin(t*breathRate)*(.006+breathing*.010)
      const idleYaw=Math.sin(t*.59)*.035+Math.sin(t*.17+1.7)*.022
      const focus=THREE.MathUtils.clamp(Number(state.focusYaw||0),-.5,.5)
      const headYaw=state.talking?focus*.22:idleYaw
      const headPitch=state.talking?Math.sin(t*.9)*.012:Math.sin(t*.41+.7)*.018
      const posture=String(state.posture||'neutral')
      const postureLean=posture==='withdrawn'?.035:posture==='guarded'?.022:posture==='open'?-.014:posture==='energized'?-.008:0
      if(lifeRig.head){
        if(mixer){lifeRig.head.rotation.y+=headYaw;lifeRig.head.rotation.x+=headPitch}
        else if(lifeBaseline.head){lifeRig.head.rotation.set(lifeBaseline.head.x+headPitch,lifeBaseline.head.y+headYaw,lifeBaseline.head.z)}
      }
      if(lifeRig.spine&&!state.seated){
        const sway=state.moving?Math.sin(t*4.2)*.009:Math.sin(t*.53)*.012
        if(mixer){lifeRig.spine.rotation.x+=postureLean+breath;lifeRig.spine.rotation.z+=sway}
        else if(lifeBaseline.spine){lifeRig.spine.rotation.set(lifeBaseline.spine.x+postureLean+breath,lifeBaseline.spine.y,lifeBaseline.spine.z+sway)}
      }
    }
    const applyFacePose=(pose:BJFacePose)=>{
      let matches=0
      for(const mesh of morphs.meshes){
        for(const [channel,patterns] of BJ_FACE_MORPHS){
          const value=pose[channel]
          if(value==null)continue
          if(setMorph(mesh,patterns,value))matches++
        }
      }
      return matches
    }
    const onFacePose=(event:Event)=>{
      const detail=(event as CustomEvent<{characterId?:string;pose?:BJFacePose}>).detail||{}
      if(detail.characterId&&detail.characterId!==BJ_MESHY_V6_ASSET.characterId)return
      if(detail.pose)applyFacePose(detail.pose)
    }
    window.addEventListener('tryamm:character-face-pose',onFacePose)

    let activeMotion:Motion|null=null
    let activeAction:THREE.AnimationAction|null=null
    let previousNow=performance.now()
    let lastLifeStateAt=0

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
      applyNaturalRig(nowMs,state)
      const blinkClock=(t+Math.sin(t*.071)*.42)%4.6
      const blink=blinkClock>4.34?Math.sin(((blinkClock-4.34)/.26)*Math.PI):0
      const liveLevel=THREE.MathUtils.clamp(state.liveTalkLevel||0,0,1)
      const synthetic=state.talking?THREE.MathUtils.clamp((Math.sin(t*12.4)+Math.sin(t*7.1+1.2)+1.0)/3,0,1):0
      const jaw=Math.max(synthetic,liveLevel)*.82
      const idleGaze=Math.sin(t*.73)*.16+Math.sin(t*.19+1.4)*.08
      const focus=THREE.MathUtils.clamp(Number(state.focusYaw||0),-.5,.5)
      const gaze=state.talking?focus*1.45:idleGaze
      const verticalGaze=state.talking?Math.sin(t*.37)*.035:Math.sin(t*.29+.8)*.065
      applyFacePose({
        jawOpen:jaw,
        mouthWide:state.talking?Math.min(.34,jaw*.42):0,
        mouthNarrow:state.talking?Math.max(0,.10-Math.min(.10,jaw*.08)):0,
        blinkLeft:blink,
        blinkRight:blink,
        lookLeft:gaze<0?Math.min(1,Math.abs(gaze)):0,
        lookRight:gaze>0?Math.min(1,gaze):0,
        lookUp:verticalGaze>0?Math.min(.22,verticalGaze):0,
        lookDown:verticalGaze<0?Math.min(.22,Math.abs(verticalGaze)):0,
        browInnerUp:state.talking?Math.min(.16,.05+liveLevel*.12):0,
        cheekRaise:state.talking?Math.min(.12,liveLevel*.10):0,
      })
      if(nowMs-lastLifeStateAt>750){
        lastLifeStateAt=nowMs
        window.dispatchEvent(new CustomEvent('tryamm:bj-life-state',{detail:{
          characterId:BJ_MESHY_V6_ASSET.characterId,
          assetId:BJ_MESHY_V6_ASSET.id,
          motion:activeMotion||'idle',
          talking:Boolean(state.talking||liveLevel>.025),
          liveTalkLevel:Number(liveLevel.toFixed(3)),
          breathing:THREE.MathUtils.clamp(Number(state.breathing??.15),0,1),
          posture:String(state.posture||'neutral'),
          eyeFocus:true,
          blink:true,
          lipSync:true,
          microGesture:true,
          seated:Boolean(state.seated),
          source:'meshy-bj-v6-life-layer-v7',
        }}))
      }
    }

    window.dispatchEvent(new CustomEvent('tryamm:bj-meshy-v6-ready',{detail:{
      characterId:BJ_MESHY_V6_ASSET.characterId,
      assetId:BJ_MESHY_V6_ASSET.id,
      url:sourceUrl,
      clipNames:clips.map(clip=>clip.name),
      morphTargetNames:morphs.names,
      faceChannels:BJ_FACE_MORPHS.map(([channel])=>channel),
      targetHeightMeters:BJ_MESHY_V6_ASSET.targetHeightMeters,
      authoritative3DMesh:true,
      referenceMatchedPreview:true,
      photoMatched:verifiedPhotoMatch,
      certifiedLikeness:verifiedPhotoMatch,
      proceduralFallbackSuppressed:true,
      productionMaterials,
      texturePipeline:'pbr-mobile-production-v6',
      lifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v7',
      autonomicLife:true,
      conversationFocus:true,
    }}))

    return {
      object,
      mixer,
      clips,
      morphTargetNames:morphs.names,
      applyFacePose,
      tick,
      dispose:()=>{
        window.removeEventListener('tryamm:character-face-pose',onFacePose)
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
  availability.clear()
  resetPublishedMeshyManifest()
}
