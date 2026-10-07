import * as THREE from 'three'
import {loadTryammNativeCircleParkLayer,disposeNativeAssetLayer} from './TryammNativeAssetRuntime'
import type {NativePlacement} from '../data/TryammNativeRuntimeAssetCatalog'
import {STREETVERSE_CHICAGO_PROOF_ZONE,STREETVERSE_CHICAGO_RECONSTRUCTION_SOURCES} from '../data/StreetVerseChicagoReconstructionSources'

export type WestSideDistrictId='circle-park'|'roosevelt'|'taylor'|'pilsen'|'west-side'
export type WestSideVisibleWorldHandle={
  group:THREE.Group
  collisionBoxes:THREE.Box3[]
  dispose:()=>void
}

type BuildingSpec={x:number;z:number;w:number;d:number;h:number;color:number;label:string;rotation?:number;units?:readonly string[];buildingNumber?:string}
const ownedMaterials:THREE.Material[]=[]
const ownedGeometries:THREE.BufferGeometry[]=[]
const ownedTextures:THREE.Texture[]=[]
const material=(params:THREE.MeshStandardMaterialParameters)=>{
  const m=new THREE.MeshStandardMaterial(params);ownedMaterials.push(m);return m
}
const geometry=<T extends THREE.BufferGeometry>(g:T)=>{ownedGeometries.push(g);return g}
function createWestSideBrickTexture(){
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=256
  const ctx=canvas.getContext('2d')!
  ctx.fillStyle='#d8d2c7';ctx.fillRect(0,0,256,256)
  const rowH=24,brickW=52,mortar=3
  for(let row=0;row<12;row++){
    const y=row*rowH,offset=row%2?-brickW/2:0
    for(let x=offset;x<256;x+=brickW){
      const shade=154+((row*17+Math.round(x))%26)
      ctx.fillStyle=`rgb(${shade},${Math.max(92,shade-42)},${Math.max(72,shade-62)})`
      ctx.fillRect(x+mortar,y+mortar,brickW-mortar*2,rowH-mortar*2)
      ctx.fillStyle='rgba(255,255,255,.08)';ctx.fillRect(x+mortar,y+mortar,brickW-mortar*2,2)
    }
  }
  const tex=new THREE.CanvasTexture(canvas);tex.name='west-side-procedural-brick-v4';tex.wrapS=THREE.RepeatWrapping;tex.wrapT=THREE.RepeatWrapping;tex.repeat.set(3.2,4.6);tex.colorSpace=THREE.SRGBColorSpace;tex.anisotropy=4;ownedTextures.push(tex);return tex
}

