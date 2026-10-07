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
function addTree(root:THREE.Group,x:number,z:number,s=1,variant=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.name='west-side-tree-v3'
  const trunkMat=material({color:variant%2?0x5a3b27:0x68452d,roughness:1})
  const leafA=material({color:variant%3===0?0x2f6b42:variant%3===1?0x3b7548:0x356f40,roughness:.98})
  const leafB=material({color:variant%3===0?0x477f4f:variant%3===1?0x2b6039:0x4a8251,roughness:.98})
  const trunk=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.20*s,.32*s,3.1*s,8)),trunkMat);trunk.position.y=1.55*s;g.add(trunk)
  for(const [dx,dy,dz,scale,matLeaf] of [
    [0,3.65,0,1.25,leafA],[-.62,3.42,.18,.86,leafB],[.58,3.56,-.22,.90,leafA],[.08,4.35,.08,.82,leafB]
  ] as const){
    const crown=new THREE.Mesh(geometry(new THREE.DodecahedronGeometry(scale*s,1)),matLeaf)
    crown.position.set(dx*s,dy*s,dz*s);crown.rotation.set((variant%3)*.07,(variant%7)*.31,(variant%2?-.05:.05));g.add(crown)
  }
  for(const side of [-1,1]){
    const branch=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.055*s,.075*s,1.25*s,6)),trunkMat)
    branch.position.set(side*.28*s,2.75*s,0);branch.rotation.z=side*.62;g.add(branch)
  }
  g.userData={vegetationPass:'layered-canopy-v3',windReactive:true}
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
      box(g,[1.45,.9,.08],[x,y,s.d/2+.05],glass)
    }
    for(let z=-s.d/2+2;z<=s.d/2-2;z+=3.2){
      box(g,[.08,.9,1.45],[-s.w/2-.05,y,z],glass)
      box(g,[.08,.9,1.45],[s.w/2+.05,y,z],glass)
    }
  }
  box(g,[s.w+.12,.18,s.d+.12],[0,2.45,0],trim,0,'facade-belt')
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
function addVehicle(root:THREE.Group,x:number,z:number,color:number,rot=0,name='traffic',kind:'sedan'|'suv'|'delivery'='sedan'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name=`west-side-${name}`
  const long=kind==='delivery'?5.2:kind==='suv'?4.8:4.35
  const bodyH=kind==='delivery'?1.25:kind==='suv'?1.05:.82
  const paint=material({color,metalness:.56,roughness:.28})
  const glass=material({color:0x263c49,metalness:.18,roughness:.12,transparent:true,opacity:.92})
  const dark=material({color:0x111418,roughness:.82})
  box(g,[long,bodyH,1.92],[0,.68+bodyH*.24,0],paint,0,'vehicle-body')
  box(g,[kind==='delivery'?2.65:2.35,kind==='delivery'?.9:.68,1.58],[-.28,1.38,0],glass,0,'vehicle-cabin')
  box(g,[long*.27,.20,1.84],[long*.33,1.03,0],paint,0,'vehicle-hood')
  box(g,[long*.18,.18,1.84],[-long*.39,1.00,0],paint,0,'vehicle-trunk')
  for(const zz of [-.87,.87])box(g,[1.45,.42,.055],[-.30,1.43,zz],glass,0,'vehicle-side-glass')
  for(const zz of [-.98,.98])box(g,[.28,.14,.14],[.63,1.42,zz],paint,0,'vehicle-mirror')
  box(g,[.18,.22,1.82],[long*.51,.54,0],dark,0,'vehicle-front-bumper')
  box(g,[.18,.22,1.82],[-long*.51,.54,0],dark,0,'vehicle-rear-bumper')
  box(g,[.06,.32,.86],[long*.515,.78,0],dark,0,'vehicle-grille')
  for(const zz of [-.62,.62])box(g,[.07,.24,.32],[long*.525,.86,zz],material({color:0xfff3c2,emissive:0xffe09a,emissiveIntensity:.38}),0,'vehicle-headlight')
  for(const zz of [-.62,.62])box(g,[.07,.22,.28],[-long*.525,.80,zz],material({color:0xb62622,emissive:0x6b100f,emissiveIntensity:.34}),0,'vehicle-taillight')
  for(const xx of [-long*.31,long*.31])for(const zz of [-.94,.94]){
    const tire=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.40,.40,.25,14)),dark);tire.rotation.x=Math.PI/2;tire.position.set(xx,.42,zz);g.add(tire)
    const rim=new THREE.Mesh(geometry(new THREE.CylinderGeometry(.20,.20,.27,12)),material({color:0x7f8589,metalness:.72,roughness:.26}));rim.rotation.x=Math.PI/2;rim.position.set(xx,.42,zz);g.add(rim)
  }
  g.userData={vehicleVisualPass:'west-side-v3',kind}
  root.add(g)
}
function addStreetLight(root:THREE.Group,x:number,z:number,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-street-light-v3'
  const pole=material({color:0x3d4348,metalness:.55,roughness:.48})
  box(g,[.16,6.4,.16],[0,3.2,0],pole)
  box(g,[1.45,.10,.10],[.68,6.18,0],pole)
  box(g,[.46,.18,.28],[1.32,6.08,0],material({color:0xffe7a3,emissive:0xffd36a,emissiveIntensity:.48}),0,'street-light-head')
  root.add(g)
}
function addBench(root:THREE.Group,x:number,z:number,rot=0){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-bench-v3'
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
function addBusShelter(root:THREE.Group,x:number,z:number,rot=0,label='BUS STOP'){
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name='west-side-bus-shelter-v3'
  const metal=material({color:0x3d4a53,metalness:.62,roughness:.35}),glass=material({color:0x7ba6b8,roughness:.12,metalness:.08,transparent:true,opacity:.48})
  box(g,[4.6,.15,1.9],[0,2.65,0],metal)
  box(g,[.12,2.5,1.8],[-2.2,1.35,0],metal);box(g,[.12,2.5,1.8],[2.2,1.35,0],metal)
  box(g,[4.25,2.25,.08],[0,1.35,.86],glass)
  box(g,[2.8,.14,.58],[0,.72,.05],material({color:0x45515a,metalness:.42,roughness:.52}))
  const sign=labelSprite(label);sign.scale.set(3.5,.82,1);sign.position.set(0,3.25,.05);g.add(sign)
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
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;g.name=`west-side-ambient-resident-${index+1}`
  const skinColors=[0x70462f,0x8f654c,0xb57852,0x5f3b2b,0xc58a66]
  const tops=[0x315b7a,0x704936,0x485b3b,0x6d506f,0x765a32]
  const skin=material({color:skinColors[index%skinColors.length],roughness:.86})
  const cloth=material({color:tops[index%tops.length],roughness:.94})
  const pants=material({color:index%2?0x222831:0x34343b,roughness:.96})
  const torso=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.25,.72,3,8)),cloth);torso.position.y=1.18;g.add(torso)
  const head=new THREE.Mesh(geometry(new THREE.SphereGeometry(.24,12,9)),skin);head.position.y=1.92;g.add(head)
  const hair=new THREE.Mesh(geometry(new THREE.SphereGeometry(.245,10,8,0,Math.PI*2,0,Math.PI*.52)),material({color:index%3?0x211817:0x33251f,roughness:1}));hair.position.y=2.06;g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.065,.50,3,7)),skin);arm.position.set(side*.34,1.10,0);arm.rotation.z=side*.08;g.add(arm)
    const leg=new THREE.Mesh(geometry(new THREE.CapsuleGeometry(.085,.56,3,7)),pants);leg.position.set(side*.13,.39,0);g.add(leg)
  }
  g.userData={ambientVisual:true,identity:'fictional',populationPass:'west-side-v3'}
  root.add(g)
}
function addWestSideLandmark(root:THREE.Group,colliders:THREE.Box3[],spec:{id:string;label:string;x:number;z:number;w:number;d:number;h:number;color:number;accent:number;kind:'school'|'faith'|'campus'}){
  const g=new THREE.Group();g.position.set(spec.x,0,spec.z);g.name=`west-side-landmark-${spec.id}`
  const base=material({color:spec.color,roughness:.88}),accent=material({color:spec.accent,roughness:.84}),glass=material({color:0x5c8398,roughness:.20,metalness:.08,emissive:0x0d2430,emissiveIntensity:.18})
  const shell=box(g,[spec.w,spec.h,spec.d],[0,spec.h/2,0],base,0,'landmark-shell')
  box(g,[spec.w+.4,.42,spec.d+.4],[0,spec.h+.20,0],accent,0,'landmark-roofline')
  for(let y=3;y<spec.h-1;y+=3.1)for(let x=-spec.w/2+2;x<spec.w/2-1.2;x+=3.2)box(g,[1.35,.85,.10],[x,y,-spec.d/2-.06],glass)
  box(g,[Math.min(6.5,spec.w*.48),3.6,.24],[0,1.8,-spec.d/2-.20],glass)
  box(g,[Math.min(7.4,spec.w*.55),.30,2.8],[0,.16,-spec.d/2-1.45],accent)
  if(spec.kind==='faith'){
    box(g,[1.2,5.2,1.2],[0,spec.h+2.5,0],accent)
    const spire=new THREE.Mesh(geometry(new THREE.ConeGeometry(.65,3.4,8)),accent);spire.position.set(0,spec.h+7.0,0);g.add(spire)
  }
  if(spec.kind==='campus'){
    for(const side of [-1,1])box(g,[2.2,spec.h*.55,2.2],[side*spec.w*.28,spec.h*.28,0],accent)
  }
  const sign=labelSprite(spec.label);sign.scale.set(Math.min(12,spec.w*.55),2.2,1);sign.position.set(0,Math.min(spec.h-1,7),-spec.d/2-.55);g.add(sign)
  g.userData={geometryAuthority:'gameplay-reconstruction',landmarkId:spec.id,kind:spec.kind}
  root.add(g);colliders.push(new THREE.Box3().setFromObject(shell).expandByScalar(.20))
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
  const root=new THREE.Group();root.name='streetverse-west-side-visible-world-v3';root.userData={visualPass:'west-side-v3',assetDensity:'expanded',landmarkReconstruction:true};scene.add(root)
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
  buildings.forEach(b=>addBuilding(root,b,colliders))
  addThomasJeffersonSchool(root,colliders)
  addWestSideLandmark(root,colliders,{id:'saint-ignatius',label:'ST. IGNATIUS',x:-66,z:31,w:18,d:15,h:23,color:0x8a4d36,accent:0xcabf9d,kind:'school'})
  addWestSideLandmark(root,colliders,{id:'holy-family',label:'HOLY FAMILY',x:-66,z:58,w:16,d:14,h:24,color:0x6e4c3a,accent:0xbba77d,kind:'faith'})
  addWestSideLandmark(root,colliders,{id:'uic-gateway',label:'UIC GATEWAY',x:66,z:64,w:18,d:15,h:23,color:0x4b5e71,accent:0xd1b14a,kind:'campus'})

  const treeRows=[[-79,60],[-58,60],[-35,60],[-16,60],[16,60],[35,60],[58,60],[79,60],[-79,24],[-58,24],[-35,24],[35,24],[58,24],[79,24],[-79,-14],[-58,-14],[-35,-14],[35,-14],[58,-14],[79,-14],[-79,-44],[-58,-44],[-35,-44],[35,-44],[58,-44],[79,-44]] as const
  treeRows.forEach(([x,z],i)=>addTree(root,x,z,.72+(i%3)*.08,i))

  const extraTreeRows=[[-72,42],[-56,42],[-40,42],[40,42],[56,42],[72,42],[-72,10],[-56,10],[-40,10],[40,10],[56,10],[72,10],[-72,-29],[-56,-29],[-40,-29],[40,-29],[56,-29],[72,-29]] as const
  extraTreeRows.forEach(([x,z],i)=>addTree(root,x,z,.68+(i%4)*.06,i+treeRows.length))

  ;[[-76,54],[-52,54],[-28,54],[28,54],[52,54],[76,54],[-76,23],[-52,23],[52,23],[76,23],[-76,-3],[-52,-3],[52,-3],[76,-3],[-76,-42],[-52,-42],[52,-42],[76,-42]].forEach(([x,z],i)=>addStreetLight(root,x,z,i%2?Math.PI:0))
  ;[[-32,55,Math.PI],[32,55,Math.PI],[-32,24,Math.PI],[32,24,Math.PI],[-32,-3,0],[32,-3,0],[-32,-42,0],[32,-42,0]].forEach(([x,z,r])=>addBench(root,x,z,r))
  ;[[-70,45],[-38,14],[38,14],[68,-14],[-62,-45]].forEach(([x,z])=>addHydrant(root,x,z))
  addBusShelter(root,-18,25,Math.PI,'ROOSEVELT');addBusShelter(root,18,-1,0,'TAYLOR')
  ;[[-6,24,0],[6,24,Math.PI],[-6,-2,0],[6,-2,Math.PI],[-51,24,Math.PI/2],[51,24,-Math.PI/2]].forEach(([x,z,r])=>addTrafficSignal(root,x,z,r))
  ;[[-38,58,.2],[-22,44,-.4],[22,55,.3],[38,42,-.2],[-54,14,.1],[-24,10,-.4],[22,8,.5],[54,12,-.1],[-55,-2,.3],[-25,-5,-.3],[25,-4,.2],[55,-2,-.2],[-45,-42,.4],[45,-42,-.4]].forEach(([x,z,r],i)=>addAmbientResident(root,x,z,r,i))

  addVehicle(root,-55,47,0x2f6dd5,0,'sedan-a','sedan');addVehicle(root,-18,51,0xd34a3f,Math.PI,'sedan-b','sedan');addVehicle(root,31,17,0xe0c64c,0,'taxi','sedan');addVehicle(root,62,20,0x20242a,Math.PI,'suv','suv');addVehicle(root,-59,-9,0x3f865b,0,'delivery','delivery');addVehicle(root,22,-35,0x7a3940,Math.PI,'coupe','sedan');addVehicle(root,54,-10,0x496b82,0,'sedan-c','sedan');addVehicle(root,-42,-38,0x5b5c5f,Math.PI,'suv-b','suv')

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
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-visible-world-ready',{detail:{version:'west-side-forger-v3',districts:anchors.map(a=>a.id),buildings:buildings.length+4,trees:treeRows.length+extraTreeRows.length,vehicles:8,roads:7,crosswalks:8,streetLights:18,benches:8,hydrants:5,busShelters:2,trafficSignals:6,ambientResidents:14,landmarks:['Thomas Jefferson School','St. Ignatius','Holy Family','UIC Gateway'],twoWayRoadMarkings:true,raisedSidewalks:true,apartmentUnitNumbers:true,circleParkCourtyard:true,cadForger:true,collisions:true,interiorLobbies:true,layeredTrees:true,detailedVehicles:true,streetFurniturePass:'v3',source:'StreetVerseWestSideVisibleWorldRuntime'}}))
  window.dispatchEvent(new CustomEvent('tryamm:game-ops-world-stage',{detail:{stage:'visible-world',state:'READY',version:'west-side-forger-v3',source:'StreetVerseWestSideVisibleWorldRuntime'}}))

  return{group:root,collisionBoxes:colliders,dispose:()=>{
    window.removeEventListener('tryamm:streetverse-player-position',onPosition)
    root.traverse(obj=>{if(obj instanceof THREE.Sprite){const t=obj.userData.disposeTexture as THREE.Texture|undefined;t?.dispose()}})
    root.removeFromParent()
    ownedGeometries.splice(0).forEach(g=>g.dispose());ownedMaterials.splice(0).forEach(m=>m.dispose())
  }}
}
