import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

/** Lightweight original Three.js prototype, not an imported facial-likeness GLB.
 * Real SkinnedMesh with 2 bones proves the renderer's skinning path, not the production character.
 * Rendering is entirely local; miracle events are explicitly fictional visualizations.
 */
export default function FaithVerseWaterWalk3D({active=true}:{active?:boolean}){
 const host=useRef<HTMLDivElement>(null)
 const [status,setStatus]=useState('Preparing original Three.js water scene')
 const [paused,setPaused]=useState(false)
 const [quality,setQuality]=useState<'low'|'standard'>('low')
 const [webgl,setWebgl]=useState<boolean|null>(null)
 useEffect(()=>{
  const mount=host.current;if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:quality==='standard',powerPreference:'low-power',alpha:false})}
  catch{setStatus('WebGL unavailable: use the accessible 2D miracle theater');setWebgl(false);return}
  setWebgl(true)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality==='low'?1:1.5))
  renderer.setClearColor(0x11253e)
  mount.replaceChildren(renderer.domElement)
  renderer.domElement.setAttribute('aria-label','Original 3D Galilee water scene with an animated rigged mannequin and waves')
  renderer.domElement.setAttribute('role','img')
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(47,1,.1,80)
  camera.position.set(5,4.6,8.5);camera.lookAt(0,1.1,0)
  scene.add(new THREE.HemisphereLight(0xddeeff,0x24434b,2))
  const sun=new THREE.DirectionalLight(0xffe4b7,2.2);sun.position.set(-3,9,6);scene.add(sun)
  const waterGeometry=new THREE.PlaneGeometry(30,25,quality==='low'?24:45,quality==='low'?20:40)
  const base=new Float32Array(waterGeometry.attributes.position.array)
  const water=new THREE.Mesh(waterGeometry,new THREE.MeshStandardMaterial({color:0x236a8f,roughness:.52,metalness:.14,side:THREE.DoubleSide,flatShading:quality==='low'}))
  water.rotation.x=-Math.PI/2;water.position.y=-.2;scene.add(water)
  const actor=new THREE.Group();actor.position.set(-2,0,0);scene.add(actor)
  const robeMaterial=new THREE.MeshStandardMaterial({color:0xe1d0a9,roughness:.85,side:THREE.DoubleSide})
  const torso=new THREE.CylinderGeometry(.38,.47,1.65,quality==='low'?9:18,12,true)
  const pos=torso.getAttribute('position'),indices:number[]=[],weights:number[]=[]
  for(let i=0;i<pos.count;i++){
   const v=Math.max(0,Math.min(1,(pos.getY(i)+.825)/1.65))
   indices.push(0,1,0,0);weights.push(1-v,v,0,0)
  }
  torso.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4))
  torso.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4))
  const rootBone=new THREE.Bone(),upperBone=new THREE.Bone()
  rootBone.position.y=-.825;upperBone.position.y=1.65;rootBone.add(upperBone)
  const skin=new THREE.SkinnedMesh(torso,robeMaterial)
  skin.add(rootBone);skin.bind(new THREE.Skeleton([rootBone,upperBone]))
  skin.position.y=1.45;actor.add(skin)
  const brown=new THREE.MeshStandardMaterial({color:0x563225,roughness:.88})
  const head=new THREE.Mesh(new THREE.SphereGeometry(.34,quality==='low'?12:20,quality==='low'?10:16),brown)
  head.position.y=.5;upperBone.add(head)
  const mantle=new THREE.Mesh(new THREE.ConeGeometry(.45,.78,quality==='low'?9:18),new THREE.MeshStandardMaterial({color:0x213a78,roughness:.8,side:THREE.DoubleSide}))
  mantle.rotation.z=Math.PI;mantle.position.y=-.25;upperBone.add(mantle)
  const legMaterial=new THREE.MeshStandardMaterial({color:0x785c49,roughness:.9})
  for(const side of [-1,1]){
   const limb=new THREE.Mesh(new THREE.CylinderGeometry(.12,.13,.9,8),legMaterial)
   limb.position.set(side*.17,.28,0);actor.add(limb)
   const arm=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,1,8),brown)
   arm.position.set(side*.51,-.25,0);arm.rotation.z=side*.22;upperBone.add(arm)
  }
  const boat=new THREE.Mesh(new THREE.CylinderGeometry(.36,.45,1.3,10,1),new THREE.MeshStandardMaterial({color:0x6b4527,roughness:.95}))
  boat.rotation.z=Math.PI/2;boat.position.set(-3,.05,-2);scene.add(boat)
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false
  const clock=new THREE.Clock();let elapsed=0,frame=0,raf=0,disposed=false
  const resize=()=>{const w=Math.max(1,mount.clientWidth),h=Math.max(180,mount.clientHeight);renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
  const observer=new ResizeObserver(resize);observer.observe(mount);resize()
  const frameLoop=()=>{
   if(disposed)return
   raf=requestAnimationFrame(frameLoop)
   const delta=Math.min(clock.getDelta(),.05)
   if(!active||paused||document.visibilityState==='hidden'||reduced)return
   elapsed+=delta;frame++
   const arr=waterGeometry.attributes.position as THREE.BufferAttribute
   for(let i=0;i<arr.count;i++){
    const x=base[i*3],y=base[i*3+1]
    arr.setZ(i,Math.sin(x*.52+elapsed*1.1)*.085+Math.cos(y*.48+elapsed*.9)*.065)
   }
   arr.needsUpdate=true
   if(frame%12===0)waterGeometry.computeVertexNormals()
   actor.position.x=-2+((elapsed*.25)%4)
   actor.position.y=Math.sin(elapsed*1.3)*.04
   upperBone.rotation.z=Math.sin(elapsed*2.2)*.13
   upperBone.rotation.x=Math.sin(elapsed*.9)*.07
   renderer.render(scene,camera)
  }
  renderer.render(scene,camera);frameLoop()
  setStatus('Original WebGL 3D scene running: 2-bone skinned mannequin, moving water and camera. Actual Yeshua likeness not verified.')
  return()=>{disposed=true;cancelAnimationFrame(raf);observer.disconnect();waterGeometry.dispose();torso.dispose();robeMaterial.dispose();brown.dispose();legMaterial.dispose();skin.skeleton.dispose();renderer.dispose();renderer.domElement.remove();scene.clear()}
 },[quality,paused,active])
 return <section aria-label="Three-dimensional FaithVerse water-walking preview" style={{display:'grid',gap:8}}>
  <div ref={host} style={{height:250,minHeight:220,borderRadius:14,overflow:'hidden',background:'#10233a',border:'1px solid #7194aa'}}/>
  <p role="status" aria-live="polite" style={{fontSize:12,margin:0,lineHeight:1.5}}>{status}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   <button style={{minHeight:56,fontWeight:700,borderRadius:12}} disabled={webgl===false} onClick={()=>setPaused(v=>!v)}>{paused?'Resume motion':'Pause motion'}</button>
   <button style={{minHeight:56,fontWeight:700,borderRadius:12}} onClick={()=>setQuality(q=>q==='low'?'standard':'low')}>Quality: {quality}</button>
  </div>
  <p style={{fontSize:12,margin:0}}>Prototype uses actual Three.js skeletal skinning but deliberately uses an original generic mannequin; this is not a verified 3D Yeshua GLB, historically accurate model, multiplayer session, or phone performance certification.</p>
 </section>
}
