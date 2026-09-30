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
  const skin=mat(`skin-${variant}`,skinPalette[variant%skinPalette.length],.40,0)
  skin.userData={surface:'skin',softResponse:true,m5Layer:'skin'}
  const outfit=mat(`outfit-${variant}`,outfitPalette[variant%outfitPalette.length],.82,.025)
  outfit.userData={surface:'fabric',m5Layer:'wardrobe'}
  const accent=mat(`outfit-accent-${variant}`,outfitPalette[(variant+3)%outfitPalette.length],.66,.08)
  accent.userData={surface:'premium-fabric',m5Layer:'wardrobe'}
  const pants=mat(`pants-${variant}`,variant%2?0x202936:0x2f3138,.8,.025)
  const hair=mat(`hair-${variant}`,variant%2?0x2d1c15:0x15110f,.84,0)
  const lip=mat(`lip-${variant}`,variant%2?0x6e342e:0x7b4035,.58,0)
  const eyeWhite=mat(`eye-white-${variant}`,0xf0eee8,.42,0)
  const iris=mat(`iris-${variant}`,variant%3===0?0x3b281c:variant%3===1?0x4a3522:0x2f241f,.34,.02)
  const pupil=mat(`pupil-${variant}`,0x090909,.28,.04)
  const femininePresentation=[2,3,6,7].includes(variant%8)
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
  const H=hero?1.05:proportions.h
  const shoulder=(hero?.56:.52)*proportions.shoulder*(femininePresentation?.95:1)
  const rig=new THREE.Group()
  rig.name=hero?'character-rig-hero':'character-rig-resident'
  rig.position.set(x,0,z)
  const styleProfiles=['street-lux','creator-drip','set-apart-regal','classic-fresh','future-holo','set-apart-modest','performance-fit','legacy-premium']
  const styleProfile=hero?'founder-signature':styleProfiles[variant%styleProfiles.length]
  rig.userData={semantic:hero?'hero-character-rig':'resident-character-rig',animationReady:true,generatedBy:'tryamm-native-asset-foundry',m5Character:true,styleProfile,swaggerSeed:variant%4,originalTryammStreetwear:true}
  group.add(rig)
  const faceLayer=new THREE.Group();faceLayer.name='m5-layer-face';rig.add(faceLayer)
  const wardrobeLayer=new THREE.Group();wardrobeLayer.name='m5-layer-wardrobe';rig.add(wardrobeLayer)
  const accessoryLayer=new THREE.Group();accessoryLayer.name='m5-layer-accessories';rig.add(accessoryLayer)

  const pelvis=new THREE.Group();pelvis.name='rig-pelvis';pelvis.position.y=.88*H;rig.add(pelvis)
  const hips=new THREE.Mesh(new THREE.CapsuleGeometry(.28*proportions.torso,.34,4,10),pants)
  hips.name='pelvis-shell';hips.rotation.z=deg(90);hips.scale.set(1,femininePresentation?.96:1,femininePresentation?1.20:1.12);hips.castShadow=true;pelvis.add(hips)

  const spine=new THREE.Group();spine.name='rig-spine';spine.position.y=.43*H;pelvis.add(spine)
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry((hero?.42:.39)*proportions.torso,.82*H,6,14),outfit)
  torso.name=hero?'hero-torso':'resident-torso';torso.position.y=.40*H;torso.scale.set(proportions.shoulder*(femininePresentation?.94:1),1,femininePresentation?.84:.88);torso.castShadow=true;spine.add(torso)
  if(femininePresentation&&!hero){const waistBand=addBox(spine,'m5-femme-waist-layer',[.64,.10,.55],[0,.09*H,.02],accent,undefined,'fitted-waist-layer');waistBand.scale.x=.88}
  const shoulderLine=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.72*shoulder,4,10),outfit)
  shoulderLine.name='shoulder-line';shoulderLine.rotation.z=deg(90);shoulderLine.position.y=.78*H;shoulderLine.castShadow=true;spine.add(shoulderLine)
  const neck=addCylinder(spine,'neck',.13,.22,[0,.98*H,0],skin,14,'character-neck')

  const headPivot=new THREE.Group();headPivot.name='rig-head';headPivot.position.y=1.12*H;spine.add(headPivot)
  faceLayer.position.copy(headPivot.getWorldPosition(new THREE.Vector3()))
  const head=new THREE.Mesh(new THREE.SphereGeometry((hero?.35:.325)*proportions.head,24,18),skin)
  head.name=hero?'hero-head':'resident-head';head.scale.set(.91,1.08,.88);head.castShadow=true;headPivot.add(head)
  const jaw=new THREE.Mesh(new THREE.SphereGeometry(.25*proportions.head,18,12),skin)
  jaw.name='jaw';jaw.position.set(0,-.16,.015);jaw.scale.set(.88,.72,.83);headPivot.add(jaw)
  const chin=new THREE.Mesh(new THREE.SphereGeometry(.105*proportions.head,14,10),skin);chin.name='chin';chin.position.set(0,-.275,.19);chin.scale.set(.92,.72,.82);headPivot.add(chin)
  for(const side of [-1,1]){const cheek=new THREE.Mesh(new THREE.SphereGeometry(.12*proportions.head,14,10),skin);cheek.name=side<0?'cheek-left':'cheek-right';cheek.position.set(side*.165,-.055,.235);cheek.scale.set(1.18,.68,.62);headPivot.add(cheek)}
  for(const side of [-1,1]){
    const ear=new THREE.Mesh(new THREE.SphereGeometry(.055*proportions.head,10,8),skin)
    ear.name=side<0?'ear-left':'ear-right';ear.position.set(side*.30*proportions.head,.015,-.015);ear.scale.set(.62,1.1,.55);headPivot.add(ear)
  }
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.05,.145,10),skin);nose.name='nose';nose.rotation.x=deg(90);nose.position.set(0,-.015,.305);headPivot.add(nose)
  for(const side of [-1,1]){const nostril=new THREE.Mesh(new THREE.SphereGeometry(.013,8,6),pupil);nostril.name=side<0?'nostril-left':'nostril-right';nostril.position.set(side*.032,-.072,.357);nostril.scale.set(1.05,.5,.45);headPivot.add(nostril)}
  for(const side of [-1,1]){
    const white=new THREE.Mesh(new THREE.SphereGeometry(.047,12,8),eyeWhite);white.name=side<0?'eye-white-left':'eye-white-right';white.position.set(side*.112,.085,.292);white.scale.set(1.05,.62,.45);headPivot.add(white)
    const irisMesh=new THREE.Mesh(new THREE.SphereGeometry(.024,10,8),iris);irisMesh.name=side<0?'iris-left':'iris-right';irisMesh.position.set(side*.112,.085,.326);irisMesh.scale.set(1,.82,.5);headPivot.add(irisMesh)
    const pupilMesh=new THREE.Mesh(new THREE.SphereGeometry(.012,8,6),pupil);pupilMesh.name=side<0?'pupil-left':'pupil-right';pupilMesh.position.set(side*.112,.085,.341);headPivot.add(pupilMesh)
    const brow=addBox(headPivot,side<0?'brow-left':'brow-right',[.135,.026,.025],[side*.112,.175,.298],hair,[0,0,side*.05],'eyebrow')
    brow.castShadow=false
    const eyelid=new THREE.Mesh(new THREE.SphereGeometry(.052,12,8),skin);eyelid.name=side<0?'eyelid-left':'eyelid-right';eyelid.position.set(side*.112,.108,.314);eyelid.scale.set(1.08,.16,.46);eyelid.userData={facialControl:'blink',m5Layer:'face'};headPivot.add(eyelid)
  }
  const upperLip=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.13,3,8),lip);upperLip.name='upper-lip';upperLip.rotation.z=deg(90);upperLip.position.set(0,-.13,.31);upperLip.scale.y=.7;headPivot.add(upperLip)
  const lowerLip=upperLip.clone();lowerLip.name='lower-lip';lowerLip.position.y=-.158;lowerLip.scale.set(1.02,femininePresentation?1.08:.9,1);headPivot.add(lowerLip)
  if(femininePresentation&&!hero){
    for(const side of [-1,1]){
      const lash=addBox(headPivot,side<0?'m5-lash-left':'m5-lash-right',[.105,.012,.018],[side*.112,.125,.337],hair,[0,0,side*.08],'beauty-lash')
      lash.castShadow=false
      const liner=addBox(headPivot,side<0?'m5-liner-left':'m5-liner-right',[.13,.010,.014],[side*.112,.112,.339],hair,[0,0,side*.04],'beauty-liner')
      liner.castShadow=false
    }
    const gloss=new THREE.Mesh(new THREE.CapsuleGeometry(.019,.14,3,8),mat(`lip-gloss-${variant}`,0xb85f70,.24,.02));gloss.name='m5-lip-gloss';gloss.rotation.z=deg(90);gloss.position.set(0,-.155,.326);gloss.scale.y=.92;headPivot.add(gloss)
  }

  const hairStyle=variant%4
  if(femininePresentation&&!hero){
    const crown=new THREE.Mesh(new THREE.SphereGeometry(.35*proportions.head,20,14,0,Math.PI*2,0,Math.PI*.52),hair)
    crown.name=variant%2?'m5-femme-curly-crown':'m5-femme-silk-crown';crown.position.y=.12;crown.scale.set(1.04,.88,1.04);headPivot.add(crown)
    if(variant%2===0){
      for(const side of [-1,1]){const fall=new THREE.Mesh(new THREE.CapsuleGeometry(.055,.78,5,8),hair);fall.name='m5-long-hair-fall';fall.position.set(side*.25,-.20,-.05);fall.rotation.z=side*.07;headPivot.add(fall)}
    }else{
      for(let row=0;row<4;row++){const curl=new THREE.Mesh(new THREE.TorusGeometry(.07,.018,6,12,Math.PI*1.5),hair);curl.name='m5-curl-lock';curl.position.set((row-1.5)*.10,-.12-row*.035,-.02);curl.rotation.y=row*.45;headPivot.add(curl)}
    }
  }
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
  }else{
    const base=new THREE.Mesh(new THREE.SphereGeometry(.34*proportions.head,18,10,0,Math.PI*2,0,Math.PI*.42),hair)
    base.name='hair-braided-base';base.position.y=.11;base.scale.y=.72;headPivot.add(base)
    for(const side of [-1,1])for(let row=0;row<2;row++){
      const braid=new THREE.Mesh(new THREE.CapsuleGeometry(.025,.42,3,6),hair)
      braid.name='hair-braid';braid.position.set(side*(.16+row*.07),-.11,-.10);braid.rotation.z=side*.12;headPivot.add(braid)
    }
  }

  for(const side of [-1,1]){
    const armPivot=new THREE.Group();armPivot.name=side<0?'rig-left-arm':'rig-right-arm';armPivot.position.set(side*shoulder,.69*H,0);spine.add(armPivot)
    const upperArm=new THREE.Mesh(new THREE.CapsuleGeometry(.095,.39*H,4,10),outfit);upperArm.name='upper-arm';upperArm.position.y=-.24*H;upperArm.castShadow=true;armPivot.add(upperArm)
    const elbow=new THREE.Mesh(new THREE.SphereGeometry(.095,10,8),skin);elbow.name='elbow';elbow.position.y=-.48*H;armPivot.add(elbow)
    const forearm=new THREE.Mesh(new THREE.CapsuleGeometry(.082,.34*H,4,10),skin);forearm.name='forearm';forearm.position.y=-.67*H;armPivot.add(forearm)
    const hand=new THREE.Mesh(new THREE.SphereGeometry(.105,12,8),skin);hand.name='hand';hand.position.y=-.91*H;hand.scale.set(.82,1.18,.68);armPivot.add(hand)
    for(let finger=0;finger<4;finger++){const digit=new THREE.Mesh(new THREE.CapsuleGeometry(.016,.085,3,6),skin);digit.name='finger-detail';digit.position.set((finger-1.5)*.026,-1.01*H,.035);digit.rotation.z=(finger-1.5)*.05;armPivot.add(digit);if(femininePresentation&&!hero){const nail=addBox(armPivot,'m5-manicure-nail',[.018,.026,.010],[(finger-1.5)*.026,-1.058*H,.073],mat(`nail-${variant}`,variant%2?0xcf6989:0xe9d7c2,.35,.03),undefined,'beauty-nail');nail.castShadow=false}}
    const thumb=new THREE.Mesh(new THREE.CapsuleGeometry(.018,.07,3,6),skin);thumb.name='thumb-detail';thumb.position.set(side*.06,-.985*H,.03);thumb.rotation.z=side*.55;armPivot.add(thumb)
    if(side<0&&variant%3!==2){const watch=addCylinder(armPivot,'street-watch',.10,.045,[0,-.82*H,0],mat(`watch-${variant}`,0xc7d1dc,.12,.95),12,'wearable-watch');watch.rotation.x=deg(90)}

    const legPivot=new THREE.Group();legPivot.name=side<0?'rig-left-leg':'rig-right-leg';legPivot.position.set(side*.18,.78*H,0);rig.add(legPivot)
    const thigh=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.46*H,4,10),pants);thigh.name='thigh';thigh.position.y=-.31*H;thigh.castShadow=true;legPivot.add(thigh)
    const knee=new THREE.Mesh(new THREE.SphereGeometry(.125,10,8),pants);knee.name='knee';knee.position.y=-.59*H;legPivot.add(knee)
    const shin=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.42*H,4,10),pants);shin.name='shin';shin.position.y=-.82*H;legPivot.add(shin)
    const shoe=new THREE.Mesh(new THREE.CapsuleGeometry(.115,.31,5,12),variant%2?accent:mats.tire);shoe.name='m5-sneaker-upper';shoe.rotation.z=deg(90);shoe.position.set(0,-1.08*H,.11);shoe.scale.z=1.24;legPivot.add(shoe)
    const sole=addBox(legPivot,'m5-sneaker-sole',[.40,.065,.21],[0,-1.16*H,.12],mat(`sneaker-sole-${variant}`,variant%2?0xf2f1ec:0x14171c,.55,.04),undefined,'footwear-sole');sole.castShadow=true
    addBox(legPivot,'m5-sneaker-toe',[.16,.08,.23],[.14,-1.105*H,.12],variant%2?outfit:accent,undefined,'footwear-toe-detail')
  }

  if(!hero&&variant%2===1){
    const jacket=new THREE.Mesh(new THREE.CapsuleGeometry(.405*proportions.torso,.80*H,6,12),accent)
    jacket.name=variant%4===1?'m5-varsity-jacket':'m5-layered-jacket';jacket.position.set(0,.42*H,-.025);jacket.scale.set(proportions.shoulder*1.04,.96,.95);spine.add(jacket)
    const zipper=addBox(spine,'jacket-zipper',[.025,.62,.03],[0,.42*H,.37],mats.metal,undefined,'wardrobe-detail');zipper.castShadow=false
    if(variant%4===1){for(const side of [-1,1])addBox(spine,'varsity-stripe',[.08,.55,.025],[side*.31,.43*H,.38],mat(`stripe-${variant}`,0xf0ece2,.58,.02),undefined,'wardrobe-stripe')}
  }
  if(!hero&&variant%4===0){const hood=new THREE.Mesh(new THREE.TorusGeometry(.29,.065,8,24,Math.PI*1.45),accent);hood.name=femininePresentation?'m5-femme-cropped-hoodie':'m5-hoodie-hood';hood.rotation.x=deg(90);hood.position.set(0,.82*H,-.10);spine.add(hood)}
  const setApartProfile=styleProfile==='set-apart-regal'||styleProfile==='set-apart-modest'
  if(setApartProfile&&!hero){
    const tunic=addBox(spine,'m5-set-apart-tunic',[.92,.92,.52],[0,.28*H,.01],accent,undefined,'set-apart-tunic')
    tunic.scale.set(femininePresentation?.92:1,1.18,.96)
    const sash=addBox(spine,'m5-set-apart-sash',[.12,.84,.035],[femininePresentation?-.24:.24,.32*H,.29],mat(`set-apart-sash-${variant}`,0xd8bf6a,.34,.20),[0,0,femininePresentation?.12:-.12],'set-apart-sash')
    sash.castShadow=false
    const hemBand=addBox(spine,'m5-set-apart-hem-band',[.86,.08,.04],[0,-.12*H,.29],mat(`set-apart-band-${variant}`,0xe3d3a2,.42,.08),undefined,'set-apart-trim')
    hemBand.castShadow=false
    for(const side of [-1,1]){const sleeveTrim=addBox(spine,'m5-set-apart-sleeve-trim',[.14,.06,.04],[side*.45,.52*H,.27],mat(`set-apart-sleeve-${variant}`,0xe3d3a2,.42,.08),undefined,'set-apart-trim');sleeveTrim.castShadow=false}
  }
  if(femininePresentation&&!hero&&variant%2===0){const coat=addBox(spine,'m5-femme-longline-jacket',[.78,.72,.48],[0,.40*H,-.03],accent,undefined,'fashion-jacket');coat.scale.x=.90}
  if(setApartProfile&&femininePresentation&&!hero){
    const modestLayer=addBox(spine,'m5-set-apart-modest-layer',[.86,1.05,.50],[0,.20*H,-.02],outfit,undefined,'set-apart-modest-outerwear')
    modestLayer.scale.set(.94,1.10,.94)
    const headWrap=new THREE.Mesh(new THREE.TorusGeometry(.28,.055,8,24,Math.PI*1.7),accent);headWrap.name='m5-set-apart-headwrap';headWrap.rotation.x=deg(90);headWrap.position.set(0,.22,.01);headPivot.add(headWrap)
  }
  if(!hero&&variant%3===1){
    const cap=new THREE.Mesh(new THREE.SphereGeometry(.345*proportions.head,18,10,0,Math.PI*2,0,Math.PI*.34),accent)
    cap.name='hair-cap-accessory';cap.position.set(0,.26,0);cap.scale.set(1.04,.62,1.05);headPivot.add(cap)
    addBox(headPivot,'cap-visor',[.30,.045,.25],[0,.21,.30],accent,undefined,'wardrobe-accessory')
  }
  if(!hero&&variant%4===2){
    const chain=new THREE.Mesh(new THREE.TorusGeometry(.21,.022,8,28,Math.PI),mat(`chain-${variant}`,0xd5b75c,.18,.88))
    chain.name='m5-chain';chain.rotation.x=deg(90);chain.position.set(0,.63*H,.35);spine.add(chain)
    const pendant=new THREE.Mesh(new THREE.OctahedronGeometry(.055,0),mat(`pendant-${variant}`,0xe4c96e,.12,.92));pendant.name='m5-pendant';pendant.position.set(0,.50*H,.39);spine.add(pendant)
  }
  if(!hero&&variant%5===3){
    const beard=new THREE.Mesh(new THREE.SphereGeometry(.275*proportions.head,16,10,0,Math.PI*2,Math.PI*.48,Math.PI*.38),hair)
    beard.name='facial-hair';beard.position.set(0,-.16,.095);beard.scale.set(.9,.72,.9);headPivot.add(beard)
  }
  if(variant%4===1||hero){for(const side of [-1,1]){const lens=new THREE.Mesh(new THREE.BoxGeometry(.15,.07,.025),mat(`shade-${variant}`,0x101923,.08,.65));lens.name='m5-shades-lens';lens.position.set(side*.105,.09,.337);headPivot.add(lens)}addBox(headPivot,'m5-shades-bridge',[.07,.018,.022],[0,.09,.337],mats.metal,undefined,'eyewear-bridge')}
  if(variant%3===0&&!hero){for(const side of [-1,1]){const earring=new THREE.Mesh(new THREE.TorusGeometry(femininePresentation?.034:.022,.006,6,12),mat(`earring-${variant}`,0xe7c95e,.10,.95));earring.name=femininePresentation?'m5-hoop-earring':'m5-earring';earring.position.set(side*.305,-.02,.01);earring.rotation.y=deg(90);headPivot.add(earring)}}
  if(femininePresentation&&!hero&&variant%2===1){const purseStrap=new THREE.Mesh(new THREE.TorusGeometry(.42,.024,8,26,Math.PI*1.25),accent);purseStrap.name='m5-femme-purse-strap';purseStrap.rotation.set(deg(70),0,deg(-24));purseStrap.position.set(-.06,.38*H,.08);spine.add(purseStrap);addBox(spine,'m5-femme-mini-bag',[.34,.30,.16],[-.26,.20*H,.36],accent,undefined,'fashion-bag')}
  if(variant%4===3&&!hero){const strap=new THREE.Mesh(new THREE.TorusGeometry(.46,.028,8,28,Math.PI*1.2),accent);strap.name='m5-crossbody-strap';strap.rotation.set(deg(72),0,deg(28));strap.position.set(.06,.38*H,.08);spine.add(strap);addBox(spine,'m5-crossbody-bag',[.38,.42,.18],[.28,.22*H,.38],accent,undefined,'crossbody-bag')}
  if(hero){
    const collar=new THREE.Mesh(new THREE.TorusGeometry(.44,.055,8,24,Math.PI),mats.holo);collar.name='hero-holo-collar';collar.rotation.x=deg(90);collar.position.set(0,.66*H,-.22);spine.add(collar)
    const founderChain=new THREE.Mesh(new THREE.TorusGeometry(.22,.024,8,28,Math.PI),mat('founder-chain',0xe8c75a,.14,.92));founderChain.name='m5-founder-chain';founderChain.rotation.x=deg(90);founderChain.position.set(0,.62*H,.36);spine.add(founderChain)
    const founderSetApart=addBox(spine,'m5-founder-set-apart-overlayer',[.90,.70,.50],[0,.30*H,-.02],accent,undefined,'founder-set-apart-layer');founderSetApart.scale.set(1,1.08,.96)
    const founderSash=addBox(spine,'m5-founder-set-apart-sash',[.11,.78,.035],[.25,.34*H,.29],mat('founder-set-apart-sash',0xe0c76c,.28,.26),[0,0,-.12],'founder-set-apart-sash');founderSash.castShadow=false
  }

  group.userData={...group.userData,semantic:hero?'player-character':'crowd-resident',rigState:'m5-max-character-stack-v1',animationReady:true,facialDetailM5:true,dripLayerM5:true,beautyLayerM5:femininePresentation,setApartLayerM5:setApartProfile||hero,swaggerReady:true,styleProfile,femininePresentation:femininePresentation?'beauty-streetwear':'standard-streetwear',originalTryammDesign:true,originalTryammStreetwear:true}
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
    addResidentArchetype(g,0,0,kitMats,0,true);return g
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