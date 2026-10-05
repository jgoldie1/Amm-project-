import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

export default function KingdomDistrictRoute(){
 const mount=useRef<HTMLDivElement|null>(null)
 const [started,setStarted]=useState(false)
 const [speed,setSpeed]=useState(0)
 const [zone]=useState('Crown Heights')
 const input=useRef({up:false,down:false,left:false,right:false})
 useEffect(()=>{
  if(!started||!mount.current)return
  const root=mount.current
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x15122c);scene.fog=new THREE.Fog(0x15122c,70,280)
  const camera=new THREE.PerspectiveCamera(66,1,.1,800)
  const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));root.appendChild(renderer.domElement)
  scene.add(new THREE.HemisphereLight(0x7a74c4,0x2a1d12,1.1))
  const moon=new THREE.DirectionalLight(0xc2c8ff,.8);moon.position.set(-90,140,50);scene.add(moon)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.MeshLambertMaterial({color:0x26233b}));ground.rotation.x=-Math.PI/2;scene.add(ground)
  const roadMat=new THREE.MeshLambertMaterial({color:0x10121a}),walkMat=new THREE.MeshLambertMaterial({color:0x4b465d})
  for(let k=-3;k<=3;k++){const x=k*74;const r=new THREE.Mesh(new THREE.BoxGeometry(14,.08,520),roadMat);r.position.set(x,.04,0);scene.add(r);const r2=new THREE.Mesh(new THREE.BoxGeometry(520,.08,14),roadMat);r2.position.set(0,.04,x);scene.add(r2)}
  const colors=[0x514c6d,0x3e4058,0x6a4d60,0x3e5960]
  for(let gx=-3;gx<3;gx++)for(let gz=-3;gz<3;gz++){const cx=(gx+.5)*74,cz=(gz+.5)*74;for(const ox of [-15,15])for(const oz of [-15,15]){if(Math.random()<.15)continue;const h=12+Math.random()*44;const b=new THREE.Mesh(new THREE.BoxGeometry(24,h,24),new THREE.MeshLambertMaterial({color:colors[(Math.abs(gx+gz)+Math.round(h))%colors.length],emissive:0x120d1c,emissiveIntensity:.18}));b.position.set(cx+ox,h/2,cz+oz);scene.add(b)}}
  const car=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(4.6,1.1,2.1),new THREE.MeshStandardMaterial({color:0xe4b93f,metalness:.65,roughness:.24}));body.position.y=.8;car.add(body);const cab=new THREE.Mesh(new THREE.BoxGeometry(2.2,.8,1.8),new THREE.MeshStandardMaterial({color:0x172a3a,metalness:.65,roughness:.12}));cab.position.set(-.2,1.55,0);car.add(cab);car.position.set(0,.05,42);scene.add(car)
  const traffic:THREE.Group[]=[]
  for(let i=0;i<14;i++){const g=new THREE.Group();const m=new THREE.Mesh(new THREE.BoxGeometry(4.2,.9,1.9),new THREE.MeshStandardMaterial({color:[0x39e0d0,0xff4f9a,0x8c86a8,0xf2b630][i%4]}));m.position.y=.65;g.add(m);g.position.set(-222+(i%7)*74,.05,i<7?-74:74);scene.add(g);traffic.push(g)}
  let heading=0,velocity=0,raf=0,last=performance.now()
  const resize=()=>{const w=root.clientWidth||innerWidth,h=root.clientHeight||innerHeight;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h)}
  resize();addEventListener('resize',resize)
  const kd=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')input.current.up=true;if(k==='s'||k==='arrowdown')input.current.down=true;if(k==='a'||k==='arrowleft')input.current.left=true;if(k==='d'||k==='arrowright')input.current.right=true}
  const ku=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();if(k==='w'||k==='arrowup')input.current.up=false;if(k==='s'||k==='arrowdown')input.current.down=false;if(k==='a'||k==='arrowleft')input.current.left=false;if(k==='d'||k==='arrowright')input.current.right=false}
  addEventListener('keydown',kd);addEventListener('keyup',ku)
  const loop=(now:number)=>{const dt=Math.min(.05,(now-last)/1000);last=now;const h=input.current;if(h.up)velocity=Math.min(22,velocity+20*dt);else if(h.down)velocity=Math.max(-8,velocity-24*dt);else velocity*=Math.pow(.12,dt);if(Math.abs(velocity)>.2){if(h.left)heading+=1.5*dt*Math.sign(velocity);if(h.right)heading-=1.5*dt*Math.sign(velocity)}car.rotation.y=heading;car.position.x+=Math.sin(heading)*velocity*dt;car.position.z+=Math.cos(heading)*velocity*dt;setSpeed(Math.round(Math.abs(velocity)*2.237));traffic.forEach((t,i)=>{t.position.x+=((i%2)?1:-1)*3.5*dt;if(t.position.x>245)t.position.x=-245;if(t.position.x<-245)t.position.x=245});const behind=new THREE.Vector3(car.position.x-Math.sin(heading)*9,5.2,car.position.z-Math.cos(heading)*9);camera.position.lerp(behind,.12);camera.lookAt(car.position.x,1.1,car.position.z);renderer.render(scene,camera);raf=requestAnimationFrame(loop)}
  raf=requestAnimationFrame(loop)
  return()=>{cancelAnimationFrame(raf);removeEventListener('resize',resize);removeEventListener('keydown',kd);removeEventListener('keyup',ku);renderer.dispose();root.innerHTML=''}
 },[started])
 const press=(k:keyof typeof input.current,v:boolean)=>{input.current[k]=v}
 return <main style={{position:'fixed',inset:0,zIndex:24000,background:'#15122c',color:'#fff',fontFamily:'system-ui',overflow:'hidden'}}>
  {!started?<section style={{position:'absolute',inset:0,display:'grid',placeItems:'center',background:'radial-gradient(circle at 50% 30%,#34285c,#15122c 60%,#090711)',zIndex:3}}><div style={{textAlign:'center',padding:24}}><div style={{fontSize:12,letterSpacing:5,color:'#f2b630',fontWeight:950}}>STREETVERSE</div><h1 style={{fontSize:'clamp(58px,15vw,120px)',lineHeight:.78,margin:'10px 0',textTransform:'uppercase'}}>Kingdom<br/>District</h1><p style={{color:'#c8bfdc'}}>Open-world night shift • traffic • driving • touch controls</p><button onClick={()=>setStarted(true)} style={{marginTop:16,minWidth:180,minHeight:54,border:0,borderRadius:14,background:'#f2b630',color:'#17111f',fontWeight:950,fontSize:18}}>START</button><div style={{marginTop:12,fontSize:11,color:'#968ead'}}>Your gold car is parked out front.</div></div></section>:null}
  <div ref={mount} style={{position:'absolute',inset:0}}/>
  {started&&<><div style={{position:'fixed',top:12,left:12,zIndex:5,padding:'10px 12px',borderRadius:12,background:'#080711d9',border:'1px solid #635b8f'}}><b>{zone}</b><div style={{fontSize:11,color:'#b8b0cb'}}>11:12 PM • KINGDOM DISTRICT</div></div><div style={{position:'fixed',right:12,bottom:110,zIndex:5,padding:'10px 14px',borderRadius:14,background:'#080711d9',border:'1px solid #635b8f',fontSize:30,fontWeight:950}}>{speed}<span style={{fontSize:10,marginLeft:4}}>mph</span></div><div style={{position:'fixed',left:12,bottom:18,zIndex:5,display:'grid',gridTemplateColumns:'56px 56px 56px',gap:6}}><span/><button onPointerDown={()=>press('up',true)} onPointerUp={()=>press('up',false)} style={btn}>▲</button><span/><button onPointerDown={()=>press('left',true)} onPointerUp={()=>press('left',false)} style={btn}>◀</button><button onPointerDown={()=>press('down',true)} onPointerUp={()=>press('down',false)} style={btn}>▼</button><button onPointerDown={()=>press('right',true)} onPointerUp={()=>press('right',false)} style={btn}>▶</button></div><button onClick={()=>{window.location.href='/'}} style={{position:'fixed',right:12,top:12,zIndex:6,...btn,width:54}}>×</button></>}
 </main>
}
const btn:React.CSSProperties={width:56,height:56,borderRadius:14,border:'1px solid #8a82b7',background:'#0b0a17dd',color:'#fff',fontSize:20,fontWeight:900,touchAction:'none'}
