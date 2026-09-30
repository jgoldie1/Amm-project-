import {STREETVERSE_FUTURE_VEHICLES,STREETVERSE_FUTURE_VEHICLE_LISTINGS,requestFutureVehiclePurchase} from '../data/streetVerseFutureVehicles'
export default function StreetVerseFutureVehicleDealer({onClose}:{onClose:()=>void}){
 return <section aria-label="TRYAMM Future Mobility dealership" style={{position:'absolute',inset:'12px',zIndex:40,overflow:'auto',padding:14,borderRadius:16,background:'#07121bef',color:'#fff'}}>
  <button onClick={onClose} style={{minHeight:44,padding:'8px 12px',borderRadius:12,fontWeight:900}}>← STREET</button>
  <h2>TRYAMM FUTURE MOBILITY</h2><p style={{fontSize:12}}>Buy • own • garage • drive • resell</p>
  {STREETVERSE_FUTURE_VEHICLE_LISTINGS.map(l=>{const v=STREETVERSE_FUTURE_VEHICLES.find(x=>x.id===l.vehicleId)!;return <article key={l.vehicleId} style={{padding:'12px 0',borderTop:'1px solid #ffffff33'}}>
   <strong>{v.name}</strong><div>{l.price.toLocaleString()} SV CREDITS • stock {l.stock}</div>
   <small>{v.kind} • {v.seats} seat{v.seats===1?'':'s'} • speed {v.speed} • handling {Math.round(v.handling*100)}</small>
   <button onClick={()=>requestFutureVehiclePurchase(v.id)} style={{display:'block',width:'100%',minHeight:48,marginTop:8,borderRadius:12,fontWeight:950}}>BUY • DELIVER TO GARAGE</button>
  </article>})}
 </section>
}
