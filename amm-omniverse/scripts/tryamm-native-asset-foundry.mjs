import fs from 'node:fs'
import path from 'node:path'
import * as THREE from 'three'
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js'

if(typeof globalThis.FileReader==='undefined'){
  globalThis.FileReader=class FileReader{
    result=null
    onloadend=null
    onerror=null
    async readAsArrayBuffer(blob){
      try{this.result=await blob.arrayBuffer();this.onloadend?.({target:this})}catch(error){this.onerror?.(error)}
    }
    async readAsDataURL(blob){
      try{
        const buf=Buffer.from(await blob.arrayBuffer())
        this.result=`data:${blob.type||'application/octet-stream'};base64,${buf.toString('base64')}`
        this.onloadend?.({target:this})
      }catch(error){this.onerror?.(error)}
    }
  }
}

const OUT=path.resolve(process.argv[2]||'../release-evidence/tryamm-native-asset-foundry')
fs.mkdirSync(OUT,{recursive:true})

const PROFILES=[
  {id:'sample-a-reality-restore',label:'Reality Restore',score:83.27,holo:.15,density:1,weathered:.35},
  {id:'sample-b-chicago-documentary',label:'Chicago Documentary',score:86.54,holo:.12,density:1.22,weathered:.65},
  {id:'sample-c-holo-reality-fusion',label:'Holo Reality Fusion',score:94.84,holo:.72,density:1.18,weathered:.55},
  {id:'sample-d-cinematic-hero',label:'Cinematic Hero',score:88.43,holo:.58,density:1.35,weathered:.72},
]

const deg=n=>n*Math.PI/180
const mat=(name,color,roughness=.7,metalness=0,emissive=0x000000,emissiveIntensity=0)=>new THREE.MeshStandardMaterial({
  name,color,roughness,metalness,emissive,emissiveIntensity,
})

function addBox(group,name,size,pos,material,rotation=[0,0,0],semantic){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),material)
  mesh.name=name;mesh.position.set(...pos);mesh.rotation.set(...rotation)
  mesh.castShadow=true;mesh.receiveShadow=true
  mesh.userData={semantic:semantic||name,collision:'box',generatedBy:'tryamm-native-asset-foundry'}
  group.add(mesh);return mesh
}

function addCylinder(group,name,radius,height,pos,material,segments=16,semantic){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),material)
  mesh.name=name;mesh.position.set(...pos);mesh.castShadow=true;mesh.receiveShadow=true
  mesh.userData={semantic:semantic||name,collision:'cylinder',generatedBy:'tryamm-native-asset-foundry'}
  group.add(mesh);return mesh
}

function addRoundedShell(group,name,length,radius,width,pos,material,semantic){
  const mesh=new THREE.Mesh(new THREE.CapsuleGeometry(radius,length,6,20),material)
  mesh.name=name
  mesh.rotation.z=deg(90)
  mesh.scale.z=width/(radius*2)
  mesh.position.set(...pos)
  mesh.castShadow=true;mesh.receiveShadow=true
  mesh.userData={semantic:semantic||name,collision:'rounded-proxy',generatedBy:'tryamm-native-asset-foundry',realismShell:true}
  group.add(mesh)
  return mesh
}

function addTree(group,x,z,scale,mats){
  addCylinder(group,'tree-trunk',.23*scale,2.8*scale,[x,1.4*scale,z],mats.wood,12,'vegetation-trunk')
  const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.25*scale,2),mats.leaf)
  crown.name='tree-canopy';crown.position.set(x,3.45*scale,z)
  crown.userData={semantic:'vegetation-canopy',collision:'none',windReactive:true}
  group.add(crown)
}

function addStreetLamp(group,x,z,mats,holo){
  addCylinder(group,'street-lamp-pole',.07,4.8,[x,2.4,z],mats.metal,10,'street-light')
  addBox(group,'street-lamp-arm',[.65,.08,.08],[x+.28,4.65,z],mats.metal)
  const bulb=new THREE.Mesh(new THREE.SphereGeometry(.16,12,8),mats.light)
  bulb.position.set(x+.58,4.58,z);bulb.name='street-lamp-emitter';bulb.userData={semantic:'light-emitter'}
  group.add(bulb)
  if(holo>.3){
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.42,.025,8,32),mats.holo)
    ring.position.set(x+.58,4.58,z);ring.rotation.x=deg(90);ring.name='holo-lamp-anchor'
    ring.userData={semantic:'holographic-interaction-anchor',collision:'none'}
    group.add(ring)
  }
}

function addBench(group,x,z,mats){
  addBox(group,'bench-seat',[1.7,.12,.48],[x,.58,z],mats.wood)
  addBox(group,'bench-back',[1.7,.72,.10],[x,.98,z+.21],mats.wood,[deg(-8),0,0])
  addBox(group,'bench-leg-left',[.12,.55,.35],[x-.62,.28,z],mats.metal)
  addBox(group,'bench-leg-right',[.12,.55,.35],[x+.62,.28,z],mats.metal)
}

function addHydrant(group,x,z,mats){
  addCylinder(group,'hydrant-body',.2,.68,[x,.34,z],mats.hydrant,12,'fire-hydrant')
  addCylinder(group,'hydrant-cap',.27,.13,[x,.75,z],mats.hydrant,12)
  const side=addCylinder(group,'hydrant-side-cap',.11,.32,[x+.27,.44,z],mats.hydrant,10)
  side.rotation.z=deg(90)
}

function addTrashCan(group,x,z,mats){
  addCylinder(group,'trash-can-body',.38,.9,[x,.45,z],mats.trash,18,'trash-receptacle')
  addCylinder(group,'trash-can-lid',.43,.12,[x,.96,z],mats.metal,18,'trash-receptacle-lid')
}

function addRecyclingBin(group,x,z,mats){
  addBox(group,'recycling-bin',[.72,.95,.72],[x,.475,z],mats.recycle,undefined,'recycling-receptacle')
  addBox(group,'recycling-lid',[.78,.10,.78],[x,.99,z],mats.recycle)
}

function addDumpster(group,x,z,mats){
  addBox(group,'dumpster-body',[2.2,1.35,1.35],[x,.675,z],mats.dumpster,undefined,'garbage-disposal-dumpster')
  addBox(group,'dumpster-lid-left',[1.06,.10,1.42],[x-.55,1.42,z],mats.metal,[0,0,deg(-8)],'dumpster-lid')
  addBox(group,'dumpster-lid-right',[1.06,.10,1.42],[x+.55,1.42,z],mats.metal,[0,0,deg(8)],'dumpster-lid')
  addBox(group,'dumpster-wheel-left',[.18,.28,.18],[x-.78,.12,z+.55],mats.tire)
  addBox(group,'dumpster-wheel-right',[.18,.28,.18],[x+.78,.12,z+.55],mats.tire)
}

function addGarbageBag(group,x,z,mats,scale=1){
  const bag=new THREE.Mesh(new THREE.SphereGeometry(.42*scale,12,10),mats.garbageBag)
  bag.name='garbage-bag';bag.position.set(x,.38*scale,z);bag.scale.set(1,.9,1)
  bag.userData={semantic:'collectible-garbage',collision:'none',pickup:true,generatedBy:'tryamm-native-asset-foundry'}
  group.add(bag)
  const tie=addCylinder(group,'garbage-bag-tie',.05*scale,.18*scale,[x,.83*scale,z],mats.garbageTie,8,'garbage-bag-tie')
  tie.userData.pickup=true
}

function addLitterCluster(group,x,z,mats){
  addBox(group,'litter-paper',[.46,.025,.32],[x,.025,z],mats.litterPaper,[0,deg(18),0],'collectible-litter')
  addCylinder(group,'litter-can',.10,.27,[x+.34,.12,z-.18],mats.litterCan,10,'collectible-litter')
}

function addCarBlockout(group,x,z,mats){
  addBox(group,'vehicle-body',[3.8,.62,1.72],[x,.62,z],mats.car,undefined,'parked-vehicle')
  addBox(group,'vehicle-cabin',[1.9,.72,1.46],[x-.2,1.23,z],mats.glass)
  for(const dx of [-1.15,1.15])for(const dz of [-.82,.82]){
    const wheel=addCylinder(group,'vehicle-wheel',.34,.22,[x+dx,.42,z+dz],mats.tire,16,'vehicle-wheel')
    wheel.rotation.x=deg(90)
  }
}

