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

const OUT=path.resolve(process.argv[2]||'public/generated-assets/mind-over-matter')
fs.mkdirSync(OUT,{recursive:true})

const exporter=new GLTFExporter()
const material=(name,color,roughness=.72,metalness=.05,emissive=0x000000)=>new THREE.MeshStandardMaterial({name,color,roughness,metalness,emissive,emissiveIntensity:emissive?1.2:0})

function box(group,name,size,pos,mat,semantic=name){
  const mesh=new THREE.Mesh(new THREE.BoxGeometry(...size),mat)
  mesh.name=name
  mesh.position.set(...pos)
  mesh.castShadow=true
  mesh.receiveShadow=true
  mesh.userData={semantic,generatedBy:'mind-over-matter-clean-room-foundry',originalTryammDesign:true,collision:'box'}
  group.add(mesh)
  return mesh
}

function cylinder(group,name,radius,height,pos,mat,semantic=name,segments=16){
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,height,segments),mat)
  mesh.name=name
  mesh.position.set(...pos)
  mesh.castShadow=true
  mesh.receiveShadow=true
  mesh.userData={semantic,generatedBy:'mind-over-matter-clean-room-foundry',originalTryammDesign:true,collision:'cylinder'}
  group.add(mesh)
  return mesh
}

function sphere(group,name,radius,pos,mat,semantic=name,segments=16){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,segments,Math.max(8,Math.floor(segments*.7))),mat)
  mesh.name=name
  mesh.position.set(...pos)
  mesh.castShadow=true
  mesh.receiveShadow=true
  mesh.userData={semantic,generatedBy:'mind-over-matter-clean-room-foundry',originalTryammDesign:true,collision:'sphere'}
  group.add(mesh)
  return mesh
}

async function exportGlb(group,filename,metadata={}){
  group.userData={...group.userData,...metadata,generatedBy:'mind-over-matter-clean-room-foundry',originalTryammDesign:true}
  const arrayBuffer=await new Promise((resolve,reject)=>exporter.parse(group,result=>resolve(result),reject,{binary:true,onlyVisible:true}))
  const file=path.join(OUT,filename)
  fs.writeFileSync(file,Buffer.from(arrayBuffer))
  return {file:filename,bytes:fs.statSync(file).size}
}

function buildingKit(){
  const g=new THREE.Group();g.name='mom-original-building-kit'
  const brick=material('mom-brick',0x765548,.86,.02)
  const stone=material('mom-stone',0xb6afa3,.78,.04)
  const glass=material('mom-glass',0x587682,.24,.18)
  const metal=material('mom-metal',0x303840,.38,.72)
  const accent=material('mom-accent',0x165d69,.58,.18)
  box(g,'foundation',[12,.5,9],[0,.25,0],stone,'building-foundation')
  for(let floor=0;floor<3;floor++){
    const y=.5+floor*3.2
    box(g,`floor-${floor+1}`,[12,.24,9],[0,y,0],stone,'floor-slab')
    box(g,`front-wall-${floor+1}`,[12,2.9,.28],[0,y+1.55,-4.36],brick,'exterior-wall')
    box(g,`rear-wall-${floor+1}`,[12,2.9,.28],[0,y+1.55,4.36],brick,'exterior-wall')
    box(g,`left-wall-${floor+1}`,[.28,2.9,8.45],[-5.86,y+1.55,0],brick,'exterior-wall')
    box(g,`right-wall-${floor+1}`,[.28,2.9,8.45],[5.86,y+1.55,0],brick,'exterior-wall')
    for(const x of [-4.2,-2.1,0,2.1,4.2]){
      if(floor===0&&Math.abs(x)<.2)continue
      box(g,`window-front-${floor}-${x}`,[1.15,1.35,.10],[x,y+1.65,-4.53],glass,'window')
    }
  }
  box(g,'entry-door',[1.5,2.4,.14],[0,1.7,-4.55],accent,'entry-door')
  box(g,'entry-canopy',[3,.18,1.2],[0,3.15,-4.8],metal,'entry-canopy')
  box(g,'stair-core',[2.3,9.5,2.3],[-4.2,5.0,2.2],stone,'stairs-core')
  box(g,'elevator-core',[2.1,9.5,2.1],[3.9,5.0,2.1],metal,'accessible-elevator-core')
  box(g,'roof',[12.2,.30,9.2],[0,10.0,0],stone,'roof')
  return g
}

