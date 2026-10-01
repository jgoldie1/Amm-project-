import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {STREETVERSE_FACE_CHANNELS,STREETVERSE_HEAD_SLOT_CONTRACT,type StreetVerseFacePose} from '../data/streetVerseCharacterHeadRig'

const PROCEDURAL_HEAD_NAMES=new Set([
 'hero-head','jaw','chin','cheek-left','cheek-right','ear-left','ear-right','nose',
 'eyelid-left','eyelid-right','eye-white-left','eye-white-right','iris-left','iris-right',
 'pupil-left','pupil-right','brow-left','brow-right','upper-lip','lower-lip','hair-close-crop',
 'bj-loc-crown','bj-loc-tie','bj-pulled-loc','bj-rear-loc-bundle','bj-v4-shoulder-loc',
 'bj-full-beard','bj-moustache','bj-beard-gray-fleck','bj-gray-chin-panel',
 'bj-gray-beard-side-left','bj-gray-beard-side-right','bj-beard-side-left','bj-beard-side-right',
 'bj-beard-chin','bj-beard-blend-left','bj-beard-blend-right','bj-under-eye-left','bj-under-eye-right',
 'bj-nose-bridge','bj-nose-tip','bj-v4-ear-inner-left','bj-v4-ear-inner-right',
 'bj-eye-catchlight-left','bj-eye-catchlight-right','bj-jaw-shadow',
])

const MORPH_ALIASES:Record<string,readonly string[]>={
 blinkLeft:['blinkLeft','eyeBlinkLeft','EyeBlinkLeft'],
 blinkRight:['blinkRight','eyeBlinkRight','EyeBlinkRight'],
 lookLeft:['lookLeft','eyeLookOutLeft','eyeLookInRight'],
 lookRight:['lookRight','eyeLookOutRight','eyeLookInLeft'],
 lookUp:['lookUp','eyeLookUpLeft','eyeLookUpRight'],
 lookDown:['lookDown','eyeLookDownLeft','eyeLookDownRight'],
 jawOpen:['jawOpen','JawOpen'],
 mouthSmile:['mouthSmile','mouthSmileLeft','mouthSmileRight'],
 mouthFrown:['mouthFrown','mouthFrownLeft','mouthFrownRight'],
 mouthWide:['mouthWide','mouthStretchLeft','mouthStretchRight'],
 mouthNarrow:['mouthNarrow','mouthPucker','mouthFunnel'],
 browInnerUp:['browInnerUp','BrowInnerUp'],
 browDownLeft:['browDownLeft','BrowDownLeft'],
 browDownRight:['browDownRight','BrowDownRight'],
 cheekRaise:['cheekRaise','cheekSquintLeft','cheekSquintRight'],
}

function setMorph(mesh:THREE.Mesh,aliases:readonly string[],value:number){
 const dict=(mesh as THREE.Mesh & {morphTargetDictionary?:Record<string,number>}).morphTargetDictionary
 const influences=(mesh as THREE.Mesh & {morphTargetInfluences?:number[]}).morphTargetInfluences
 if(!dict||!influences)return false
 let matched=false
 for(const alias of aliases){
  const index=dict[alias]
  if(Number.isInteger(index)){influences[index]=THREE.MathUtils.clamp(value,0,1);matched=true}
 }
 return matched
}

function applyMorphPose(root:THREE.Object3D,pose:StreetVerseFacePose){
 let matches=0
 root.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return
  for(const channel of STREETVERSE_FACE_CHANNELS){
   const value=pose[channel]
   if(value==null)continue
   if(setMorph(object,MORPH_ALIASES[channel]||[channel],value))matches++
  }
 })
 return matches
}

function captureBaseline(root:THREE.Object3D){
 const names=['jaw','upper-lip','lower-lip','cheek-left','cheek-right','brow-left','brow-right','eyelid-left','eyelid-right','iris-left','iris-right','pupil-left','pupil-right']
 const map=new Map<string,{position:THREE.Vector3;rotation:THREE.Euler;scale:THREE.Vector3}>()
 for(const name of names){const o=root.getObjectByName(name);if(o)map.set(name,{position:o.position.clone(),rotation:o.rotation.clone(),scale:o.scale.clone()})}
 return map
}