function add2027SportSedan(group,x,z,mats){
  group.userData={...group.userData,semantic:'drivable-vehicle',modelYear:2027,originalTryammDesign:true}
  addRoundedShell(group,'chassis',3.55,.46,1.9,[x,.57,z],mats.car,'vehicle-chassis')
  const lower=addRoundedShell(group,'lower-body',3.25,.40,1.82,[x,.84,z],mats.car,'vehicle-body');lower.scale.y=.82
  const cabin=addRoundedShell(group,'cabin',1.12,.47,1.55,[x-.2,1.36,z],mats.glass,'vehicle-cabin');cabin.scale.y=.82
  addBox(group,'front-bumper',[.36,.28,1.72],[x+2.12,.48,z],mats.metal,undefined,'vehicle-bumper')
  addBox(group,'rear-bumper',[.36,.28,1.72],[x-2.12,.48,z],mats.metal,undefined,'vehicle-bumper')

  const hoodPivot=new THREE.Group();hoodPivot.name='hood-pivot';hoodPivot.position.set(x+.52,1.05,z);hoodPivot.userData={semantic:'vehicle-hood-pivot',interaction:'hood'}
  const hood=addBox(hoodPivot,'hood',[1.24,.12,1.74],[.63,0,0],mats.car,undefined,'vehicle-hood')
  hood.userData.interaction='hood';group.add(hoodPivot)

  const driverDoorPivot=new THREE.Group();driverDoorPivot.name='driver-door-pivot';driverDoorPivot.position.set(x-.84,1.05,z-.93);driverDoorPivot.userData={semantic:'vehicle-door-pivot',interaction:'driver-door'}
  const driverDoor=addBox(driverDoorPivot,'driver-door',[1.38,.72,.10],[.69,0,0],mats.car,undefined,'vehicle-door')
  driverDoor.userData.interaction='driver-door';group.add(driverDoorPivot)

  const passengerDoorPivot=new THREE.Group();passengerDoorPivot.name='passenger-door-pivot';passengerDoorPivot.position.set(x-.84,1.05,z+.93);passengerDoorPivot.userData={semantic:'vehicle-door-pivot',interaction:'passenger-door'}
  const passengerDoor=addBox(passengerDoorPivot,'passenger-door',[1.38,.72,.10],[.69,0,0],mats.car,undefined,'vehicle-door')
  passengerDoor.userData.interaction='passenger-door';group.add(passengerDoorPivot)

  const windshield=addBox(group,'windshield',[.12,.64,1.48],[x+.64,1.47,z],mats.glass,[0,0,deg(-20)],'vehicle-glass')
  windshield.userData.transparentVisual=true
  const rearGlass=addBox(group,'rear-window',[.12,.58,1.44],[x-1.0,1.43,z],mats.glass,[0,0,deg(18)],'vehicle-glass')
  rearGlass.userData.transparentVisual=true

  for(const dx of [-1.42,1.42])for(const dz of [-.89,.89]){
    const wheel=addCylinder(group,'wheel',.39,.24,[x+dx,.4,z+dz],mats.tire,20,'vehicle-wheel')
    wheel.rotation.x=deg(90)
    const rim=addCylinder(group,'wheel-rim',.22,.245,[x+dx,.4,z+dz],mats.metal,16,'vehicle-wheel-rim')
    rim.rotation.x=deg(90)
  }

  for(const dz of [-.56,.56]){
    const head=new THREE.Mesh(new THREE.BoxGeometry(.08,.22,.42),mats.light)
    head.name='headlight';head.position.set(x+2.19,.78,z+dz);head.userData={semantic:'vehicle-headlight'}
    group.add(head)
    const tail=new THREE.Mesh(new THREE.BoxGeometry(.08,.20,.40),mat('tail-light',0x7b1018,.25,.35,0xff1525,1.6))
    tail.name='tail-light';tail.position.set(x-2.19,.76,z+dz);tail.userData={semantic:'vehicle-tail-light'}
    group.add(tail)
  }

  const holo=new THREE.Mesh(new THREE.TorusGeometry(.58,.025,8,32),mats.holo)
  holo.name='vehicle-holo-id-ring';holo.position.set(x,1.95,z);holo.rotation.x=deg(90);holo.userData={semantic:'vehicle-holographic-identity',collision:'none'}
  group.add(holo)
}

function add2027CustomBoxTruck(group,x,z,mats){
  group.userData={...group.userData,semantic:'drivable-commercial-vehicle',modelYear:2027,originalTryammDesign:true,streetStyle:'custom-box-truck'}
  addBox(group,'box-truck-chassis',[6.8,.42,2.35],[x,.55,z],mats.metal,undefined,'vehicle-chassis')
  const cab=addRoundedShell(group,'box-truck-cab',1.1,.78,2.16,[x+2.05,1.45,z],mats.car,'vehicle-cab');cab.scale.y=1.15
  addBox(group,'box-truck-cargo',[4.35,2.75,2.3],[x-.8,2.0,z],mat('cargo-box',0xe6e6e6,.62,.15),undefined,'cargo-box')
  addBox(group,'box-truck-windshield',[.08,.72,1.78],[x+3.12,1.72,z],mats.glass,undefined,'vehicle-glass')
  addBox(group,'box-truck-bumper',[.28,.35,2.18],[x+3.35,.45,z],mats.metal,undefined,'vehicle-bumper')
  addBox(group,'box-truck-rear-step',[.34,.3,2.12],[x-3.35,.42,z],mats.metal,undefined,'vehicle-step')

  const wheelPositions=[
    [x+2.0,z-.98],[x+2.0,z+.98],
    [x-2.05,z-.98],[x-2.05,z+.98],
  ]
  for(const [wx,wz] of wheelPositions){
    const tire=addCylinder(group,'box-truck-wheel',.54,.32,[wx,.52,wz],mats.tire,24,'vehicle-wheel');tire.rotation.x=deg(90)
    const rim=addCylinder(group,'wire-spoke-rim',.36,.335,[wx,.52,wz],mat('chrome-wire',0xe9edf2,.16,.95),32,'vehicle-wheel-rim');rim.rotation.x=deg(90)
    const spinner=addCylinder(group,'spinner-cap',.16,.355,[wx,.52,wz],mat('spinner-chrome',0xf7f8fb,.1,1),8,'vehicle-spinner-visual');spinner.rotation.x=deg(90)
    spinner.userData={...spinner.userData,cosmeticSpinner:true,independentVisualSpin:true}
  }

  const sideGlow=new THREE.Mesh(new THREE.BoxGeometry(3.1,.05,.08),mats.holo)
  sideGlow.name='box-truck-holo-side';sideGlow.position.set(x-.6,.48,z-1.19);sideGlow.userData={semantic:'vehicle-holographic-accent',collision:'none'};group.add(sideGlow)
  const sideGlow2=sideGlow.clone();sideGlow2.position.z=z+1.19;group.add(sideGlow2)
}


