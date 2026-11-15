/** Fictional Greenville University fraternity mansion: visual prototype only. */
export const GREENVILLE_FRAT_MANSION_POSITION:[number,number,number]=[310,0,-420]
export function StreetVerseGreenvilleFratMansion(){
 return <group name="greenville-university-fraternity-mansion" position={GREENVILLE_FRAT_MANSION_POSITION}>
  <mesh receiveShadow position={[0,-.12,0]}><boxGeometry args={[80,.2,75]}/><meshStandardMaterial color="#688a63"/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*14,0,0]}>
   <mesh castShadow position={[0,5,0]}><boxGeometry args={[25,10,23]}/><meshStandardMaterial color="#c6b39c"/></mesh>
   <mesh castShadow position={[0,10.8,0]}><boxGeometry args={[26,1.6,24]}/><meshStandardMaterial color="#3c414e"/></mesh>
   {[-1,0,1].map(i=>[3,8].map(y=><mesh key={i+'-'+y} position={[i*7,y,11.65]}><boxGeometry args={[3.5,3.5,.12]}/><meshStandardMaterial color="#a4d0e2"/></mesh>))}
  </group>)}
  <mesh castShadow position={[0,5,0]}><boxGeometry args={[10,10,20]}/><meshStandardMaterial color="#e4d6c4"/></mesh>
  <mesh position={[0,3,10.1]}><boxGeometry args={[5,6,.2]}/><meshStandardMaterial color="#553a2f"/></mesh>
  <mesh position={[0,11.8,0]}><boxGeometry args={[13,1.3,21]}/><meshStandardMaterial color="#d6bd7b" metalness={.4}/></mesh>
  <mesh position={[0,-.02,24]}><boxGeometry args={[25,.15,16]}/><meshStandardMaterial color="#b8b2a8"/></mesh>
  <mesh position={[0,.2,-19]}><boxGeometry args={[24,.3,13]}/><meshStandardMaterial color="#7fabb9"/></mesh>
  <mesh position={[0,2,-29]}><boxGeometry args={[29,4,2]}/><meshStandardMaterial color="#d9c8af"/></mesh>
  <mesh position={[0,5.5,10.3]}><boxGeometry args={[8,1,.2]}/><meshStandardMaterial color="#8a6844"/></mesh>
 </group>
}
