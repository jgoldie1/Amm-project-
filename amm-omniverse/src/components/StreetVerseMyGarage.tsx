import {useEffect,useState} from 'react'
import {STREETVERSE_FUTURE_VEHICLES} from '../data/streetVerseFutureVehicles'
export type OwnedVehicle={ownershipId:string;vehicleId:string;acquiredAt:string;status:'garage'|'spawned'}
export default function StreetVerseMyGarage({onClose,onSpawn}:{onClose:()=>void;onSpawn:(v:OwnedVehicle)=>void}){
 const [owned,setOwned]=useState<OwnedVehicle[]>([])
 useEffect(()=>{const grant=(e:Event)=>{const d=(e as CustomEvent).detail||{};if(d.serverConfirmed!==true||!d.ownershipId||!d.vehicleId)return;setOwned(xs=>xs.some(x=>x.ownershipId===d.ownershipId)?xs:[...xs,{ownershipId:d.ownershipId,vehicleId:d.vehicleId,acquiredAt:d.acquiredAt||new Date().toISOString(),status:'garage'}])};window.addEventListener('tryamm:vehicle-ownership-granted',grant);return()=>window.removeEventListener('tryamm:vehicle-ownership-granted',grant)},[])
 const sell=(o:OwnedVehicle)=>window.dispatchEvent(new CustomEvent('tryamm:vehicle-sell-request',{detail:{ownershipId:o.ownershipId,vehicleId:o.vehicleId}}))
 return <section aria-label="My Garage" style={{position:'absolute',inset:12,zIndex:41,overflow:'auto',padding:14,borderRadius:16,background:'#07121bf2',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,borderRadius:12,fontWeight:900}}>← STREET</button><h2>MY GARAGE</h2>
  {!owned.length&&<p>No owned vehicles yet. Buy one at Future Mobility; it appears here after server confirmation.</p>}
  {owned.map(o=>{const v=STREETVERSE_FUTURE_VEHICLES.find(x=>x.id===o.vehicleId);return <article key={o.ownershipId} style={{padding:'12px 0',borderTop:'1px solid #ffffff33'}}><strong>{v?.name||o.vehicleId}</strong><small style={{display:'block'}}>OWNED • {o.status.toUpperCase()}</small><div style={{display:'flex',gap:8,marginTop:8}}><button onClick={()=>onSpawn(o)} style={{minHeight:46,flex:1,borderRadius:12,fontWeight:950}}>SPAWN</button><button onClick={()=>sell(o)} style={{minHeight:46,flex:1,borderRadius:12,fontWeight:950}}>SELL</button></div></article>})}
 </section>
}
