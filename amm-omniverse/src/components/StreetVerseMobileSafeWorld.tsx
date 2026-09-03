import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import StreetVerseMobilePlayableWorld from './StreetVerseMobilePlayableWorld'

const SAVE_KEY='tryamm.streetverse.living.v1'
const START={x:0,z:54}
const MISSIONS=[
 {id:'studio',label:'Aniyah 64 Track Studio',x:-42,z:-30},
 {id:'market',label:'All American Marketplace',x:42,z:-24},
 {id:'network',label:'All American Network',x:38,z:38},
 {id:'club',label:'Chicago After Dark',x:-38,z:38},
]
function loadSave(){try{return JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{return {}}}
function mat(color:number){return new THREE.MeshLambertMaterial({color})}

export default function StreetVerseMobileSafeWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null)
 const moveRef=useRef({up:false,down:false,left:false,right:false})
 const [status,setStatus]=useState('MOBILE SAFE CITY • LOADING')
 const [message,setMessage]=useState('StreetVerse mobile-safe city is starting…')
 const [webglFailed,setWebglFailed]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  const saved=loadSave(),scene=new THREE.Scene();scene.background=new THREE.Color(0x07101d);scene.fog=new THREE.Fog(0x07101d,70,190)
  const camera=new THREE.PerspectiveCamera(62,1,.1,260)
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'default',alpha:false})}catch(err){setStatus('WEBGL COULD NOT START');setMessage('Switching to StreetVerse Safe Play Mode.');setWebglFailed(true);return}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.1));renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.shadowMap.enabled=false;mount.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xb9e7ff,0x1a1820,2.6));const sun=new THREE.DirectionalLight(0xffdfb8,2.1);sun.position.set(35,70,30);scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),mat(0x183125));ground.rotation.x=-Math.PI/2;scene.add(ground)
  const roadMat=mat(0x202630),walkMat=mat(0x777b80),lineMat=new THREE.MeshBasicMaterial({color:0xe9d778})
  for(const c of [-48,0,48]){const r1=new THREE.Mesh(new THREE.BoxGeometry(190,.08,14),roadMat);r1.position.set(0,.05,c);scene.add(r1);const r2=new THREE.Mesh(new THREE.BoxGeometry(14,.08,190),roadMat);r2.position.set(c,.05,0);scene.add(r2);for(const o of [-9,9]){const w1=new THREE.Mesh(new THREE.BoxGeometry(190,.12,3),walkMat);w1.position.set(0,.08,c+o);scene.add(w1);const w2=new THREE.Mesh(new THREE.BoxGeometry(3,.12,190),walkMat);w2.position.set(c+o,.08,0);scene.add(w2)}}
  for(const c of [-48,0,48])for(let p=-78;p<=78;p+=16){const l1=new THREE.Mesh(new THREE.BoxGeometry(7,.02,.12),lineMat);l1.position.set(p,.11,c);scene.add(l1);const l2=new THREE.Mesh(new THREE.BoxGeometry(.12,.02,7),lineMat);l2.position.set(c,.11,p);scene.add(l2)}
  const collisions:THREE.Box3[]=[];const colors=[0x263f55,0x3c3153,0x355342,0x634838,0x31566b,0x58364f]
  const blocks=[[-70,-70],[-70,-24],[-70,24],[-70,70],[-24,-70],[-24,-24],[-24,24],[-24,70],[24,-70],[24,-24],[24,24],[24,70],[70,-70],[70,-24],[70,24],[70,70]]
  blocks.forEach(([x,z],i)=>{const h=12+(i*7)%24,b=new THREE.Mesh(new THREE.BoxGeometry(15+(i%2)*4,h,15+((i+1)%2)*4),mat(colors[i%colors.length]));b.position.set(x,h/2,z);scene.add(b);collisions.push(new THREE.Box3().setFromObject(b).expandByScalar(.7))})
  for(let i=0;i<16;i++){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.28,.38,2.4,6),mat(0x70503a));trunk.position.set((i%2?1:-1)*(18+(i%4)*15),1.2,-72+(i*10)%144);scene.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(1.4,7,6),mat(i%2?0x2f7947:0x28653d));crown.position.set(trunk.position.x,3.5,trunk.position.z);scene.add(crown)}
  MISSIONS.forEach(m=>{const ring=new THREE.Mesh(new THREE.TorusGeometry(2.1,.22,8,24),new THREE.MeshBasicMaterial({color:0xffd45e}));ring.rotation.x=Math.PI/2;ring.position.set(m.x,.3,m.z);scene.add(ring)})
  const player=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.75,1.7,3,6),mat(0x56ddff));body.position.y=1.8;player.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.55,8,7),mat(0xc9906b));head.position.y=3.5;player.add(head);player.position.set(saved.x??START.x,0,saved.z??START.z);scene.add(player)
  const cars:THREE.Group[]=[];for(let i=0;i<6;i++){const g=new THREE.Group(),b=new THREE.Mesh(new THREE.BoxGeometry(4.2,.9,1.9),mat([0xe34b4b,0x4389ef,0xe4c449,0xe6e6e6,0x282932,0x4acb8b][i]));b.position.y=.65;g.add(b);const cab=new THREE.Mesh(new THREE.BoxGeometry(2,.7,1.6),mat(0x7aa9bf));cab.position.set(-.2,1.35,0);g.add(cab);g.userData.axis=i<3?'x':'z';g.userData.dir=i%2?1:-1;g.position.set(i<3?-75+i*24:(i%2?48:-48),.02,i<3?(i%2?48:-48):-70+(i-3)*28);scene.add(g);cars.push(g)}
  camera.position.set(player.position.x-14,16,player.position.z+18);camera.lookAt(player.position.x,1.8,player.position.z)
  const resize=()=>{const w=Math.max(1,mount.clientWidth),h=Math.max(320,mount.clientHeight);camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false)};const ro=new ResizeObserver(resize);ro.observe(mount);resize()
  const keys=new Set<string>();const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)){e.preventDefault();keys.add(k)}};const ku=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase());addEventListener('keydown',kd,{passive:false});addEventListener('keyup',ku)
  const temp=new THREE.Vector3();let raf=0,lastSave=0;const clock=new THREE.Clock()
  const animate=()=>{const dt=Math.min(.04,clock.getDelta()),m=moveRef.current;let dx=0,dz=0;if(keys.has('a')||keys.has('arrowleft')||m.left)dx-=1;if(keys.has('d')||keys.has('arrowright')||m.right)dx+=1;if(keys.has('w')||keys.has('arrowup')||m.up)dz-=1;if(keys.has('s')||keys.has('arrowdown')||m.down)dz+=1;const len=Math.hypot(dx,dz)||1;dx/=len;dz/=len;const nx=THREE.MathUtils.clamp(player.position.x+dx*11*dt,-86,86),nz=THREE.MathUtils.clamp(player.position.z+dz*11*dt,-86,86);if(!collisions.some(b=>b.containsPoint(temp.set(nx,1.5,nz))))player.position.set(nx,0,nz);cars.forEach((c,i)=>{if(c.userData.axis==='x')c.position.x=c.position.x+(c.userData.dir*7*dt);else c.position.z=c.position.z+(c.userData.dir*7*dt);if(c.position.x>88)c.position.x=-88;if(c.position.x<-88)c.position.x=88;if(c.position.z>88)c.position.z=-88;if(c.position.z<-88)c.position.z=88});camera.position.lerp(new THREE.Vector3(player.position.x-13,15,player.position.z+17),.12);camera.lookAt(player.position.x,1.8,player.position.z);const now=performance.now();if(now-lastSave>1400){lastSave=now;try{localStorage.setItem(SAVE_KEY,JSON.stringify({...loadSave(),x:player.position.x,z:player.position.z,mobileSafe:true,updatedAt:new Date().toISOString()}))}catch{};window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:player.position.x,z:player.position.z,speed:Math.hypot(dx,dz)*11}}))}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  setStatus('MOBILE SAFE CITY • LIVE');setMessage('Chicago StreetVerse loaded in mobile-safe mode. Use the arrows to move.');window.dispatchEvent(new CustomEvent('tryamm:streetverse-enter',{detail:{district:'01',mobileSafe:true,residents:0,vehicles:cars.length,cityVisible:true}}));animate()
  return()=>{cancelAnimationFrame(raf);removeEventListener('keydown',kd);removeEventListener('keyup',ku);ro.disconnect();renderer.dispose();renderer.domElement.remove();window.dispatchEvent(new CustomEvent('tryamm:streetverse-exit',{detail:{mobileSafe:true}}))}
 },[])
 const press=(key:keyof typeof moveRef.current,value:boolean)=>{moveRef.current={...moveRef.current,[key]:value}}
 const hold=(key:keyof typeof moveRef.current)=>(e:React.PointerEvent)=>{e.preventDefault();(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);press(key,true)}
 const release=(key:keyof typeof moveRef.current)=>(e:React.PointerEvent)=>{e.preventDefault();press(key,false)}
 if(webglFailed)return <StreetVerseMobilePlayableWorld onClose={onClose}/>
 return <div style={{position:'fixed',inset:0,background:'#07101d',zIndex:15000}}><div ref={mountRef} style={{position:'absolute',inset:0}}/><div style={{position:'fixed',top:14,left:14,zIndex:15010,padding:'9px 11px',borderRadius:10,background:'#07131ddd',border:'1px solid #66e6ff99',color:'#fff',fontFamily:'system-ui',fontSize:11,fontWeight:800}}>{status}<div style={{opacity:.72,marginTop:3,maxWidth:260}}>{message}</div></div><button onClick={onClose} style={{position:'fixed',top:14,right:14,zIndex:15012,minHeight:44,padding:'0 14px',borderRadius:12,border:'1px solid #ffffff55',background:'#111827dd',color:'#fff',fontWeight:900}}>EXIT</button><div style={{position:'fixed',left:16,bottom:22,zIndex:15012,display:'grid',gridTemplateColumns:'58px 58px 58px',gridTemplateRows:'58px 58px',gap:8,touchAction:'none'}}><span/><button onPointerDown={hold('up')} onPointerUp={release('up')} onPointerCancel={release('up')} style={pad}>▲</button><span/><button onPointerDown={hold('left')} onPointerUp={release('left')} onPointerCancel={release('left')} style={pad}>◀</button><button onPointerDown={hold('down')} onPointerUp={release('down')} onPointerCancel={release('down')} style={pad}>▼</button><button onPointerDown={hold('right')} onPointerUp={release('right')} onPointerCancel={release('right')} style={pad}>▶</button></div></div>
}
const pad:React.CSSProperties={borderRadius:14,border:'1px solid #6fe8ff88',background:'#07131de8',color:'#fff',fontSize:23,fontWeight:900,touchAction:'none'}
