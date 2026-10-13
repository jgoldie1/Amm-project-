import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'
import {BJ_STUBBS_BODY_PROFILE} from '../data/StreetVerseBJBodyProfile'
import {resolvePublishedMeshyAsset,resetPublishedMeshyManifest} from './StreetVerseMeshyAssetManifest'
import {canClaimPhotoMatched} from '../data/StreetVerseCharacterReferenceAuthorization'
import {inspectCharacterGeometry} from './StreetVerseCharacterGeometry'
import {getPreviewBJMetaHumanUrl,auditBJMetaHumanForStreetVerse} from './StreetVerseBJMetaHumanBridge'

export const BJ_MESHY_V6_ASSET={
  id:'streetverse-bj-stubbs-meshy-v6',
  characterId:'bj-stubbs',
  filename:'SV_HERO_BJ_STUBBS_V6.glb',
  url:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V6.glb',
  productionFilename:'SV_HERO_BJ_STUBBS_V12.glb',
  productionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V12.glb',
  legacyProductionFilename:'SV_HERO_BJ_STUBBS_V7.glb',
  legacyProductionUrl:'/tryamm-assets/meshy/characters/SV_HERO_BJ_STUBBS_V7.glb',
  targetHeightMeters:BJ_STUBBS_BODY_PROFILE.heightMeters,
  authority:'tryamm-owned-native-glb-v12',
  fallback:'streetverse-bj-stubbs-photomatched',
  referenceAuthorized:true,
  certifiedLikeness:false,
} as const

type Motion='idle'|'walk'|'run'
export type BJGesture='nod'|'look-around'|'acknowledge'|'converse'|'greet'

type BJFacePose={
  blinkLeft?:number;blinkRight?:number;lookLeft?:number;lookRight?:number;lookUp?:number;lookDown?:number;
  jawOpen?:number;mouthSmile?:number;mouthFrown?:number;mouthWide?:number;mouthNarrow?:number;
  browInnerUp?:number;browDownLeft?:number;browDownRight?:number;cheekRaise?:number;
  /** Optional scripted speech shapes; do not infer phonemes from audio loudness. */
  visemeAA?:number;visemeEE?:number;visemeOH?:number;visemeOO?:number;
  visemePP?:number;visemeFF?:number;visemeTH?:number;
  visemeMBP?:number;visemeFV?:number;visemeL?:number;visemeWQ?:number;
  eyeSquintLeft?:number;eyeSquintRight?:number;
}

export type StreetVerseMeshyBJHeroHandle={
  object:THREE.Object3D
  mixer:THREE.AnimationMixer|null
  clips:readonly THREE.AnimationClip[]
  morphTargetNames:readonly string[]
  applyFacePose:(pose:BJFacePose)=>number
  /** Only plays a gesture if the active GLB has the matching animation. */
  playGesture:(gesture:BJGesture)=>boolean
  tick:(nowMs:number,state:{moving:boolean;running?:boolean;talking?:boolean;liveTalkLevel?:number;focusYaw?:number;breathing?:number;posture?:string;seated?:boolean})=>void
  dispose:()=>void
}

/**
 * Actual BJ V15 GLB, user portrait reference embedded in character.
 * BJ V15 is the default hero for StreetVerse mobile after owner approved
 * production integration. ?bj=legacy is an explicit emergency fallback.
 * Do not commit private original source photos to public GitHub.
 */
export const BJ_V15_PREVIEW={
  id:'streetverse-bj-stubbs-v15',
  url:'https://d2ol7oe51mr4n9.cloudfront.net/user_3HqgexuZuGoTDUJ2Hxg2e6x5Hzm/daa5234c-5fbf-4b52-9c45-e82e36156153.glb',
  filename:'BJ_STUBBS_V15_ACTING_FACE_LOOK_NOD.glb',
  certifiedLikeness:false,
} as const

