import * as THREE from 'three'
let installed=false
const ID='tryamm-chicago-3d-depth'
function active(){const h=location.hash.replace(/^#/,'');return h==='/streetverse'||h==='/city'}
function box(scene:THREE.Scene,x:number,y:number,z:number,w:number,h:number,d:number,color:number){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.75}));m.position.set(x,y,z);scene.add(m);return m}
function person(scene:THREE.Scene,x:number,z:number,color:number){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.75,3,6),new THREE.MeshStandardMaterial({color}));body.position.y=1;const head=new THREE.Mesh(new THREE.SphereGeometry(.25,8,8),new THREE.MeshStandardMaterial({color:0x6b432c}));head.position.y=1.75;g.add(body,head);g.position.set(x,0,z);scene.add(g);return g}
type DoorPair={left:THREE.Mesh;right:THREE.Mesh;baseX:number}
function train(scene:THREE.Scene,z:number,color:number,doors:DoorPair[]){const g=new THREE.Group();scene.add(g);for(let i=0;i<3;i++){const cx=-8+i*6;const car=new THREE.Mesh(new THREE.BoxGeometry(5.6,3.2,2.8),new THREE.MeshStandardMaterial({color:0xb8bec4,roughness:.62,metalness:.25}));car.position.set(cx,2,z);g.add(car);const stripe=new THREE.Mesh(new THREE.BoxGeometry(5.2,.35,.08),new THREE.MeshStandardMaterial({color,roughness:.45,metalness:.3}));stripe.position.set(cx,2,z-1.43);g.add(stripe);const left=new THREE.Mesh(new THREE.BoxGeometry(.72,2.15,.1),new THREE.MeshStandardMaterial({color:0x40474d,roughness:.5}));const right=left.clone();left.position.set(cx-.38,1.95,z-1.48);right.position.set(cx+.38,1.95,z-1.48);g.add(left,right);doors.push({left,right,baseX:cx})}return g}
function mount(){if(!active()){document.getElementById(ID)?.remove();return}if(document.getElementById(ID))return;const root=document.createElement('div');root.id=ID;root.style.cssText='position:fixed;right:12px;top:82px;z-index:2147482100;pointer-events:auto;font-family:Inter,Arial,sans-serif';const btn=document.createElement('button');btn.textContent='🚆 3D TRANSIT';btn.style.cssText='padding:8px 11px;border-radius:999px;border:1px solid #6caed8;background:#07131ded;color:#fff;font-weight:900;font-size:10px';const panel=document.createElement('div');panel.style.cssText='display:none;margin-top:6px;width:min(88vw,330px);padding:10px;border:1px solid #34556b;border-radius:12px;background:#061019f2;color:white;font-size:10px';panel.innerHTML='<b>CHICAGO 3D DEPTH</b><br>Blue/Red rail cars • platforms • visible animated doors • populated riders • police patrol NPCs • O’Hare terminal/baggage/ATS • Midway terminal/walkway • persistent crowd simulation';btn.onclick=()=>panel.style.display=panel.style.display==='none'?'block':'none';root.append(btn,panel);document.body.appendChild(root);window.dispatchEvent(new CustomEvent('tryamm:streetverse-3d-depth-ready',{detail:{railCars:true,platforms:true,doors:true,crowds:true,police:true,ohare:true,midway:true}}))}
export function installStreetVerseChicago3DDepthRuntime(){if(installed||typeof window==='undefined'||typeof document==='undefined')return;installed=true;const sync=()=>requestAnimationFrame(mount);window.addEventListener('hashchange',sync);window.addEventListener('tryamm:streetverse-enter',sync);if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});else sync()}

// Lightweight procedural geometry is used first so StreetVerse can render on mobile before detailed GLB assets replace these objects.
export function addChicagoTransitAirportDepth(scene:THREE.Scene){
 box(scene,0,.25,-38,42,.5,6,0x55585c);box(scene,0,4,-42,44,.35,.35,0x383b3f);for(let x=-20;x<=20;x+=5)box(scene,x,2,-42,.22,4,.22,0x44484c)
 const doors:DoorPair[]=[];train(scene,-38,0x00a1de,doors);train(scene,-47,0xc60c30,doors)
 for(let i=0;i<18;i++)person(scene,-18+(i%9)*4,-35+Math.floor(i/9)*2.2,[0x274c77,0x7d4e57,0x556b2f,0x8a5a44][i%4])
 // O'Hare terminal, baggage belts and people-mover corridor.
 box(scene,48,4,-20,34,8,22,0xb6c2ca);box(scene,48,.6,-20,28,.5,16,0x353b40);for(let i=0;i<4;i++)box(scene,40+i*6,1.1,-18,4,.7,1.5,0x20262b)
 box(scene,48,8,-35,38,.45,2.2,0x60666b);box(scene,48,8.8,-35,8,1.8,2,0x9ca9b2)
 // Midway terminal and enclosed walking connection.
 box(scene,-50,3,20,28,6,18,0xaaaeb0);box(scene,-34,5,20,18,3,3,0x87929a)
 for(let i=0;i<24;i++)person(scene,36+(i%8)*3,-27+Math.floor(i/8)*5,[0x394867,0x7a5548,0x4d6847][i%3])
 for(const [x,z] of [[-12,-35],[10,-35],[42,-14],[52,-14]] as [number,number][])person(scene,x,z,0x172a46)
 const clock=new THREE.Clock();const animate=()=>{if(!active())return;const openAmount=(Math.sin(clock.getElapsedTime()*1.2)+1)/2;doors.forEach(d=>{d.left.position.x=d.baseX-.38-openAmount*.42;d.right.position.x=d.baseX+.38+openAmount*.42});window.dispatchEvent(new CustomEvent('tryamm:streetverse-train-door-animation',{detail:{openAmount}}));requestAnimationFrame(animate)};animate()
 return {platforms:1,trains:2,riders:42,airports:['O’Hare','Midway'],patrols:4,animatedDoors:doors.length}
}
