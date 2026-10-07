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

const BODY_GEOMETRY=new THREE.CapsuleGeometry(.31,.88,4,8)
const PELVIS_GEOMETRY=new THREE.CapsuleGeometry(.24,.34,3,8)
const SHOULDER_GEOMETRY=new THREE.CapsuleGeometry(.085,.62,3,8)
const HEAD_GEOMETRY=new THREE.SphereGeometry(.30,12,10)
const JAW_GEOMETRY=new THREE.SphereGeometry(.205,10,8)
const ARM_GEOMETRY=new THREE.CapsuleGeometry(.075,.54,3,7)
const LEG_GEOMETRY=new THREE.CapsuleGeometry(.095,.70,3,7)
const HAIR_GEOMETRY=new THREE.SphereGeometry(.312,12,9,0,Math.PI*2,0,Math.PI*.50)
const SHOE_GEOMETRY=new THREE.BoxGeometry(.20,.14,.46)
const HAND_GEOMETRY=new THREE.SphereGeometry(.082,8,6)
const NECK_GEOMETRY=new THREE.CylinderGeometry(.09,.105,.17,8)
const FACE_EYE_WHITE_GEOMETRY=new THREE.SphereGeometry(.038,8,6)
const FACE_IRIS_GEOMETRY=new THREE.SphereGeometry(.020,8,6)
const FACE_PUPIL_GEOMETRY=new THREE.SphereGeometry(.010,7,5)
const FACE_NOSE_GEOMETRY=new THREE.SphereGeometry(.037,8,6)
const FAexport function createMobileResidentPopulation(scene:THREE.Scene):MobileResident[]{
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
    const cloth=mat(BODY_COLORS[index%BODY_COLORS.length])
    const pants=mat(PANTS_COLORS[index%PANTS_COLORS.length])
    const hairMat=mat(HAIR_COLORS[index%HAIR_COLORS.length])
    const shoeMat=mat(index%3===0?0xe7e5df:0x15171b)
    const cognitionArms:THREE.Object3D[]=[]
    const cognitionLegs:THREE.Object3D[]=[]

    const pelvis=new THREE.Mesh(PELVIS_GEOMETRY,pants);pelvis.name='resident-pelvis';pelvis.position.y=.93;pelvis.rotation.z=Math.PI/2;pelvis.scale.set(1,.92,1.05);group.add(pelvis)
    const body=new THREE.Mesh(BODY_GEOMETRY,cloth);body.name='resident-torso';body.position.y=1.48;body.scale.set(1+(index%3)*.035,.98,.82+(index%2)*.06);group.add(body)
    const shoulder=new THREE.Mesh(SHOULDER_GEOMETRY,cloth);shoulder.name='resident-shoulder-line';shoulder.position.y=1.81;shoulder.rotation.z=Math.PI/2;shoulder.scale.set(1,1+(index%4)*.025,.94);group.add(shoulder)
    const neck=new THREE.Mesh(NECK_GEOMETRY,skin);neck.name='resident-neck';neck.position.y=2.12;group.add(neck)
    const head=new THREE.Mesh(HEAD_GEOMETRY,skin);head.name='resident-head';head.position.y=2.47;head.scale.set(.93,1.05,.91);group.add(head)
    const jaw=new THREE.Mesh(JAW_GEOMETRY,skin);jaw.name='resident-jaw';jaw.position.set(0,2.31,.03);jaw.scale.set(.92,.62,.84);group.add(jaw)

    const hairStyle=index%5
    const hair=new THREE.Mesh(HAIR_GEOMETRY,hairMat);hair.name='resident-hair';hair.position.y=2.63;hair.scale.set(1,hairStyle===2?1.15:.66,1);group.add(hair)
    if(hairStyle===2){
      const puff=new THREE.Mesh(new THREE.SphereGeometry(.20,10,8),hairMat);puff.name='resident-hair-puff';puff.position.set(0,2.84,-.03);puff.scale.set(1.25,1.0,1.10);group.add(puff)
    }
    if(hairStyle===3){
      for(const side of [-1,1]){
        const braid=new THREE.Mesh(new THREE.CapsuleGeometry(.022,.34,3,6),hairMat);braid.name='resident-hair-braid';braid.position.set(side*.16,2.33,-.10);braid.rotation.z=side*.12;group.add(braid)
      }
    }
    if(hairStyle===4){
      const cap=new THREE.Mesh(CAP_GEOMETRY,mat(0x24394a));cap.name='resident-cap';cap.position.set(0,2.72,0);group.add(cap)
      const bill=new THREE.Mesh(new THREE.BoxGeometry(.28,.035,.15),mat(0x24394a));bill.name='resident-cap-bill';bill.position.set(0,2.69,.21);group.add(bill)
    }

    if(index%3!==1){
      const jacket=new THREE.Mesh(JACKET_GEOMETRY,mat([0x1d4d72,0x7a3545,0x315e43,0x72572e][index%4]));jacket.name='resident-jacket';jacket.position.set(0,1.48,-.025);jacket.scale.set(1.02,.78,.88);group.add(jacket)
    }

    for(const side of [-1,1]){
      const arm=new THREE.Mesh(ARM_GEOMETRY,skin);arm.name=side<0?'resident-arm-left':'resident-arm-right';arm.position.set(side*.40,1.47,0);arm.rotation.z=side*.08;group.add(arm);cognitionArms.push(arm)
      const hand=new THREE.Mesh(HAND_GEOMETRY,skin);hand.name=side<0?'resident-hand-left':'resident-hand-right';hand.position.set(side*.43,1.03,.015);hand.scale.set(.75,1.05,.68);group.add(hand)
      const leg=new THREE.Mesh(LEG_GEOMETRY,pants);leg.name=side<0?'resident-leg-left':'resident-leg-right';leg.position.set(side*.13,.49,0);group.add(leg);cognitionLegs.push(leg)
      const shoe=new THREE.Mesh(SHOE_GEOMETRY,shoeMat);shoe.name='resident-shoe';shoe.position.set(side*.13,.10,-.10);group.add(shoe)
    }

    for(const side of [-1,1]){
      const white=new THREE.Mesh(FACE_EYE_WHITE_GEOMETRY,mat(0xece9e1));white.name=side<0?'resident-eye-white-left':'resident-eye-white-right';white.position.set(side*.105,2.51,.279);white.scale.set(1,.62,.45);group.add(white)
      const iris=new THREE.Mesh(FACE_IRIS_GEOMETRY,mat(index%3===0?0x3b281c:0x2b211c));iris.name=side<0?'resident-iris-left':'resident-iris-right';iris.position.set(side*.105,2.51,.309);iris.scale.set(1,.86,.46);group.add(iris)
      const pupil=new THREE.Mesh(FACE_PUPIL_GEOMETRY,mat(0x070707));pupil.name=side<0?'resident-pupil-left':'resident-pupil-right';pupil.position.set(side*.105,2.51,.322);group.add(pupil)
      const brow=new THREE.Mesh(BROW_GEOMETRY,hairMat);brow.name=side<0?'resident-brow-left':'resident-brow-right';brow.position.set(side*.105,2.59,.292);brow.rotation.z=side*.06;group.add(brow)
    }
    const nose=new THREE.Mesh(FACE_NOSE_GEOMETRY,skin);nose.name='resident-nose';nose.position.set(0,2.44,.324);nose.scale.set(.75,1,.72);group.add(nose)
    const mouth=new THREE.Mesh(FACE_MOUTH_GEOMETRY,mat(0x5a2d2d));mouth.name='resident-mouth';mouth.position.set(0,2.34,.318);group.add(mouth)

    if(index%4===1){
      const bag=new THREE.Mesh(BAG_GEOMETRY,mat(0x49382f));bag.name='resident-bag';bag.position.set(-.37,1.10,.10);group.add(bag)
      const strap=new THREE.Mesh(new THREE.BoxGeometry(.04,.72,.04),mat(0x30251f));strap.name='resident-bag-strap';strap.position.set(-.20,1.44,.10);strap.rotation.z=-.42;group.add(strap)
    }

    normalizeStreetVerseHumanHeight(group,residentHeight(index))
    group.userData.residentId=`mobile-resident-${index+1}`
    group.userData.streetverseResident=true
    group.userData.visualPass='mobile-resident-v6'
    group.userData.cognitionAction='patrol'
    group.userData.cognitionRig={head,body,arms:cognitionArms,legs:cognitionLegs}
    scene.add(group)
    return {id:`mobile-resident-${index+1}`,group,...route}
  })
  return residents
}

