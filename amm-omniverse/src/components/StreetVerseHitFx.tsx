import {useFrame} from '@react-three/fiber'
import {useRef} from 'react'
import * as THREE from 'three'
export type HitFxLevel='off'|'reduced'|'cinematic'
export function StreetVerseHitFx({position,level='cinematic',bornAt}:{position:[number,number,number];level?:HitFxLevel;bornAt:number}){
 const g=useRef<THREE.Group>(null)
 const count=level==='cinematic'?9:level==='reduced'?4:0
 useFrame(({clock})=>{if(!g.current)return;const age=Math.max(0,clock.elapsedTime-bornAt);g.current.visible=age<.55&&count>0;g.current.children.forEach((o,i)=>{o.position.set(Math.sin(i*2.1)*age*1.8,Math.max(0,.7+age*(1.7+i*.08)-4.2*age*age),Math.cos(i*1.7)*age*1.5);const m=(o as THREE.Mesh).material as THREE.MeshBasicMaterial;m.opacity=Math.max(0,1-age/0.55)})})
 if(!count)return null
 return <group ref={g} position={position}>{Array.from({length:count},(_,i)=><mesh key={i}><sphereGeometry args={[.035+(i%3)*.012,6,5]}/><meshBasicMaterial color={i%2?'#6b1015':'#8c171d'} transparent opacity={.9}/></mesh>)}</group>
}
