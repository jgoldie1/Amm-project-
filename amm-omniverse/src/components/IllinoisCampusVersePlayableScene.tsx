import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useRef,useState} from 'react'
import * as THREE from 'three'
import type {CampusNetworkNode} from '../data/campusVerseIllinoisUniversityNetwork'

type MoveState={x:number;z:number}
type Stop={id:string;label:string;kind:string;x:number;z:number}

const CAMPUS_STOPS:Partial<Record<CampusNetworkNode['id'],readonly Stop[]>>={
 'malcolm-x':[
  {id:'health-sciences',label:'Health Sciences Center',kind:'health sciences',x:0,z:0},
  {id:'virtual-hospital',label:'Virtual Hospital',kind:'simulation',x:34,z:10},
  {id:'school-nursing',label:'School of Nursing',kind:'nursing',x:-34,z:24},
  {id:'career-transfer',label:'Career + Transfer Center',kind:'career',x:12,z:-34},
 ],
 'malcolm-x-west':[
  {id:'west-campus-center',label:'West Campus Center',kind:'student services',x:0,z:0},
  {id:'community-health',label:'Community Health',kind:'health',x:34,z:10},
  {id:'career-skills',label:'Career Skills Lab',kind:'workforce',x:-34,z:24},
  {id:'adult-education',label:'Adult Education',kind:'education',x:12,z:-34},
 ],
 uiuc:[
  {id:'campus-core',label:'Campus Core',kind:'student life',x:0,z:0},
  {id:'engineering-computing',label:'Engineering + Computing',kind:'technology',x:34,z:10},
  {id:'research-library',label:'Research Library',kind:'research',x:-34,z:24},
  {id:'athletics',label:'Athletics',kind:'athletics',x:12,z:-34},
 ],
 uis:[
  {id:'student-center',label:'Student Center',kind:'student life',x:0,z:0},
  {id:'public-affairs',label:'Public Affairs',kind:'civics',x:34,z:10},
  {id:'computer-science',label:'Computer Science',kind:'technology',x:-34,z:24},
  {id:'research-library',label:'Research + Library',kind:'research',x:12,z:-34},
 ],
 siuc:[
  {id:'student-center',label:'Student Center',kind:'student life',x:0,z:0},
  {id:'engineering-computing',label:'Engineering + Computing',kind:'technology',x:34,z:10},
  {id:'law-health',label:'Law + Health',kind:'professional',x:-34,z:24},
  {id:'arts-athletics',label:'Arts + Athletics',kind:'campus life',x:12,z:-34},
 ],
 siue:[
  {id:'university-center',label:'University Center',kind:'student life',x:0,z:0},
  {id:'engineering',label:'Engineering',kind:'technology',x:34,z:10},
  {id:'health-sciences',label:'Health Sciences',kind:'health',x:-34,z:24},
  {id:'business-research',label:'Business + Research',kind:'research',x:12,z:-34},
 ],
 'siu-medicine-springfield':[
  {id:'clinical-education',label:'Clinical Education',kind:'medicine',x:0,z:0},
  {id:'simulation-lab',label:'Simulation Lab',kind:'training',x:34,z:10},
  {id:'research',label:'Medical Research',kind:'research',x:-34,z:24},
  {id:'public-health',label:'Public Health',kind:'health',x:12,z:-34},
 ],
 'siue-dental-alton':[
  {id:'dental-clinic',label:'Dental Clinic',kind:'dentistry',x:0,z:0},
  {id:'simulation-lab',label:'Dental Simulation Lab',kind:'training',x:34,z:10},
  {id:'community-health',label:'Community Oral Health',kind:'health',x:-34,z:24},
  {id:'research',label:'Dental Research',kind:'research',x:12,z:-34},
 ],
 'siue-east-st-louis':[
  {id:'community-center',label:'Community Center',kind:'community',x:0,z:0},
  {id:'workforce',label:'Workforce Center',kind:'jobs',x:34,z:10},
  {id:'education',label:'Education Programs',kind:'education',x:-34,z:24},
  {id:'youth-programs',label:'Youth Programs',kind:'youth',x:12,z:-34},
 ],
}