function box(group:THREE.Group,size:[number,number,number],pos:[number,number,number],mat:THREE.Material,rotationY=0,name=''){
  const mesh=new THREE.Mesh(geometry(new THREE.BoxGeometry(...size)),mat)
  mesh.position.set(...pos);mesh.rotation.y=rotationY;mesh.castShadow=false;mesh.receiveShadow=true;mesh.name=name;group.add(mesh);return mesh
}
function addGroundShadow(group:THREE.Group,w:number,d:number,y=.035,opacity=.18){
  const shadowMat=material({color:0x080b0d,roughness:1,transparent:true,opacity,depthWrite:false})
  const shadow=new THREE.Mesh(geometry(new THREE.CircleGeometry(1,20)),shadowMat)
  shadow.name='west-side-contact-shadow'
  shadow.rotation.x=-Math.PI/2
  shadow.scale.set(w*.5,d*.5,1)
  shadow.position.y=y
  shadow.renderOrder=1
  group.add(shadow)
  return shadow
}
function labelSprite(text:string){
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(5,15,24,.92)';ctx.fillRect(0,0,512,128)
  ctx.strokeStyle='#7ee7ff';ctx.lineWidth=5;ctx.strokeRect(4,4,504,120);ctx.fillStyle='#fff';ctx.font='800 44px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64)
  const tex=new THREE.CanvasTexture(canvas);const sm=new THREE.SpriteMaterial({map:tex,transparent:true});ownedMaterials.push(sm)
  const s=new THREE.Sprite(sm);s.userData.disposeTexture=tex;s.scale.set(11,2.75,1);return s
}
function addRoad(root:THREE.Group,x:number,z:number,w:number,d:number,label:string){
  const asphalt=material({color:0x20252a,roughness:1}),concrete=material({color:0xc8c4b8,roughness:1}),curb=material({color:0xe2ddd1,roughness:.95}),yellow=material({color:0xf6d64a,roughness:.9}),white=material({color:0xf4f2e9,roughness:.9})
  box(root,[w,.12,d],[x,.06,z],asphalt,0,`west-side-road-${label}`)
  if(w>d){
    box(root,[w,.18,3.2],[x,.11,z-d/2-1.72],concrete,0,`west-side-sidewalk-${label}-north`)
    box(root,[w,.18,3.2],[x,.11,z+d/2+1.72],concrete,0,`west-side-sidewalk-${label}-south`)
    box(root,[w,.28,.22],[x,.18,z-d/2-.12],curb)
    box(root,[w,.28,.22],[x,.18,z+d/2+.12],curb)
    box(root,[w,.025,.11],[x,.14,z-.18],yellow);box(root,[w,.025,.11],[x,.14,z+.18],yellow)
    box(root,[w,.025,.10],[x,.14,z-d/2+.62],white);box(root,[w,.025,.10],[x,.14,z+d/2-.62],white)
    for(let xx=x-w/2+6;xx<x+w/2-3;xx+=12){box(root,[4.6,.028,.12],[xx,.145,z-d*.24],white);box(root,[4.6,.028,.12],[xx,.145,z+d*.24],white)}
  }else{
    box(root,[3.2,.18,d],[x-w/2-1.72,.11,z],concrete,0,`west-side-sidewalk-${label}-west`)
    box(root,[3.2,.18,d],[x+w/2+1.72,.11,z],concrete,0,`west-side-sidewalk-${label}-east`)
    box(root,[.22,.28,d],[x-w/2-.12,.18,z],curb)
    box(root,[.22,.28,d],[x+w/2+.12,.18,z],curb)
    box(root,[.11,.025,d],[x-.18,.14,z],yellow);box(root,[.11,.025,d],[x+.18,.14,z],yellow)
    box(root,[.10,.025,d],[x-w/2+.62,.14,z],white);box(root,[.10,.025,d],[x+w/2-.62,.14,z],white)
    for(let zz=z-d/2+6;zz<z+d/2-3;zz+=12){box(root,[.12,.028,4.6],[x-w*.24,.145,zz],white);box(root,[.12,.028,4.6],[x+w*.24,.145,zz],white)}
  }
}
function addCrosswalk(root:THREE.Group,x:number,z:number,axis:'x'|'z'){
  const stripe=material({color:0xf7f5ed,roughness:.95})
  for(let i=-3;i<=3;i++){
    if(axis==='x')box(root,[1.1,.03,3.8],[x+i*1.7,.16,z],stripe)
    else box(root,[3.8,.03,1.1],[x,.16,z+i*1.7],stripe)
  }
}
function addTree(root:THREE.Group,x:number,z:number,s=1){
  const g=new THREE.Group();g.position.set(x,0,z);g.name='west-side-tree-v4';addGroundShadow(g,2.55*s,1.60*s,.026,.15)
  const bark=material({color:0x654127,roughness:1})
  const trunk=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.20*s,.34*s,3.05*s,9)),bark);trunk.position.y=1.52*s;g.add(trunk)
  const crownMat=material({color:0x327243,roughness:.96})
  const crownLight=material({color:0x438552,roughness:.95})
  const crownDark=material({color:0x245a37,roughness:.98})
  const canopy=[
    [0,3.48,0,1.18,1.22,.98,crownMat],
    [-.50,3.92,.13,.91,1.10,.93,crownLight],
    [.54,3.63,-.30,.86,.91,1.08,crownDark],
    [.09,4.51,.06,.74,.95,.85,crownLight],
    [-.16,4.10,-.58,.70,.82,.92,crownDark],
    [.63,4.08,.31,.61,.74,.72,crownMat],
    [-.62,3.48,.42,.58,.68,.70,crownLight],
  ] as const
  canopy.forEach(([cx,cy,cz,sx,sy,sz,mat],i)=>{const crown=new THREE.Mesh(geometry(new THREE.DodecahedronGeometry((i===0?1.10:.88)*s,1)),mat);crown.position.set(cx*s,cy*s,cz*s);crown.scale.set(sx,sy,sz);crown.name='west-side-tree-canopy-'+(i+1);g.add(crown)})
  ;[[-1,.30,2.76,.03,.62],[1,.31,2.78,.08,-.64],[-1,.18,3.10,-.38,.52],[1,.16,3.16,.42,-.50]].forEach(([side,px,py,rx,rz],i)=>{const branch=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.045*s,.082*s,1.24*s,7)),bark);branch.position.set(Number(side)*Number(px)*s,Number(py)*s,(i>1?.08:-.03)*s);branch.rotation.z=Number(side)*Number(rz);branch.rotation.x=Number(rx);branch.name='west-side-tree-branch-'+(i+1);g.add(branch)})
  g.userData={vegetationPass:'layered-canopy-v4',canopyLayers:7,branchCount:4,windReactive:true,lodIntent:'mobile-readable-silhouette'}
  g.rotation.y=((Math.abs(Math.round(x*7+z*3))%11)/11)*Math.PI*2
  root.add(g)
}
function addBuilding(root:THREE.Group,s:BuildingSpec,colliders:THREE.Box3[],brickMap:THREE.Texture){
  const g=new THREE.Group();g.position.set(s.x,0,s.z);g.rotation.y=s.rotation||0;g.name=`west-side-building-${s.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`
  const facade=material({color:s.color,map:brickMap,roughness:.84,metalness:.025})
  const trim=material({color:0xd7d1c1,roughness:.88})
  const trimDark=material({color:0x9f9587,roughness:.90})
  const glass=material({color:0x82b9d2,roughness:.18,metalness:.16,emissive:0x16384b,emissiveIntensity:.26})
  const dark=material({color:0x18232b,roughness:.55})
  const fireMetal=material({color:0x333a3f,roughness:.48,metalness:.58})
  const awning=material({color:(s.x+s.z)%2?0x31566d:0x6d4437,roughness:.78})
  const body=box(g,[s.w,s.h,s.d],[0,s.h/2,0],facade,0,'shell')
  for(let y=3.2;y<s.h-1.5;y+=3.3){
    for(let x=-s.w/2+2;x<=s.w/2-2;x+=3.2){
      box(g,[1.45,.92,.09],[x,y,-s.d/2-.06],glass,0,'front-window')
      box(g,[1.66,.13,.14],[x,y+.53,-s.d/2-.11],trim,0,'front-window-lintel')
      box(g,[1.66,.13,.14],[x,y-.53,-s.d/2-.11],trimDark,0,'front-window-sill')
      box(g,[1.45,.9,.08],[x,y,s.d/2+.05],glass,0,'rear-window')
    }
    for(let z=-s.d/2+2;z<=s.d/2-2;z+=3.2){
      box(g,[.08,.9,1.45],[-s.w/2-.05,y,z],glass,0,'side-window')
      box(g,[.08,.9,1.45],[s.w/2+.05,y,z],glass,0,'side-window')
    }
  }
  for(let y=3.3;y<s.h-1;y+=6.6)box(g,[s.w+.20,.18,s.d+.18],[0,y+.95,0],trimDark,0,'masonry-belt')
  box(g,[s.w+.12,.20,s.d+.12],[0,2.45,0],trim,0,'facade-belt')
  box(g,[Math.min(5,s.w*.45),3.2,.35],[0,1.6,-s.d/2-.22],glass,0,'entry-glass')
  box(g,[1.8,3,.18],[0,1.5,-s.d/2-.43],dark,0,'entry-door')
  box(g,[Math.min(6.2,s.w*.52),.20,1.75],[0,3.48,-s.d/2-1.00],awning,.10,'entry-awning')
  box(g,[Math.min(6,s.w*.5),.35,2.8],[0,.18,-s.d/2-1.45],trim,0,'entry-step')
  box(g,[Math.min(5.2,s.w*.46),.22,2.3],[0,.44,-s.d/2-1.1],trimDark,0,'entry-step-upper')
  box(g,[Math.min(6.5,s.w*.55),.16,3.6],[0,.13,-s.d/2+1.9],material({color:0x8c765f,roughness:.9}),0,'lobby-floor')
  box(g,[1.5,.18,3.2],[-1.4,.55,-s.d/2+2.1],trim,.24,'interior-stair-1')
  box(g,[1.5,.18,3.2],[0,.95,-s.d/2+2.1],trim,.24,'interior-stair-2')
  box(g,[1.5,.18,3.2],[1.4,1.35,-s.d/2+2.1],trim,.24,'interior-stair-3')
  box(g,[s.w+.42,.52,s.d+.42],[0,s.h+.26,0],trim,0,'roof-cornice')
  box(g,[s.w-.8,.64,s.d-.8],[0,s.h+.68,0],facade,0,'roof-parapet')
  box(g,[2.8,1.2,2.2],[-s.w*.2,s.h+1.28,0],dark,0,'roof-hvac')
  box(g,[2.1,.82,1.7],[s.w*.22,s.h+1.08,s.d*.12],dark,0,'roof-hvac-secondary')
  if(s.h>=18){
    const fx=s.w/2+.14
    for(let y=4.3;y<s.h-1.5;y+=4.2){
      box(g,[.16,.11,2.6],[fx,y,0],fireMetal,0,'fire-escape-platform')
      box(g,[.12,.68,2.6],[fx+.18,y+.36,0],fireMetal,0,'fire-escape-rail')
      box(g,[.10,3.2,.10],[fx+.08,y-1.6,.95],fireMetal,.10,'fire-escape-ladder')
      box(g,[.10,3.2,.10],[fx+.08,y-1.6,-.95],fireMetal,-.10,'fire-escape-ladder')
    }
  }
  const sign=labelSprite(s.label);sign.position.set(0,Math.min(s.h-1,7),-s.d/2-.72);g.add(sign)
  if(s.buildingNumber){
    const number=labelSprite(s.buildingNumber);number.name='building-number';number.scale.set(3.6,.9,1);number.position.set(-Math.min(2.4,s.w*.2),2.75,-s.d/2-.50);g.add(number)
  }
  if(s.units?.length){
    s.units.slice(0,4).forEach((unit,i)=>{const plaque=labelSprite(unit);plaque.name='apartment-unit-number';plaque.scale.set(2.2,.58,1);plaque.position.set((i-1.5)*1.85,1.0,-s.d/2-.52);g.add(plaque)})
  }
  g.userData={architecturePass:'west-side-v4',facadeDepth:true,fireEscapes:s.h>=18,streetLevelAwning:true,roofParapet:true}
  root.add(g)
  colliders.push(new THREE.Box3().setFromObject(body).expandByScalar(.25))
}
function addThomasJeffersonSchool(root:THREE.Group,colliders:THREE.Box3[]){
  const g=new THREE.Group();g.position.set(25,0,33);g.name='west-side-building-thomas-jefferson-school-reconstruction'
  const brick=material({color:0x8f4938,roughness:.9}),brickDark=material({color:0x71382f,roughness:.92}),stone=material({color:0xd8c9aa,roughness:.88})
  const glass=material({color:0x243b49,roughness:.18,metalness:.1,emissive:0x0d1c25,emissiveIntensity:.22}),door=material({color:0x3c2b25,roughness:.72})
  const masses:[[number,number,number],[number,number,number]][]=[
    [[22,18,13],[0,9,0]],[[8,20,15],[-7,10,1]],[[8,20,15],[7,10,1]],[[7,21,8],[0,10.5,-4]]
  ]
  const shells:THREE.Mesh[]=[]
  masses.forEach(([size,pos],i)=>{const m=box(g,size,pos,i===3?brickDark:brick,0,`jefferson-masonry-${i}`);shells.push(m)})
  for(const y of [4.4,8.5,12.6,16.7])box(g,[23,.32,13.35],[0,y,0],stone,0,'jefferson-stone-belt')
  box(g,[23.2,.7,13.6],[0,18.2,0],stone,0,'jefferson-cornice')
  box(g,[23.5,.5,13.9],[0,19,0],brickDark,0,'jefferson-parapet')
  for(const y of [3.2,7.25,11.3,15.35])for(const x of [-9.2,-6.8,-4.4,-2,2,4.4,6.8,9.2]){
    box(g,[1.25,2.15,.12],[x,y,-6.58],glass,0,'jefferson-tall-window')
    box(g,[.16,2.2,.18],[x,y,-6.67],stone)
  }
  box(g,[5.4,6.4,1.0],[0,3.2,-7],brickDark,0,'jefferson-projecting-entry')
  box(g,[6.1,.55,1.2],[0,6.1,-7.05],stone)
  box(g,[4.4,4.9,.28],[0,2.45,-7.56],stone)
  box(g,[3.2,3.75,.18],[0,1.88,-7.76],door)
  box(g,[5.8,.25,3.1],[0,.13,-8.7],stone)
  box(g,[5.0,.22,2.5],[0,.34,-8.35],stone)
  box(g,[4.2,.2,2.0],[0,.54,-8.0],stone)
  const sign=labelSprite('THOMAS JEFFERSON SCHOOL');sign.scale.set(8.5,2.05,1);sign.position.set(0,7.3,-7.7);g.add(sign)
  g.userData={realWorldIdentity:'Thomas Jefferson Public School / STEM Magnet Academy',address:'1522 W Fillmore St, Chicago, IL 60607',exteriorAuthority:'reference-photo+public-record',interiorAuthority:'playable-game-reconstruction-until-verified-plans',enterablePlanned:true}
  root.add(g)
  shells.forEach(m=>colliders.push(new THREE.Box3().setFromObject(m).expandByScalar(.15)))
}

