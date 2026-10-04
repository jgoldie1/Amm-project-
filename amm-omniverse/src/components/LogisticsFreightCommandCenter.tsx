import {useEffect,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {FREIGHT_FLOW,type FreightMode} from '../logistics/freightNetwork'
import FleetOwnerOperatorCenter from './FleetOwnerOperatorCenter'

export default function LogisticsFreightCommandCenter({onClose}:{onClose:()=>void}){
 const [origin,setOrigin]=useState('Supplier / Virtual Warehouse')
 const [destination,setDestination]=useState('Customer / Business')
 const [mode,setMode]=useState<FreightMode>('ltl')
 const [weight,setWeight]=useState(500)
 const [status,setStatus]=useState('Stubbs AI + Lyons Tech + Middleverse AI logistics fabric ready for planning.')
 const [ready,setReady]=useState<any>(null)
 const check=async()=>{try{const token=await getAccessToken();if(!token)throw new Error('Sign in required');const r=await fetch('/api/logistics/freight-readiness',{headers:{Authorization:'Bearer '+token}});const d=await r.json();if(!r.ok)throw new Error(d.error||'Readiness failed');setReady(d);setStatus(d.canExternallyBookFreight?'A live freight broker/3PL rail is available.':'Freight planning is ready; external booking is still gated.')}catch(e:any){setStatus(e.message||String(e))}}
 useEffect(()=>{void check()},[])
 const plan=()=>{const id='freight-'+Date.now();window.__TRYAMM_OPERATING_FABRIC__?.route({id,domain:'freight',action:'plan-shipment',priority:'routine',payload:{origin,destination,mode,weightLb:weight},requiresHumanApproval:true});window.dispatchEvent(new CustomEvent('tryamm:freight-plan-created',{detail:{id,origin,destination,mode,weightLb:weight,state:'draft',externalBookingConfirmed:false}}));setStatus('Draft freight plan created. No carrier was booked.')} 
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Logistics and Freight Command Center" style={{position:'fixed',inset:0,zIndex:17300,background:'#020711f8',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}><div style={{maxWidth:1100,margin:'0 auto',padding:'18px 14px 72px'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,letterSpacing:3,color:'#64e7ff',fontWeight:950}}>STUBBS AI • LYONS TECH • MIDDLEVERSE AI</div><h1 style={{margin:'5px 0'}}>LOGISTICS + FREIGHT COMMAND</h1><div style={{fontSize:12,color:'#9fb4c4'}}>Quantum Source • Virtual Warehouse • Holo Delivery • 3PL • freight • workforce • Proof Tracking • settlement.</div></div><button onClick={onClose} style={close}>×</button></header>
  <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:16}}>
   <article style={panel}><b>STUBBS AI</b><p style={copy}>Business intent, priorities, exceptions, policy gates and performance decisions.</p></article>
   <article style={panel}><b>LYONS TECH</b><p style={copy}>Routing, integrations, telemetry, carrier/3PL adapters, warehouse and freight operating technology.</p></article>
   <article style={panel}><b>MIDDLEVERSE AI</b><p style={copy}>Jobs, workers, AI agents, handoffs, training, QA and context preservation.</p></article>
  </section>
  <section style={{...panel,marginTop:12}}><h2>Plan freight</h2><input value={origin} onChange={e=>setOrigin(e.target.value)} style={input}/><input value={destination} onChange={e=>setDestination(e.target.value)} style={input}/><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}><select value={mode} onChange={e=>setMode(e.target.value as FreightMode)} style={input}>{['parcel','ltl','ftl','intermodal','air','ocean','local'].map(x=><option key={x}>{x}</option>)}</select><input type="number" min="1" value={weight} onChange={e=>setWeight(Math.max(1,Number(e.target.value)||1))} style={input}/></div><button onClick={plan} style={button}>CREATE DRAFT FREIGHT PLAN</button></section>
  <section style={{...panel,marginTop:12}}><h2>Freight execution chain</h2><div style={{display:'grid',gap:6}}>{FREIGHT_FLOW.map((step,i)=><div key={step} style={{fontSize:11,color:'#c8d6df'}}><b style={{color:'#e8b944'}}>{String(i+1).padStart(2,'0')}</b> • {step}</div>)}</div></section>
  <FleetOwnerOperatorCenter />
  <section style={{...panel,marginTop:12}}><h2>External readiness</h2><p style={copy}>{ready?.canExternallyBookFreight?'Freight broker/3PL production rail detected.':'No verified live broker/3PL booking rail is confirmed yet.'}</p><button onClick={check} style={button}>REFRESH READINESS</button></section>
  <div role="status" aria-live="polite" style={{marginTop:12,color:'#b9d2df',fontSize:11}}>{status}</div>
 </div></div>
}
const panel:React.CSSProperties={background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const copy:React.CSSProperties={fontSize:11,color:'#9fb4c4',lineHeight:1.6}
const input:React.CSSProperties={minHeight:44,boxSizing:'border-box',width:'100%',marginTop:7,border:'1px solid #36536a',borderRadius:10,background:'#07111d',color:'#fff',padding:'0 10px'}
const button:React.CSSProperties={minHeight:44,marginTop:10,border:'1px solid #4fe3ff77',borderRadius:10,background:'#0b2633',color:'#fff',fontWeight:900,padding:'0 12px'}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #36536a',background:'#0a1622',color:'#fff',fontSize:24}