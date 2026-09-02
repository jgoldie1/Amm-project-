import * as THREE from 'three'
import { addStreetVerseChicagoPhysicalWorld3D } from '../game/engine/StreetVerseChicagoPhysicalWorld3D'
import { addStreetVerseChicagoDistrictWorld3D } from './StreetVerseChicagoDistrictWorld3D'
import { addStreetVerseObamaCenterWorld3D } from './StreetVerseObamaCenterWorld3D'
import { installStreetVerseObamaLegacyMissionRuntime } from './StreetVerseObamaLegacyMissionRuntime'
let installed=false
const ID='tryamm-chicago-3d-depth'
const SAVE_KEY='tryamm.streetverse.living.v1'
function active(){const p=location.pathname;const h=location.hash.replace(/^#/,'');return p.startsWith('/streetverse')||h==='/streetverse'||h==='/city'}
function box(scene:THREE.Scene,x:number,y:number,z:number,w:number,h:number,d:number,color:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.75}));m.position.set(x,y,z);scene.add(m);return m}
function person(scene:THREE.Scene,x:number,z:number,color:number,index=0){
 const g=new THREE.Group()
 const skins=[0x4c2b1c,0x6a3d27,0x84543a,0xa96e4c,0xc68a63,0xe0ad86]
 const skin=skins[index%skins.length]
 const cloth=new THREE.MeshStandardMaterial({color,roughness:.62,emissive:color,emissiveIntensity:.08})
 const skinMat=new THREE.MeshStandardMaterial({color:skin,roughness:.58})
 const dark=new THREE.MeshStandardMaterial({color:0x202735,roughness:.82})
 const body=new THREE.Mesh(new THREE.CapsuleGeometry(.36,1.05,4,8),cloth);body.position.y=1.55;body.castShadow=true
 const head=new THREE.Mesh(new THREE.SphereGeometry(.31,12,10),skinMat);head.position.y=2.55;head.castShadow=true
 const hair=new THREE.Mesh(new THREE.SphereGeometry(.32,10,8,0,Math.PI*2,0,Math.PI*.48),new THREE.MeshStandardMaterial({color:[0x16120f,0x2d1c15,0x493227][index%3],roughness:.9}));hair.position.y=2.68
 g.add(body,head,hair)
 for(const side of [-1,1]){
  const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.1,.72,3,6),skinMat);arm.position.set(side*.48,1.58,0);arm.rotation.z=side*.12;g.add(arm)
  const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.8,3,6),dark);leg.position.set(side*.17,.52,0);g.add(leg)
 }
 g.position.set(x,0,z);scene.add(g);return g
}
type DoorPair={left:THREE.Mesh;right:THREE.Mesh;baseX:number}
function train(scene:THREE.Scene,z:number,color:number,doors:DoorPair[]){const g=new THREE.Group();scene.add(g);for(let i=0;i<3;i++){const cx=-8+i*6;const car=new THREE.Mesh(new THREE.BoxGeometry(5.6,3.2,2.8),new THREE.MeshStandardMaterial({color:0xb8bec4,roughness:.62,metalness:.25}));car.position.set(cx,2,z);g.add(car);const stripe=new THREE.Mesh(new THREE.BoxGeometry(5.2,.35,.08),new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.3}));stripe.position.set(cx,2,z-1.43);g.add(stripe);const left=new THREE.Mesh(new THREE.BoxGeometry(.72,2.15,.1),new THREE.MeshStandardMaterial({color:0x40474d,roughness:.5}));const right=left.clone();left.position.set(cx-.38,1.95,z-1.48);right.position.set(cx+.38,1.95,z-1.48);g.add(left,right);doors.push({left,right,baseX:cx})}return g}
function mount(){if(!active()){document.getElementById(ID)?.remove();return}if(document.getElementById(ID))return;const root=document.createElement('div');root.id=ID;root.style.cssText='position:fixed;right:12px;top:82px;z-index:2147482100;pointer-events:auto;font-family:Inter,Arial,sans-serif';const btn=document.createElement('button');btn.textContent='🏙️ CHICAGO 3D';btn.style.cssText='padding:8px 11px;border-radius:999px;border:1px solid #6caed8;background:#07131ded;color:#fff;font-weight:900;font-size:10px';const panel=document.createElement('div');panel.style.cssText='display:none;margin-top:6px;width:min(88vw,380px);padding:10px;border:1px solid #34556b;border-radius:12px;background:#061019f2;color:white;font-size:10px';panel.innerHTML='<b>CHICAGO PHYSICAL WORLD</b><br>Loop • river + bridges • elevated L • lakefront • South/West/North Side • Jackson Park / Obama Center-inspired public campus • Home Court basketball • fictional Obama dialogue • Jacobie / Isaiah / Alton Kevon legacy missions • fictionalized public-event security story • transit • underground • rink • courthouse • battle zones';btn.onclick=()=>panel.style.display=panel.style.display==='none'?'block':'none';root.append(btn,panel);document.body.appendChild(root)}
export function installStreetVerseChicago3DDepthRuntime(){if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true;installStreetVerseObamaLegacyMissionRuntime();const sync=()=>requestAnimationFrame(mount);window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);window.addEventListener('tryamm:streetverse-enter',sync);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()}
export function addChicagoTransitAirportDepth(scene:THREE.Scene){
 box(scene,0,.25,-38,42,.5,6,0x55585c);box(scene,0,4,-42,44,.35,.35,0x383b3f);for(let x=-20;x<=20;x+=5)box(scene,x,2,-42,.22,4,.22,0x44484c)
 const doors:DoorPair[]=[];train(scene,-38,0x00a1de,doors);train(scene,-47,0xc60c30,doors)
 for(let i=0;i<18;i++)person(scene,-18+(i%9)*4,-35+Math.floor(i/9)*2.2,[0x3f7fc2,0xc65f87,0x65a85b,0xe0924b,0x8e6bd1,0x42b9bb][i%6],i)
 box(scene,48,4,-20,34,8,22,0xb6c2ca);box(scene,48,.6,-20,28,.5,16,0x353b40);for(let i=0;i<4;i++)box(scene,40+i*6,1.1,-18,4,.7,1.5,0x20262b)
 box(scene,48,8,-35,38,.45,2.2,0x60666b);box(scene,48,8.8,-35,8,1.8,2,0x9ca9b2)
 box(scene,-50,3,20,28,6,18,0xaaaeb0);box(scene,-34,5,20,18,3,3,0x87929a)
 for(let i=0;i<24;i++)person(scene,36+(i%8)*3,-27+Math.floor(i/8)*5,[0x5489c7,0xc75d70,0x55a36f,0xd79b45,0x826dd1,0x4bb9aa][i%6],i+18)
 for(const [i,[x,z]] of ([[-12,-35],[10,-35],[42,-14],[52,-14]] as [number,number][]).entries())person(scene,x,z,[0x315f9c,0xb5526c,0x4b8d62,0xbd823c][i%4],i+42)
 const physical=addStreetVerseChicagoPhysicalWorld3D(scene);const districts=addStreetVerseChicagoDistrictWorld3D(scene);const obamaCenter=addStreetVerseObamaCenterWorld3D(scene)
 const clock=new THREE.Clock();let frame=0
 const animate=()=>{if(!active())return;const elapsed=clock.getElapsedTime();const openAmount=(Math.sin(elapsed*1.2)+1)/2;doors.forEach(d=>{d.left.position.x=d.baseX-.38-openAmount*.42;d.right.position.x=d.baseX+.38+openAmount*.42});physical.tick(elapsed*1000);if((frame++%6)===0){try{const saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');if(Number.isFinite(saved.x)&&Number.isFinite(saved.z)){const pos=new THREE.Vector3(saved.x,Number(saved.y)||0,saved.z);physical.update(pos);districts.update(pos);obamaCenter.update(pos)}}catch{}}requestAnimationFrame(animate)};animate()
 window.dispatchEvent(new CustomEvent('tryamm:streetverse-3d-depth-ready',{detail:{railCars:true,platforms:true,doors:true,crowds:true,visibleFallbackResidents:46,ohare:true,midway:true,physicalChicago:true,animatedFlood:true,rinkSkaters:true,lakefrontPedestrians:true,courthouseCrowds:true,battleTriggers:true,loopTowers:true,riverBridges:true,elevatedL:true,districtArchitecture:['south','west','north'],obamaCenterInspiredCampus:true,obamaCenterMissions:15,obamaLegacyDialogue:true,homeCourtBasketball:true,fictionalPublicEventSecurityMission:true}}))
 return {platforms:1,trains:2,riders:46,airports:['O’Hare','Midway'],patrols:4,animatedDoors:doors.length,physicalChicago:true,districtWorld:true,obamaCenterWorld:true,obamaLegacyMissions:true}
}