function addPark(root:THREE.Group){
  const park=new THREE.Group();park.position.set(0,0,49);park.name='circle-park-visible-forge'
  const lawn=new THREE.Mesh(geometry(new THREE.CircleGeometry(12,36)),material({color:0x477f4a,roughness:1}));lawn.rotation.x=-Math.PI/2;lawn.position.y=.03;park.add(lawn)
  const path=new THREE.Mesh(geometry(new THREE.RingGeometry(7.5,9,40)),material({color:0xc5b79d,roughness:1}));path.rotation.x=-Math.PI/2;path.position.y=.05;park.add(path)
  const court=box(park,[13,.06,7],[0,.08,0],material({color:0xb96e43,roughness:.9}),0,'circle-park-court')
  court.position.z=-1
  for(const [x,z] of [[-8,-7],[8,-7],[-9,6],[9,6],[-11,0],[11,0]] as const)addTree(park,x,z,.78)
  root.add(park)
}
function addVehicle(root:THREE.Group,x:number,z:number,color:number,rot=0,name='traffic'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name=`west-side-${name}-v3`;addGroundShadow(g,4.45,1.55,.028,.22)
  const paint=material({color,metalness:.56,roughness:.24})
  const glass=material({color:0x142a38,metalness:.26,roughness:.12,transparent:true,opacity:.92})
  const rubber=material({color:0x090a0b,roughness:1})
  const chrome=material({color:0x9da6aa,metalness:.78,roughness:.22})
  box(g,[4.35,.78,1.92],[0,.72,0],paint)
  box(g,[2.28,.66,1.58],[-.18,1.39,0],glass)
  box(g,[1.28,.16,1.80],[1.38,1.08,0],paint)
  box(g,[.78,.15,1.80],[-1.52,1.04,0],paint)
  box(g,[.08,.42,1.38],[.98,1.42,0],glass,.18,'windshield')
  box(g,[.08,.40,1.34],[-1.22,1.39,0],glass,-.18,'rear-window')
  for(const side of [-1,1]){
    box(g,[1.35,.38,.06],[-.20,1.43,side*.81],glass,0,'side-window')
    box(g,[.28,.16,.12],[.72,1.42,side*1.00],paint,0,'side-mirror')
  }
  box(g,[.14,.22,1.80],[2.19,.62,0],chrome,0,'front-bumper')
  box(g,[.14,.22,1.80],[-2.19,.62,0],chrome,0,'rear-bumper')
  box(g,[.05,.28,.82],[2.26,.76,0],material({color:0x151b1f,roughness:.46}),0,'grille')
  const lamp=material({color:0xf4f1c0,emissive:0xf4e8a0,emissiveIntensity:.7,roughness:.2})
  for(const side of [-.62,.62])box(g,[.05,.20,.34],[2.28,.88,side],lamp,0,'headlight')
  for(const xx of [-1.34,1.34])for(const zz of [-.94,.94]){
    const wheel=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.39,.39,.25,14)),rubber);wheel.rotation.x=Math.PI/2;wheel.position.set(xx,.43,zz);g.add(wheel)
    const hub=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.19,.19,.27,12)),chrome);hub.rotation.x=Math.PI/2;hub.position.set(xx,.43,zz);g.add(hub)
  }
  root.add(g)
}

