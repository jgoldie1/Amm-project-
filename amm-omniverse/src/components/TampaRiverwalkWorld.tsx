import {Canvas,useFrame} from '@react-three/fiber'
import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {TAMPA_RIVERWALK_DISTRICTS,resolveTampaTravel,clampTampaWalk} from '../data/tampaRiverwalkScene.mjs'
type Direction='forward'|'back'|'left'|'right'
const button:React.CSSProperties={minHeight:56,border:'2px solid #82dafa',borderRadius:12,background:'#102f42',color:'#fff',fontSize:14,fontWeight:900,padding:'9px 13px',touchAction:'none',cursor:'pointer'}
function Avatar({position}:{position:[number,number]}){return <group position={[position[0],0,position[1]]}>
 <mesh castShadow position={[0,.95,0]}><capsuleGeometry args={[.31,.9,4,12]}/><meshStandardMaterial color="#985ed8"/></mesh>
 <mesh castShadow position={[0,1.83,0]}><sphereGeometry args={[.32,16,12]}/><meshStandardMaterial color="#9d674e"/></mesh>
 <mesh position={[0,2.32,0]}><boxGeometry args={[1.1,.22,.12]}/><meshBasicMaterial color="#ffdd8c"/></mesh>
 </group>}
function District({x,z,label,tone}:{x:number;z:number;label:string;tone:string}){
 return <group position={[x,0,z]}>
  <mesh receiveShadow castShadow position={[0,1.15,0]}><boxGeometry args={[6,2.3,5]}/><meshStandardMaterial color={tone} roughness={.8}/></mesh>
  <mesh castShadow position={[0,2.65,0]}><boxGeometry args={[6.5,.55,5.5]}/><meshStandardMaterial color="#293347"/></mesh>
  <mesh position={[0,3.8,.1]}><boxGeometry args={[6,.55,.12]}/><meshBasicMaterial color="#e7faff"/></mesh>
 </group>
}
function Scene({position}:{position:[number,number]}){
 const cameraTarget=useRef(new THREE.Vector3())
 useFrame(({camera})=>{cameraTarget.current.set(position[0]+16,23,position[1]+23);camera.position.lerp(cameraTarget.current,.06);camera.lookAt(position[0],0,position[1])})
 return <>
  <color attach="background" args={['#78afca']}/>
  <fog attach="fog" args={['#78afca',45,115]}/>
  <ambientLight intensity={1.65}/>
  <directionalLight position={[20,34,12]} intensity={2.2} castShadow/>
  <mesh receiveShadow rotation={[-Math.PI/2,0,0]}><planeGeometry args={[80,88]}/><meshStandardMaterial color="#78a179" roughness={1}/></mesh>
  <mesh receiveShadow position={[0,.015,0]}><boxGeometry args={[10,.04,82]}/><meshStandardMaterial color="#c1c3ac"/></mesh>
  <mesh position={[-39,.02,0]}><boxGeometry args={[10,.04,87]}/><meshStandardMaterial color="#267c9b" metalness={.35} roughness={.24}/></mesh>
  <mesh position={[-29,.05,0]}><boxGeometry args={[2,.04,85]}/><meshStandardMaterial color="#d1a568"/></mesh>
  {Array.from({length:9},(_,i)=><group key={i} position={[-27,0,-35+i*8]}>
    <mesh position={[0,.75,0]}><cylinderGeometry args={[.13,.2,1.5,8]}/><meshStandardMaterial color="#555044"/></mesh>
    <mesh position={[0,1.8,0]}><sphereGeometry args={[1.05,8,7]}/><meshStandardMaterial color="#47894c"/></mesh>
  </group>)}
  <District x={18} z={-4} tone="#e39bb8" label="Beauty House"/>
  <District x={-19} z={-9} tone="#eac2a2" label="Residential Village"/>
  <District x={1} z={-23} tone="#3b78b4" label="Entertainment Pier"/>
  <District x={0} z={7} tone="#9bbbd4" label="Riverwalk"/>
  {Array.from({length:12},(_,i)=><mesh key={i} castShadow position={[-23+(i%4)*3,.3,-13+Math.floor(i/4)*3]}><boxGeometry args={[1.9,.6,1.8]}/><meshStandardMaterial color={i%3===0?'#a2baca':'#e8cdb5'}/></mesh>)}
  <Avatar position={position}/>
  <gridHelper args={[78,13,'#a9e5e2','#6c9076']} position={[0,.06,0]}/>
 </>
}
export default function TampaRiverwalkWorld({onReturn}:{onReturn:()=>void}){
 const [pos,setPos]=useState<[number,number]>([0,7])
 const held=useRef<Direction|null>(null)
 const [active,setActive]=useState('riverwalk')
 const [status,setStatus]=useState('Tampa Riverwalk 3D prototype loaded. Use arrows to walk, or select a district.')
 useEffect(()=>{
  let timer:number|undefined
  const move=()=>{const d=held.current;if(!d)return;setPos(([x,z])=>{const p=clampTampaWalk(x+(d==='right'?.65:d==='left'?-.65:0),z+(d==='back'?.65:d==='forward'?-.65:0));return [p.x,p.z]})}
  timer=window.setInterval(move,60)
  const onKey=(e:KeyboardEvent)=>{const m:Record<string,Direction>={ArrowUp:'forward',w:'forward',ArrowDown:'back',s:'back',ArrowLeft:'left',a:'left',ArrowRight:'right',d:'right'};const d=m[e.key];if(d){e.preventDefault();held.current=d}}
  const up=(e:KeyboardEvent)=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key))held.current=null}
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',up)
  const blur=()=>{held.current=null};window.addEventListener('blur',blur)
  return()=>{window.clearInterval(timer);window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',up);window.removeEventListener('blur',blur)}
 },[])
 const travel=(id:string)=>{const p=resolveTampaTravel(id);if(!p)return;setPos([p.x,p.z]);setActive(id);setStatus(p.label+' • '+p.activity)}
 const control=(d:Direction)=><button key={d} aria-label={'Walk '+d} onPointerDown={e=>{e.preventDefault();held.current=d}} onPointerUp={()=>held.current=null} onPointerCancel={()=>held.current=null} onPointerLeave={()=>held.current=null} style={button}>{d==='forward'?'▲':d==='back'?'▼':d==='left'?'◀':'▶'}</button>
 return <div data-streetverse-world="tampa-riverwalk-prototype" aria-label="Tampa Riverwalk playable 3D prototype" style={{position:'fixed',inset:0,zIndex:15050,background:'#122638',color:'#fff'}}>
  <Canvas shadows camera={{position:[16,23,28],fov:52,near:.1,far:150}} gl={{antialias:false,powerPreference:'low-power'}}><Scene position={pos}/></Canvas>
  <header style={{position:'absolute',top:65,left:8,right:8,display:'flex',gap:7,flexWrap:'wrap',alignItems:'center',background:'#061727e8',padding:8,borderRadius:12}}>
   <button style={button} aria-label="Return to StreetVerse main world" onClick={onReturn}>← BACK</button>
   <div><strong>🌴 TAMPA RIVERWALK 3D</strong><div style={{fontSize:11}}>BeautyVerse · stylized prototype, not surveyed geographic reconstruction</div></div>
  </header>
  <nav aria-label="Tampa scene districts" style={{position:'absolute',top:165,left:9,right:9,display:'flex',gap:7,overflowX:'auto',paddingBottom:8}}>
   {TAMPA_RIVERWALK_DISTRICTS.map(d=><button aria-pressed={active===d.id} key={d.id} onClick={()=>travel(d.id)} style={{...button,minWidth:135,background:active===d.id?'#375749':'#102f42',fontSize:12}}>{d.label.toUpperCase()}</button>)}
  </nav>
  <div style={{position:'absolute',bottom:12,left:12,display:'grid',gap:4,gridTemplateColumns:'repeat(3,58px)',background:'#041b2cdd',padding:9,borderRadius:14}}>
   <span/>{control('forward')}<span/>{control('left')}{control('back')}{control('right')}
  </div>
  <div role="status" aria-live="polite" style={{position:'absolute',bottom:10,right:10,maxWidth:'min(45vw,260px)',background:'#041b2ce8',padding:10,borderRadius:12,fontSize:12}}>{status}<p style={{marginBottom:0,color:'#ffdc97'}}>Visible avatar is a temporary stylized stand-in; LaTeasia's original rig not certified here.</p></div>
 </div>
}
