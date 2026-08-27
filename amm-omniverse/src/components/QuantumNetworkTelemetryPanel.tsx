import { useMemo } from 'react'
import { getQuantumBackboneHealth, summarizeBackboneHealth } from '../services/networkTelemetry'
import { listCTVProviders } from '../services/ctvProvider'
import { getCTVRevenueSummary, listCTVAttributionEvents, listCTVSettlements } from '../services/ctvCommerceAttribution'
import { listPaymentAuthorizations, listPaymentRails } from '../runtime/QuantumPaymentNetwork'
import { deploymentEvidenceReady, getDeploymentEvidence } from '../services/releaseEvidence'

export default function QuantumNetworkTelemetryPanel(){
 const rows=useMemo(()=>getQuantumBackboneHealth(),[]),summary=useMemo(()=>summarizeBackboneHealth(rows),[rows])
 const providers=useMemo(()=>listCTVProviders(),[]),events=useMemo(()=>listCTVAttributionEvents(),[]),settlements=useMemo(()=>listCTVSettlements(),[]),revenue=useMemo(()=>getCTVRevenueSummary(),[])
 const rails=useMemo(()=>listPaymentRails(),[]),authorizations=useMemo(()=>listPaymentAuthorizations(),[]),evidence=useMemo(()=>getDeploymentEvidence(),[])
 const green=summary.releaseReady&&deploymentEvidenceReady(evidence)
 const stateColor=(s:string)=>s==='live'||s==='verified'?'#78ffb4':s==='degraded'?'#ffb86b':s==='gated'||s==='reported'?'#e8b944':'#ff6b7a'
 const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(n/100)
 return <section style={{marginTop:14}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'end',flexWrap:'wrap'}}><div><div style={{fontSize:9,color:'#4fe3ff',fontWeight:900,letterSpacing:2}}>COMMAND NEXUS TELEMETRY</div><h3 style={{margin:'5px 0'}}>Quantum Network + revenue operations</h3></div><div style={{fontSize:10,color:green?'#78ffb4':'#e8b944',fontWeight:900}}>{green?'FULL GREEN':'GATED / VERIFY'} • {summary.live}/{summary.total} SERVICES LIVE</div></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:9}}>{rows.map(r=><article key={r.key} style={{background:'#07131d',border:'1px solid #21415a',borderRadius:13,padding:11}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:10}}>{r.label}</b><span style={{fontSize:8,color:stateColor(r.state),fontWeight:900}}>{r.state.toUpperCase()}</span></div><div style={{fontSize:9,color:'#8099aa',marginTop:7,lineHeight:1.5}}>{r.detail}</div></article>)}</div>
  <h4 style={{margin:'16px 0 8px'}}>CTV → Commerce → Wallet</h4><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:9}}>{[
   ['CTV providers',`${providers.filter(p=>p.isConfigured()).length}/${providers.length} configured`],['Attribution events',String(events.length)],['Verified orders',String(settlements.length)],['Gross attributed',money(revenue.grossMinor)],['Platform share',money(revenue.platformMinor)],['Payment rails',rails.map(r=>`${r.key}:${r.status}`).join(' • ')||'none'],['Payment authorizations',String(authorizations.length)]
  ].map(([a,b])=><article key={a} style={{background:'#07131d',border:'1px solid #21415a',borderRadius:13,padding:11}}><b style={{fontSize:9,color:'#9db3c1'}}>{a}</b><div style={{fontSize:11,color:'#fff',marginTop:7,wordBreak:'break-word'}}>{b}</div></article>)}</div>
  <div style={{marginTop:10,background:'#06131d',border:'1px solid #21415a',borderRadius:13,padding:12}}><b style={{fontSize:9,color:'#4fe3ff'}}>LATEST ATTRIBUTION</b>{events.length?events.slice(0,6).map(e=><div key={e.id} style={{fontSize:9,color:'#9db0bd',padding:'7px 0',borderBottom:'1px solid #153042'}}>{e.campaignId} • {e.provider} • {e.type} • session {e.sessionId}{e.orderId?` • order ${e.orderId}`:''}</div>):<div style={{fontSize:9,color:'#758b99',marginTop:8}}>No verified attribution events yet.</div>}</div>
  <h4 style={{margin:'16px 0 8px'}}>Deployment evidence</h4><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:9}}>{evidence.map(e=><article key={e.key} style={{background:'#07131d',border:'1px solid #21415a',borderRadius:13,padding:11}}><div style={{display:'flex',justifyContent:'space-between',gap:8}}><b style={{fontSize:9}}>{e.label}</b><span style={{fontSize:8,color:stateColor(e.state),fontWeight:900}}>{e.state.toUpperCase()}</span></div><div style={{fontSize:9,color:'#8099aa',marginTop:7,wordBreak:'break-all'}}>{e.value}</div></article>)}</div>
  <div style={{marginTop:10,padding:12,border:'1px solid #4fe3ff44',borderRadius:13,background:'#061823',fontSize:10,color:'#a9bec9',lineHeight:1.7}}><b style={{color:'#4fe3ff'}}>Observable revenue path:</b> HOLO ADS → CTV ROUTER → VERIFIED PROVIDER → CAMPAIGN / IMPRESSION / QR / CLICK IDs → TRYAMM COMMERCE → VERIFIED ORDER ID → PAYMENT INTENT / RAIL → WALLET / LEDGER. Empty or unverified stages remain visible as gated rather than being counted as revenue.</div>
 </section>
}
