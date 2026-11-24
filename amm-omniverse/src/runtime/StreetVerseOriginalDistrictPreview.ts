/**
 * Original StreetVerse district visualization for the existing Three.js renderer.
 * Synthetic, reversible preview only: it cannot modify authoritative collisions,
 * roads, player position, mission progress, payments or server world state.
 */
import * as THREE from 'three'
import type {GeneratedDistrict,CityFeature} from '../data/StreetVerseLivingCityGenerator'

export const STREETVERSE_PREVIEW_MAX_FEATURES=24
const VALID_TYPES=new Set(['road','bridge','transit','building','landmark','mission'])
const bounded=(n:unknown)=>typeof n==='number'&&Number.isFinite(n)&&Math.abs(n)<=10000
export function validateStreetVersePreview(district:GeneratedDistrict):string[]{
 if(!district||!Array.isArray(district.features)||district.features.length>150)return ['invalid-feature-list']
 const errors:string[]=[]
 const ids=new Set<string>()
 for(const feature of district.features){
  if(!feature||typeof feature.id!=='string'||ids.has(feature.id)||!VALID_TYPES.has(feature.type)||!bounded(feature.x)||!bounded(feature.z))errors.push('invalid-feature')
  if(feature?.id)ids.add(feature.id)
 }
 return [...new Set(errors)]
}
export function buildStreetVerseDistrictPreview(district:GeneratedDistrict,origin:THREE.Vector3){
 const errors=validateStreetVersePreview(district)
 if(errors.length)throw new Error(errors.join(', '))
 const group=new THREE.Group()
 group.name='streetverse-original-district-visual-preview'
 group.userData={visualOnly:true,source:'streetverse-original-engine',collisionAuthority:'none',cityId:district.cityId,district:district.district}
 let count=0
 const materials=[
  new THREE.MeshStandardMaterial({color:0x303844,roughness:.9}),
  new THREE.MeshStandardMaterial({color:0x657887,roughness:.7}),
  new THREE.MeshStandardMaterial({color:0x5f8b9b,roughness:.75}),
  new THREE.MeshStandardMaterial({color:0x344f6b,roughness:.8}),
  new THREE.MeshStandardMaterial({color:0x20f1d8,emissive:0x0a635f,emissiveIntensity:.45}),
 ]
 const create=(feature:CityFeature,index:number)=>{
  // The existing main Chicago scene spans roughly +/- 95m.
  // Render a compact sample beside, not over, the player. All geometry is visual only.
  const x=origin.x+Math.min(52,Math.max(-52,feature.x*.11))-26
  const z=origin.z+Math.min(52,Math.max(-52,feature.z*.11))-26
  let geometry:THREE.BufferGeometry
  let material:THREE.Material
  let y=.04
  switch(feature.type){
   case 'road': geometry=new THREE.BoxGeometry(feature.tag==='north-south'?2.4:Math.max(8,(feature.length||80)*.11),.06,feature.tag==='north-south'?Math.max(8,(feature.length||80)*.11):2.4);material=materials[0];break
   case 'bridge':geometry=new THREE.BoxGeometry(9,.4,2.5);material=materials[1];y=.36;break
   case 'building':{const height=4+(index%5)*1.8;geometry=new THREE.BoxGeometry(3.8,height,3.8);material=materials[3];y=height/2;break}
   case 'transit':geometry=new THREE.CylinderGeometry(1.8,1.8,.3,12);material=materials[2];y=.2;break
   case 'landmark':geometry=new THREE.ConeGeometry(2.4,6,8);material=materials[4];y=3;break
   default:geometry=new THREE.SphereGeometry(.7,10,8);material=materials[4];y=1.5;break
  }
  const mesh=new THREE.Mesh(geometry,material)
  mesh.position.set(x,y,z)
  mesh.name='sv-original-preview-'+feature.id
  mesh.userData={previewOnly:true,featureId:feature.id,featureType:feature.type,label:feature.tag}
  mesh.castShadow=false;mesh.receiveShadow=false
  group.add(mesh)
 }
 // A mix of surfaces is more informative than truncating the first 24 road entries.
 const order=['road','bridge','building','transit','mission','landmark']
 for(const type of order){
  const quota=type==='building' ? (district.features.some(f=>f.id.includes(':anchor:')) ? 9 : 10) : type==='road' ? 7 : type==='mission' ? 5 : 2
  for(const [index,feature] of district.features.filter(f=>f.type===type).slice(0,quota).entries()){
   if(count>=STREETVERSE_PREVIEW_MAX_FEATURES)break
   create(feature,index);count++
  }
 }
 return {group,count,dispose:()=>{
  group.removeFromParent()
  group.traverse(child=>{if(child instanceof THREE.Mesh)child.geometry.dispose()})
  for(const m of materials)m.dispose()
 }}
}
