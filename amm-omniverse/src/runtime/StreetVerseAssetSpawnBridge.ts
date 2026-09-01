import * as THREE from 'three'
import type { HoloForgeAssetManifest } from './HoloForgeAssetRuntime'

export type StreetVerseSpawnedAsset={id:string;kind:HoloForgeAssetManifest['kind'];object:THREE.Object3D;manifest:HoloForgeAssetManifest;createdAt:number}

const palette:Record<string,number>={character:0x7be7ff,vehicle:0x6f8cff,building:0x9a7655,prop:0xffd35e,animal:0xc58a55,road:0x34383f,mission:0x79ffad,fx:0xd66cff,ui:0xffffff,audio:0xffffff}
function material(color:number){return new THREE.MeshStandardMaterial({color,roughness:.62,metalness:.12})}
function shadow(root:THREE.Object3D){root.traverse(o=>{const mesh=o as THREE.Mesh;if(mesh.isMesh){mesh.castShadow=true;mesh.receiveShadow=true}});return root}

function primitive(manifest:HoloForgeAssetManifest){
 const color=palette[manifest.kind]||0x58e8ff
 if(manifest.kind==='vehicle'){
  const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(4.4,.9,2.1),material(color));body.position.y=.9;g.add(body);const cabin=new THREE.Mesh(new THREE.BoxGeometry(2.2,.75,1.7),material(0x172535));cabin.position.set(-.15,1.55,0);g.add(cabin);return shadow(g)
 }
 if(manifest.kind==='character'){
  const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.48,1.35,5,9),material(color));body.position.y=1.25;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.42,14,10),material(0xd6a17e));head.position.y=2.65;g.add(head);return shadow(g)
 }
 if(manifest.kind==='animal'){
  const g=new THREE.Group();const torso=new THREE.Mesh(new THREE.BoxGeometry(1.8,.8,.75),material(color));torso.position.y=.9;g.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.38,12,9),material(color));head.position.set(1,.98,0);g.add(head);return shadow(g)
 }
 if(manifest.kind==='building'){
  const h=10+Math.min(22,manifest.prompt.length%18);const mesh=new THREE.Mesh(new THREE.BoxGeometry(10,h,10),material(color));mesh.position.y=h/2;return shadow(mesh)
 }
 if(manifest.kind==='road'){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(22,.12,7),material(color));mesh.position.y=.07;return mesh
 }
 if(manifest.kind==='fx'){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(1.3,18,12),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.55}));mesh.position.y=2;return mesh
 }
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.8,1.8),material(color));mesh.position.y=.9;return shadow(mesh)
}

function safePosition(scene:THREE.Scene,index:number){
 const ring=20+Math.floor(index/8)*7;const angle=(index%8)/8*Math.PI*2;return new THREE.Vector3(Math.cos(angle)*ring,0,Math.sin(angle)*ring+8)
}

export function installStreetVerseAssetSpawnBridge(scene:THREE.Scene,buildingBoxes:THREE.Box3[],treeColliders:THREE.Box3[]){
 const spawned=new Map<string,StreetVerseSpawnedAsset>()
 const onSpawn=(event:Event)=>{
  const manifest=(event as CustomEvent<HoloForgeAssetManifest>).detail
  if(!manifest?.id||spawned.has(manifest.id)||!manifest.integration?.spawnable)return
  const object=primitive(manifest);const position=safePosition(scene,spawned.size);object.position.x+=position.x;object.position.z+=position.z;object.userData={...object.userData,holoforgeAssetId:manifest.id,assetKind:manifest.kind,worldSessionId:manifest.worldSessionId,missionId:manifest.missionId,tags:manifest.tags,generated:true}
  scene.add(object)
  if(manifest.integration.collision){const box=new THREE.Box3().setFromObject(object).expandByScalar(.35);if(manifest.kind==='building')buildingBoxes.push(box);else if(['prop','road'].includes(manifest.kind))treeColliders.push(box)}
  const entry={id:manifest.id,kind:manifest.kind,object,manifest,createdAt:Date.now()};spawned.set(manifest.id,entry)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-materialized',{detail:{assetId:manifest.id,kind:manifest.kind,worldSessionId:manifest.worldSessionId,missionId:manifest.missionId,position:{x:object.position.x,y:object.position.y,z:object.position.z},integration:manifest.integration}}))
 }
 window.addEventListener('tryamm:streetverse-asset-spawn-request',onSpawn)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-asset-spawn-ready',{detail:{ready:true,capabilities:['materialize','collision','world-session','mission-binding','generated-metadata']}}))
 return {spawned,dispose(){window.removeEventListener('tryamm:streetverse-asset-spawn-request',onSpawn);spawned.forEach(entry=>{scene.remove(entry.object);entry.object.traverse(o=>{const mesh=o as THREE.Mesh;if(mesh.isMesh){mesh.geometry?.dispose();const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];mats.forEach(m=>m?.dispose())}})});spawned.clear()}}
}
