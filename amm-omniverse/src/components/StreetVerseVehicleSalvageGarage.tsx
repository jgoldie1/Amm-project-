import {useEffect,useState} from 'react'
import {STREETVERSE_VEHICLE_SALVAGE} from '../config/streetverseChicagoRpGameplay'

type Vehicle={id:string;name:string;condition:number;source:string;status:'INTAKE'|'REPAIR'|'READY'}
const DEMO:Vehicle[]=[
 {id:'sv-001',name:'1970s Street Coupe',condition:42,source:'Mission-tagged fictional salvage',status:'INTAKE'},
 {id:'sv-002',name:'City Delivery Van',condition:67,source:'Auction simulation',status:'REPAIR'},
 {id:'sv-003',name:'Classic Chicago Cruiser',condition:91,source:'Player-owned trade-in',status:'READY'},
]

export default function StreetVerseVehicleSalvageGarage(){
 const [open,setOpen]=useState(false)
 const [vehicles,setVehicles]=useState(DEMO)
 useEffect(()=>{const show=()=>setOpen(true);window.addEventListener('tryamm:open-salvage-garage',show);return()=>window.removeEventListener('tryamm:open-salvage-garage',show)},[])
 if(!open)return null
 const advance=(id:string)=>setVehicles(v=>v.map(x=>x.id===id?{...x,condition:Math.min(100,x.condition+20),status:x.status==='INTAKE'?'REPAIR':'READY'}:x))
 return <div role="dialog" aria-label="Vehicle Salvage and Custom Garage" style={{position:'fixed',inset:0,zIndex:17100,background:'#02050bf2',color:'#fff',overflow:'auto'}}>
  <div style={{maxWidth:920,margin:'0 auto',padding:18}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,color:'#e8b944',fontWeight:950,letterSpacing:2}}>STREETVERSE VEHICLE ECONOMY</div><h1 style={{margin:'5px 0'}}>{STREETVERSE_VEHICLE_SALVAGE.inWorldName}</h1><div style={{fontSize:12,opacity:.7}}>Fictional game vehicles only • repair, rebuild, customize, part-out and auction.</div></div><button onClick={()=>setOpen(false)} style={{width:48,height:48,borderRadius:14}}>×</button></header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:16}}>
    {vehicles.map(v=><article key={v.id} style={{padding:14,border:'1px solid #2d4960',borderRadius:16,background:'#08131e'}}><div style={{fontWeight:950,fontSize:17}}>{v.name}</div><div style={{fontSize:11,opacity:.72,marginTop:4}}>{v.source}</div><div style={{marginTop:12}}>Condition • {v.condition}%</div><div>Status • {v.status}</div><button onClick={()=>advance(v.id)} disabled={v.status==='READY'} style={{marginTop:12,minHeight:44,width:'100%',borderRadius:10,fontWeight:900}}>{v.status==='INTAKE'?'INSPECT / STRIP':v.status==='REPAIR'?'REBUILD / CUSTOMIZE':'READY FOR AUCTION / RESALE'}</button></article>)}
   </div>
   <section style={{marginTop:14,padding:12,border:'1px solid #3b4650',borderRadius:14,fontSize:11,opacity:.78}}>Game rule: ownership, parts, sale price and payouts stay server-authoritative. This system does not provide real-world theft, VIN tampering or evasion instructions.</section>
  </div>
 </div>
}
