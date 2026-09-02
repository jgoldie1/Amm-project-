import { useEffect,useRef,useState } from 'react'
import * as THREE from 'three'
import {appendStreetVerseRevenue,getStreetVerseRevenueSummary} from '../runtime/StreetVerseInternalChain'

const SAVE='tryamm.streetverse.omniworld.v1'
const MISSIONS=[
  {id:'market',label:'Marketplace Delivery',x:48,z:-28,reward:500},
  {id:'studio',label:'Creator Studio Session',x:-44,z:-32,reward:600},
  {id:'marina',label:'Marina Charter',x:55,z:72,reward:750},
  {id:'ads',label:'Holo Ads Campaign',x:-45,z:38,reward:650},
  {id:'network',label:'All American Network',x:38,z:36,reward:700},
]
const BUSINESSES=[
  {id:'marketplace',label:'All American Marketplace',x:48,z:-28,color:0x4fe3ff},
  {id:'creator-studio',label:'Creator Studio',x:-44,z:-32,color:0xff6fae},
  {id:'holo-ads',label:'Holo Ads',x:-45,z:38,color:0xffd75c},
  {id:'network',label:'All American Network',x:38,z:36,color:0x7ef29a},
]
const BASKETBALL_COURTS=[
  {id:'south-loop',name:'South Loop Holo Court',x:-24,z:18,color:0xf3a53b},
  {id:'lakefront',name:'Lakefront Lights',x:62,z:46,color:0x4fe3ff},
  {id:'west-side',name:'West Side Legacy Court',x:-68,z:-22,color:0xff6fae},
  {id:'skyline',name:'Skyline Championship Arena',x:18,z:-74,color:0xa68bff},
]
const NPC_NEAR_SPAWN:[number,number][]=[[-13,58],[-7,52],[7,55],[13,61],[-19,47],[19,49],[-4,67],[9,69]]

function mat(color:number,metal=.1,rough=.65){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough})}
function load(){try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return {}}}
function glow(color:number,opacity=.8){return new THREE.MeshBasicMaterial({color,transparent:true,opacity,toneMapped:false})}
function worldToCourt(court:THREE.Group,p:THREE.Vector3){return court.worldToLocal(p.clone())}

function vehicle(color:number,style:'sedan'|'gt'|'supercar'|'suv'|'limousine'){
  const g=new THREE.Group()
  const dims=style==='limousine'?[7.2,1.25,2.25]:style==='suv'?[5.3,1.65,2.35]:style==='supercar'?[4.7,.9,2.15]:[4.9,1.1,2.2]
  const shell=new THREE.Mesh(new THREE.BoxGeometry(dims[0],dims[1],dims[2]),mat(color,.82,.18));shell.position.y=.9;shell.castShadow=true;g.add(shell)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(style==='limousine'?4.7:2.6,style==='suv'?1.05:.8,dims[2]*.86),new THREE.MeshStandardMaterial({color:0x172a3a,metalness:.75,roughness:.08,transparent:true,opacity:.88}));cabin.position.set(style==='supercar'?.25:-.15,1.65,0);g.add(cabin)
  if(style==='supercar'){const nose=new THREE.Mesh(new THREE.BoxGeometry(1.6,.28,2.05),mat(color,.9,.12));nose.position.set(2.65,.72,0);g.add(nose);const spoiler=new THREE.Mesh(new THREE.BoxGeometry(.18,.18,2.3),mat(0x111318,.8,.18));spoiler.position.set(-2.2,1.45,0);g.add(spoiler)}
  for(const sx of [-dims[0]*.31,dims[0]*.31])for(const sz of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.34,16),mat(0x08090c,.15,.78));w.rotation.x=Math.PI/2;w.position.set(sx,.45,sz*dims[2]*.48);g.add(w);const rim=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.36,14),mat(0xaab5c1,.85,.2));rim.rotation.x=Math.PI/2;rim.position.copy(w.position);g.add(rim)}
  for(const z of [-.63,.63]){const head=new THREE.Mesh(new THREE.BoxGeometry(.08,.22,.35),glow(0xe9f7ff,1));head.position.set(dims[0]/2+.03,.88,z);g.add(head);const tail=new THREE.Mesh(new THREE.BoxGeometry(.08,.2,.32),glow(0xff243c,.95));tail.position.set(-dims[0]/2-.03,.86,z);g.add(tail)}
  return g
}

function boat(color:number,size='sport'){
  const g=new THREE.Group();const l=size==='yacht'?10:6.5
  const hull=new THREE.Mesh(new THREE.BoxGeometry(l,1,2.5),mat(color,.5,.22));hull.position.y=.55;g.add(hull)
  const bow=new THREE.Mesh(new THREE.ConeGeometry(1.25,2.8,4),mat(color,.5,.22));bow.rotation.z=-Math.PI/2;bow.position.set(l/2+1.25,.55,0);g.add(bow)
  const deck=new THREE.Mesh(new THREE.BoxGeometry(l*.56,.5,2),mat(0xf4f0e6,.28,.28));deck.position.set(-.4,1.25,0);g.add(deck)
  const glass=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,1.65),new THREE.MeshStandardMaterial({color:0x5ca6cb,metalness:.7,roughness:.08,transparent:true,opacity:.72}));glass.position.set(-.8,2,0);g.add(glass)
  if(size==='yacht'){const upper=new THREE.Mesh(new THREE.BoxGeometry(3.2,.65,1.7),mat(0xffffff,.35,.24));upper.position.set(-1.3,2.85,0);g.add(upper)}
  return g
}

function quadruped(color:number,scale=1){
  const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(1.5*scale,.7*scale,.65*scale),mat(color));body.position.y=.85*scale;g.add(body)
  const head=new THREE.Mesh(new THREE.BoxGeometry(.6*scale,.6*scale,.55*scale),mat(color));head.position.set(.95*scale,1.1*scale,0);g.add(head)
  for(const x of [-.55,.55])for(const z of [-.22,.22]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16*scale,.65*scale,.16*scale),mat(color));leg.position.set(x,.35*scale,z);g.add(leg)}
  return g
}

