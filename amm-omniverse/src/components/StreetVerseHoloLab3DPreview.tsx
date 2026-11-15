import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {createHoloLabChamberScene} from '../runtime/StreetVerseHoloLabThreeScene'
import type {ChicagoEra} from '../runtime/StreetVerseChicagoTimeSwitchRuntime'

/** Standalone live Three.js demonstration. BJ is a temporary humanoid proxy until GLB is connected. */
export function StreetVerseHoloLab3DPreview(){
 const host=useRef<HTMLDivElement>(null)
 const [era,setEra]=useState<ChicagoEra>('present')
 const [status,setStatus]=useState('3D chamber ready')
 useEffect(()=>{
  const node=host.current;if(!node)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})}catch{setStatus('3D unavailable on this device');return}
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x10182c)
  const camera=new THREE.PerspectiveCamera(60,1,0.1,100);camera.position.set(7,5,10);camera.lookAt(0,1,-2)
  scene.add(new THREE.HemisphereLight(0xffffff,0x303344,2))
  const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(3,8,5);scene.add(light)
  const chamber=createHoloLabChamberScene(scene)
  const proxy=new THREE.Group()
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(0.3,1.05,6,12),new THREE.MeshStandardMaterial({color:0x222f44}))
  torso.position.y=1.1;proxy.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.24,16,12),new THREE.MeshStandardMaterial({color:0x76513d}))
  head.position.y=2.12;proxy.add(head)
  proxy.position.x=-3;scene.add(proxy)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
  const resize=()=>{const w=Math.max(1,node.clientWidth),h=Math.max(1,node.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  node.appendChild(renderer.domElement);resize()
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(node)
  let raf=0,travelStart=0
  let motionStage='outside'
  let proxyTargetX=-3
  const onMotion=(event:Event)=>{
   const detail=(event as CustomEvent).detail as {stage?:string}
   if(!detail?.stage)return
   motionStage=detail.stage
   proxyTargetX=motionStage==='outside'?-3:motionStage==='approaching'?-1.3:0
   if(motionStage==='warping')travelStart=performance.now()
   setStatus('BJ 3D proxy: '+motionStage)
  }
  const onTravel=(event:Event)=>{
   const detail=(event as CustomEvent).detail as {era?:ChicagoEra;confirmed?:boolean}
   if(detail?.confirmed===true&&detail?.era&&['past','present','future'].includes(detail.era)){
    chamber.setWarp(1);travelStart=performance.now();chamber.switchEra(detail.era);setEra(detail.era);setStatus('3D era changed: '+detail.era)
   }
  }
  window.addEventListener('tryamm:hololab-demo-scene-request',onTravel)
  window.addEventListener('tryamm:hololab-motion',onMotion)
  const animate=(now:number)=>{raf=requestAnimationFrame(animate);proxy.position.x+=Math.max(-0.045,Math.min(0.045,proxyTargetX-proxy.position.x));proxy.rotation.y=0.3;chamber.setWarp(travelStart?Math.max(0,1-(now-travelStart)/1400):0);renderer.render(scene,camera)}
  raf=requestAnimationFrame(animate)
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('tryamm:hololab-demo-scene-request',onTravel);window.removeEventListener('tryamm:hololab-motion',onMotion);observer?.disconnect();chamber.dispose();proxy.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose()}});renderer.dispose();renderer.domElement.remove()}
 },[])
 return <section aria-label="HoloLab live 3D chamber preview" style={{background:'#11182a',color:'white',padding:10,borderRadius:12,maxWidth:410}}>
  <strong>HOLOLAB • LIVE 3D CHAMBER</strong>
  <div ref={host} style={{width:'100%',height:240,marginTop:8}}/>
  <p role="status" aria-live="polite">{status} • {era.toUpperCase()}</p>
  <small>Procedural 3D scenery and animated BJ proxy. Not the rigged BJ GLB or production Chicago map.</small>
 </section>
}
