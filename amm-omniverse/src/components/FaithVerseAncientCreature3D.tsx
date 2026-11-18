import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Creature='giants'|'watchers'|'battle'
/** Procedural original creature rig prototype. Skinned meshes are functional,
 * but are NOT the final exported/approved GLBs or historical appearances.
 */
export default function FaithVerseAncientCreature3D({creature}:{creature:Creature}){
 const host=useRef<HTMLDivElement>(null)
 const [status,setStatus]=useState('Preparing procedural creature rig')
 const [motion,setMotion]=useState(false)
 const [quality,setQuality]=useState<'low'|'standard'>('low')
 const [available,setAvailable]=useState(true)
 useEffect(()=>{
  const node=host.current;if(!node)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:quality==='standard',powerPreference:'low-power'})}
  catch{setStatus('3D unavailable on this device. Use the 2D story illustration and narrated text.');setAvailable(false);return}
  setAvailable(true)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,quality==='low'?1:1.5))
  renderer.setClearColor(0x1d2335)
  node.replaceChildren(renderer.domElement)
  renderer.domElement.setAttribute('role','img')
  renderer.domElement.setAttribute('aria-label',creature==='watchers'?'Original winged fantasy Watcher with dark feathers and severe face':creature==='giants'?'Original large fictional Nephilim giant with uneven brow and stony armor':'Original armored Goliath warrior with large shield')
  const scene=new THREE.Scene()
  const camera=new THREE.PerspectiveCamera(45,1,.1,120);camera.position.set(5.4,5.7,10);camera.lookAt(0,3.2,0)
  scene.add(new THREE.HemisphereLight(0xd1c7e0,0x192c30,2.4))
  const light=new THREE.DirectionalLight(0xf7deb3,2.2);light.position.set(-4,10,6);scene.add(light)
  const ground=new THREE.Mesh(new THREE.CircleGeometry(8,24),new THREE.MeshStandardMaterial({color:0x455048,roughness:1}))
  ground.rotation.x=-Math.PI/2;ground.position.y=-.04;scene.add(ground)
  const figure=new THREE.Group();scene.add(figure)
  const giant=creature==='giants',watcher=creature==='watchers'
  const skinColor=watcher?0x554750:giant?0x60554c:0x5b3d2a
  const skin=new THREE.MeshStandardMaterial({color:skinColor,roughness:.97})
  const armor=new THREE.MeshStandardMaterial({color:watcher?0x262431:giant?0x55535a:0x827047,metalness:watcher?.25:.42,roughness:.83,flatShading:true,side:THREE.DoubleSide})
  const pale=new THREE.MeshStandardMaterial({color:0xd5b08f,roughness:.88})
  const eyeColor=new THREE.MeshStandardMaterial({color:0xe1c37f,emissive:0x735c37,emissiveIntensity:.35})
  // A real two-bone skin with upper-body rotation, not an unskinned static placeholder.
  const torsoGeo=new THREE.CylinderGeometry(.7,.9,3.3,12,12,true)
  const attr=torsoGeo.attributes.position,ids:number[]=[],weights:number[]=[]
  for(let i=0;i<attr.count;i++){const t=THREE.MathUtils.clamp((attr.getY(i)+1.65)/3.3,0,1);ids.push(0,1,0,0);weights.push(1-t,t,0,0)}
  torsoGeo.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(ids,4))
  torsoGeo.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4))
  const boneRoot=new THREE.Bone(),boneUpper=new THREE.Bone()
  boneRoot.position.y=-1.65;boneUpper.position.y=3.3;boneRoot.add(boneUpper)
  const torso=new THREE.SkinnedMesh(torsoGeo,armor);torso.add(boneRoot);torso.bind(new THREE.Skeleton([boneRoot,boneUpper]))
  torso.position.y=3.4;figure.add(torso)
  const head=new THREE.Mesh(new THREE.DodecahedronGeometry(.62,1),skin)
  head.position.y=.67;boneUpper.add(head)
  const brow=new THREE.Mesh(new THREE.BoxGeometry(1.1,.16,.3),armor);brow.position.set(0,.86,.43);boneUpper.add(brow)
  for(const side of [-1,1]){
   const eye=new THREE.Mesh(new THREE.SphereGeometry(.095,8,8),eyeColor);eye.position.set(side*.24,.67,.57);boneUpper.add(eye)
   const leg=new THREE.Mesh(new THREE.CylinderGeometry(.25,.3,1.8,8),armor);leg.position.set(side*.46,.95,0);figure.add(leg)
   const arm=new THREE.Mesh(new THREE.CylinderGeometry(.19,.26,2.5,8),skin);arm.position.set(side*.86,-.45,0);arm.rotation.z=side*.18;boneUpper.add(arm)
   const shoulder=new THREE.Mesh(new THREE.DodecahedronGeometry(.42,0),armor);shoulder.position.set(side*.85,.3,0);boneUpper.add(shoulder)
  }
  const jaw=new THREE.Mesh(new THREE.BoxGeometry(.68,.24,.35),skin);jaw.position.set(0,.3,.48);boneUpper.add(jaw)
  for(let i=0;i<5;i++){const tooth=new THREE.Mesh(new THREE.ConeGeometry(.07,.22,5),pale);tooth.rotation.x=Math.PI;tooth.position.set(-.24+i*.12,.18,.66);boneUpper.add(tooth)}
  if(watcher){
   const feather=new THREE.MeshStandardMaterial({color:0x38303e,side:THREE.DoubleSide,roughness:1})
   for(const side of [-1,1]){
    for(let i=0;i<6;i++){
     const wing=new THREE.Mesh(new THREE.ConeGeometry(.36,2.3-i*.12,3),feather)
     wing.rotation.z=side*(.8+i*.14);wing.rotation.x=.35
     wing.position.set(side*(.68+i*.32),.1-i*.14,-.32)
     boneUpper.add(wing)
    }
   }
   const crown=new THREE.Mesh(new THREE.ConeGeometry(.56,.6,6),armor);crown.position.y=1.28;boneUpper.add(crown)
  }else{
   const shield=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,.2,8),armor);shield.rotation.z=Math.PI/2;shield.position.set(-1.5,2.4,.55);figure.add(shield)
  }
  const props=[skin,armor,pale,eyeColor,ground.material as THREE.Material]
  const builtGeometries=new Set<THREE.BufferGeometry>()
  scene.traverse(x=>{if((x as THREE.Mesh).geometry)builtGeometries.add((x as THREE.Mesh).geometry)})
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false
  let disposed=false,raf=0,previous=performance.now(),elapsed=0
  const resize=()=>{const width=Math.max(1,node.clientWidth),height=Math.max(190,node.clientHeight);renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix()}
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(node);resize()
  const loop=(now:number)=>{
   if(disposed)return;raf=requestAnimationFrame(loop)
   const delta=Math.min(.08,Math.max(0,(now-previous)/1000));previous=now
   if(document.visibilityState==='hidden'||reduced||!motion)return
   elapsed+=delta
   boneUpper.rotation.z=Math.sin(elapsed*1.1)*.075
   boneUpper.rotation.y=Math.sin(elapsed*.6)*.18
   figure.rotation.y=Math.sin(elapsed*.3)*.25
   renderer.render(scene,camera)
  }
  renderer.render(scene,camera);raf=requestAnimationFrame(loop)
  setStatus('WebGL procedural two-bone SkinnedMesh rendered. Final imported creature GLBs, combat and device QA remain unverified.')
  return()=>{disposed=true;cancelAnimationFrame(raf);resizeObserver.disconnect();builtGeometries.forEach(g=>g.dispose());props.forEach(m=>m.dispose());torso.skeleton.dispose();renderer.dispose();renderer.domElement.remove()}
 },[creature,quality,motion])
 return <section aria-label="Ancient Bible creature 3D prototype" style={{display:'grid',gap:9}}>
  <div ref={host} style={{height:285,minHeight:220,background:'#1d2335',borderRadius:14,overflow:'hidden',border:'1px solid #978bb1'}}/>
  <p role="status" aria-live="polite" style={{margin:0,fontSize:12,lineHeight:1.6}}>{status}</p>
  <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
   <button disabled={!available} onClick={()=>setMotion(x=>!x)} style={{minHeight:56,borderRadius:12,fontWeight:800}}>{motion?'Pause 3D animation':'Animate skinned creature'}</button>
   <button onClick={()=>setQuality(q=>q==='low'?'standard':'low')} style={{minHeight:56,borderRadius:12,fontWeight:800}}>Graphics: {quality}</button>
  </div>
  <p style={{margin:0,fontSize:12,lineHeight:1.6}}>Original non-graphic fantasy concept with functioning two-bone skeletal skinning. There is no approved 3D production GLB, authentic ancient anatomy, multiplayer character replication or final Chromebook/iPhone visual signoff yet.</p>
 </section>
}
