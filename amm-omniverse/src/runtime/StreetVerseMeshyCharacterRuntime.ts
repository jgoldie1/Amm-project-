import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {
  STREETVERSE_MESHY_CHARACTER_SLOTS,
  streetVerseMeshyCharacterUrl,
  type StreetVerseMeshyCharacterSlot,
} from '../data/streetVerseMeshyCharacterSlots'
import {normalizeStreetVerseHumanHeight} from './StreetVerseHumanScale'

const loader=new GLTFLoader()
const availability=new Map<string,Promise<boolean>>()

async function assetExists(url:string){
  if(!availability.has(url)){
    availability.set(url,(async()=>{
      try{
        const response=await fetch(url,{method:'HEAD',cache:'no-store'})
        return response.ok
      }catch{return false}
    })())
  }
  return availability.get(url)!
}

export type StreetVerseMeshyLoadedCharacter=Readonly<{
  slot:StreetVerseMeshyCharacterSlot
  object:THREE.Object3D
  sourceUrl:string
}>

export async function loadStreetVerseMeshyCharacter(slotId:string):Promise<StreetVerseMeshyLoadedCharacter|null>{
  const slot=STREETVERSE_MESHY_CHARACTER_SLOTS.find(x=>x.id===slotId)
  if(!slot)return null
  const sourceUrl=streetVerseMeshyCharacterUrl(slot)
  if(!(await assetExists(sourceUrl)))return null
  try{
    const gltf=await loader.loadAsync(sourceUrl)
    const object=gltf.scene
    object.name=`meshy-${slot.id}`
    object.userData={
      ...object.userData,
      streetVerseMeshy:true,
      slotId:slot.id,
      ageLane:slot.ageLane,
      heritage:slot.heritage,
      adultLaneEligible:slot.adultLaneEligible,
      sourceUrl,
      riggedGlbPreferred:true,
    }
    normalizeStreetVerseHumanHeight(object,slot.targetHeightMeters)
    object.traverse(node=>{
      if(node instanceof THREE.Mesh){
        node.castShadow=true
        node.receiveShadow=true
        node.frustumCulled=true
      }
    })
    window.dispatchEvent(new CustomEvent('tryamm:meshy-character-ready',{detail:{
      slotId:slot.id,
      filename:slot.filename,
      ageLane:slot.ageLane,
      adultLaneEligible:slot.adultLaneEligible,
      targetHeightMeters:slot.targetHeightMeters,
      sourceUrl,
    }}))
    return {slot,object,sourceUrl}
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
}
