import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {FEATURED_FAITHVERSE_BOOKS} from '../data/FaithVerseStudyLibrary'

type Props={onClose:()=>void}
type Portal={id:string;label:string;sub:string;layer?:string;prompt?:string;color:number}

const PORTALS:Portal[]=[
 {id:'kjv1611',label:'KJV 1611',sub:'80 BOOKS',layer:'kjv1611',color:0xe8b944},
 {id:'apocrypha',label:'1611 APOCRYPHA',sub:'14 BOOKS',layer:'apocrypha',color:0xc889ff},
 {id:'ethiopian81',label:'ETHIOPIAN CANON',sub:'81 BOOKS',layer:'canon81',color:0x65e5ff},
 {id:'esther',label:'ESTHER',sub:'KJV + ETHIOPIAN CANON',prompt:'Open a source-labeled Esther study. Keep the Book of Esther distinct from the Rest/Additions to Esther in the 1611 Apocrypha.',color:0xffc86b},
 {id:'jubilees',label:'JUBILEES',sub:'ETHIOPIAN CANON',prompt:'Open a source-labeled Book of Jubilees study through the Ethiopian-canon lane. Do not relabel it as KJV 1611 Apocrypha.',color:0x7dffae},
 {id:'hebrew',label:'HEBREW SCHOOL',sub:'ALEPH-BET • ROOTS',layer:'hebrew',color:0x67a8ff},
 {id:'strongs',label:"STRONG'S",sub:'KJV WORD STUDY',layer:'strongs',color:0xff8a72},
 {id:'hologpt',label:'HOLOGPT',sub:'AI TUTOR',prompt:'Open the FaithVerse HoloGPT tutor with source-label integrity rules.',color:0x70f0ff},
 {id:'chrono',label:'FAITH CHRONO',sub:'RECONSTRUCTION',prompt:'Open a source-grounded Faith Chrono reconstruction. Clearly label all reconstruction and generated dialogue.',color:0xa98cff},
]

function makeLabel(title:string,sub:string,color:number){
 const c=document.createElement('canvas');c.width=768;c.height=256
 const g=c.getContext('2d')!;const hex='#'+color.toString(16).padStart(6,'0')
 g.fillStyle='#05080d';g.fillRect(0,0,c.width,c.height);g.strokeStyle=hex;g.lineWidth=10;g.strokeRect(8,8,c.width-16,c.height-16)
 g.textAlign='center';g.textBaseline='middle';g.fillStyle='#fff';g.font='900 54px system-ui';g.fillText(title,384,92)
 g.fillStyle=hex;g.font='800 28px system-ui';g.fillText(sub,384,166)
 const t=new THREE.CanvasTexture(c);t.minFilter=THREE.LinearFilter;return t
}

