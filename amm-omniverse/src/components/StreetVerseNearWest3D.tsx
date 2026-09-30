import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {compileNearWestRoadMeshes} from '../data/streetVerseNearWestRoadNetwork'
import {TAYLOR_STREET_CORRIDOR} from '../data/streetVerseCartesianNeighborhood'
import {NEAR_WEST_NPCS,NEAR_WEST_TRAFFIC} from '../data/streetVerseNearWestPopulation'
import CampusVerseCollegeBookBridge from './CampusVerseCollegeBookBridge'
import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'
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
function NearWestPlayer({move}:{move:React.MutableRefObject<MoveState>}){
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
 })
 return <group ref={ref} position={[-650,0,700]}>
  <mesh position={[0,.95,0]} castShadow><capsuleGeometry args={[.34,1.05,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
  <mesh position={[0,1.9,0]} castShadow><sphereGeometry args={[.28,12,10]}/><meshStandardMaterial color="#79513c"/></mesh>
 </group>
}

function PopulationMeshes(){return <group>
 {NEAR_WEST_NPCS.map((n,i)=><group key={n.id} position={[n.position.x,0,n.position.z]}><mesh position={[0,.9,0]} castShadow><capsuleGeometry args={[.28,.95,4,8]}/><meshStandardMaterial color={i%3===0?'#315b7a':i%3===1?'#704936':'#485b3b'}/></mesh><mesh position={[0,1.75,0]}><sphereGeometry args={[.25,10,8]}/><meshStandardMaterial color="#8f654c"/></mesh></group>)}
 {NEAR_WEST_TRAFFIC.map((v,i)=><mesh key={v.id} position={[v.position.x,.55,v.position.z]} castShadow><boxGeometry args={[v.kind==='bus'?7:4.2,1.1,v.kind==='bus'?2.4:1.9]}/><meshStandardMaterial color={i%2?'#314c66':'#742f2f'}/></mesh>)}
 </group>}

export default function StreetVerseNearWest3D(){
 const [collegeBookOpen,setCollegeBookOpen]=useState(false)
 const [greenvilleOpen,setGreenvilleOpen]=useState(false)
 const move=useRef<MoveState>({x:0,z:0})
 const setMove=(x:number,z:number)=>{move.current={x,z}}
 const stopMove=()=>{move.current={x:0,z:0}}
 const travelToGreenville=()=>{window.dispatchEvent(new CustomEvent('tryamm:campusverse-travel',{detail:{from:'uic',to:'greenville',character:'Jacobie',source:'streetverse-uic-gateway'}}));setGreenvilleOpen(true)}
 useEffect(()=>{const open=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.to==='greenville')setGreenvilleOpen(true)};window.addEventListener('tryamm:campusverse-travel',open);return()=>window.removeEventListener('tryamm:campusverse-travel',open)},[])
 if(greenvilleOpen)return <GreenvilleCampusVerseScene onReturn={()=>setGreenvilleOpen(false)}/>
 return <div aria-label="StreetVerse Near West 3D" style={{width:'100%',height:'100%',minHeight:420}}>
  <div aria-label="One hand movement controls" style={{position:'absolute',right:12,bottom:18,zIndex:21,display:'grid',gridTemplateColumns:'54px 54px 54px',gridTemplateRows:'54px 54px 54px',gap:5,touchAction:'none'}}>
   <span/><button aria-label="Walk forward" onPointerDown={()=>setMove(0,-1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▲</button><span/>
   <button aria-label="Walk left" onPointerDown={()=>setMove(-1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>◀</button>
   <button aria-label="Stop walking" onClick={stopMove} style={{fontSize:12,fontWeight:900,borderRadius:14}}>STOP</button>
   <button aria-label="Walk right" onPointerDown={()=>setMove(1,0)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{fontSize:24,borderRadius:14}}>▶</button>
   <span/><button aria-label="Walk backward" onPointerDown={()=>setMove(0,1)} onPointerUp={stopMove} onPointerCancel={stopMove} style={{gridColumn:2,fontSize:24,borderRadius:14}}>▼</button><span/>
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
   <RoadMeshes/><TaylorLots/><PopulationMeshes/><NearWestPlayer move={move}/>
  </Canvas>
 </div>
}