function addResidentArchetype(group,x,z,mats,variant=0,hero=false){
  const skinPalette=[0x6a402c,0x7a4d32,0x8c5a3d,0xa36b4b,0xb87a56,0xc88d68,0xd79a70,0xe0aa86]
  const outfitPalette=[0x284c7a,0x7a3545,0x315e43,0x72572e,0x5b3f78,0x1f5b62,0x8a4b2d,0x36415d]
  const skin=mat(`skin-${variant}`,skinPalette[variant%skinPalette.length],.43,0)
  skin.userData={surface:'skin',subsurfaceApproximation:true,roughnessTier:'soft'}
  const outfit=mat(`outfit-${variant}`,outfitPalette[variant%outfitPalette.length],.82,.025)
  outfit.userData={surface:'fabric',fiberRoughness:true}
  const accent=mat(`outfit-accent-${variant}`,outfitPalette[(variant+3)%outfitPalette.length],.7,.04)
  accent.userData={surface:'fabric-accent'}
  const pants=mat(`pants-${variant}`,variant%2?0x202936:0x2f3138,.88,.015)
  const hair=mat(`hair-${variant}`,variant%2?0x2d1c15:0x15110f,.74,.01)
  const lip=mat(`lip-${variant}`,variant%2?0x6e342e:0x7b4035,.36,0)
  const eyeWhite=mat(`eye-white-${variant}`,0xf0eee8,.34,0)
  const iris=mat(`iris-${variant}`,variant%3===0?0x3b281c:variant%3===1?0x4a3522:0x2f241f,.22,.01)
  const pupil=mat(`pupil-${variant}`,0x090909,.28,.04)
  const proportions=[
    {h:1.00,shoulder:1.00,torso:1.00,leg:1.00,head:1.00},
    {h:1.04,shoulder:1.07,torso:.96,leg:1.06,head:.98},
    {h:.97,shoulder:.94,torso:1.08,leg:.96,head:1.03},
    {h:1.02,shoulder:1.12,torso:1.02,leg:1.02,head:.97},
    {h:.95,shoulder:.92,torso:.94,leg:.98,head:1.04},
    {h:1.07,shoulder:1.04,torso:1.04,leg:1.08,head:.97},
    {h:.99,shoulder:.98,torso:1.10,leg:.97,head:1.01},
    {h:1.05,shoulder:1.09,torso:.98,leg:1.05,head:.99},
  ][variant%8]
  const faceProfiles=[
    {jaw:1.00,cheek:1.00,eye:.98,noseW:1.00,noseL:1.00,lip:1.00,headX:1.00,headY:1.00},
    {jaw:1.10,cheek:1.05,eye:1.03,noseW:1.08,noseL:1.04,lip:.94,headX:1.02,headY:.98},
    {jaw:.92,cheek:1.12,eye:1.08,noseW:.92,noseL:.96,lip:1.10,headX:.98,headY:1.03},
    {jaw:1.16,cheek:.96,eye:.95,noseW:1.12,noseL:1.08,lip:.90,headX:1.04,headY:.97},
    {jaw:.88,cheek:1.08,eye:1.10,noseW:.90,noseL:.94,lip:1.14,headX:.97,headY:1.05},
    {jaw:1.06,cheek:1.14,eye:1.00,noseW:1.03,noseL:1.10,lip:1.02,headX:1.03,headY:1.00},
    {jaw:.96,cheek:.94,eye:1.06,noseW:.96,noseL:1.02,lip:1.08,headX:.99,headY:1.02},
    {jaw:1.12,cheek:1.02,eye:.97,noseW:1.10,noseL:.98,lip:.96,headX:1.05,headY:.96},
  ]
  const face=faceProfiles[variant%faceProfiles.length]
  const H=hero?1.05:proportions.h
  const shoulder=(hero?.56:.52)*proportions.shoulder
  const rig=new THREE.Group()
  rig.name=hero?'character-rig-hero':'character-rig-resident'
  rig.position.set(x,0,z)
  rig.userData={semantic:hero?'hero-character-rig':'resident-character-rig',animationReady:true,generatedBy:'tryamm-native-asset-foundry'}
  group.add(rig)

  const pelvis=new THREE.Group();pelvis.name='rig-pelvis';pelvis.position.y=1.10*H;rig.add(pelvis)
  const hips=new THREE.Mesh(new THREE.CapsuleGeometry(.28*proportions.torso,.34,4,10),pants)
  hips.name='pelvis-shell';hips.rotation.z=deg(90);hips.scale.z=1.12;hips.castShadow=true;pelvis.add(hips)

  const spine=new THREE.Group();spine.name='rig-spine';spine.position.y=.18*H;pelvis.add(spine)
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry((hero?.42:.39)*proportions.torso,.82*H,6,14),outfit)
  torso.name=hero?'hero-torso':'resident-torso';torso.position.y=.28*H;torso.scale.set(proportions.shoulder*.78,.68,.70);torso.castShadow=true;spine.add(torso)
  const shoulderLine=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.72*shoulder,4,10),outfit)
  shoulderLine.name='shoulder-line';shoulderLine.rotation.z=deg(90);shoulderLine.position.y=.61*H;shoulderLine.castShadow=true;spine.add(shoulderLine)
  const clavicle=addBox(spine,'clavicle-line',[shoulder*1.18,.055,.075],[0,.60*H,.25],skin,undefined,'character-clavicle')
  clavicle.castShadow=false
  const waist=addBox(spine,'waist-silhouette',[.58*proportions.torso,.10,.55],[0,.02*H,0],outfit,undefined,'character-waist')
  waist.scale.x=.88
  const neck=addCylinder(spine,'neck',.13,.22,[0,.78*H,0],skin,14,'character-neck')

  const headPivot=new THREE.Group();headPivot.name='rig-head';headPivot.position.y=.98*H;headPivot.scale.setScalar(.76);spine.add(headPivot)
  const head=new THREE.Mesh(new THREE.SphereGeometry((hero?.35:.325)*proportions.head,24,18),skin)
  head.name=hero?'hero-head':'resident-head';head.scale.set(.91*face.headX,1.08*face.headY,.88);head.castShadow=true;headPivot.add(head)
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(.25*proportions.head,18,12),skin)
  jaw.name='jaw';jaw.position.set(0,-.16,.015);jaw.scale.set(.88*face.jaw,.72,.83);headPivot.add(jaw)
  const chin=new THREE.Mesh(new THREE.SphereGeometry(.105*proportions.head,14,10),skin)
  chin.name='chin';chin.position.set(0,-.275,.19);chin.scale.set(.92,.72,.82);headPivot.add(chin)
  for(const side of [-1,1]){
    const cheek=new THREE.Mesh(new THREE.SphereGeometry(.12*proportions.head,14,10),skin)
    cheek.name=side<0?'cheek-left':'cheek-right';cheek.position.set(side*.165*face.cheek,-.055,.235);cheek.scale.set(1.18*face.cheek,.68,.62);headPivot.add(cheek)
  }
  for(const side of [-1,1]){
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.055*proportions.head,10,8),skin)
    ear.name=side<0?'ear-left':'ear-right';ear.position.set(side*.30*proportions.head,.015,-.015);ear.scale.set(.62,1.1,.55);headPivot.add(ear)
  }
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.05*face.noseW,.145*face.noseL,10),skin);nose.name='nose';nose.rotation.x=deg(90);nose.position.set(0,-.015,.305+(face.noseL-1)*.03);headPivot.add(nose)
  for(const side of [-1,1]){
    const nostril=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),pupil)
    nostril.name=side<0?'nostril-left':'nostril-right';nostril.position.set(side*.032,-.072,.357);nostril.scale.set(1.05,.5,.45);headPivot.add(nostril)
    const white=new THREE.Mesh(new THREE.SphereGeometry(.047,12,8),eyeWhite);white.name=side<0?'eye-white-left':'eye-white-right';white.position.set(side*.112*face.eye,.085,.292);white.scale.set(1.05,.62,.45);headPivot.add(white)
    const irisMesh=new THREE.Mesh(new THREE.SphereGeometry(.024,10,8),iris);irisMesh.name=side<0?'iris-left':'iris-right';irisMesh.position.set(side*.112*face.eye,.085,.326);irisMesh.scale.set(1,.82,.5);headPivot.add(irisMesh)
    const pupilMesh=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),pupil);pupilMesh.name=side<0?'pupil-left':'pupil-right';pupilMesh.position.set(side*.112*face.eye,.085,.341);headPivot.add(pupilMesh)
    const brow=addBox(headPivot,side<0?'brow-left':'brow-right',[.135,.026,.025],[side*.112*face.eye,.175,.298],hair,[0,0,side*.05],'eyebrow')
    brow.castShadow=false
    const eyelid=new THREE.Mesh(new THREE.SphereGeometry(.052,12,8),skin)
    eyelid.name=side<0?'eyelid-left':'eyelid-right';eyelid.position.set(side*.112*face.eye,.108,.314);eyelid.scale.set(1.08,.16,.46);eyelid.userData={facialControl:'blink'};headPivot.add(eyelid)
  }
  const upperLip=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.13*face.lip,3,8),lip);upperLip.name='upper-lip';upperLip.rotation.z=deg(90);upperLip.position.set(0,-.13,.31);upperLip.scale.y=.7;headPivot.add(upperLip)
  const lowerLip=upperLip.clone();lowerLip.name='lower-lip';lowerLip.position.y=-.158;lowerLip.scale.set(1.02,.9,1);headPivot.add(lowerLip)

  const hairStyle=variant%6
  if(hairStyle===0){
    const crop=new THREE.Mesh(new THREE.SphereGeometry((hero?.36:.335)*proportions.head,20,12,0,Math.PI*2,0,Math.PI*.48),hair)
    crop.name='hair-close-crop';crop.position.y=.10;crop.scale.set(1.02,.82,1.02);headPivot.add(crop)
  }else if(hairStyle===1){
    const fade=new THREE.Mesh(new THREE.SphereGeometry(.34*proportions.head,18,12,0,Math.PI*2,0,Math.PI*.5),hair)
    fade.name='hair-fade';fade.position.y=.11;fade.scale.set(1.02,.72,1.01);headPivot.add(fade)
    addBox(headPivot,'hair-top',[.36,.26,.34],[0,.32,-.01],hair,undefined,'hair-style')
  }else if(hairStyle===2){
    const afro=new THREE.Mesh(new THREE.IcosahedronGeometry(.39*proportions.head,2),hair)
    afro.name='hair-afro';afro.position.y=.13;afro.scale.set(1.04,.96,1.03);headPivot.add(afro)
  }else if(hairStyle===3){
    const base=new THREE.Mesh(new THREE.SphereGeometry(.34*proportions.head,18,10,0,Math.PI*2,0,Math.PI*.42),hair)
    base.name='hair-braided-base';base.position.y=.11;base.scale.y=.72;headPivot.add(base)
    for(const side of [-1,1])for(let row=0;row<2;row++){
      const braid=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.42,3,6),hair)
      braid.name='hair-braid';braid.position.set(side*(.16+row*.07),-.11,-.10);braid.rotation.z=side*.12;headPivot.add(braid)
    }
  }else if(hairStyle===4){
    const crown=new THREE.Mesh(new THREE.SphereGeometry(.34*proportions.head,18,10,0,Math.PI*2,0,Math.PI*.42),hair)
    crown.name='hair-loc-crown';crown.position.y=.10;crown.scale.y=.66;headPivot.add(crown)
    for(let loc=0;loc<8;loc++){
      const angle=(loc/8)*Math.PI*2
      const strand=new THREE.Mesh(new THREE.CapsuleGeometry(.028,.36+(loc%3)*.08,3,7),hair)
      strand.name='hair-loc';strand.position.set(Math.cos(angle)*.23,-.12,Math.sin(angle)*.17-.05);strand.rotation.z=Math.cos(angle)*.16;strand.rotation.x=Math.sin(angle)*.1;headPivot.add(strand)
    }
  }else{
    const curlBase=new THREE.Mesh(new THREE.SphereGeometry(.35*proportions.head,16,10,0,Math.PI*2,0,Math.PI*.46),hair)
    curlBase.name='hair-curl-base';curlBase.position.y=.11;curlBase.scale.y=.70;headPivot.add(curlBase)
    for(const px of [-.20,0,.20])for(const pz of [-.08,.10]){
      const curl=new THREE.Mesh(new THREE.SphereGeometry(.075,9,7),hair)
      curl.name='hair-curl';curl.position.set(px,.26+(Math.abs(px)<.01?.05:0),pz);headPivot.add(curl)
    }
  }

  for(const side of [-1,1]){
    const armPivot=new THREE.Group();armPivot.name=side<0?'rig-left-arm':'rig-right-arm';armPivot.position.set(side*shoulder*.76,.58*H,0);spine.add(armPivot)
    const upperArm=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.39*H,4,10),outfit);upperArm.name='upper-arm';upperArm.position.y=-.24*H;upperArm.castShadow=true;armPivot.add(upperArm)
    const elbow=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),skin);elbow.name='elbow';elbow.position.y=-.48*H;armPivot.add(elbow)
    const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.082,.34*H,4,10),skin);forearm.name='forearm';forearm.position.y=-.67*H;armPivot.add(forearm)
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.105,12,8),skin);hand.name='hand';hand.position.y=-.91*H;hand.scale.set(.82,1.18,.68);armPivot.add(hand)
    for(let finger=0;finger<3;finger++){
      const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.014,.085,3,6),skin)
      digit.name='finger-detail';digit.position.set((finger-1)*.038,-1.02*H,.02);digit.rotation.z=(finger-1)*.06;armPivot.add(digit)
    }

    const legPivot=new THREE.Group();legPivot.name=side<0?'rig-left-leg':'rig-right-leg';legPivot.position.set(side*.18,1.05*H,0);rig.add(legPivot)
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.46*H,4,10),pants);thigh.name='thigh';thigh.position.y=-.31*H;thigh.castShadow=true;legPivot.add(thigh)
    const knee=new THREE.Mesh(new THREE.SphereGeometry(.125,10,8),pants);knee.name='knee';knee.position.y=-.59*H;legPivot.add(knee)
    const shin=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.42*H,4,10),pants);shin.name='shin';shin.position.y=-.82*H;legPivot.add(shin)
    const shoe=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.27,4,10),mats.tire);shoe.name='shoe';shoe.rotation.z=deg(90);shoe.position.set(0,-1.08*H,.09);shoe.scale.z=1.15;legPivot.add(shoe)
    const sole=addBox(legPivot,'shoe-sole',[.34,.055,.18],[0,-1.15*H,.10],mats.metal,undefined,'footwear-sole');sole.castShadow=true
  }

  if(!hero&&variant%2===1){
    const jacket=new THREE.Mesh(new THREE.CapsuleGeometry(.405*proportions.torso,.80*H,6,12),accent)
    jacket.name='wardrobe-jacket';jacket.position.set(0,.28*H,-.025);jacket.scale.set(proportions.shoulder*.80,.66,.74);spine.add(jacket)
    const zipper=addBox(spine,'jacket-zipper',[.025,.62,.03],[0,.42*H,.37],mats.metal,undefined,'wardrobe-detail');zipper.castShadow=false
  }
  if(!hero&&variant%3===1){
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.345*proportions.head,18,10,0,Math.PI*2,0,Math.PI*.34),accent)
    cap.name='hair-cap-accessory';cap.position.set(0,.26,0);cap.scale.set(1.04,.62,1.05);headPivot.add(cap)
    addBox(headPivot,'cap-visor',[.30,.045,.25],[0,.21,.30],accent,undefined,'wardrobe-accessory')
  }
  if(!hero&&variant%4===2){
    const chain=new THREE.Mesh(new THREE.TorusGeometry(.19,.018,8,24,Math.PI),mat(`chain-${variant}`,0xd5b75c,.25,.72))
    chain.name='wardrobe-chain';chain.rotation.x=deg(90);chain.position.set(0,.63*H,.35);spine.add(chain)
  }
  if(!hero&&variant%5===3){
    const beard=new THREE.Mesh(new THREE.SphereGeometry(.275*proportions.head,16,10,0,Math.PI*2,Math.PI*.48,Math.PI*.38),hair)
    beard.name='facial-hair';beard.position.set(0,-.16,.095);beard.scale.set(.9,.72,.9);headPivot.add(beard)
  }
  if(hero){
    const undershirt=addBox(spine,'hero-undershirt',[.37,.53,.045],[0,.28*H,.275],mat('hero-undershirt-mat',0xe8ecef,.78,.01),undefined,'hero-layered-wardrobe')
    undershirt.castShadow=false
    const jacket=new THREE.Mesh(new THREE.CapsuleGeometry(.43*proportions.torso,.78*H,6,14),accent)
    jacket.name='hero-layered-jacket';jacket.position.set(0,.42*H,-.04);jacket.scale.set(1.08,.98,.96);spine.add(jacket)
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.44,.055,8,24,Math.PI),mats.holo);collar.name='hero-holo-collar';collar.rotation.x=deg(90);collar.position.set(0,.66*H,-.22);spine.add(collar)
  }

  rig.updateMatrixWorld(true)
  const feet=new THREE.Box3().setFromObject(rig).min.y
  if(Number.isFinite(feet))rig.position.y-=feet
  group.userData={...group.userData,semantic:hero?'player-character':'crowd-resident',rigState:'hierarchical-procedural-v4-max',animationReady:true,facialDetailV4:true,blinkReady:true,breathingReady:true,eyeSaccadeReady:true,faceProfileCount:faceProfiles.length,hairStyleCount:6,layeredWardrobe:true,fingerDetail:true,materialResponse:'skin-cloth-separated',originalTryammDesign:true}
}


