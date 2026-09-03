import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Ride={id?:string;label?:string;wheels?:number;className?:string;grip?:number;steer?:number;roll?:number;stunts?:string[]}
type Pos={x:number;z:number}
type Drive={entered?:boolean;speed?:number;steer?:number;throttle?:number;brake?:number;heading?:number;surface?:string;gripMultiplier?:number}

const mat=(c:number,m=.2,r=.65)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r})
function makeWheel(radius=.48,width=.34){const w=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius,width,14),mat(0x111214,.02,.94));w.rotation.x=Math.PI/2;w.castShadow=true;return w}
function makeRide(ride:Ride){
 const g=new THREE.Group();const id=ride.id||'sport-bike';const wheels=ride.wheels||2
 const bodyColor=id.includes('electric')?0x49e3ff:id.includes('dirt')||id.includes('atv')||id.includes('buggy')||id.includes('utv')?0xffb341:id.includes('three')?0xff4f7b:0x4b8dff
 if(wheels===2){
  const frame=new THREE.Mesh(new THREE.BoxGeometry(2.5,.42,.48),mat(bodyColor,.55,.35));frame.position.y=.82;g.add(frame)
  const tank=new THREE.Mesh(new THREE.SphereGeometry(.62,12,10),mat(bodyColor,.45,.3));tank.scale.set(1.15,.62,.82);tank.position.set(.15,1.28,0);g.add(tank)
  const seat=new THREE.Mesh(new THREE.BoxGeometry(.9,.22,.55),mat(0x16191e,.05,.88));seat.position.set(-.7,1.25,0);g.add(seat)
  for(const x of [-1.05,1.15]){const w=makeWheel(.55,.24);w.position.set(x,.57,0);g.add(w)}
 }else if(wheels===3){
  const floor=new THREE.Mesh(new THREE.BoxGeometry(3.3,.45,1.8),mat(bodyColor,.5,.32));floor.position.y=.68;g.add(floor)
  const nose=new THREE.Mesh(new THREE.ConeGeometry(1.05,2.2,4),mat(bodyColor,.55,.3));nose.rotation.z=-Math.PI/2;nose.position.set(1.65,.88,0);g.add(nose)
  const rear=makeWheel(.58,.34);rear.position.set(-1.15,.6,0);g.add(rear)
  for(const z of [-.86,.86]){const w=makeWheel(.5,.3);w.position.set(1.05,.55,z);g.add(w)}
 }else{
  const compact=id==='go-kart';const buggy=id==='dune-buggy'||id==='utv';const length=compact?2.9:buggy?4.1:3.4;const width=compact?1.75:buggy?2.2:1.95
  const chassis=new THREE.Mesh(new THREE.BoxGeometry(length,.48,width),mat(bodyColor,.42,.4));chassis.position.y=.68;g.add(chassis)
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.05,.7,1.2),mat(0x191b20,.05,.85));seat.position.set(-.35,1.05,0);g.add(seat)
  if(buggy){for(const z of [-.88,.88]){const bar=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,1.7,6),mat(0xb7c4cf,.65,.35));bar.position.set(-.2,1.65,z);g.add(bar)}}
  for(const x of [-1.1,1.1])for(const z of [-width*.48,width*.48]){const w=makeWheel(compact?.42:.58,compact?.28:.36);w.position.set(x,.58,z);g.add(w)}
 }
 const glow=new THREE.PointLight(bodyColor,3.2,9,2);glow.position.set(1.3,1.25,0);g.add(glow)
 g.userData.ride=ride;return g
}

