import {useEffect,useRef} from 'react'
import * as THREE from 'three'
import {createCircleParkHologram} from '../game/holographic/CircleParkHolographicPrototype'

export default function CircleParkHolographicWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null)
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b14);scene.fog=new THREE.Fog(0x050b14,55,150)
  const camera=new THREE.PerspectiveCamera(62,1,.1,220);camera.position.set(0,10,-58);camera.lookAt(0,5,0)
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x8fefff,0x101018,2.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-20,35,-20);scene.add(key)
  const world=createCircleParkHologram('interactive-demo');scene.add(world)
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  let raf=0;const tick=()=>{world.rotation.y=Math.sin(performance.now()/7000)*.04;renderer.render(scene,camera);raf=requestAnimationFrame(tick)};tick()
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();renderer.domElement.remove()}
 },[])
 return <div style={{position:'fixed',inset:0,zIndex:2500,background:'#050b14'}}>
   <div ref={mountRef} style={{position:'absolute',inset:0}}/>
   <div style={{position:'absolute',top:12,left:12,right:12,padding:12,border:'1px solid #00ffcc88',borderRadius:14,background:'#07131dcc',color:'#eaffff',fontFamily:'system-ui'}}>
    <b>CIRCLE PARK • HOLOGRAPHIC RECONSTRUCTION</b><div style={{fontSize:12,opacity:.82}}>Conceptual massing prototype • source-backed geometry replaces these masses as reconstruction evidence is cleared.</div>
   </div>
   <button onClick={onClose} style={{position:'absolute',right:16,bottom:20,padding:'12px 18px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131b',color:'#fff'}}>EXIT CIRCLE PARK</button>
 </div>
}
