import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
/** Isolated preview for a locally selected recovered GLB. No production model replacement. */
export default function StreetVerseRecoveredNpcPreview(){
 const host=useRef<HTMLDivElement>(null);
 const [file,setFile]=useState<File|null>(null);
 const [status,setStatus]=useState('Select an original GLB from your device. Files are not uploaded.');
 const [motion,setMotion]=useState(true);
 useEffect(()=>{
  const node=host.current;if(!node||!file)return;
  let cancelled=false,frame=0,renderer:THREE.WebGLRenderer|null=null,mixer:THREE.AnimationMixer|null=null;
  const url=URL.createObjectURL(file),scene=new THREE.Scene(),clock=new THREE.Clock();
  scene.background=new THREE.Color(0x182330);
  const camera=new THREE.PerspectiveCamera(45,1,.05,100);
  camera.position.set(2,1.7,3.5);
  scene.add(new THREE.HemisphereLight(0xffffff,0x405060,2));
  const sun=new THREE.DirectionalLight(0xffffff,3);sun.position.set(3,8,5);scene.add(sun);
  try{
   renderer=new THREE.WebGLRenderer({antialias:true});
   renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;
   renderer.setSize(Math.max(1,node.clientWidth),360);
   node.appendChild(renderer.domElement);
  }catch{setStatus('WebGL unavailable on this device');URL.revokeObjectURL(url);return}
  const activeRenderer=renderer;
  new GLTFLoader().load(url,gltf=>{
   if(cancelled)return;
   const model=gltf.scene;scene.add(model);
   const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
   if(!Number.isFinite(size.y)||size.y<=0){setStatus('Invalid model bounds');return}
   model.position.sub(center);model.position.y+=size.y/2;
   const scale=1.8/size.y;model.scale.setScalar(scale);
   const report={meshes:0,bones:0,materials:0};
   model.traverse(obj=>{if(obj instanceof THREE.Mesh){report.meshes++;report.materials+=Array.isArray(obj.material)?obj.material.length:1}if(obj instanceof THREE.Bone)report.bones++});
   if(gltf.animations.length){mixer=new THREE.AnimationMixer(model);mixer.clipAction(gltf.animations[0]).play()}
   setStatus(`Loaded ${file.name}: ${report.meshes} meshes, ${report.bones} bones, ${report.materials} materials, ${gltf.animations.length} clips`);
  },undefined,()=>{if(!cancelled)setStatus('Could not load GLB. Verify it is a valid, self-contained file.')});
  function animate(){if(cancelled)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05);if(motion)mixer?.update(dt);activeRenderer.render(scene,camera)}
  animate();
  const resize=()=>{if(!node)return;const width=Math.max(1,node.clientWidth);activeRenderer.setSize(width,360);camera.aspect=width/360;camera.updateProjectionMatrix()};
  window.addEventListener('resize',resize);
  return ()=>{cancelled=true;cancelAnimationFrame(frame);window.removeEventListener('resize',resize);URL.revokeObjectURL(url);mixer?.stopAllAction();scene.traverse(obj=>{if(obj instanceof THREE.Mesh){obj.geometry.dispose();for(const m of (Array.isArray(obj.material)?obj.material:[obj.material]))m.dispose()}});activeRenderer.dispose();activeRenderer.domElement.remove()};
 },[file,motion]);
 return <section aria-label="Recovered StreetVerse NPC preview">
  <h2>Original NPC GLB inspection</h2>
  <label>Open local GLB <input type="file" accept=".glb,model/gltf-binary" onChange={e=>setFile(e.target.files?.[0]??null)}/></label>
  <label><input type="checkbox" checked={motion} onChange={e=>setMotion(e.target.checked)}/> Play embedded animation</label>
  <div ref={host} style={{width:'100%',minHeight:360}}/>
  <p role="status">{status}</p>
  <p>Inspection only. Does not publish, upload, replace BJ or alter production.</p>
 </section>
}
