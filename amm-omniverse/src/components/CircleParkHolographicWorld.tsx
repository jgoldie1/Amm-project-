import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {createCircleParkHologram} from '../game/holographic/CircleParkHolographicPrototype'
import {CIRCLE_PARK_TWIN,createTwinDebugOverlay} from '../game/holographic/DigitalTwinPipeline'

export default function CircleParkHolographicWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null)
 const input=useRef({x:0,z:0});const [message,setMessage]=useState('Walk to the glowing entrance.')
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b14);scene.fog=new THREE.Fog(0x050b14,55,150)
  const camera=new THREE.PerspectiveCamera(62,1,.1,220)
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x8fefff,0x101018,2.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-20,35,-20);scene.add(key)
  const world=createCircleParkHologram('interactive-demo');scene.add(world);scene.add(createTwinDebugOverlay(CIRCLE_PARK_TWIN))
  const player=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.25,4,8),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x00ccff,emissiveIntensity:.45}));player.position.set(0,1.4,-46);scene.add(player)
  camera.position.set(0,7,-57);camera.lookAt(player.position)
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  let raf=0,last=performance.now();const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;player.position.x=THREE.MathUtils.clamp(player.position.x+input.current.x*9*dt,-43,43);player.position.z=THREE.MathUtils.clamp(player.position.z+input.current.z*9*dt,-48,31);camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+5,player.position.z-11),.08);camera.lookAt(player.position.x,player.position.y+1,player.position.z+4);if(player.position.distanceTo(new THREE.Vector3(0,1.4,-35))<4)setMessage('Entrance reached • OPEN DEMO available');renderer.render(scene,camera);raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick)
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();renderer.domElement.remove()}
 },[])
 const move=(x:number,z:number)=>{input.current={x,z}}
 const stop=()=>{input.current={x:0,z:0}}
 const btn=(label:string,x:number,z:number)=><button onPointerDown={()=>move(x,z)} onPointerUp={stop} onPointerCancel={stop} style={{width:58,height:58,borderRadius:29,border:'1px solid #00ffcc',background:'#06131bdd',color:'#fff',fontSize:22,touchAction:'none'}}>{label}</button>
 return <div style={{position:'fixed',inset:0,zIndex:2500,background:'#050b14'}}>
  <div ref={mountRef} style={{position:'absolute',inset:0}}/>
  <div style={{position:'absolute',top:12,left:12,right:12,padding:12,border:'1px solid #00ffcc88',borderRadius:14,background:'#07131dcc',color:'#eaffff',fontFamily:'system-ui'}}><b>CIRCLE PARK • HOLOGRAPHIC DIGITAL TWIN</b><div style={{fontSize:12,opacity:.82}}>Conceptual massing • CAD/BIM source geometry pending rights/evidence verification.</div><div style={{fontSize:12,marginTop:5}}>{message}</div></div>
  <div aria-label="Circle Park movement controls" style={{position:'absolute',left:18,bottom:20,display:'grid',gridTemplateColumns:'58px 58px 58px',gap:5}}><span/>{btn('↑',0,1)}<span/>{btn('←',-1,0)}{btn('↓',0,-1)}{btn('→',1,0)}</div>
  <button onClick={()=>setMessage('Interactive entrance demo activated • authorized interior/CAD geometry is the next fidelity layer.')} style={{position:'absolute',right:16,bottom:82,padding:'12px 16px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131bdd',color:'#fff'}}>OPEN DEMO</button>
  <button onClick={onClose} style={{position:'absolute',right:16,bottom:20,padding:'12px 18px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131b',color:'#fff'}}>EXIT</button>
 </div>
}