export function getBJPreviewV15Url():string|null{
  if(typeof window==='undefined')return null
  return new URLSearchParams(window.location.search).get('bj')==='legacy' ? null : BJ_V15_PREVIEW.url
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
  // V14 GLB adds seven deliberate mouth targets; these are not audio-verified lip sync.
  ['visemeAA',[/^viseme_aa$/i]],
  ['visemeEE',[/^viseme_(ee|e)$/i]],
  ['visemeOH',[/^viseme_(oh|o)$/i]],
  ['visemeOO',[/^viseme_u$/i]],
  ['visemePP',[/^viseme_pp$/i]],
  ['visemeFF',[/^viseme_ff$/i]],
  ['visemeTH',[/^viseme_th$/i]],
  ['visemeMBP',[/^viseme_mbp$/i]],
  ['visemeFV',[/^viseme_fv$/i]],
  ['visemeL',[/^viseme_l$/i]],
  ['visemeWQ',[/^viseme_wq$/i]],
  ['eyeSquintLeft',[/^eyeSquintLeft$/i]],
  ['eyeSquintRight',[/^eyeSquintRight$/i]],
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
      if(material.map){material.map.colorSpace=THREE.SRGBColorSpace;material.map.anisotropy=Math.max(material.map.anisotropy||1,8);textureCount++}
      if(material.emissiveMap){material.emissiveMap.colorSpace=THREE.SRGBColorSpace;material.emissiveMap.anisotropy=Math.max(material.emissiveMap.anisotropy||1,8)}
      if(material.normalMap){material.normalScale.set(.82,.82);material.normalMap.anisotropy=Math.max(material.normalMap.anisotropy||1,8)}
      if(material.roughnessMap)material.roughnessMap.anisotropy=Math.max(material.roughnessMap.anisotropy||1,8)
      if(material.metalnessMap)material.metalnessMap.anisotropy=Math.max(material.metalnessMap.anisotropy||1,8)
      material.envMapIntensity=Math.max(.42,Math.min(1.25,material.envMapIntensity||1))
      if(/skin|face|head|body|arm|hand|neck/.test(name)){
        material.roughness=THREE.MathUtils.clamp(material.roughness,.46,.64)
        material.metalness=0
        material.envMapIntensity=.72
        if(material instanceof THREE.MeshPhysicalMaterial){
          material.clearcoat=Math.min(material.clearcoat,.045)
          material.clearcoatRoughness=Math.max(material.clearcoatRoughness,.72)
          material.sheen=Math.max(material.sheen,.08)
          material.sheenRoughness=.82
          material.sheenColor.set(0x5c3426)
        }
      }else if(/eye|cornea|iris/.test(name)){
        material.roughness=.075
        material.metalness=0
        material.envMapIntensity=1.25
        if(material instanceof THREE.MeshPhysicalMaterial){material.clearcoat=.88;material.clearcoatRoughness=.045;material.ior=1.38}
      }else if(/hair|brow|lash|beard|loc|braid/.test(name)){
        material.roughness=.78
        material.metalness=0
        material.envMapIntensity=.42
        material.alphaTest=Math.max(material.alphaTest,.14)
      }else if(/shirt|hood|jacket|pants|jean|cloth|fabric/.test(name)){
        material.roughness=Math.max(material.roughness,.80)
        material.metalness=0
        material.envMapIntensity=.38
      }else if(/gold|pendant|chain/.test(name)){
        material.roughness=.26
        material.metalness=.82
        material.envMapIntensity=1.15
      }else if(/shoe|watch|zip|metal/.test(name)){
        material.roughness=THREE.MathUtils.clamp(material.roughness,.2,.58)
        material.envMapIntensity=.85
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
  // Do not wait for an unrelated Meshy API before starting the owned BJ V15 GLB.
  // On slow iPhone connections that unbounded manifest request left the UI at
  // "BJ V15 LOADING" even though the V15 asset itself was healthy.
  const v15PreviewUrl=getBJPreviewV15Url()
  const published=v15PreviewUrl?null:await Promise.race([
    resolvePublishedMeshyAsset('sv-bj-stubbs-v6',cityScope),
    new Promise<null>(resolve=>window.setTimeout(()=>resolve(null),3000)),
  ])
  // Never load a MetaHuman candidate by default; preview is explicitly opted-in.
  const metaHumanPreviewUrl=getPreviewBJMetaHumanUrl()
  // Default to the actual V15 hero; ?bj=legacy preserves a manual fallback.
  const candidates=[v15PreviewUrl,metaHumanPreviewUrl,published?.url,BJ_MESHY_V6_ASSET.productionUrl,BJ_MESHY_V6_ASSET.legacyProductionUrl,BJ_MESHY_V6_ASSET.url].filter((url):url is string=>Boolean(url))
  let sourceUrl=''
  let publishedGlb:Awaited<ReturnType<typeof loader.loadAsync>>|null=null
  let usingMetaHumanPreview=false
  let usingV15Preview=false
  // Generated V12/V7/V6 GLBs are first-party build outputs. A slow Safari HEAD
  // response must not block the real hero; attempt the actual GLB GET instead.
  // Keep the published/external Meshy override protected by its availability probe.
  for(const candidate of candidates){
    // Remote V15 GET is more reliable on iPhone than an extra 1.8s HEAD
    // preflight, which can incorrectly discard a working animated hero.
    if((candidate===published?.url||candidate===metaHumanPreviewUrl)&&!await assetExists(candidate))continue
    try{
      // The legacy loader has no request deadline. A failed/slow CDN request
      // cannot leave an iPhone showing an unbounded LOADING indicator.
      // Fetch bytes first so network timeout is abortable; decode as glTF next.
      const controller=new AbortController()
      const timeoutId=window.setTimeout(()=>controller.abort(),25000)
      let candidateGlb:Awaited<ReturnType<typeof loader.loadAsync>>
      try{
        window.dispatchEvent(new CustomEvent('tryamm:bj-model-progress',{detail:{
          stage:'fetching',source:candidate===v15PreviewUrl?'v15':'fallback',
        }}))
        const response=await fetch(candidate,{signal:controller.signal,mode:'cors'})
        if(!response.ok)throw new Error('BJ GLB HTTP '+response.status)
        const bytes=await response.arrayBuffer()
        window.dispatchEvent(new CustomEvent('tryamm:bj-model-progress',{detail:{
          stage:'decoding',sizeBytes:bytes.byteLength,source:candidate===v15PreviewUrl?'v15':'fallback',
        }}))
        const basePath=new URL('.',new URL(candidate,window.location.href)).href
        candidateGlb=await loader.parseAsync(bytes,basePath)
      }finally{window.clearTimeout(timeoutId)}
      if(inspectCharacterGeometry(candidateGlb.scene).meshes===0){
        disposeObject(candidateGlb.scene)
        continue
      }
      if(candidate===metaHumanPreviewUrl){
        const audit=auditBJMetaHumanForStreetVerse(candidateGlb.scene,candidateGlb.animations||[])
        window.dispatchEvent(new CustomEvent('tryamm:bj-metahuman-preview-audit',{detail:{
          characterId:'bj-stubbs',assetUrl:candidate,...audit,likenessApproved:false,
        }}))
        if(!audit.ok){disposeObject(candidateGlb.scene);continue}
        usingMetaHumanPreview=true
      }
      if(candidate===v15PreviewUrl){
        const faceNames=new Set<string>()
        candidateGlb.scene.traverse(n=>{
          if(n instanceof THREE.Mesh)for(const name of Object.keys(n.morphTargetDictionary||{}))faceNames.add(name)
        })
        const animations=candidateGlb.animations||[]
        const valid=animations.some(a=>/idle/i.test(a.name))&&animations.some(a=>/walk/i.test(a.name))
          &&faceNames.has('eyeBlinkLeft')&&faceNames.has('jawOpen')
        window.dispatchEvent(new CustomEvent('tryamm:bj-v15-asset-audit',{detail:{
          characterId:'bj-stubbs',sourceUrl:candidate,valid,
          animationCount:animations.length,facialMorphCount:faceNames.size,likenessCertified:false,
        }}))
        if(!valid){disposeObject(candidateGlb.scene);continue}
        usingV15Preview=true
      }
      publishedGlb=candidateGlb
      sourceUrl=candidate
      break
    }catch{
      // Try the next owned compatibility GLB; native hero stays visible meanwhile.
    }
  }
  if(!publishedGlb){
    window.dispatchEvent(new CustomEvent('tryamm:bj-meshy-v6-unavailable',{detail:{
      characterId:BJ_MESHY_V6_ASSET.characterId,
      assetId:BJ_MESHY_V6_ASSET.id,
      url:sourceUrl,
      fallback:BJ_MESHY_V6_ASSET.fallback,
    }}))
    return null
  }

  try{
    const gltf=publishedGlb
    const object=gltf.scene
    object.name=usingV15Preview?'bj-stubbs-v15-actual-glb':usingMetaHumanPreview?'bj-stubbs-metahuman-web-preview':'bj-stubbs-production-v12'
    // V15 includes 50 zero-scaled legacy SkinnedMeshes that are invisible but
    // cause Three.Box3 to produce NaN bounds and an invalid contact shadow.
    // Detach only genuinely invisible zero-scale mesh nodes; do not touch
    // its facial mesh, bones, or any playing animation targets.
    let prunedInvisibleV15Meshes=0
    if(usingV15Preview){
      const hidden:THREE.Mesh[]=[]
      object.traverse(node=>{
        if(node instanceof THREE.Mesh&&node.scale.lengthSq()<1e-12)hidden.push(node)
      })
      for(const node of hidden){node.removeFromParent();prunedInvisibleV15Meshes++}
    }
    normalizeStreetVerseHumanHeight(object,BJ_MESHY_V6_ASSET.targetHeightMeters)
    object.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.castShadow=true
        node.receiveShadow=true
        node.frustumCulled=usingV15Preview?false:true
      }
    })
    const productionMaterials=tuneBJProductionMaterials(object)
    const bounds=new THREE.Box3().setFromObject(object)
    const size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3())
    const presentationLayer=new THREE.Group();presentationLayer.name='bj-stubbs-presentation-v8'
    const shadowGeometry=new THREE.CircleGeometry(Math.max(.28,size.x*.28),28)
    const shadowMaterial=new THREE.MeshBasicMaterial({color:0x050607,transparent:true,opacity:.24,depthWrite:false,toneMapped:false})
    const contactShadow=new THREE.Mesh(shadowGeometry,shadowMaterial);contactShadow.name='bj-contact-shadow-v8';contactShadow.rotation.x=-Math.PI/2;contactShadow.scale.set(1,Math.max(.55,Math.min(1.15,size.z/Math.max(.01,size.x))),1);contactShadow.position.set(center.x,bounds.min.y+.018,center.z);presentationLayer.add(contactShadow)
    // V13 mobile hero-readability lights are short-range and shadowless so BJ reads as a character,
    // not a flat asset, without enabling expensive phone shadow maps or relighting the whole city.
    const faceHeight=bounds.max.y-size.y*.16
    const lightDistance=Math.max(1.6,size.y*1.15)
    const faceKey=new THREE.PointLight(0xffd0b2,.36,lightDistance,2);faceKey.name='bj-face-key-v13';faceKey.castShadow=false;faceKey.position.set(center.x+size.x*.48,faceHeight,center.z+size.z*.72);presentationLayer.add(faceKey)
    const faceRim=new THREE.PointLight(0x8fc9ff,.24,lightDistance*.92,2);faceRim.name='bj-face-rim-v13';faceRim.castShadow=false;faceRim.position.set(center.x-size.x*.42,faceHeight+size.y*.04,center.z-size.z*.50);presentationLayer.add(faceRim)
    object.add(presentationLayer)
    object.userData={
      ...object.userData,
      characterId:BJ_MESHY_V6_ASSET.characterId,
      displayName:'BJ Stubbs',
      namedCharacter:true,
      identityContinuityKey:BJ_MESHY_V6_ASSET.characterId,
      visualAuthority:usingV15Preview?'bj-actual-v15-remote-preview':usingMetaHumanPreview?'metahuman-web-opt-in-unapproved':BJ_MESHY_V6_ASSET.authority,
      bjV15RealGlbPreview:usingV15Preview,
      prunedInvisibleV15Meshes,
      metahumanWebPreview:usingMetaHumanPreview,
      metaHumanLikenessApproved:false,
      meshAssetId:BJ_MESHY_V6_ASSET.id,
      referenceMatchedPreview:Boolean(published?.url),
      photoMatched:usingV15Preview||usingMetaHumanPreview?false:verifiedPhotoMatch,
      certifiedLikeness:usingV15Preview||usingMetaHumanPreview?false:verifiedPhotoMatch,
      meshyV6:Boolean(published?.url),
      ownedV7:!published?.url,
      ownedV12:!published?.url,
      productionMaterials:true,
      texturePipeline:'pbr-mobile-production-v12',
      visualTexturePipeline:'pbr-mobile-production-v8',
      visualPass:'bj-v12-material-eye-hair-fabric',presentationPass:'bj-v13-hero-readability',faceLightingPass:'local-key-rim-v13',
      textureAnisotropy:8,
      lifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v12',
      legacyLifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v7',
      visualLifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v8',
      groundedContactShadow:true,
      asymmetricBlink:true,
      idleMicroExpression:true,
      autonomicLife:true,
      conversationFocus:true,heroReadabilityV13:true,shortRangeFaceLights:true,
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
    if(usingV15Preview){
      let skins=0
      object.traverse(n=>{if(n instanceof THREE.SkinnedMesh)skins++})
      window.dispatchEvent(new CustomEvent('tryamm:streetverse-bj-visible-version',{detail:{
        characterId:'bj-stubbs',version:'V15',objectName:object.name,sourceUrl,
        skinnedMeshCount:skins,animationCount:clips.length,facialMorphCount:morphs.names.length,
        productionReleased:false,modelVerified:true,likenessCertified:false,
      }}))
    }
    const findRigNode=(patterns:RegExp[]):THREE.Object3D|null=>{
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
    const nodeHasAnimationTracks=(node:THREE.Object3D|null)=>{
      if(!node?.name)return false
      const prefix=node.name+'.'
      return clips.some(clip=>clip.tracks.some(track=>track.name.startsWith(prefix)))
    }
    const lifeDriven={
      head:nodeHasAnimationTracks(lifeRig.head),
      spine:nodeHasAnimationTracks(lifeRig.spine),
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
        if(mixer&&lifeDriven.head){lifeRig.head.rotation.y+=headYaw;lifeRig.head.rotation.x+=headPitch}
        else if(lifeBaseline.head){lifeRig.head.rotation.set(lifeBaseline.head.x+headPitch,lifeBaseline.head.y+headYaw,lifeBaseline.head.z)}
      }
      if(lifeRig.spine){
        const sway=state.moving?Math.sin(t*4.2)*.009:Math.sin(t*.53)*.012
        if(state.seated){
          if(!lifeDriven.spine&&lifeBaseline.spine)lifeRig.spine.rotation.copy(lifeBaseline.spine)
        }else if(mixer&&lifeDriven.spine){
          lifeRig.spine.rotation.x+=postureLean+breath
          lifeRig.spine.rotation.z+=sway
        }else if(lifeBaseline.spine){
          lifeRig.spine.rotation.set(lifeBaseline.spine.x+postureLean+breath,lifeBaseline.spine.y,lifeBaseline.spine.z+sway)
        }
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
    let gestureAction:THREE.AnimationAction|null=null
    let gestureUntil=0
    let previousNow=performance.now()
    const gesturePatterns:Record<BJGesture,RegExp>={
      'nod':/BJ_V15_ListenAndNod/i,
      'look-around':/BJ_V15_LookAround/i,
      'acknowledge':/BJ_V15_AcknowledgeAndSmile/i,
      'converse':/BJ_V14_Speaking_Visemes/i,
      'greet':/BJ_Greeting_Wave/i,
    }
    const playGesture=(gesture:BJGesture):boolean=>{
      const clip=clips.find(item=>gesturePatterns[gesture].test(item.name))
      if(!mixer||!clip)return false // Older BJ models remain valid and untouched.
      const action=mixer.clipAction(clip)
      if(gestureAction&&gestureAction!==action)gestureAction.fadeOut(.14)
      if(activeAction&&activeAction!==action)activeAction.fadeOut(.14)
      action.reset()
      action.setLoop(THREE.LoopOnce,1)
      action.clampWhenFinished=false
      action.setEffectiveTimeScale(1)
      action.setEffectiveWeight(1)
      action.fadeIn(.14).play()
      gestureAction=action
      activeAction=action
      activeMotion=null
      gestureUntil=performance.now()+clip.duration*1000+170
      return true
    }
    const onGesture=(event:Event)=>{
      const detail=(event as CustomEvent<{characterId?:string;gesture?:BJGesture}>).detail||{}
      if(detail.characterId&&detail.characterId!==BJ_MESHY_V6_ASSET.characterId)return
      if(!detail.gesture||!Object.prototype.hasOwnProperty.call(gesturePatterns,detail.gesture))return
      playGesture(detail.gesture)
    }
    window.addEventListener('tryamm:bj-gesture',onGesture)
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
      if(gestureAction&&nowMs>=gestureUntil){
        gestureAction.fadeOut(.14)
        gestureAction=null
        activeAction=null
        activeMotion=null
      }
      if(!gestureAction)setMotion(state.running?'run':state.moving?'walk':'idle')
      mixer?.update(dt)

      const t=nowMs*.001
      applyNaturalRig(nowMs,state)
      const blinkClock=(t+Math.sin(t*.071)*.42)%4.6
      const blinkBase=blinkClock>4.34?Math.sin(((blinkClock-4.34)/.26)*Math.PI):0
      const winkDrift=Math.sin(t*.23+1.1)*.035
      const blinkLeft=THREE.MathUtils.clamp(blinkBase+(blinkBase>0?Math.max(0,winkDrift):0),0,1)
      const blinkRight=THREE.MathUtils.clamp(blinkBase+(blinkBase>0?Math.max(0,-winkDrift):0),0,1)
      const liveLevel=THREE.MathUtils.clamp(state.liveTalkLevel||0,0,1)
      const synthetic=state.talking?THREE.MathUtils.clamp((Math.sin(t*12.4)+Math.sin(t*7.1+1.2)+1.0)/3,0,1):0
      const jaw=Math.max(synthetic,liveLevel)*.82
      const idleGaze=Math.sin(t*.73)*.16+Math.sin(t*.19+1.4)*.08
      const focus=THREE.MathUtils.clamp(Number(state.focusYaw||0),-.5,.5)
      const gaze=state.talking?focus*1.45:idleGaze
      const verticalGaze=state.talking?Math.sin(t*.37)*.035:Math.sin(t*.29+.8)*.065
      const microSmile=state.talking?Math.min(.18,.04+liveLevel*.12):Math.max(0,Math.sin(t*.17+.8))*.035
      const microFrown=String(state.posture||'neutral')==='guarded'?Math.max(0,Math.sin(t*.31))*0.06:0
      applyFacePose({
        jawOpen:jaw,
        mouthWide:state.talking?Math.min(.34,jaw*.42):0,
        mouthNarrow:state.talking?Math.max(0,.10-Math.min(.10,jaw*.08)):0,
        mouthSmile:microSmile,
        mouthFrown:microFrown,
        blinkLeft,
        blinkRight,
        lookLeft:gaze<0?Math.min(1,Math.abs(gaze)):0,
        lookRight:gaze>0?Math.min(1,gaze):0,
        lookUp:verticalGaze>0?Math.min(.22,verticalGaze):0,
        lookDown:verticalGaze<0?Math.min(.22,Math.abs(verticalGaze)):0,
        browInnerUp:state.talking?Math.min(.16,.05+liveLevel*.12):0,
        browDownLeft:microFrown*.5,
        browDownRight:microFrown*.5,
        cheekRaise:state.talking?Math.min(.14,liveLevel*.11+microSmile*.3):microSmile*.28,
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
          source:'bj-production-v12-life-layer',
          legacySource:'bj-production-v7-life-layer',
          visualUpgradeSource:'bj-production-v8-life-layer',
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
      referenceMatchedPreview:Boolean(published?.url),
      photoMatched:usingV15Preview||usingMetaHumanPreview?false:verifiedPhotoMatch,
      certifiedLikeness:usingV15Preview||usingMetaHumanPreview?false:verifiedPhotoMatch,
      proceduralFallbackSuppressed:true,
      metahumanWebPreview:usingMetaHumanPreview,
      metaHumanLikenessApproved:false,
      productionMaterials,
      texturePipeline:'pbr-mobile-production-v12',
      visualTexturePipeline:'pbr-mobile-production-v8',
      visualPass:'bj-v12-material-eye-hair-fabric',
      textureAnisotropy:8,
      lifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v12',
      legacyLifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v7',
      visualLifeLayer:'blink-lipsync-breathing-eye-focus-microgesture-v8',
      groundedContactShadow:true,
      asymmetricBlink:true,
      idleMicroExpression:true,
      autonomicLife:true,
      conversationFocus:true,
    }}))

    return {
      object,
      mixer,
      clips,
      morphTargetNames:morphs.names,
      applyFacePose,
      playGesture,
      tick,
      dispose:()=>{
        window.removeEventListener('tryamm:bj-gesture',onGesture)
        window.removeEventListener('tryamm:character-face-pose',onFacePose)
        mixer?.stopAllAction()
        shadowGeometry.dispose();shadowMaterial.dispose()
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
