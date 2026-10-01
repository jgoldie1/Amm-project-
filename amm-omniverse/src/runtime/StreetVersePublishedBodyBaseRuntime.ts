import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {resolvePublishedMeshyAsset,resetPublishedMeshyManifest} from './StreetVerseMeshyAssetManifest'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'

export type PublishedBodyBaseId='sv-james-body-base-v1'|'sv-female-body-base-v1'

const SPECS:Record<PublishedBodyBaseId,{name:string;height:number}>={
  'sv-james-body-base-v1':{name:'James body base',height:1.80},
  'sv-female-body-base-v1':{name:'Female body base',height:1.68},
}

export type StreetVersePublishedBodyHandle={
  assetId:PublishedBodyBaseId
  object:THREE.Object3D
  mixer:THREE.AnimationMixer|null
  clips:THREE.AnimationClip[]
  tick:(nowMs:number,state:{moving:boolean;running?:boolean})=>void
  dispose:()=>void
}

const loader=new GLTFLoader()

export async function loadStreetVersePublishedBodyBase(assetId:PublishedBodyBaseId,cityScope='global'):Promise<StreetVersePublishedBodyHandle|null>{
  const spec=SPECS[assetId]
  const published=await resolvePublishedMeshyAsset(assetId,cityScope)
  if(!published?.url)return null
  try{
    const gltf=await loader.loadAsync(published.url)
    const object=gltf.scene
    object.name=`meshy-body-${assetId}`
    normalizeStreetVerseHumanHeight(object,spec.height)
    object.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.castShadow=true
        node.receiveShadow=true
        node.frustumCulled=true
      }
    })
    const companion:THREE.AnimationClip[]=[]
    for(const [url,name] of [[published.walkUrl,'walk'],[published.runUrl,'run']] as const){
      if(!url)continue
      try{
        const extra=await loader.loadAsync(url)
        for(const clip of extra.animations||[]){const cloned=clip.clone();cloned.name=name;companion.push(cloned)}
      }catch{}
    }
    const clips=[...(gltf.animations||[]),...companion]
    const mixer=clips.length?new THREE.AnimationMixer(object):null
    const find=(re:RegExp[])=>clips.find(clip=>re.some(pattern=>pattern.test(clip.name)))
    const map={idle:find([/idle/i,/stand/i,/breath/i]),walk:find([/walk/i,/locomotion/i]),run:find([/run/i,/jog/i,/sprint/i])}
    let active='';let action:THREE.AnimationAction|null=null;let previousNow=performance.now()
    const tick=(nowMs:number,state:{moving:boolean;running?:boolean})=>{
      const motion=state.running?'run':state.moving?'walk':'idle'
      if(mixer&&active!==motion){
        const clip=map[motion]||map.walk||map.idle||clips[0]
        if(clip){
          const next=mixer.clipAction(clip);next.enabled=true;next.reset().play()
          if(action&&action!==next)action.crossFadeTo(next,.16,false)
          action=next;active=motion
        }
      }
      const dt=THREE.MathUtils.clamp((nowMs-previousNow)/1000,0,.05);previousNow=nowMs;mixer?.update(dt)
    }
    const dispose=()=>{mixer?.stopAllAction();object.removeFromParent();object.traverse(node=>{if(node instanceof THREE.Mesh){node.geometry?.dispose();const mats=Array.isArray(node.material)?node.material:[node.material];mats.forEach(material=>material?.dispose())}})}
    object.userData={...object.userData,assetId,displayName:spec.name,publishedMeshy:true,identityNeutral:assetId==='sv-james-body-base-v1'}
    return{assetId,object,mixer,clips,tick,dispose}
  }catch{return null}
}

export function resetStreetVersePublishedBodyBases(){resetPublishedMeshyManifest()}
