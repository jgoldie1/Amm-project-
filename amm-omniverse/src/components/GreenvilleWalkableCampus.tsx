import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useRef} from 'react'
import * as THREE from 'three'

export type GreenvilleCampusStop={id:string;label:string;x:number;z:number}

export const GREENVILLE_CAMPUS_STOPS:readonly GreenvilleCampusStop[]=[
 {id:'student-union',label:'Student Union',x:0,z:0},
 {id:'hogue-lawn',label:'Hogue Lawn',x:30,z:8},
 {id:'burritt-hall',label:'Burritt Hall',x:-32,z:22},
 {id:'blankenship-tower',label:'Tower / Blankenship',x:34,z:-28},
 {id:'scott-field',label:'Scott Field',x:-40,z:-32},
]

type MoveState={x:number;z:number}

function Player({move,onPosition}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void}){
 const ref=useRef<THREE.Group>(null)
 const {camera}=useThree()
 useFrame((_,dt)=>{
  const g=ref.current
  if(!g)return
  const speed=15
  g.position.x=THREE.MathUtils.clamp(g.position.x+move.current.x*speed*dt,-70,70)
  g.position.z=THREE.MathUtils.clamp(g.position.z+move.current.z*speed*dt,-60,60)
  if(Math.abs(move.current.x)+Math.abs(move.current.z)>.05)g.rotation.y=Math.atan2(move.current.x,move.current.z)
  camera.position.lerp(new THREE.Vector3(g.position.x,6.5,g.position.z+13),Math.min(1,dt*4))
  camera.lookAt(g.position.x,1.2,g.position.z)
  onPosition(g.position.x,g.position.z)
 })
 return <group ref={ref} position={[8,0,12]}>
  <mesh castShadow position={[0,1.15,0]}><capsuleGeometry args={[.28,.8,5,10]}/><meshStandardMaterial color="#172c55"/></mesh>
  <mesh castShadow position={[0,2,0]}><sphereGeometry args={[.29,14,10]}/><meshStandardMaterial color="#79513c"/></mesh>
 </group>
}

function Campus(){
 return <group>
  <mesh receiveShadow position={[0,-.1,0]}><boxGeometry args={[165,.2,145]}/><meshStandardMaterial color="#5b7d4b"/></mesh>
  <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[20,.08,100]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[105,.08,10]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  <group position={[0,0,0]}><mesh castShadow position={[0,4,0]}><boxGeometry args={[24,8,18]}/><meshStandardMaterial color="#8b4b3b"/></mesh></group>
  <group position={[-32,0,22]}><mesh castShadow position={[0,5,0]}><boxGeometry args={[22,10,16]}/><meshStandardMaterial color="#7d4f3b"/></mesh></group>
  <group position={[34,0,-28]}><mesh castShadow position={[0,8,0]}><boxGeometry args={[16,16,16]}/><meshStandardMaterial color="#6e5145"/></mesh></group>
  <mesh receiveShadow position={[30,.03,8]}><cylinderGeometry args={[13,13,.08,32]}/><meshStandardMaterial color="#4f7646"/></mesh>
  <mesh receiveShadow position={[-40,.03,-32]}><boxGeometry args={[44,.08,26]}/><meshStandardMaterial color="#446a43"/></mesh>
  {GREENVILLE_CAMPUS_STOPS.map(stop=><group key={stop.id} position={[stop.x,0,stop.z]}><mesh position={[0,3,0]}><cylinderGeometry args={[.25,.25,6,10]}/><meshStandardMaterial color="#6de3ff" emissive="#3bbbd9" emissiveIntensity={.6}/></mesh><mesh position={[0,6.4,0]}><sphereGeometry args={[.5,10,8]}/><meshStandardMaterial color="#fff2a3" emissive="#ffd85f" emissiveIntensity={.7}/></mesh></group>)}
 </group>
}

export default function GreenvilleWalkableCampus({move,onPosition}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void}){
 return <Canvas shadows camera={{position:[8,7,25],fov:58,far:600}}>
  <color attach="background" args={['#88a8bf']}/>
  <ambientLight intensity={1.25}/>
  <directionalLight castShadow position={[55,90,30]} intensity={2}/>
  <Campus/>
  <Player move={move} onPosition={onPosition}/>
 </Canvas>
}