export function tickMobileResidentPopulation(residents:MobileResident[],nowMs:number){
  const time=nowMs/1000
  for(const [index,resident] of residents.entries()){
    const target=resident.group.userData.cognitionTarget as {x:number;z:number;nodeId:string;reservationId:string;action:string;expiresAt:number;arrived?:boolean;arrivedAt?:number}|undefined
    const previousMoveAt=Number(resident.group.userData.cognitionMoveAt||nowMs)
    const moveDt=Math.max(0,Math.min(.05,(nowMs-previousMoveAt)/1000))
    resident.group.userData.cognitionMoveAt=nowMs
    let followingAffordance=false
    if(target){
      if(nowMs>=target.expiresAt){
        window.dispatchEvent(new CustomEvent('tryamm:npc-affordance-release',{detail:{npcId:resident.id,nodeId:target.nodeId,reservationId:target.reservationId,reason:'expired'}}))
        delete resident.group.userData.cognitionTarget
      }else if(target.arrived&&target.arrivedAt&&nowMs-target.arrivedAt>1800){
        window.dispatchEvent(new CustomEvent('tryamm:npc-affordance-release',{detail:{npcId:resident.id,nodeId:target.nodeId,reservationId:target.reservationId,reason:'completed'}}))
        delete resident.group.userData.cognitionTarget
      }else{
        followingAffordance=true
        const dx=target.x-resident.group.position.x,dz=target.z-resident.group.position.z,remaining=Math.hypot(dx,dz)
        if(remaining>.38){
          const step=Math.min(remaining,(target.action==='seek-safety'?4.2:3.2)*moveDt)
          resident.group.position.x+=dx/Math.max(.001,remaining)*step
          resident.group.position.z+=dz/Math.max(.001,remaining)*step
          resident.group.rotation.y=Math.atan2(dx,dz)
        }else if(!target.arrived){
          target.arrived=true;target.arrivedAt=nowMs
          resident.group.position.x=target.x;resident.group.position.z=target.z
          window.dispatchEvent(new CustomEvent('tryamm:npc-affordance-arrived',{detail:{npcId:resident.id,nodeId:target.nodeId,reservationId:target.reservationId,action:target.action,x:target.x,z:target.z}}))
        }
        resident.group.position.y=Math.sin((time+resident.phase)*5.2)*.018
      }
    }
    if(!followingAffordance){
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
    const action=String(resident.group.userData.cognitionAction||'patrol')
    const rig=resident.group.userData.cognitionRig as {head?:THREE.Object3D;body?:THREE.Object3D;arms?:THREE.Object3D[];legs?:THREE.Object3D[]}|undefined
    const gesture=Math.sin(time*5.8+resident.phase*.17)
    const walkSwing=Math.sin(time*(5.2+resident.speed*.18)+resident.phase*.13)
    if(rig?.head)rig.head.rotation.y=action==='observe'||action==='investigate'?gesture*.22:action==='greet'||action==='socialize'?gesture*.12:walkSwing*.025
    if(rig?.body){rig.body.rotation.z=walkSwing*.018;rig.body.rotation.x=Math.abs(walkSwing)*.008}
    for(const [armIndex,arm] of (rig?.arms||[]).entries()){
      const walkArm=(armIndex===0?walkSwing:-walkSwing)*.36
      arm.rotation.x=action==='greet'&&armIndex===0?-.55+gesture*.46:action==='deescalate'?-.34:action==='assist'?-.18:walkArm
    }
    for(const [legIndex,leg] of (rig?.legs||[]).entries())leg.rotation.x=(legIndex===0?-walkSwing:walkSwing)*.42
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