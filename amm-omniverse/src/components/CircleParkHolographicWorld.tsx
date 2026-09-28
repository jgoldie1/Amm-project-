import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {createCircleParkHologram} from '../game/holographic/CircleParkHolographicPrototype'
import {CIRCLE_PARK_TWIN,createTwinDebugOverlay} from '../game/holographic/DigitalTwinPipeline'
import type {CompanionCommand} from '../data/StreetVerseCompanionEcologyEngine'

type Zone={minX:number;maxX:number;minZ:number;maxZ:number}
const BLOCKERS:Zone[]=[{minX:-43,maxX:-7,minZ:-34,maxZ:24},{minX:7,maxX:43,minZ:-34,maxZ:24}]
const inside=(x:number,z:number,b:Zone)=>x>b.minX&&x<b.maxX&&z>b.minZ&&z<b.maxZ

export default function CircleParkHolographicWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null),input=useRef({x:0,z:0}),nearEntrance=useRef(false),insideDemo=useRef(false),nearElevator=useRef(false),companionCommand=useRef<CompanionCommand>('follow'),playerRef=useRef<THREE.Mesh|null>(null),dogRef=useRef<THREE.Group|null>(null)
 const [message,setMessage]=useState('Walk to the glowing entrance.'),[canOpen,setCanOpen]=useState(false),[interior,setInterior]=useState(false),[canElevator,setCanElevator]=useState(false),[floorLevel,setFloorLevel]=useState(1),[dogCommand,setDogCommand]=useState<CompanionCommand>('follow')
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x050b14);scene.fog=new THREE.Fog(0x050b14,55,150)
  const camera=new THREE.PerspectiveCamera(62,1,.1,220),renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));renderer.outputColorSpace=THREE.SRGBColorSpace;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x8fefff,0x101018,2.2));const key=new THREE.DirectionalLight(0xffffff,2.4);key.position.set(-20,35,-20);scene.add(key)
  const world=createCircleParkHologram('interactive-demo');scene.add(world);scene.add(createTwinDebugOverlay(CIRCLE_PARK_TWIN))
  const player=new THREE.Mesh(new THREE.CapsuleGeometry(.65,1.25,4,8),new THREE.MeshStandardMaterial({color:0xffffff,emissive:0x00ccff,emissiveIntensity:.45}));player.position.set(0,1.4,-46);scene.add(player);playerRef.current=player
  const dog=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(1.35,.75,2),new THREE.MeshStandardMaterial({color:0x8a5a34}));body.position.y=.65;dog.add(body);const head=new THREE.Mesh(new THREE.BoxGeometry(.85,.85,.85),new THREE.MeshStandardMaterial({color:0x9b6840}));head.position.set(0,1,-1.15);dog.add(head);dog.position.set(-2,0,-44);scene.add(dog);dogRef.current=dog
  const door=new THREE.Mesh(new THREE.BoxGeometry(3.6,5,.35),new THREE.MeshStandardMaterial({color:0x00d9ff,emissive:0x00aacc,emissiveIntensity:.6,transparent:true,opacity:.7}));door.position.set(0,2.5,-34);scene.add(door)
  const floor=new THREE.Mesh(new THREE.BoxGeometry(12,.25,18),new THREE.MeshStandardMaterial({color:0x102936}));floor.position.set(0,.05,-22);floor.visible=false;scene.add(floor)
  const stairs=new THREE.Group();for(let i=0;i<6;i++){const s=new THREE.Mesh(new THREE.BoxGeometry(4,.35,1.2),new THREE.MeshStandardMaterial({color:0x48d8ff}));s.position.set(-3,.2+i*.35,-17+i*.7);stairs.add(s)}stairs.visible=false;scene.add(stairs)
  const elevator=new THREE.Mesh(new THREE.BoxGeometry(3,5,3),new THREE.MeshStandardMaterial({color:0x242b35,emissive:0x8844ff,emissiveIntensity:.35}));elevator.position.set(3,2.5,-16);elevator.visible=false;scene.add(elevator)
  camera.position.set(0,7,-57);let raf=0,last=performance.now(),doorOpen=0
  const resize=()=>{const w=mount.clientWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const nx=THREE.MathUtils.clamp(player.position.x+input.current.x*9*dt,-43,43),nz=THREE.MathUtils.clamp(player.position.z+input.current.z*9*dt,-48,31);if(insideDemo.current||!BLOCKERS.some(b=>inside(nx,nz,b))){player.position.x=nx;player.position.z=nz}
   if(companionCommand.current==='follow'||companionCommand.current==='return'){const target=new THREE.Vector3(player.position.x-1.8,0,player.position.z-1.8),d=dog.position.distanceTo(target);if(d>.3)dog.position.lerp(target,Math.min(1,dt*3.2));if(companionCommand.current==='return'&&d<1){companionCommand.current='follow';setDogCommand('follow')}}
   const near=player.position.distanceTo(new THREE.Vector3(0,1.4,-35))<4;if(near!==nearEntrance.current){nearEntrance.current=near;setCanOpen(near);if(!insideDemo.current)setMessage(near?'Entrance reached • OPEN is available.':'Explore Circle Park • building collision is active.')}
   const elev=insideDemo.current&&player.position.distanceTo(new THREE.Vector3(3,1.4,-16))<3.5;if(elev!==nearElevator.current){nearElevator.current=elev;setCanElevator(elev);if(elev)setMessage('Elevator reached • RIDE ELEVATOR is available.')}
   doorOpen=THREE.MathUtils.lerp(doorOpen,insideDemo.current?1:0,.08);door.position.x=doorOpen*3.5;floor.visible=stairs.visible=elevator.visible=insideDemo.current
   camera.position.lerp(new THREE.Vector3(player.position.x,player.position.y+5,player.position.z-11),.08);camera.lookAt(player.position.x,player.position.y+1,player.position.z+4);renderer.render(scene,camera);raf=requestAnimationFrame(tick)}
  raf=requestAnimationFrame(tick);return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);renderer.dispose();renderer.domElement.remove()}
 },[])
 const stop=()=>{input.current={x:0,z:0}}
 const move=(x:number,z:number)=>{input.current={x,z}}
 const keyDown=(e:React.KeyboardEvent<HTMLDivElement>)=>{if(e.key==='ArrowUp'||e.key==='w')move(0,1);else if(e.key==='ArrowDown'||e.key==='s')move(0,-1);else if(e.key==='ArrowLeft'||e.key==='a')move(-1,0);else if(e.key==='ArrowRight'||e.key==='d')move(1,0)}
 const joystick=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);const r=e.currentTarget.getBoundingClientRect(),dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2),radius=r.width*.38,mag=Math.hypot(dx,dy)||1,scale=Math.min(1,radius/mag);input.current={x:(dx*scale)/radius,z:(-dy*scale)/radius}}
 const open=()=>{if(!nearEntrance.current)return setMessage('Move closer to the entrance first.');insideDemo.current=true;setInterior(true);setMessage('Interior demo entered • stairs + elevator mockup active.')}
 const exitInterior=()=>{insideDemo.current=false;nearElevator.current=false;setCanElevator(false);setInterior(false);setFloorLevel(1);setMessage('Returned outside • source-backed interior geometry remains pending authorization.')}
 const rideElevator=()=>{if(!nearElevator.current)return;setFloorLevel(v=>v===1?2:1);setMessage('Elevator demo moved between conceptual floors • verified interior geometry remains pending.')}
 const commandDog=(cmd:CompanionCommand)=>{companionCommand.current=cmd;setDogCommand(cmd);const labels:Record<CompanionCommand,string>={follow:'Companion following.',stay:'Companion staying here.',search:'Companion searching the nearby mission area.',help:'Companion ready to assist/rescue.',defend:'Companion guarding during fictional gameplay danger.',return:'Companion returning to you.'};setMessage(labels[cmd])}
 return <div tabIndex={0} onKeyDown={keyDown} onKeyUp={stop} aria-label="Playable StreetVerse Chicago Circle Park world" style={{position:'fixed',inset:0,zIndex:2500,background:'#050b14',outline:'none'}}><div ref={mountRef} style={{position:'absolute',inset:0}}/>
  <div style={{position:'absolute',top:12,left:12,right:12,padding:12,border:'1px solid #00ffcc88',borderRadius:14,background:'#07131dcc',color:'#eaffff',fontFamily:'system-ui'}}><b>CIRCLE PARK • HOLOGRAPHIC DIGITAL TWIN</b><div style={{fontSize:12,opacity:.82}}>Conceptual massing • collision + interaction prototype • CAD/BIM accuracy pending verified sources.</div><div style={{fontSize:12,marginTop:5}}>{message}{interior?` • FLOOR ${floorLevel}`:''}</div></div>
  <div aria-live="polite" style={{position:'absolute',width:1,height:1,overflow:'hidden',clip:'rect(0 0 0 0)'}}>{message}</div>
  <div aria-label="Circle Park analog movement joystick" onPointerDown={joystick} onPointerMove={e=>{if(e.buttons)joystick(e)}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop} style={{position:'absolute',left:18,bottom:20,width:124,height:124,borderRadius:'50%',border:'2px solid #00ffcc',background:'#06131bcc',touchAction:'none',boxShadow:'inset 0 0 28px #00ffcc33'}}><div style={{position:'absolute',left:44,top:44,width:32,height:32,borderRadius:'50%',background:'#eaffff',boxShadow:'0 0 18px #00ffcc'}}/></div>
  <div aria-label="One-hand movement controls" style={{position:'absolute',left:18,bottom:152,display:'grid',gridTemplateColumns:'repeat(3,38px)',gap:4}}><span/><button aria-label="Move forward" onPointerDown={()=>move(0,1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▲</button><span/><button aria-label="Move left" onPointerDown={()=>move(-1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>◀</button><button aria-label="Stop movement" onClick={stop} style={moveBtn}>■</button><button aria-label="Move right" onPointerDown={()=>move(1,0)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▶</button><span/><button aria-label="Move backward" onPointerDown={()=>move(0,-1)} onPointerUp={stop} onPointerCancel={stop} style={moveBtn}>▼</button><span/></div>
  <div aria-label="Companion controls" style={{position:'absolute',left:154,bottom:20,display:'flex',maxWidth:'calc(100vw - 330px)',gap:6,flexWrap:'wrap'}}>{(['follow','stay','search','help','defend','return'] as CompanionCommand[]).map(cmd=><button key={cmd} onClick={()=>commandDog(cmd)} style={{padding:'8px 10px',borderRadius:999,border:'1px solid #00ffcc88',background:dogCommand===cmd?'#0b5048dd':'#06131bdd',color:'#fff',fontSize:11,textTransform:'uppercase'}}>{cmd}</button>)}</div>
  {interior&&<button disabled={!canElevator} onClick={rideElevator} style={{position:'absolute',right:16,bottom:144,padding:'12px 16px',borderRadius:999,border:'1px solid #aa66ff',background:'#0b1020dd',color:'#fff',opacity:canElevator?1:.45}}>RIDE ELEVATOR</button>}
  <button disabled={!canOpen&&!interior} onClick={interior?exitInterior:open} style={{position:'absolute',right:16,bottom:82,padding:'12px 16px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131bdd',color:'#fff',opacity:canOpen||interior?1:.45}}>{interior?'EXIT INTERIOR':'OPEN'}</button>
  <button onClick={onClose} style={{position:'absolute',right:16,bottom:20,padding:'12px 18px',borderRadius:999,border:'1px solid #00ffcc',background:'#06131b',color:'#fff'}}>EXIT WORLD</button>
 </div>
}

const moveBtn:React.CSSProperties={width:38,height:38,borderRadius:10,border:'1px solid #00ffcc88',background:'#06131bdd',color:'#fff',fontSize:17,touchAction:'none'}