export default function FaithVerseLivingScriptureWorld({onClose}:Props){
 const mount=useRef<HTMLDivElement>(null)
 const rendererRef=useRef<THREE.WebGLRenderer|null>(null)
 const sessionRef=useRef<any>(null)
 const [selected,setSelected]=useState('kjv1611')
 const [support,setSupport]=useState({vr:false,ar:false,checked:false})
 const [status,setStatus]=useState('Living Scripture World ready. Tap a portal; XR activates only on supported devices.')

 const activate=(p:Portal)=>{
  setSelected(p.id)
  window.dispatchEvent(new CustomEvent('tryamm:faithverse-spatial-portal-entered',{detail:{portal:p.id,label:p.label,sourceLabelsRequired:true}}))
  if(p.layer)window.dispatchEvent(new CustomEvent('tryamm:faith-holobook-layer-request',{detail:{layer:p.layer,source:'faithverse-living-scripture-world'}}))
  if(p.id==='esther')window.dispatchEvent(new CustomEvent('tryamm:faith-holobook-layer-request',{detail:{layer:'kjv1611',source:'faithverse-living-scripture-world',featuredBook:'esther'}}))
  if(p.id==='jubilees')window.dispatchEvent(new CustomEvent('tryamm:faith-holobook-layer-request',{detail:{layer:'canon81',source:'faithverse-living-scripture-world',featuredBook:'jubilees'}}))
  if(p.id==='chrono')window.dispatchEvent(new CustomEvent('tryamm:faith-chrono-gateway-request',{detail:{source:'faithverse-living-scripture-world'}}))
  if(p.prompt)window.dispatchEvent(new CustomEvent('tryamm:hologpt-study-context',{detail:{prompt:p.prompt,source:'faithverse-living-scripture-world'}}))
  setStatus(p.label+' selected • '+p.sub)
 }

 useEffect(()=>{
  let alive=true;const xr=(navigator as any).xr
  if(!xr?.isSessionSupported){setSupport({vr:false,ar:false,checked:true});return}
  Promise.allSettled([xr.isSessionSupported('immersive-vr'),xr.isSessionSupported('immersive-ar')]).then(r=>{if(!alive)return;setSupport({vr:r[0].status==='fulfilled'&&r[0].value===true,ar:r[1].status==='fulfilled'&&r[1].value===true,checked:true})})
  return()=>{alive=false}
 },[])

 useEffect(()=>{
  const host=mount.current;if(!host)return
  const scene=new THREE.Scene();scene.background=new THREE.Color(0x02040a);scene.fog=new THREE.FogExp2(0x02040a,.018)
  const camera=new THREE.PerspectiveCamera(60,host.clientWidth/Math.max(1,host.clientHeight),.1,400);camera.position.set(0,8,27)
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setSize(host.clientWidth,host.clientHeight);renderer.xr.enabled=true;host.appendChild(renderer.domElement);rendererRef.current=renderer
  scene.add(new THREE.HemisphereLight(0x9edfff,0x251b0e,1.4));const key=new THREE.DirectionalLight(0xffe3a0,2.2);key.position.set(8,18,10);scene.add(key)
  const floor=new THREE.Mesh(new THREE.CircleGeometry(34,80),new THREE.MeshStandardMaterial({color:0x0c1013,roughness:.86,metalness:.1}));floor.rotation.x=-Math.PI/2;scene.add(floor)
  for(let r=6;r<=28;r+=5){const ring=new THREE.Mesh(new THREE.RingGeometry(r-.04,r+.04,96),new THREE.MeshBasicMaterial({color:r%10?0x28485a:0x7b642b,side:THREE.DoubleSide,transparent:true,opacity:.75}));ring.rotation.x=-Math.PI/2;ring.position.y=.03;scene.add(ring)}
  const core=new THREE.Group();scene.add(core)
  const base=new THREE.Mesh(new THREE.BoxGeometry(7,.8,5),new THREE.MeshStandardMaterial({color:0x5c451c,metalness:.25,roughness:.62}));base.position.y=.5;core.add(base)
  const pageMat=new THREE.MeshStandardMaterial({color:0xf5e8c8,roughness:.85})
  const left=new THREE.Mesh(new THREE.BoxGeometry(3.2,.18,4.2),pageMat);left.position.set(-1.65,1.02,0);left.rotation.z=.08;core.add(left)
  const right=left.clone();right.position.x=1.65;right.rotation.z=-.08;core.add(right)
  const glow=new THREE.PointLight(0x66eaff,9,35);glow.position.set(0,5,0);scene.add(glow)
  const portalGroups:THREE.Group[]=[]
  PORTALS.forEach((p,i)=>{
   const a=i/PORTALS.length*Math.PI*2;const x=Math.sin(a)*20,z=Math.cos(a)*20
   const group=new THREE.Group();group.position.set(x,0,z);group.lookAt(0,4,0)
   const ring=new THREE.Mesh(new THREE.TorusGeometry(3.1,.18,12,64),new THREE.MeshStandardMaterial({color:p.color,emissive:p.color,emissiveIntensity:.45,metalness:.6,roughness:.3}));ring.position.y=4;group.add(ring)
   const plane=new THREE.Mesh(new THREE.PlaneGeometry(6.6,2.2),new THREE.MeshBasicMaterial({map:makeLabel(p.label,p.sub,p.color),side:THREE.DoubleSide}));plane.position.y=4;plane.position.z=.12;group.add(plane)
   portalGroups.push(group);scene.add(group)
  })
  for(let i=0;i<140;i++){const s=new THREE.Mesh(new THREE.SphereGeometry(.035,5,5),new THREE.MeshBasicMaterial({color:i%3?0xffffff:0xe8b944}));s.position.set((Math.random()-.5)*80,2+Math.random()*28,(Math.random()-.5)*80);scene.add(s)}
  let yaw=0,drag=false,lastX=0,prev=performance.now()
  const down=(e:PointerEvent)=>{drag=true;lastX=e.clientX;renderer.domElement.setPointerCapture(e.pointerId)}
  const move=(e:PointerEvent)=>{if(!drag)return;yaw-=(e.clientX-lastX)*.004;lastX=e.clientX}
  const up=()=>{drag=false}
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up)
  renderer.setAnimationLoop((now:number)=>{const dt=Math.min(.05,(now-prev)/1000);prev=now;if(!renderer.xr.isPresenting){yaw+=dt*.05;camera.position.x=Math.sin(yaw)*27;camera.position.z=Math.cos(yaw)*27;camera.lookAt(0,3,0)}core.position.y=.08+Math.sin(now*.0013)*.12;portalGroups.forEach((g,i)=>{g.position.y=.15+Math.sin(now*.0014+i)*.15});renderer.render(scene,camera)})
  const resize=()=>{camera.aspect=host.clientWidth/Math.max(1,host.clientHeight);camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};addEventListener('resize',resize)
  return()=>{renderer.setAnimationLoop(null);removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.dispose();scene.traverse(o=>{const m=o as THREE.Mesh;m.geometry?.dispose?.();const mat=m.material;if(Array.isArray(mat))mat.forEach(x=>x.dispose());else mat?.dispose?.()});if(renderer.domElement.parentNode===host)host.removeChild(renderer.domElement)}
 },[])

 const enterXR=async(mode:'immersive-vr'|'immersive-ar')=>{
  const xr=(navigator as any).xr,renderer=rendererRef.current;if(!xr||!renderer){setStatus('WebXR unavailable; one-hand screen world remains active.');return}
  try{if(sessionRef.current)await sessionRef.current.end();const session=await xr.requestSession(mode,{requiredFeatures:['local-floor'],optionalFeatures:['bounded-floor','hand-tracking','dom-overlay'],domOverlay:{root:document.body}});sessionRef.current=session;await renderer.xr.setSession(session);setStatus(mode==='immersive-vr'?'FaithVerse VR active. Keep a clear safe play area.':'FaithVerse AR active. Scripture portals share the physical view.');session.addEventListener('end',()=>{sessionRef.current=null;setStatus('XR ended • screen world restored.')},{once:true})}catch(e){setStatus(e instanceof Error?e.message:'XR could not start; screen world remains active.')}
 }

 return <div role="dialog" aria-modal="true" aria-label="FaithVerse Living Scripture World" style={{position:'fixed',inset:0,zIndex:12600,background:'#02040a',color:'#fff',fontFamily:'system-ui'}}>
  <div ref={mount} style={{position:'absolute',inset:0}}/>
  <div style={{position:'absolute',left:8,right:8,top:'calc(env(safe-area-inset-top,0px) + 8px)',zIndex:3,display:'flex',gap:6,flexWrap:'wrap'}}>
   <button onClick={onClose} style={btn}>← FAITHVERSE</button>
   <button disabled={!support.vr} onClick={()=>enterXR('immersive-vr')} style={{...btn,opacity:support.vr?1:.5}}>🥽 VR</button>
   <button disabled={!support.ar} onClick={()=>enterXR('immersive-ar')} style={{...btn,opacity:support.ar?1:.5}}>📱 AR</button>
  </div>
  <div style={{position:'absolute',left:8,right:8,bottom:'calc(env(safe-area-inset-bottom,0px) + 8px)',zIndex:3,padding:9,borderRadius:15,border:'1px solid #5acbe177',background:'#03080ee8',backdropFilter:'blur(12px)'}}>
   <div style={{fontSize:9,color:'#e8b944',fontWeight:950,letterSpacing:1.5}}>LIVING SCRIPTURE WORLD • SOURCE-LABELED</div>
   <div style={{display:'flex',gap:5,overflowX:'auto',padding:'7px 0'}}>{PORTALS.map(p=><button key={p.id} onClick={()=>activate(p)} style={{...portal,borderColor:selected===p.id?'#e8b944':'#38505d'}}>{p.label}<small>{p.sub}</small></button>)}</div>
   <div role="status" style={{fontSize:9,color:'#c8d7dc'}}>{status}</div>
   <div style={{fontSize:8,color:'#85979e',marginTop:4}}>Esther • {FEATURED_FAITHVERSE_BOOKS.find(x=>x.id==='esther')?.note} Jubilees • {FEATURED_FAITHVERSE_BOOKS.find(x=>x.id==='jubilees')?.note}</div>
  </div>
 </div>
}

const btn:React.CSSProperties={minHeight:42,padding:'0 11px',borderRadius:999,border:'1px solid #5bcde777',background:'#07151ddd',color:'#fff',fontWeight:950}
const portal:React.CSSProperties={minWidth:118,minHeight:48,padding:'5px 8px',borderRadius:10,border:'1px solid #38505d',background:'#071018',color:'#fff',fontWeight:900,fontSize:9,display:'grid',gap:2,textAlign:'left',flex:'0 0 auto'}