import { useEffect, useState } from 'react'
import { recordMobilityEvent, verifyOmniverseLedger } from '../runtime/OmniverseAssetLedger'
import {STREETVERSE_MOBILITY_ECONOMY} from '../data/StreetVerseMobilityEconomy'
import {CHICAGO_AMBIENT_MOBILITY_JOBS} from '../runtime/StreetVerseLivingMobilityRuntime'

export default function HoloMobilityLauncher({launcher=true}:{launcher?:boolean}={}){
  const [open,setOpen]=useState(false)
  const [status,setStatus]=useState('Provider connections are gated until real transport/drone providers and compliance credentials are connected.')
  const [ledger,setLedger]=useState('Internal ledger audit not run yet.')
  const [selectedJob,setSelectedJob]=useState(0)
  useEffect(()=>{const openFromWorld=()=>setOpen(true);window.addEventListener('tryamm:holo-mobility-open',openFromWorld);return()=>window.removeEventListener('tryamm:holo-mobility-open',openFromWorld)},[])

  const dispatchStreetVerse=(kind:'rideshare'|'car-share'|'rental'|'delivery'|'recovery'|'air-taxi')=>{
    const candidates=CHICAGO_AMBIENT_MOBILITY_JOBS.filter(job=>kind==='car-share'?job.kind==='car-share':kind==='recovery'?job.kind==='recovery':kind==='delivery'?job.kind==='delivery':job.kind==='rideshare')
    const job=candidates[selectedJob%candidates.length]||CHICAGO_AMBIENT_MOBILITY_JOBS[0]
    setSelectedJob(v=>v+1)
    window.dispatchEvent(new CustomEvent('tryamm:streetverse-mobility-job',{detail:{...job,requestedMode:kind,simulation:true}}))
    setStatus(`${kind.toUpperCase()} • ${job.label} • StreetVerse simulation mission dispatched.`)
  }

  const request=async(kind:'ride'|'drone')=>{
    await recordMobilityEvent(kind,{source:'holo-mobility-launcher',demo:true})
    setStatus(kind==='ride'?'Ride request workflow recorded. External dispatch remains provider-gated.':'Drone mission workflow recorded. External flight/dispatch remains provider and compliance-gated.')
    const audit=await verifyOmniverseLedger()
    setLedger(audit.ok?`Internal hash-chain verified • ${audit.blocks} blocks`:`Ledger verification failed at block ${audit.failedIndex}`)
  }

  return <>
    {launcher&&<button type="button" onClick={()=>setOpen(true)} aria-label="Open Holo mobility" style={{position:'fixed',right:12,bottom:176,zIndex:9001,border:'1px solid #78ffb477',background:'linear-gradient(135deg,#0d3f31,#172438)',color:'#fff',borderRadius:999,padding:'10px 14px',fontWeight:950,cursor:'pointer',boxShadow:'0 8px 30px #0008'}}>✦ HOLO RIDE + DRONE</button>}
    {open&&<section role="dialog" aria-modal="true" aria-label="Holo Ride Share and Drone" style={{position:'fixed',inset:0,zIndex:21000,overflow:'auto',background:'#02050ef7',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
      <div style={{maxWidth:920,margin:'0 auto',padding:'28px 16px 80px'}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,letterSpacing:3,color:'#4FE3FF',fontWeight:950}}>STUBBS AI MOBILITY NETWORK</div><h1 style={{margin:'6px 0'}}>Holo Ride Share + Holo Drone</h1></div><button onClick={()=>setOpen(false)} style={closeBtn}>×</button></div>
        <p style={{color:'#9fb2c8',lineHeight:1.6}}>One mobility layer connects StreetVerse destinations, local businesses, delivery missions, ride discovery, peer car sharing, digital rentals, vehicle recovery and approved drone/air workflows. StreetVerse jobs are simulation; real-world dispatch remains locked until the necessary provider, identity, insurance and regulatory gates are complete.</p>
        <article style={{...card,marginTop:16,borderColor:'#7a6125'}}><div style={eyebrow}>STREETVERSE MOBILITY</div><h2>One city • many ways to move and earn.</h2><p style={copy}>NPC and player demand can create rides, deliveries, car-share handoffs, rentals and safe vehicle-recovery jobs across Circle Park, Roosevelt Road, Taylor Street and Pilsen.</p><div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:8}}>
          <button onClick={()=>dispatchStreetVerse('rideshare')} style={primaryBtn}>RIDE SHARE</button>
          <button onClick={()=>dispatchStreetVerse('car-share')} style={primaryBtn}>CAR SHARE</button>
          <button onClick={()=>dispatchStreetVerse('rental')} style={primaryBtn}>RENTAL</button>
          <button onClick={()=>dispatchStreetVerse('delivery')} style={primaryBtn}>DELIVERY</button>
          <button onClick={()=>dispatchStreetVerse('air-taxi')} style={primaryBtn}>AIR TAXI</button>
          <button onClick={()=>dispatchStreetVerse('recovery')} style={{...primaryBtn,background:'linear-gradient(135deg,#ffd05c,#ff9a52)'}}>REPO / RECOVERY</button>
        </div><div style={{marginTop:10,fontSize:9,color:'#b7c7d3'}}>RIDE SHARE • {STREETVERSE_MOBILITY_ECONOMY.modes.rideshare.label} • CAR SHARE • {STREETVERSE_MOBILITY_ECONOMY.modes['peer-car-share'].label} • RECOVERY IS NONVIOLENT / AUTHORIZED ONLY</div></article>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12,marginTop:20}}>
          <article style={card}><div style={eyebrow}>HOLO RIDE SHARE</div><h2>Move people to real and digital destinations.</h2><p style={copy}>Request flow, destination selection, StreetVerse business routing, accessibility preferences and ride tracking are prepared as the product layer.</p><button onClick={()=>void request('ride')} style={primaryBtn}>REQUEST RIDE WORKFLOW</button><a href="/standalone/holo-ride-share" style={linkBtn}>OPEN RIDE SHARE SITE</a></article>
          <article style={card}><div style={eyebrow}>HOLO DRONE</div><h2>Coordinate approved drone missions.</h2><p style={copy}>Delivery support, media capture, mapping and mission tracking are represented without pretending an aircraft has been dispatched before a real provider is connected.</p><button onClick={()=>void request('drone')} style={primaryBtn}>START DRONE WORKFLOW</button><a href="/standalone/holo-drone" style={linkBtn}>OPEN DRONE SITE</a></article>
        </div>
        <article style={{...card,marginTop:12}}><div style={eyebrow}>INTERNAL LEDGER / BLOCKCHAIN LAYER</div><p style={copy}>Mobility workflow events are written to the El Saturn Quantum Omniverse internal hash-chained game ledger. This is an internal application ledger, not a public cryptocurrency or externally settled blockchain.</p><div style={{fontWeight:900,color:'#78ffb4'}}>{ledger}</div></article>
        <div style={{marginTop:12,padding:14,border:'1px solid #2a4050',borderRadius:14,color:'#b6c5d0'}}>{status}</div>
      </div>
    </section>}
  </>
}
const card:React.CSSProperties={padding:18,borderRadius:18,border:'1px solid #263944',background:'#081017cc'}
const eyebrow:React.CSSProperties={fontSize:10,letterSpacing:2,color:'#E8B944',fontWeight:950}
const copy:React.CSSProperties={color:'#9fb2c8',lineHeight:1.6,fontSize:13}
const primaryBtn:React.CSSProperties={width:'100%',marginTop:10,padding:'11px 14px',border:0,borderRadius:11,background:'linear-gradient(135deg,#4FE3FF,#78FFB4)',color:'#041016',fontWeight:950,cursor:'pointer'}
const linkBtn:React.CSSProperties={display:'block',marginTop:8,padding:'10px 12px',border:'1px solid #345064',borderRadius:11,color:'#fff',textAlign:'center',textDecoration:'none',fontWeight:900}
const closeBtn:React.CSSProperties={width:44,height:44,borderRadius:14,border:'1px solid #3a4d60',background:'#0c1420',color:'#fff',fontSize:24,cursor:'pointer'}