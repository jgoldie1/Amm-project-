import {getBJModelUrl,loadApprovedBJAvatar} from './StreetVerseBJAvatarLoader';
import {readLocalPassportAvatar} from '../game/creator/StreetVerseAvatarPassportBridge';
import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {configureStreetVerseRenderer,detectStreetVerseGraphicsTier,installStreetVerseLighting,upgradeStreetVerseMaterials,type GraphicsTier} from '../game/graphics/StreetVerseNextGenGraphics';
import {interactionAllowed,transitionPosition,moveWithWalls,type CircleParkZone} from '../game/world/CircleParkMovement';
type Props={floor:number;zone:CircleParkZone;repairComplete:boolean;onEnter:()=>void;onElevator:()=>void;onRepair:()=>void};
export default function CirclePark3DScene({floor,zone,repairComplete,onEnter,onElevator,onRepair}:Props){
 const host=useRef<HTMLDivElement>(null);
 const controls=useRef({forward:false,back:false,left:false,right:false});
 const position=useRef({x:0,z:0});
 const zoneRef=useRef(zone);zoneRef.current=zone;
 const avatarRef=useRef<THREE.Group|null>(null);
 useEffect(()=>{const p=transitionPosition(zone==='outside'?'exit':zone==='lobby'?'enter':'elevator');position.current=p;if(avatarRef.current)avatarRef.current.position.set(p.x,zone==='upstairs'?6:0,p.z);},[zone]);
 const [graphicsTier,setGraphicsTier]=useState<GraphicsTier>(detectStreetVerseGraphicsTier);
 const [notice,setNotice]=useState('Move toward the building entrance to interact.');
 const [location,setLocation]=useState('Outside Circle Park');
 useEffect(()=>{
  const parent=host.current;if(!parent)return;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#9cc5df');
  const camera=new THREE.PerspectiveCamera(65,1,.1,150);camera.position.set(0,4,9);
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
  configureStreetVerseRenderer(renderer,graphicsTier);parent.appendChild(renderer.domElement);
  const removeLighting=installStreetVerseLighting(scene,graphicsTier);
  const ambient=new THREE.HemisphereLight(0xffffff,0x45536b,2);scene.add(ambient);
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(60,60),new THREE.MeshStandardMaterial({color:0x688d76}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=graphicsTier!=='mobile';scene.add(ground);
  const building=new THREE.Mesh(new THREE.BoxGeometry(12,8,7),new THREE.MeshStandardMaterial({color:0xa9a5a1}));building.position.set(0,4,-10);building.castShadow=graphicsTier!=='mobile';building.receiveShadow=graphicsTier!=='mobile';scene.add(building);
  const doorway=new THREE.Mesh(new THREE.BoxGeometry(2.5,3,.12),new THREE.MeshStandardMaterial({color:0x253a50}));doorway.position.set(0,1.5,-6.44);scene.add(doorway);
  const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,2,12),new THREE.MeshStandardMaterial({color:0x9d694b}));pipe.rotation.z=Math.PI/2;pipe.position.set(3,1.5,-7.2);scene.add(pipe);
  const marker=new THREE.Mesh(new THREE.SphereGeometry(.22,12,12),new THREE.MeshBasicMaterial({color:repairComplete?0x33cc66:0xffc044}));marker.position.set(3,2,-7.2);scene.add(marker);
  const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.4,.85,4,8),new THREE.MeshStandardMaterial({color:0x232a42}));body.position.y=1.1;avatar.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(.29,12,12),new THREE.MeshStandardMaterial({color:0x704b36}));head.position.y=2;avatar.add(head);scene.add(avatar);avatarRef.current=avatar;avatar.position.set(position.current.x,zoneRef.current==='upstairs'?6:0,position.current.z);
  let raf=0,last=performance.now();const clock=new THREE.Clock();
  let loadedAvatar:Awaited<ReturnType<typeof loadApprovedBJAvatar>>|null=null;let active=true;
  const modelUrl=readLocalPassportAvatar()?.modelPath||getBJModelUrl();
  if(modelUrl)loadApprovedBJAvatar(modelUrl).then(handle=>{if(!active){handle.dispose();return;}loadedAvatar=handle;avatar.remove(body,head);avatar.add(handle.root);upgradeStreetVerseMaterials(handle.root,graphicsTier,renderer);}).catch(error=>{console.warn('BJ GLB unavailable; using placeholder',error)});
  const resize=()=>{const width=Math.max(1,parent.clientWidth),height=Math.max(200,parent.clientHeight);camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height,false)};
  const observer=new ResizeObserver(resize);observer.observe(parent);resize();
  const frame=()=>{const delta=Math.min(clock.getDelta(),.05);const v=controls.current;const move=new THREE.Vector3(Number(v.right)-Number(v.left),0,Number(v.back)-Number(v.forward));if(move.lengthSq()>0){move.normalize().multiplyScalar(delta*3);const next=moveWithWalls(position.current,{x:position.current.x+move.x,z:position.current.z+move.z},zoneRef.current!=='outside');avatar.position.set(next.x,zoneRef.current==='upstairs'?6:0,next.z);position.current=next;avatar.rotation.y=Math.atan2(-move.x,-move.z)}loadedAvatar?.update(delta,move.lengthSq()>0);
   const target=new THREE.Vector3(avatar.position.x,2.5+Math.max(0,floor-1)*.25,avatar.position.z+7);camera.position.lerp(target,.08);camera.lookAt(avatar.position.x,avatar.position.y+1.3,avatar.position.z);marker.position.y=2+Math.sin(last/300)*.1;last+=delta*1000;renderer.render(scene,camera);raf=requestAnimationFrame(frame)};
  frame();
  const key=(e:KeyboardEvent,down:boolean)=>{const map:Record<string,keyof typeof controls.current>={w:'forward',ArrowUp:'forward',s:'back',ArrowDown:'back',a:'left',ArrowLeft:'left',d:'right',ArrowRight:'right'};const action=map[e.key];if(action){controls.current[action]=down;e.preventDefault()}};
  const kd=(e:KeyboardEvent)=>key(e,true),ku=(e:KeyboardEvent)=>key(e,false);
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
  return ()=>{avatarRef.current=null;active=false;loadedAvatar?.dispose();cancelAnimationFrame(raf);observer.disconnect();window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);removeLighting();renderer.dispose();ground.geometry.dispose();building.geometry.dispose();doorway.geometry.dispose();pipe.geometry.dispose();marker.geometry.dispose();body.geometry.dispose();head.geometry.dispose();parent.removeChild(renderer.domElement)};
 },[floor,repairComplete,graphicsTier]);
 const press=(key:keyof typeof controls.current,value:boolean)=>()=>{controls.current[key]=value};
 return <section aria-label="Circle Park 3D movement demo"><div ref={host} style={{width:'100%',height:320,background:'#9cc5df',borderRadius:12}} role="img" aria-label="Simple 3D Circle Park with a placeholder character, building and repair marker"/>
 <label>Graphics quality <select value={graphicsTier} onChange={e=>setGraphicsTier(e.target.value as GraphicsTier)}><option value="mobile">Mobile performance</option><option value="balanced">Balanced</option><option value="cinematic">Cinematic</option></select></label>
 <p>3D scene (approved BJ GLB when configured, otherwise placeholder) · Floor {floor} · {location}</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8}}>
 {(['forward','left','back','right'] as const).map((key,i)=><button key={key} style={{minHeight:56,touchAction:'none'}} onPointerDown={press(key,true)} onPointerUp={press(key,false)} onPointerCancel={press(key,false)} onPointerLeave={press(key,false)}>{['↑','←','↓','→'][i]}</button>)}</div>
 <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
 <button onClick={()=>{if(!interactionAllowed(zone,'enter',position.current)){setNotice('Walk closer to the centered entrance first.');return}onEnter();setLocation('Apartment lobby');setNotice('Building entry mission action accepted.')}}>Enter building</button>
 <button onClick={()=>{if(!interactionAllowed(zone,'elevator',position.current)){setNotice('Enter the lobby and approach the elevator first.');return}onElevator();setLocation('Elevator');setNotice('Elevator mission action accepted.')}}>Elevator</button>
 <button onClick={()=>{if(!interactionAllowed(zone,'repair',position.current)){setNotice('Reach floor 2 and approach the plumbing marker first.');return}onRepair();setLocation('Plumbing station');setNotice('Repair interaction requested.')}}>Inspect repair</button>
 </div><p role="status">{notice}</p><p>WASD/arrow keys or one-hand touch controls. The building is a visual placeholder; doors and elevator geometry are not yet physically traversable.</p></section>;
}