function applyProceduralPose(root:THREE.Object3D,baseline:ReturnType<typeof captureBaseline>,pose:StreetVerseFacePose){
 const set=(name:string,fn:(o:THREE.Object3D,b:{position:THREE.Vector3;rotation:THREE.Euler;scale:THREE.Vector3})=>void)=>{const o=root.getObjectByName(name),b=baseline.get(name);if(o&&b)fn(o,b)}
 const jawOpen=THREE.MathUtils.clamp(pose.jawOpen??0,0,1)
 set('jaw',(o,b)=>{o.rotation.x=b.rotation.x+jawOpen*.18})
 const smile=THREE.MathUtils.clamp(pose.mouthSmile??0,0,1),frown=THREE.MathUtils.clamp(pose.mouthFrown??0,0,1),wide=THREE.MathUtils.clamp(pose.mouthWide??0,0,1),narrow=THREE.MathUtils.clamp(pose.mouthNarrow??0,0,1)
 for(const name of ['upper-lip','lower-lip'])set(name,(o,b)=>{o.scale.x=b.scale.x*(1+wide*.24-narrow*.18);o.position.y=b.position.y+(smile*.012-frown*.012)*(name==='upper-lip'?1:-.65)})
 const cheek=THREE.MathUtils.clamp(pose.cheekRaise??0,0,1)
 for(const name of ['cheek-left','cheek-right'])set(name,(o,b)=>{o.position.y=b.position.y+cheek*.018;o.scale.y=b.scale.y*(1+cheek*.08)})
 const inner=THREE.MathUtils.clamp(pose.browInnerUp??0,0,1),bdl=THREE.MathUtils.clamp(pose.browDownLeft??0,0,1),bdr=THREE.MathUtils.clamp(pose.browDownRight??0,0,1)
 set('brow-left',(o,b)=>{o.position.y=b.position.y+inner*.025-bdl*.018;o.rotation.z=b.rotation.z-bdl*.10})
 set('brow-right',(o,b)=>{o.position.y=b.position.y+inner*.025-bdr*.018;o.rotation.z=b.rotation.z+bdr*.10})
 const bl=THREE.MathUtils.clamp(pose.blinkLeft??0,0,1),br=THREE.MathUtils.clamp(pose.blinkRight??0,0,1)
 set('eyelid-left',(o,b)=>{o.scale.y=b.scale.y*(1+bl*2.8);o.position.y=b.position.y-bl*.016})
 set('eyelid-right',(o,b)=>{o.scale.y=b.scale.y*(1+br*2.8);o.position.y=b.position.y-br*.016})
 const lookX=(THREE.MathUtils.clamp(pose.lookRight??0,0,1)-THREE.MathUtils.clamp(pose.lookLeft??0,0,1))*.20
 const lookY=(THREE.MathUtils.clamp(pose.lookUp??0,0,1)-THREE.MathUtils.clamp(pose.lookDown??0,0,1))*.12
 for(const name of ['iris-left','iris-right','pupil-left','pupil-right'])set(name,(o,b)=>{o.rotation.y=b.rotation.y+lookX;o.rotation.x=b.rotation.x-lookY})
}

function collectProceduralHead(root:THREE.Object3D){
 const nodes:THREE.Object3D[]=[]
 root.traverse(object=>{
  if(PROCEDURAL_HEAD_NAMES.has(object.name)||object.name.startsWith('bj-v4-')||object.name.startsWith('bj-gray-'))nodes.push(object)
 })
 return nodes
}