function addBJStubbsCharacter(group,x,z,mats){
  // BJ Stubbs V4 is the first named StreetVerse hero. This procedural pass
  // establishes stable proportions, hair/beard silhouette and wardrobe so a
  // later authorized photo-matched head can replace the face without replacing
  // gameplay identity, rig names, missions or progression.
  addResidentArchetype(group,x,z,mats,0,true)

  const rig=group.getObjectByName('character-rig-hero')
  const headPivot=group.getObjectByName('rig-head')
  const spine=group.getObjectByName('rig-spine')
  if(!rig||!headPivot||!spine)return

  const skin=new THREE.MeshPhysicalMaterial({
    name:'bj-skin-current',
    color:0x70462f,
    roughness:.46,
    metalness:0,
    clearcoat:.025,
    clearcoatRoughness:.82,
  })
  skin.userData={surface:'skin',characterId:'bj-stubbs',referenceLocked:true,subsurfaceApproximation:true}
  const hair=new THREE.MeshStandardMaterial({name:'bj-hair',color:0x17110f,roughness:.84,metalness:0})
  const beardGray=new THREE.MeshStandardMaterial({name:'bj-beard-gray',color:0xa7a19b,roughness:.92,metalness:0})
  const blackFabric=new THREE.MeshStandardMaterial({name:'bj-black-fabric',color:0x111419,roughness:.86,metalness:.015})
  const charcoalFabric=new THREE.MeshStandardMaterial({name:'bj-charcoal-fabric',color:0x242830,roughness:.8,metalness:.02})
  const gold=new THREE.MeshStandardMaterial({name:'bj-gold-accent',color:0xc49a44,roughness:.28,metalness:.78})
  const eyeWhite=new THREE.MeshStandardMaterial({name:'bj-eye-white',color:0xe9e4db,roughness:.4,metalness:0})
  const iris=new THREE.MeshStandardMaterial({name:'bj-iris',color:0x2b1b14,roughness:.28,metalness:0})
  const lipNatural=new THREE.MeshStandardMaterial({name:'bj-lip-natural',color:0x6f3d36,roughness:.46,metalness:0})
  const eyeCatch=new THREE.MeshBasicMaterial({name:'bj-eye-catchlight',color:0xffffff})
  const skinShadow=new THREE.MeshStandardMaterial({name:'bj-skin-shadow',color:0x5f3929,roughness:.58,metalness:0})
  const beardMid=new THREE.MeshStandardMaterial({name:'bj-beard-mid-gray',color:0x69635f,roughness:.93,metalness:0})

  const skinNames=new Set(['hero-head','jaw','chin','cheek-left','cheek-right','ear-left','ear-right','nose','eyelid-left','eyelid-right','neck','elbow','forearm','hand','finger-detail','clavicle-line'])
  const blackNames=new Set(['hero-torso','hero-layered-jacket','upper-arm'])
  group.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return
    if(skinNames.has(object.name))object.material=skin
    if(blackNames.has(object.name))object.material=blackFabric
    if(object.name==='eye-white-left'||object.name==='eye-white-right')object.material=eyeWhite
    if(object.name==='iris-left'||object.name==='iris-right')object.material=iris
    if(object.name==='hair-close-crop')object.visible=false
    if(object.name==='finger-detail')object.visible=false
    if(object.name==='hero-holo-collar')object.visible=false
    if(object.name==='hero-undershirt')object.material=charcoalFabric
    if(object.name==='pelvis-shell'||object.name==='thigh'||object.name==='knee'||object.name==='shin')object.material=charcoalFabric
  })

  const head=group.getObjectByName('hero-head')
  const jaw=group.getObjectByName('jaw')
  const chin=group.getObjectByName('chin')
  const nose=group.getObjectByName('nose')
  const cheekLeft=group.getObjectByName('cheek-left')
  const cheekRight=group.getObjectByName('cheek-right')
  const upperLip=group.getObjectByName('upper-lip')
  const lowerLip=group.getObjectByName('lower-lip')
  const eyeWhiteLeft=group.getObjectByName('eye-white-left')
  const eyeWhiteRight=group.getObjectByName('eye-white-right')
  const irisLeft=group.getObjectByName('iris-left')
  const irisRight=group.getObjectByName('iris-right')
  const browLeft=group.getObjectByName('brow-left')
  const browRight=group.getObjectByName('brow-right')
  const shoulderLine=group.getObjectByName('shoulder-line')
  const heroTorso=group.getObjectByName('hero-torso')
  if(head)head.scale.set(.93,1.07,.90)
  if(jaw){jaw.scale.x*=1.00;jaw.scale.y*=.94;jaw.position.y=-.17}
  if(chin){chin.scale.x*=.98;chin.position.y=-.286}
  if(nose){nose.scale.set(.99,1.04,1.01);nose.position.y=-.020;nose.position.z=.314}
  for(const cheek of [cheekLeft,cheekRight])if(cheek){cheek.scale.x*=.97;cheek.scale.y*=.94;cheek.position.y=-.061}
  if(upperLip instanceof THREE.Mesh){upperLip.material=lipNatural;upperLip.scale.x*=1.03;upperLip.position.y=-.132}
  if(lowerLip instanceof THREE.Mesh){lowerLip.material=lipNatural;lowerLip.scale.x*=1.05;lowerLip.scale.y*=1.08;lowerLip.position.y=-.160}
  for(const eye of [eyeWhiteLeft,eyeWhiteRight])if(eye){eye.scale.x*=1.02;eye.scale.y*=.94}
  for(const eye of [irisLeft,irisRight])if(eye){eye.scale.x*=1.03;eye.scale.y*=1.02}
  if(browLeft){browLeft.position.y=.182;browLeft.rotation.z=.035}
  if(browRight){browRight.position.y=.182;browRight.rotation.z=-.035}
  if(shoulderLine)shoulderLine.scale.x*=1.015
  if(heroTorso){heroTorso.scale.x*=.965;heroTorso.scale.z*=.96}
  group.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return
    if(object.name==='upper-arm'){object.scale.x*=.86;object.scale.z*=.86;object.userData={...object.userData,characterRealism:'bj-v5-natural-upper-arm'}}
    if(object.name==='forearm'){object.scale.x*=.91;object.scale.z*=.91;object.userData={...object.userData,characterRealism:'bj-v5-natural-forearm'}}
    if(object.name==='elbow'){object.scale.set(.92,.92,.92)}
    if(object.name==='waist-silhouette'){object.scale.x*=.78;object.scale.z*=.88;object.userData={...object.userData,characterRealism:'bj-v5-tapered-waist'}}
    if(object.name==='pelvis-shell'){object.scale.x*=.92;object.scale.z*=.92}
    if(object.name==='thigh'){object.scale.x*=.94;object.scale.z*=.94}
    if(object.name==='shin'){object.scale.x*=.92;object.scale.z*=.92}
    if(object.name==='hero-layered-jacket'){object.visible=false;object.userData={...object.userData,outfitSlot:'tactical-outerwear',equippedByDefault:false}}
    if(object.name==='hero-holo-collar')object.visible=false
  })

  // BJ V2 facial topology accents. These remain lightweight procedural geometry
  // until the authorized photo-matched head replaces the preview face.
  const noseBridge=new THREE.Mesh(new THREE.CapsuleGeometry(.027,.105,4,10),skin)
  noseBridge.name='bj-nose-bridge';noseBridge.position.set(0,.035,.286);noseBridge.rotation.x=deg(4);headPivot.add(noseBridge)
  const noseTip=new THREE.Mesh(new THREE.SphereGeometry(.052,14,10),skin)
  noseTip.name='bj-nose-tip';noseTip.position.set(0,-.050,.345);noseTip.scale.set(1.02,.68,.76);headPivot.add(noseTip)
  for(const side of [-1,1]){
    const earInner=new THREE.Mesh(new THREE.TorusGeometry(.027,.007,6,12),skinShadow)
    earInner.name=side<0?'bj-v4-ear-inner-left':'bj-v4-ear-inner-right'
    earInner.position.set(side*.315,.015,-.010);earInner.rotation.y=deg(90);headPivot.add(earInner)
  }
  for(const side of [-1,1]){
    const sideBeard=new THREE.Mesh(new THREE.SphereGeometry(.105,16,10),hair)
    sideBeard.name=side<0?'bj-beard-side-left':'bj-beard-side-right'
    sideBeard.position.set(side*.185,-.115,.205);sideBeard.scale.set(.72,1.10,.55);headPivot.add(sideBeard)
    const catchlight=new THREE.Mesh(new THREE.SphereGeometry(.0065,6,5),eyeCatch)
    catchlight.name=side<0?'bj-eye-catchlight-left':'bj-eye-catchlight-right'
    catchlight.position.set(side*.102,.096,.352);headPivot.add(catchlight)
  }
  const beardChin=new THREE.Mesh(new THREE.SphereGeometry(.145,16,10),hair)
  beardChin.name='bj-beard-chin';beardChin.position.set(0,-.255,.205);beardChin.scale.set(.86,.92,.70);headPivot.add(beardChin)

  for(const side of [-1,1]){
    const underEye=new THREE.Mesh(new THREE.CapsuleGeometry(.012,.095,3,8),skinShadow)
    underEye.name=side<0?'bj-under-eye-left':'bj-under-eye-right'
    underEye.position.set(side*.105,.040,.318);underEye.rotation.z=deg(90);underEye.scale.set(1,.45,.42);headPivot.add(underEye)
    const beardBlend=new THREE.Mesh(new THREE.SphereGeometry(.092,14,10),beardMid)
    beardBlend.name=side<0?'bj-beard-blend-left':'bj-beard-blend-right'
    beardBlend.position.set(side*.155,-.168,.248);beardBlend.scale.set(.72,.92,.52);headPivot.add(beardBlend)
  }
  const jawBlend=new THREE.Mesh(new THREE.CapsuleGeometry(.032,.22,4,10),skinShadow)
  jawBlend.name='bj-jaw-shadow';jawBlend.position.set(0,-.235,.236);jawBlend.rotation.z=deg(90);jawBlend.scale.set(1.65,.45,.45);headPivot.add(jawBlend)

  // Pulled-back locs: close crown + swept loc rows + rear tied bundle.
  const locCrown=new THREE.Mesh(new THREE.SphereGeometry(.355,24,14,0,Math.PI*2,0,Math.PI*.48),hair)
  locCrown.name='bj-loc-crown';locCrown.position.set(0,.11,-.018);locCrown.scale.set(.99,.72,1.03);headPivot.add(locCrown)
  const locXs=[-.23,-.15,-.075,0,.075,.15,.23]
  locXs.forEach((lx,i)=>{
    const strand=new THREE.Mesh(new THREE.CapsuleGeometry(.024+(i%2)*.004,.42+(i%3)*.055,4,8),hair)
    strand.name='bj-pulled-loc'
    strand.position.set(lx,.08-Math.abs(lx)*.17,-.205-Math.abs(lx)*.12)
    strand.rotation.x=deg(58)
    strand.rotation.z=-lx*.45
    strand.scale.set(1,1,1.05)
    headPivot.add(strand)
  })
  const tie=new THREE.Mesh(new THREE.TorusGeometry(.105,.018,8,20),gold)
  tie.name='bj-loc-tie';tie.rotation.x=deg(90);tie.position.set(0,-.075,-.33);headPivot.add(tie)

  for(const side of [-1,1]){
    for(let i=0;i<3;i++){
      const loc=new THREE.Mesh(new THREE.CapsuleGeometry(.024,.94+i*.10,4,8),hair)
      loc.name='bj-v4-shoulder-loc'
      loc.position.set(side*(.16+i*.035),-.55-i*.055,-.29-i*.025)
      loc.rotation.z=side*(.08+i*.02);loc.rotation.x=deg(3);headPivot.add(loc)
    }
  }
  for(let i=0;i<6;i++){
    const angle=(i/6)*Math.PI*2
    const strand=new THREE.Mesh(new THREE.CapsuleGeometry(.026,.82+(i%3)*.14,4,8),hair)
    strand.name='bj-rear-loc-bundle'
    strand.position.set(Math.cos(angle)*.085,-.48-(i%2)*.06, -.35+Math.sin(angle)*.06)
    strand.rotation.z=Math.cos(angle)*.12
    strand.rotation.x=deg(5)+Math.sin(angle)*.06
    headPivot.add(strand)
  }

  // Full beard with subtle gray flecks, plus moustache.
  const beard=new THREE.Mesh(new THREE.SphereGeometry(.292,24,16,0,Math.PI*2,Math.PI*.42,Math.PI*.47),hair)
  beard.name='bj-full-beard';beard.position.set(0,-.165,.105);beard.scale.set(.96,.91,.93);headPivot.add(beard)
  for(const side of [-1,1]){
    const moustache=new THREE.Mesh(new THREE.CapsuleGeometry(.016,.11,3,8),hair)
    moustache.name='bj-moustache';moustache.rotation.z=deg(90)+side*.09;moustache.position.set(side*.055,-.112,.342);headPivot.add(moustache)
  }
  const grayChin=new THREE.Mesh(new THREE.SphereGeometry(.128,18,12),beardGray)
  grayChin.name='bj-gray-chin-panel';grayChin.position.set(0,-.268,.222);grayChin.scale.set(.82,.78,.60);headPivot.add(grayChin)
  for(const side of [-1,1]){
    const graySide=new THREE.Mesh(new THREE.SphereGeometry(.075,14,10),beardGray)
    graySide.name=side<0?'bj-gray-beard-side-left':'bj-gray-beard-side-right'
    graySide.position.set(side*.135,-.205,.255);graySide.scale.set(.75,1.0,.48);headPivot.add(graySide)
  }
  const grayFlecks=[[-.16,-.18,.30],[-.13,-.215,.318],[-.10,-.245,.326],[-.075,-.255,.326],[-.035,-.272,.334],[.03,-.275,.33],[.075,-.258,.326],[.105,-.235,.319],[.145,-.205,.305],[.17,-.17,.286],[-.02,-.205,.344]]
  grayFlecks.forEach(([gx,gy,gz],i)=>{
    const fleck=new THREE.Mesh(new THREE.CapsuleGeometry(.006,.035+(i%2)*.012,2,5),beardGray)
    fleck.name='bj-beard-gray-fleck';fleck.position.set(gx,gy,gz);fleck.rotation.z=(i%2?-.35:.35);headPivot.add(fleck)
  })

  // BJ current-era default: rounded fitted black tee + small pendant.
  // Keep the shirt as a curved shell instead of the old rectangular chest box.
  const currentTee=new THREE.Mesh(new THREE.CapsuleGeometry(.315,.50,8,20),blackFabric)
  currentTee.name='bj-current-tee';currentTee.position.set(0,.42,.015);currentTee.scale.set(1.08,1.02,.86);currentTee.castShadow=true
  currentTee.userData={semantic:'character-shirt',characterId:'bj-stubbs',outfitId:'bj-current-video-tee',equippedByDefault:true,signatureText:'ONLY YAHAVAH CAN JUDGE ME',bodySilhouette:'rounded-fitted-v5'}
  spine.add(currentTee)

  const teeNeckline=new THREE.Mesh(new THREE.TorusGeometry(.145,.018,8,24,Math.PI),blackFabric)
  teeNeckline.name='bj-v4-tee-neckline';teeNeckline.rotation.x=deg(90);teeNeckline.position.set(0,.79,.19);spine.add(teeNeckline)
  const teeHem=addBox(spine,'bj-v4-tee-hem',[.61,.035,.30],[0,-.035,.02],blackFabric,undefined,'character-shirt-hem')
  teeHem.scale.x=.96
  for(const side of [-1,1]){
    const sleeve=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.22,4,10),blackFabric)
    sleeve.name=side<0?'bj-v4-tee-sleeve-left':'bj-v4-tee-sleeve-right'
    sleeve.position.set(side*.385,.64,.015);sleeve.rotation.z=side*deg(8);spine.add(sleeve)
    const arm=group.getObjectByName(side<0?'rig-left-arm':'rig-right-arm')
    if(arm){
      const palm=new THREE.Mesh(new THREE.SphereGeometry(.103,16,12),skin)
      palm.name=side<0?'bj-v4-palm-left':'bj-v4-palm-right';palm.position.set(0,-.91,0);palm.scale.set(.74,1.12,.60);arm.add(palm)
      const fingerXs=[-.048,-.016,.016,.048]
      fingerXs.forEach((fx,i)=>{
        const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.011,.10-(i===0||i===3?.008:0),3,7),skin)
        digit.name='bj-v4-finger';digit.position.set(fx,-1.015,.018);digit.rotation.z=(i-1.5)*.025;arm.add(digit)
      })
      const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.013,.075,3,7),skin)
      thumb.name='bj-v4-thumb';thumb.position.set(side<0?.086:-.086,-.965,.035);thumb.rotation.z=side<0?-.62:.62;arm.add(thumb)
    }
  }
  const shirtPrintGold=addBox(spine,'bj-shirt-print-yahavah',[.42,.10,.025],[0,.48,.205],gold,undefined,'shirt-print')
  const shirtPrintWhiteTop=addBox(spine,'bj-shirt-print-only',[.32,.045,.026],[0,.58,.207],eyeWhite,undefined,'shirt-print')
  const shirtPrintWhiteBottom=addBox(spine,'bj-shirt-print-judge',[.38,.045,.026],[0,.37,.207],eyeWhite,undefined,'shirt-print')
  for(const p of [shirtPrintGold,shirtPrintWhiteTop,shirtPrintWhiteBottom])p.userData={...p.userData,signatureTextProxy:true}
  const leftHarness=addBox(spine,'bj-harness-left',[.075,.78,.045],[-.20,.43,.405],blackFabric,[0,0,deg(18)],'character-harness')
  const rightHarness=addBox(spine,'bj-harness-right',[.075,.78,.045],[.20,.43,.405],blackFabric,[0,0,deg(-18)],'character-harness')
  leftHarness.userData={...leftHarness.userData,characterId:'bj-stubbs',outfitSlot:'tactical-harness',equippedByDefault:false};rightHarness.userData={...rightHarness.userData,characterId:'bj-stubbs',outfitSlot:'tactical-harness',equippedByDefault:false};leftHarness.visible=false;rightHarness.visible=false
  const chestBand=addBox(spine,'bj-chest-band',[.53,.06,.045],[0,.44,.418],gold,undefined,'wardrobe-accent')
  chestBand.castShadow=false;chestBand.visible=false;chestBand.userData={...chestBand.userData,outfitSlot:'tactical-accent',equippedByDefault:false}
  const backpack=addBox(spine,'bj-backpack',[.58,.72,.19],[0,.40,-.39],blackFabric,undefined,'character-backpack')
  backpack.scale.x=.92;backpack.visible=false;backpack.userData={...backpack.userData,outfitSlot:'tactical-backpack',equippedByDefault:false}
  const chain=new THREE.Mesh(new THREE.TorusGeometry(.19,.014,8,28,Math.PI),gold)
  chain.name='bj-gold-chain';chain.rotation.x=deg(90);chain.position.set(0,.61,.255);chain.scale.set(.68,.68,.68);spine.add(chain)
  const pendant=new THREE.Mesh(new THREE.DodecahedronGeometry(.065,0),gold)
  pendant.name='bj-gold-pendant';pendant.position.set(0,.46,.275);pendant.scale.set(.62,.72,.34);spine.add(pendant)
  const patch=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.025,6),gold)
  patch.name='bj-lion-crown-emblem-placeholder';patch.rotation.x=deg(90);patch.position.set(.23,.55,.42);patch.visible=false;patch.userData={outfitSlot:'tactical-emblem',equippedByDefault:false};spine.add(patch)

  rig.userData={
    ...rig.userData,
    characterId:'bj-stubbs',
    displayName:'BJ Stubbs',
    namedCharacter:true,
    era:'current',
    likenessState:'REFERENCE_LOCKED_PROCEDURAL_V4_VIDEO',
    role:'Security & Operations',
    affiliation:'Stubbs Family / StreetVerse Security',
    referenceConsistencyLocked:true,
    photoMatchedHead:false,
    characterFactoryCompatible:true,
    facialDetailPass:'bj-v4-current-video',
    rigContract:'streetverse-character-dna-v1',
  }
  group.userData={
    ...group.userData,
    characterId:'bj-stubbs',
    displayName:'BJ Stubbs',
    namedCharacter:true,
    assetVersion:'bj-realism-v4',
    identityContinuityKey:'bj-stubbs',
    hairstyle:'long-pulled-back-locs',
    facialHair:'gray-forward-salt-and-pepper-beard',
    wardrobe:'current-video-black-tee-small-gold-pendant',
    signatureTextPlanned:'ONLY YAHAVAH CAN JUDGE ME',
    referenceSource:'user-authorized-current-walking-video',
    silhouetteTarget:'lean-current-bj-rounded-v5',
    tacticalOutfitDefault:false,
    handDetailPass:'five-finger-v1',
    clothingFitPass:'rounded-fitted-tee-v5',
    locDetailPass:'long-locs-v2',
    beardBlendPass:'salt-pepper-v2',
    proceduralPreview:true,
    photoMatchedHead:false,
    characterFactoryCompatible:true,
    facialDetailPass:'bj-v2',
    rigContract:'streetverse-character-dna-v1',
  }
}

