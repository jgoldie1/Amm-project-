import * as THREE from 'three'
import {normalizeStreetVerseHumanHeight,residentHeight} from './StreetVerseHumanScale'

export type MobileResident={
  id:string
  group:THREE.Group
  axis:'x'|'z'
  fixed:number
  phase:number
  speed:number
}

const BODY_GEOMETRY=new THREE.CapsuleGeometry(.38,1.05,3,6)
const HEAD_GEOMETRY=new THREE.SphereGeometry(.34,8,6)
const ARM_GEOMETRY=new THREE.CapsuleGeometry(.09,.62,2,5)
const LEG_GEOMETRY=new THREE.CapsuleGeometry(.12,.72,2,5)
const HAIR_GEOMETRY=new THREE.SphereGeometry(.355,8,6,0,Math.PI*2,0,Math.PI*.48)
const SHOE_GEOMETRY=new THREE.BoxGeometry(.22,.16,.5)
const HAND_GEOMETRY=new THREE.SphereGeometry(.105,6,5)
const NECK_GEOMETRY=new THREE.CylinderGeometry(.105,.12,.18,6)
const FACE_EYE_GEOMETRY=new THREE.SphereGeometry(.035,5,4)
const FACE_MOUTH_GEOMETRY=new THREE.BoxGeometry(.13,.025,.018)
const JACKET_GEOMETRY=new THREE.BoxGeometry(.78,.72,.46)
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
    {axis:'x',fixed:-24,phase:11,speed:4.5},
    {axis:'x',fixed:24,phase:57,speed:4.7},
    {axis:'z',fixed:-24,phase:33,speed:4.6},
    {axis:'z',fixed:24,phase:81,speed:4.4},
  ]
  const residents=routes.map((route,index)=>{
    const group=new THREE.Group()
    group.name=`streetverse-mobile-resident-${index+1}`
    const skin=mat(SKIN_COLORS[index%SKIN_COLORS.length])
    const cognitionArms:THREE.Object3D[]=[]
    const body=new THREE.Mesh(BODY_GEOMETRY,mat(BODY_COLORS[index%BODY_COLORS.length]));body.position.y=1.45;group.add(body)
    const neck=new THREE.Mesh(NECK_GEOMETRY,skin);neck.name='resident-neck';neck.position.y=2.32;group.add(neck)
    const head=new THREE.Mesh(HEAD_GEOMETRY,skin);head.name='resident-head';head.position.y=2.72;group.add(head)
    const hair=new THREE.Mesh(HAIR_GEOMETRY,mat([0x16120f,0x2d1c15,0x493227][index%3]));hair.name='resident-hair';hair.position.y=2.85;hair.scale.set(1,index%4===0?1.18:.96,1);group.add(hair)
    if(index%3!==1){const jacket=new THREE.Mesh(JACKET_GEOMETRY,mat([0x1d4d72,0x7a3545,0x315e43,0x72572e][index%4]));jacket.name='resident-jacket';jacket.position.set(0,1.62,-.015);group.add(jacket)}
    for(const side of [-1,1]){
      const arm=new THREE.Mesh(ARM_GEOMETRY,skin);arm.name='resident-arm';arm.position.set(side*.48,1.5,0);arm.rotation.z=side*.12;group.add(arm);cognitionArms.push(arm)
      const hand=new THREE.Mesh(HAND_GEOMETRY,skin);hand.name='resident-hand';hand.position.set(side*.56,1.02,.015);group.add(hand)
      const leg=new THREE.Mesh(LEG_GEOMETRY,mat([0x202936,0x283548,0x35313c,0x172d3d][index%4]));leg.name='resident-leg';leg.position.set(side*.17,.52,0);group.add(leg)
      const shoe=new THREE.Mesh(SHOE_GEOMETRY,mat(0x15171b));shoe.name='resident-shoe';shoe.position.set(side*.17,.12,-.11);group.add(shoe)
      const eye=new THREE.Mesh(FACE_EYE_GEOMETRY,mat(0x17191d));eye.name='resident-eye';eye.position.set(side*.115,2.76,.305);group.add(eye)
    }
    const mouth=new THREE.Mesh(FACE_MOUTH_GEOMETRY,mat(0x5a2d2d));mouth.name='resident-mouth';mouth.position.set(0,2.58,.332);group.add(mouth)
    normalizeStreetVerseHumanHeight(group,residentHeight(index))
    group.userData.residentId=`mobile-resident-${index+1}`
    group.userData.streetverseResident=true
    group.userData.cognitionAction='patrol'
    group.userData.cognitionRig={head,arms:cognitionArms}
    scene.add(group)
    return {id:`mobile-resident-${index+1}`,group,...route}
  })
  return residents
}

export function tickMobileResidentPopulation(residents:MobileResident[],nowMs:number){
  const time=nowMs/1000
  for(const [index,resident] of residents.entries()){
    const span=148
    const cycle=span*2
    const distance=(time*resident.speed+resident.phase)%cycle
    const forward=distance<=span
    const along=-74+(forward?distance:cycle-distance)
    if(resident.axis==='x')resident.group.position.set(along,0,resident.fixed)
    else resident.group.position.set(resident.fixed,0,along)
    resident.group.rotation.y=resident.axis==='x'?(forward?Math.PI/2:-Math.PI/2):(forward?0:Math.PI)
    resident.group.position.y=Math.sin((time+resident.phase)*5.2)*.035
    const action=String(resident.group.userData.cognitionAction||'patrol')
    const rig=resident.group.userData.cognitionRig as {head?:THREE.Object3D;arms?:THREE.Object3D[]}|undefined
    const gesture=Math.sin(time*5.8+resident.phase*.17)
    if(rig?.head)rig.head.rotation.y=action==='observe'||action==='investigate'?gesture*.22:action==='greet'||action==='socialize'?gesture*.12:0
    for(const [armIndex,arm] of (rig?.arms||[]).entries()){
      arm.rotation.x=action==='greet'&&armIndex===0?-.55+gesture*.46:action==='deescalate'?-.34:action==='assist'?-.18:0
    }
    if(action==='yield-path')resident.group.position.x+=resident.axis==='z'?(index%2?-.45:.45):0
    if(action==='yield-path')resident.group.position.z+=resident.axis==='x'?(index%2?-.45:.45):0
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