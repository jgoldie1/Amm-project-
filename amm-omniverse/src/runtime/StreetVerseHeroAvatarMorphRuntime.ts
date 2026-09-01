import * as THREE from 'three'

export type HeroAvatarMorphProfile={
  version:'2026-09-01'
  source:'video'|'photo'|'mixed'|'default'
  headWidth:number
  headHeight:number
  jawWidth:number
  eyeSpacing:number
  noseLength:number
  faceDepth:number
  confidence:number
  rawMediaRetained:false
  identityTemplate:false
  createdAt:string
}

const KEY='tryamm.streetverse.hero-morph.v1'

const clamp=(v:number,min=.65,max=1.35)=>Math.min(max,Math.max(min,v))

export function createHeroAvatarMorphProfile(input:{
  source?:HeroAvatarMorphProfile['source']
  faceBox?:{w:number;h:number}|null
  leftEye?:[number,number]|null
  rightEye?:[number,number]|null
  nose?:[number,number]|null
  mouth?:[number,number]|null
  jawLeft?:[number,number]|null
  jawRight?:[number,number]|null
  confidence?:number
}):HeroAvatarMorphProfile{
  const w=Math.max(1,input.faceBox?.w||100),h=Math.max(1,input.faceBox?.h||125)
  const eyeDistance=input.leftEye&&input.rightEye?Math.abs(input.rightEye[0]-input.leftEye[0]):w*.34
  const jawDistance=input.jawLeft&&input.jawRight?Math.abs(input.jawRight[0]-input.jawLeft[0]):w*.86
  const noseToMouth=input.nose&&input.mouth?Math.abs(input.mouth[1]-input.nose[1]):h*.18
  return {
    version:'2026-09-01',
    source:input.source||'default',
    headWidth:clamp((w/h)/.80),
    headHeight:clamp((h/w)/1.25),
    jawWidth:clamp((jawDistance/w)/.86),
    eyeSpacing:clamp((eyeDistance/w)/.34),
    noseLength:clamp((noseToMouth/h)/.18),
    faceDepth:1,
    confidence:Math.max(0,Math.min(1,input.confidence??(input.faceBox?.w?0.75:0))),
    rawMediaRetained:false,
    identityTemplate:false,
    createdAt:new Date().toISOString(),
  }
}

export function saveHeroAvatarMorphProfile(profile:HeroAvatarMorphProfile){
  if(typeof localStorage==='undefined')return
  localStorage.setItem(KEY,JSON.stringify(profile))
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:hero-avatar-morph-saved',{detail:{...profile,rawMediaRetained:false,identityTemplate:false}}))
}

export function loadHeroAvatarMorphProfile():HeroAvatarMorphProfile|null{
  if(typeof localStorage==='undefined')return null
  try{
    const parsed=JSON.parse(localStorage.getItem(KEY)||'null') as HeroAvatarMorphProfile|null
    return parsed?.version==='2026-09-01'?parsed:null
  }catch{return null}
}

export function deleteHeroAvatarMorphProfile(){
  if(typeof localStorage!=='undefined')localStorage.removeItem(KEY)
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:hero-avatar-morph-deleted'))
}

function setMorph(mesh:THREE.Mesh,nameCandidates:string[],value:number){
  const dict=mesh.morphTargetDictionary
  const influences=mesh.morphTargetInfluences
  if(!dict||!influences)return false
  const normalized=value-1
  for(const name of nameCandidates){
    const index=dict[name]
    if(index!==undefined){influences[index]=THREE.MathUtils.clamp(normalized,-1,1);return true}
  }
  return false
}

export function applyHeroAvatarMorphProfile(model:THREE.Object3D,profile:HeroAvatarMorphProfile|null){
  if(!profile)return {applied:false,morphTargets:0,scaledHeads:0}
  let morphTargets=0,scaledHeads=0
  model.traverse(node=>{
    if(!(node instanceof THREE.Mesh))return
    const name=node.name.toLowerCase()
    morphTargets+=Number(setMorph(node,['headWidth','head_width','HeadWidth'],profile.headWidth))
    morphTargets+=Number(setMorph(node,['headHeight','head_height','HeadHeight'],profile.headHeight))
    morphTargets+=Number(setMorph(node,['jawWidth','jaw_width','JawWidth'],profile.jawWidth))
    morphTargets+=Number(setMorph(node,['eyeSpacing','eye_spacing','EyeSpacing'],profile.eyeSpacing))
    morphTargets+=Number(setMorph(node,['noseLength','nose_length','NoseLength'],profile.noseLength))
    if((name.includes('head')||name.includes('face'))&&morphTargets===0){
      node.scale.x*=THREE.MathUtils.clamp(profile.headWidth,.88,1.12)
      node.scale.y*=THREE.MathUtils.clamp(profile.headHeight,.90,1.10)
      node.scale.z*=THREE.MathUtils.clamp(profile.faceDepth,.92,1.08)
      scaledHeads++
    }
  })
  model.userData.tryammAvatarMorph={version:profile.version,confidence:profile.confidence,source:profile.source,rawMediaRetained:false,identityTemplate:false}
  return {applied:morphTargets>0||scaledHeads>0,morphTargets,scaledHeads}
}
