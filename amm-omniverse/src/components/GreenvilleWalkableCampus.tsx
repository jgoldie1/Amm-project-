import {Canvas,useFrame,useThree} from '@react-three/fiber'
import {useRef} from 'react'
import * as THREE from 'three'
import GreenvilleJacobieRig,{type JacobieRigProof} from './GreenvilleJacobieRig'
import {GREENVILLE_MEMORY_HUBS,type GreenvilleCampusLivingMemory} from '../runtime/GreenvilleCampusLivingMemory'

export type GreenvilleCampusStop={id:string;label:string;x:number;z:number}

export const GREENVILLE_CAMPUS_STOPS:readonly GreenvilleCampusStop[]=[
 {id:'student-union',label:'Student Union',x:0,z:0},
 {id:'hogue-lawn',label:'Hogue Lawn',x:30,z:8},
 {id:'burritt-hall',label:'Burritt Hall',x:-32,z:22},
 {id:'blankenship-tower',label:'Tower / Blankenship',x:34,z:-28},
 {id:'scott-field',label:'Scott Field',x:-40,z:-32},
]

type MoveState={x:number;z:number}

function Player({move,onPosition,rigUrl,onRigProof}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void;rigUrl:string|null;onRigProof:(p:JacobieRigProof)=>void}){
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
  <GreenvilleJacobieRig move={move} assetUrl={rigUrl} onProof={onRigProof}/>
 </group>
}

/** Lightweight fictional campus residents with visible idle and waving motions.
 * Production Jacobie and NPC rigged GLBs are separate asset milestones.
 */
function CampusResident({hub,index,memory}:{hub:typeof GREENVILLE_MEMORY_HUBS[number];index:number;memory:GreenvilleCampusLivingMemory}){
 const stop=GREENVILLE_CAMPUS_STOPS.find(item=>item.id===hub.id)!
 const figure=useRef<THREE.Group>(null)
 const wavingArm=useRef<THREE.Group>(null)
 const record=memory.entries.find(item=>item.hubId===hub.id)
 useFrame(({clock})=>{
  const t=clock.elapsedTime+index*1.17
  if(figure.current){
   figure.current.position.y=Math.sin(t*1.8)*.045
   figure.current.rotation.y=Math.sin(t*.65)*.16
  }
  if(wavingArm.current)wavingArm.current.rotation.z=-.35+Math.sin(t*2.3)*(record?.choice==='help' ? .6 : .25)
 })
 const shirts=['#195a71','#6a417d','#a04e40','#4c7457','#3c538f']
 const skins=['#815338','#aa7a53','#5d3b2f','#c29069','#6d4b38']
 return <group name={'greenville-fictional-npc-'+hub.id} position={[stop.x+4.2,0,stop.z+3.5]}>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.04,0]}><torusGeometry args={[.85,.08,6,24]}/><meshBasicMaterial color={record?'#7bffb8':'#ffd57b'}/></mesh>
  <group ref={figure}>
   <mesh castShadow position={[0,1.18,0]}><capsuleGeometry args={[.3,.8,5,10]}/><meshStandardMaterial color={shirts[index%shirts.length]} roughness={.9}/></mesh>
   <mesh castShadow position={[0,2.08,0]}><sphereGeometry args={[.3,12,10]}/><meshStandardMaterial color={skins[index%skins.length]} roughness={.92}/></mesh>
   <mesh castShadow position={[0,2.31,-.035]}><sphereGeometry args={[.305,12,7,0,Math.PI*2,0,Math.PI*.32]}/><meshStandardMaterial color="#29202b"/></mesh>
   {[-.18,.18].map(x=><mesh key={x} castShadow position={[x,.45,0]}><cylinderGeometry args={[.13,.14,.85,8]}/><meshStandardMaterial color="#283345"/></mesh>)}
   <mesh castShadow position={[-.48,1.49,0]} rotation={[0,0,-.17]}><capsuleGeometry args={[.11,.45,5,8]}/><meshStandardMaterial color={shirts[index%shirts.length]}/></mesh>
   <group ref={wavingArm} position={[.46,1.78,0]}><mesh castShadow position={[.08,-.3,0]}><capsuleGeometry args={[.11,.46,5,8]}/><meshStandardMaterial color={shirts[index%shirts.length]}/></mesh><mesh position={[.08,-.66,0]}><sphereGeometry args={[.12,9,7]}/><meshStandardMaterial color={skins[index%skins.length]}/></mesh></group>
   <mesh position={[0,2.8,0]}><octahedronGeometry args={[.21,0]}/><meshStandardMaterial color={record?'#8dffbe':'#ffe08c'} emissive={record?'#28784c':'#86692c'} emissiveIntensity={.6}/></mesh>
  </group>
 </group>
}

