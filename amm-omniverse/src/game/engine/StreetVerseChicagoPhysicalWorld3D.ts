import * as THREE from 'three'

type Trigger={id:string;center:THREE.Vector3;radius:number;event:string;detail:Record<string,unknown>}
export type ChicagoPhysicalWorld3D={group:THREE.Group;triggers:Trigger[];update:(player:THREE.Vector3)=>void;tick:(time:number)=>void;dispose:()=>void}

const mat=(color:number,roughness=.8,metalness=0,emissive=0,emissiveIntensity=0,transparent=false,opacity=1)=>new THREE.MeshStandardMaterial({color,roughness,metalness,emissive:new THREE.Color(emissive),emissiveIntensity,transparent,opacity})
const person=(color:number)=>{const g=new THREE.Group();const b=new THREE.Mesh(new THREE.CapsuleGeometry(.26,.72,3,6),mat(color));b.position.y=1;const h=new THREE.Mesh(new THREE.SphereGeometry(.23,8,8),mat(0x8a5a44));h.position.y=1.72;g.add(b,h);return g}
function labelSprite(text:string){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;const ctx=canvas.getContext('2d')!;ctx.fillStyle='rgba(5,22,36,.94)';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#7ec8ff';ctx.lineWidth=5;ctx.strokeRect(4,4,504,120);ctx.fillStyle='#fff';ctx.font='700 48px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,64);const tex=new THREE.CanvasTexture(canvas);const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,transparent:true}));sprite.scale.set(8,2,1);return sprite}

export function addStreetVerseChicagoPhysicalWorld3D(scene:THREE.Scene):ChicagoPhysicalWorld3D{
  const root=new THREE.Group();root.name='streetverse-chicago-physical-world';scene.add(root)
  const triggers:Trigger[]=[];const fired=new Set<string>();const animated:{door?:THREE.Mesh;flood?:THREE.Mesh;skaters:THREE.Group[];lakePeople:THREE.Group[];courtPeople:THREE.Group[];train?:THREE.Group;loopTrain?:THREE.Group}={skaters:[],lakePeople:[],courtPeople:[]}

  // CHICAGO LOOP SKYLINE CANYON
  const skyline=new THREE.Group();skyline.name='chicago-loop-skyline';root.add(skyline)
  const towerDefs=[
    [-76,-64,18,58,18,0x253747],[-76,-22,20,42,18,0x33404d],[-76,26,18,52,20,0x273847],[-76,68,22,66,20,0x1f3140],
    [-30,-76,20,48,18,0x4a3e36],[-28,74,18,56,20,0x2f3b49],[28,-76,20,62,18,0x2e4050],[28,74,20,46,18,0x3e454d],
    [76,-66,18,72,20,0x20394a],[76,-22,20,50,18,0x384653],[76,28,18,64,20,0x263d4c],[76,68,22,54,18,0x3d4348],
    [-54,-54,15,36,15,0x4b3c34],[54,-54,15,44,15,0x2b3d4c],[-54,54,15,40,15,0x3e4247],[54,54,15,47,15,0x253a48]
  ] as const
  towerDefs.forEach(([x,z,w,h,d,color],i)=>{const g=new THREE.Group();const tower=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(color,.58,.18));tower.position.y=h/2;tower.castShadow=true;tower.receiveShadow=true;g.add(tower);for(let floor=4;floor<h-4;floor+=4){const band=new THREE.Mesh(new THREE.BoxGeometry(w+.08,.22,d+.08),mat(0x9ed8ff,.3,.2,0x4ca9e8,.35,true,.7));band.position.y=floor;g.add(band)}if(i%4===0){const crown=new THREE.Mesh(new THREE.ConeGeometry(w*.22,8,4),mat(0x182936,.4,.35));crown.position.y=h+4;crown.rotation.y=Math.PI/4;g.add(crown)}g.position.set(x,0,z);skyline.add(g)})

  // CHICAGO RIVER + MOVABLE-STYLE BRIDGES
  const riverMat=mat(0x176a77,.18,.12,0x0a4556,.25,true,.9)
  const river=new THREE.Mesh(new THREE.PlaneGeometry(190,16),riverMat);river.rotation.x=-Math.PI/2;river.position.set(0,.03,-12);river.name='chicago-river';root.add(river)
  for(const x of [-48,0,48]){const bridge=new THREE.Group();bridge.position.set(x,0,-12);const deck=new THREE.Mesh(new THREE.BoxGeometry(18,.55,11),mat(0x555d63,.72,.42));deck.position.y=.48;bridge.add(deck);for(const side of [-1,1]){const rail=new THREE.Mesh(new THREE.BoxGeometry(18,.8,.18),mat(0x2f3b43,.48,.62));rail.position.set(0,1,side*5.2);bridge.add(rail)}for(const sx of [-7,7])for(const sz of [-4.5,4.5]){const post=new THREE.Mesh(new THREE.BoxGeometry(.45,3,.45),mat(0x3b454c,.55,.58));post.position.set(sx,1.5,sz);bridge.add(post)}root.add(bridge)}

  // ELEVATED LOOP TRACK + STRUCTURE
  const elevated=new THREE.Group();elevated.name='chicago-elevated-loop';root.add(elevated)
  const steel=mat(0x353b42,.5,.72),track=mat(0x22272c,.45,.85)
  const segments=[{x:0,z:-38,w:92,d:1.1},{x:0,z:38,w:92,d:1.1},{x:-46,z:0,w:1.1,d:76},{x:46,z:0,w:1.1,d:76}]
  segments.forEach(s=>{const beam=new THREE.Mesh(new THREE.BoxGeometry(s.w,.45,s.d),track);beam.position.set(s.x,5.2,s.z);elevated.add(beam)})
  for(let x=-44;x<=44;x+=11)for(const z of [-38,38]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,5,.5),steel);p.position.set(x,2.5,z);elevated.add(p)}
  for(let z=-33;z<=33;z+=11)for(const x of [-46,46]){const p=new THREE.Mesh(new THREE.BoxGeometry(.5,5,.5),steel);p.position.set(x,2.5,z);elevated.add(p)}
  const loopTrain=new THREE.Group();for(let i=0;i<2;i++){const c=new THREE.Mesh(new THREE.BoxGeometry(5.2,2.7,2.5),mat(0xbcc2c7,.52,.28));c.position.x=i*5.8;loopTrain.add(c);const stripe=new THREE.Mesh(new THREE.BoxGeometry(4.8,.28,.08),mat(0x00a1de,.4,.28));stripe.position.set(i*5.8,0,-1.29);loopTrain.add(stripe)}loopTrain.position.set(-40,6.7,-38);elevated.add(loopTrain);animated.loopTrain=loopTrain

  // STREET IDENTITY
  const streets=[['STATE ST',-8,-31],['WABASH AVE',18,-31],['MADISON ST',-38,8],['ROOSEVELT RD',-38,48],['LAKE SHORE',48,70]] as const
  streets.forEach(([name,x,z],i)=>{const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.1,3.6,8),mat(0x40474e,.55,.65));pole.position.set(x,1.8,z);root.add(pole);const sign=labelSprite(name);sign.position.set(x,3.9,z);sign.scale.set(i===4?9:7.2,1.8,1);root.add(sign)})
  const loopSign=labelSprite('THE LOOP • STREETVERSE CHICAGO');loopSign.position.set(0,9,-2);loopSign.scale.set(14,3.2,1);root.add(loopSign)

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
    {id:'river-run',center:new THREE.Vector3(0,0,-12),radius:16,event:'tryamm:physical-zone-enter',detail:{zone:'chicago-river',mission:'river-bridge-run'}},
    {id:'elevated-loop',center:new THREE.Vector3(0,0,-38),radius:14,event:'tryamm:physical-zone-enter',detail:{zone:'elevated-loop',mission:'l-train-rush'}},
    {id:'chrono-clash',center:new THREE.Vector3(-68,-6,-18),radius:7,event:'tryamm:battle-mode-select',detail:{mode:'chrono-clash',zone:'temporal-portal'}}
  )

  const update=(player:THREE.Vector3)=>{for(const t of triggers){const d=player.distanceTo(t.center);if(d<=t.radius){if(!fired.has(t.id)){fired.add(t.id);window.dispatchEvent(new CustomEvent(t.event,{detail:{...t.detail,triggerId:t.id,position:{x:t.center.x,y:t.center.y,z:t.center.z}}}))}}else if(d>t.radius*1.45)fired.delete(t.id)}}
  const tick=(time:number)=>{const t=time*.001;if(animated.flood){animated.flood.position.y=.08+Math.max(0,Math.sin(t*.35))*1.6;animated.flood.material instanceof THREE.MeshStandardMaterial&&(animated.flood.material.emissiveIntensity=.25+.15*Math.sin(t))}if(animated.door){animated.door.position.y=2.4+Math.max(0,Math.sin(t*.55))*2.8}animated.skaters.forEach((p,i)=>{const a=t*.35+p.userData.phase;p.position.x=Math.cos(a)*9;p.position.z=Math.sin(a)*9;p.rotation.y=-a});animated.lakePeople.forEach((p,i)=>{p.position.x=-78+((t*2.2+i*12)%156);p.position.z=78+(i%2)*5});animated.courtPeople.forEach((p,i)=>{p.rotation.y=Math.sin(t*.6+i)*.35});if(animated.train)animated.train.position.x=-75+((t*7)%150);if(animated.loopTrain){const phase=(t*8)%336;if(phase<92){animated.loopTrain.position.set(-46+phase,6.7,-38);animated.loopTrain.rotation.y=0}else if(phase<168){animated.loopTrain.position.set(46,6.7,-38+(phase-92));animated.loopTrain.rotation.y=-Math.PI/2}else if(phase<260){animated.loopTrain.position.set(46-(phase-168),6.7,38);animated.loopTrain.rotation.y=Math.PI}else{animated.loopTrain.position.set(-46,6.7,38-(phase-260));animated.loopTrain.rotation.y=Math.PI/2}}}
  const dispose=()=>{scene.remove(root);root.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const material=(m as any).material;if(Array.isArray(material))material.forEach((x:THREE.Material)=>x.dispose());else material?.dispose?.();if((o as THREE.Sprite).material instanceof THREE.SpriteMaterial){const sm=(o as THREE.Sprite).material as THREE.SpriteMaterial;sm.map?.dispose();sm.dispose()}})}
  return {group:root,triggers,update,tick,dispose}
}