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
  addBox(group,'chassis',[4.45,.46,1.86],[x,.56,z],mats.car,undefined,'vehicle-chassis')
  addBox(group,'lower-body',[4.2,.34,1.8],[x,.82,z],mats.car,undefined,'vehicle-body')
  addBox(group,'cabin',[2.18,.72,1.58],[x-.18,1.34,z],mats.glass,[0,0,0],'vehicle-cabin')
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
  addBox(group,'box-truck-cab',[2.15,1.9,2.2],[x+2.05,1.45,z],mats.car,undefined,'vehicle-cab')
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
  const skinPalette=[0x7a4d32,0xa36b4b,0xc88d68,0xd79a70]
  const outfitPalette=[0x284c7a,0x7a3545,0x315e43,0x72572e]
  const skin=mat(`skin-${variant}`,skinPalette[variant%skinPalette.length],.58,0)
  const outfit=mat(`outfit-${variant}`,outfitPalette[variant%outfitPalette.length],.72,.05)
  const pants=mat(`pants-${variant}`,variant%2?0x202936:0x2f3138,.82,.02)
  const hair=mat(`hair-${variant}`,variant%2?0x2d1c15:0x15110f,.88,0)
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(hero?.42:.38,hero?1.18:1.05,5,10),outfit)
  body.name=hero?'hero-torso':'resident-torso';body.position.set(x,1.42,z);body.castShadow=true;body.userData={semantic:hero?'hero-body':'resident-body',generatedBy:'tryamm-native-asset-foundry'};group.add(body)
  const head=new THREE.Mesh(new THREE.SphereGeometry(hero?.34:.31,18,14),skin)
  head.name=hero?'hero-head':'resident-head';head.position.set(x,2.52,z);head.scale.set(.92,1.08,.9);head.castShadow=true;group.add(head)
  const hairCap=new THREE.Mesh(new THREE.SphereGeometry(hero?.35:.32,16,10,0,Math.PI*2,0,Math.PI*.5),hair)
  hairCap.name='hair';hairCap.position.set(x,2.69,z);hairCap.scale.set(1,variant%3===0?1.14:.96,1);group.add(hairCap)
  const nose=new THREE.Mesh(new THREE.ConeGeometry(.045,.12,8),skin);nose.name='nose';nose.rotation.x=deg(90);nose.position.set(x,2.49,z+.29);group.add(nose)
  const eyeMat=mat('eyes',0x14171a,.35,.05)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.085,.72,4,8),skin);arm.name='arm';arm.position.set(x+side*.48,1.47,z);arm.rotation.z=side*.08;group.add(arm)
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.78,4,8),pants);leg.name='leg';leg.position.set(x+side*.17,.5,z);group.add(leg)
    const eye=new THREE.Mesh(new THREE.SphereGeometry(.032,8,6),eyeMat);eye.name='eye';eye.position.set(x+side*.11,2.55,z+.285);group.add(eye)
    const shoe=new THREE.Mesh(new THREE.CapsuleGeometry(.105,.22,3,8),mats.tire);shoe.name='shoe';shoe.rotation.z=deg(90);shoe.position.set(x+side*.17,.09,z+.08);group.add(shoe)
  }
  if(hero){
    const jacket=new THREE.Mesh(new THREE.TorusGeometry(.44,.055,8,24,Math.PI),mats.holo);jacket.name='hero-holo-collar';jacket.rotation.x=deg(90);jacket.position.set(x,1.83,z-.22);group.add(jacket)
  }
  group.userData={...group.userData,semantic:hero?'player-character':'crowd-resident',rigState:'procedural-static-baseline',originalTryammDesign:true}
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
    const wy=1.5+f*2.55
    addBox(group,'window',[.72,1.15,.045],[wx,wy,z+d/2+.03],mats.glass,undefined,'window')
  }
  addBox(group,'building-door',[1.05,2.15,.07],[x,1.08,z+d/2+.05],mats.metal,undefined,'entrance')
  addBox(group,'roof-cap',[w+.18,.16,d+.18],[x,h+.08,z],mats.concrete)
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
    addCarBlockout(g,0,0,kitMats);return g
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
    geometry:'TRYAMM procedural generator + reusable modular GLB kit',
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