function addTransitTrain(group,x,z,mats){
  const shellMat=mat('cta-shell',0xd7dbdf,.28,.72)
  const stripeMat=mat('cta-accent',0x1e8fc6,.36,.32,0x0b4c69,.35)
  const windowMat=mat('cta-window',0x203744,.16,.42)
  const wheelMat=mats.tire
  group.userData={...group.userData,semantic:'city-transit-train',originalTryammDesign:true}
  for(let i=0;i<3;i++){
    const cx=x+i*11.35
    const shell=new THREE.Mesh(new THREE.CapsuleGeometry(1.18,8.7,6,16),shellMat)
    shell.name=`train-car-${i+1}`;shell.rotation.z=deg(90);shell.position.set(cx,1.52,z);shell.scale.set(1,1,1.08);shell.castShadow=true;group.add(shell)
    const stripe=new THREE.Mesh(new THREE.CapsuleGeometry(.08,8.2,3,10),stripeMat)
    stripe.name='train-stripe';stripe.rotation.z=deg(90);stripe.position.set(cx,1.42,z+1.18);group.add(stripe)
    for(let w=-3;w<=3;w+=1.5){
      const window=new THREE.Mesh(new THREE.PlaneGeometry(1.05,.62),windowMat)
      window.name='train-window';window.position.set(cx+w,1.78,z+1.205);group.add(window)
    }
    for(const wx of [-3.35,3.35])for(const side of [-1,1]){
      const wheel=new THREE.Mesh(new THREE.CylinderGeometry(.34,.34,.18,18),wheelMat)
      wheel.name='train-wheel';wheel.rotation.x=deg(90);wheel.position.set(cx+wx,.42,z+side*.98);group.add(wheel)
    }
    const door=new THREE.Mesh(new THREE.PlaneGeometry(1.08,1.58),mats.metal);door.name='train-door';door.position.set(cx,1.32,z+1.215);group.add(door)
  }
}

