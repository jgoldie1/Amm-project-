import * as THREE from 'three'

export type WestSideDistrictId='circle-park'|'roosevelt'|'taylor'|'pilsen'|'west-side'
export type WestSideVisibleWorldHandle={
  group:THREE.Group
  collisionBoxes:THREE.Box3[]
  dispose:()=>void
}

type BuildingSpec={x:number;z:number;w:number;d:number;h:number;color:number;label:string;rotation?:number;units?:readonly string[];buildingNumber?:string}
const ownedMaterials:THREE.Material[]=[]
const ownedGeometries:THREE.BufferGeometry[]=[]
const material=(params:THREE.MeshStandardMaterialParameters)=>{
  const m=new THREE.MeshStandardMaterial(params);ownedMaterials.push(m);return m
}
const geometry=<T extends THREE.BufferGeometry>(g:T)=>{ownedGeometries.push(g);return g}

function box(group:THREE.Group,size:[number,number,number],pos:[number,number,number],mat:THREE.Material,rotationY=0,name=''){
  const mesh=new THREE.Mesh(geometry(new THREE.BoxGeometry(...size)),mat)
  mesh.position.set(...pos);mesh.rotation.y=rotationY;mesh.castShadow=false;mesh.receiveShadow=true;mesh.name=name;group.add(mesh);return mesh
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
  const g=new THREE.Group();g.position.set(x,0,z);g.name='west-side-tree'
  const trunk=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.22*s,.3*s,2.8*s,7)),material({color:0x654127,roughness:1}));trunk.position.y=1.4*s;g.add(trunk)
  const crown=new THREE.Mesh(geometry(new THREE.SphereGeometry(1.25*s,9,7)),material({color:0x327243,roughness:.95}));crown.position.y=3.5*s;g.add(crown)
  root.add(g)
}
function addBuilding(root:THREE.Group,s:BuildingSpec,colliders:THREE.Box3[]){
  const g=new THREE.Group();g.position.set(s.x,0,s.z);g.rotation.y=s.rotation||0;g.name=`west-side-building-${s.label.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`
  const facade=material({color:s.color,roughness:.76,metalness:.04})
  const trim=material({color:0xd7d1c1,roughness:.82})
  const glass=material({color:0x82b9d2,roughness:.22,metalness:.18,emissive:0x16384b,emissiveIntensity:.32})
  const dark=material({color:0x18232b,roughness:.55})
  const body=box(g,[s.w,s.h,s.d],[0,s.h/2,0],facade,0,'shell')
  for(let y=3.2;y<s.h-1.5;y+=3.3){
    for(let x=-s.w/2+2;x<=s.w/2-2;x+=3.2){
      box(g,[1.45,.9,.08],[x,y,-s.d/2-.05],glass)
    }
  }
  box(g,[Math.min(5,s.w*.45),3.2,.35],[0,1.6,-s.d/2-.22],glass,0,'entry-glass')
  box(g,[1.8,3,.18],[0,1.5,-s.d/2-.43],dark,0,'entry-door')
  box(g,[Math.min(6,s.w*.5),.35,2.8],[0,.18,-s.d/2-1.45],trim,0,'entry-step')
  box(g,[Math.min(6.5,s.w*.55),.16,3.6],[0,.13,-s.d/2+1.9],material({color:0x8c765f,roughness:.9}),0,'lobby-floor')
  box(g,[1.5,.18,3.2],[-1.4,.55,-s.d/2+2.1],trim,.24,'interior-stair-1')
  box(g,[1.5,.18,3.2],[0,.95,-s.d/2+2.1],trim,.24,'interior-stair-2')
  box(g,[1.5,.18,3.2],[1.4,1.35,-s.d/2+2.1],trim,.24,'interior-stair-3')
  box(g,[s.w+.35,.45,s.d+.35],[0,s.h+.23,0],trim,0,'roof-cap')
  box(g,[2.8,1.2,2.2],[-s.w*.2,s.h+.85,0],dark,0,'roof-hvac')
  const sign=labelSprite(s.label);sign.position.set(0,Math.min(s.h-1,7),-s.d/2-.55);g.add(sign)
  if(s.buildingNumber){
    const number=labelSprite(s.buildingNumber);number.name='building-number';number.scale.set(3.6,.9,1);number.position.set(-Math.min(2.4,s.w*.2),2.75,-s.d/2-.48);g.add(number)
  }
  if(s.units?.length){
    s.units.slice(0,4).forEach((unit,i)=>{const plaque=labelSprite(unit);plaque.name='apartment-unit-number';plaque.scale.set(2.2,.58,1);plaque.position.set((i-1.5)*1.85,1.0,-s.d/2-.50);g.add(plaque)})
  }
  root.add(g)
  colliders.push(new THREE.Box3().setFromObject(body).expandByScalar(.25))
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
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name=`west-side-${name}`
  box(g,[4.2,.82,1.9],[0,.72,0],material({color,metalness:.58,roughness:.27}))
  box(g,[2.25,.62,1.55],[-.25,1.38,0],material({color:0x182a36,metalness:.28,roughness:.18}))
  for(const xx of [-1.3,1.3])for(const zz of [-.92,.92]){
    const wheel=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.39,.39,.24,12)),material({color:0x090a0b,roughness:1}));wheel.rotation.x=Math.PI/2;wheel.position.set(xx,.43,zz);g.add(wheel)
  }
  root.add(g)
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
  const root=new THREE.Group();root.name='streetverse-west-side-visible-world-v1';scene.add(root)
  const colliders:THREE.Box3[]=[]
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

  const buildings:BuildingSpec[]=[
    {x:-67,z:34,w:16,d:15,h:18,color:0x8a4e39,label:'Circle Park Homes A',buildingNumber:'CP-A',units:['101','102','201','202']},
    {x:-67,z:67,w:16,d:15,h:20,color:0x7d493a,label:'Circle Park Homes B',buildingNumber:'CP-B',units:['301','302','401','402']},
    {x:-31,z:67,w:17,d:15,h:19,color:0x665044,label:'Circle Park Homes C',buildingNumber:'CP-C',units:['103','104','203','204']},
    {x:-25,z:33,w:18,d:15,h:22,color:0x6b5145,label:'West Side Commons'},
    {x:25,z:33,w:17,d:15,h:20,color:0x536676,label:'Jefferson School'},
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
  ]
  buildings.forEach(b=>addBuilding(root,b,colliders))

  const treeRows=[[-79,60],[-58,60],[-35,60],[-16,60],[16,60],[35,60],[58,60],[79,60],[-79,24],[-58,24],[-35,24],[35,24],[58,24],[79,24],[-79,-14],[-58,-14],[-35,-14],[35,-14],[58,-14],[79,-14],[-79,-44],[-58,-44],[-35,-44],[35,-44],[58,-44],[79,-44]] as const
  treeRows.forEach(([x,z],i)=>addTree(root,x,z,.72+(i%3)*.08))

  addVehicle(root,-55,47,0x2f6dd5,0,'sedan-a');addVehicle(root,-18,51,0xd34a3f,Math.PI,'sedan-b');addVehicle(root,31,17,0xe0c64c,0,'taxi');addVehicle(root,62,20,0x20242a,Math.PI,'suv');addVehicle(root,-59,-9,0x3f865b,0,'delivery');addVehicle(root,22,-35,0x7a3940,Math.PI,'coupe')

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
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-visible-world-ready',{detail:{version:'west-side-forger-v1',districts:anchors.map(a=>a.id),buildings:buildings.length,trees:treeRows.length,vehicles:6,roads:7,crosswalks:8,twoWayRoadMarkings:true,raisedSidewalks:true,apartmentUnitNumbers:true,circleParkCourtyard:true,cadForger:true,collisions:true,interiorLobbies:true,source:'StreetVerseWestSideVisibleWorldRuntime'}}))
  window.dispatchEvent(new CustomEvent('tryamm:game-ops-world-stage',{detail:{stage:'visible-world',state:'READY',version:'west-side-forger-v1',source:'StreetVerseWestSideVisibleWorldRuntime'}}))

  return{group:root,collisionBoxes:colliders,dispose:()=>{
    window.removeEventListener('tryamm:streetverse-player-position',onPosition)
    root.traverse(obj=>{if(obj instanceof THREE.Sprite){const t=obj.userData.disposeTexture as THREE.Texture|undefined;t?.dispose()}})
    root.removeFromParent()
    ownedGeometries.splice(0).forEach(g=>g.dispose());ownedMaterials.splice(0).forEach(m=>m.dispose())
  }}
}