export function installStreetVerseCharacterHeadRuntime(characterRoot:THREE.Object3D,characterId:string){
 const headRig=characterRoot.getObjectByName(STREETVERSE_HEAD_SLOT_CONTRACT.preserveParentRig)
 if(!headRig)throw new Error('Character head rig missing: '+STREETVERSE_HEAD_SLOT_CONTRACT.preserveParentRig)

 let slot=headRig.getObjectByName(STREETVERSE_HEAD_SLOT_CONTRACT.rootName) as THREE.Group|null
 if(!slot){
  slot=new THREE.Group()
  slot.name=STREETVERSE_HEAD_SLOT_CONTRACT.rootName
  slot.userData={characterId,headSlotVersion:'v5',replaceable:true,preserveBodyRig:true}
  headRig.add(slot)
 }
 const proceduralNodes=collectProceduralHead(headRig)
 const proceduralBaseline=captureBaseline(headRig)
 const blushMaterial=new THREE.MeshBasicMaterial({color:0xc54b55,transparent:true,opacity:0,depthWrite:false})
 const blushLeft=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),blushMaterial.clone())
 blushLeft.name='character-blush-left';blushLeft.position.set(-.17,-.055,.30);blushLeft.scale.set(1.2,.65,.34);headRig.add(blushLeft)
 const blushRight=new THREE.Mesh(new THREE.SphereGeometry(.085,12,8),blushMaterial.clone())
 blushRight.name='character-blush-right';blushRight.position.set(.17,-.055,.30);blushRight.scale.set(1.2,.65,.34);headRig.add(blushRight)
 const pupilNodes=['pupil-left','pupil-right'].map(name=>headRig.getObjectByName(name)).filter((x):x is THREE.Object3D=>Boolean(x))
 const pupilBaseline=pupilNodes.map(node=>node.scale.clone())
 let activeReplacement:THREE.Object3D|null=null
 let activeAssetId='procedural-v4'
 let activeEra='current'
 let disposed=false
 const loader=new GLTFLoader()

 const setProceduralVisible=(visible:boolean)=>proceduralNodes.forEach(node=>{node.visible=visible})

 const removeReplacement=()=>{
  if(!activeReplacement)return
  activeReplacement.removeFromParent()
  activeReplacement.traverse(object=>{
   if(!(object instanceof THREE.Mesh))return
   object.geometry?.dispose?.()
   const materials=Array.isArray(object.material)?object.material:[object.material]
   materials.forEach(material=>material?.dispose?.())
  })
  activeReplacement=null
 }

 const restoreProcedural=()=>{
  removeReplacement()
  setProceduralVisible(true)
  activeAssetId='procedural-v4'
  window.dispatchEvent(new CustomEvent('tryamm:character-head-ready',{detail:{characterId,assetId:activeAssetId,era:activeEra,photoMatched:false,source:'v5-head-runtime'}}))
 }

 const mountReplacement=(object:THREE.Object3D,assetId:string,era:string,photoMatched:boolean)=>{
  removeReplacement()
  setProceduralVisible(false)
  activeReplacement=object
  activeReplacement.name='character-head-replacement'
  activeReplacement.userData={...activeReplacement.userData,characterId,assetId,era,photoMatched,headSlotVersion:'v5'}
  slot!.add(activeReplacement)
  activeAssetId=assetId
  activeEra=era
  window.dispatchEvent(new CustomEvent('tryamm:character-head-ready',{detail:{characterId,assetId,era,photoMatched,source:'v5-head-runtime'}}))
 }

 const loadHead=async(detail:{assetId:string;assetUrl:string;era?:string;photoMatched?:boolean})=>{
  if(disposed)return
  window.dispatchEvent(new CustomEvent('tryamm:character-head-loading',{detail:{characterId,...detail,source:'v5-head-runtime'}}))
  try{
   const gltf=await loader.loadAsync(detail.assetUrl)
   if(disposed){gltf.scene.clear();return}
   mountReplacement(gltf.scene,detail.assetId,detail.era||'current',Boolean(detail.photoMatched))
  }catch(error){
   setProceduralVisible(true)
   window.dispatchEvent(new CustomEvent('tryamm:character-head-error',{detail:{characterId,assetId:detail.assetId,error:String(error),source:'v5-head-runtime'}}))
  }
 }

 const onReplace=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;assetId?:string;assetUrl?:string;era?:string;photoMatched?:boolean}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  if(!detail.assetId||!detail.assetUrl)return
  void loadHead({assetId:detail.assetId,assetUrl:detail.assetUrl,era:detail.era,photoMatched:detail.photoMatched})
 }
 const onRestore=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;era?:string}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  if(detail.era)activeEra=detail.era
  restoreProcedural()
 }
 const onAffectVisual=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;blush?:number;pupilDilation?:number}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  const blush=THREE.MathUtils.clamp(Number(detail.blush||0),0,1)
  ;(blushLeft.material as THREE.MeshBasicMaterial).opacity=blush*.34
  ;(blushRight.material as THREE.MeshBasicMaterial).opacity=blush*.34
  const dilation=THREE.MathUtils.clamp(Number(detail.pupilDilation||0),-.25,.35)
  pupilNodes.forEach((node,i)=>{
   const base=pupilBaseline[i]
   if(base)node.scale.set(base.x*(1+dilation),base.y*(1+dilation),base.z)
  })
 }
 const onPose=(event:Event)=>{
  const detail=(event as CustomEvent<{characterId?:string;pose?:StreetVerseFacePose}>).detail||{}
  if(detail.characterId&&detail.characterId!==characterId)return
  if(!detail.pose)return
  const target=activeReplacement||headRig
  const morphMatches=applyMorphPose(target,detail.pose)
  if(!activeReplacement||morphMatches===0)applyProceduralPose(headRig,proceduralBaseline,detail.pose)
  window.dispatchEvent(new CustomEvent('tryamm:character-face-pose-applied',{detail:{characterId,assetId:activeAssetId,morphMatches,proceduralFallback:!activeReplacement||morphMatches===0,source:'v5-head-runtime'}}))
 }

 window.addEventListener('tryamm:character-head-replace',onReplace)
 window.addEventListener('tryamm:character-head-restore-procedural',onRestore)
 window.addEventListener('tryamm:character-face-pose',onPose)
 window.addEventListener('tryamm:character-affect-visual',onAffectVisual)

 window.dispatchEvent(new CustomEvent('tryamm:character-head-ready',{detail:{characterId,assetId:activeAssetId,era:activeEra,photoMatched:false,headSlotVersion:'v5',source:'v5-head-runtime'}}))

 return{
  getState:()=>({characterId,activeAssetId,activeEra,photoMatched:Boolean(activeReplacement?.userData?.photoMatched),hasReplacement:Boolean(activeReplacement)}),
  applyPose:(pose:StreetVerseFacePose)=>{const matches=applyMorphPose(activeReplacement||headRig,pose);if(!activeReplacement||matches===0)applyProceduralPose(headRig,proceduralBaseline,pose);return matches},
  restoreProcedural,
  dispose:()=>{
   disposed=true
   window.removeEventListener('tryamm:character-head-replace',onReplace)
   window.removeEventListener('tryamm:character-head-restore-procedural',onRestore)
   window.removeEventListener('tryamm:character-face-pose',onPose)
   window.removeEventListener('tryamm:character-affect-visual',onAffectVisual)
   removeReplacement()
   setProceduralVisible(true)
   blushLeft.geometry.dispose();blushRight.geometry.dispose();(blushLeft.material as THREE.Material).dispose();(blushRight.material as THREE.Material).dispose();slot?.removeFromParent()
  }
 }
}