function addBuilding(group,x,z,w,h,d,mats,index,density){
  addBox(group,`building-${index}`,[w,h,d],[x,h/2,z],index%2?mats.brickA:mats.brickB,undefined,'building-shell')
  const floors=Math.max(2,Math.floor(h/2.8))
  const cols=Math.max(2,Math.floor(w/2.3*density))
  for(let f=0;f<floors;f++)for(let c=0;c<cols;c++){
    const wx=x-w/2+1+(c*(w-2)/Math.max(1,cols-1))
    const wy=1.55+f*2.55
    addBox(group,'window',[.76,1.18,.05],[wx,wy,z+d/2+.035],mats.glass,undefined,'window')
    addBox(group,'window-sill',[.92,.08,.12],[wx,wy-.66,z+d/2+.07],mats.concrete,undefined,'facade-trim')
    addBox(group,'window-lintel',[.94,.08,.12],[wx,wy+.66,z+d/2+.07],mats.concrete,undefined,'facade-trim')
  }
  const sideFloors=Math.max(2,Math.min(4,floors))
  for(let f=0;f<sideFloors;f++)for(const dz of [-d*.24,d*.24]){
    addBox(group,'side-window',[.05,1.04,.78],[x+w/2+.035,1.65+f*2.55,z+dz],mats.glass,undefined,'window')
  }
  addBox(group,'storefront-glass',[Math.max(2.5,w*.42),1.72,.06],[x-w*.19,.96,z+d/2+.045],mats.glass,undefined,'storefront')
  addBox(group,'building-door',[1.05,2.15,.08],[x+w*.24,1.08,z+d/2+.055],mats.metal,undefined,'entrance')
  addBox(group,'entry-stoop',[2.15,.18,1.05],[x+w*.24,.09,z+d/2+.5],mats.concrete,undefined,'entrance-stoop')
  addBox(group,'storefront-awning',[Math.max(3.4,w*.5),.18,.92],[x-w*.12,2.15,z+d/2+.48],index%2?mats.metal:mats.holo,undefined,'storefront-awning')
  addBox(group,'facade-band',[w*.9,.18,.16],[x,h*.36,z+d/2+.08],mats.concrete,undefined,'facade-band')
  addBox(group,'cornice',[w+.28,.28,d+.22],[x,h-.12,z],mats.concrete,undefined,'cornice')
  addBox(group,'roof-cap',[w+.38,.18,d+.38],[x,h+.09,z],mats.concrete,undefined,'roof-cap')
  addBox(group,'rooftop-hvac',[Math.max(1.2,w*.18),.72,Math.max(1.1,d*.22)],[x-w*.18,h+.48,z],mats.metal,undefined,'rooftop-equipment')
  addBox(group,'rooftop-hvac',[Math.max(1,w*.14),.58,Math.max(.9,d*.18)],[x+w*.2,h+.39,z+d*.14],mats.metal,undefined,'rooftop-equipment')
}

