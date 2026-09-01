import * as THREE from 'three'
import type { ConstructState,ConstructTarget } from './StreetVerseWorldAwareConstructRuntime'

let installed=false
let renderer:THREE.WebGLRenderer|null=null
let scene:THREE.Scene|null=null
let camera:THREE.PerspectiveCamera|null=null
let mount:HTMLElement|null=null
let raf=0
let state:ConstructState|null=null
let routeTarget:ConstructTarget|null=null
let scanStart=0
const world=new THREE.Group()
const routeGroup=new THREE.Group()
const arrowGroup=new THREE.Group()
const cardGroup=new THREE.Group()
const bennyGroup=new THREE.Group()
let scanRing:THREE.Mesh|null=null

function holoMat(color:number,opacity=.72){return new THREE.MeshBasicMaterial({color,transparent:true,opacity,depthWrite:false,blending:THREE.AdditiveBlending,toneMapped:false})}
function lineMat(color:number,opacity=.9){return new THREE.LineBasicMaterial({color,transparent:true,opacity,blending:THREE.AdditiveBlending,toneMapped:false})}
function clearGroup(group:THREE.Group){while(group.children.length){const o=group.children.pop()!;o.traverse(n=>{const m=n as THREE.Mesh;if(m.geometry)m.geometry.dispose();const mat=(m as any).material;if(Array.isArray(mat))mat.forEach(x=>x?.dispose?.());else mat?.dispose?.()})}}
function findMount(){return document.querySelector('[data-streetverse-construct-root]') as HTMLElement|null || document.querySelector('#tryamm-benny-construct-hologram')?.parentElement || document.body}
function ensureRenderer(){
 if(renderer&&scene&&camera&&mount?.isConnected)return true
 mount=findMount();if(!mount)return false
 scene=new THREE.Scene();camera=new THREE.PerspectiveCamera(58,1,.1,500);renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setClearColor(0x000000,0);renderer.domElement.dataset.constructFreeSpace='true';Object.assign(renderer.domElement.style,{position:'fixed',inset:'0',zIndex:'19990',width:'100%',height:'100%',pointerEvents:'none'});document.body.appendChild(renderer.domElement)
 scene.add(world);world.add(routeGroup,arrowGroup,cardGroup,bennyGroup)
 const grid=new THREE.GridHelper(240,48,0x46eaff,0x173b55);const mats=Array.isArray(grid.material)?grid.material:[grid.material];mats.forEach(m=>{m.transparent=true;m.opacity=.16});grid.position.y=.04;world.add(grid)
 const depth1=new THREE.Mesh(new THREE.RingGeometry(24,24.12,96),holoMat(0x54e8ff,.2));depth1.rotation.x=-Math.PI/2;depth1.position.y=.06;world.add(depth1)
 const depth2=depth1.clone();depth2.scale.setScalar(1.65);world.add(depth2)
 buildBenny()
 return true
}
function buildBenny(){clearGroup(bennyGroup);const cyan=0x5cecff,purple=0x9a7cff;const body=new THREE.Mesh(new THREE.CapsuleGeometry(.42,1.55,6,12),holoMat(cyan,.46));body.position.y=1.45;bennyGroup.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.42,18,14),holoMat(cyan,.58));head.position.y=2.75;bennyGroup.add(head);const halo=new THREE.Mesh(new THREE.TorusGeometry(.62,.035,8,36),holoMat(purple,.8));halo.rotation.x=Math.PI/2;halo.position.y=3.35;bennyGroup.add(halo);for(const y of [.2,1.5,2.8]){const ring=new THREE.Mesh(new THREE.TorusGeometry(.7,.028,8,32),holoMat(cyan,.55));ring.rotation.x=Math.PI/2;ring.position.y=y;bennyGroup.add(ring)}}
function rebuildRoute(){clearGroup(routeGroup);clearGroup(arrowGroup);if(!state?.active||!routeTarget)return;const from=new THREE.Vector3(state.player.x,.09,state.player.z),to=new THREE.Vector3(routeTarget.x,.09,routeTarget.z);const points:THREE.Vector3[]=[];const steps=Math.max(8,Math.ceil(from.distanceTo(to)/4));for(let i=0;i<=steps;i++){const t=i/steps;const p=from.clone().lerp(to,t);p.y=.09+Math.sin(t*Math.PI)*.05;points.push(p)}const geo=new THREE.BufferGeometry().setFromPoints(points);routeGroup.add(new THREE.Line(geo,lineMat(0x48ecff,.95)));for(let i=2;i<points.length-1;i+=3){const p=points[i],next=points[Math.min(i+1,points.length-1)],dir=next.clone().sub(p).normalize();const arrow=new THREE.Mesh(new THREE.ConeGeometry(.28,.75,10),holoMat(0x7df8ff,.86));arrow.position.copy(p).add(new THREE.Vector3(0,.35,0));arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir);arrowGroup.add(arrow)}const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.18,.7,7,18,1,true),holoMat(0xffd75c,.22));beacon.position.set(to.x,3.5,to.z);arrowGroup.add(beacon);const top=new THREE.Mesh(new THREE.ConeGeometry(.7,1.5,12),holoMat(0xffe778,.78));top.position.set(to.x,7.5,to.z);top.rotation.x=Math.PI;arrowGroup.add(top)}
function makeCard(target:ConstructTarget,index:number){const g=new THREE.Group();const plate=new THREE.Mesh(new THREE.PlaneGeometry(3.8,1.25),holoMat(index%2?0x8b7dff:0x42e7ff,.22));plate.position.y=2.9;g.add(plate);const pin=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,2.2,6),holoMat(0x9af6ff,.45));pin.position.y=1.55;g.add(pin);const ring=new THREE.Mesh(new THREE.TorusGeometry(.48,.035,8,24),holoMat(0x62efff,.7));ring.rotation.x=Math.PI/2;ring.position.y=.35;g.add(ring);g.position.set(target.x,0,target.z);g.userData.label=target.label;return g}
function rebuildCards(){clearGroup(cardGroup);if(!state?.active)return;state.targets.slice(0,10).forEach((t,i)=>cardGroup.add(makeCard(t,i)))}
function startScan(){scanStart=performance.now();if(!scanRing){scanRing=new THREE.Mesh(new THREE.RingGeometry(1.8,2.05,96),holoMat(0x65efff,.82));scanRing.rotation.x=-Math.PI/2;world.add(scanRing)}}
function animate(){
 if(!ensureRenderer()){raf=requestAnimationFrame(animate);return}
 const w=innerWidth,h=innerHeight;camera!.aspect=w/Math.max(1,h);camera!.updateProjectionMatrix();renderer!.setSize(w,h,false)
 const p=state?.player||{x:0,z:58};camera!.position.lerp(new THREE.Vector3(p.x+17,13,p.z+22),.08);camera!.lookAt(p.x,1.5,p.z)
 bennyGroup.position.set(p.x+3,0,p.z+2.5);bennyGroup.position.y=.15+Math.sin(performance.now()*.003)*.08;bennyGroup.rotation.y=-.35+Math.sin(performance.now()*.0014)*.12
 arrowGroup.children.forEach((o,i)=>{o.position.y+=(Math.sin(performance.now()*.004+i)*.002)})
 cardGroup.children.forEach((o,i)=>{o.lookAt(camera!.position.x,o.position.y+2.7,camera!.position.z);o.position.y=.15+Math.sin(performance.now()*.002+i)*.12})
 if(scanRing){const age=(performance.now()-scanStart)/1000;if(age<1.4&&state?.active){scanRing.visible=true;scanRing.position.set(p.x,.08,p.z);const s=1+age*13;scanRing.scale.setScalar(s);(scanRing.material as THREE.MeshBasicMaterial).opacity=Math.max(0,.82-age*.58)}else scanRing.visible=false}
 renderer!.render(scene!,camera!);raf=requestAnimationFrame(animate)
}
function onState(next:ConstructState){state=next;if(routeTarget){const found=next.targets.find(t=>t.id===routeTarget!.id);routeTarget=found||routeTarget}rebuildCards();rebuildRoute()}

export function installStreetVerseFreeSpaceConstruct3D(){
 if(installed||typeof window==='undefined')return
 installed=true
 window.addEventListener('tryamm:construct:state',(e:Event)=>onState((e as CustomEvent<ConstructState>).detail))
 window.addEventListener('tryamm:construct:route',(e:Event)=>{const d=(e as CustomEvent<{to?:ConstructTarget}>).detail||{};if(d.to){routeTarget=d.to;rebuildRoute()}})
 window.addEventListener('tryamm:construct:scan-result',()=>startScan())
 window.addEventListener('tryamm:streetverse-exit',()=>{if(renderer?.domElement)renderer.domElement.style.display='none'})
 window.addEventListener('tryamm:streetverse-enter',()=>{ensureRenderer();if(renderer?.domElement)renderer.domElement.style.display='block'})
 ensureRenderer();raf=requestAnimationFrame(animate)
 window.dispatchEvent(new CustomEvent('tryamm:construct:free-space-3d-ready',{detail:{simulatedFreeSpaceHologram:true,physicalProjection:false,visuals:['depth-layers','floating-panels','world-anchors','translucent-benny','scanning-grid','3d-pointers','vector-pavement-trail','mission-arrows','chronicle-cards','construct-scan-pulse']}}))
}
