import React,{useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {advanceHoloLabCharacter,HOLOLAB_SAFE_SPAWNS} from '../runtime/StreetVerseHoloLabCollision'
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
  proxy.position.x=-3;proxy.visible=false;scene.add(proxy)
  let activeCharacter:THREE.Object3D=proxy
  let mixer:THREE.AnimationMixer|null=null
  let walkAction:THREE.AnimationAction|null=null
  const modelUrl=(import.meta.env.VITE_STREETVERSE_BJ_GLB_URL as string|undefined)?.trim()||'/assets/characters/BJ_STUBBS_V15_RECOVERED.glb'
  if(modelUrl.startsWith('/'))new GLTFLoader().load(modelUrl,gltf=>{
   if(disposed)return
   if(!gltf.scene||!gltf.scene.getObjectByProperty('type','SkinnedMesh')||!gltf.animations.length){setStatus('ERROR: BJ rig invalid; production preview unavailable');return}
   gltf.scene.position.copy(proxy.position)
   scene.remove(proxy);scene.add(gltf.scene);activeCharacter=gltf.scene
   mixer=new THREE.AnimationMixer(gltf.scene)
   const walk=gltf.animations.find(a=>/walk|run/i.test(a.name))
   if(walk)walkAction=mixer.clipAction(walk)
   setStatus('Rigged BJ GLB loaded with '+gltf.animations.length+' animation clips')
  },undefined,()=>{if(!disposed)setStatus('ERROR: BJ V15 GLB missing; install verified asset to continue')})
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
  const resize=()=>{const w=Math.max(1,node.clientWidth),h=Math.max(1,node.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  node.appendChild(renderer.domElement);resize()
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;observer?.observe(node)
  let raf=0,travelStart=0,lastFrame=0
  let acknowledgeEra:ChicagoEra|null=null
  let preparedEra:ChicagoEra|null=null
  let disposed=false
  let motionStage='outside'
  let proxyTargetX:number=HOLOLAB_SAFE_SPAWNS.outside.x
  const onMotion=(event:Event)=>{
   const detail=(event as CustomEvent).detail as {stage?:string}
   if(!detail?.stage)return
   motionStage=detail.stage
   proxyTargetX=motionStage==='outside'?-3:motionStage==='approaching'?-1.3:0
   if(motionStage==='warping')travelStart=performance.now()
   setStatus('BJ V15 motion: '+motionStage)
  }
  const onTravel=(event:Event)=>{
   const detail=(event as CustomEvent).detail as {era?:ChicagoEra;phase?:'prepare'|'commit'|'cancel'}
   if(detail?.phase==='cancel'){
    preparedEra=null;acknowledgeEra=null;setStatus('Travel cancelled; current scene preserved');return
   }
   if(!detail?.era||!['past','present','future'].includes(detail.era))return
   if(detail.phase==='prepare'){
    // Preparation only acknowledges an operational renderer; it MUST NOT change the visible timeline.
    preparedEra=detail.era;acknowledgeEra=detail.era;setStatus('Destination prepared: '+detail.era);return
   }
   if(detail.phase==='commit'&&preparedEra===detail.era){
    chamber.setWarp(1);travelStart=performance.now();chamber.switchEra(detail.era);setEra(detail.era)
    preparedEra=null;acknowledgeEra=null;setStatus('3D arrival committed: '+detail.era)
   }
  }
  window.addEventListener('tryamm:hololab-demo-scene-request',onTravel)
  window.addEventListener('tryamm:hololab-motion',onMotion)
  const animate=(now:number)=>{raf=requestAnimationFrame(animate);const delta=lastFrame?Math.min((now-lastFrame)/1000,0.05):0;lastFrame=now;const distance=proxyTargetX-activeCharacter.position.x;const next=advanceHoloLabCharacter({x:activeCharacter.position.x,z:activeCharacter.position.z},{x:proxyTargetX,z:0},2.5,delta,[]);activeCharacter.position.set(next.x,activeCharacter.position.y,next.z);activeCharacter.rotation.y=0.3;if(walkAction){if(Math.abs(distance)>0.08){if(!walkAction.isRunning())walkAction.play()}else walkAction.stop()}mixer?.update(delta);chamber.setWarp(travelStart?Math.max(0,1-(now-travelStart)/1400):0);renderer.render(scene,camera);if(acknowledgeEra){window.dispatchEvent(new CustomEvent('tryamm:hololab-scene-rendered',{detail:{era:acknowledgeEra}}));acknowledgeEra=null}}
  raf=requestAnimationFrame(animate)
  return ()=>{disposed=true;cancelAnimationFrame(raf);window.removeEventListener('tryamm:hololab-demo-scene-request',onTravel);window.removeEventListener('tryamm:hololab-motion',onMotion);observer?.disconnect();chamber.dispose();mixer?.stopAllAction();proxy.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(o.material as THREE.Material).dispose()}});renderer.dispose();renderer.domElement.remove()}
 },[])
 return <section aria-label="HoloLab live 3D chamber preview" style={{background:'#11182a',color:'white',padding:10,borderRadius:12,maxWidth:410}}>
  <strong>HOLOLAB • LIVE 3D CHAMBER</strong>
  <div ref={host} style={{width:'100%',height:240,marginTop:8}}/>
  <p role="status" aria-live="polite">{status} • {era.toUpperCase()}</p>
  <small>Rigged BJ V15 is required for release. Missing/invalid GLB is an explicit blocking error. Procedural scenery is not the production Chicago map.</small>
 </section>
}
