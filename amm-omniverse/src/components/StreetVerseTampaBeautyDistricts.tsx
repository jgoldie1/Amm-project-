import {useMemo} from 'react'
import {TAMPA_INSPECT_EVENT} from './StreetVerseTampaWorldBuilderInspector'
const inspect=(id:string)=>window.dispatchEvent(new CustomEvent(TAMPA_INSPECT_EVENT,{detail:{id}}))

/** Fictional walkable Tampa-inspired district layout. Not a GIS reconstruction. */
export const TAMPA_BEAUTY_DISTRICTS=[
 {id:'riverwalk',name:'Riverwalk Promenade',center:[-50,0],purpose:'Waterfront social RP and public events',homes:0},
 {id:'beauty-house',name:'Beauty House Quarter',center:[0,0],purpose:'LaTeasia salon, academy and shops',homes:8},
 {id:'residential',name:'Tampa Residential Village',center:[0,50],purpose:'Apartments, townhomes and neighborhood RP',homes:28},
 {id:'entertainment',name:'Holo Entertainment Pier',center:[-50,50],purpose:'Music, restaurants, photo booths and nightlife',homes:6}
] as const
export const TAMPA_DISTRICT_EVENT='tryamm:beautyverse-tampa-district-selected'
export function StreetVerseTampaBeautyDistricts(){
 const homes=useMemo(()=>Array.from({length:42},(_,i)=>({id:i,x:(i%7)*6-17,z:Math.floor(i/7)*7-18})),[])
 return <group name="beautyverse-tampa-four-district-prototype" position={[-710,0,780]}>
  <mesh receiveShadow position={[-25,-.13,25]}><boxGeometry args={[116,.2,116]}/><meshStandardMaterial color="#a7ba92"/></mesh>
  {/* Riverwalk and water; river edge is fictional rather than geographically precise. */}
  <mesh name="tampa-waterfront-water" position={[-81,-.07,22]}><boxGeometry args={[28,.06,116]}/><meshStandardMaterial color="#3689a7" metalness={.15} roughness={.35}/></mesh>
  <mesh name="riverwalk-pedestrian-path" position={[-62,.02,22]}><boxGeometry args={[8,.14,108]}/><meshStandardMaterial color="#e6d3af"/></mesh>
  {Array.from({length:12},(_,i)=><group key={i} position={[-62,.3,i*8-22]}>
   <mesh position={[-2,1.1,0]}><cylinderGeometry args={[.1,.1,2.2,8]}/><meshStandardMaterial color="#333f4b"/></mesh>
   <mesh position={[-2,2.25,0]}><sphereGeometry args={[.3,10,8]}/><meshStandardMaterial color="#fff4c7" emissive="#d3b66b" emissiveIntensity={.2}/></mesh>
   <mesh position={[2,.15,0]}><boxGeometry args={[1.7,.3,.6]}/><meshStandardMaterial color="#927456"/></mesh>
  </group>)}
  {/* Four districts and navigable street corridors */}
  {TAMPA_BEAUTY_DISTRICTS.map((d,i)=><group key={d.id} name={'district-'+d.id} position={[d.center[0],0,d.center[1]]}>
   <mesh position={[0,-.03,0]}><boxGeometry args={[42,.1,42]}/><meshStandardMaterial color={['#a2bfb5','#f1c4d9','#c5c7b4','#a6b6d5'][i]}/></mesh>
   <mesh position={[0,.03,0]}><boxGeometry args={[30,.03,2]}/><meshStandardMaterial color="#ddd9cf"/></mesh>
  </group>)}
  <mesh name="district-connector-east-west" position={[-25,.02,25]}><boxGeometry args={[112,.08,5]}/><meshStandardMaterial color="#555e67"/></mesh>
  <mesh name="district-connector-north-south" position={[-25,.025,25]}><boxGeometry args={[5,.08,112]}/><meshStandardMaterial color="#555e67"/></mesh>
  {/* Housing: repeatable low-poly buildings, each tagged with an RP residence ID. */}
  {homes.map(h=><group key={h.id} onClick={e=>{e.stopPropagation();inspect('home-001')}} name={'beautyverse-residence-'+String(h.id+1).padStart(3,'0')} position={[h.x+8,0,h.z+50]}>
   <mesh position={[0,1.4,0]} castShadow><boxGeometry args={[4,2.8,4.6]}/><meshStandardMaterial color={h.id%2?'#f3ddc7':'#d6d8e6'}/></mesh>
   <mesh position={[0,2.95,0]}><coneGeometry args={[3.5,1.3,4]} rotation={[0,Math.PI/4,0]}/><meshStandardMaterial color="#805e65"/></mesh>
   <mesh position={[0,.85,2.34]}><boxGeometry args={[.9,1.7,.06]}/><meshStandardMaterial color="#9b7457"/></mesh>
  </group>)}
  {/* Flagship and community facilities */}
  <group name="lateasia-tampa-flagship-salon" onClick={e=>{e.stopPropagation();inspect("salon")}} position={[5,0,-5]}>
   <mesh position={[0,2,0]} castShadow><boxGeometry args={[12,4,9]}/><meshStandardMaterial color="#eaa8c8"/></mesh>
   <mesh position={[0,1.7,4.55]}><boxGeometry args={[4,3.2,.12]}/><meshStandardMaterial color="#a7d8e4" transparent opacity={.7}/></mesh>
   <mesh position={[0,4.2,0]}><boxGeometry args={[13,.5,10]}/><meshStandardMaterial color="#e5c16a" metalness={.5}/></mesh>
  </group>
  {['academy','boutique','cafe','photo-studio','restaurant','music-venue'].map((id,i)=><group key={id} name={'tampa-'+id} onClick={e=>{e.stopPropagation();inspect(id)}} position={[i<3?i*12-14:i*12-50,0,i<3?13:57]}>
   <mesh position={[0,1.8,0]} castShadow><boxGeometry args={[9,3.6,7]}/><meshStandardMaterial color={i%2?'#e1c3b0':'#b4c9cf'}/></mesh>
   <mesh position={[0,1.5,3.54]}><boxGeometry args={[4,2.5,.08]}/><meshStandardMaterial color="#b9e5ed" transparent opacity={.65}/></mesh>
  </group>)}
 </group>
}
