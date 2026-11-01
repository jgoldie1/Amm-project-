import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {inspectLoadedAvatar,createAvatarPerformance} from '../game/creator/StreetVerseAvatarRuntime';
type Props={modelUrl?:string};
export default function StreetVersePersonalAvatarPreview({modelUrl}:Props){
 const host=useRef<HTMLDivElement>(null);
 const [status,setStatus]=useState('Choose a locally saved GLB to inspect its 3D character and animations.');
 const [fileUrl,setFileUrl]=useState<string|null>(null);
 useEffect(()=>()=>{if(fileUrl)URL.revokeObjectURL(fileUrl)},[fileUrl]);
 useEffect(()=>{
  const parent=host.current;if(!parent)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#202434');
  const camera=new THREE.PerspectiveCamera(50,1,.1,100);camera.position.set(0,1.5,4.2);camera.lookAt(0,1,0);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));parent.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0xffffff,0x414155,2.5));
  const floor=new THREE.Mesh(new THREE.CircleGeometry(3,32),new THREE.MeshStandardMaterial({color:'#55596b'}));floor.rotation.x=-Math.PI/2;scene.add(floor);
  const placeholder=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.32,.95,4,12),new THREE.MeshStandardMaterial({color:'#7c57ad'}));body.position.y=1;placeholder.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.26,16,12),new THREE.MeshStandardMaterial({color:'#8b5b43'}));head.position.y=1.93;placeholder.add(head);scene.add(placeholder);
  let performance:ReturnType<typeof createAvatarPerformance>|undefined;
  let loaded:THREE.Object3D|undefined;
  let cancelled=false;
  const url=fileUrl||modelUrl;
  if(url){
   const safe=url.startsWith('blob:')||(url.startsWith('/')&&url.toLowerCase().endsWith('.glb')&&!url.startsWith('//'));
   if(!safe)setStatus('Only local GLB files or same-origin asset paths are accepted.');
   else new GLTFLoader().loadAsync(url).then(gltf=>{
    if(cancelled)return;
    const root=gltf.scene;
    const box=new THREE.Box3().setFromObject(root);const size=box.getSize(new THREE.Vector3());const center=box.getCenter(new THREE.Vector3());
    const scale=2/Math.max(size.y,.01);root.scale.multiplyScalar(scale);
    root.position.set(-center.x*scale,-box.min.y*scale,-center.z*scale);
    placeholder.visible=false;scene.add(root);loaded=root;
    const report=inspectLoadedAvatar(root,gltf.animations);
    performance=createAvatarPerformance(root,gltf.animations);
    const idle=report.animations.find(x=>/idle|stand|breath/i.test(x));
    if(idle)performance.play(idle);
    setStatus('Model loaded. Bones: '+report.bones.length+'. Animations: '+(report.animations.join(', ')||'none')+'. Likeness has not been verified.');
   }).catch(()=>{if(!cancelled)setStatus('Unable to load this GLB. The placeholder remains visible.')});
  }
  const resize=()=>{const w=Math.max(1,parent.clientWidth),h=Math.max(200,parent.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};
  const observer=new ResizeObserver(resize);observer.observe(parent);resize();
  let raf=0;const clock=new THREE.Clock();
  function frame(){const dt=Math.min(.05,clock.getDelta());performance?.update(dt);if(loaded)loaded.rotation.y+=dt*.25;else placeholder.rotation.y+=dt*.25;renderer.render(scene,camera);raf=requestAnimationFrame(frame)}
  frame();
  return ()=>{cancelled=true;cancelAnimationFrame(raf);observer.disconnect();performance?.stop();renderer.dispose();renderer.domElement.remove();floor.geometry.dispose();(floor.material as THREE.Material).dispose();body.geometry.dispose();(body.material as THREE.Material).dispose();head.geometry.dispose();(head.material as THREE.Material).dispose()};
 },[fileUrl,modelUrl]);
 return <section aria-label="Personal character 3D preview" style={{padding:12}}>
 <h3>3D character preview</h3>
 <label>Inspect a GLB saved on this device<input type="file" accept=".glb,model/gltf-binary" onChange={e=>{const f=e.target.files?.[0];if(!f)return;if(f.size>40*1024*1024||!f.name.toLowerCase().endsWith('.glb')){setStatus('Choose a GLB smaller than 40 MB.');return}setFileUrl(old=>{if(old)URL.revokeObjectURL(old);return URL.createObjectURL(f)})}}/></label>
 <div ref={host} style={{height:360,width:'100%',maxWidth:480}}/>
 <p role="status">{status}</p>
 <p>This preview inspects an existing rigged model. It does not reconstruct a person from photos.</p>
 </section>;
}
