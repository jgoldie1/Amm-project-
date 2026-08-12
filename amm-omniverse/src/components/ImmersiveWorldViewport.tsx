import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Mode='city'|'wilderness'|'moon'|'mars'|'saturn'|'chrono'
interface Props{onClose:()=>void}

const modes:Record<Mode,{label:string;sky:number;ground:number;gravity:string;description:string}>={
 city:{label:'Global City',sky:0x030714,ground:0x151923,gravity:'1.0g',description:'Original open-world district prototype: streets, buildings, Life/City, Business, Kingdom, Creator and adult Street lanes.'},
 wilderness:{label:'Worldwide Wilderness',sky:0x07180f,ground:0x18351d,gravity:'1.0g',description:'Biosphere prototype for wildlife observation, tracking, fishing, conservation and regulated hunting simulation.'},
 moon:{label:'Moon',sky:0x010105,ground:0x777777,gravity:'0.165g',description:'Low-gravity exploration and lunar settlement/logistics prototype.'},
 mars:{label:'Mars',sky:0x100604,ground:0x7d2e18,gravity:'0.38g',description:'Mars habitat, science, water, agriculture and settlement prototype.'},
 saturn:{label:'Saturn System',sky:0x010108,ground:0x161629,gravity:'orbital',description:'Saturn/Titan/Enceladus navigation and science prototype.'},
 chrono:{label:'Chrono Corridor',sky:0x050019,ground:0x12102a,gravity:'variable',description:'Time Machine visualization: historical reconstructions, future simulations and alternate timelines remain clearly labeled.'},
}

