import * as THREE from 'three'
import type {ChicagoEra} from './StreetVerseChicagoTimeSwitchRuntime'

/** Procedural Three.js HoloLab chamber and visible era swaps; rigged BJ integration is separate. */
export function createHoloLabChamberScene(scene:THREE.Scene){
 const root=new THREE.Group()
 root.name='HoloLabChamber'
 const floor=new THREE.Mesh(new THREE.CylinderGeometry(3.8,3.8,0.2,48),new THREE.MeshStandardMaterial({color:0x273b4b,metalness:0.6,roughness:0.35}))
 floor.position.y=-0.12;floor.receiveShadow=true;root.add(floor)
 const ring=new THREE.Mesh(new THREE.TorusGeometry(2.2,0.14,12,64),new THREE.MeshStandardMaterial({color:0x66d9ff,emissive:0x2277aa,emissiveIntensity:1.1,metalness:0.5}))
 ring.position.set(0,2.4,-1.2);root.add(ring)
 const portal=new THREE.Mesh(new THREE.CircleGeometry(2.05,64),new THREE.MeshBasicMaterial({color:0x4f90cc,transparent:true,opacity:0.24,side:THREE.DoubleSide,depthWrite:false}))
 portal.position.set(0,2.4,-1.23);root.add(portal)
 const world=new THREE.Group();world.name='HoloLabEraWorld';root.add(world)
 const palettes:Record<ChicagoEra,{ground:number;buildings:number;accent:number}>={
  past:{ground:0x82664a,buildings:0x9e6246,accent:0xe8ae69},
  present:{ground:0x465965,buildings:0x667a8a,accent:0x66d9ff},
  future:{ground:0x272b5c,buildings:0x694eab,accent:0xd178ff},
 }
 let active:ChicagoEra='present'
 let intensity=0
 const draw=(era:ChicagoEra)=>{
  while(world.children.length){const child=world.children[0];world.remove(child);if(child instanceof THREE.Mesh){child.geometry.dispose();if(Array.isArray(child.material))child.material.forEach(m=>m.dispose());else child.material.dispose()}}
  const p=palettes[era]
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(22,22),new THREE.MeshStandardMaterial({color:p.ground}))
  ground.rotation.x=-Math.PI/2;ground.position.set(0,-0.22,-8);world.add(ground)
  for(let i=0;i<8;i++){
   const height=era==='future'?4+i%4:era==='past'?2+i%2:3+i%3
   const building=new THREE.Mesh(new THREE.BoxGeometry(2.2,height,2.2),new THREE.MeshStandardMaterial({color:i%2?p.buildings:p.accent,roughness:0.75}))
   building.position.set((i%4-1.5)*3,height/2-0.2,-7-Math.floor(i/4)*4)
   world.add(building)
  }
  active=era
 }
 draw('present');scene.add(root)
 return {
  group:root,
  era:()=>active,
  switchEra:(era:ChicagoEra)=>draw(era),
  setWarp:(value:number)=>{intensity=Math.max(0,Math.min(1,value));ring.rotation.z=intensity*Math.PI;const mat=ring.material as THREE.MeshStandardMaterial;mat.emissiveIntensity=1.1+intensity*4;portal.scale.setScalar(1+intensity*0.12);(portal.material as THREE.MeshBasicMaterial).opacity=0.24+intensity*0.5},
  dispose:()=>{scene.remove(root);root.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();if(Array.isArray(obj.material))obj.material.forEach(m=>m.dispose());else obj.material.dispose()}})},
 }
}
