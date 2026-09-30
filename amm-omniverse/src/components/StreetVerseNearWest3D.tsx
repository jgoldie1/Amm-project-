import {Canvas} from '@react-three/fiber'
import {compileNearWestRoadMeshes} from '../data/streetVerseNearWestRoadNetwork'
import {TAYLOR_STREET_CORRIDOR} from '../data/streetVerseCartesianNeighborhood'
import {NEAR_WEST_NPCS,NEAR_WEST_TRAFFIC} from '../data/streetVerseNearWestPopulation'

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

function PopulationMeshes(){return <group>
 {NEAR_WEST_NPCS.map((n,i)=><group key={n.id} position={[n.position.x,0,n.position.z]}><mesh position={[0,.9,0]} castShadow><capsuleGeometry args={[.28,.95,4,8]}/><meshStandardMaterial color={i%3===0?'#315b7a':i%3===1?'#704936':'#485b3b'}/></mesh><mesh position={[0,1.75,0]}><sphereGeometry args={[.25,10,8]}/><meshStandardMaterial color="#8f654c"/></mesh></group>)}
 {NEAR_WEST_TRAFFIC.map((v,i)=><mesh key={v.id} position={[v.position.x,.55,v.position.z]} castShadow><boxGeometry args={[v.kind==='bus'?7:4.2,1.1,v.kind==='bus'?2.4:1.9]}/><meshStandardMaterial color={i%2?'#314c66':'#742f2f'}/></mesh>)}
 </group>}

export default function StreetVerseNearWest3D(){
 return <div aria-label="StreetVerse Near West 3D" style={{width:'100%',height:'100%',minHeight:420}}>
  <Canvas shadows camera={{position:[-620,260,980],fov:55,far:5000}}>
   <color attach="background" args={['#88a8bf']}/>
   <ambientLight intensity={1.3}/><directionalLight castShadow position={[80,180,60]} intensity={2}/>
   <mesh receiveShadow position={[0,-.12,700]}><boxGeometry args={[2600,.2,1800]}/><meshStandardMaterial color="#58724c"/></mesh>
   <RoadMeshes/><TaylorLots/><PopulationMeshes/>
  </Canvas>
 </div>
}