function person(color:number,skin:number){
  const g=new THREE.Group()
  const shirt=new THREE.MeshStandardMaterial({color,roughness:.42,metalness:.12,emissive:new THREE.Color(color),emissiveIntensity:.08})
  const skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.64})
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.58,1.45,6,12),shirt);torso.position.y=1.85;torso.castShadow=true;torso.name='torso';g.add(torso)
  const jacket=new THREE.Mesh(new THREE.BoxGeometry(1.22,.62,.7),new THREE.MeshStandardMaterial({color:0x121a24,roughness:.4,metalness:.18}));jacket.position.set(0,2.13,-.02);g.add(jacket)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.5,18,14),skinMat);head.position.y=3.35;head.castShadow=true;g.add(head)
  const hair=new THREE.Mesh(new THREE.SphereGeometry(.515,14,10,0,Math.PI*2,0,Math.PI*.52),mat(0x111217,0,.88));hair.position.y=3.45;g.add(hair)
  for(const side of [-1,1]){
    const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.14,.82,4,8),skinMat);arm.name=side<0?'armL':'armR';arm.position.set(side*.72,1.9,0);arm.rotation.z=side*.1;g.add(arm)
    const leg=new THREE.Mesh(new THREE.BoxGeometry(.34,1.35,.38),mat(0x20242b,0,.72));leg.name=side<0?'legL':'legR';leg.position.set(side*.23,.68,0);g.add(leg)
    const shoe=new THREE.Mesh(new THREE.BoxGeometry(.38,.18,.62),mat(0x07090c,.15,.62));shoe.position.set(side*.23,.08,.12);g.add(shoe)
  }
  const marker=new THREE.Mesh(new THREE.TorusGeometry(.62,.055,8,26),glow(0x73e7ff,.72));marker.rotation.x=Math.PI/2;marker.position.y=4.35;g.add(marker)
  g.scale.setScalar(1.18)
  return g
}

function aiSpirit(index:number){
  const palette=[0x4fe3ff,0xa68bff,0xff6fae,0x76d98b]
  const c=palette[index%palette.length]
  const g=person(c,[0xba7b52,0xd3a079,0x925f3f,0x6f4028][index%4])
  g.traverse(node=>{if(node instanceof THREE.Mesh&&node.material instanceof THREE.MeshStandardMaterial){node.material=node.material.clone();node.material.transparent=true;node.material.opacity=.86;node.material.emissive=new THREE.Color(c);node.material.emissiveIntensity=.28}})
  for(const y of [.08,2.1,4.2]){const aura=new THREE.Mesh(new THREE.TorusGeometry(1.05-y*.06,.055,8,32),glow(c,.62));aura.rotation.x=Math.PI/2;aura.position.y=y;g.add(aura)}
  return g
}

function basketballCourt(color:number){
  const g=new THREE.Group();const floor=new THREE.Mesh(new THREE.BoxGeometry(26,.16,15),new THREE.MeshStandardMaterial({color:0x182331,roughness:.58,metalness:.08}));floor.position.y=.11;floor.receiveShadow=true;g.add(floor)
  const paint=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.72,toneMapped:false});const line=(w:number,d:number,x:number,z:number)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,.035,d),paint);m.position.set(x,.21,z);g.add(m)}
  line(25,.12,0,-7);line(25,.12,0,7);line(.12,14,12.4,0);line(.12,14,-12.4,0);line(.12,14,0,0)
  const center=new THREE.Mesh(new THREE.RingGeometry(1.8,1.94,40),paint);center.rotation.x=-Math.PI/2;center.position.y=.22;g.add(center)
  for(const side of [-1,1]){const key=new THREE.Mesh(new THREE.BoxGeometry(5,.028,6),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.13,toneMapped:false}));key.position.set(side*9.8,.225,0);g.add(key);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.12,.16,4.2,10),mat(0x252b33,.7,.28));pole.position.set(side*11.3,2.1,0);g.add(pole);const board=new THREE.Mesh(new THREE.BoxGeometry(.18,3.6,5.2),new THREE.MeshPhysicalMaterial({color:0xdaf5ff,transparent:true,opacity:.56,roughness:.12,metalness:.08}));board.position.set(side*10.75,4.5,0);g.add(board);const rim=new THREE.Mesh(new THREE.TorusGeometry(.75,.09,10,32),glow(0xff6a24,.95));rim.rotation.y=Math.PI/2;rim.position.set(side*10.05,3.6,0);g.add(rim);const net=new THREE.Mesh(new THREE.CylinderGeometry(.72,.42,.9,16,1,true),new THREE.MeshBasicMaterial({color:0xf4f4f4,wireframe:true,transparent:true,opacity:.38}));net.position.set(side*10.05,3.12,0);g.add(net)}
  for(const x of [-11,11])for(const z of [-6.2,6.2]){const lamp=new THREE.PointLight(color,1.5,22,2);lamp.position.set(x,7,z);g.add(lamp);const bulb=new THREE.Mesh(new THREE.SphereGeometry(.13,8,6),glow(color,1));bulb.position.copy(lamp.position);g.add(bulb)}
  const ball=new THREE.Mesh(new THREE.SphereGeometry(.42,18,14),new THREE.MeshStandardMaterial({color:0xd86c20,roughness:.62,metalness:.02}));ball.position.set(0,.62,0);ball.castShadow=true;ball.userData.baseY=.62;ball.userData.holder='FREE';g.add(ball);g.userData.ball=ball
  return g
}

function addStreetLight(scene:THREE.Scene,x:number,z:number,color=0xffd7a0){
  const pole=new THREE.Mesh(new THREE.CylinderGeometry(.08,.12,5.5,8),mat(0x151a21,.7,.34));pole.position.set(x,2.75,z);scene.add(pole)
  const lamp=new THREE.Mesh(new THREE.SphereGeometry(.18,10,8),glow(color,1));lamp.position.set(x,5.45,z);scene.add(lamp)
  const light=new THREE.PointLight(color,1.8,18,2);light.position.set(x,5,z);scene.add(light)
}

