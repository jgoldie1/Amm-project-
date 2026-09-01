import * as THREE from 'three'
import { replacePrimitiveWithStreetVerseAsset,preloadStreetVerseAssets } from '../services/streetverseAssetLoader'

export const STREETVERSE_CHARACTER_PACK={
 hero:{id:'player-hero-v1',fallbackId:'player-default',quality:'hero' as const},
 residents:[
  {id:'npc-resident-premium-a',fallbackId:'npc-citizen-a',quality:'premium' as const},
  {id:'npc-resident-premium-b',fallbackId:'npc-citizen-a',quality:'premium' as const},
  {id:'npc-resident-premium-c',fallbackId:'npc-citizen-a',quality:'premium' as const},
 ],
 benny:{id:'benny-holographic-host-v1',quality:'hero' as const}
}

export async function preloadStreetVerseCharacterPack(){
 const ids=[STREETVERSE_CHARACTER_PACK.hero.id,...STREETVERSE_CHARACTER_PACK.residents.map(x=>x.id),STREETVERSE_CHARACTER_PACK.benny.id]
 await preloadStreetVerseAssets(ids)
}

export async function materializeStreetVerseCharacter(options:{assetId:string;fallback:THREE.Object3D;scene:THREE.Scene;position?:THREE.Vector3;rotationY?:number;scale?:number}){
 // Rights-gated GLB/glTF replacement. If the file is absent, invalid or uncleared, the procedural body stays live.
 return replacePrimitiveWithStreetVerseAsset({...options,id:options.assetId,requireClearance:true})
}

export function requestCharacterMaterialization(detail:{assetId:string;role:'player'|'resident'|'benny';quality:'hero'|'premium';fallbackId?:string}){
 if(typeof window==='undefined')return
 window.dispatchEvent(new CustomEvent('tryamm:character-materialization-request',{detail:{...detail,pipeline:'streetverse-photoreal-v1',fallbackRequired:true,rightsGate:true,createdAt:new Date().toISOString()}}))
}