function interiorKit(){
  const g=new THREE.Group();g.name='mom-original-interior-kit'
  const wall=material('mom-interior-wall',0xd8d3c9,.92,.01)
  const floor=material('mom-floor',0x655a4b,.74,.04)
  const fixture=material('mom-fixture',0x9aa3a8,.42,.52)
  const accent=material('mom-interior-accent',0x324b63,.65,.10)
  box(g,'floor',[9,.20,8],[0,.1,0],floor,'interior-floor')
  for(const [name,size,pos] of [
    ['wall-north',[9,3,.18],[0,1.5,-3.9]],
    ['wall-south',[9,3,.18],[0,1.5,3.9]],
    ['wall-west',[.18,3,8],[-4.4,1.5,0]],
    ['wall-east',[.18,3,8],[4.4,1.5,0]],
    ['partition-a',[.16,3,5],[-1.2,1.5,1.4]],
  ])box(g,name,size,pos,wall,'interior-wall')
  box(g,'accessible-door',[1.2,2.2,.12],[2.2,1.1,-3.98],accent,'accessible-door')
  box(g,'desk',[2.2,.12,.85],[1.4,.8,1.8],floor,'interactive-desk')
  box(g,'desk-leg-left',[.12,.75,.7],[.55,.4,1.8],fixture,'furniture-leg')
  box(g,'desk-leg-right',[.12,.75,.7],[2.25,.4,1.8],fixture,'furniture-leg')
  box(g,'storage',[1.6,1.8,.55],[-3.2,.9,2.9],accent,'storage')
  cylinder(g,'sink',.32,.18,[3.0,.95,2.8],fixture,'sink')
  box(g,'sink-base',[.85,.8,.65],[3.0,.45,2.8],accent,'sink-cabinet')
  return g
}

function vehicle(){
  const g=new THREE.Group();g.name='mom-original-vehicle'
  const body=material('mom-vehicle-body',0x3f6d78,.48,.28)
  const dark=material('mom-vehicle-dark',0x1b1f24,.42,.68)
  const glass=material('mom-vehicle-glass',0x263c47,.18,.22)
  const light=material('mom-vehicle-light',0xd8f6ff,.22,.12,0x8eefff)
  box(g,'chassis',[4.2,.62,1.8],[0,.67,0],body,'vehicle-chassis')
  box(g,'cabin',[2.15,.78,1.5],[-.25,1.35,0],glass,'vehicle-cabin')
  box(g,'hood',[1.35,.18,1.68],[1.42,1.03,0],body,'vehicle-hood')
  box(g,'trunk',[.85,.18,1.66],[-1.75,1.02,0],body,'vehicle-trunk')
  for(const x of [-1.35,1.35])for(const z of [-.91,.91]){
    const wheel=cylinder(g,'wheel',.38,.24,[x,.42,z],dark,'vehicle-wheel',20)
    wheel.rotation.x=Math.PI/2
  }
  for(const z of [-.58,.58])box(g,'headlight',[.10,.22,.36],[2.12,.83,z],light,'vehicle-headlight')
  g.userData={seatPoints:5,doorPoints:4,drivable:true,fictionalMake:'TRYAMM Original Mobility'}
  return g
}

function character(){
  const g=new THREE.Group();g.name='mom-original-synthetic-character'
  const skin=material('mom-skin',0x8f5d40,.48,.01)
  const cloth=material('mom-cloth',0x2d5668,.82,.02)
  const pants=material('mom-pants',0x252b32,.88,.01)
  const hair=material('mom-hair',0x171310,.76,.01)
  sphere(g,'head',.32,[0,2.95,0],skin,'synthetic-head',20)
  sphere(g,'hair',.34,[0,3.08,-.02],hair,'original-hair',16).scale.set(1.03,.72,1.0)
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.37,.72,5,12),cloth)
  torso.name='torso';torso.position.set(0,2.1,0);torso.scale.set(1,.82,.7);torso.userData={semantic:'synthetic-torso',originalTryammDesign:true};g.add(torso)
  for(const s of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.78,4,10),skin);arm.name='arm';arm.position.set(s*.5,2.12,0);arm.userData={semantic:'arm'};g.add(arm)
    const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.95,4,10),pants);leg.name='leg';leg.position.set(s*.18,.9,0);leg.userData={semantic:'leg'};g.add(leg)
  }
  g.userData={syntheticIdentity:true,realPersonLikeness:false,motionBlueprint:'mind-over-matter-original'}
  return g
}

function animal(){
  const g=new THREE.Group();g.name='mom-original-animal'
  const fur=material('mom-fur',0x7a5b3f,.9,.01)
  const dark=material('mom-animal-dark',0x29221d,.78,.01)
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,.9,4,12),fur);body.rotation.z=Math.PI/2;body.position.set(0,.75,0);body.name='body';g.add(body)
  sphere(g,'head',.35,[.78,.88,0],fur,'animal-head')
  sphere(g,'nose',.09,[1.08,.82,0],dark,'animal-nose')
  for(const x of [-.42,.35])for(const z of [-.27,.27])cylinder(g,'leg',.08,.62,[x,.35,z],fur,'animal-leg',10)
  const tail=new THREE.Mesh(new THREE.CapsuleGeometry(.07,.55,4,8),fur);tail.name='tail';tail.position.set(-.95,1.0,0);tail.rotation.z=-.65;g.add(tail)
  g.userData={syntheticAnimal:true,speciesArchetype:'companion-canine',motionBlueprint:'mind-over-matter-original'}
  return g
}

