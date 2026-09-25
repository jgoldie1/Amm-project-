import * as THREE from 'three'

export type MobileResident={
  id:string
  group:THREE.Group
  axis:'x'|'z'
  fixed:number
  phase:number
  speed:number
}

const BODY_GEOMETRY=new THREE.BoxGeometry(.9,1.85,.58)
const HEAD_GEOMETRY=new THREE.SphereGeometry(.34,8,6)
const BODY_COLORS=[0x3aa6ff,0xf06b8f,0x8d6ce8,0xf0b64a,0x54c58a,0xc97c4a,0x6ab6c9,0xb7d44f]
const SKIN_COLORS=[0x7a4d32,0x9f6947,0xbf815b,0x6f432e,0xd79a70,0x8b5a3c,0xc88d68,0xa36b4b]

function mat(color:number){return new THREE.MeshLambertMaterial({color})}

export function createMobileResidentPopulation(scene:THREE.Scene):MobileResident[]{
  const routes:Array<Pick<MobileResident,'axis'|'fixed'|'phase'|'speed'>>=[
    {axis:'x',fixed:-39,phase:0,speed:5.4},
    {axis:'x',fixed:39,phase:23,speed:4.8},
    {axis:'x',fixed:-9,phase:48,speed:5.1},
    {axis:'x',fixed:9,phase:71,speed:4.6},
    {axis:'z',fixed:-39,phase:14,speed:5.0},
    {axis:'z',fixed:39,phase:39,speed:4.7},
    {axis:'z',fixed:-9,phase:64,speed:5.2},
    {axis:'z',fixed:9,phase:87,speed:4.9},
  ]
  const residents=routes.map((route,index)=>{
    const group=new THREE.Group()
    group.name=`streetverse-mobile-resident-${index+1}`
    const body=new THREE.Mesh(BODY_GEOMETRY,mat(BODY_COLORS[index%BODY_COLORS.length]));body.position.y=1.35;group.add(body)
    const head=new THREE.Mesh(HEAD_GEOMETRY,mat(SKIN_COLORS[index%SKIN_COLORS.length]));head.position.y=2.62;group.add(head)
    group.scale.setScalar(.92)
    group.userData.residentId=`mobile-resident-${index+1}`
    group.userData.streetverseResident=true
    scene.add(group)
    return {id:`mobile-resident-${index+1}`,group,...route}
  })
  return residents
}

export function tickMobileResidentPopulation(residents:MobileResident[],nowMs:number){
  const time=nowMs/1000
  for(const resident of residents){
    const span=148
    const cycle=span*2
    const distance=(time*resident.speed+resident.phase)%cycle
    const forward=distance<=span
    const along=-74+(forward?distance:cycle-distance)
    if(resident.axis==='x')resident.group.position.set(along,0,resident.fixed)
    else resident.group.position.set(resident.fixed,0,along)
    resident.group.rotation.y=resident.axis==='x'?(forward?Math.PI/2:-Math.PI/2):(forward?0:Math.PI)
    resident.group.position.y=Math.sin((time+resident.phase)*5.2)*.035
  }
}

export function disposeMobileResidentPopulation(residents:MobileResident[]){
  const materials=new Set<THREE.Material>()
  for(const resident of residents){
    resident.group.traverse(obj=>{if(obj instanceof THREE.Mesh){const list=Array.isArray(obj.material)?obj.material:[obj.material];list.forEach(material=>materials.add(material))}})
    resident.group.removeFromParent()
  }
  materials.forEach(material=>material.dispose())
}
