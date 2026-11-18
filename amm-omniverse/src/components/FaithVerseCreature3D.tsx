import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {FAITHVERSE_CREATURES,type CreatureKey} from '../data/FaithVerseCreatureArtDirection'

/** Original low-poly 3D encounter CONCEPT, not a production GLB or historical creature. */
export default function FaithVerseCreature3D({creature,animated=true}:{creature:CreatureKey;animated?:boolean}){
 const host=useRef<HTMLDivElement>(null)
 const [status,setStatus]=useState('Preparing original low-poly 3D art preview.')
 const [webgl,setWebgl]=useState<boolean|null>(null)
 const [rotate,setRotate]=useState(true)
 useEffect(()=>{
  const mount=host.current;if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'low-power'})}
  catch{setWebgl(false);setStatus('WebGL is unavailable. The accessible original 2D story image remains above.');return}
  setWebgl(true)
  renderer.setPixelRatio(Math.min(1.2,window.devicePixelRatio||1))
  renderer.setClearColor(creature==='watcher'?0x18172b:0x1d2d3b)
  renderer.domElement.setAttribute('role','img')
  renderer.domElement.setAttribute('aria-label',FAITHVERSE_CREATURES[creature].name+' original low-poly 3D fictional concept')
  renderer.domElement.style.cssText='display:block;width:100%;height:320px'
  mount.replaceChildren(renderer.domElement)
  const scene=new THREE.Scene()
  const fog=new THREE.Fog(creature==='watcher'?0x18172b:0x1d2d3b,7,24)
  scene.fog=fog
  scene.add(new THREE.HemisphereLight(0xc3d5f0,0x222034,1.65))
  const key=new THREE.DirectionalLight(0xffdab7,1.8);key.position.set(3,7,5);scene.add(key)
  const rim=new THREE.PointLight(creature==='watcher'?0xc970a5:0x8eb4d2,2.5,12);rim.position.set(-3,3,-1);scene.add(rim)
  const actor=new THREE.Group();scene.add(actor)
  const skin=new THREE.MeshStandardMaterial({color:creature==='watcher'?0x4a3b52:creature==='goliath'?0x866447:0x474658,roughness:1,flatShading:true})
  const armor=new THREE.MeshStandardMaterial({color:creature==='goliath'?0xa88d60:0x303244,roughness:.8,metalness:creature==='goliath'?.55:.12,flatShading:true})
  const shadow=new THREE.MeshStandardMaterial({color:creature==='watcher'?0x271b35:0x2b2d3d,roughness:1,flatShading:true,side:THREE.DoubleSide})
  const eyes=new THREE.MeshBasicMaterial({color:creature==='goliath'?0x211a17:0xd8a36b})
  const floor=new THREE.Mesh(new THREE.CircleGeometry(7,32),new THREE.MeshStandardMaterial({color:0x293b3e,roughness:1}))
  floor.rotation.x=-Math.PI/2;floor.position.y=-.02;scene.add(floor)
  function part(geometry:THREE.BufferGeometry,material:THREE.Material,parent:THREE.Group,x:number,y:number,z:number,name:string){
   const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name=name;parent.add(mesh);return mesh
  }
  const height=creature==='goliath'?2.8:creature==='nephilim'?4.5:3.8
  const body=part(new THREE.CylinderGeometry(creature==='nephilim'?.75:.55,.67,height*.43,creature==='goliath'?12:7),creature==='goliath'?armor:shadow,actor,0,height*.45,0,'torso')
  body.rotation.z=creature==='nephilim'?.08:0
  const head=part(new THREE.DodecahedronGeometry(creature==='nephilim'?.55:.36,0),skin,actor,0,height*.75,0,'head')
  head.scale.set(creature==='nephilim'?1.25:1,creature==='watcher'?1.4:1.05,1)
  for(const side of [-1,1]){
   const arm=part(new THREE.CylinderGeometry(creature==='nephilim'?.27:.20,.18,height*.45,7),skin,actor,side*(creature==='nephilim'?.85:.62),height*.40,0,'arm')
   arm.rotation.z=side*(creature==='nephilim'?.24:.17)
   const leg=part(new THREE.CylinderGeometry(.21,.18,height*.39,8),skin,actor,side*.26,height*.17,0,'leg')
   leg.rotation.z=side*.06
   part(new THREE.IcosahedronGeometry(creature==='goliath'?.034:.061,0),eyes,actor,side*.15,height*.78,.34,'eye')
  }
  let wings:THREE.Group|null=null
  if(creature==='watcher'){
   wings=new THREE.Group();actor.add(wings)
   for(const side of [-1,1]){
    const wingShape=new THREE.Shape()
    wingShape.moveTo(0,.18);wingShape.lineTo(side*1.1,1.55);wingShape.lineTo(side*2.0,1.9);wingShape.lineTo(side*1.55,.9)
    wingShape.lineTo(side*2.45,.55);wingShape.lineTo(side*1.1,.4);wingShape.lineTo(side*1.45,-.3)
    wingShape.lineTo(side*.15,-.15);wingShape.closePath()
    part(new THREE.ShapeGeometry(wingShape),shadow,wings,0,height*.49,-.25,'ragged-fictional-wing')
   }
  }
  if(creature==='goliath'){
   const helm=part(new THREE.CylinderGeometry(.48,.44,.28,12),armor,actor,0,height*.84,0,'helmet')
   helm.rotation.z=.03
   const shield=part(new THREE.CylinderGeometry(.65,.65,.08,8),armor,actor,-.80,height*.40,.36,'shield')
   shield.rotation.x=Math.PI/2
   const spear=part(new THREE.CylinderGeometry(.043,.043,3.4,8),armor,actor,.87,height*.47,.1,'spear')
   spear.rotation.z=-.13
  }else if(creature==='nephilim'){
   for(let i=0;i<5;i++){const crack=part(new THREE.BoxGeometry(.08,.4,.04),armor,actor,.3+(i%2)*.16,height*.41+(i-2)*.27,.57,'stone-crack');crack.rotation.z=i*.4}
  }
  const camera=new THREE.PerspectiveCamera(45,1,.1,90)
  camera.position.set(0,height*.48+1,creature==='nephilim'?10:8)
  camera.lookAt(0,height*.44,0)
  const resize=()=>{if(!mount)return;const width=Math.max(240,mount.clientWidth);camera.aspect=width/320;camera.updateProjectionMatrix();renderer.setSize(width,320,false)}
  resize()
  const observer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null
  observer?.observe(mount)
  let raf=0,disposed=false,clock=new THREE.Clock()
  const draw=()=>{
   if(disposed)return
   const t=clock.getElapsedTime()
   if(animated){actor.position.y=Math.sin(t*.9)*.035;head.rotation.y=Math.sin(t*.43)*.09;if(wings)wings.rotation.y=Math.sin(t*.7)*.07}
   if(rotate&&animated)actor.rotation.y+=.0025
   renderer.render(scene,camera);raf=requestAnimationFrame(draw)
  }
  raf=requestAnimationFrame(draw)
  setStatus(FAITHVERSE_CREATURES[creature].name+': playable visual preview only; no real 3D rigging, hostile NPC AI or historically verified appearance.')
  return()=>{disposed=true;cancelAnimationFrame(raf);observer?.disconnect();scene.traverse(obj=>{const mesh=obj as THREE.Mesh;if(mesh.isMesh){mesh.geometry.dispose();const materials=Array.isArray(mesh.material)?mesh.material:[mesh.material];materials.forEach(m=>m.dispose())}});renderer.dispose();renderer.domElement.remove()}
 },[creature,animated,rotate])
 return <section aria-label="Original fantasy creature 3D preview" style={{display:'grid',gap:9,border:'1px solid #997991',borderRadius:14,background:'#101a28',padding:12}}>
  <div ref={host} style={{minHeight:320,overflow:'hidden',borderRadius:10}}/>
  <p role="status" aria-live="polite" style={{fontSize:13,lineHeight:1.6,margin:0}}>{status}</p>
  {webgl&&<button onClick={()=>setRotate(v=>!v)} style={{minHeight:56,border:'1px solid #c2a7ae',background:'#273345',color:'#fff',fontWeight:800,borderRadius:12}}> {rotate?'Pause rotation':'Rotate preview'} </button>}
  <p style={{fontSize:12,lineHeight:1.55,color:'#c7d6d9',margin:0}}>Original geometrically modeled art only. Not a skinned character GLB, not a true creature simulation, not medical or historical proof. Designed for teen-safe storytelling; reduced motion is available through the pause control.</p>
 </section>
}
