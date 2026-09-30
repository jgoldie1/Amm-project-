import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {compileNearWestRoadMeshes} from '../data/streetVerseNearWestRoadNetwork'
import {TAYLOR_STREET_CORRIDOR} from '../data/streetVerseCartesianNeighborhood'
import {NEAR_WEST_NPCS,NEAR_WEST_TRAFFIC} from '../data/streetVerseNearWestPopulation'
import CampusVerseCollegeBookBridge from './CampusVerseCollegeBookBridge'
import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
import {STREETVERSE_FUTURE_VEHICLES} from '../data/streetVerseFutureVehicles'
import StreetVerseFutureVehicleDealer from './StreetVerseFutureVehicleDealer'
import GreenvilleCampusVerseScene from './GreenvilleCampusVerseScene'

function RoadMeshes(){
 const roads=compileNearWestRoadMeshes()
 return <group>
  {roads.map(r=><group key={r.id} position={[r.center.x,0,r.center.z]} rotation={[0,-r.headingRadians,0]}>
   <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[r.length,.08,r.width]}/><meshStandardMaterial color="#292d31"/></mesh>
   <mesh receiveShadow position={[0,.08,r.width/2+r.sidewalkWidth/2]}><boxGeometry args={[r.length,.16,r.sidewalkWidth]}/><meshStandardMaterial color="#929292"/></mesh>
   <mesh receiveShadow position={[0,.08,-r.width/2-r.sidewalkWidth/2]}><boxGeometry args={[r.length,.16,r.sidewalkWidth]}/><meshStandardMaterial color="#929292"/></mesh>
   <mesh position={[0,.09,0]}><boxGeometry args={[r.length,.02,.12]}/><meshStandardMaterial color="#d7bd55"/></mesh>
  </group>)}
 </group>
}

function TaylorLots(){
 return <group>{TAYLOR_STREET_CORRIDOR.blocks.flatMap(block=>block.businesses.map((b,i)=>{
  const x=block.origin.x+b.lot.x,z=block.origin.z+b.lot.z
  return <group key={b.id} position={[x,0,z]}>
   <mesh castShadow receiveShadow position={[0,6,0]}><boxGeometry args={[18,12,16]}/><meshStandardMaterial color={i%2?'#7a3f2b':'#614b3d'}/></mesh>
   <mesh position={[0,2,-8.05]}><boxGeometry args={[3,4,.15]}/><meshStandardMaterial color="#173142"/></mesh>
   <mesh position={[0,7,-8.12]}><boxGeometry args={[11,1.4,.12]}/><meshStandardMaterial color="#e0c786"/></mesh>
  </group>
 }))}</group>
}


