import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
type Props={floor:number;repairComplete:boolean;onEnter:()=>void;onElevator:()=>void;onRepair:()=>void};
export default function CirclePark3DScene({floor,repairComplete,onEnter,onElevator,onRepair}:Props){
 const host=useRef<HTMLDivElement>(null);
 const controls=useRef({forward:false,back:false,left:false,right:false});
 const [location,setLocation]=useState('Outside Circle Park');
 useEffect(()=>{
  const parent=host.current;if(!parent)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#9cc5df');
  const camera=new THREE.PerspectiveCamera(65,1,.1,150);camera.position.set(0,4,9);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));parent.appendChild(renderer.domElement);
  const ambient=new THREE.HemisphereLight(0xffffff,0x45536b,2);scene.add(ambient);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x688d76}));ground.rotation.x=-Math.PI/2;scene.add(ground);
  const building=new THREE.Mesh(new THREE.BoxGeometry(12,8,7),new THREE.MeshStandardMaterial({color:0xa9a5a1}));building.position.set(0,4,-10);scene.add(building);
  const doorway=new THREE.Mesh(new THREE.BoxGeometry(2.5,3,.12),new THREE.MeshStandardMaterial({color:0x253a50}));doorway.position.set(0,1.5,-6.44);scene.add(doorway);
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2,12),new THREE.MeshStandardMaterial({color:0x9d694b}));pipe.rotation.z=Math.PI/2;pipe.position.set(3,1.5,-5.7);scene.add(pipe);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.22,12,12),new THREE.MeshBasicMaterial({color:repairComplete?0x33cc66:0xffc044}));marker.position.set(3,2,-5.7);scene.add(marker);
  const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.85,4,8),new THREE.MeshStandardMaterial({color:0x232a42}));body.position.y=1.1;avatar.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.29,12,12),new THREE.MeshStandardMaterial({color:0x704b36}));head.position.y=2;avatar.add(head);scene.add(avatar);
  let raf=0,last=performance.now();const clock=new THREE.Clock();
  const resize=()=>{const width=Math.max(1,parent.clientWidth),height=Math.max(200,parent.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)};
  const observer=new ResizeObserver(resize);observer.observe(parent);resize();
  const frame=()=>{const delta=Math.min(clock.getDelta(),.05);const v=controls.current;const move=new THREE.Vector3(Number(v.right)-Number(v.left),0,Number(v.back)-Number(v.forward));if(move.lengthSq()>0){move.normalize().multiplyScalar(delta*3);avatar.position.add(move);avatar.position.x=THREE.MathUtils.clamp(avatar.position.x,-20,20);avatar.position.z=THREE.MathUtils.clamp(avatar.position.z,-20,5);avatar.rotation.y=Math.atan2(-move.x,-move.z)}
   const target=new THREE.Vector3(avatar.position.x,2.5+Math.max(0,floor-1)*.25,avatar.position.z+7);camera.position.lerp(target,.08);camera.lookAt(avatar.position.x,1.3,avatar.position.z);marker.position.y=2+Math.sin(last/300)*.1;last+=delta*1000;renderer.render(scene,camera);raf=requestAnimationFrame(frame)};
  frame();
  const key=(e:KeyboardEvent,down:boolean)=>{const map:Record<string,keyof typeof controls.current>={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};const action=map[e.key];if(action){controls.current[action]=down;e.preventDefault()}};
  const kd=(e:KeyboardEvent)=>key(e,true),ku=(e:KeyboardEvent)=>key(e,false);
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
  return ()=>{cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);renderer.dispose();ground.geometry.dispose();building.geometry.dispose();doorway.geometry.dispose();pipe.geometry.dispose();marker.geometry.dispose();body.geometry.dispose();head.geometry.dispose();parent.removeChild(renderer.domElement)};
 },[floor,repairComplete]);
 const press=(key:keyof typeof controls.current,value:boolean)=>()=>{controls.current[key]=value};
 return <section aria-label="Circle Park 3D movement demo"><div ref={host} style={{width:'100%',height:320,background:'#9cc5df',borderRadius:12}} role="img" aria-label="Simple 3D Circle Park with a placeholder character, building and repair marker"/>
 <p>3D placeholder scene · Floor {floor} · {location}</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
 {(['forward','left','back','right'] as const).map((key,i)=><button key={key} style={{minHeight:56,touchAction:'none'}} onPointerDown={press(key,true)} onPointerUp={press(key,false)} onPointerCancel={press(key,false)} onPointerLeave={press(key,false)}>{['↑','←','↓','→'][i]}</button>)}</div>
 <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
 <button onClick={()=>{onEnter();setLocation('Apartment lobby')}}>Enter building</button>
 <button onClick={()=>{onElevator();setLocation('Elevator')}}>Elevator</button>
 <button onClick={()=>{onRepair();setLocation('Plumbing station')}}>Inspect repair</button>
 </div><p>WASD/arrow keys or one-hand touch controls. The building is a visual placeholder; doors and elevator geometry are not yet physically traversable.</p></section>;
}
