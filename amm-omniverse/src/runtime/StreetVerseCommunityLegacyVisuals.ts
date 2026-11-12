import * as THREE from 'three'
import {
 STREETVERSE_LEGACY_SAVE_KEY,STREETVERSE_LEGACY_UPDATED,
 readStreetVerseCommunityLegacy,type StreetVerseLegacyProjectId,
} from './StreetVerseCommunityLegacyRuntime'

/** Three compact, low-poly Chicago upgrades. Decorative only until collision
 * and NPC navigation are independently certified; no fake accessible-route claims.
 */
export function installStreetVerseCommunityLegacyVisuals(scene:THREE.Scene){
 const root=new THREE.Group()
 root.name='streetverse-community-legacy-3d'
 const projects=new Map<StreetVerseLegacyProjectId,THREE.Group>()
 const material=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.78,metalness:.08})
 const box=(parent:THREE.Group,w:number,h:number,d:number,x:number,y:number,z:number,color:number)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material(color))
  mesh.position.set(x,y,z);parent.add(mesh);return mesh
 }
 const pole=(parent:THREE.Group,r:number,h:number,x:number,y:number,z:number,color:number)=>{
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,8),material(color))
  mesh.position.set(x,y,z);parent.add(mesh);return mesh
 }

 // A distinct sloped entrance beside the park. Actual wheelchair path collision
 // and slope certification belong to a later accessibility physics test.
 const ramp=new THREE.Group()
 ramp.name='streetverse-community-legacy-access-ramp'
 ramp.position.set(-38,0,34)
 const slope=box(ramp,3.2,.28,5.2,0,.22,0,0x9eafa9);slope.rotation.x=.07
 for(const side of [-1,1]){
  pole(ramp,.065,2.9,side*1.6,.9,0,0x4ee6ae).rotation.x=Math.PI/2
  for(const z of [-1.1,1.1])pole(ramp,.08,.9,side*1.6,.48,z,0x68a9a1)
 }
 box(ramp,3.6,.09,.75,0,.07,-2.5,0x60c9ab)
 projects.set('access-ramp',ramp);root.add(ramp)

 // A visible, fictional community harvest with raised beds.
 const garden=new THREE.Group()
 garden.name='streetverse-community-legacy-community-garden'
 garden.position.set(-27,0,52)
 for(const x of [-3,0,3])for(const z of [-1.8,1.8]){
  box(garden,2.1,.65,2,x,.37,z,0x8b5e38)
  box(garden,1.72,.16,1.62,x,.77,z,0x3d6c3a)
  for(const dx of [-.5,.5]){
   pole(garden,.06,.7,x+dx,1.14,z,0x4c8d52)
   const leaves=new THREE.Mesh(new THREE.SphereGeometry(.35,7,5),material(0x69bb60))
   leaves.position.set(x+dx,1.56,z);garden.add(leaves)
  }
 }
 projects.set('community-garden',garden);root.add(garden)

 // Low-cost pathway beacons. Each fixture has a visible solar panel and lamp.
 const solar=new THREE.Group()
 solar.name='streetverse-community-legacy-solar-wayfinding'
 for(const [x,z] of [[-45,33],[-45,43],[-45,53]]){
  const fixture=new THREE.Group();fixture.position.set(x,0,z)
  pole(fixture,.11,4.8,0,2.4,0,0x4c6674)
  const panel=box(fixture,1.6,.12,.95,.25,4.7,0,0x173e5b);panel.rotation.z=.18
  box(fixture,.75,.15,.58,0,3.9,.4,0xb9ffff)
  const light=new THREE.PointLight(0x9fefff,.4,6,2);light.position.set(0,3.8,.4);light.castShadow=false;fixture.add(light)
  solar.add(fixture)
 }
 projects.set('solar-wayfinding',solar);root.add(solar)

 root.traverse(node=>{node.userData={...node.userData,fictional:true,streetverseCommunityLegacy:true}})
 scene.add(root)
 const apply=(ids:readonly string[])=>{
  for(const [id,group] of projects)group.visible=ids.includes(id)
  // Report actual Three.js mesh visibility, not merely a saved button state.
  const visible=[...projects].filter(([,group])=>group.visible).map(([id])=>id)
  const mounted=root.parent===scene
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-community-legacy-visual-proof',{detail:{visible,sceneMounted:mounted,fictional:true}}))
 }
 const readSaved=()=>{
  try{return readStreetVerseCommunityLegacy(localStorage.getItem(STREETVERSE_LEGACY_SAVE_KEY)).built}
  catch{return [] as StreetVerseLegacyProjectId[]}
 }
 apply(readSaved())
 const onChange=(event:Event)=>{
  const detail=(event as CustomEvent<{built?:unknown}>).detail
  if(!Array.isArray(detail?.built))return
  apply(detail.built.filter((id):id is StreetVerseLegacyProjectId=>typeof id==='string'&&projects.has(id as StreetVerseLegacyProjectId)))
 }
 if(typeof window!=='undefined')window.addEventListener(STREETVERSE_LEGACY_UPDATED,onChange)
 let disposed=false
 return ()=>{
  if(disposed)return
  disposed=true
  if(typeof window!=='undefined')window.removeEventListener(STREETVERSE_LEGACY_UPDATED,onChange)
  scene.remove(root)
  root.traverse(node=>{
   const mesh=node as THREE.Mesh
   if(!mesh.isMesh)return
   mesh.geometry.dispose()
   const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material]
   for(const mat of materials)mat.dispose()
  })
 }
}
