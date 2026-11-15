/** Fictional Gold Coast-inspired Chicago estate, not a surveyed real-world property. */
export const JACOBIE_GOLD_COAST_POSITION:[number,number,number]=[950,0,-850]
export function StreetVerseChicagoJacobieGoldCoastMansion(){
 return <group name="bj-stubbs-gold-coast-12-bedroom-mansion" position={JACOBIE_GOLD_COAST_POSITION}>
  <mesh receiveShadow position={[0,-.2,0]}><boxGeometry args={[85,.3,78]}/><meshStandardMaterial color="#71856a"/></mesh>
  {[-1,1].map(side=><group key={side} position={[side*15,0,0]}>
   <mesh castShadow position={[0,5,0]}><boxGeometry args={[25,10,23]}/><meshStandardMaterial color="#d8c9b4"/></mesh>
   <mesh castShadow position={[0,10.7,0]}><boxGeometry args={[26,1.5,24]}/><meshStandardMaterial color="#343a42" metalness={.3}/></mesh>
   {[-1,0,1].map(i=>[2.5,7.5].map(y=><mesh key={i+'-'+y} position={[i*7,y,11.6]}><boxGeometry args={[3.5,3.5,.12]}/><meshStandardMaterial color="#a9c6d3" metalness={.1}/></mesh>))}
   <mesh position={[0,2,-12]}><boxGeometry args={[18,.15,4]}/><meshStandardMaterial color="#c1b7a5"/></mesh>
  </group>)}
  <mesh castShadow position={[0,5,0]}><boxGeometry args={[9,10,17]}/><meshStandardMaterial color="#e2d3be"/></mesh>
  <mesh position={[0,3,8.6]}><boxGeometry args={[4,6,.2]}/><meshStandardMaterial color="#4d3027"/></mesh>
  <mesh position={[0,11.3,0]}><boxGeometry args={[12,1,18]}/><meshStandardMaterial color="#a18d67" metalness={.5}/></mesh>
  <mesh position={[0,-.05,27]}><boxGeometry args={[24,.15,14]}/><meshStandardMaterial color="#8d9094"/></mesh>
  <mesh position={[0,2,30]}><boxGeometry args={[14,4,.4]}/><meshStandardMaterial color="#4b4e55"/></mesh>
  <mesh position={[0,12,-7]}><boxGeometry args={[17,.25,10]}/><meshStandardMaterial color="#aeb9c1"/></mesh>
  {[-1,1].map(side=><mesh key={side} position={[side*40,1.8,0]}><boxGeometry args={[.5,3.6,72]}/><meshStandardMaterial color="#b4aaa0"/></mesh>)}
 </group>
}