function Campus({memory}:{memory:GreenvilleCampusLivingMemory}){
 return <group>
  <mesh receiveShadow position={[0,-.1,0]}><boxGeometry args={[165,.2,145]}/><meshStandardMaterial color="#5b7d4b"/></mesh>
  <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[20,.08,100]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  <mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[105,.08,10]}/><meshStandardMaterial color="#c9c5ba"/></mesh>
  <group position={[0,0,0]}><mesh castShadow position={[0,4,0]}><boxGeometry args={[24,8,18]}/><meshStandardMaterial color="#8b4b3b"/></mesh></group>
  <group position={[-32,0,22]}><mesh castShadow position={[0,5,0]}><boxGeometry args={[22,10,16]}/><meshStandardMaterial color="#7d4f3b"/></mesh></group>
  <group position={[34,0,-28]}><mesh castShadow position={[0,8,0]}><boxGeometry args={[16,16,16]}/><meshStandardMaterial color="#6e5145"/></mesh></group>
  <mesh receiveShadow position={[30,.03,8]}><cylinderGeometry args={[13,13,.08,32]}/><meshStandardMaterial color="#4f7646"/></mesh>
  <mesh receiveShadow position={[-40,.03,-32]}><boxGeometry args={[44,.08,26]}/><meshStandardMaterial color="#446a43"/></mesh>
  {GREENVILLE_MEMORY_HUBS.map(hub=>{
   const stop=GREENVILLE_CAMPUS_STOPS.find(item=>item.id===hub.id)!
   const record=memory.entries.find(item=>item.hubId===hub.id)
   const accent=record?.choice==='help'?'#7affb0':record?.choice==='learn'?'#70baff':'#ffc773'
   return <group key={'legacy-'+hub.id} name={'greenville-memory-'+hub.id} position={[stop.x+8,0,stop.z+7]} visible={Boolean(record)}>
    <mesh castShadow position={[0,.22,0]}><boxGeometry args={[3,.44,2]}/><meshStandardMaterial color="#486e5c"/></mesh>
    <mesh castShadow position={[0,1.8,0]}><boxGeometry args={[2.5,1.7,.18]}/><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.35}/></mesh>
    <mesh castShadow position={[-1.1,1.25,.45]}><cylinderGeometry args={[.12,.12,2.5,8]}/><meshStandardMaterial color="#385968"/></mesh>
    <mesh castShadow position={[1.1,1.25,.45]}><cylinderGeometry args={[.12,.12,2.5,8]}/><meshStandardMaterial color="#385968"/></mesh>
    <mesh position={[0,3.05,0]}><sphereGeometry args={[.42,12,8]}/><meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={.6}/></mesh>
    {hub.id==='hogue-lawn'&&[-.7,0,.7].map(x=><group key={x} position={[x,.4,1.2]}><mesh position={[0,.4,0]}><cylinderGeometry args={[.05,.06,.8,6]}/><meshStandardMaterial color="#58bb60"/></mesh><mesh position={[0,.85,0]}><sphereGeometry args={[.3,8,6]}/><meshStandardMaterial color="#83d376"/></mesh></group>)}
   </group>
  })}
  {GREENVILLE_MEMORY_HUBS.map((hub,index)=><CampusResident key={'npc-'+hub.id} hub={hub} index={index} memory={memory}/>)}
  {GREENVILLE_CAMPUS_STOPS.map(stop=><group key={stop.id} position={[stop.x,0,stop.z]}><mesh position={[0,3,0]}><cylinderGeometry args={[.25,.25,6,10]}/><meshStandardMaterial color="#6de3ff" emissive="#3bbbd9" emissiveIntensity={.6}/></mesh><mesh position={[0,6.4,0]}><sphereGeometry args={[.5,10,8]}/><meshStandardMaterial color="#fff2a3" emissive="#ffd85f" emissiveIntensity={.7}/></mesh></group>)}
 </group>
}

export default function GreenvilleWalkableCampus({move,onPosition,memory,rigUrl,onRigProof}:{move:React.MutableRefObject<MoveState>;onPosition:(x:number,z:number)=>void;memory:GreenvilleCampusLivingMemory;rigUrl:string|null;onRigProof:(p:JacobieRigProof)=>void}){
 return <Canvas shadows camera={{position:[8,7,25],fov:58,far:600}}>
  <color attach="background" args={['#88a8bf']}/>
  <ambientLight intensity={1.25}/>
  <directionalLight castShadow position={[55,90,30]} intensity={2}/>
  <Campus memory={memory}/>
  <Player move={move} onPosition={onPosition} rigUrl={rigUrl} onRigProof={onRigProof}/>
 </Canvas>
}