export default function StreetVerseOmniWorld({onClose}:{onClose:()=>void}){
  const mount=useRef<HTMLDivElement|null>(null)
  const input=useRef({u:false,d:false,l:false,r:false})
  const action=useRef(false)
  const businessRef=useRef<string|null>(null)
  const visitedRef=useRef<string[]>(load().visited||[])
  const [msg,setMsg]=useState('StreetVerse cinematic district online. Explore, drive, meet residents, interact with AI Spirits and create a Reel.')
  const [summary,setSummary]=useState(()=>getStreetVerseRevenueSummary())
  const [visited,setVisited]=useState<string[]>(visitedRef.current)
  const [isDriving,setIsDriving]=useState(false)
  const [business,setBusiness]=useState<string|null>(null)

  useEffect(()=>{visitedRef.current=visited},[visited])

  useEffect(()=>{
    const root=mount.current;if(!root)return
    const saved=load(),scene=new THREE.Scene();scene.background=new THREE.Color(0x030813);scene.fog=new THREE.FogExp2(0x07111d,.0032)
    const camera=new THREE.PerspectiveCamera(60,1,.1,900)
    const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;root.appendChild(renderer.domElement)
    scene.add(new THREE.HemisphereLight(0x9edfff,0x120d1c,2.25));const moon=new THREE.DirectionalLight(0xb8d8ff,2.7);moon.position.set(-70,100,50);moon.castShadow=true;scene.add(moon)
    const warm=new THREE.DirectionalLight(0xff9b63,1.25);warm.position.set(100,55,-80);scene.add(warm)

    const starsGeo=new THREE.BufferGeometry();const stars:number[]=[];for(let i=0;i<650;i++){const a=Math.random()*Math.PI*2,r=130+Math.random()*230,y=70+Math.random()*140;stars.push(Math.cos(a)*r,y,Math.sin(a)*r)}starsGeo.setAttribute('position',new THREE.Float32BufferAttribute(stars,3));scene.add(new THREE.Points(starsGeo,new THREE.PointsMaterial({color:0xbfe8ff,size:.55,sizeAttenuation:true,transparent:true,opacity:.86,toneMapped:false})))
    const skylineGlow=new THREE.Mesh(new THREE.RingGeometry(125,190,96),glow(0x173a71,.16));skylineGlow.rotation.x=-Math.PI/2;skylineGlow.position.y=.02;scene.add(skylineGlow)

    const ground=new THREE.Mesh(new THREE.PlaneGeometry(260,220),mat(0x16291d,0,.88));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
    const water=new THREE.Mesh(new THREE.PlaneGeometry(260,52),new THREE.MeshPhysicalMaterial({color:0x0a3c63,metalness:.18,roughness:.12,transparent:true,opacity:.94,clearcoat:.8,clearcoatRoughness:.12}));water.rotation.x=-Math.PI/2;water.position.set(0,.05,86);scene.add(water)
    const road=mat(0x111720,.06,.8),walk=mat(0x696f76,0,.78)
    for(const z of [-55,-5,45]){
      const r=new THREE.Mesh(new THREE.BoxGeometry(260,.1,15),road);r.position.set(0,.05,z);r.receiveShadow=true;scene.add(r)
      for(const dz of [-9,9]){const s=new THREE.Mesh(new THREE.BoxGeometry(260,.18,3),walk);s.position.set(0,.11,z+dz);s.receiveShadow=true;scene.add(s)}
      for(let x=-118;x<=118;x+=12){const line=new THREE.Mesh(new THREE.BoxGeometry(6,.025,.15),glow(0xffd75c,.78));line.position.set(x,.115,z);scene.add(line)}
    }
    for(const x of [-65,-15,35,85]){const r=new THREE.Mesh(new THREE.BoxGeometry(15,.1,170),road);r.position.set(x,.05,5);r.receiveShadow=true;scene.add(r);for(let z=-72;z<=72;z+=12){const line=new THREE.Mesh(new THREE.BoxGeometry(.15,.025,6),glow(0xf5f7fa,.7));line.position.set(x,.115,z);scene.add(line)}}
    for(const x of [-112,-82,-28,22,72,112])for(const z of [-68,-18,32,68])addStreetLight(scene,x,z,(x+z)%2?0xffc98a:0xb7e9ff)

    const buildings=[[-98,-72,22,28,20],[-98,-28,18,22,18],[-98,20,24,38,19],[-50,-72,19,24,18],[-50,-22,23,34,22],[-50,22,18,20,17],[5,-72,24,42,20],[5,-25,18,25,18],[5,22,22,36,20],[58,-72,20,30,19],[58,-25,22,44,20],[58,20,19,27,18],[105,-70,18,24,17],[105,-22,22,35,19],[105,20,20,31,18]]
    buildings.forEach((b,i)=>{
      const [x,z,w,h,d]=b;const buildingMat=new THREE.MeshStandardMaterial({color:[0x243b52,0x473044,0x304b3c,0x4c382b,0x244753][i%5],metalness:.28,roughness:.46});const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMat);m.position.set(x,h/2,z);m.castShadow=true;m.receiveShadow=true;scene.add(m)
      for(let y=4;y<h-2;y+=3.5)for(let wx=-w*.34;wx<=w*.34;wx+=3.4){if((Math.round(y+wx+i)&3)===0)continue;const light=new THREE.Mesh(new THREE.PlaneGeometry(1.6,.75),glow((i+Math.round(wx))%2?0xffc36b:0x63dfff,.65));light.position.set(x+wx,y,z+d/2+.015);scene.add(light)}
      if(i%3===0){const roof=new THREE.Mesh(new THREE.BoxGeometry(w*.65,.45,d*.65),mat(0x10151d,.55,.3));roof.position.set(x,h+.25,z);scene.add(roof)}
    })

    const courtGroups=new Map<string,THREE.Group>(),courtRivals=new Map<string,THREE.Group[]>(),courtTeammates=new Map<string,THREE.Group[]>()
    BASKETBALL_COURTS.forEach((court,ci)=>{
      const cg=basketballCourt(court.color);cg.position.set(court.x,.02,court.z);cg.rotation.y=ci%2?Math.PI/2:0;scene.add(cg);courtGroups.set(court.id,cg)
      const teammates:THREE.Group[]=[];for(let i=0;i<4;i++){const t=person([0x55e4ff,0x43d18d,0xf1c75b,0xa68bff][i],[0xba7b52,0x925f3f,0xd3a079,0x6f4028][i]);t.scale.setScalar(.92);t.position.set(court.x-4+i*2.6,0,court.z+4.2);t.userData.baseX=t.position.x;t.userData.baseZ=t.position.z;t.userData.targetX=t.position.x;t.userData.targetZ=t.position.z;t.userData.team='home';t.userData.index=i;scene.add(t);teammates.push(t)}courtTeammates.set(court.id,teammates)
      const rivals:THREE.Group[]=[];for(let i=0;i<5;i++){const rival=person([0xd83a3a,0x5f6bff,0xf2d05e,0x8a55d6][ci],[0x6f4028,0x925f3f,0xba7b52,0xd3a079,0x6f4028][i]);rival.scale.setScalar(.93);rival.position.set(court.x-5+i*2.5,0,court.z-3.2+(i%2)*1.2);rival.userData.baseX=rival.position.x;rival.userData.baseZ=rival.position.z;rival.userData.targetX=rival.position.x;rival.userData.targetZ=rival.position.z;rival.userData.court=ci;rival.userData.assignment=i;scene.add(rival);rivals.push(rival)}courtRivals.set(court.id,rivals)
    })

    const avatar=person(0x55e4ff,0xba7b52);avatar.scale.setScalar(1.25);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar)
    const cars:THREE.Group[]=[];const specs:[number,'sedan'|'gt'|'supercar'|'suv'|'limousine'][]=[[0xe33d3d,'sedan'],[0x111318,'gt'],[0xf5f5f0,'supercar'],[0x275aa8,'suv'],[0xd4b24d,'gt'],[0x681b8f,'supercar'],[0x212121,'limousine'],[0x0f7c5f,'suv'],[0xb92c2c,'gt'],[0xcfcfd2,'sedan'],[0x102a58,'supercar'],[0x7f5a25,'gt']]
    specs.forEach((s,i)=>{const c=vehicle(s[0],s[1]);c.position.set(-118+i*21,.05,i%2?-55:45);scene.add(c);cars.push(c)})

    const npcs:THREE.Group[]=[]
    for(let i=0;i<18;i++){
      const n=person([0x4fe3ff,0xff6fae,0xf3c85b,0x76d98b,0xa68bff][i%5],[0x6f4028,0x925f3f,0xba7b52,0xd3a079][i%4])
      const near=NPC_NEAR_SPAWN[i];const bx=near?.[0]??(-108+(i*27)%216),bz=near?.[1]??(-72+(i*19)%122)
      n.position.set(bx,0,bz);n.userData.baseX=bx;n.userData.baseZ=bz;scene.add(n);npcs.push(n)
    }
    const spirits:THREE.Group[]=[]
    for(let i=0;i<6;i++){const s=aiSpirit(i);const a=i/6*Math.PI*2;s.position.set(Math.cos(a)*18,0,58+Math.sin(a)*12);s.userData.baseX=s.position.x;s.userData.baseZ=s.position.z;scene.add(s);spirits.push(s)}

    const businessMarkers=new Map<string,THREE.Group>();BUSINESSES.forEach(b=>{const g=new THREE.Group();const door=new THREE.Mesh(new THREE.BoxGeometry(3.2,5.2,.35),new THREE.MeshStandardMaterial({color:b.color,metalness:.55,roughness:.22,emissive:new THREE.Color(b.color),emissiveIntensity:.22}));door.position.y=2.6;g.add(door);for(const y of [.3,2.9]){const halo=new THREE.Mesh(new THREE.TorusGeometry(y<1?2.4:1.7,.12,8,34),glow(b.color,.88));halo.rotation.x=Math.PI/2;halo.position.y=y;g.add(halo)}g.position.set(b.x,0,b.z);scene.add(g);businessMarkers.set(b.id,g)})
    const boats:THREE.Group[]=[];[[0xffffff,'yacht'],[0xd83a3a,'sport'],[0x18355f,'sport'],[0xe5c54b,'yacht']].forEach((s:any[],i)=>{const b=boat(s[0],s[1]);b.position.set(-85+i*55,.12,87+i%2*8);scene.add(b);boats.push(b)})
    const animals:THREE.Group[]=[];[[0x8a5b35,1],[0x2c2d31,.85],[0xc99a68,.95],[0x6a4b2d,1.5],[0xe5d4b8,1.25],[0x4c3a29,1.7]].forEach((a,i)=>{const q=quadruped(a[0],a[1] as number);q.position.set(-90+i*33,0,62-(i%2)*14);scene.add(q);animals.push(q)})
    const birds:THREE.Mesh[]=[];for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.22,.65,4),mat(0xdce8ef));b.rotation.z=Math.PI/2;scene.add(b);birds.push(b)}
    for(let i=0;i<42;i++){const t=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,3,8),mat(0x69482f));tr.position.y=1.5;t.add(tr);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,10,8),mat(i%3?0x267144:0x3c8d55));crown.position.y=3.8;t.add(crown);t.position.set(-118+(i*31)%236,0,-92+(i*17)%155);scene.add(t)}
    const beacons=new Map<string,THREE.Group>();MISSIONS.forEach(m=>{const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.16,10,48),glow(0xffd75c,.95));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.25,.85,12,18,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.14,side:THREE.DoubleSide,toneMapped:false}));beam.position.y=6;g.add(beam);g.position.set(m.x,0,m.z);scene.add(g);beacons.set(m.id,g)})

    const playerPose=(g:THREE.Group,kind:string)=>{g.userData.pose=kind;g.userData.poseAt=performance.now()}
    const handlerWorld=(courtId:string,holder:string)=>{if(holder==='YOU')return avatar.position.clone().add(new THREE.Vector3(.72,1.9,.35));const mates=courtTeammates.get(courtId)||[];const idx=Math.max(0,Number((courtGroups.get(courtId)?.userData.holderIndex)||0)%Math.max(1,mates.length));return (mates[idx]?.position||avatar.position).clone().add(new THREE.Vector3(.58,1.8,.3))}
    const onBasketballPossession=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||''),court=courtGroups.get(id);if(!court)return;const holder=String(d.holder||'YOU');court.userData.holder=holder;if(holder==='YOU')court.userData.holderIndex=-1;const ball=court.userData.ball as THREE.Mesh|undefined;if(ball){ball.userData.holder=holder;ball.userData.passAt=0}}
    const onBasketballPass=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||''),court=courtGroups.get(id);if(!court)return;const mates=courtTeammates.get(id)||[],ball=court.userData.ball as THREE.Mesh|undefined;if(!ball)return;const from=String(d.from||'YOU'),to=String(d.to||'YOU');if(to!=='YOU'){court.userData.holderIndex=((Number(court.userData.holderIndex)||-1)+1)%Math.max(1,mates.length)}const start=worldToCourt(court,handlerWorld(id,from));const end=worldToCourt(court,handlerWorld(id,to));ball.userData.passAt=performance.now();ball.userData.passFrom=start;ball.userData.passTo=end;ball.userData.holder=to;court.userData.holder=to}
    const onBasketballTactics=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||''),spacing=String(d.spacing||'balanced'),mates=courtTeammates.get(id)||[],rivals=courtRivals.get(id)||[],court=BASKETBALL_COURTS.find(c=>c.id===id);if(!court)return;const homeSets=spacing==='five-out'?[[-7,-5],[-3,5],[2,-5],[7,5]]:spacing==='pick-and-roll'?[[-2,1],[1,2],[6,-5],[7,5]]:[[-6,-4],[-1,4],[4,-3],[7,4]];mates.forEach((p,i)=>{const [ox,oz]=homeSets[i%homeSets.length];p.userData.targetX=court.x+ox;p.userData.targetZ=court.z+oz;p.userData.tacticAt=performance.now()});rivals.forEach((r,i)=>{const mark=i===0?avatar:mates[(i-1)%Math.max(1,mates.length)];r.userData.targetX=mark?.position.x??court.x;r.userData.targetZ=mark?.position.z??court.z;r.userData.assignment=i;r.userData.tacticAt=performance.now()})}
    const onBasketballBody=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||''),action=String(d.action||'jumper'),holder=String(d.holder||'YOU');if(holder==='YOU')playerPose(avatar,action);else{const mates=courtTeammates.get(id)||[],idx=Math.max(0,Number(courtGroups.get(id)?.userData.holderIndex)||0);if(mates[idx])playerPose(mates[idx],action)}}
    const onBasketballShot=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},court=courtGroups.get(String(d.court||''));if(!court)return;const ball=court.userData.ball as THREE.Mesh|undefined;if(!ball)return;ball.userData.holder='FREE';ball.userData.shotAt=performance.now();ball.userData.shotKind=String(d.kind||'jumper');ball.userData.made=Boolean(d.made);ball.userData.startX=ball.position.x;ball.userData.targetX=Boolean(d.made)?10.05:8.6;ball.userData.startZ=ball.position.z;ball.userData.targetZ=Boolean(d.made)?0:(Math.random()-.5)*3.2}
    const onBasketballDribble=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||'');const court=courtGroups.get(id);if(!court)return;const ball=court.userData.ball as THREE.Mesh|undefined;if(ball){ball.userData.dribbleAt=performance.now();ball.userData.dribbleMove=String(d.move||'dribble');ball.userData.holder=String(d.holder||'YOU')}}
    const onBasketballDefense=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{},id=String(d.court||'');(id?courtRivals.get(id):undefined)?.forEach(r=>{r.userData.defenseAt=performance.now()})}
    addEventListener('tryamm:basketball-possession',onBasketballPossession);addEventListener('tryamm:basketball-pass',onBasketballPass);addEventListener('tryamm:basketball-team-tactics',onBasketballTactics);addEventListener('tryamm:basketball-body-action',onBasketballBody);addEventListener('tryamm:basketball-shot',onBasketballShot);addEventListener('tryamm:basketball-dribble',onBasketballDribble);addEventListener('tryamm:basketball-defense',onBasketballDefense)

    const keys=new Set<string>();const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift','e'].includes(k)){e.preventDefault();if(k==='e'){if(!e.repeat)action.current=true}else keys.add(k)}};const ku=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());addEventListener('keydown',kd,{passive:false});addEventListener('keyup',ku)
    const resize=()=>{const w=root.clientWidth,h=Math.max(430,root.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(root);resize()
    const clock=new THREE.Clock();let elapsed=0,raf=0,lastSave=0,activeCar=-1,carSpeed=0
    const animatePose=(g:THREE.Group,dt:number)=>{const age=performance.now()-Number(g.userData.poseAt||0),kind=String(g.userData.pose||'');const armL=g.getObjectByName('armL'),armR=g.getObjectByName('armR'),torso=g.getObjectByName('torso');if(age<700&&kind){const t=Math.min(1,age/700),jump=kind==='dunk'?Math.sin(Math.PI*t)*1.35:kind==='layup'?Math.sin(Math.PI*t)*.72:Math.sin(Math.PI*t)*.42;g.position.y=jump;if(armL)armL.rotation.z=-.75;if(armR)armR.rotation.z=.75;if(torso)torso.rotation.x=kind==='dunk'?-.18:-.08}else{g.position.y=THREE.MathUtils.lerp(g.position.y,0,Math.min(1,dt*8));if(armL)armL.rotation.z=THREE.MathUtils.lerp(armL.rotation.z,-.1,.14);if(armR)armR.rotation.z=THREE.MathUtils.lerp(armR.rotation.z,.1,.14);if(torso)torso.rotation.x=THREE.MathUtils.lerp(torso.rotation.x,0,.14)}}
    const animate=()=>{
      const dt=Math.min(.033,clock.getDelta());elapsed+=dt;let dx=0,dz=0;const p=input.current
      if(keys.has('w')||keys.has('arrowup')||p.u)dz-=1;if(keys.has('s')||keys.has('arrowdown')||p.d)dz+=1;if(keys.has('a')||keys.has('arrowleft')||p.l)dx-=1;if(keys.has('d')||keys.has('arrowright')||p.r)dx+=1
      if(action.current){
        action.current=false
        if(activeCar>=0){const c=cars[activeCar];avatar.visible=true;avatar.position.set(THREE.MathUtils.clamp(c.position.x+Math.cos(c.rotation.y)*4,-122,122),0,THREE.MathUtils.clamp(c.position.z-Math.sin(c.rotation.y)*4,-95,72));activeCar=-1;carSpeed=0;setIsDriving(false);setMsg('Exited vehicle • cinematic district remains active.')}
        else if(businessRef.current){const label=businessRef.current;businessRef.current=null;setBusiness(null);setMsg(`Exited ${label} • continue exploring StreetVerse.`)}
        else{
          let nearestBusinessIndex=-1,nearestBusinessD=7;BUSINESSES.forEach((b,i)=>{const d=Math.hypot(avatar.position.x-b.x,avatar.position.z-b.z);if(d<nearestBusinessD){nearestBusinessIndex=i;nearestBusinessD=d}})
          if(nearestBusinessIndex>=0){const selected=BUSINESSES[nearestBusinessIndex];businessRef.current=selected.label;setBusiness(selected.label);setMsg(`Entered ${selected.label} interaction hub.`)}
          else{
            let nearestNpc=-1,nearestNpcD=5;npcs.forEach((n,i)=>{const d=Math.hypot(avatar.position.x-n.position.x,avatar.position.z-n.position.z);if(d<nearestNpcD){nearestNpc=i;nearestNpcD=d}})
            if(nearestNpc>=0)setMsg(`StreetVerse resident ${nearestNpc+1}: Welcome. Missions, creator businesses and events are active.`)
            else{
              let nearestSpirit=-1,nearestSpiritD=5;spirits.forEach((s,i)=>{const d=Math.hypot(avatar.position.x-s.position.x,avatar.position.z-s.position.z);if(d<nearestSpiritD){nearestSpirit=i;nearestSpiritD=d}})
              if(nearestSpirit>=0)setMsg(`AI Spirit ${nearestSpirit+1}: holographic guide skin online.`)
              else{let nearest=-1,nearestD=8;cars.forEach((c,i)=>{const d=Math.hypot(avatar.position.x-c.position.x,avatar.position.z-c.position.z);if(d<nearestD){nearest=i;nearestD=d}});if(nearest>=0){activeCar=nearest;carSpeed=0;avatar.visible=false;avatar.position.copy(cars[nearest].position);setIsDriving(true);setMsg('Vehicle entered • cinematic driving active.')}else{const court=BASKETBALL_COURTS.find(c=>Math.hypot(avatar.position.x-c.x,avatar.position.z-c.z)<11);if(court){setMsg(`${court.name} • basketball court active. Use the StreetVerse Basketball controls to start 1v1, 3v3, 5v5 or tournament play.`);window.dispatchEvent(new CustomEvent('tryamm:basketball-open',{detail:{court:court.id}}))}else setMsg('Move closer to a resident, AI Spirit, business portal, vehicle, or basketball court to interact.')}}
            }
          }
        }
      }
      if(activeCar>=0){const c=cars[activeCar];const throttle=((keys.has('w')||keys.has('arrowup')||p.u)?1:0)-((keys.has('s')||keys.has('arrowdown')||p.d)?1:0);const steer=((keys.has('a')||keys.has('arrowleft')||p.l)?1:0)-((keys.has('d')||keys.has('arrowright')||p.r)?1:0);const target=throttle*(keys.has('shift')?42:30);carSpeed=THREE.MathUtils.lerp(carSpeed,target,Math.min(1,dt*(throttle?3.8:2.4)));if(Math.abs(carSpeed)<.05)carSpeed=0;if(steer&&Math.abs(carSpeed)>.4)c.rotation.y+=steer*dt*1.45*Math.sign(carSpeed);c.position.x=THREE.MathUtils.clamp(c.position.x+Math.cos(c.rotation.y)*carSpeed*dt,-122,122);c.position.z=THREE.MathUtils.clamp(c.position.z-Math.sin(c.rotation.y)*carSpeed*dt,-92,72);avatar.position.set(c.position.x,0,c.position.z);avatar.rotation.y=c.rotation.y}
      else if(!businessRef.current&&(dx||dz)){const len=Math.hypot(dx,dz)||1;const speed=(keys.has('shift')?30:18)*dt;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x+dx/len*speed,-122,122);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z+dz/len*speed,-95,72);avatar.rotation.y=Math.atan2(dx,dz)}

      cars.forEach((c,i)=>{if(i===activeCar)return;const lane=i%2?45:-55;const dir=i%2?1:-1;c.position.x=dir*(-128+((elapsed*(11+i*.45)+i*19)%256));c.position.z=lane;c.rotation.y=dir>0?0:Math.PI})
      npcs.forEach((n,i)=>{n.position.x=n.userData.baseX+Math.sin(elapsed*.38+i)*2.2;n.position.z=n.userData.baseZ+Math.cos(elapsed*.31+i*.7)*1.4;n.rotation.y=Math.sin(elapsed*.4+i)})
      spirits.forEach((s,i)=>{s.position.x=s.userData.baseX+Math.sin(elapsed*.5+i)*1.4;s.position.z=s.userData.baseZ+Math.cos(elapsed*.4+i)*1.2;s.position.y=.12+Math.sin(elapsed*1.4+i)*.12;s.rotation.y+=dt*.35})
      businessMarkers.forEach(g=>{g.rotation.y+=dt*.25});boats.forEach((b,i)=>{b.position.x=-110+((elapsed*(3+i*.35)+i*48)%220);b.position.z=84+(i%2)*10;b.rotation.y=0});animals.forEach((a,i)=>{a.position.x+=Math.sin(elapsed*.5+i)*dt*.7;a.rotation.y=Math.sin(elapsed*.35+i)});birds.forEach((b,i)=>{const a=elapsed*.25+i*.45,r=32+(i%4)*7;b.position.set(Math.cos(a)*r,20+(i%3)*3,Math.sin(a)*r);b.rotation.y=-a})
      courtTeammates.forEach((ps,id)=>ps.forEach((t,i)=>{const tx=Number(t.userData.targetX??t.userData.baseX),tz=Number(t.userData.targetZ??t.userData.baseZ);t.position.x=THREE.MathUtils.lerp(t.position.x,tx,Math.min(1,dt*2.8));t.position.z=THREE.MathUtils.lerp(t.position.z,tz,Math.min(1,dt*2.8));if(i===1&&performance.now()-Number(t.userData.tacticAt||0)<1300){t.position.x+=Math.sin(elapsed*4)*dt*1.2}animatePose(t,dt)}))
      courtGroups.forEach((court,id)=>{const ball=court.userData.ball as THREE.Mesh|undefined;if(ball){const nowMs=performance.now(),shotAt=Number(ball.userData.shotAt||0),passAt=Number(ball.userData.passAt||0),dribbleAt=Number(ball.userData.dribbleAt||0);if(shotAt&&nowMs-shotAt<900){const t=(nowMs-shotAt)/900,ease=Math.min(1,t),kind=String(ball.userData.shotKind||'jumper'),arc=kind==='dunk'?3.2:kind==='layup'?4.8:6.8;ball.position.x=THREE.MathUtils.lerp(Number(ball.userData.startX||0),Number(ball.userData.targetX||9),ease);ball.position.z=THREE.MathUtils.lerp(Number(ball.userData.startZ||0),Number(ball.userData.targetZ||0),ease);ball.position.y=.62+Math.sin(Math.PI*ease)*arc;ball.rotation.x+=dt*8;ball.rotation.z+=dt*5}else if(passAt&&nowMs-passAt<460){const t=Math.min(1,(nowMs-passAt)/460),a=ball.userData.passFrom as THREE.Vector3,b=ball.userData.passTo as THREE.Vector3;if(a&&b){ball.position.lerpVectors(a,b,t);ball.position.y+=Math.sin(Math.PI*t)*1.05;ball.rotation.z+=dt*14}}else{const holder=String(ball.userData.holder||court.userData.holder||'FREE');if(holder!=='FREE'){const local=worldToCourt(court,handlerWorld(id,holder));const dribbling=dribbleAt&&nowMs-dribbleAt<700;if(dribbling){const t=(nowMs-dribbleAt)/700;local.y=.42+Math.abs(Math.sin(t*Math.PI*4))*1.15;local.x+=Math.sin(t*Math.PI*2)*.32}else local.y+=.05;ball.position.lerp(local,.36);ball.rotation.z+=dt*(dribbling?10:2)}else{ball.position.y=.62+Math.abs(Math.sin(elapsed*2.4+id.length))*.08;ball.position.x=THREE.MathUtils.lerp(ball.position.x,0,.08);ball.position.z=THREE.MathUtils.lerp(ball.position.z,0,.08)}}}})
      courtRivals.forEach((rs,id)=>rs.forEach((r,i)=>{const defenseAt=Number(r.userData.defenseAt||0),defending=performance.now()-defenseAt<900,tx=Number(r.userData.targetX??r.userData.baseX),tz=Number(r.userData.targetZ??r.userData.baseZ),phase=elapsed*(defending?3.2:.85)+i*1.7;r.position.x=THREE.MathUtils.lerp(r.position.x,tx+Math.sin(phase)*(defending?.42:.18),Math.min(1,dt*3.4));r.position.z=THREE.MathUtils.lerp(r.position.z,tz+Math.cos(phase*.8)*(defending?.32:.14),Math.min(1,dt*3.4));const target=i===0?avatar:(courtTeammates.get(id)||[])[(i-1)%4];if(target)r.lookAt(target.position.x,1.5,target.position.z);if(defending)r.position.y=Math.max(0,Math.sin((performance.now()-defenseAt)/900*Math.PI)*.35)}))
      animatePose(avatar,dt)
      MISSIONS.forEach(m=>{const g=beacons.get(m.id);if(g){g.rotation.y+=dt;g.position.y=Math.sin(elapsed*1.4+m.x)*.1}const d=Math.hypot(avatar.position.x-m.x,avatar.position.z-m.z);if(d<4&&!visitedRef.current.includes(m.id)){const next=[...visitedRef.current,m.id];visitedRef.current=next;setVisited(next);const receipt=appendStreetVerseRevenue({kind:m.id==='ads'?'holo_ad':m.id==='marina'?'boat_rental':m.id==='market'?'marketplace_sale':'mission_reward',amountCents:m.reward,currency:'HOLO',source:`streetverse:${m.id}`,metadata:{mission:m.label}});setSummary(getStreetVerseRevenueSummary());setMsg(`${m.label} complete • +${m.reward} local demo Holo Credits • ${receipt.status} receipt ${receipt.hash}`)}})
      const focus=activeCar>=0?cars[activeCar]:avatar;const follow=activeCar>=0?new THREE.Vector3(focus.position.x+16,focus.position.y+9,focus.position.z+18):new THREE.Vector3(avatar.position.x+11,avatar.position.y+8.5,avatar.position.z+14);camera.position.lerp(follow,.075);camera.lookAt(focus.position.x,activeCar>=0?1.6:2.3,focus.position.z)
      if(elapsed-lastSave>1.5){lastSave=elapsed;localStorage.setItem(SAVE,JSON.stringify({x:avatar.position.x,z:avatar.position.z,visited:visitedRef.current}))}
      renderer.render(scene,camera);raf=requestAnimationFrame(animate)
    }
    animate()
    return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('tryamm:basketball-possession',onBasketballPossession);removeEventListener('tryamm:basketball-pass',onBasketballPass);removeEventListener('tryamm:basketball-team-tactics',onBasketballTactics);removeEventListener('tryamm:basketball-body-action',onBasketballBody);removeEventListener('tryamm:basketball-shot',onBasketballShot);removeEventListener('tryamm:basketball-dribble',onBasketballDribble);removeEventListener('tryamm:basketball-defense',onBasketballDefense);renderer.dispose();root.replaceChildren()}
  },[])

  const press=(k:keyof typeof input.current,v:boolean)=>()=>{input.current[k]=v}
  const releaseAll=()=>{input.current={u:false,d:false,l:false,r:false}}
  const triggerAction=()=>{action.current=true}
  const openReel=()=>{onClose();setTimeout(()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{source:'streetverse',title:'StreetVerse Highlight',caption:'Captured in StreetVerse • #TRYAMM #StreetVerse'}})),0)}

  const glass:React.CSSProperties={border:'1px solid #67e8ff55',background:'linear-gradient(135deg,#06111ee8,#0a0d18d9)',backdropFilter:'blur(16px) saturate(145%)',boxShadow:'0 18px 55px #000b,inset 0 1px #ffffff12'}
  const control:React.CSSProperties={border:'1px solid #8deaff66',background:'linear-gradient(180deg,#0b2637e8,#07141fe8)',color:'#fff',borderRadius:14,fontWeight:900,boxShadow:'0 8px 24px #0008',touchAction:'none'}
  return <div style={{position:'fixed',inset:0,zIndex:20000,background:'#020711',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',overflow:'hidden'}}>
    <div ref={mount} style={{position:'absolute',inset:0}}/>
    <div style={{position:'absolute',inset:'0 0 auto 0',height:90,pointerEvents:'none',background:'linear-gradient(180deg,#020711aa,transparent)'}}/>
    <div style={{position:'absolute',left:14,top:14,maxWidth:470,padding:'13px 15px',borderRadius:18,...glass}}>
      <div style={{display:'flex',alignItems:'center',gap:8}}><span style={{width:8,height:8,borderRadius:99,background:'#52f2ba',boxShadow:'0 0 16px #52f2ba'}}/><div style={{fontSize:11,fontWeight:950,letterSpacing:1.8,color:'#6be9ff'}}>STREETVERSE • CINEMATIC OMNI DISTRICT</div></div>
      <div style={{fontSize:12,marginTop:8,lineHeight:1.45}}>{msg}</div>
      <div style={{display:'flex',gap:10,marginTop:10,fontSize:11,flexWrap:'wrap'}}><b>{visited.length}/{MISSIONS.length} missions</b><span>18 residents</span><span>6 AI Spirits</span><span>4 basketball courts</span><span>5v5 live possession</span><span>{summary.holoCredits} demo Holo Credits</span><span style={{color:isDriving?'#ffd75c':'#7ef29a',fontWeight:900}}>{isDriving?'DRIVING':business?'IN BUSINESS':'ON FOOT'}</span></div>
      <div style={{fontSize:10,opacity:.72,marginTop:6}}>ACES cinematic lighting • 3D courts/hoops • ball-in-hand possession • visible passes • cuts/screens • man defense • jump/layup/dunk poses • persistent missions • Reel Creator.</div>
    </div>
    <button onClick={onClose} style={{position:'absolute',right:14,top:14,border:'1px solid #ffffff44',borderRadius:999,padding:'9px 13px',background:'#07101de8',color:'#fff',fontWeight:850,boxShadow:'0 8px 26px #0009'}}>EXIT</button>
    <button onClick={openReel} aria-label="Create StreetVerse Reel" style={{position:'absolute',right:14,top:62,border:'1px solid #ffd75caa',borderRadius:999,padding:'11px 15px',background:'linear-gradient(135deg,#26160a,#3a2208)',color:'#ffe08a',fontWeight:950,boxShadow:'0 10px 34px #000a,0 0 18px #ffcc5533'}}>🎥 REEL</button>
    {business&&<div style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',width:'min(88vw,420px)',padding:19,borderRadius:20,...glass}}><div style={{fontSize:11,fontWeight:950,letterSpacing:1.4,color:'#4fe3ff'}}>BUSINESS INTERACTION</div><h3 style={{margin:'8px 0 6px'}}>{business}</h3><div style={{fontSize:12,lineHeight:1.5,opacity:.86}}>Mission context and commerce discovery are active here.</div><button onClick={triggerAction} style={{marginTop:14,border:'1px solid #ffffff44',borderRadius:999,padding:'9px 13px',background:'#0a2234',color:'#fff',fontWeight:850}}>EXIT BUSINESS</button></div>}
    <div onPointerLeave={releaseAll} onPointerCancel={releaseAll} style={{position:'absolute',left:16,bottom:20,display:'grid',gridTemplateColumns:'54px 54px 54px',gridTemplateRows:'54px 54px',gap:7,userSelect:'none',touchAction:'none'}}>
      <button onPointerDown={press('u',true)} onPointerUp={press('u',false)} onPointerCancel={press('u',false)} style={{...control,gridColumn:2,gridRow:1}}>▲</button>
      <button onPointerDown={press('l',true)} onPointerUp={press('l',false)} onPointerCancel={press('l',false)} style={{...control,gridColumn:1,gridRow:2}}>◀</button>
      <button onPointerDown={press('d',true)} onPointerUp={press('d',false)} onPointerCancel={press('d',false)} style={{...control,gridColumn:2,gridRow:2}}>▼</button>
      <button onPointerDown={press('r',true)} onPointerUp={press('r',false)} onPointerCancel={press('r',false)} style={{...control,gridColumn:3,gridRow:2}}>▶</button>
    </div>
    <button onClick={triggerAction} style={{position:'absolute',right:18,bottom:126,border:'1px solid #4fe3ff88',borderRadius:999,padding:'12px 15px',background:'linear-gradient(135deg,#06314aee,#071b2aee)',color:'#fff',fontWeight:950,boxShadow:'0 10px 34px #0009',touchAction:'manipulation'}}>{business?'EXIT BUSINESS':isDriving?'EXIT VEHICLE':'INTERACT / ENTER'}</button>
    <div style={{position:'absolute',right:14,bottom:18,padding:'10px 12px',borderRadius:14,maxWidth:280,fontSize:10,lineHeight:1.5,...glass}}>iPhone: tap 🎥 REEL. If direct browser capture is unavailable, use Control Center Screen Recording, then import the clip into Reel Composer to edit, render, save or publish.</div>
  </div>
}
