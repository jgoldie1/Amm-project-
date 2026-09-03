import * as THREE from 'three'

type DistrictId='loop'|'river'|'lakefront'|'south'|'west'|'north'
type DistrictDef={id:DistrictId;label:string;center:THREE.Vector3;radius:number}
export type ChicagoDistrictWorld3D={group:THREE.Group;update:(player:THREE.Vector3)=>void;dispose:()=>void}

const material=(color:number,roughness=.78,metalness=.08,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,transparent,opacity})
const addBox=(parent:THREE.Object3D,x:number,y:number,z:number,w:number,h:number,d:number,mat:THREE.Material)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
const addLabel=(parent:THREE.Object3D,text:string,x:number,y:number,z:number,rotationY=0)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const c=canvas.getContext('2d');if(c){c.fillStyle='#0b4f9c';c.fillRect(0,0,512,96);c.strokeStyle='#fff';c.lineWidth=5;c.strokeRect(3,3,506,90);c.fillStyle='#fff';c.font='900 38px Arial';c.textAlign='center';c.textBaseline='middle';c.fillText(text,256,48)}const tex=new THREE.CanvasTexture(canvas);const m=new THREE.Mesh(new THREE.PlaneGeometry(8,1.5),new THREE.MeshBasicMaterial({map:tex,transparent:true}));m.position.set(x,y,z);m.rotation.y=rotationY;parent.add(m);return m}
const makeBus=(routeColor:number)=>{const g=new THREE.Group();addBox(g,0,1.5,0,7.8,2.7,2.45,material(0xe7e8ea,.62,.25));addBox(g,0,1.55,-1.24,7.2,.58,.05,material(routeColor,.45,.2));for(const x of [-2.35,2.35])for(const z of [-1.15,1.15]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.42,.42,.26,12),material(0x111111,.95,0));w.rotation.x=Math.PI/2;w.position.set(x,.48,z);g.add(w)}for(let i=-2;i<=2;i++)addBox(g,i*1.25,2.1,-1.27,.9,.72,.05,material(0x5e7f92,.18,.5,true,.88));return g}
const addBusStop=(parent:THREE.Object3D,label:string,x:number,z:number)=>{const pole=addBox(parent,x,2.2,z,.12,4.4,.12,material(0x353b43,.55,.5));pole.castShadow=false;const sign=addBox(parent,x,4.05,z,.9,1.1,.08,material(0x1468b3,.45,.25));sign.rotation.y=Math.PI/8;addLabel(parent,label,x,5.15,z,Math.PI/8)}
const addStreetFurniture=(parent:THREE.Object3D,x:number,z:number)=>{const pole=addBox(parent,x,2.5,z,.12,5,.12,material(0x343a40,.48,.62));pole.castShadow=false;const lamp=new THREE.PointLight(0xffd9a3,3.2,15,2);lamp.position.set(x,5,z);parent.add(lamp);addBox(parent,x+1.8,.45,z,3,.5,.75,material(0x4b3b2f,.88,.04));addBox(parent,x-1.9,.55,z,1.1,1.1,1.1,material(0x2f3439,.9,.12))}
const addStation=(parent:THREE.Object3D,label:string,x:number,z:number,length=34)=>{const g=new THREE.Group();g.position.set(x,0,z);parent.add(g);addBox(g,0,6.1,0,length,.45,5.8,material(0x4b5158,.5,.6));for(let sx=-length/2+3;sx<=length/2-3;sx+=7)addBox(g,sx,3.1,0,.45,6.2,.45,material(0x343a40,.48,.7));addBox(g,0,7.15,0,length*.72,.18,4.7,material(0x28313a,.42,.55));for(let i=-2;i<=2;i++)addBox(g,i*5,6.7,-2.55,3.6,1.1,.08,material(0x6d8798,.25,.55,true,.72));addLabel(g,label,0,8.6,-2.9,0);return g}

