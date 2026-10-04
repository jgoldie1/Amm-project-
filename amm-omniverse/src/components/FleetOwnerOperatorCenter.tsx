import {useState} from 'react'
import {FLEET_MANAGEMENT_FLOW} from '../logistics/fleetManagement'
import {OWNER_OPERATOR_FLOW,type OwnerOperatorProfile,type LoadOffer} from '../logistics/ownerOperatorNetwork'

export default function FleetOwnerOperatorCenter(){
 const [tab,setTab]=useState<'fleet'|'owner'>('fleet')
 const [status,setStatus]=useState('Transportation network ready for planning. Real dispatch remains provider-confirmed.')
 const sampleProfile:OwnerOperatorProfile={id:'owner-demo',userId:'demo',businessName:'Independent Trucker',verification:'draft',equipment:['tractor'],preferredModes:['ftl','local'],preferredLanes:['Chicago → Midwest'],insuranceVerified:false,authorityVerified:false,identityVerified:false,acceptsHazmat:false,coldChainCapable:false,active:true}
 const offer:LoadOffer={id:'load-demo',shipmentId:'shipment-demo',origin:'Virtual Warehouse',destination:'Business / Customer',mode:'ftl',weightLb:18000,rateMinor:0,currency:'USD',state:'offered',authoritativeRate:false,externalBookingConfirmed:false}
 const publishProfile=()=>{window.__TRYAMM_TRANSPORT_NETWORK__?.publishOwnerOperator(sampleProfile);setStatus('Owner-operator draft published for onboarding. No authority or insurance was assumed.')}
 const publishOffer=()=>{window.__TRYAMM_TRANSPORT_NETWORK__?.publishLoadOffer(offer);setStatus('Demo load offer sent into Middleverse matching. Rate remains non-authoritative and cannot be booked.')}
 return <section style={panel}>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={button} onClick={()=>setTab('fleet')}>FLEET MANAGEMENT</button><button style={button} onClick={()=>setTab('owner')}>INDEPENDENT TRUCKER</button></div>
  {tab==='fleet'&&<div style={{marginTop:12}}><h2>Transportation Fleet Management</h2><p style={copy}>Tractors, trailers, box trucks, vans, drivers, inspections, maintenance, utilization, dispatch, fuel/charging, BOL/POD and settlement readiness.</p><div style={{display:'grid',gap:6}}>{FLEET_MANAGEMENT_FLOW.map((x,i)=><div key={x} style={step}><b>{String(i+1).padStart(2,'0')}</b> • {x}</div>)}</div></div>}
  {tab==='owner'&&<div style={{marginTop:12}}><h2>Independent Trucker / Owner-Operator</h2><p style={copy}>An owner-operator can build a profile, add equipment and lanes, receive matched loads, review terms, accept or decline, provide BOL/POD and track settlement status. Real operating authority, insurance and booking must be verified externally.</p><div style={{display:'grid',gap:6}}>{OWNER_OPERATOR_FLOW.map((x,i)=><div key={x} style={step}><b>{String(i+1).padStart(2,'0')}</b> • {x}</div>)}</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}><button style={button} onClick={publishProfile}>CREATE DRAFT OWNER-OPERATOR</button><button style={button} onClick={publishOffer}>SEND DEMO LOAD OFFER</button></div></div>}
  <div role="status" style={{marginTop:10,fontSize:11,color:'#a9c1cf'}}>{status}</div>
 </section>
}
const panel:React.CSSProperties={marginTop:12,background:'#07111ddd',border:'1px solid #20394b',borderRadius:16,padding:14}
const copy:React.CSSProperties={fontSize:11,color:'#9fb4c4',lineHeight:1.6}
const button:React.CSSProperties={minHeight:44,border:'1px solid #4fe3ff77',borderRadius:10,background:'#0b2633',color:'#fff',fontWeight:900,padding:'0 12px'}
const step:React.CSSProperties={padding:8,border:'1px solid #183448',borderRadius:9,background:'#050d16',fontSize:11,color:'#c7d8e2'}