function addStreetLight(root:THREE.Group,x:number,z:number,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-street-light-v2'
  const metal=material({color:0x323a40,metalness:.62,roughness:.38})
  const bulb=material({color:0xfff0bd,emissive:0xffd77a,emissiveIntensity:.8,roughness:.18})
  const pole=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.10,.14,5.5,8)),metal);pole.position.y=2.75;g.add(pole)
  box(g,[1.35,.10,.12],[.58,5.32,0],metal)
  const light=new THREE.Mesh(geometry(new THREE.SphereGeometry(.16,8,6)),bulb);light.position.set(1.18,5.18,0);g.add(light)
  root.add(g)
}
function addBusShelter(root:THREE.Group,x:number,z:number,rot=0,label='CTA BUS'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-bus-shelter-v3';addGroundShadow(g,4.8,2.0,.026,.14)
  const frame=material({color:0x2f3a42,metalness:.72,roughness:.30})
  const glass=material({color:0x6b9daf,roughness:.10,metalness:.06,transparent:true,opacity:.38})
  const roof=material({color:0x222b31,metalness:.42,roughness:.46})
  box(g,[5.2,.18,1.9],[0,3.0,0],roof)
  for(const xx of [-2.4,2.4])box(g,[.12,3.0,.12],[xx,1.5,0],frame)
  box(g,[4.7,2.4,.08],[0,1.6,.86],glass)
  box(g,[3.2,.18,.62],[0,.65,.20],frame)
  box(g,[3.2,.65,.10],[0,1.04,.48],frame)
  const sign=labelSprite(label);sign.scale.set(3.8,.92,1);sign.position.set(0,3.72,0);g.add(sign)
  root.add(g)
}
function addBench(root:THREE.Group,x:number,z:number,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-bench-v3';addGroundShadow(g,2.6,.72,.026,.10)
  const wood=material({color:0x73513c,roughness:.92}),metal=material({color:0x30383d,metalness:.52,roughness:.55})
  box(g,[2.6,.16,.62],[0,.72,0],wood);box(g,[2.6,.72,.12],[0,1.16,.28],wood)
  for(const sx of [-.95,.95]){box(g,[.10,.62,.10],[sx,.40,0],metal);box(g,[.10,.74,.10],[sx,1.03,.23],metal)}
  root.add(g)
}
function addHydrant(root:THREE.Group,x:number,z:number){
  const g=new THREE.Group();g.position.set(x,0,z);g.name='west-side-hydrant-v3'
  const red=material({color:0xb64032,metalness:.35,roughness:.48}),dark=material({color:0x6d2822,metalness:.42,roughness:.46})
  const body=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.20,.24,.66,10)),red);body.position.y=.34;g.add(body)
  const cap=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.24,.22,.16,10)),dark);cap.position.y=.74;g.add(cap)
  for(const sx of [-1,1]){const port=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.10,.10,.18,8)),dark);port.rotation.z=Math.PI/2;port.position.set(sx*.24,.45,0);g.add(port)}
  root.add(g)
}
function addTrafficSignal(root:THREE.Group,x:number,z:number,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-traffic-signal-v3'
  const metal=material({color:0x30363b,metalness:.55,roughness:.48})
  box(g,[.14,5.7,.14],[0,2.85,0],metal);box(g,[2.6,.12,.12],[1.22,5.45,0],metal)
  box(g,[.48,1.26,.40],[2.35,4.92,0],material({color:0x202427,roughness:.78}))
  for(const [y,color,emissive] of [[5.28,0xc44038,0x7f130f],[4.92,0xd8b13b,0x745b0b],[4.56,0x4ea864,0x154c27]] as const){
    const light=new THREE.Mesh(geometry(new THREE.SphereGeometry(.105,8,6)),material({color,emissive,emissiveIntensity:.35}));light.position.set(2.35,y,-.22);g.add(light)
  }
  root.add(g)
}
function addAmbientResident(root:THREE.Group,x:number,z:number,rot:number,index:number){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name=`west-side-ambient-resident-${index+1}-v4`;addGroundShadow(g,.82,.52,.024,.17)
  const skinColors=[0x70462f,0x8f654c,0xb57852,0x5f3b2b,0xc58a66,0x9f7155]
  const tops=[0x315b7a,0x704936,0x485b3b,0x6d506f,0x765a32,0x3c5f64]
  const skin=material({color:skinColors[index%skinColors.length],roughness:.84})
  const cloth=material({color:tops[index%tops.length],roughness:.92})
  const pants=material({color:index%2?0x222831:0x34343b,roughness:.96})
  const hairMat=material({color:index%4===0?0x33251f:0x211817,roughness:1})
  const shoeMat=material({color:index%3===0?0xe9e5da:0x171a1d,roughness:.82})
  const torso=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.25,.76,4,10)),cloth);torso.position.y=1.18;torso.scale.set(1,1,.86);g.add(torso)
  const neck=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.10,.12,.16,8)),skin);neck.position.y=1.67;g.add(neck)
  const head=new THREE.Mesh(geometry(new THREE.SphereGeometry(.24,14,11)),skin);head.position.y=1.91;head.scale.set(.92,1.04,.92);g.add(head)
  const hair=new THREE.Mesh(geometry(new THREE.SphereGeometry(.245,12,9,0,Math.PI*2,0,Math.PI*.52)),hairMat);hair.position.y=2.065;hair.scale.set(.98,.58,1);g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.064,.50,4,8)),skin);arm.position.set(side*.34,1.10,0);arm.rotation.z=side*.08;g.add(arm)
    const hand=new THREE.Mesh(geometry(new THREE.SphereGeometry(.077,8,7)),skin);hand.position.set(side*.37,.82,.01);g.add(hand)
    const leg=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.085,.56,4,8)),pants);leg.position.set(side*.13,.39,0);g.add(leg)
    box(g,[.19,.10,.35],[side*.13,.07,-.08],shoeMat,0,'resident-shoe')
  }
  if(index%4===1){
    box(g,[.34,.58,.16],[-.36,1.06,.08],material({color:0x4b3b31,roughness:.96}),-.12,'resident-bag')
    box(g,[.05,.74,.05],[-.22,1.36,.08],material({color:0x332923,roughness:1}),-.48,'resident-bag-strap')
  }
  if(index%5===2){
    const cap=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.22,.24,.11,12)),material({color:0x24394a,roughness:.9}));cap.position.set(0,2.10,0);g.add(cap)
    box(g,[.30,.04,.16],[0,2.08,-.19],material({color:0x24394a,roughness:.9}),0,'resident-cap-bill')
  }
  g.userData={ambientVisual:true,identity:'fictional',populationPass:'west-side-v4',humanDetail:'hands-shoes-accessories'}
  root.add(g)
}

