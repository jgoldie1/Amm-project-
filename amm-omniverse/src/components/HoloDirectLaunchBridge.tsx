import { useEffect, useMemo, useState } from 'react'
import { createHoloDelivery, requestHoloRide } from '../services/holoServices'
import { evaluateDeliveryModes } from '../logistics/holoDelivery'

type Panel = 'ride'|'delivery'|'drone'|null

export default function HoloDirectLaunchBridge(){
  const [panel,setPanel]=useState<Panel>(null)
  const [pickup,setPickup]=useState('AI Café Chicago')
  const [dropoff,setDropoff]=useState('Creator District')
  const [merchant,setMerchant]=useState('ai-cafe')
  const [weight,setWeight]=useState(1)
  const [message,setMessage]=useState('')
  const [busy,setBusy]=useState(false)

  useEffect(()=>{
    ;(window as any).__showHoloRide=()=>setPanel('ride')
    ;(window as any).__showHoloDelivery=()=>setPanel('delivery')
    ;(window as any).__showHoloDrone=()=>setPanel('drone')
    ;(window as any).__showAllAmericanNetwork=()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{destination:'all-american-network'}}))
    ;(window as any).__showServantsOfChristNetwork=()=>window.dispatchEvent(new CustomEvent('tryamm:media-studio-open',{detail:{destination:'servants-of-christ-network'}}))
    return()=>{
      delete (window as any).__showHoloRide
      delete (window as any).__showHoloDelivery
      delete (window as any).__showHoloDrone
      delete (window as any).__showAllAmericanNetwork
      delete (window as any).__showServantsOfChristNetwork
    }
  },[])

  const droneEligibility=useMemo(()=>evaluateDeliveryModes({id:'preview',orderId:'preview',pickup:{label:pickup},dropoff:{label:dropoff},packageWeightKg:weight,requestedModes:['drone']},{droneAllowedByProvider:false,weatherSafeForDrone:true,maxDroneWeightKg:2.5}),[pickup,dropoff,weight])
  if(!panel)return null
  const box:React.CSSProperties={background:'#07111f',border:'1px solid #29465f',borderRadius:14,padding:14}
  const btn:React.CSSProperties={minHeight:44,borderRadius:10,border:'1px solid #4fe3ff77',background:'#0c2c3a',color:'#dffaff',fontWeight:900,cursor:'pointer',padding:'0 14px'}
  const input:React.CSSProperties={width:'100%',boxSizing:'border-box',padding:11,borderRadius:10,border:'1px solid #35536a',background:'#020812',color:'#fff',marginTop:8}
  async function run(fn:()=>Promise<unknown>,success:string){setBusy(true);setMessage('');try{await fn();setMessage(success)}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}

  return <div role="dialog" aria-modal="true" aria-label={`Holo ${panel}`} style={{position:'fixed',inset:0,zIndex:12150,background:'rgba(1,4,12,.94)',display:'grid',placeItems:'center',padding:16,color:'#fff'}} onClick={()=>setPanel(null)}>
    <section onClick={e=>e.stopPropagation()} style={{width:'min(94vw,620px)',maxHeight:'86vh',overflowY:'auto',background:'linear-gradient(160deg,#07131f,#090713)',border:'1px solid #4fe3ff66',borderRadius:22,padding:18,boxShadow:'0 30px 100px #000d'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{color:'#4fe3ff',fontSize:10,fontWeight:950,letterSpacing:2}}>TRYAMM HOLO</div><h2 style={{margin:'4px 0'}}>{panel==='ride'?'Holo Ride':panel==='delivery'?'Holo Delivery':'Holo Drone'}</h2></div><button onClick={()=>setPanel(null)} style={btn}>Close</button></div>
      {message&&<div style={{...box,margin:'12px 0'}}>{message}</div>}
      {panel==='ride'&&<div style={box}><p>Authenticated ride-request foundation. Current requests remain simulation-only until driver onboarding, maps, insurance, transportation compliance and live payments are verified.</p><input style={input} value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Pickup"/><input style={input} value={dropoff} onChange={e=>setDropoff(e.target.value)} placeholder="Dropoff"/><button disabled={busy} style={{...btn,marginTop:10}} onClick={()=>run(()=>requestHoloRide(pickup,dropoff),'Holo Ride request saved to your TRYAMM account.')}>Request Ride</button></div>}
      {panel==='delivery'&&<div style={box}><p>Food, marketplace and local-business courier workflow with authenticated Supabase persistence.</p><input style={input} value={merchant} onChange={e=>setMerchant(e.target.value)} placeholder="Merchant"/><input style={input} value={pickup} onChange={e=>setPickup(e.target.value)} placeholder="Pickup"/><input style={input} value={dropoff} onChange={e=>setDropoff(e.target.value)} placeholder="Dropoff"/><button disabled={busy} style={{...btn,marginTop:10}} onClick={()=>run(()=>createHoloDelivery(merchant,pickup,dropoff),'Holo Delivery order saved to your TRYAMM account.')}>Create Delivery</button></div>}
      {panel==='drone'&&<div style={box}><p>Drone delivery is policy-gated. TRYAMM will not dispatch a physical drone until an approved provider, legal operating authority, route/weather safety, package limits and human confirmation are verified.</p><input style={input} type="number" min="0" step="0.1" value={weight} onChange={e=>setWeight(Number(e.target.value)||0)} placeholder="Package weight kg"/><div style={{marginTop:12,padding:12,borderRadius:10,background:'#101b29'}}><strong>Current eligibility: {droneEligibility[0]?.eligible?'ELIGIBLE':'GATED'}</strong><div style={{marginTop:6,fontSize:12,color:'#b8ccda'}}>{droneEligibility[0]?.reasons.join(' • ')}</div></div><button style={{...btn,marginTop:10}} onClick={()=>{(window as any).__showHoloServices?.();setPanel(null)}}>Open Holo Logistics</button></div>}
    </section>
  </div>
}