function build(profile){
  const group=new THREE.Group()
  group.name=`TRYAMM-Native-${profile.id}`
  group.userData={
    schema:'tryamm.native-asset-foundry.v1',
    cityStyle:'Chicago-inspired',
    exactDigitalTwin:false,
    profile:profile.id,
    label:profile.label,
    reviewedScore:profile.score,
    productionPublishAllowed:false,
  }

  const mats={
    asphalt:mat('asphalt',0x292a2c,.96,0),
    concrete:mat('concrete',profile.weathered>.6?0x8b8984:0xa7a49e,.9,0),
    curb:mat('curb',0xb8b4aa,.88,0),
    brickA:mat('brick-red',profile.weathered>.6?0x6f322b:0x8d4035,.86,0),
    brickB:mat('brick-tan',profile.weathered>.6?0x8b6849:0xad8760,.84,0),
    metal:mat('painted-metal',0x202429,.52,.55),
    wood:mat('wood',0x704b2f,.82,0),
    leaf:mat('leaf',0x315f34,.88,0),
    hydrant:mat('hydrant',0xb32622,.48,.35),
    trash:mat('trash-can',0x343a3f,.72,.45),
    recycle:mat('recycling-bin',0x226a4b,.7,.25),
    dumpster:mat('dumpster',0x325641,.7,.38),
    garbageBag:mat('garbage-bag',0x111315,.95,0),
    garbageTie:mat('garbage-tie',0x34383b,.85,0),
    litterPaper:mat('litter-paper',0xd8d0b9,.96,0),
    litterCan:mat('litter-can',0xb6b9ba,.42,.7),
    glass:mat('glass',0x263946,.16,.35),
    car:mat('car-paint',0x294f84,.22,.72),
    tire:mat('rubber',0x090a0b,1,0),
    light:mat('warm-light',0xffe2a3,.22,0,0xffc86a,1.8),
    holo:mat('streetverse-holo',0x14373a,.22,.35,0x00ffd0,2.2*profile.holo),
  }

  addBox(group,'road',[34,.22,18],[0,-.11,0],mats.asphalt,undefined,'drivable-road')
  addBox(group,'sidewalk-north',[34,.26,4],[0,.02,-11],mats.concrete,undefined,'walkable-sidewalk')
  addBox(group,'sidewalk-south',[34,.26,4],[0,.02,11],mats.concrete,undefined,'walkable-sidewalk')
  addBox(group,'curb-north',[34,.22,.34],[0,.18,-8.85],mats.curb)
  addBox(group,'curb-south',[34,.22,.34],[0,.18,8.85],mats.curb)

  for(const x of [-13,-7,-1,5,11])addBox(group,'lane-dash',[2.2,.025,.12],[x,.02,0],mats.curb,undefined,'road-marking')
  addBuilding(group,-10,-15,8,8.5,5.3,mats,1,profile.density)
  addBuilding(group,0,-15,9.2,11.5,5.4,mats,2,profile.density)
  addBuilding(group,10.5,-15,8.4,9.6,5.2,mats,3,profile.density)

  for(const [x,z,s] of [[-13,12.2,1],[0,12.6,.95],[12,12.1,1.05]])addTree(group,x,z,s,mats)
  for(const x of [-14,-5,4,13])addStreetLamp(group,x,-8.25,mats,profile.holo)
  addBench(group,-5,12.2,mats);addBench(group,6.5,12.2,mats)
  addHydrant(group,10,9.9,mats)
  addTrashCan(group,-6,10,mats);addRecyclingBin(group,6,10,mats);addDumpster(group,5,27,mats)
  addGarbageBag(group,3,12,mats,.9);addGarbageBag(group,-4,-20,mats,1);addLitterCluster(group,1,23,mats)
  addCarBlockout(group,-6,4.2,mats);addCarBlockout(group,7,-4.2,mats)

  if(profile.holo>.3){
    for(const x of [-10,0,10]){
      const beacon=addCylinder(group,'holo-wayfinder',.06,2.1,[x,1.05,8.2],mats.holo,12,'holographic-wayfinder')
      beacon.userData.interactionAnchor=true
      const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,8,32),mats.holo)
      ring.position.set(x,2.0,8.2);ring.rotation.x=deg(90);ring.userData={semantic:'holographic-ring',collision:'none'}
      group.add(ring)
    }
  }

  return group
}

async function exportGlb(object,target){
  const exporter=new GLTFExporter()
  const result=await exporter.parseAsync(object,{
    binary:true,
    onlyVisible:true,
    truncateDrawRange:true,
    trs:false,
    maxTextureSize:2048,
  })
  if(!(result instanceof ArrayBuffer))throw new Error('GLTFExporter did not return binary ArrayBuffer')
  fs.writeFileSync(target,Buffer.from(result))
  return fs.statSync(target).size
}

const artifacts=[]
for(const profile of PROFILES){
  const object=build(profile)
  const folder=path.join(OUT,profile.id)
  fs.mkdirSync(folder,{recursive:true})
  const file=path.join(folder,'native-candidate.glb')
  const bytes=await exportGlb(object,file)
  artifacts.push({
    id:profile.id,label:profile.label,reviewedScore:profile.score,
    file:path.relative(OUT,file),bytes,
    generator:'tryamm-native-asset-foundry',
    externalApi:false,
    creditsUsed:0,
  })
}