function propKit(){
  const g=new THREE.Group();g.name='mom-original-prop-kit'
  const wood=material('mom-wood',0x715944,.82,.01)
  const metal=material('mom-metal',0x4f5b62,.42,.62)
  const accent=material('mom-accent',0x317983,.56,.18)
  box(g,'bench-seat',[1.8,.12,.5],[-2,.62,0],wood,'bench')
  box(g,'bench-back',[1.8,.75,.10],[-2,1.02,.22],wood,'bench')
  cylinder(g,'trash-can',.38,.9,[0,.45,0],metal,'trash-receptacle',18)
  cylinder(g,'hydrant',.22,.68,[2,.34,0],accent,'fire-hydrant',14)
  box(g,'crate',[.85,.85,.85],[0,.43,2],wood,'mission-crate')
  return g
}

function environmentKit(){
  const g=new THREE.Group();g.name='mom-original-environment-kit'
  const bark=material('mom-bark',0x5c4634,.95,.01)
  const leaf=material('mom-leaf',0x315f3c,.88,.01)
  const rock=material('mom-rock',0x77746d,.96,.01)
  const grass=material('mom-grass',0x466f43,.94,.01)
  for(const [x,z,s] of [[-2,0,1],[1.2,-1.5,.8],[2.8,1.3,1.1]]){
    cylinder(g,'tree-trunk',.22*s,2.6*s,[x,1.3*s,z],bark,'tree-trunk',12)
    const crown=new THREE.Mesh(new THREE.IcosahedronGeometry(1.1*s,2),leaf);crown.name='tree-canopy';crown.position.set(x,3.15*s,z);crown.userData={semantic:'tree-canopy',windReactive:true};g.add(crown)
  }
  sphere(g,'rock-a',.7,[-.5,.45,2.4],rock,'landscape-rock',12).scale.set(1.4,.75,1)
  box(g,'grass-patch',[5,.04,5],[0,.02,0],grass,'grass-ground')
  return g
}

function storefrontKit(){
  const g=new THREE.Group();g.name='mom-original-storefront-brand-kit'
  const wall=material('mom-storefront-wall',0x4a5865,.72,.08)
  const glass=material('mom-storefront-glass',0x31505e,.20,.16)
  const sign=material('mom-original-sign',0x704b82,.48,.22,0x2c1633)
  box(g,'storefront-shell',[7,3.4,.5],[0,1.7,0],wall,'storefront-shell')
  box(g,'window-left',[2.3,2,.08],[-1.9,1.55,-.29],glass,'storefront-window')
  box(g,'window-right',[2.3,2,.08],[1.9,1.55,-.29],glass,'storefront-window')
  box(g,'door',[1.0,2.3,.10],[0,1.25,-.31],glass,'storefront-door')
  box(g,'blank-original-sign',[4.6,.65,.12],[0,3.0,-.35],sign,'original-brand-signage')
  g.userData={fictionalBrandTemplate:true,noThirdPartyMarks:true}
  return g
}

function roadKit(){
  const g=new THREE.Group();g.name='mom-original-road-kit'
  const asphalt=material('mom-asphalt',0x2d3135,.96,.02)
  const concrete=material('mom-sidewalk',0xaaa69f,.92,.02)
  const paint=material('mom-road-paint',0xe9e3c5,.76,.01)
  box(g,'road',[12,.12,6],[0,.06,0],asphalt,'drivable-road')
  box(g,'sidewalk-left',[12,.18,1.8],[0,.09,-3.9],concrete,'walkable-sidewalk')
  box(g,'sidewalk-right',[12,.18,1.8],[0,.09,3.9],concrete,'walkable-sidewalk')
  box(g,'curb-left',[12,.28,.18],[0,.14,-3.0],concrete,'curb')
  box(g,'curb-right',[12,.28,.18],[0,.14,3.0],concrete,'curb')
  for(const x of [-4.5,-1.5,1.5,4.5])box(g,'lane-dash',[1.4,.02,.08],[x,.13,0],paint,'lane-marking')
  for(const z of [-2.25,2.25])for(let x=-4;x<=4;x+=1)box(g,'crosswalk',[.55,.025,.24],[x,.14,z],paint,'crosswalk')
  g.userData={twoWayTraffic:true,accessibleSidewalks:true,originalTryammDesign:true}
  return g
}

