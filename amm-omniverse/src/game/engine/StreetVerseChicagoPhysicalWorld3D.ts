import * as THREE from 'three'

type Trigger={id:string;center:THREE.Vector3;radius:number;event:string;detail:Record<string,unknown>}
export type ChicagoPhysicalWorld3D={group:THREE.Group;triggers:Trigger[];update:(player:THREE.Vector3)=>void;tick:(time:number)=>void;dispose:()=>void}

const mat=(color:number,roughness=.8,metalness=0,emissive=0,emissiveIntensity=0,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:new THREE.Color(emissive),emissiveIntensity,transparent,opacity})
const person=(color:number)=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CapsuleGeometry(.26,.72,3,6),mat(color));b.position.y=1;const h=new THREE.Mesh(new THREE.SphereGeometry(.23,8,8),mat(0x8a5a44));h.position.y=1.72;g.add(b,h);return g}

export function addStreetVerseChicagoPhysicalWorld3D(scene:THREE.Scene):ChicagoPhysicalWorld3D{
  const root=new THREE.Group();root.name='streetverse-chicago-physical-world';scene.add(root)
  const triggers:Trigger[]=[];const fired=new Set<string>();const animated:{door?:THREE.Mesh;flood?:THREE.Mesh;skaters:THREE.Group[];lakePeople:THREE.Group[];courtPeople:THREE.Group[];train?:THREE.Group}={skaters:[],lakePeople:[],courtPeople:[]}

  const tunnel=new THREE.Group();tunnel.position.set(-72,-7,-62);root.add(tunnel)
  const wallMat=mat(0x3a342d,.95,.05),railMat=mat(0x4b4b50,.35,.85),woodMat=mat(0x4c3424,.9),waterMat=mat(0x284b5f,.15,.15,0x14354a,.35,true,.62)
  for(let i=0;i<14;i++){const z=i*7;const arch=new THREE.Mesh(new THREE.TorusGeometry(4.7,.42,8,16,Math.PI),wallMat);arch.rotation.z=Math.PI;arch.rotation.y=Math.PI/2;arch.position.set(0,3.7,z);tunnel.add(arch);const floor=new THREE.Mesh(new THREE.BoxGeometry(9,.35,7),wallMat);floor.position.set(0,-.15,z);tunnel.add(floor);[-1,1].forEach(x=>{const rail=new THREE.Mesh(new THREE.BoxGeometry(.14,.16,7),railMat);rail.position.set(x,.12,z);tunnel.add(rail)});if(i%2===0){const tie=new THREE.Mesh(new THREE.BoxGeometry(3.6,.15,.32),woodMat);tie.position.set(0,.04,z);tunnel.add(tie)}}
  const freight=new THREE.Mesh(new THREE.BoxGeometry(3,1.5,5),mat(0x5c3924,.8,.35));freight.position.set(0,.75,46);tunnel.add(freight)
  const flood=new THREE.Mesh(new THREE.PlaneGeometry(8,30),waterMat);flood.rotation.x=-Math.PI/2;flood.position.set(0,.08,72);tunnel.add(flood);animated.flood=flood
  const door=new THREE.Mesh(new THREE.BoxGeometry(3.6,4.8,.45),mat(0x232326,.6,.75,0x6d48ff,.65));door.position.set(0,2.4,94);tunnel.add(door);animated.door=door
  const ramp=new THREE.Mesh(new THREE.BoxGeometry(9,.55,42),mat(0x1d1d22,.85,.1));ramp.position.set(-57,-3.5,-55);ramp.rotation.x=-.14;root.add(ramp)

  const justice=new THREE.Group();justice.position.set(64,0,-48);root.add(justice);const stone=mat(0xb8b1a4,.9),glass=mat(0x7690a2,.12,.45,0,0,true,.5);const court=new THREE.Mesh(new THREE.BoxGeometry(36,18,22),stone);court.position.y=9;justice.add(court);for(let x=-12;x<=12;x+=6){const col=new THREE.Mesh(new THREE.CylinderGeometry(.6,.75,10,10),stone);col.position.set(x,5,11.2);justice.add(col)}const entry=new THREE.Mesh(new THREE.BoxGeometry(10,6,.3),glass);entry.position.set(0,3.5,11.2);justice.add(entry);for(let i=0;i<8;i++){const p=person([0x274c77,0x7d4e57,0x556b2f][i%3]);p.position.set(-12+(i%4)*8,0,16+Math.floor(i/4)*4);justice.add(p);animated.courtPeople.push(p)}

  const park=new THREE.Group();park.position.set(42,0,58);root.add(park);const plaza=new THREE.Mesh(new THREE.BoxGeometry(48,.3,34),mat(0x777b80,.95));plaza.position.y=.15;park.add(plaza);const rink=new THREE.Mesh(new THREE.CylinderGeometry(13,13,.2,32),mat(0xbfe7ff,.12,.05,0x7ec8ff,.25,true,.88));rink.position.y=.25;park.add(rink);const reflective=new THREE.Mesh(new THREE.SphereGeometry(4.4,24,16),mat(0xbec7cf,.12,.95));reflective.scale.set(1.45,.65,1);reflective.position.set(-15,4.4,-5);park.add(reflective);for(let i=0;i<10;i++){const p=person([0xff6f9e,0x65d8ff,0xffcf67,0x75e08e][i%4]);const a=i/10*Math.PI*2;p.position.set(Math.cos(a)*9,0,Math.sin(a)*9);park.add(p);p.userData.phase=a;animated.skaters.push(p)}

  const lake=new THREE.Mesh(new THREE.PlaneGeometry(190,150),mat(0x174d74,.2,.15,0x0c3555,.2,true,.84));lake.rotation.x=-Math.PI/2;lake.position.set(0,-.05,120);root.add(lake);const trail=new THREE.Mesh(new THREE.BoxGeometry(170,.2,7),mat(0x4b4d51,.88));trail.position.set(0,.12,82);root.add(trail);for(let i=0;i<14;i++){const p=person([0x394867,0x7a5548,0x4d6847,0x825d90][i%4]);p.position.set(-72+i*11,0,78+(i%2)*5);root.add(p);p.userData.phase=i*.7;animated.lakePeople.push(p)}

  const train=new THREE.Group();train.position.set(-10,2,-28);root.add(train);for(let i=0;i<3;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(5.5,3,2.7),mat(0xc5c9cc,.55,.3));c.position.x=i*6;train.add(c);const stripe=new THREE.Mesh(new THREE.BoxGeometry(5,.3,.08),mat(0xc60c30,.45,.2));stripe.position.set(i*6,0,-1.4);train.add(stripe)}animated.train=train

  const chrono=new THREE.Group();chrono.position.set(-68,-6,-18);const ring=new THREE.Mesh(new THREE.TorusGeometry(3.2,.25,10,32),mat(0x8c63ff,.25,.75,0x6d48ff,2));ring.rotation.x=Math.PI/2;chrono.add(ring);root.add(chrono)

  triggers.push(
    {id:'underground-entry',center:new THREE.Vector3(-72,0,-62),radius:10,event:'tryamm:physical-zone-enter',detail:{zone:'fictional-underground',mission:'freight-ghost-line'}},
    {id:'flood-memory',center:new THREE.Vector3(-72,-7,10),radius:10,event:'tryamm:temporal-echo-available',detail:{era:'1992',mission:'flood-1992-time'}},
    {id:'chrono-door',center:new THREE.Vector3(-72,-7,32),radius:8,event:'tryamm:secret-door-near',detail:{id:'chrono-archive'}},
    {id:'county-court-public',center:new THREE.Vector3(64,0,-30),radius:14,event:'tryamm:justice-public-zone',detail:{mission:'county-court-run',publicFacing:true}},
    {id:'millennium-rink',center:new THREE.Vector3(42,0,58),radius:22,event:'tryamm:physical-zone-enter',detail:{zone:'millennium-park-inspired',mission:'millennium-rink-time-trial'}},
    {id:'lakefront-mission',center:new THREE.Vector3(0,0,82),radius:18,event:'tryamm:battle-mode-select',detail:{mode:'lakefront-storm',zone:'lakefront'}},
    {id:'district-rush',center:new THREE.Vector3(0,0,0),radius:18,event:'tryamm:battle-mode-select',detail:{mode:'district-rush',zone:'loop'}},
    {id:'chrono-clash',center:new THREE.Vector3(-68,-6,-18),radius:7,event:'tryamm:battle-mode-select',detail:{mode:'chrono-clash',zone:'temporal-portal'}}
  )

  const update=(player:THREE.Vector3)=>{for(const t of triggers){const d=player.distanceTo(t.center);if(d<=t.radius){if(!fired.has(t.id)){fired.add(t.id);window.dispatchEvent(new CustomEvent(t.event,{detail:{...t.detail,triggerId:t.id,position:{x:t.center.x,y:t.center.y,z:t.center.z}}}))}}else if(d>t.radius*1.45)fired.delete(t.id)}}
  const tick=(time:number)=>{const t=time*.001;if(animated.flood){animated.flood.position.y=.08+Math.max(0,Math.sin(t*.35))*1.6;animated.flood.material instanceof THREE.MeshStandardMaterial&&(animated.flood.material.emissiveIntensity=.25+.15*Math.sin(t))}if(animated.door){animated.door.position.y=2.4+Math.max(0,Math.sin(t*.55))*2.8}animated.skaters.forEach((p,i)=>{const a=t*.35+p.userData.phase;p.position.x=Math.cos(a)*9;p.position.z=Math.sin(a)*9;p.rotation.y=-a});animated.lakePeople.forEach((p,i)=>{p.position.x=-78+((t*2.2+i*12)%156);p.position.z=78+(i%2)*5});animated.courtPeople.forEach((p,i)=>{p.rotation.y=Math.sin(t*.6+i)*.35});if(animated.train)animated.train.position.x=-75+((t*7)%150)}
  const dispose=()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const material=(m as any).material;if(Array.isArray(material))material.forEach((x:THREE.Material)=>x.dispose());else material?.dispose?.()})}
  return {group:root,triggers,update,tick,dispose}
}