function CampusWorld({stops}:{stops:readonly Stop[]}){
 return <group>
  <mesh receiveShadow position={[0,-.1,0]}><boxGeometry args={[160,.2,140]}/><meshStandardMaterial color="#5c7b4e"/></mesh>
  <mesh receiveShadow position={[0,.03,0]}><boxGeometry args={[18,.08,110]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  <mesh receiveShadow position={[0,.03,0]}><boxGeometry args={[110,.08,10]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  {stops.map((s,i)=><group key={s.id} position={[s.x,0,s.z]}>
   <mesh castShadow receiveShadow position={[0,4.5,0]}><boxGeometry args={[i===0?24:20,i===0?9:8,16]}/><meshStandardMaterial color={i%2?'#765244':'#87503f'} roughness={.86}/></mesh>
   <mesh position={[0,2,-8.1]}><boxGeometry args={[5,4,.2]}/><meshStandardMaterial color="#29485b"/></mesh>
   <mesh position={[0,10.5,0]}><cylinderGeometry args={[.25,.25,4,10]}/><meshStandardMaterial color="#6de3ff" emissive="#3bbbd9" emissiveIntensity={.6}/></mesh>
   <mesh position={[0,13,0]}><sphereGeometry args={[.5,10,8]}/><meshStandardMaterial color="#fff2a3" emissive="#ffd85f" emissiveIntensity={.7}/></mesh>
  </group>)}
 </group>
}

function Player({move,onPosition}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void}){
 const ref=useRef<THREE.Group>(null)
 const {camera}=useThree()
 useFrame((_,dt)=>{
  const g=ref.current;if(!g)return
  const speed=15
  g.position.x=THREE.MathUtils.clamp(g.position.x+move.current.x*speed*dt,-68,68)
  g.position.z=THREE.MathUtils.clamp(g.position.z+move.current.z*speed*dt,-58,58)
  if(Math.abs(move.current.x)+Math.abs(move.current.z)>.05)g.rotation.y=Math.atan2(move.current.x,move.current.z)
  camera.position.lerp(new THREE.Vector3(g.position.x,6.4,g.position.z+13),Math.min(1,dt*4))
  camera.lookAt(g.position.x,1.2,g.position.z)
  onPosition(g.position.x,g.position.z)
 })
 return <group ref={ref} position={[8,0,12]}>
  <mesh castShadow position={[0,1.15,0]}><capsuleGeometry args={[.28,.8,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
  <mesh castShadow position={[0,2,0]}><sphereGeometry args={[.29,14,10]}/><meshStandardMaterial color="#79513c"/></mesh>
 </group>
}

export default function IllinoisCampusVersePlayableScene({campus,onReturn}:{campus:CampusNetworkNode;onReturn:()=>void}){
 const fallback:readonly Stop[]=[
  {id:'student-center',label:'Student Center',kind:'student life',x:0,z:0},
  {id:'academic',label:'Academic Center',kind:'academics',x:34,z:10},
  {id:'library',label:'Library + Research',kind:'research',x:-34,z:24},
  {id:'career',label:'Career + Skills',kind:'career',x:12,z:-34},
 ]
 const stops=CAMPUS_STOPS[campus.id]||fallback
 const move=useRef<MoveState>({x:0,z:0})
 const reached=useRef(new Set<string>())
 const [active,setActive]=useState<Stop|null>(null)
 const [status,setStatus]=useState(`${campus.name} CampusVerse live • walk to a glowing stop.`)
 const setMove=(x:number,z:number)=>{move.current={x,z}}
 const stopMove=()=>{move.current={x:0,z:0}}
 const activate=(stop:Stop)=>{
  setActive(stop);reached.current.delete(stop.id);setStatus(`MISSION ACTIVE • walk to ${stop.label}`)
  const detail={missionId:`${campus.id}:${stop.id}`,title:`${campus.name} • ${stop.label}`,objective:`Reach ${stop.label} and complete the ${stop.kind} checkpoint.`,campus:campus.id,hubId:stop.id,source:'illinois-campusverse-playable'}
  window.dispatchEvent(new CustomEvent('tryamm:campusverse-mission-open',{detail}))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail}))
 }
 const sense=(x:number,z:number)=>{
  if(!active)return
  if(Math.hypot(active.x-x,active.z-z)<5&&!reached.current.has(active.id)){
   reached.current.add(active.id);setStatus(`ARRIVED • ${active.label} ✓ • checkpoint complete`)
   window.dispatchEvent(new CustomEvent('tryamm:campusverse-checkpoint',{detail:{campus:campus.id,hubId:active.id,label:active.label,source:'illinois-campusverse-playable'}}))
   window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-complete',{detail:{id:`${campus.id}:${active.id}`,title:`${campus.name} • ${active.label}`,campus:campus.id,checkpoint:active.id}}))
  }
 }
 return <main aria-label={`${campus.name} playable CampusVerse`} style={{position:'fixed',inset:0,zIndex:33000,overflow:'hidden',background:'#081725',color:'#fff',fontFamily:'system-ui'}}>
  <button onClick={onReturn} style={{position:'absolute',top:'calc(env(safe-area-inset-top) + 10px)',left:10,zIndex:33020,minHeight:44,padding:'8px 10px',borderRadius:12,fontWeight:900}}>← ILLINOIS CAMPUSVERSE</button>
  <div style={{position:'absolute',inset:0}}><Canvas shadows camera={{position:[8,7,25],fov:58,far:600}}><color attach="background" args={['#88a8bf']}/><ambientLight intensity={1.25}/><directionalLight castShadow position={[55,90,30]} intensity={2}/><CampusWorld stops={stops}/><Player move={move} onPosition={sense}/></Canvas></div>
  <section style={{position:'absolute',left:10,top:'calc(env(safe-area-inset-top) + 64px)',zIndex:33015,width:'min(330px,72vw)',maxHeight:'58vh',overflow:'auto',padding:10,borderRadius:14,background:'#07131ae8',border:'1px solid #63d8ff'}}>
   <b>{campus.name}</b><small style={{display:'block',opacity:.8}}>{campus.region} • {campus.system||campus.archetype}</small>
   <div aria-live="polite" style={{marginTop:8,padding:8,borderRadius:10,background:'#10283a',fontSize:12,fontWeight:800}}>{status}</div>
   <div style={{display:'grid',gap:6,marginTop:8}}>{stops.map(s=><button key={s.id} onClick={()=>activate(s)} style={{minHeight:44,borderRadius:10,textAlign:'left',fontWeight:850}}>START • {s.label}<small style={{display:'block'}}>{s.kind}</small></button>)}</div>
  </section>
  <div aria-label="Campus movement controls" style={{position:'absolute',right:10,bottom:'calc(env(safe-area-inset-bottom) + 14px)',zIndex:33018,display:'grid',gridTemplateColumns:'52px 52px 52px',gridTemplateRows:'52px 52px 52px',gap:5,touchAction:'none'}}>
   <span/><button onPointerDown={()=>setMove(0,-1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,borderRadius:14,fontSize:22}}>▲</button><span/>
   <button onPointerDown={()=>setMove(-1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{borderRadius:14,fontSize:22}}>◀</button><button onClick={stopMove} style={{borderRadius:14,fontSize:10,fontWeight:900}}>STOP</button><button onPointerDown={()=>setMove(1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{borderRadius:14,fontSize:22}}>▶</button>
   <span/><button onPointerDown={()=>setMove(0,1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,borderRadius:14,fontSize:22}}>▼</button><span/>
  </div>
 </main>
}