function addSaintIgnatius(root:THREE.Group,colliders:THREE.Box3[]){
  const g=new THREE.Group();g.position.set(42,0,8);g.name='west-side-st-ignatius-game-reconstruction'
  const brick=material({color:0x8c4935,roughness:.92}),stone=material({color:0xd7c9aa,roughness:.88}),glass=material({color:0x28424e,roughness:.18,metalness:.08,emissive:0x10222b,emissiveIntensity:.16})
  const shell=box(g,[22,15,11],[0,7.5,0],brick,0,'ignatius-shell')
  box(g,[8,18,12],[-7,9,.2],brick);box(g,[8,18,12],[7,9,.2],brick)
  box(g,[23,.55,11.6],[0,15.2,0],stone)
  for(const y of [4.0,8.0,12.0])for(const x of [-8.2,-5.5,-2.8,0,2.8,5.5,8.2])box(g,[1.15,1.75,.12],[x,y,-5.56],glass)
  box(g,[5.4,5.0,.70],[0,2.5,-5.8],stone)
  box(g,[3.6,3.7,.18],[0,1.85,-6.2],material({color:0x3b2a23,roughness:.78}))
  const sign=labelSprite('ST. IGNATIUS • GAME RECONSTRUCTION');sign.scale.set(11,2.4,1);sign.position.set(0,18.3,-4.8);g.add(sign)
  g.userData={landmark:'St. Ignatius College Prep',representation:'game-reconstruction',exactDigitalTwin:false}
  root.add(g);colliders.push(new THREE.Box3().setFromObject(shell).expandByScalar(.15))
}
function addHolyFamily(root:THREE.Group,colliders:THREE.Box3[]){
  const g=new THREE.Group();g.position.set(66,0,10);g.name='west-side-holy-family-game-reconstruction'
  const brick=material({color:0x8a4938,roughness:.94}),stone=material({color:0xcfc1a1,roughness:.9}),roof=material({color:0x3b3431,roughness:.86}),glass=material({color:0x31566b,roughness:.16,emissive:0x163449,emissiveIntensity:.26})
  const nave=box(g,[15,14,20],[0,7,0],brick,0,'holy-family-nave')
  box(g,[6.0,22,6.0],[-5.0,11,-7.0],brick,0,'holy-family-tower')
  const spire=new THREE.Mesh(geometry(new THREE.ConeGeometry(3.2,7.2,4)),roof);spire.position.set(-5,25,-7);spire.rotation.y=Math.PI/4;g.add(spire)
  const roofMain=new THREE.Mesh(geometry(new THREE.ConeGeometry(10.8,6.2,4)),roof);roofMain.position.set(0,16.8,0);roofMain.rotation.y=Math.PI/4;roofMain.scale.set(1,.72,1.35);g.add(roofMain)
  for(const x of [-4.6,0,4.6])box(g,[1.4,4.2,.18],[x,6.8,-10.08],glass)
  box(g,[4.0,5.0,.24],[0,2.5,-10.25],stone)
  const crossV=box(g,[.30,3.1,.22],[-5,29.5,-7],stone);const crossH=box(g,[2.0,.30,.22],[-5,30.0,-7],stone);void crossV;void crossH
  const sign=labelSprite('HOLY FAMILY • GAME RECONSTRUCTION');sign.scale.set(10,2.2,1);sign.position.set(0,22,-10.8);g.add(sign)
  g.userData={landmark:'Holy Family Church',representation:'game-reconstruction',exactDigitalTwin:false}
  root.add(g);colliders.push(new THREE.Box3().setFromObject(nave).expandByScalar(.15))
}
function addUICGateway(root:THREE.Group,colliders:THREE.Box3[]){
  const g=new THREE.Group();g.position.set(46,0,-22);g.name='west-side-uic-gateway-game-reconstruction'
  const concrete=material({color:0xb6b2a9,roughness:.82}),glass=material({color:0x315f77,roughness:.14,metalness:.10,transparent:true,opacity:.88}),red=material({color:0xb42b2d,roughness:.72})
  const shell=box(g,[25,12,13],[0,6,0],concrete,0,'uic-shell')
  box(g,[18,7,.22],[0,6,-6.62],glass)
  for(const x of [-8,-4,0,4,8])box(g,[.24,7,.28],[x,6,-6.76],red)
  box(g,[9,.42,2.6],[0,10.8,-7.4],red)
  const sign=labelSprite('UIC • CAMPUS GATEWAY');sign.scale.set(8.5,2.0,1);sign.position.set(0,13.4,-7);g.add(sign)
  g.userData={landmark:'UIC Near West campus anchor',representation:'game-reconstruction',exactDigitalTwin:false}
  root.add(g);colliders.push(new THREE.Box3().setFromObject(shell).expandByScalar(.15))
}
function addPilsenMurals(root:THREE.Group){
  const colors=[0xff5f6d,0x4cc9f0,0xffc857,0x7ae582,0xc77dff,0xff8c42]
  for(let i=0;i<6;i++){
    const panel=box(root,[5.4,4.2,.12],[-72+i*8.0,2.2,-62],material({color:colors[i],roughness:.72}),0,'pilsen-mural-panel')
    const stripe=box(root,[3.7,.40,.14],[-72+i*8.0,2.2+(i%3-1)*.75,-62.08],material({color:colors[(i+2)%colors.length],emissive:colors[(i+2)%colors.length],emissiveIntensity:.10}),i%2?.22:-.22,'pilsen-mural-accent')
    void panel;void stripe
  }
}
function addElevatedRail(root:THREE.Group){
  const steel=material({color:0x495158,metalness:.78,roughness:.42}),rail=material({color:0x252a2e,metalness:.90,roughness:.28}),deck=material({color:0x5d6266,metalness:.42,roughness:.68})
  for(let x=-80;x<=80;x+=12){box(root,[.50,6.4,.50],[x,3.2,-46],steel);box(root,[6.2,.30,.42],[x,6.15,-46],steel)}
  box(root,[176,.34,5.4],[0,6.45,-46],deck)
  box(root,[176,.12,.18],[0,6.72,-44.7],rail);box(root,[176,.12,.18],[0,6.72,-47.3],rail)
}