function missionKit(){
  const g=new THREE.Group();g.name='mom-original-mission-kit'
  const base=material('mom-mission-base',0x26343d,.52,.28)
  const glow=material('mom-mission-glow',0x4ee4ff,.24,.14,0x4ee4ff)
  cylinder(g,'mission-base',.65,.16,[0,.08,0],base,'mission-base',24)
  cylinder(g,'mission-beacon',.08,2.4,[0,1.28,0],glow,'mission-beacon',12)
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.58,.05,10,32),glow);ring.name='mission-ring';ring.position.set(0,1.65,0);ring.rotation.x=Math.PI/2;ring.userData={semantic:'mission-marker',collision:'none'};g.add(ring)
  sphere(g,'mission-orb',.24,[0,2.55,0],glow,'mission-orb',16)
  g.userData={interaction:'mission-start-or-checkpoint',reelCaptureHook:true}
  return g
}

const assets=[
  ['mom-building-kit.glb',buildingKit(),{kind:'building',conceptual:true}],
  ['mom-interior-kit.glb',interiorKit(),{kind:'interior',conceptual:true}],
  ['mom-vehicle.glb',vehicle(),{kind:'vehicle'}],
  ['mom-character.glb',character(),{kind:'character',synthetic:true}],
  ['mom-animal.glb',animal(),{kind:'animal',synthetic:true}],
  ['mom-prop-kit.glb',propKit(),{kind:'prop'}],
  ['mom-environment-kit.glb',environmentKit(),{kind:'environment'}],
  ['mom-business-brand-kit.glb',storefrontKit(),{kind:'business-brand',fictional:true}],
  ['mom-road-kit.glb',roadKit(),{kind:'road'}],
  ['mom-mission-kit.glb',missionKit(),{kind:'mission-object'}],
]

const exported=[]
for(const [file,group,meta] of assets)exported.push(await exportGlb(group,file,meta))

const recipes={
  schema:'tryamm.mind-over-matter.fallback-pack.v1',
  generatedAt:new Date().toISOString(),
  ownership:'TRYAMM-authored procedural fallback assets and recipes.',
  externalApi:false,
  cleanRoom:true,
  rules:[
    'Functional replacement only; do not copy blocked protected expressive details.',
    'Blocked reference files are not generation inputs.',
    'Real locations with insufficient cleared evidence use clearly labeled conceptual/original equivalents.',
    'Human originality/visual review and normal asset certification are required before production promotion.',
  ],
  assets:exported,
  materials:[
    {id:'mom-brick',workflow:'metallic-roughness',baseColor:'#765548',roughness:.86,metalness:.02,textureSource:'procedural'},
    {id:'mom-concrete',workflow:'metallic-roughness',baseColor:'#aaa59c',roughness:.9,metalness:.01,textureSource:'procedural'},
    {id:'mom-metal',workflow:'metallic-roughness',baseColor:'#4f5b62',roughness:.42,metalness:.62,textureSource:'procedural'},
    {id:'mom-glass',workflow:'metallic-roughness',baseColor:'#31505e',roughness:.2,metalness:.16,textureSource:'procedural'},
  ],
  audio:[
    {id:'mom-ui-confirm',method:'original-synthesis',layers:['soft-transient','short-tonal-body','air-tail'],durationMs:320},
    {id:'mom-mission-start',method:'original-synthesis',layers:['low-pulse','rising-harmonic','clean-chime'],durationMs:900},
    {id:'mom-vehicle-loop',method:'original-synthesis',layers:['motor-harmonic','road-noise','load-filter'],loop:true},
    {id:'mom-city-ambience',method:'original-field-design',layers:['wind-bed','distant-traffic','abstract-crowd'],loop:true},
  ],
  ui:[
    {id:'mom-world-builder',layout:'one-hand-first',tokens:['large-tap-targets','bottom-safe-zone','high-contrast','reduced-motion-option']},
    {id:'mom-original-brand',rule:'fictional/original names, iconography and color systems where trademark clearance is unavailable'},
  ],
  animation:[
    {id:'mom-locomotion',generator:'mind-over-matter-v1',motifs:['original-transition','tryamm-signature','adaptive-finale'],similarityGate:true},
    {id:'mom-interaction',generator:'mind-over-matter-v1',motifs:['reach','use','confirm','recover'],similarityGate:true},
  ],
}

fs.writeFileSync(path.join(OUT,'original-fallback-pack.json'),JSON.stringify(recipes,null,2))
console.log(JSON.stringify({output:OUT,assets:exported.length,files:exported,manifest:'original-fallback-pack.json',externalApi:false,creditsUsed:0},null,2))
