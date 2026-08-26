import * as THREE from 'three'

export type CharacterRig={
  root:THREE.Group
  leftArm:THREE.Group
  rightArm:THREE.Group
  leftLeg:THREE.Group
  rightLeg:THREE.Group
  head:THREE.Group
  seed:number
}

const SKIN=[0x4b2e22,0x6b3f2a,0x8a5638,0xa66f4d,0xc58a67,0xe0b08d]
const CLOTH=[0x18283c,0x5d2438,0x2f4f35,0x3b2e63,0x6b4b22,0x1f4955]
const ACCENT=[0xd8dbe2,0xf2c14e,0x67d9ff,0xef6a8a,0x7ee081,0xd59cff]

function mat(color:number,roughness=.72,metalness=.04){
  return new THREE.MeshStandardMaterial({color,roughness,metalness})
}

function capsule(radius:number,length:number,color:number){
  const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,6,12),mat(color))
  mesh.castShadow=true;mesh.receiveShadow=true
  return mesh
}

function sphere(radius:number,color:number){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,18,14),mat(color,.68,.02))
  mesh.castShadow=true;mesh.receiveShadow=true
  return mesh
}

function box(w:number,h:number,d:number,color:number){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color))
  mesh.castShadow=true;mesh.receiveShadow=true
  return mesh
}

export function createStreetVerseCharacter(seed=1,player=false):CharacterRig{
  const skin=SKIN[Math.abs(seed)%SKIN.length]
  const clothing=CLOTH[Math.abs(seed*3+1)%CLOTH.length]
  const accent=player?0x59e7ff:ACCENT[Math.abs(seed*5+2)%ACCENT.length]
  const root=new THREE.Group()
  const body=new THREE.Group();body.position.y=2.55;root.add(body)

  const torso=box(1.45,2.2,.72,clothing);torso.position.y=.1;body.add(torso)
  const jacket=box(1.52,1.45,.78,accent);jacket.position.y=.22;jacket.scale.z=.78;body.add(jacket)
  const neck=capsule(.18,.16,skin);neck.position.y=1.37;body.add(neck)

  const head=new THREE.Group();head.position.y=4.15;root.add(head)
  const skull=sphere(.62,skin);head.add(skull)
  const hairColor=seed%3===0?0x17120f:0x241915
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.64,18,10,0,Math.PI*2,0,Math.PI*.47),mat(hairColor,.9,0));hair.position.y=.13;hair.castShadow=true;head.add(hair)
  const eyeMat=new THREE.MeshStandardMaterial({color:0x111111,roughness:.5})
  for(const x of [-.21,.21]){const eye=new THREE.Mesh(new THREE.SphereGeometry(.055,10,8),eyeMat);eye.position.set(x,.08,-.57);head.add(eye)}
  const nose=box(.12,.2,.16,skin);nose.position.set(0,-.08,-.6);head.add(nose)

  const leftArm=new THREE.Group();leftArm.position.set(-.92,3.2,0);root.add(leftArm)
  const rightArm=new THREE.Group();rightArm.position.set(.92,3.2,0);root.add(rightArm)
  const upperL=capsule(.22,.86,clothing);upperL.position.y=-.52;leftArm.add(upperL)
  const upperR=capsule(.22,.86,clothing);upperR.position.y=-.52;rightArm.add(upperR)
  const handL=sphere(.2,skin);handL.position.y=-1.12;leftArm.add(handL)
  const handR=sphere(.2,skin);handR.position.y=-1.12;rightArm.add(handR)

  const leftLeg=new THREE.Group();leftLeg.position.set(-.36,1.55,0);root.add(leftLeg)
  const rightLeg=new THREE.Group();rightLeg.position.set(.36,1.55,0);root.add(rightLeg)
  const pants=0x20232a
  const legL=capsule(.28,1.2,pants);legL.position.y=-.67;leftLeg.add(legL)
  const legR=capsule(.28,1.2,pants);legR.position.y=-.67;rightLeg.add(legR)
  const shoeL=box(.48,.22,.78,0x101114);shoeL.position.set(0,-1.42,-.14);leftLeg.add(shoeL)
  const shoeR=box(.48,.22,.78,0x101114);shoeR.position.set(0,-1.42,-.14);rightLeg.add(shoeR)

  root.scale.setScalar(player?1.04:.96+(Math.abs(seed)%7)*.012)
  root.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true}})
  return {root,leftArm,rightArm,leftLeg,rightLeg,head,seed}
}

export function animateStreetVerseCharacter(rig:CharacterRig,time:number,speed=1){
  const phase=time*5*speed+rig.seed
  const swing=Math.sin(phase)*.55
  rig.leftArm.rotation.x=swing
  rig.rightArm.rotation.x=-swing
  rig.leftLeg.rotation.x=-swing*.72
  rig.rightLeg.rotation.x=swing*.72
  rig.head.rotation.y=Math.sin(time*.7+rig.seed)*.08
}