export default function ImmersiveWorldViewport({onClose}:Props){
 const mount=useRef<HTMLDivElement>(null)
 const [mode,setMode]=useState<Mode>('city')
 const [status,setStatus]=useState('Use WASD / arrow keys to move. Drag to look.')

 useEffect(()=>{
  const host=mount.current;if(!host)return
  const config=modes[mode]
  const scene=new THREE.Scene();scene.background=new THREE.Color(config.sky);scene.fog=new THREE.Fog(config.sky,35,150)
  const camera=new THREE.PerspectiveCamera(65,host.clientWidth/Math.max(host.clientHeight,1),0.1,500);camera.position.set(0,5,18)
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;host.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0xbcd8ff,0x231b16,1.3));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(20,35,10);sun.castShadow=true;scene.add(sun)
  const group=new THREE.Group();scene.add(group)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(220,220,20,20),new THREE.MeshStandardMaterial({color:config.ground,roughness:0.9,metalness:0.05}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;group.add(ground)

  const addCity=()=>{for(let x=-5;x<=5;x++)for(let z=-5;z<=5;z++){if(Math.abs(x)%2===0||Math.abs(z)%2===0)continue;const h=3+((Math.abs(x*17+z*13))%10);const b=new THREE.Mesh(new THREE.BoxGeometry(5,h,5),new THREE.MeshStandardMaterial({color:new THREE.Color().setHSL(((x+z+12)%12)/12,.35,.22)}));b.position.set(x*8,h/2,z*8);b.castShadow=true;b.receiveShadow=true;group.add(b)}
   const roadMat=new THREE.MeshStandardMaterial({color:0x111217,roughness:1});for(let i=-5;i<=5;i+=2){const r1=new THREE.Mesh(new THREE.BoxGeometry(2,.05,100),roadMat);r1.position.set(i*8,.03,0);group.add(r1);const r2=new THREE.Mesh(new THREE.BoxGeometry(100,.05,2),roadMat);r2.position.set(0,.03,i*8);group.add(r2)}}
  const addWilderness=()=>{for(let i=0;i<90;i++){const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.15,.25,1.7,7),new THREE.MeshStandardMaterial({color:0x4a2b18}));const x=(Math.random()-.5)*100,z=(Math.random()-.5)*100;trunk.position.set(x,.85,z);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.15,3.5,8),new THREE.MeshStandardMaterial({color:0x174d26}));crown.position.set(x,3,z);group.add(trunk,crown)}for(let i=0;i<20;i++){const bird=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshStandardMaterial({color:0xffffff}));bird.position.set((Math.random()-.5)*50,6+Math.random()*12,(Math.random()-.5)*50);bird.userData.phase=Math.random()*10;group.add(bird)}}
  const addRockWorld=(color:number)=>{for(let i=0;i<80;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.3+Math.random()*1.5,0),new THREE.MeshStandardMaterial({color,roughness:1}));rock.scale.y=.5+Math.random();rock.position.set((Math.random()-.5)*90,.4,(Math.random()-.5)*90);group.add(rock)}const habitat=new THREE.Mesh(new THREE.CylinderGeometry(4,4,2.4,32),new THREE.MeshStandardMaterial({color:0xd6e6ef,metalness:.7,roughness:.3}));habitat.position.set(0,1.2,-10);group.add(habitat)}
  const addSaturn=()=>{ground.visible=false;const planet=new THREE.Mesh(new THREE.SphereGeometry(8,48,32),new THREE.MeshStandardMaterial({color:0xd9b477,roughness:.7}));planet.position.set(0,3,-18);group.add(planet);const ring=new THREE.Mesh(new THREE.RingGeometry(11,18,96),new THREE.MeshBasicMaterial({color:0xcbbd9b,side:THREE.DoubleSide,transparent:true,opacity:.75}));ring.position.copy(planet.position);ring.rotation.x=Math.PI/2.35;group.add(ring);for(let i=0;i<300;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.035,5,5),new THREE.MeshBasicMaterial({color:0xffffff}));s.position.set((Math.random()-.5)*180,(Math.random()-.5)*100,(Math.random()-.5)*180);group.add(s)}}
  const addChrono=()=>{for(let i=0;i<14;i++){const ring=new THREE.Mesh(new THREE.TorusGeometry(3+i*.65,.05,8,64),new THREE.MeshBasicMaterial({color:new THREE.Color().setHSL(i/14,.9,.6)}));ring.position.z=-i*5;ring.rotation.x=Math.PI/2;group.add(ring)}for(let i=0;i<120;i++){const p=new THREE.Mesh(new THREE.SphereGeometry(.04,5,5),new THREE.MeshBasicMaterial({color:0xaa88ff}));p.position.set((Math.random()-.5)*30,Math.random()*15,(Math.random()-.5)*90);group.add(p)}}
  if(mode==='city')addCity();else if(mode==='wilderness')addWilderness();else if(mode==='moon')addRockWorld(0x777777);else if(mode==='mars')addRockWorld(0x8b321e);else if(mode==='saturn')addSaturn();else addChrono()

  const keys=new Set<string>();let dragging=false,lastX=0,lastY=0,yaw=0,pitch=-.08
  const keydown=(e:KeyboardEvent)=>keys.add(e.key.toLowerCase()),keyup=(e:KeyboardEvent)=>keys.delete(e.key.toLowerCase())
  const down=(e:PointerEvent)=>{dragging=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)}
  const move=(e:PointerEvent)=>{if(!dragging)return;yaw-=(e.clientX-lastX)*.004;pitch=Math.max(-1.2,Math.min(1.2,pitch-(e.clientY-lastY)*.003));lastX=e.clientX;lastY=e.clientY}
  const up=()=>{dragging=false}
  addEventListener('keydown',keydown);addEventListener('keyup',keyup);renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up)
  let raf=0,prev=performance.now()
  const animate=(now:number)=>{const dt=Math.min(.05,(now-prev)/1000);prev=now;const forward=new THREE.Vector3(Math.sin(yaw),0,-Math.cos(yaw)),right=new THREE.Vector3(Math.cos(yaw),0,Math.sin(yaw));let v=new THREE.Vector3();if(keys.has('w')||keys.has('arrowup'))v.add(forward);if(keys.has('s')||keys.has('arrowdown'))v.sub(forward);if(keys.has('d')||keys.has('arrowright'))v.add(right);if(keys.has('a')||keys.has('arrowleft'))v.sub(right);if(v.lengthSq())camera.position.add(v.normalize().multiplyScalar(10*dt));camera.position.y=mode==='saturn'||mode==='chrono'?5:Math.max(2,camera.position.y);camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;if(mode==='saturn'||mode==='chrono')group.rotation.y+=dt*.04;group.children.forEach(o=>{if(o.userData.phase!=null)o.position.y+=Math.sin(now*.001+o.userData.phase)*.003});renderer.render(scene,camera);raf=requestAnimationFrame(animate)};raf=requestAnimationFrame(animate)
  const resize=()=>{camera.aspect=host.clientWidth/Math.max(host.clientHeight,1);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);removeEventListener('keydown',keydown);removeEventListener('keyup',keyup);removeEventListener('resize',resize);renderer.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)m.geometry.dispose();const mat=m.material;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose?.()});host.removeChild(renderer.domElement)}
 },[mode])

 const button:React.CSSProperties={background:'#101b35',border:'1px solid #78d5ff66',color:'#bdeaff',borderRadius:8,padding:'7px 10px',fontFamily:'monospace',cursor:'pointer'}
 return <div style={{position:'fixed',inset:0,zIndex:10080,background:'#010105',color:'#fff',fontFamily:'monospace'}}><div style={{position:'absolute',top:10,left:10,right:10,zIndex:2,display:'flex',gap:6,flexWrap:'wrap',alignItems:'center'}}><button style={button} onClick={onClose}>← Exit</button>{(Object.keys(modes) as Mode[]).map(m=><button key={m} style={{...button,background:m===mode?'#164b5a':'#101b35'}} onClick={()=>{setMode(m);setStatus(modes[m].description)}}>{modes[m].label}</button>)}</div><div ref={mount} style={{width:'100%',height:'100%'}}/><div style={{position:'absolute',left:12,bottom:12,maxWidth:620,zIndex:2,background:'rgba(2,2,18,.78)',border:'1px solid #78d5ff55',borderRadius:10,padding:10}}><b style={{color:'#78d5ff'}}>{modes[mode].label} • {modes[mode].gravity}</b><div style={{fontSize:11,color:'#bbb',marginTop:4}}>{status}</div><div style={{fontSize:9,color:'#777',marginTop:5}}>Three.js interactive vertical slice. It proves world loading/navigation; production worldwide photoreal content, multiplayer sharding and certified holographic hardware remain separate production work.</div></div></div>
}
