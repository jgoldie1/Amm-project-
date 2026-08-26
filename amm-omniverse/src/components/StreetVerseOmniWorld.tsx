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

function mat(color:number,metal=.1,rough=.65){return new THREE.MeshStandardMaterial({color,metalness:metal,roughness:rough})}
function load(){try{return JSON.parse(localStorage.getItem(SAVE)||'{}')}catch{return {}}}

function vehicle(color:number,style:'sedan'|'gt'|'supercar'|'suv'|'limousine'){
  const g=new THREE.Group()
  const dims=style==='limousine'?[7.2,1.25,2.25]:style==='suv'?[5.3,1.65,2.35]:style==='supercar'?[4.7,.9,2.15]:[4.9,1.1,2.2]
  const shell=new THREE.Mesh(new THREE.BoxGeometry(dims[0],dims[1],dims[2]),mat(color,.72,.2));shell.position.y=.9;g.add(shell)
  const cabin=new THREE.Mesh(new THREE.BoxGeometry(style==='limousine'?4.7:2.6,style==='suv'?1.05:.8,dims[2]*.86),mat(0x7fb6d4,.75,.15));cabin.position.set(style==='supercar'?.25:-.15,1.65,0);g.add(cabin)
  if(style==='supercar'){const nose=new THREE.Mesh(new THREE.BoxGeometry(1.6,.28,2.05),mat(color,.8,.16));nose.position.set(2.65,.72,0);g.add(nose)}
  for(const sx of [-dims[0]*.31,dims[0]*.31])for(const sz of [-1,1]){const w=new THREE.Mesh(new THREE.CylinderGeometry(.46,.46,.34,14),mat(0x0b0b0d,0,.88));w.rotation.x=Math.PI/2;w.position.set(sx,.45,sz*dims[2]*.48);g.add(w)}
  return g
}

function boat(color:number,size='sport'){
  const g=new THREE.Group();const l=size==='yacht'?10:6.5
  const hull=new THREE.Mesh(new THREE.BoxGeometry(l,1.0,2.5),mat(color,.45,.28));hull.position.y=.55;g.add(hull)
  const bow=new THREE.Mesh(new THREE.ConeGeometry(1.25,2.8,4),mat(color,.45,.28));bow.rotation.z=-Math.PI/2;bow.position.set(l/2+1.25,.55,0);g.add(bow)
  const deck=new THREE.Mesh(new THREE.BoxGeometry(l*.56,.5,2),mat(0xf4f0e6,.25,.34));deck.position.set(-.4,1.25,0);g.add(deck)
  const glass=new THREE.Mesh(new THREE.BoxGeometry(2.4,.9,1.65),mat(0x6da9c9,.7,.18));glass.position.set(-.8,2,0);g.add(glass)
  if(size==='yacht'){const upper=new THREE.Mesh(new THREE.BoxGeometry(3.2,.65,1.7),mat(0xffffff,.35,.3));upper.position.set(-1.3,2.85,0);g.add(upper)}
  return g
}

function quadruped(color:number,scale=1){const g=new THREE.Group();const b=new THREE.Mesh(new THREE.BoxGeometry(1.5*scale,.7*scale,.65*scale),mat(color));b.position.y=.85*scale;g.add(b);const h=new THREE.Mesh(new THREE.BoxGeometry(.6*scale,.6*scale,.55*scale),mat(color));h.position.set(.95*scale,1.1*scale,0);g.add(h);for(const x of [-.55,.55])for(const z of [-.22,.22]){const leg=new THREE.Mesh(new THREE.BoxGeometry(.16*scale,.65*scale,.16*scale),mat(color));leg.position.set(x,.35*scale,z);g.add(leg)}return g}

