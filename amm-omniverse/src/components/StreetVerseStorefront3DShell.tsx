import {Canvas} from '@react-three/fiber'
import {useState} from 'react'
import {storefrontById} from '../data/StreetVerseStorefrontCatalog'

export default function StreetVerseStorefront3DShell({businessId}:{businessId:string}){
 const [loaded,setLoaded]=useState(false)
 const business=storefrontById(businessId)
 if(!business)return null
 return <section aria-label={business.name+' 3D mock storefront'} style={{border:'1px solid '+business.accent,padding:12,borderRadius:12,marginTop:12}}>
  <strong>Optional 3D facade preview — {business.name}</strong>
  <p style={{fontSize:12}}>Stand-alone geometry only. Not connected to the StreetVerse city or any booking system.</p>
  {loaded?<div style={{height:240}}>
   <Canvas frameloop="demand" dpr={1} camera={{position:[7,5,9],fov:48}}>
    <ambientLight intensity={2}/>
    <directionalLight position={[4,8,6]} intensity={2}/>
    <mesh position={[0,1,0]}><boxGeometry args={[6,3,4]}/><meshStandardMaterial color="#294356"/></mesh>
    <mesh position={[0,2.7,0]}><boxGeometry args={[7,.4,5]}/><meshStandardMaterial color={business.accent}/></mesh>
    <mesh position={[0,.9,2.02]}><boxGeometry args={[1.6,1.8,.08]}/><meshStandardMaterial color="#96cbe9" transparent opacity={.65}/></mesh>
   </Canvas>
  </div>:null}
  <button type="button" onClick={()=>setLoaded(!loaded)} style={{minHeight:48,padding:12}}>{loaded?'Unload 3D preview':'Load 3D preview'}</button>
 </section>
}
