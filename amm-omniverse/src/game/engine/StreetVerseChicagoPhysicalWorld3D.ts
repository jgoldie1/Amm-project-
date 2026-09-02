import * as THREE from 'three'

type Trigger={id:string;center:THREE.Vector3;radius:number;event:string;detail:Record<string,unknown>}
export type ChicagoPhysicalWorld3D={group:THREE.Group;triggers:Trigger[];update:(player:THREE.Vector3)=>void;dispose:()=>void}

const mat=(color:number,roughness=.8,metalness=0,emissive=0,emissiveIntensity=0,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:new THREE.Color(emissive),emissiveIntensity,transparent,opacity})

export function addStreetVerseChicagoPhysicalWorld3D(scene:THREE.Scene):ChicagoPhysicalWorld3D{
  const root=new THREE.Group();root.name='streetverse-chicago-physical-world';scene.add(root)
  const triggers:Trigger[]=[];const fired=new Set<string>()

  // Fictionalized underground freight tunnel — intentionally not based on restricted real-world access maps.
  const tunnel=new THREE.Group();tunnel.position.set(-115,-9,-70);root.add(tunnel)
  const wallMat=mat(0x3a342d,.95,.05),railMat=mat(0x4b4b50,.35,.85),woodMat=mat(0x4c3424,.9,0),waterMat=mat(0x284b5f,.15,.15,0x14354a,.3,true,.55)
  for(let i=0;i<18;i++){
    const z=i*8
    const arch=new THREE.Mesh(new THREE.TorusGeometry(5.2,.45,8,16,Math.PI),wallMat);arch.rotation.z=Math.PI;arch.rotation.y=Math.PI/2;arch.position.set(0,4,z);tunnel.add(arch)
    const floor=new THREE.Mesh(new THREE.BoxGeometry(10,.4,8),wallMat);floor.position.set(0,-.2,z);tunnel.add(floor)
    ;[-1.1,1.1].forEach(x=>{const rail=new THREE.Mesh(new THREE.BoxGeometry(.16,.18,8),railMat);rail.position.set(x,.15,z);tunnel.add(rail)})
    if(i%2===0){const tie=new THREE.Mesh(new THREE.BoxGeometry(4,.18,.35),woodMat);tie.position.set(0,.05,z);tunnel.add(tie)}
  }
  const freightCar=new THREE.Group();freightCar.position.set(0,.65,64);const fcBody=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.6,5.2),mat(0x5c3924,.8,.35));freightCar.add(fcBody);[-1,1].forEach(x=>[-1.8,1.8].forEach(z=>{const w=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.28,10),mat(0x171717,.9,.5));w.rotation.z=Math.PI/2;w.position.set(x,-.7,z);freightCar.add(w)}));tunnel.add(freightCar)
  const flood=new THREE.Mesh(new THREE.PlaneGeometry(9,36),waterMat);flood.rotation.x=-Math.PI/2;flood.position.set(0,.1,104);tunnel.add(flood)
  const secretDoor=new THREE.Mesh(new THREE.BoxGeometry(4,5,.5),mat(0x232326,.6,.75,0x221144,.4));secretDoor.position.set(0,2.5,140);tunnel.add(secretDoor)
  triggers.push({id:'underground-entry',center:new THREE.Vector3(-115,0,-70),radius:9,event:'tryamm:physical-zone-enter',detail:{zone:'fictional-underground',mission:'freight-ghost-line'}})
  triggers.push({id:'flood-memory',center:new THREE.Vector3(-115,-9,34),radius:8,event:'tryamm:temporal-echo-available',detail:{era:'1992',mission:'flood-1992-time'}})
  triggers.push({id:'chrono-door',center:new THREE.Vector3(-115,-9,70),radius:7,event:'tryamm:secret-door-near',detail:{id:'chrono-archive'}})

  // Lower-Wacker-inspired transition ramp (fictional geometry).
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(10,.6,55),mat(0x1d1d22,.85,.1));ramp.position.set(-92,-4,-68);ramp.rotation.x=-.13;root.add(ramp)
  triggers.push({id:'lower-wacker-transition',center:new THREE.Vector3(-92,-2,-68),radius:10,event:'tryamm:physical-zone-enter',detail:{zone:'lower-wacker-inspired'}})

  // Public-facing justice district exterior. No restricted facility interiors/security layouts.
  const justice=new THREE.Group();justice.position.set(112,0,-58);root.add(justice)
  const stone=mat(0xb8b1a4,.9,0),glass=mat(0x7690a2,.12,.45,0,0,true,.5)
  const court=new THREE.Mesh(new THREE.BoxGeometry(42,20,26),stone);court.position.y=10;justice.add(court)
  for(let x=-14;x<=14;x+=7){const col=new THREE.Mesh(new THREE.CylinderGeometry(.65,.8,12,10),stone);col.position.set(x,6,13.3);justice.add(col)}
  const entry=new THREE.Mesh(new THREE.BoxGeometry(12,7,.3),glass);entry.position.set(0,4,13.2);justice.add(entry)
  triggers.push({id:'county-court-public',center:new THREE.Vector3(112,0,-40),radius:12,event:'tryamm:justice-public-zone',detail:{mission:'county-court-run',publicFacing:true}})

  // Millennium Park / rink-inspired public plaza, deliberately stylized.
  const park=new THREE.Group();park.position.set(78,0,92);root.add(park)
  const plaza=new THREE.Mesh(new THREE.BoxGeometry(56,.3,40),mat(0x777b80,.95,0));plaza.position.y=.15;park.add(plaza)
  const rink=new THREE.Mesh(new THREE.CylinderGeometry(15,15,.22,32),mat(0xbfe7ff,.12,.05,0x7ec8ff,.25,true,.85));rink.position.y=.25;park.add(rink)
  const reflective=new THREE.Mesh(new THREE.SphereGeometry(5,24,16),mat(0xbec7cf,.12,.95));reflective.scale.set(1.45,.65,1);reflective.position.set(-18,5,-6);park.add(reflective)
  triggers.push({id:'millennium-rink',center:new THREE.Vector3(78,0,92),radius:22,event:'tryamm:physical-zone-enter',detail:{zone:'millennium-park-inspired',mission:'millennium-rink-time-trial'}})

  // Lakefront edge and mission zone.
  const lake=new THREE.Mesh(new THREE.PlaneGeometry(220,180),mat(0x174d74,.2,.15,0x0c3555,.2,true,.82));lake.rotation.x=-Math.PI/2;lake.position.set(0,-.05,205);root.add(lake)
  const trail=new THREE.Mesh(new THREE.BoxGeometry(180,.2,7),mat(0x4b4d51,.88,0));trail.position.set(0,.12,118);root.add(trail)
  triggers.push({id:'lakefront-mission',center:new THREE.Vector3(0,0,118),radius:20,event:'tryamm:physical-zone-enter',detail:{zone:'lakefront',mission:'lakefront-defense'}})

  // Temporal portal marker: same player location can transition into historical simulation layers.
  const chrono=new THREE.Group();chrono.position.set(-110,-8,-5);const ring=new THREE.Mesh(new THREE.TorusGeometry(3.4,.28,10,32),mat(0x8c63ff,.25,.75,0x6d48ff,2));ring.rotation.x=Math.PI/2;chrono.add(ring);root.add(chrono)
  triggers.push({id:'temporal-portal',center:new THREE.Vector3(-110,-8,-5),radius:6,event:'tryamm:temporal-echo-available',detail:{eras:['1906','1920s','1980s','1992'],preservePlayerPosition:true}})

  const update=(player:THREE.Vector3)=>{for(const t of triggers){if(player.distanceTo(t.center)<=t.radius){if(!fired.has(t.id)){fired.add(t.id);window.dispatchEvent(new CustomEvent(t.event,{detail:{...t.detail,triggerId:t.id,position:{x:t.center.x,y:t.center.y,z:t.center.z}}}))}}else if(player.distanceTo(t.center)>t.radius*1.4){fired.delete(t.id)}}}
  const dispose=()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const material=(m as any).material;if(Array.isArray(material))material.forEach((x:THREE.Material)=>x.dispose());else material?.dispose?.()})}
  return {group:root,triggers,update,dispose}
}
