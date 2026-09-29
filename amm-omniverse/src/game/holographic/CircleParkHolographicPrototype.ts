import * as THREE from 'three'
import { HOLO_THEMES } from './HolographicEngine'

export type CircleParkHoloMode='reconstruction'|'memory'|'interactive-demo'

export function createCircleParkHologram(mode:CircleParkHoloMode='reconstruction'){
 const group=new THREE.Group()
 group.name='circle-park-holographic-prototype'
 const theme=HOLO_THEMES.city
 const material=new THREE.MeshStandardMaterial({color:theme.primaryColor,emissive:theme.primaryColor,emissiveIntensity:.22,transparent:true,opacity:.82,roughness:.55,metalness:.12})
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(92,72),new THREE.MeshStandardMaterial({color:0x101820,transparent:true,opacity:.72}))
 ground.rotation.x=-Math.PI/2; ground.name='grounds'; group.add(ground)

 // Conceptual massing only until licensed/authoritative geometry is ingested.
 const masses=[
  [-28,-18,18,10,7],[-5,-20,20,10,7],[20,-18,18,10,7],
  [-28,2,18,11,7],[-4,2,20,11,7],[22,3,18,11,7],
  [-24,23,20,10,7],[2,23,20,10,7],[27,20,14,13,24],
 ] as const
 masses.forEach(([x,z,w,d,h],i)=>{
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material.clone())
  mesh.position.set(x,h/2,z); mesh.name=`concept-building-${i+1}`; group.add(mesh)
 })
 const entrance=new THREE.Mesh(new THREE.BoxGeometry(5,3,.4),new THREE.MeshStandardMaterial({color:theme.accentColor,emissive:theme.accentColor,emissiveIntensity:.5}))
 entrance.position.set(0,1.5,-35); entrance.name='interactive-entrance'; group.add(entrance)
 group.userData={
  passportId:'chi-circle-park-1111-laflin',
  mode,
  fidelity:'conceptual-massing-not-survey-accurate',
  spawn:{x:0,y:1.7,z:-46},
  entrance:{x:0,y:0,z:-35},
  interactions:['walk-to-entrance','open-door-demo','elevator-demo','fixture-demo','memory-layer-toggle'],
  sourceNotice:'Replace conceptual masses with rights-cleared geospatial geometry before calling the reconstruction accurate.'
 }
 return group
}

export function createCircleParkWalkPath(){
 return[
  new THREE.Vector3(0,1.7,-46),
  new THREE.Vector3(0,1.7,-40),
  new THREE.Vector3(0,1.7,-35),
 ] as const
}