type MoveState={x:number;z:number}
function NearWestPlayer({move,onPosition,hidden=false,startPosition}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void;hidden?:boolean;startPosition?:{x:number;z:number}}){
 const ref=useRef<THREE.Group>(null)
 const {camera}=useThree()
 useFrame((_,dt)=>{
  const p=ref.current;if(!p)return
  const speed=24
  p.position.x=THREE.MathUtils.clamp(p.position.x+move.current.x*speed*dt,-1180,560)
  p.position.z=THREE.MathUtils.clamp(p.position.z+move.current.z*speed*dt,380,1160)
  if(Math.abs(move.current.x)+Math.abs(move.current.z)>.05)p.rotation.y=Math.atan2(move.current.x,move.current.z)
  const target=new THREE.Vector3(p.position.x,p.position.y+9,p.position.z+18)
  camera.position.lerp(target,Math.min(1,dt*4));camera.lookAt(p.position.x,1.2,p.position.z)
  onPosition(p.position.x,p.position.z)
 })
 return <group ref={ref} visible={!hidden} position={[startPosition?.x??-650,0,startPosition?.z??700]}>
  <mesh position={[0,.95,0]} castShadow><capsuleGeometry args={[.34,1.05,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
  <mesh position={[0,1.9,0]} castShadow><sphereGeometry args={[.28,12,10]}/><meshStandardMaterial color="#79513c"/></mesh>
 </group>
}



function DrivenVehicle({vehicleId,move,onPosition}:{vehicleId:string;move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void}){
 const v=STREETVERSE_FUTURE_VEHICLES.find(x=>x.id===vehicleId)
 const ref=useRef<THREE.Group>(null);const {camera}=useThree()
 useFrame((_,dt)=>{const g=ref.current;if(!g||!v)return;const throttle=-move.current.z;const steer=move.current.x;g.rotation.y-=steer*v.handling*1.45*dt;const forward=new THREE.Vector3(Math.sin(g.rotation.y),0,Math.cos(g.rotation.y));g.position.addScaledVector(forward,throttle*v.speed*dt);g.position.x=THREE.MathUtils.clamp(g.position.x,-1180,560);g.position.z=THREE.MathUtils.clamp(g.position.z,380,1160);const chase=new THREE.Vector3(g.position.x-forward.x*11,g.position.y+6,g.position.z-forward.z*11);camera.position.lerp(chase,Math.min(1,dt*4));camera.lookAt(g.position.x,g.position.y+1,g.position.z);onPosition(g.position.x,g.position.z)})
 if(!v)return null
 const long=v.kind==='armored-utility'?5.6:v.kind==='cyber-shuttle'?5.2:v.kind==='hypercar'?4.8:2.7
 return <group ref={ref} position={[v.spawn.x,0,v.spawn.z]}><mesh castShadow position={[0,.9,0]}><boxGeometry args={[long,v.kind==='ring-bike'?.75:1.15,v.kind==='ring-bike'?1.1:2.15]}/><meshStandardMaterial color={v.visual.body} metalness={.7} roughness={.25}/></mesh><mesh position={[0,.8,-1.1]}><boxGeometry args={[long*.65,.12,.08]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.5}/></mesh></group>
}

function FutureVehicleMeshes({exclude}:{exclude?:string}){return <group>{STREETVERSE_FUTURE_VEHICLES.filter(v=>v.id!==exclude).map(v=>{
 const long=v.kind==='armored-utility'?5.6:v.kind==='cyber-shuttle'?5.2:v.kind==='hypercar'?4.8:2.7
 const high=v.kind==='armored-utility'?1.55:v.kind==='ring-bike'?.75:1.05
 return <group key={v.id} position={[v.spawn.x,0,v.spawn.z]}>
  <mesh castShadow position={[0,high/2+.35,0]}><boxGeometry args={[long,high,v.kind==='ring-bike'?1.1:2.15]}/><meshStandardMaterial color={v.visual.body} metalness={.65} roughness={.28}/></mesh>
  {v.kind==='ring-bike'?<>
   <mesh rotation={[Math.PI/2,0,0]} position={[-.9,.75,0]}><torusGeometry args={[.72,.11,10,24]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.4}/></mesh>
   <mesh rotation={[Math.PI/2,0,0]} position={[.9,.75,0]}><torusGeometry args={[.72,.11,10,24]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.4}/></mesh>
  </>:([-1,1] as const).flatMap(side=>([-1,1] as const).map(front=><mesh key={side+':'+front} rotation={[Math.PI/2,0,0]} position={[front*long*.32,.48,side*1.02]}><cylinderGeometry args={[.48,.48,.28,16]}/><meshStandardMaterial color={v.visual.wheel}/></mesh>))}
  <mesh position={[0,.78,-1.09]}><boxGeometry args={[long*.65,.13,.08]}/><meshStandardMaterial color={v.visual.accent} emissive={v.visual.accent} emissiveIntensity={.5}/></mesh>
 </group>
})}</group>}

function PopulationMeshes(){return <group>
 {NEAR_WEST_NPCS.map((n,i)=><group key={n.id} position={[n.position.x,0,n.position.z]}><mesh position={[0,.9,0]} castShadow><capsuleGeometry args={[.28,.95,4,8]}/><meshStandardMaterial color={i%3===0?'#315b7a':i%3===1?'#704936':'#485b3b'}/></mesh><mesh position={[0,1.75,0]}><sphereGeometry args={[.25,10,8]}/><meshStandardMaterial color="#8f654c"/></mesh></group>)}
 {NEAR_WEST_TRAFFIC.map((v,i)=><mesh key={v.id} position={[v.position.x,.55,v.position.z]} castShadow><boxGeometry args={[v.kind==='bus'?7:4.2,1.1,v.kind==='bus'?2.4:1.9]}/><meshStandardMaterial color={i%2?'#314c66':'#742f2f'}/></mesh>)}
 </group>}

export default function StreetVerseNearWest3D(){
 const [collegeBookOpen,setCollegeBookOpen]=useState(false)
 const [greenvilleOpen,setGreenvilleOpen]=useState(false)
 const [dealerOpen,setDealerOpen]=useState(false)
 const [driving,setDriving]=useState<string|null>(null)
 const [playerSpawn,setPlayerSpawn]=useState({x:-650,z:700})
 const [vehicleAmmo,setVehicleAmmo]=useState(12)
 const [vehicleAimSide,setVehicleAimSide]=useState<'left'|'right'>('left')
 const drivenPosition=useRef({x:-650,z:700})
 const [nearby,setNearby]=useState<{kind:'npc'|'business'|'vehicle';id:string;label:string;mission?:string}|null>(null)
 const lastNearby=useRef('')
 const move=useRef<MoveState>({x:0,z:0})
 const setMove=(x:number,z:number)=>{move.current={x,z}}
 const stopMove=()=>{move.current={x:0,z:0}}
 const senseNearby=(x:number,z:number)=>{
  const targets=[
   ...NEAR_WEST_NPCS.map(n=>({kind:'npc' as const,id:n.id,label:n.displayName,mission:n.missionHook,x:n.position.x,z:n.position.z})),
   ...NEAR_WEST_TRAFFIC.map(v=>({kind:'vehicle' as const,id:v.id,label:v.kind==='bus'?'Bus':'Vehicle',x:v.position.x,z:v.position.z})),
   ...STREETVERSE_FUTURE_VEHICLES.map(v=>({kind:'vehicle' as const,id:v.id,label:v.name,mission:v.missionHooks[0],x:v.spawn.x,z:v.spawn.z})),
   ...TAYLOR_STREET_CORRIDOR.blocks.flatMap(block=>block.businesses.map(b=>({kind:'business' as const,id:b.id,label:b.name||'Taylor Street Business',mission:b.missionIds?.[0],x:block.origin.x+b.lot.x,z:block.origin.z+b.lot.z})))
  ]
  let best:any=null,dist=999
  for(const t of targets){const d=Math.hypot(t.x-x,t.z-z);if(d<dist){best=t;dist=d}}
  const next=best&&dist<14?{kind:best.kind,id:best.id,label:best.label,mission:best.mission}:null
  const key=next?next.kind+':'+next.id:''
  if(key!==lastNearby.current){lastNearby.current=key;setNearby(next)}
 }
 const vehicleFire=()=>{
  if(!driving||vehicleAmmo<=0)return
  setVehicleAmmo(a=>Math.max(0,a-1))
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-vehicle-action',{detail:{action:'fictional-fire',vehicleId:driving,side:vehicleAimSide,ammoAfter:vehicleAmmo-1,source:'vehicle-gameplay'}}))
 }
 const doAction=()=>{
  if(!nearby)return
  const action=nearby.kind==='npc'?'talk':nearby.kind==='business'?'enter':'enter-vehicle'
  if(nearby.kind==='vehicle')setDriving(nearby.id)
  window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-action',{detail:{action,target:nearby,source:'near-west-context-action'}}))
  if(nearby.mission)window.dispatchEvent(new CustomEvent('tryamm:streetverse-mission-start',{detail:{missionId:nearby.mission,target:nearby.id}}))
 }
 const travelToGreenville=()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{from:'uic',to:'greenville',character:'Jacobie',source:'streetverse-uic-gateway'}}));setGreenvilleOpen(true)}
 useEffect(()=>{const open=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.to==='greenville')setGreenvilleOpen(true)};window.addEventListener('tryamm:campusverse-travel',open);return()=>window.removeEventListener('tryamm:campusverse-travel',open)},[])
 if(greenvilleOpen)return <GreenvilleCampusVerseScene onReturn={()=>setGreenvilleOpen(false)}/>
 return <div aria-label="StreetVerse Near West 3D" style={{width:'100%',height:'100%',minHeight:420}}>
  <button aria-label="Open Future Mobility dealership" onClick={()=>setDealerOpen(true)} style={{position:'absolute',left:12,top:12,zIndex:22,minHeight:48,padding:'9px 13px',borderRadius:14,fontWeight:950}}>🚘 FUTURE MOBILITY • BUY</button>
  {dealerOpen&&<StreetVerseFutureVehicleDealer onClose={()=>setDealerOpen(false)}/>}
  {driving&&<div aria-label="Vehicle action controls" style={{position:'absolute',left:12,top:70,zIndex:23,display:'grid',gap:6,width:170}}>
   <button aria-label="Switch vehicle aim side" onClick={()=>setVehicleAimSide(v=>v==='left'?'right':'left')} style={{minHeight:44,borderRadius:12,fontWeight:900}}>LEAN • {vehicleAimSide.toUpperCase()}</button>
   <button aria-label="Use fictional vehicle weapon" disabled={vehicleAmmo<=0} onClick={vehicleFire} style={{minHeight:48,borderRadius:12,fontWeight:950}}>FIRE • {vehicleAmmo}</button>
  </div>}
  {driving&&<button aria-label="Exit vehicle" onClick={()=>{const p=drivenPosition.current;setPlayerSpawn({x:p.x+3,z:p.z});window.dispatchEvent(new CustomEvent('tryamm:streetverse-gameplay-action',{detail:{action:'exit-vehicle',vehicleId:driving,position:p}}));setDriving(null)}} style={{position:'absolute',right:12,top:12,zIndex:22,minHeight:48,padding:'9px 13px',borderRadius:14,fontWeight:950}}>EXIT VEHICLE</button>}
  {nearby&&!driving&&<button aria-label="Context action" onClick={doAction} style={{position:'absolute',right:12,bottom:190,zIndex:22,minWidth:162,minHeight:52,padding:'10px 14px',borderRadius:16,fontWeight:950,fontSize:16}}>ACTION • {nearby.kind==='npc'?'TALK':nearby.kind==='business'?'ENTER':'RIDE'}<small style={{display:'block',fontSize:10}}>{nearby.label}</small></button>}
  <div aria-label={driving?'One hand driving controls':'One hand movement controls'} style={{position:'absolute',right:12,bottom:18,zIndex:21,display:'grid',gridTemplateColumns:'54px 54px 54px',gridTemplateRows:'54px 54px 54px',gap:5,touchAction:'none'}}>
   <span/><button aria-label="Walk forward" onPointerDown={()=>setMove(0,driving?-2:-1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▲</button><span/>
   <button aria-label="Walk left" onPointerDown={()=>setMove(driving?-1.4:-1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>◀</button>
   <button aria-label="Stop walking" onClick={stopMove} style={{fontSize:12,fontWeight:900,borderRadius:14}}>STOP</button>
   <button aria-label="Walk right" onPointerDown={()=>setMove(driving?1.4:1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>▶</button>
   <span/><button aria-label="Walk backward" onPointerDown={()=>setMove(0,driving?1.2:1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▼</button><span/>
  </div>
  <div style={{position:'absolute',left:12,bottom:18,zIndex:20,display:'grid',gap:7,maxWidth:260}}>
   <button aria-label="Open UIC CollegeBook gateway" onClick={()=>setCollegeBookOpen(v=>!v)} style={{padding:'11px 12px',borderRadius:12,fontWeight:900}}>🎓 UIC • COLLEGEBOOK</button>
   <button aria-label="Travel from UIC to Greenville CampusVerse" onClick={travelToGreenville} style={{padding:'11px 12px',borderRadius:12,fontWeight:900}}>GREENVILLE • JACOBIE →</button>
   {collegeBookOpen&&<CampusVerseCollegeBookBridge/>}
  </div>
  <Canvas shadows camera={{position:[-620,260,980],fov:55,far:5000}}>
   <color attach="background" args={['#88a8bf']}/>
   <ambientLight intensity={1.3}/><directionalLight castShadow position={[80,180,60]} intensity={2}/>
   <mesh receiveShadow position={[0,-.12,700]}><boxGeometry args={[2600,.2,1800]}/><meshStandardMaterial color="#58724c"/></mesh>
   <RoadMeshes/><TaylorLots/><PopulationMeshes/><FutureVehicleMeshes exclude={driving||undefined}/><NearWestPlayer move={move} onPosition={senseNearby} hidden={!!driving} startPosition={playerSpawn}/>{driving&&<DrivenVehicle vehicleId={driving} move={move} onPosition={(x,z)=>{drivenPosition.current={x,z}}}/>}
  </Canvas>
 </div>
}
