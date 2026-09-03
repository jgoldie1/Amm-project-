import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

const SAVE_KEY='tryamm.streetverse.living.v1'
const clamp=(v:number)=>THREE.MathUtils.clamp(v,-82,82)

export default function StreetVerseMobileWorld({onClose}:{onClose:()=>void}){
 const mountRef=useRef<HTMLDivElement|null>(null)
 const input=useRef({up:false,down:false,left:false,right:false})
 const [status,setStatus]=useState('MOBILE CITY • STARTING')
 const [message,setMessage]=useState('StreetVerse Mobile Mode • lightweight Chicago renderer')
 useEffect(()=>{
  const mount=mountRef.current;if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'default',alpha:false})}catch(err){setStatus('WEBGL UNAVAILABLE');setMessage('This browser could not start the 3D renderer. Close other tabs and reload StreetVerse.');return}
  renderer.setPixelRatio(1);renderer.shadowMap.enabled=false;mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x07101d);scene.fog=new THREE.Fog(0x07101d,75,210)
  const camera=new THREE.PerspectiveCamera(62,1,.1,320);camera.position.set(0,16,24)
  scene.add(new THREE.HemisphereLight(0xb9e7ff,0x151822,2.2));const sun=new THREE.DirectionalLight(0xffdfbc,1.8);sun.position.set(35,55,20);scene.add(sun)
  const mat=(c:number)=>new THREE.MeshLambertMaterial({color:c})
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(190,190),mat(0x18221d));ground.rotation.x=-Math.PI/2;scene.add(ground)
  const roadMat=mat(0x20242c),walkMat=mat(0x6b7075)
  for(const v of [-48,0,48]){const r1=new THREE.Mesh(new THREE.BoxGeometry(190,.08,14),roadMat);r1.position.set(0,.04,v);scene.add(r1);const r2=new THREE.Mesh(new THREE.BoxGeometry(14,.08,190),roadMat);r2.position.set(v,.04,0);scene.add(r2);for(const d of [-9,9]){const w1=new THREE.Mesh(new THREE.BoxGeometry(190,.12,3),walkMat);w1.position.set(0,.08,v+d);scene.add(w1);const w2=new THREE.Mesh(new THREE.BoxGeometry(3,.12,190),walkMat);w2.position.set(v+d,.08,0);scene.add(w2)}}
  const colors=[0x24425b,0x41345a,0x31513f,0x5c4032,0x31566b,0x56354e]
  const blocks=[[-70,-70],[-70,-25],[-70,25],[-70,70],[-25,-70],[-25,-25],[-25,25],[-25,70],[25,-70],[25,-25],[25,25],[25,70],[70,-70],[70,-25],[70,25],[70,70]]
  blocks.forEach(([x,z],i)=>{const h=10+(i*7)%22,b=new THREE.Mesh(new THREE.BoxGeometry(15+(i%3)*2,h,15+((i+1)%3)*2),mat(colors[i%colors.length]));b.position.set(x,h/2,z);scene.add(b)})
  const river=new THREE.Mesh(new THREE.PlaneGeometry(150,15),new THREE.MeshLambertMaterial({color:0x194e71}));river.rotation.x=-Math.PI/2;river.rotation.z=.08;river.position.set(0,.06,-18);scene.add(river)
  const rail=new THREE.Mesh(new THREE.BoxGeometry(176,.45,2.2),mat(0x4a4e55));rail.position.set(0,6,-35);scene.add(rail);for(let x=-78;x<=78;x+=13){const p=new THREE.Mesh(new THREE.BoxGeometry(.55,6,.55),mat(0x34383d));p.position.set(x,3,-35);scene.add(p)}
  const train=new THREE.Mesh(new THREE.BoxGeometry(13,2.4,2.8),mat(0xd9dde0));train.position.set(-70,7.3,-35);scene.add(train)
  const avatar=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.8,1.8,3,8),mat(0x55e4ff));body.position.y=1.8;avatar.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.58,10,8),mat(0xc98e67));head.position.y=3.55;avatar.add(head)
  let saved:any={};try{saved=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')}catch{}avatar.position.set(Number(saved.x??0),0,Number(saved.z??54));scene.add(avatar)
  const missionDefs=[{x:-42,z:-30,c:0xb96cff},{x:42,z:-24,c:0x5be7ff},{x:38,z:38,c:0xffc95b},{x:-38,z:38,c:0xff4f9a}];missionDefs.forEach(m=>{const beacon=new THREE.Mesh(new THREE.CylinderGeometry(.8,.8,7,10),new THREE.MeshBasicMaterial({color:m.c,transparent:true,opacity:.55}));beacon.position.set(m.x,3.5,m.z);scene.add(beacon)})
  const cars:THREE.Mesh[]=[];for(let i=0;i<8;i++){const car=new THREE.Mesh(new THREE.BoxGeometry(4.3,1.1,2),mat([0xd94141,0x4288ff,0xd9bd48,0xe8e8e8][i%4]));car.position.set(-75+i*19, .7, i%2?-45:45);scene.add(car);cars.push(car)}
  const resize=()=>{const w=mount.clientWidth||innerWidth,h=mount.clientHeight||innerHeight;renderer.setSize(w,h,false);camera.aspect=w/Math.max(1,h);camera.updateProjectionMatrix()};resize();addEventListener('resize',resize)
  const key=(e:KeyboardEvent,v:boolean)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')input.current.up=v;if(k==='s'||k==='arrowdown')input.current.down=v;if(k==='a'||k==='arrowleft')input.current.left=v;if(k==='d'||k==='arrowright')input.current.right=v};const kd=(e:KeyboardEvent)=>key(e,true),ku=(e:KeyboardEvent)=>key(e,false);addEventListener('keydown',kd);addEventListener('keyup',ku)
  const onTouch=(e:Event)=>{const d=(e as CustomEvent<any>).detail||{};input.current.up=Number(d.throttle||0)>.05;input.current.down=Number(d.brake||0)>.05;input.current.left=Number(d.steer||0)<-.1;input.current.right=Number(d.steer||0)>.1};addEventListener('tryamm:streetverse-vehicle-input',onTouch)
  let last=performance.now(),raf=0,saveAt=0
  const tick=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const s=11*dt;if(input.current.up)avatar.position.z-=s;if(input.current.down)avatar.position.z+=s;if(input.current.left)avatar.position.x-=s;if(input.current.right)avatar.position.x+=s;avatar.position.x=clamp(avatar.position.x);avatar.position.z=clamp(avatar.position.z);camera.position.lerp(new THREE.Vector3(avatar.position.x,16,avatar.position.z+24),.12);camera.lookAt(avatar.position.x,2,avatar.position.z-5);train.position.x=-82+((now*.018)%164);cars.forEach((c,i)=>{c.position.x=-82+((now*.012+i*23)%164)});renderer.render(scene,camera);window.dispatchEvent(new CustomEvent('tryamm:streetverse-player-position',{detail:{x:avatar.position.x,z:avatar.position.z,speed:(input.current.up||input.current.down||input.current.left||input.current.right)?11:0,mobileLite:true}}));if(now-saveAt>1200){saveAt=now;try{const old=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}');localStorage.setItem(SAVE_KEY,JSON.stringify({...old,x:avatar.position.x,z:avatar.position.z,updatedAt:new Date().toISOString(),mobileLite:true}))}catch{}}raf=requestAnimationFrame(tick)};raf=requestAnimationFrame(tick);setStatus('MOBILE CITY • PLAYABLE');setMessage('Chicago Lite is active • move with the StreetVerse touch controls or WASD/arrows');window.dispatchEvent(new CustomEvent('tryamm:streetverse-world-ready',{detail:{mode:'mobile-lite',canvas:true}}))
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('keydown',kd);removeEventListener('keyup',ku);removeEventListener('tryamm:streetverse-vehicle-input',onTouch);renderer.dispose();renderer.domElement.remove()}
 },[])
 return <div ref={mountRef} style={{position:'fixed',inset:0,background:'#07101d',overflow:'hidden'}}><div style={{position:'fixed',left:12,top:72,zIndex:17020,padding:'8px 10px',borderRadius:10,background:'rgba(3,12,20,.9)',border:'1px solid #5be7ff88',color:'#fff',font:'800 11px system-ui'}}><div>{status}</div><div style={{opacity:.75,marginTop:4,maxWidth:280}}>{message}</div><button onClick={onClose} style={{marginTop:7,minHeight:34,borderRadius:8,border:'1px solid #ffffff33',background:'#121923',color:'#fff',fontWeight:800}}>EXIT</button></div></div>
}
