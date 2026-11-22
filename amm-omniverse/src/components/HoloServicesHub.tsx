import { useEffect, useState } from 'react'
import ElectricDroneFleetCenter from './ElectricDroneFleetCenter'
import HoloServicePassportCenter from './HoloServicePassportCenter'
import {buildHoloReadinessReport} from '../foundation/holoOnePushReadinessReport'
import {HOLO_SERVICE_GATES,HOLO_SERVICE_LABELS,assessHoloService,type HoloService} from '../foundation/holoServiceLaunchGates'
import { createAdCampaign, createHoloBuilderProject, createHoloDelivery, createLogisticsJob, holoSearch, listHoloversePortals, prepareTranslation, reportHoloSafetyEvent, requestHoloRide, type HoloSearchDocument, type HoloversePortal } from '../services/holoServices'
import { isSupabaseConfigured } from '../services/supabaseClient'

interface Props{onClose:()=>void}
type Tab='search'|'ride'|'delivery'|'logistics'|'drone'|'advertise'|'lingo'|'guardian'|'builder'|'holoverse'|'readiness'|'passport'
const tabs:Record<Tab,string>={search:'🔎 Holo Search',ride:'🚘 Holo Ride',delivery:'📦 Holo Delivery',logistics:'🚛 Holo Logistics',drone:'🚁 Holo Drone',advertise:'📣 Holo Advertise',lingo:'🌐 Holo Lingo',guardian:'🛡 Holo Guardian',builder:'🧰 Holo Builder',holoverse:'🌀 Holoverse',readiness:'🛡 Launch Readiness',passport:'🪪 HoloService Passport'}