function addResidentialCourtyard(root:THREE.Group){
  const g=new THREE.Group();g.name='circle-park-residential-courtyard';g.position.set(-49,0,67)
  box(g,[28,.10,12],[0,.07,0],material({color:0x5f824f,roughness:1}),0,'courtyard-lawn')
  box(g,[5.2,.14,12],[0,.11,0],material({color:0xc9c1ae,roughness:1}),0,'courtyard-walk')
  box(g,[28,.14,2.2],[0,.12,0],material({color:0xc9c1ae,roughness:1}),0,'courtyard-crosswalk')
  for(const [x,z] of [[-10,-4.2],[10,-4.2],[-10,4.2],[10,4.2]] as const)addTree(g,x,z,.62)
  const board=labelSprite('CIRCLE PARK HOMES • UNITS 101–404');board.scale.set(10,2.2,1);board.position.set(0,3.2,0);g.add(board)
  root.add(g)
}

export function createStreetVerseWestSideVisibleWorld(scene:THREE.Scene,externalCollisionBoxes:THREE.Box3[]=[]):WestSideVisibleWorldHandle{
  const root=new THREE.Group();root.name='streetverse-west-side-visible-world-v1';root.userData={visualUpgradeVersion:'west-side-forger-v5',legacyVisualUpgradeVersion:'west-side-forger-v4',assetDensity:'expanded-v5',architectureDetail:'brick-cornice-awning-fire-escape-curb-alley',residentDetail:'hands-shoes-accessories',reconstructionMode:'public-data-grounded-game-reconstruction',geometryAuthority:'city-gis-source-registry',interiorAuthority:'verified-or-reconstructed',streetDetailPass:'curb-alley-signage-v5',exactDigitalTwin:false,reconstructionSourceCount:STREETVERSE_CHICAGO_RECONSTRUCTION_SOURCES.length,proofZone:STREETVERSE_CHICAGO_PROOF_ZONE.id};scene.add(root)
  const colliders:THREE.Box3[]=[]
  const brickMap=createWestSideBrickTexture()
  let nativeLayer:THREE.Group|null=null,nativeCancelled=false
  const ground=new THREE.Mesh(geometry(new THREE.PlaneGeometry(176,176)),material({color:0x676b55,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.01;ground.receiveShadow=true;root.add(ground)

  addRoad(root,0,49,176,11,'circle-park')
  addRoad(root,0,18,176,12,'roosevelt')
  addRoad(root,0,-8,176,10,'taylor')
  addRoad(root,0,-36,176,12,'pilsen')
  addRoad(root,0,5,11,176,'western')
  addRoad(root,-45,5,9,176,'west-side-west')
  addRoad(root,45,5,9,176,'west-side-east')
  ;[[0,49],[0,18],[0,-8],[0,-36],[-45,18],[45,18],[-45,-8],[45,-8]].forEach(([x,z],i)=>addCrosswalk(root,x,z,i<4?'z':'x'))
  addPark(root)
  addResidentialCourtyard(root)
  addElevatedRail(root)
  addPilsenMurals(root)
  addSaintIgnatius(root,colliders)
  addHolyFamily(root,colliders)
  addUICGateway(root,colliders)
  ;[[-73,16],[-57,16],[-30,16],[-10,16],[10,16],[30,16],[57,16],[73,16],[-73,-10],[-57,-10],[-30,-10],[30,-10],[57,-10],[73,-10]].forEach(([x,z],i)=>addStreetLight(root,x,z,i%2?Math.PI:0))
  addBusShelter(root,-16,14,0,'CTA • ROOSEVELT')
  addBusShelter(root,18,-11,Math.PI,'CTA • TAYLOR')

  const buildings:BuildingSpec[]=[
    {x:-67,z:34,w:16,d:15,h:18,color:0x8a4e39,label:'Circle Park Homes A',buildingNumber:'CP-A',units:['101','102','201','202']},
    {x:-67,z:67,w:16,d:15,h:20,color:0x7d493a,label:'Circle Park Homes B',buildingNumber:'CP-B',units:['301','302','401','402']},
    {x:-31,z:67,w:17,d:15,h:19,color:0x665044,label:'Circle Park Homes C',buildingNumber:'CP-C',units:['103','104','203','204']},
    {x:-25,z:33,w:18,d:15,h:22,color:0x6b5145,label:'West Side Commons'},
    {x:68,z:34,w:18,d:15,h:24,color:0x765b46,label:'Community Market'},
    {x:-67,z:5,w:18,d:15,h:19,color:0x73513f,label:'Roosevelt Shops'},
    {x:-24,z:5,w:16,d:15,h:23,color:0x485f72,label:'Creator Works'},
    {x:24,z:5,w:18,d:15,h:21,color:0x775846,label:'Holo Garage'},
    {x:68,z:5,w:18,d:15,h:25,color:0x526c5b,label:'West Side Clinic'},
    {x:-67,z:-22,w:18,d:15,h:18,color:0x6d4537,label:'Taylor Street Cafe'},
    {x:-24,z:-22,w:17,d:15,h:24,color:0x765c45,label:'Taylor Apartments',buildingNumber:'TAYLOR 24',units:['101','102','201','202']},
    {x:24,z:-22,w:18,d:15,h:20,color:0x4b6578,label:'64 Track Annex'},
    {x:68,z:-22,w:18,d:15,h:22,color:0x6c4c5e,label:'Little Italy Shops'},
    {x:-67,z:-54,w:18,d:16,h:20,color:0x6c4936,label:'Pilsen Market'},
    {x:-24,z:-54,w:18,d:16,h:24,color:0x4d6672,label:'Pilsen Arts'},
    {x:24,z:-54,w:18,d:16,h:22,color:0x75533f,label:'18th Street Homes',buildingNumber:'18TH 24',units:['1A','1B','2A','2B']},
    {x:68,z:-54,w:18,d:16,h:26,color:0x516859,label:'Pilsen Works'},
    {x:-48,z:34,w:14,d:13,h:17,color:0x79523f,label:'Circle Park Homes D',buildingNumber:'CP-D',units:['105','106','205','206']},
    {x:48,z:34,w:15,d:13,h:19,color:0x6b5549,label:'Circle Park Homes E',buildingNumber:'CP-E',units:['107','108','207','208']},
    {x:-48,z:5,w:14,d:13,h:18,color:0x825a43,label:'Roosevelt Retail West'},
    {x:48,z:5,w:15,d:13,h:20,color:0x5c6670,label:'Roosevelt Retail East'},
    {x:-48,z:-22,w:14,d:13,h:18,color:0x784a38,label:'Taylor Bakery Row'},
    {x:48,z:-22,w:15,d:13,h:21,color:0x6c5745,label:'Taylor Market Row'},
    {x:-48,z:-54,w:14,d:14,h:20,color:0x79503d,label:'Pilsen Corner Shops'},
    {x:48,z:-54,w:15,d:14,h:22,color:0x5b6571,label:'Pilsen Creator Block'},
  ]
  buildings.forEach(b=>addBuilding(root,b,colliders,brickMap))
  addThomasJeffersonSchool(root,colliders)

  const treeRows=[[-79,60],[-58,60],[-35,60],[-16,60],[16,60],[35,60],[58,60],[79,60],[-79,24],[-58,24],[-35,24],[35,24],[58,24],[79,24],[-79,-14],[-58,-14],[-35,-14],[35,-14],[58,-14],[79,-14],[-79,-44],[-58,-44],[-35,-44],[35,-44],[58,-44],[79,-44]] as const
  treeRows.forEach(([x,z],i)=>addTree(root,x,z,.72+(i%3)*.08))
  const extraTreeRows=[[-72,42],[-56,42],[-40,42],[40,42],[56,42],[72,42],[-72,10],[-56,10],[-40,10],[40,10],[56,10],[72,10],[-72,-29],[-56,-29],[-40,-29],[40,-29],[56,-29],[72,-29]] as const
  extraTreeRows.forEach(([x,z],i)=>addTree(root,x,z,.68+(i%4)*.06))
  ;[[-32,55,Math.PI],[32,55,Math.PI],[-32,24,Math.PI],[32,24,Math.PI],[-32,-3,0],[32,-3,0],[-32,-42,0],[32,-42,0]].forEach(([x,z,r])=>addBench(root,x,z,r))
  ;[[-70,45],[-38,14],[38,14],[68,-14],[-62,-45]].forEach(([x,z])=>addHydrant(root,x,z))
  ;[[-6,24,0],[6,24,Math.PI],[-6,-2,0],[6,-2,Math.PI],[-51,24,Math.PI/2],[51,24,-Math.PI/2]].forEach(([x,z,r])=>addTrafficSignal(root,x,z,r))
  ;[[-38,58,.2],[-22,44,-.4],[22,55,.3],[38,42,-.2],[-54,14,.1],[-24,10,-.4],[22,8,.5],[54,12,-.1],[-55,-2,.3],[-25,-5,-.3],[25,-4,.2],[55,-2,-.2],[-45,-42,.4],[45,-42,-.4]].forEach(([x,z,r],i)=>addAmbientResident(root,x,z,r,i))

  addVehicle(root,-55,47,0x2f6dd5,0,'sedan-a');addVehicle(root,-18,51,0xd34a3f,Math.PI,'sedan-b');addVehicle(root,31,17,0xe0c64c,0,'taxi');addVehicle(root,62,20,0x20242a,Math.PI,'suv');addVehicle(root,-59,-9,0x3f865b,0,'delivery');addVehicle(root,22,-35,0x7a3940,Math.PI,'coupe');addVehicle(root,-10,19,0x364f77,0,'sedan-c');addVehicle(root,52,-7,0x944339,Math.PI,'sedan-d')


  const nativePlacements:NativePlacement[]=[
    {asset:'streetLamp',position:[-34,0,20],label:'west-side-native-lamp-roosevelt-a'},
    {asset:'streetLamp',position:[34,0,20],label:'west-side-native-lamp-roosevelt-b'},
    {asset:'streetLamp',position:[-34,0,-10],label:'west-side-native-lamp-taylor-a'},
    {asset:'streetLamp',position:[34,0,-10],label:'west-side-native-lamp-taylor-b'},
    {asset:'bench',position:[-18,0,13],rotationY:Math.PI,label:'west-side-native-bench-roosevelt'},
    {asset:'bench',position:[20,0,-13],rotationY:0,label:'west-side-native-bench-taylor'},
    {asset:'tree',position:[-54,0,23],scale:1.04,label:'west-side-native-tree-roosevelt'},
    {asset:'tree',position:[54,0,-14],scale:.98,label:'west-side-native-tree-taylor'},
    {asset:'sportSedan2027',position:[-8,0,16],rotationY:0,label:'west-side-native-sport-sedan'},
    {asset:'boxTruckCustom2027',position:[50,0,-11],rotationY:Math.PI,label:'west-side-native-box-truck'},
    {asset:'residentA',position:[-26,0,14],rotationY:.2,label:'west-side-native-resident-a'},
    {asset:'residentB',position:[-15,0,12],rotationY:-.4,label:'west-side-native-resident-b'},
    {asset:'residentC',position:[8,0,-13],rotationY:.5,label:'west-side-native-resident-c'},
    {asset:'residentD',position:[20,0,-13],rotationY:-.2,label:'west-side-native-resident-d'},
    {asset:'residentE',position:[-30,0,-40],rotationY:.4,label:'west-side-native-resident-e'},
    {asset:'residentF',position:[16,0,-40],rotationY:-.3,label:'west-side-native-resident-f'},
    {asset:'residentG',position:[42,0,6],rotationY:.1,label:'west-side-native-student-a'},
    {asset:'residentH',position:[65,0,7],rotationY:-.2,label:'west-side-native-community-a'},
    {asset:'building',position:[-76,0,34],rotationY:Math.PI/2,scale:[2.2,1.45,1.55],label:'west-side-native-building-circle-west'},
    {asset:'building',position:[-64,0,6],rotationY:0,scale:[2.45,1.40,1.55],label:'west-side-native-building-roosevelt-west'},
    {asset:'building',position:[-52,0,-22],rotationY:0,scale:[2.35,1.35,1.50],label:'west-side-native-building-taylor-west'},
    {asset:'building',position:[-42,0,-54],rotationY:0,scale:[2.45,1.45,1.55],label:'west-side-native-building-pilsen-west'},
    {asset:'holoWayfinder',position:[-40,0,18],label:'west-side-native-wayfinder-roosevelt'},
    {asset:'holoWayfinder',position:[40,0,-8],label:'west-side-native-wayfinder-taylor'},
    {asset:'hydrant',position:[-52,0,16],label:'west-side-native-hydrant-roosevelt'},
    {asset:'trashCan',position:[-18,0,-12],label:'west-side-native-trash-taylor'},
    {asset:'recyclingBin',position:[18,0,-12],label:'west-side-native-recycling-taylor'},
    {asset:'residentA',position:[-52,0,13],rotationY:.1,label:'west-side-native-resident-roosevelt-extra'},
    {asset:'residentB',position:[-44,0,-12],rotationY:-.2,label:'west-side-native-resident-taylor-extra'},
    {asset:'residentC',position:[-34,0,-42],rotationY:.3,label:'west-side-native-resident-pilsen-extra'},
  ]
  void loadTryammNativeCircleParkLayer({placements:nativePlacements}).then(result=>{
    if(nativeCancelled){disposeNativeAssetLayer(result.group);return}
    nativeLayer=result.group
    nativeLayer.name='TRYAMM-Native-WestSide-Visual-Layer-v4'
    root.add(nativeLayer)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-west-side-native-assets',{detail:{loaded:result.loaded,failed:result.failed.length,usedUrls:result.usedUrls,source:'west-side-visible-world-v4'}}))
  })

  const anchors=[
    {id:'circle-park' as const,label:'CIRCLE PARK',x:0,z:49},
    {id:'roosevelt' as const,label:'ROOSEVELT ROAD',x:0,z:18},
    {id:'taylor' as const,label:'TAYLOR STREET',x:0,z:-8},
    {id:'pilsen' as const,label:'PILSEN',x:0,z:-36},
  ]
  anchors.forEach(a=>{const s=labelSprite(a.label);s.position.set(a.x,7,a.z);s.scale.set(9,2.2,1);root.add(s)})

  externalCollisionBoxes.push(...colliders)
  let active:WestSideDistrictId='circle-park'
  const onPosition=(event:Event)=>{
    const d=(event as CustomEvent<{x?:number;z?:number}>).detail||{}
    const x=Number(d.x),z=Number(d.z);if(!Number.isFinite(x)||!Number.isFinite(z))return
    let next:WestSideDistrictId='west-side',best=Infinity
    for(const a of anchors){const dist=Math.hypot(x-a.x,z-a.z);if(dist<best){best=dist;next=a.id}}
    if(best>24)next='west-side'
    if(next!==active){active=next;window.dispatchEvent(new CustomEvent('tryamm:streetverse-west-side-zone',{detail:{district:next,x,z,source:'west-side-visible-world'}}))}
  }
  window.addEventListener('tryamm:streetverse-player-position',onPosition)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-visible-world-ready',{detail:{version:'west-side-forger-v1',legacyVisualUpgradeVersion:'west-side-forger-v3',visualUpgradeVersion:'west-side-forger-v4',districts:anchors.map(a=>a.id),buildings:buildings.length+3,trees:treeRows.length+extraTreeRows.length+8,vehicles:8,roads:7,crosswalks:8,streetLights:14,busShelters:2,benches:8,hydrants:5,trafficSignals:6,ambientResidents:14,nativeVisualAssets:nativePlacements.length,pilsenMurals:6,elevatedRail:true,layeredTrees:true,contactShadows:true,facadeDepth:true,fireEscapes:true,streetLevelAwnings:true,roofParapets:true,residentHandsAndShoes:true,landmarks:['St. Ignatius game reconstruction','Holy Family game reconstruction','UIC campus gateway game reconstruction','Thomas Jefferson School reconstruction'],twoWayRoadMarkings:true,raisedSidewalks:true,apartmentUnitNumbers:true,circleParkCourtyard:true,cadForger:true,collisions:true,interiorLobbies:true,source:'StreetVerseWestSideVisibleWorldRuntime'}}))
  window.dispatchEvent(new CustomEvent('tryamm:game-ops-world-stage',{detail:{stage:'visible-world',state:'READY',version:'west-side-forger-v1',legacyVisualUpgradeVersion:'west-side-forger-v3',visualUpgradeVersion:'west-side-forger-v4',source:'StreetVerseWestSideVisibleWorldRuntime'}}))

  return{group:root,collisionBoxes:colliders,dispose:()=>{
    nativeCancelled=true
    if(nativeLayer){disposeNativeAssetLayer(nativeLayer);nativeLayer=null}
    window.removeEventListener('tryamm:streetverse-player-position',onPosition)
    root.traverse(obj=>{if(obj instanceof THREE.Sprite){const t=obj.userData.disposeTexture as THREE.Texture|undefined;t?.dispose()}})
    root.removeFromParent()
    ownedGeometries.splice(0).forEach(g=>g.dispose());ownedMaterials.splice(0).forEach(m=>m.dispose());ownedTextures.splice(0).forEach(t=>t.dispose())
  }}
}