export default function StreetVerseOmniWorld({onClose}:{onClose:()=>void}){
 const mount=useRef<HTMLDivElement|null>(null);const input=useRef({u:false,d:false,l:false,r:false});const [msg,setMsg]=useState('StreetVerse Omni District loaded. Explore, complete missions and test the economic loop.');const [summary,setSummary]=useState(()=>getStreetVerseRevenueSummary());const [visited,setVisited]=useState<string[]>(()=>load().visited||[])
 useEffect(()=>{const root=mount.current;if(!root)return;const saved=load();const scene=new THREE.Scene();scene.background=new THREE.Color(0x07111d);scene.fog=new THREE.FogExp2(0x07111d,.0048);const camera=new THREE.PerspectiveCamera(62,1,.1,900);const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement)
 const hemi=new THREE.HemisphereLight(0xa8ddff,0x15121b,2.4);scene.add(hemi);const sun=new THREE.DirectionalLight(0xffddbd,3.1);sun.position.set(80,110,40);sun.castShadow=true;scene.add(sun)
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(260,220),mat(0x24351f,0,.95));ground.rotation.x=-Math.PI/2;scene.add(ground)
 const water=new THREE.Mesh(new THREE.PlaneGeometry(260,52),new THREE.MeshStandardMaterial({color:0x0d5578,metalness:.2,roughness:.28,transparent:true,opacity:.93}));water.rotation.x=-Math.PI/2;water.position.set(0,.05,86);scene.add(water)
 const road=mat(0x1d222a,0,.98),walk=mat(0x777a7d,0,.95)
 for(const z of [-55,-5,45]){const r=new THREE.Mesh(new THREE.BoxGeometry(260,.1,15),road);r.position.set(0,.05,z);scene.add(r);for(const dz of [-9,9]){const s=new THREE.Mesh(new THREE.BoxGeometry(260,.18,3),walk);s.position.set(0,.11,z+dz);scene.add(s)}}
 for(const x of [-65,-15,35,85]){const r=new THREE.Mesh(new THREE.BoxGeometry(15,.1,170),road);r.position.set(x,.05,5);scene.add(r)}
 const buildings=[[-98,-72,22,28,20],[-98,-28,18,22,18],[-98,20,24,38,19],[-50,-72,19,24,18],[-50,-22,23,34,22],[-50,22,18,20,17],[5,-72,24,42,20],[5,-25,18,25,18],[5,22,22,36,20],[58,-72,20,30,19],[58,-25,22,44,20],[58,20,19,27,18],[105,-70,18,24,17],[105,-22,22,35,19],[105,20,20,31,18]]
 buildings.forEach((b,i)=>{const [x,z,w,h,d]=b;const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat([0x293d52,0x49364f,0x36503c,0x56432f,0x2c4f59][i%5],.22,.62));m.position.set(x,h/2,z);m.castShadow=true;scene.add(m);for(let y=4;y<h-2;y+=4){const light=new THREE.Mesh(new THREE.PlaneGeometry(w*.62,.55),new THREE.MeshBasicMaterial({color:i%2?0xffd08a:0x65dcff}));light.position.set(x,y,z+d/2+.02);scene.add(light)}})
 const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(1,2.3,6,10),mat(0x55e4ff,.35,.32));body.position.y=2.2;avatar.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.75,16,12),mat(0xba7b52));head.position.y=4.25;avatar.add(head);avatar.position.set(saved.x??0,0,saved.z??58);scene.add(avatar)
 const cars:THREE.Group[]=[];const specs:[number,'sedan'|'gt'|'supercar'|'suv'|'limousine'][]=[[0xe33d3d,'sedan'],[0x111318,'gt'],[0xf5f5f0,'supercar'],[0x275aa8,'suv'],[0xd4b24d,'gt'],[0x681b8f,'supercar'],[0x212121,'limousine'],[0x0f7c5f,'suv'],[0xb92c2c,'gt'],[0xcfcfd2,'sedan'],[0x102a58,'supercar'],[0x7f5a25,'gt']]
 specs.forEach((s,i)=>{const c=vehicle(s[0],s[1]);c.position.set(-118+i*21,.05,i%2?-55:45);scene.add(c);cars.push(c)})
 const boats:THREE.Group[]=[];[[0xffffff,'yacht'],[0xd83a3a,'sport'],[0x18355f,'sport'],[0xe5c54b,'yacht']].forEach((s:any[],i)=>{const b=boat(s[0],s[1]);b.position.set(-85+i*55,.12,87+i%2*8);scene.add(b);boats.push(b)})
 const animals:THREE.Group[]=[];[[0x8a5b35,1],[0x2c2d31,.85],[0xc99a68,.95],[0x6a4b2d,1.5],[0xe5d4b8,1.25],[0x4c3a29,1.7]].forEach((a,i)=>{const q=quadruped(a[0],a[1] as number);q.position.set(-90+i*33,0,62-(i%2)*14);scene.add(q);animals.push(q)})
 const birds:THREE.Mesh[]=[];for(let i=0;i<14;i++){const b=new THREE.Mesh(new THREE.ConeGeometry(.22,.65,4),mat(0xdce8ef));b.rotation.z=Math.PI/2;scene.add(b);birds.push(b)}
 for(let i=0;i<38;i++){const t=new THREE.Group();const tr=new THREE.Mesh(new THREE.CylinderGeometry(.3,.45,3,7),mat(0x69482f));tr.position.y=1.5;t.add(tr);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.5,8,7),mat(0x2d7445));crown.position.y=3.8;t.add(crown);t.position.set(-118+(i*31)%236,0,-92+(i*17)%155);scene.add(t)}
 const beacons=new Map<string,THREE.Group>();MISSIONS.forEach(m=>{const g=new THREE.Group();const ring=new THREE.Mesh(new THREE.TorusGeometry(2.4,.22,10,40),new THREE.MeshBasicMaterial({color:0xffd75c}));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring);const beam=new THREE.Mesh(new THREE.CylinderGeometry(.3,.85,11,14,1,true),new THREE.MeshBasicMaterial({color:0x55ddff,transparent:true,opacity:.18,side:THREE.DoubleSide}));beam.position.y=5.5;g.add(beam);g.position.set(m.x,0,m.z);scene.add(g);beacons.set(m.id,g)})
 const keys=new Set<string>();const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','shift'].includes(k)){e.preventDefault();keys.add(k)}};const ku=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());addEventListener('keydown',kd,{passive:false});addEventListener('keyup',ku)
 const resize=()=>{const w=root.clientWidth,h=Math.max(430,root.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(root);resize();const clock=new THREE.Clock();let elapsed=0,raf=0,lastSave=0
 const animate=()=>{const dt=Math.min(.033,clock.getDelta());elapsed+=dt;let dx=0,dz=0;const p=input.current;if(keys.has('w')||keys.has('arrowup')||p.u)dz-=1;if(keys.has('s')||keys.has('arrowdown')||p.d)dz+=1;if(keys.has('a')||keys.has('arrowleft')||p.l)dx-=1;if(keys.has('d')||keys.has('arrowright')||p.r)dx+=1;if(dx||dz){const len=Math.hypot(dx,dz)||1;const speed=(keys.has('shift')?30:18)*dt;avatar.position.x=THREE.MathUtils.clamp(avatar.position.x+dx/len*speed,-122,122);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z+dz/len*speed,-95,72);avatar.rotation.y=Math.atan2(dx,dz)}
 cars.forEach((c,i)=>{const lane=i%2?45:-55;const dir=i%2?1:-1;c.position.x=dir*(-128+((elapsed*(11+i*.45)+i*19)%256));c.position.z=lane;c.rotation.y=dir>0?Math.PI/2:-Math.PI/2});boats.forEach((b,i)=>{b.position.x=-110+((elapsed*(3+i*.35)+i*48)%220);b.position.z=84+(i%2)*10;b.rotation.y=Math.PI/2});animals.forEach((a,i)=>{a.position.x+=Math.sin(elapsed*.5+i)*dt*.7;a.rotation.y=Math.sin(elapsed*.35+i)});birds.forEach((b,i)=>{const a=elapsed*.25+i*.45,r=32+(i%4)*7;b.position.set(Math.cos(a)*r,20+(i%3)*3,Math.sin(a)*r);b.rotation.y=-a})
 MISSIONS.forEach(m=>{const g=beacons.get(m.id);if(g)g.rotation.y+=dt;const d=Math.hypot(avatar.position.x-m.x,avatar.position.z-m.z);if(d<4&&!visited.includes(m.id)){const next=[...visited,m.id];setVisited(next);const receipt=appendStreetVerseRevenue({kind:m.id==='ads'?'holo_ad':m.id==='marina'?'boat_rental':m.id==='market'?'marketplace_sale':'mission_reward',amountCents:m.reward,currency:'HOLO',source:`streetverse:${m.id}`,metadata:{mission:m.label}});setSummary(getStreetVerseRevenueSummary());setMsg(`${m.label} complete • +${m.reward} Holo Credits • internal-chain receipt ${receipt.hash}`)}})
 camera.position.lerp(new THREE.Vector3(avatar.position.x+12,avatar.position.y+11,avatar.position.z+16),.08);camera.lookAt(avatar.position.x,2.2,avatar.position.z);if(elapsed-lastSave>1.5){lastSave=elapsed;localStorage.setItem(SAVE,JSON.stringify({x:avatar.position.x,z:avatar.position.z,visited}))}renderer.render(scene,camera);raf=requestAnimationFrame(animate)};animate();return()=>{cancelAnimationFrame(raf);ro.disconnect();removeEventListener('keydown',kd);removeEventListener('keyup',ku);renderer.dispose();root.replaceChildren()}},[visited])
 const press=(k:keyof typeof input.current,v:boolean)=>()=>{input.current[k]=v}
 return <div style={{position:'fixed',inset:0,zIndex:20000,background:'#020711',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}><div ref={mount} style={{position:'absolute',inset:0}}/><div style={{position:'absolute',left:14,top:14,maxWidth:430,padding:'12px 14px',border:'1px solid #4fe3ff66',borderRadius:16,background:'#04101ddd',backdropFilter:'blur(10px)'}}><div style={{fontSize:11,fontWeight:900,letterSpacing:1.7,color:'#4fe3ff'}}>STREETVERSE • OMNI DISTRICT</div><div style={{fontSize:12,marginTop:7,lineHeight:1.4}}>{msg}</div><div style={{display:'flex',gap:12,marginTop:9,fontSize:11}}><b>{visited.length}/{MISSIONS.length} missions</b><span>{summary.events} chain events</span><span>{summary.holoCredits} Holo Credits</span></div><div style={{fontSize:10,opacity:.68,marginTop:6}}>Original/non-branded luxury vehicle archetypes • boats/yachts • animals • revenue events • keyboard/game-style controls</div></div><button onClick={onClose} style={{position:'absolute',right:14,top:14,border:'1px solid #ffffff44',borderRadius:999,padding:'9px 13px',background:'#07101ddd',color:'#fff',fontWeight:800}}>EXIT</button><div style={{position:'absolute',left:16,bottom:20,display:'grid',gridTemplateColumns:'52px 52px 52px',gridTemplateRows:'52px 52px',gap:7,userSelect:'none'}}><button onPointerDown={press('u',true)} onPointerUp={press('u',false)} style={{gridColumn:2,gridRow:1}}>▲</button><button onPointerDown={press('l',true)} onPointerUp={press('l',false)} style={{gridColumn:1,gridRow:2}}>◀</button><button onPointerDown={press('d',true)} onPointerUp={press('d',false)} style={{gridColumn:2,gridRow:2}}>▼</button><button onPointerDown={press('r',true)} onPointerUp={press('r',false)} style={{gridColumn:3,gridRow:2}}>▶</button></div><div style={{position:'absolute',right:14,bottom:18,padding:'10px 12px',borderRadius:14,background:'#07101ddd',fontSize:10,lineHeight:1.5,maxWidth:270}}>Revenue lanes: missions • Holo Ads • marketplace • creator media • rentals • marina/boats • events • sponsorships. Cash payout remains server-verified and funding-gated.</div></div>
}