export function addStreetVerseChicagoDistrictWorld3D(scene:THREE.Scene):ChicagoDistrictWorld3D{
  const root=new THREE.Group();root.name='streetverse-chicago-district-world';scene.add(root)

  const stone=material(0x8c8376,.86,.05),brick=material(0x7b3f2f,.9,.02),brickDark=material(0x5e3026,.92,.02),glass=material(0x496d86,.2,.58,true,.88),steel=material(0x3d444d,.42,.72),concrete=material(0x666a6f,.88,.04),green=material(0x3b6f45,.95,.02),water=material(0x164e72,.22,.16,true,.86),court=material(0x42545d,.8,.06)

  const loop=new THREE.Group();loop.position.set(0,0,0);root.add(loop)
  const towerDefs=[[-64,-34,20,64,16,16],[-46,-58,22,82,18,16],[-24,-40,18,58,16,16],[18,-52,20,72,17,17],[42,-38,24,94,19,18],[63,-55,18,62,15,16],[-58,18,20,54,17,18],[-32,34,18,68,16,16],[26,24,24,88,20,18],[55,18,20,58,17,17]]
  towerDefs.forEach(([x,z,w,h,d],i)=>{addBox(loop,x,h/2,z,w,h,d,i%3===0?stone:glass);for(let y=6;y<h-4;y+=8){const band=addBox(loop,x,y,z-d/2-.08,w*.88,.35,.12,material(i%3===0?0xd6c69e:0xb5ddff,.35,.1,true,.8));band.castShadow=false}})
  const plaza=addBox(loop,0,.12,18,70,.24,34,concrete);plaza.receiveShadow=true
  addLabel(loop,'STATE ST',-10,5.2,7,0);addLabel(loop,'WABASH AVE',12,5.2,7,0);addBusStop(loop,'CTA • LOOP',-5,27)
  ;[[-28,11],[-10,11],[10,11],[28,11],[-28,27],[28,27]].forEach(([x,z])=>addStreetFurniture(loop,x,z))
  addStation(loop,'CTA • STATE / LAKE',-18,-34,30);addStation(loop,'CTA • WABASH / ADAMS',22,32,30)

  const river=new THREE.Mesh(new THREE.PlaneGeometry(240,26),water);river.rotation.x=-Math.PI/2;river.position.set(0,.02,-8);root.add(river)
  for(const x of [-56,0,56]){const bridge=new THREE.Group();bridge.position.set(x,.7,-8);const deck=addBox(bridge,0,0,0,18,.7,28,steel);deck.rotation.z=(x===0?0:.01);for(const sx of [-7,7])for(const sz of [-11,11])addBox(bridge,sx,4,sz,.8,8,.8,steel);root.add(bridge)}
  const riverwalk=addBox(root,0,.3,10,210,.5,7,concrete);riverwalk.receiveShadow=true
  for(let x=-72;x<=72;x+=18)addStreetFurniture(root,x,13)

  const lTrack=new THREE.Group();lTrack.position.set(0,7,34);root.add(lTrack)
  for(let x=-78;x<=78;x+=10){addBox(lTrack,x,-3.3,0,.7,6.6,.7,steel);addBox(lTrack,x,0,0,10,.35,.5,steel)}
  const railA=addBox(lTrack,0,.45,-1.25,166,.18,.18,steel),railB=addBox(lTrack,0,.45,1.25,166,.18,.18,steel);railA.castShadow=railB.castShadow=false
  const lTrain=new THREE.Group();lTrain.position.set(-72,1.8,0);lTrack.add(lTrain)
  for(let i=0;i<3;i++){addBox(lTrain,i*6,0,0,5.4,3.2,2.6,material(0xaeb6bd,.55,.35));addBox(lTrain,i*6,.1,-1.34,5,.35,.08,material(0xc60c30,.45,.2))}
  const loopBus=makeBus(0x1468b3);loopBus.position.set(-70,.05,22);root.add(loopBus)

  const lake=new THREE.Mesh(new THREE.PlaneGeometry(300,170),water);lake.rotation.x=-Math.PI/2;lake.position.set(0,-.03,180);root.add(lake)
  addBox(root,0,.1,104,210,.22,14,green)
  addBox(root,0,.16,112,210,.22,7,concrete)
  for(let i=0;i<22;i++){const t=new THREE.Group();addBox(t,0,1.5,0,.55,3,.55,material(0x65462d,.92,.02));const crown=new THREE.Mesh(new THREE.SphereGeometry(2.1,10,8),green);crown.position.y=4.2;t.add(crown);t.position.set(-95+i*9,0,96+(i%2)*5);root.add(t)}
  addLabel(root,'LAKE SHORE',-18,4.6,108,0);addBusStop(root,'CTA • LAKEFRONT',22,109)
  for(let x=-60;x<=60;x+=20)addStreetFurniture(root,x,115)
  const pavilion=new THREE.Group();pavilion.position.set(48,0,100);root.add(pavilion);for(let i=-4;i<=4;i++){const rib=new THREE.Mesh(new THREE.TorusGeometry(5+i*.08,.12,6,16,Math.PI),material(0xb0b8c0,.35,.6));rib.rotation.z=Math.PI/2;rib.rotation.y=Math.PI/2;rib.position.set(i*1.1,4,0);pavilion.add(rib)}addLabel(root,'MILLENNIUM PARK DISTRICT',48,7.4,92,0)

  const south=new THREE.Group();south.position.set(-30,0,72);root.add(south)
  for(let i=0;i<14;i++){const row=Math.floor(i/7),col=i%7;const x=-54+col*17,z=row*24;const m=i%3===0?stone:brick;addBox(south,x,6,z,13,12,16,m);addBox(south,x,7.2,z-8.05,8,1.2,.25,material(0x2d2a27,.8,.1));for(const wx of [-4,0,4])for(const wy of [4,8])addBox(south,x+wx,wy,z-8.2,1.5,2.1,.15,glass)}
  for(let i=0;i<6;i++){addBox(south,-50+i*18,4,48,15,8,14,i%2?brick:brickDark);addBox(south,-50+i*18,2.5,40.8,11,2.2,.18,material([0x175f88,0x8a392d,0x5b7d36][i%3],.5,.1))}
  addBox(south,38,.14,15,26,.28,16,court);addLabel(south,'79TH ST',-20,5,39.5,0);addLabel(south,'SOUTH SIDE',34,5,39.5,0)
  for(let i=0;i<5;i++){const tree=new THREE.Group();addBox(tree,0,1.4,0,.42,2.8,.42,material(0x5e402a,.9,.02));const crown=new THREE.Mesh(new THREE.SphereGeometry(1.65,9,7),green);crown.position.y=3.6;tree.add(crown);tree.position.set(-40+i*18,0,31);south.add(tree)}
  addBusStop(south,'CTA • 79TH',18,39);const southBus=makeBus(0x39a852);southBus.position.set(-52,.05,37);south.add(southBus)

  const west=new THREE.Group();west.position.set(-92,0,5);root.add(west)
  for(let i=0;i<12;i++){const x=(i%4)*18,z=Math.floor(i/4)*21;addBox(west,x,5,z,14,10,15,i%2?brick:brickDark);for(const wx of [-4,0,4])addBox(west,x+wx,5,z-7.6,1.2,1.8,.15,glass)}
  addBox(west,29,.12,-18,80,.24,9,green)
  addBox(west,64,6,30,28,12,20,material(0x5d6266,.88,.18));const mural=addBox(west,49,5.5,40,.25,8,24,material(0x6f4d8a,.7,.08));mural.rotation.y=Math.PI/2
  addLabel(west,'MADISON ST',28,4.8,-12,0);addLabel(west,'WEST SIDE',28,4.8,47,0);addBusStop(west,'CTA • MADISON',-2,-12)
  const westBus=makeBus(0x1468b3);westBus.position.set(64,.05,-12);westBus.rotation.y=Math.PI;west.add(westBus)

  const north=new THREE.Group();north.position.set(18,0,-100);root.add(north)
  for(let i=0;i<14;i++){const x=-55+(i%7)*18,z=Math.floor(i/7)*24;const h=12+(i%4)*4;addBox(north,x,h/2,z,14,h,16,i%3===0?stone:brick);if(i<7){addBox(north,x,2.7,z-8.1,12,5,.2,glass);addBox(north,x,5.7,z-8.25,8,.55,.12,material([0xb13b7b,0x2b8bb8,0xc17f2d][i%3],.35,.1))}}
  addBox(north,0,7,38,78,.6,8,steel);for(let x=-34;x<=34;x+=12)addBox(north,x,3.5,38,.7,7,.7,steel)
  addLabel(north,'NORTH SIDE',0,5.2,31,0);addLabel(north,'BROADWAY',-20,5.2,-9,0);addBusStop(north,'CTA • NORTH',28,28)
  addStation(north,'CTA • NORTH SIDE',0,38,52)
  const northBus=makeBus(0x8246af);northBus.position.set(-50,.05,31);north.add(northBus)

  const districts:DistrictDef[]=[
    {id:'loop',label:'THE LOOP',center:new THREE.Vector3(0,0,0),radius:72},
    {id:'river',label:'CHICAGO RIVER',center:new THREE.Vector3(0,0,-8),radius:34},
    {id:'lakefront',label:'LAKEFRONT',center:new THREE.Vector3(0,0,112),radius:48},
    {id:'south',label:'SOUTH SIDE',center:new THREE.Vector3(-30,0,78),radius:62},
    {id:'west',label:'WEST SIDE',center:new THREE.Vector3(-78,0,12),radius:58},
    {id:'north',label:'NORTH SIDE',center:new THREE.Vector3(18,0,-86),radius:62},
  ]
  let current=''
  const update=(player:THREE.Vector3)=>{
    const t=performance.now()/1000
    lTrain.position.x=-74+((t*7)%148)
    loopBus.position.x=-78+((t*5)%156)
    southBus.position.x=-58+((t*3.8)%108)
    westBus.position.x=72-((t*3.6)%112)
    northBus.position.x=-58+((t*4.2)%116)
    for(const d of districts){if(player.distanceTo(d.center)<=d.radius){if(current!==d.id){current=d.id;window.dispatchEvent(new CustomEvent('tryamm:district-enter',{detail:{id:d.id,label:d.label,position:{x:player.x,y:player.y,z:player.z},physical:true}}))}break}}
  }
  window.dispatchEvent(new CustomEvent('tryamm:chicago-district-world-ready',{detail:{loop:true,river:true,bridges:3,elevatedL:true,lakefront:true,southSide:true,westSide:true,northSide:true,ctaBuses:4,ctaStops:5,ctaStations:3,downtownStreetFurniture:true,millenniumParkDistrict:true,neighborhoodStreetIdentity:true}}))
  const dispose=()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mt=(m as any).material;if(Array.isArray(mt))mt.forEach((x:THREE.Material)=>x.dispose());else mt?.dispose?.()})}
  return {group:root,update,dispose}
}
