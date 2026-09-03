import {useEffect,useRef} from 'react'
import * as THREE from 'three'

type BikeTelemetry={speed?:number;steer?:number;leanDeg?:number;wheelie?:boolean;stoppie?:boolean;crashed?:boolean;recovering?:boolean;profile?:string;surface?:string}

export default function StreetVerseMotorcycleVisual(){
 const mount=useRef<HTMLDivElement|null>(null)
 useEffect(()=>{
  const root=mount.current;if(!root)return
  const scene=new THREE.Scene()
  const camera=new THREE.PerspectiveCamera(44,1,.1,80);camera.position.set(7,4.2,8);camera.lookAt(0,1.2,0)
  const renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setSize(250,150,false);renderer.outputColorSpace=THREE.SRGBColorSpace;root.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xbfe8ff,0x181818,2.4));const key=new THREE.DirectionalLight(0xffffff,3);key.position.set(5,9,4);scene.add(key)
  const mat=(c:number,m=.2,r=.55)=>new THREE.MeshStandardMaterial({color:c,metalness:m,roughness:r})
  const bike=new THREE.Group(),body=new THREE.Group();bike.add(body);scene.add(bike)
  const frame=new THREE.Mesh(new THREE.BoxGeometry(3.25,.28,.42),mat(0x46dfff,.72,.24));frame.position.y=1.02;body.add(frame)
  const tank=new THREE.Mesh(new THREE.SphereGeometry(.62,14,10),mat(0x1373a8,.65,.23));tank.scale.set(1.2,.72,.72);tank.position.set(.25,1.48,0);body.add(tank)
  const seat=new THREE.Mesh(new THREE.BoxGeometry(1.35,.24,.58),mat(0x17191d,.05,.9));seat.position.set(-.8,1.55,0);body.add(seat)
  const fork=new THREE.Mesh(new THREE.BoxGeometry(.15,1.55,.15),mat(0xb6c6d1,.8,.18));fork.position.set(1.48,1.05,0);fork.rotation.z=-.2;body.add(fork)
  const handle=new THREE.Mesh(new THREE.BoxGeometry(.22,.18,1.25),mat(0xc8d5de,.8,.2));handle.position.set(1.42,1.86,0);body.add(handle)
  const rearSwing=new THREE.Mesh(new THREE.BoxGeometry(1.25,.18,.18),mat(0x777d84,.65,.3));rearSwing.position.set(-1.15,.72,0);rearSwing.rotation.z=.12;body.add(rearSwing)
  const wheels:THREE.Mesh[]=[];for(const x of [-1.55,1.55]){const w=new THREE.Mesh(new THREE.TorusGeometry(.72,.16,10,22),mat(0x111318,.05,.92));w.rotation.x=Math.PI/2;w.position.set(x,.72,0);body.add(w);wheels.push(w)}
  const rider=new THREE.Group();body.add(rider);const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.33,.85,4,8),mat(0x272e3a,.05,.7));torso.position.set(-.05,2.35,0);torso.rotation.z=-.3;rider.add(torso);const head=new THREE.Mesh(new THREE.SphereGeometry(.32,12,9),mat(0x14161c,.2,.45));head.position.set(.38,2.98,0);rider.add(head)
  const visor=new THREE.Mesh(new THREE.BoxGeometry(.15,.16,.4),new THREE.MeshBasicMaterial({color:0x63dfff,transparent:true,opacity:.72}));visor.position.set(.64,3.0,0);rider.add(visor)
  for(const s of [-1,1]){const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.09,.62,3,6),mat(0x272e3a));arm.position.set(.35,2.35,s*.38);arm.rotation.z=-.72;arm.rotation.x=s*.18;rider.add(arm);const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.76,3,6),mat(0x171b22));leg.position.set(-.55,1.75,s*.27);leg.rotation.z=.58;rider.add(leg)}
  const shadow=new THREE.Mesh(new THREE.CircleGeometry(1.85,24),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:.28}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.03;scene.add(shadow)
  let data:BikeTelemetry={},raf=0,last=performance.now(),spin=0
  const onBike=(e:Event)=>{data=(e as CustomEvent<BikeTelemetry>).detail||{}}
  addEventListener('tryamm:streetverse-motorcycle-telemetry',onBike)
  const animate=(now:number)=>{const dt=Math.min(.04,(now-last)/1000);last=now;const speed=Number(data.speed||0);spin+=speed*dt*.75;wheels.forEach(w=>w.rotation.z=spin);const lean=THREE.MathUtils.degToRad(Number(data.leanDeg||0));const pitch=data.wheelie?-.28:data.stoppie?.24:0;body.rotation.x=THREE.MathUtils.lerp(body.rotation.x,pitch,.12);body.rotation.z=THREE.MathUtils.lerp(body.rotation.z,data.crashed?1.18:lean,.14);body.position.y=THREE.MathUtils.lerp(body.position.y,data.wheelie?.22:data.stoppie?.12:0,.12);rider.rotation.z=THREE.MathUtils.lerp(rider.rotation.z,data.crashed?.5:lean*.55,.12);shadow.scale.setScalar(data.crashed?1.25:1);renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  raf=requestAnimationFrame(animate)
  return()=>{cancelAnimationFrame(raf);removeEventListener('tryamm:streetverse-motorcycle-telemetry',onBike);renderer.dispose();renderer.domElement.remove()}
 },[])
 return <div ref={mount} aria-label="StreetVerse motorcycle visual" style={{position:'fixed',right:12,bottom:92,width:250,height:150,zIndex:16988,pointerEvents:'none',borderRadius:18,overflow:'hidden',background:'radial-gradient(circle at 50% 80%,rgba(42,111,151,.36),rgba(3,8,14,.76))',border:'1px solid rgba(89,231,255,.38)',boxShadow:'0 12px 38px rgba(0,0,0,.35)'}}/>
}