export default function HoloServicesHub({onClose}:Props){
 const [tab,setTab]=useState<Tab>(()=>window.location.pathname==='/holo-drone'?'drone':window.location.pathname==='/holo-ride'?'ride':window.location.pathname==='/holo-delivery'?'delivery':window.location.pathname==='/holo-logistics'?'logistics':window.location.pathname==='/holo-advertise'?'advertise':window.location.pathname==='/holo-readiness'?'readiness':window.location.pathname==='/holo-passport'?'passport':'search'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[q,setQ]=useState(''),[results,setResults]=useState<HoloSearchDocument[]>([]),[portals,setPortals]=useState<HoloversePortal[]>([])
 const [readinessReport,setReadinessReport]=useState<ReturnType<typeof buildHoloReadinessReport>|null>(null)
 const [a,setA]=useState('AI Café Chicago'),[b,setB]=useState('Creator District'),[text,setText]=useState('Welcome to TryAMM'),[locale,setLocale]=useState('es'),[campaign,setCampaign]=useState('Living Worlds Launch'),[builderTitle,setBuilderTitle]=useState('My Holo Experience')
 useEffect(()=>{if(isSupabaseConfigured())listHoloversePortals().then(setPortals).catch(()=>{})},[])
 const btn:React.CSSProperties={background:'#0e2340',border:'1px solid #52e5ff66',color:'#a9f2ff',borderRadius:8,padding:'12px 13px',cursor:'pointer',fontFamily:'monospace'},box:React.CSSProperties={background:'#06101f',border:'1px solid #213b56',borderRadius:12,padding:12},input:React.CSSProperties={width:'100%',background:'#020812',color:'#fff',border:'1px solid #33566f',borderRadius:8,padding:10,fontFamily:'monospace'}
 const auditHoloServices=()=>{
  const report=buildHoloReadinessReport((service)=>assessHoloService(service as HoloService,[]))
  setReadinessReport(report)
 }
 const exportReadiness=()=>{
  if(!readinessReport)return
  const file=new Blob([JSON.stringify(readinessReport,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(file)
  const link=document.createElement('a');link.href=url;link.download='TRYAMM_HoloServices_Readiness_Audit.json'
  document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url)
 }
  async function run(fn:()=>Promise<unknown>,success:string){setBusy(true);setMessage('');try{await fn();setMessage(success)}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}
 return <div style={{position:'fixed',inset:0,zIndex:10090,background:'rgba(1,5,14,.99)',color:'#eefaff',fontFamily:'monospace',overflowY:'auto'}}><div style={{maxWidth:1120,margin:'0 auto',padding:16}}><div style={{display:'flex',gap:12,alignItems:'center'}}><button style={btn} onClick={onClose}>← Back</button><div><h2 style={{margin:0,color:'#52e5ff'}}>HOLO SERVICES CONTROL CENTER</h2><div style={{fontSize:10,color:'#66849a'}}>Search • Mobility • Delivery • Logistics • Advertising • Translation • Safety • Building • Holoverse • Payments • Support • Readiness</div></div></div>{message&&<div style={{...box,marginTop:10,borderColor:'#52e5ff55'}}>{message}</div>}<div style={{display:'flex',gap:6,flexWrap:'wrap',margin:'12px 0'}}>{(Object.keys(tabs) as Tab[]).map(t=><button key={t} style={{...btn,background:t===tab?'#154a5a':'#0e2340'}} onClick={()=>setTab(t)}>{tabs[t]}</button>)}</div>

 {tab==='search'&&<section style={box}><h3>Holo Search</h3><p style={{fontSize:11,color:'#89a5b9'}}>Universal discovery across TryAMM worlds, services, businesses, creators, books, games, learning and eventually geospatial results.</p><input style={input} value={q} onChange={e=>setQ(e.target.value)} placeholder="Search TryAMM..."/><button style={{...btn,marginTop:8}} disabled={busy} onClick={async()=>{setBusy(true);try{setResults(await holoSearch(q))}catch(e){setMessage(e instanceof Error?e.message:String(e))}finally{setBusy(false)}}}>Search</button><div style={{display:'grid',gap:7,marginTop:10}}>{results.map(r=><article style={box} key={r.id}><b>{r.title}</b><div style={{fontSize:10,color:'#52e5ff'}}>{r.source_type} {r.world_slug?`• ${r.world_slug}`:''}</div><p style={{fontSize:11,color:'#aaa'}}>{r.description}</p></article>)}</div></section>}

 {tab==='ride'&&<section style={box}><h3>Holo Ride</h3><p style={{fontSize:11,color:'#89a5b9'}}>Rideshare request/dispatch foundation. Current flow is simulation-only until driver onboarding, maps, insurance, local transportation compliance and live payments are connected.</p><input style={input} value={a} onChange={e=>setA(e.target.value)} placeholder="Pickup"/><br/><br/><input style={input} value={b} onChange={e=>setB(e.target.value)} placeholder="Dropoff"/><button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>run(()=>requestHoloRide(a,b),'Holo Ride simulation request created.')}>Request Ride</button></section>}

 {tab==='delivery'&&<section style={box}><h3>Holo Delivery</h3><p style={{fontSize:11,color:'#89a5b9'}}>Food, marketplace and local-business courier workflow, separated from freight logistics.</p><input style={input} value={a} onChange={e=>setA(e.target.value)} placeholder="Merchant / pickup"/><br/><br/><input style={input} value={b} onChange={e=>setB(e.target.value)} placeholder="Customer / dropoff"/><button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>run(()=>createHoloDelivery('ai-cafe',a,b),'Holo Delivery simulation order created.')}>Create Delivery</button></section>}

 {tab==='logistics'&&<section style={box}><h3>Holo Logistics</h3><p style={{fontSize:11,color:'#89a5b9'}}>Freight, dispatch, warehouse and route-state foundation connected to Workforce training.</p><input style={input} value={a} onChange={e=>setA(e.target.value)} placeholder="Origin"/><br/><br/><input style={input} value={b} onChange={e=>setB(e.target.value)} placeholder="Destination"/><button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>run(()=>createLogisticsJob(a,b),'Holo Logistics freight simulation planned.')}>Plan Freight Job</button></section>}

 {tab==='drone'&&<section aria-label="Holo Drone Services planning only" style={box}><h3>Holo Drone Services</h3><p role="status" style={{color:'#ffdca0'}}>Planning and simulation only. No real flight, delivery, flight authorization or operator assignment is active. Licensed pilot/provider, aircraft registration and applicable flight authority, airspace/weather checks, privacy and insured fulfillment are required before dispatch.</p><ElectricDroneFleetCenter initialTab="drone"/></section>}

 {tab==='advertise'&&<section style={box}><h3>Holo Advertise</h3><p role="status" style={{fontSize:12,color:'#ffdca0'}}>Draft-only: $0 spending and no live ad delivery. Production requires advertiser identity verification, brand/creative rights, consent-based targeting, disclosure, moderation, provider-approved billing, attribution and refund/dispute policies.</p><p style={{fontSize:11,color:'#89a5b9'}}>One campaign model for feed ads, creator/live placements, in-world placements and future AR/holographic inventory. Drafts start with $0 spend so nothing can charge automatically.</p><input style={input} value={campaign} onChange={e=>setCampaign(e.target.value)}/><button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>run(()=>createAdCampaign(campaign),'Draft Holo Advertise campaign created with no spend.')}>Create Draft Campaign</button></section>}

 {tab==='lingo'&&<section style={box}><h3>Holo Lingo</h3><p style={{fontSize:11,color:'#89a5b9'}}>Translation job foundation. Legal, medical, financial and emergency text is automatically held for human review.</p><textarea style={{...input,minHeight:100}} value={text} onChange={e=>setText(e.target.value)}/><input style={{...input,marginTop:8}} value={locale} onChange={e=>setLocale(e.target.value)} placeholder="Target locale e.g. es, fr, am, he"/><button style={{...btn,marginTop:8}} disabled={busy} onClick={()=>run(()=>prepareTranslation(text,locale),'Translation job prepared. High-risk text will require review.')}>Prepare Translation</button></section>}

 {tab==='guardian'&&<section style={box}><h3>Holo Guardian + Holo Access</h3><p style={{fontSize:11,color:'#89a5b9'}}>Guardian is the shared safety/reporting layer. Holo Access remains the platform-wide accessibility profile already connected to the app, with this hub serving as its discovery/control surface.</p><button style={btn} disabled={busy} onClick={()=>run(()=>reportHoloSafetyEvent('user-report','medium',{note:'Test report from Holo Services Hub'}),'Safety event recorded for review.')}>Create Test Safety Report</button><div style={{fontSize:10,color:'#7591a5',marginTop:9}}>Production moderation still needs staffed escalation, youth safety policy enforcement, incident SLAs and jurisdiction-specific procedures.</div></section>}

 {tab==='builder'&&<section style={box}><h3>Holo Builder</h3><p style={{fontSize:11,color:'#89a5b9'}}>Creator foundation for worlds, apps, storefronts, ads, experiences, workflows and agents.</p><input style={input} value={builderTitle} onChange={e=>setBuilderTitle(e.target.value)}/><div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:8}}>{(['world','app','storefront','ad','experience','workflow','agent'] as const).map(t=><button style={btn} disabled={busy} key={t} onClick={()=>run(()=>createHoloBuilderProject(builderTitle,t),`${t} builder project created.`)}>{t}</button>)}</div></section>}

 {tab==='passport'&&<HoloServicePassportCenter/>}

 {tab==='readiness'&&<section aria-label="HoloServices launch readiness" style={box}>
   <h3>HoloServices — Verified Production Gates</h3>
   <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:14}}>
    <button type="button" style={{...btn,minHeight:56,fontSize:15}} onClick={auditHoloServices}>RUN ONE-PUSH READINESS AUDIT</button>
    <button type="button" disabled={!readinessReport} style={{...btn,minHeight:56,fontSize:15}} onClick={exportReadiness}>DOWNLOAD JSON REPORT</button>
   </div>
   <p role="status" style={{color:'#ffe2a6'}}>{readinessReport?'Audit complete: '+readinessReport.services.length+' service categories assessed. No live provider validations performed.':'No readiness audit has been run in this session.'}</p>

   <p role="status" style={{color:'#ffdea5',lineHeight:1.7}}>All services remain unverified for public production. These results show required evidence, not whether a button exists. No provider approvals, live aircraft, paid advertisements, real rides, deliveries or refunds are implied.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>
    {(Object.keys(HOLO_SERVICE_GATES) as HoloService[]).map(key=>{
     const result=assessHoloService(key,[])
     return <article key={key} style={{...box,borderColor:'#6a5360'}}><h4 style={{margin:'0 0 8px',fontSize:16}}>{HOLO_SERVICE_LABELS[key]}</h4><p style={{margin:'0 0 8px',color:'#ffdea5'}}>{result.passed}/{result.total} externally evidenced gates</p><details><summary style={{cursor:'pointer',minHeight:44}}>What must be verified</summary><ul>{result.missing.map(g=><li key={g}>{g.replace(/([A-Z])/g,' $1')}</li>)}</ul></details></article>
    })}
   </div>
   <p style={{fontSize:12,color:'#aac1d2'}}>Middleverse, Stubbs AI and HoloGPT may explain missing evidence; only authenticated provider records, contractual approvals and independent acceptance results may authorize real service transitions.</p>
  </section>}

 {tab==='holoverse'&&<section style={box}><h3>Holoverse Portal Registry</h3><p style={{fontSize:11,color:'#89a5b9'}}>The Holoverse is the gateway joining worlds and Holo services rather than another disconnected app.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8}}>{portals.map(p=><article style={box} key={p.id}><b>{p.name}</b><div style={{fontSize:10,color:'#52e5ff'}}>{p.destination_type} • {p.age_lane}</div><p style={{fontSize:10,color:'#8299a9'}}>destination: {p.destination_key}</p></article>)}</div></section>}
 </div></div>
}