const kitProfile=PROFILES.find(p=>p.id==='sample-c-holo-reality-fusion')
const kitMats={
  asphalt:mat('asphalt',0x292a2c,.96,0),
  concrete:mat('concrete',0x9d9990,.9,0),
  curb:mat('curb',0xb8b4aa,.88,0),
  brickA:mat('brick-red',0x7e392f,.86,0),
  brickB:mat('brick-tan',0x9c7553,.84,0),
  metal:mat('painted-metal',0x202429,.52,.55),
  wood:mat('wood',0x704b2f,.82,0),
  leaf:mat('leaf',0x315f34,.88,0),
  hydrant:mat('hydrant',0xb32622,.48,.35),
  trash:mat('trash-can',0x343a3f,.72,.45),
  recycle:mat('recycling-bin',0x226a4b,.7,.25),
  dumpster:mat('dumpster',0x325641,.7,.38),
  garbageBag:mat('garbage-bag',0x111315,.95,0),
  garbageTie:mat('garbage-tie',0x34383b,.85,0),
  litterPaper:mat('litter-paper',0xd8d0b9,.96,0),
  litterCan:mat('litter-can',0xb6b9ba,.42,.7),
  glass:mat('glass',0x263946,.16,.35),
  car:mat('car-paint',0x294f84,.22,.72),
  tire:mat('rubber',0x090a0b,1,0),
  light:mat('warm-light',0xffe2a3,.22,0,0xffc86a,1.8),
  holo:mat('streetverse-holo',0x14373a,.22,.35,0x00ffd0,2.2*kitProfile.holo),
}

const kitBuilders={
  'street-and-sidewalk':()=>{
    const g=new THREE.Group();g.name='TRYAMM-street-and-sidewalk'
    addBox(g,'road',[20,.22,12],[0,-.11,0],kitMats.asphalt,undefined,'drivable-road')
    addBox(g,'sidewalk-left',[20,.26,3],[0,.02,-7.5],kitMats.concrete,undefined,'walkable-sidewalk')
    addBox(g,'sidewalk-right',[20,.26,3],[0,.02,7.5],kitMats.concrete,undefined,'walkable-sidewalk')
    addBox(g,'curb-left',[20,.22,.34],[0,.18,-6.05],kitMats.curb)
    addBox(g,'curb-right',[20,.22,.34],[0,.18,6.05],kitMats.curb)
    return g
  },
  'brick-building-module':()=>{
    const g=new THREE.Group();g.name='TRYAMM-brick-building-module'
    addBuilding(g,0,0,8.4,9.4,5.4,kitMats,1,1.18)
    return g
  },
  'street-lamp':()=>{
    const g=new THREE.Group();g.name='TRYAMM-street-lamp'
    addStreetLamp(g,0,0,kitMats,.72);return g
  },
  'bench':()=>{
    const g=new THREE.Group();g.name='TRYAMM-bench'
    addBench(g,0,0,kitMats);return g
  },
  'hydrant':()=>{
    const g=new THREE.Group();g.name='TRYAMM-hydrant'
    addHydrant(g,0,0,kitMats);return g
  },
  'tree':()=>{
    const g=new THREE.Group();g.name='TRYAMM-tree'
    addTree(g,0,0,1,kitMats);return g
  },
  'vehicle-blockout':()=>{
    const g=new THREE.Group();g.name='TRYAMM-vehicle-blockout'
    add2027SportSedan(g,0,0,kitMats)
    g.userData={...g.userData,semantic:'traffic-sedan-visual',legacyCatalogId:'vehicle-blockout',realismReplacement:true}
    return g
  },
  'tryamm-2027-sport-sedan':()=>{
    const g=new THREE.Group();g.name='TRYAMM-2027-sport-sedan'
    add2027SportSedan(g,0,0,kitMats)
    return g
  },
  'tryamm-2027-custom-box-truck':()=>{
    const g=new THREE.Group();g.name='TRYAMM-2027-custom-box-truck'
    add2027CustomBoxTruck(g,0,0,kitMats)
    return g
  },
  'streetverse-hero-player':()=>{
    const g=new THREE.Group();g.name='TRYAMM-StreetVerse-Hero-Player'
    addBJStubbsCharacter(g,0,0,kitMats);return g
  },
  'resident-archetype-a':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-A'
    addResidentArchetype(g,0,0,kitMats,0,false);return g
  },
  'resident-archetype-b':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-B'
    addResidentArchetype(g,0,0,kitMats,1,false);return g
  },
  'resident-archetype-c':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-C'
    addResidentArchetype(g,0,0,kitMats,2,false);return g
  },
  'resident-archetype-d':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-D'
    addResidentArchetype(g,0,0,kitMats,3,false);return g
  },
  'resident-archetype-e':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-E'
    addResidentArchetype(g,0,0,kitMats,4,false);return g
  },
  'resident-archetype-f':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-F'
    addResidentArchetype(g,0,0,kitMats,5,false);return g
  },
  'resident-archetype-g':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-G'
    addResidentArchetype(g,0,0,kitMats,6,false);return g
  },
  'resident-archetype-h':()=>{
    const g=new THREE.Group();g.name='TRYAMM-Resident-Archetype-H'
    addResidentArchetype(g,0,0,kitMats,7,false);return g
  },
  'city-transit-train':()=>{
    const g=new THREE.Group();g.name='TRYAMM-City-Transit-Train'
    addTransitTrain(g,0,0,kitMats);return g
  },
  'holo-wayfinder':()=>{
    const g=new THREE.Group();g.name='TRYAMM-holo-wayfinder'
    const beacon=addCylinder(g,'holo-wayfinder',.06,2.1,[0,1.05,0],kitMats.holo,12,'holographic-wayfinder')
    beacon.userData.interactionAnchor=true
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.035,8,32),kitMats.holo)
    ring.position.set(0,2.0,0);ring.rotation.x=deg(90);ring.userData={semantic:'holographic-ring',collision:'none'}
    g.add(ring);return g
  },
  'trash-can':()=>{
    const g=new THREE.Group();g.name='TRYAMM-trash-can'
    addTrashCan(g,0,0,kitMats);return g
  },
  'recycling-bin':()=>{
    const g=new THREE.Group();g.name='TRYAMM-recycling-bin'
    addRecyclingBin(g,0,0,kitMats);return g
  },
  'dumpster':()=>{
    const g=new THREE.Group();g.name='TRYAMM-dumpster'
    addDumpster(g,0,0,kitMats);return g
  },
  'garbage-bag':()=>{
    const g=new THREE.Group();g.name='TRYAMM-garbage-bag'
    addGarbageBag(g,0,0,kitMats,1);return g
  },
  'litter-cluster':()=>{
    const g=new THREE.Group();g.name='TRYAMM-litter-cluster'
    addLitterCluster(g,0,0,kitMats);return g
  },
}

const kitArtifacts=[]
const kitDir=path.join(OUT,'kit')
fs.mkdirSync(kitDir,{recursive:true})
for(const [id,builder] of Object.entries(kitBuilders)){
  const file=path.join(kitDir,`${id}.glb`)
  const bytes=await exportGlb(builder(),file)
  kitArtifacts.push({
    id,
    file:path.relative(OUT,file),
    bytes,
    generator:'tryamm-native-asset-foundry',
    reusable:true,
    externalApi:false,
    creditsUsed:0,
  })
}

const winner=[...artifacts].sort((a,b)=>b.reviewedScore-a.reviewedScore)[0]
const winnerSource=path.join(OUT,winner.file)
const winnerTarget=path.join(OUT,'production-review-holo-reality-fusion.glb')
fs.copyFileSync(winnerSource,winnerTarget)

const manifest={
  schema:'tryamm.native-asset-foundry.evidence.v1',
  generatedAt:new Date().toISOString(),
  externalApiRequired:false,
  creditsUsed:0,
  cityStyle:'Chicago-inspired',
  exactDigitalTwin:false,
  artifacts,
  kitArtifacts,
  reviewedWinner:{...winner,file:path.basename(winnerTarget)},
  resources:{
    geometry:'TRYAMM procedural generator + reusable modular GLB kit with rounded vehicle/transit/humanoid realism shells',
    materials:'TRYAMM PBR parameter recipes',
    collision:'semantic primitive collision metadata',
    holographics:'integrated emissive/interaction anchor geometry',
    lodPlan:'use glTF Transform + runtime LOD generation after visual approval',
  },
  gates:{
    humanVisualReview:false,
    assetPassportCertified:false,
    runtimePerformanceEvidence:false,
    productionPublishAllowed:false,
  },
  truth:'These are real TRYAMM-generated GLB baseline candidates. They are not called production-certified until visual, Asset Passport and runtime evidence pass.',
}
fs.writeFileSync(path.join(OUT,'manifest.json'),JSON.stringify(manifest,null,2))
console.log(JSON.stringify({output:OUT,winner:manifest.reviewedWinner,artifacts:artifacts.length,kitArtifacts:kitArtifacts.length},null,2))