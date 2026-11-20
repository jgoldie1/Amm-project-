import * as THREE from 'three'
import {MINI_CITY_BUILDINGS,MINI_CITY_HUB,MINI_CITY_SAVE_KEY,miniCityCollision,recordMiniCityVisit,restoreMiniCityState,type MiniCityState} from './StreetVerseMiniCityState'
/** Original walkable mini-city pocket inside the existing Chicago scene. Buildings block movement.
 * Visual meshes and collisions are paired; does not alter other cities or production physics.
 */
export function mountStreetVerseMiniCity(scene:THREE.Scene){
 const root=new THREE.Group();root.name='streetverse-interactive-mini-city'
 const geometry:THREE.BufferGeometry[]=[];const materials:THREE.Material[]=[]
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,color:number,name:string)=>{
  const geo=new THREE.BoxGeometry(w,h,d),mat=new THREE.MeshStandardMaterial({color,roughness:.81})
  const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.position.set(x,y,z);mesh.castShadow=false;mesh.receiveShadow=true
  root.add(mesh);geometry.push(geo);materials.push(mat)
 }
 box(62,.03,63,22,.06,27,0x496c65,'mini-city-walkable-courtyard')
 box(62,.09,62,3,.15,15,0x8298a2,'mini-city-central-walkway')
 MINI_CITY_BUILDINGS.forEach((b,i)=>box(b.x,2.4,b.z,b.halfX*2,4.8,b.halfZ*2,[0x58638d,0x776456,0x397d79][i],b.id))
 box(62,.18,62,2,.32,2,0x31bbcb,'mini-city-checkpoint')
 scene.add(root)
 let state:MiniCityState
 try{state=restoreMiniCityState(localStorage.getItem(MINI_CITY_SAVE_KEY))}catch{state=restoreMiniCityState(null)}
 const onCheckIn=(event:Event)=>{
  const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{}
  const outcome=recordMiniCityVisit(state,Number(d.x),Number(d.z),new Date().toISOString())
  if(outcome.ok){state=outcome.state;try{localStorage.setItem(MINI_CITY_SAVE_KEY,JSON.stringify(state))}catch{}}
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mini-city-checkin-result',{detail:{...outcome,localOnly:true,source:'streetverse-mini-city'}}))
 }
 window.addEventListener('tryamm:streetverse-mini-city-checkin-request',onCheckIn)
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-mini-city-mounted',{detail:{location:MINI_CITY_HUB,buildings:MINI_CITY_BUILDINGS.length,collision:true,save:'local-device-only',visited:state.visited}}))
 return {root,blocked:miniCityCollision,readState:()=>({...state}),dispose:()=>{
  window.removeEventListener('tryamm:streetverse-mini-city-checkin-request',onCheckIn)
  root.removeFromParent();geometry.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())
 }}
}
