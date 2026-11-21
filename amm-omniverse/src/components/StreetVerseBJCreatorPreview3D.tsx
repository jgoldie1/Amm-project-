import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
const BJ_V15='/assets/characters/BJ_STUBBS_V15_RECOVERED.glb'
/** Optional low-cost 3D preview. Does NOT invent or fake a skinned jacket mesh. */
export function StreetVerseBJCreatorPreview3D({jacketColor}:{jacketColor:string}){
 const mount=useRef<HTMLDivElement|null>(null)
 const [status,setStatus]=useState('Preparing BJ V15 preview')
 useEffect(()=>{
  const root=mount.current
  if(!root)return
  let renderer:THREE.WebGLRenderer|null=null,frame=0,ended=false
  try{
   renderer=new THREE.WebGLRenderer({antialias:false,alpha:false,powerPreference:'low-power'})
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.25))
   renderer.setSize(root.clientWidth||320,220)
   root.appendChild(renderer.domElement)
  }catch{
   setStatus('3D is unavailable on this device. Use the lightweight jacket preview.')
   return
  }
  const scene=new THREE.Scene();scene.background=new THREE.Color('#101728')
  scene.add(new THREE.HemisphereLight(0xffffff,0x343d5c,2))
  const light=new THREE.DirectionalLight(0xffffff,2.0);light.position.set(2,4,3);scene.add(light)
  const camera=new THREE.PerspectiveCamera(43,(root.clientWidth||320)/220,.01,100)
  camera.position.set(0,1.15,3.6)
  const target=new THREE.Group();scene.add(target)
  const loader=new GLTFLoader()
  loader.load(BJ_V15,gltf=>{
   if(ended)return
   const model=gltf.scene
   const box=new THREE.Box3().setFromObject(model)
   const size=box.getSize(new THREE.Vector3())
   if(Math.max(size.x,size.y,size.z)>0){
    const scale=1.9/Math.max(size.y,0.01)
    model.scale.setScalar(scale)
    const b=new THREE.Box3().setFromObject(model)
    model.position.sub(b.getCenter(new THREE.Vector3()))
    model.position.y+=.05
   }
   target.add(model)
   setStatus('BJ 3D model loaded from asset route; identity is validated only by the CI SHA-256 release gate. Jacket remains an unfitted color swatch.')
  },undefined,()=>{
   if(!ended)setStatus('Verified BJ V15 asset is not installed at this URL. 2D jacket preview remains available.')
  })
  const prefersReducedMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches??false
  const animate=()=>{
   if(ended)return
   if(!document.hidden){
    if(!prefersReducedMotion)target.rotation.y+=.003
    renderer?.render(scene,camera)
   }
   frame=requestAnimationFrame(animate)
  }
  animate()
  return()=>{ended=true;cancelAnimationFrame(frame);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;for(const part of Array.isArray(m)?m:[m])part.dispose()}});renderer?.dispose();renderer?.domElement.remove()}
 },[])
 return <section aria-label="BJ V15 3D character preview">
  <div ref={mount} style={{width:'100%',minHeight:220,background:'#101728',borderRadius:12,overflow:'hidden'}}/>
  <p role="status" style={{fontSize:12}}>{status}</p>
  <div style={{display:'flex',alignItems:'center',gap:12}}><span style={{width:36,height:36,borderRadius:8,background:jacketColor,border:'2px solid white'}}/><span>Selected jacket color; actual skinned clothing attachment remains gated.</span></div>
 </section>
}