export default function StreetVersePowersportRuntime(){
 const mountRef=useRef<HTMLDivElement|null>(null);const [ride,setRide]=useState<Ride|null>(null);const [active,setActive]=useState(false)
 const playerRef=useRef<Pos>({x:0,z:54});const driveRef=useRef<Drive>({});const headingRef=useRef(0)
 useEffect(()=>{
  const onPos=(e:Event)=>{const d=(e as CustomEvent<Pos>).detail;if(d&&Number.isFinite(d.x)&&Number.isFinite(d.z))playerRef.current={x:d.x,z:d.z}}
  const onDrive=(e:Event)=>{driveRef.current=(e as CustomEvent<Drive>).detail||{}}
  const onSpawn=(e:Event)=>{const d=(e as CustomEvent<Ride>).detail||{};setRide(d);setActive(true);window.dispatchEvent(new CustomEvent('tryamm:streetverse-powersport-world-spawned',{detail:{...d,x:playerRef.current.x+4,z:playerRef.current.z+2,runtime:'threejs-powersport'}}))}
  const onClose=()=>setActive(false)
  addEventListener('tryamm:streetverse-player-position',onPos);addEventListener('tryamm:streetverse-drive-telemetry',onDrive);addEventListener('tryamm:streetverse-powersport-spawn',onSpawn);addEventListener('tryamm:streetverse-scene-close',onClose)
  return()=>{removeEventListener('tryamm:streetverse-player-position',onPos);removeEventListener('tryamm:streetverse-drive-telemetry',onDrive);removeEventListener('tryamm:streetverse-powersport-spawn',onSpawn);removeEventListener('tryamm:streetverse-scene-close',onClose)}
 },[])
 useEffect(()=>{
  const mount=mountRef.current;if(!mount||!ride||!active)return
  const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(54,1,.1,100);camera.position.set(7,5.5,9);camera.lookAt(0,1,0)
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.setClearAlpha(0);renderer.shadowMap.enabled=true;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xbfe9ff,0x19191d,2.5));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(4,8,5);scene.add(key)
  const root=makeRide(ride);scene.add(root);const floor=new THREE.Mesh(new THREE.CircleGeometry(3.5,32),new THREE.MeshBasicMaterial({color:0x0a1118,transparent:true,opacity:.42}));floor.rotation.x=-Math.PI/2;floor.position.y=.02;scene.add(floor)
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight;camera.aspect=Math.max(.5,w/Math.max(1,h));camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(mount);resize()
  let raf=0,last=performance.now();const animate=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;const d=driveRef.current;const steer=Number(d.steer||0),speed=Number(d.speed||0),throttle=Number(d.throttle||0),brake=Number(d.brake||0);headingRef.current+=steer*(ride.steer||1)*dt*.55;root.rotation.y=headingRef.current;const roll=(ride.wheels===2?-.42:-.12)*steer*Math.min(1,speed/25)*(ride.roll||.4);root.rotation.z=THREE.MathUtils.lerp(root.rotation.z,roll,.12);const pitch=ride.wheels===2?(throttle>.85&&speed>9?-.16:brake>.78&&speed>8?.12:0):0;root.rotation.x=THREE.MathUtils.lerp(root.rotation.x,pitch,.1);root.children.forEach(o=>{if(o instanceof THREE.Mesh&&o.geometry instanceof THREE.CylinderGeometry&&speed>0)o.rotation.z-=speed*dt*.9});renderer.render(scene,camera);raf=requestAnimationFrame(animate)};raf=requestAnimationFrame(animate)
  return()=>{cancelAnimationFrame(raf);ro.disconnect();renderer.dispose();renderer.domElement.remove()}
 },[ride,active])
 if(!ride||!active)return null
 return <div style={{position:'fixed',right:12,bottom:188,zIndex:16996,width:230,height:150,pointerEvents:'none',border:'1px solid #59e7ff44',borderRadius:14,overflow:'hidden',background:'linear-gradient(180deg,rgba(3,10,18,.18),rgba(3,10,18,.72))'}}><div ref={mountRef} style={{position:'absolute',inset:0}}/><div style={{position:'absolute',left:8,bottom:7,right:8,color:'#fff',fontFamily:'system-ui',fontSize:9,fontWeight:900,textShadow:'0 1px 3px #000'}}>WORLD SPAWN • {ride.label}<br/><span style={{opacity:.7}}>GRIP {(ride.grip||1).toFixed(2)} • STEER {(ride.steer||1).toFixed(2)} • {ride.wheels||2} WHEELS</span></div></div>
}
