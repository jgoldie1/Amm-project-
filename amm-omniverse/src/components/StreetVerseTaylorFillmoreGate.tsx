import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Deliberately local GAME coordinates: not a surveyed Chicago property or real security layout.
export const TAYLOR_FILLMORE_GATE = Object.freeze({
  id: 'taylor-fillmore-inferred-entry',
  label: 'Taylor / Fillmore • Little Italy entrance',
  x: -740, z: 637, orientationRadians: Math.atan2(170, 125),
  provenance: 'user-described gated neighborhood; approximate gameplay placement',
  surveyed: false,
  fidelity: 'procedural-blockout',
})

function GateLeaf({ side }: { side: -1 | 1 }) {
  const pivot = useRef<THREE.Group>(null)
  // Slow, non-blocking ambient opening; gate geometry is decorative until collision/nav is authored.
  useFrame(({ clock }) => {
    if (!pivot.current) return
    const opening = THREE.MathUtils.smoothstep(Math.sin(clock.elapsedTime * 0.28) * .5 + .5, .2, .9)
    pivot.current.rotation.y = side * (.10 + opening * .83)
  })
  return <group ref={pivot} position={[side * 4.45, 0, 0]} name={side < 0 ? 'gate-left-leaf' : 'gate-right-leaf'}>
    {[.6, 2.35].map(y => <mesh key={y} castShadow position={[-side * 2.22, y, 0]}>
      <boxGeometry args={[4.35, .12, .10]} />
      <meshStandardMaterial color="#222b2f" metalness={.72} roughness={.32} />
    </mesh>)}
    {Array.from({length: 11}, (_, i) => <mesh key={i} castShadow position={[-side * (i * .41 + .14), 1.48, 0]}>
      <cylinderGeometry args={[.039, .039, 2.54, 8]} />
      <meshStandardMaterial color="#20282e" metalness={.66} roughness={.39} />
    </mesh>)}
  </group>
}

function EntranceTree({x,z,seed}:{x:number;z:number;seed:number}) {
  return <group position={[x,0,z]} rotation={[0,seed * .42,0]}>
    <mesh castShadow position={[0,2.8,0]}><cylinderGeometry args={[.20,.32,5.6,9]} /><meshStandardMaterial color="#614733" roughness={1}/></mesh>
    {[[-.9,5.8,0],[.6,6.8,.3],[.4,5.7,-.7]].map(([dx,y,dz],i)=><mesh key={i} castShadow position={[dx,y,dz]} scale={i===1?[1.35,1.15,1.1]:[1.25,1.08,1.15]}>
      <icosahedronGeometry args={[1.50,1]}/><meshStandardMaterial color={i===1?'#4a7845':'#355f38'} roughness={.96}/>
    </mesh>)}
  </group>
}

export default function StreetVerseTaylorFillmoreGate() {
  return <group name="taylor-fillmore-gated-neighborhood-concept-v1"
    position={[TAYLOR_FILLMORE_GATE.x, 0, TAYLOR_FILLMORE_GATE.z]}
    rotation={[0,TAYLOR_FILLMORE_GATE.orientationRadians,0]}
    userData={{id:TAYLOR_FILLMORE_GATE.id, surveyed:false, geometryAuthority:'illustrative-gameplay-reconstruction', productionStatus:'concept-not-photomatched'}}>
    {([-1,1] as const).map(side=><group key={side}>
      <mesh castShadow receiveShadow position={[side*5.05,1.75,0]}>
        <boxGeometry args={[1.24,3.5,1.22]}/><meshStandardMaterial color="#8a5647" roughness={.93}/>
      </mesh>
      <mesh castShadow position={[side*5.05,3.65,0]}>
        <boxGeometry args={[1.62,.35,1.56]}/><meshStandardMaterial color="#ded0b9" roughness={.86}/>
      </mesh>
      <mesh position={[side*8.7,1.1,0]}>
        <boxGeometry args={[6.5,2.2,.65]}/><meshStandardMaterial color="#8a5647" roughness={.9}/>
      </mesh>
      <EntranceTree x={side*12.5} z={-6} seed={side}/>
      <EntranceTree x={side*12.5} z={14} seed={side+3}/>
    </group>)}
    <GateLeaf side={-1}/><GateLeaf side={1}/>
    <mesh castShadow position={[0,4.12,0]}>
      <boxGeometry args={[10.4,.28,.3]}/><meshStandardMaterial color="#25292e" metalness={.65} roughness={.34}/>
    </mesh>
    <mesh castShadow position={[0,4.55,0]}>
      <boxGeometry args={[5.9,.76,.32]}/><meshStandardMaterial color="#20272d" metalness={.47} roughness={.4}/>
    </mesh>
    <mesh position={[0,4.55,-.22]}>
      <boxGeometry args={[5.48,.47,.045]}/><meshStandardMaterial color="#c3a275" metalness={.46} roughness={.42}/>
    </mesh>
    {/* Guard booth is an approximate visual; real ingress/egress and guard patrols need verified plans. */}
    <group position={[8.0,0,-6.8]} name="guard-booth-concept">
      <mesh castShadow receiveShadow position={[0,1.70,0]}><boxGeometry args={[4.3,3.4,4.3]}/><meshStandardMaterial color="#896554" roughness={.86}/></mesh>
      <mesh castShadow position={[0,3.54,0]}><boxGeometry args={[4.75,.36,4.75]}/><meshStandardMaterial color="#343c43" roughness={.66} metalness={.16}/></mesh>
      {[-1.35,1.35].map(x=><mesh key={x} position={[x,2.04,-2.19]}><boxGeometry args={[1.35,1.45,.07]}/><meshStandardMaterial color="#5f8996" metalness={.08} roughness={.18} transparent opacity={.76}/></mesh>)}
      <mesh position={[-2.2,2.03,0]}><boxGeometry args={[.09,1.48,2.50]}/><meshStandardMaterial color="#5e8792" roughness={.18} transparent opacity={.78}/></mesh>
      <mesh position={[1.42,1.10,-2.24]}><boxGeometry args={[1.1,2.12,.08]}/><meshStandardMaterial color="#2d343b" roughness={.48}/></mesh>
      <mesh position={[0,3.17,-2.29]}><boxGeometry args={[.75,.14,.27]}/><meshStandardMaterial color="#f0deba" emissive="#b8874a" emissiveIntensity={.48}/></mesh>
    </group>
    <mesh receiveShadow position={[0,.09,-3.8]}><boxGeometry args={[12,.11,4.2]}/><meshStandardMaterial color="#4e4740" roughness={.99}/></mesh>
    {[-2.3,2.3].map(x=><mesh key={x} position={[x,.17,-3.85]}><boxGeometry args={[.16,.025,3.2]}/><meshStandardMaterial color="#e3d7bb" roughness={.91}/></mesh>)}
  </group>
}
