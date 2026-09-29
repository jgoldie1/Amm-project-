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