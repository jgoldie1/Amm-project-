import { useMemo } from 'react'
import { buildFounderCockpit, calculateEngine, rankRevenueEngines, type RevenueEngine } from '../services/founderRevenueCockpit'

type Props = { onClose: () => void }

const engineLabels: Record<RevenueEngine, string> = {
  live_creator: 'LIVE + Creator', marketplace: 'Marketplace', hologpt: 'HoloGPT', holoforge: 'HoloForge',
  media_distribution: 'Media Distribution', propertyverse: 'PropertyVerse', mobility: 'Mobility',
  fractional_services: 'Fractional Services', education: 'All American University', faith_services: 'Faith Services',
  ai_call_center: 'AI Call Center', advertising: 'Advertising', enterprise_government: 'Enterprise + Government',
  manufacturing: 'Manufacturing',
}

const zeroEngines = (Object.keys(engineLabels) as RevenueEngine[]).map(engine => calculateEngine({
  engine, grossVolume: 0, grossRevenue: 0, providerFees: 0, refunds: 0, chargebacks: 0, reserves: 0,
  taxesCollected: 0, creatorPartnerPayables: 0, infrastructureCost: 0, otherDirectCost: 0,
  transactions: 0, activeCustomers: 0, payingCustomers: 0, currency: 'USD',
}))

const money = (n:number) => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n)

export default function FounderRevenueCockpit({ onClose }: Props) {
  const snapshot = useMemo(() => buildFounderCockpit(zeroEngines, 'YELLOW', 'unavailable'), [])
  const ranked = rankRevenueEngines(snapshot)
  const cards = [
    ['Gross Volume', snapshot.grossVolume], ['Gross Revenue', snapshot.grossRevenue], ['Net Revenue', snapshot.netRevenue],
    ['Contribution Margin', snapshot.contributionMargin], ['Available to Reinvest', snapshot.cashAvailableToReinvest],
    ['Creator/Partner Payables', snapshot.creatorPartnerPayables],
  ] as const

  return <div role="dialog" aria-label="Founder Revenue Cockpit" style={{position:'fixed',inset:0,zIndex:10040,overflowY:'auto',background:'radial-gradient(circle at 15% 0%,#10283a,#03050c 48%,#020208)',color:'#fff',padding:18,fontFamily:'system-ui,sans-serif'}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'flex-start',marginBottom:18}}>
        <div><div style={{color:'#4fe3ff',fontWeight:900,letterSpacing:3,fontSize:11}}>TRYAMM FOUNDER OS</div><h1 style={{margin:'5px 0',fontSize:'clamp(26px,5vw,48px)'}}>Revenue Cockpit</h1><div style={{color:'#9fb0c6'}}>REVENUE COCKPIT → MONEY ENGINE → PAYABLES → CASH FLOW → BUSINESS PERFORMANCE → RELEASE HEALTH</div></div>
        <button onClick={onClose} aria-label="Close Founder Revenue Cockpit" style={{border:'1px solid #41546b',background:'#0c1420',color:'#fff',borderRadius:999,width:42,height:42,fontSize:20,cursor:'pointer'}}>×</button>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}><span style={{padding:'7px 10px',borderRadius:999,background:'#3c310b',color:'#ffe47a',fontWeight:900}}>RELEASE {snapshot.releaseGate}</span><span style={{padding:'7px 10px',borderRadius:999,background:'#111a26',color:'#9fb0c6'}}>DATA: {snapshot.source.replaceAll('_',' ').toUpperCase()}</span>{snapshot.topCashCow&&<span style={{padding:'7px 10px',borderRadius:999,background:'#0d2820',color:'#85ffc0',fontWeight:900}}>CASH COW: {engineLabels[snapshot.topCashCow]}</span>}</div>
      {snapshot.source==='unavailable' && <div role="status" style={{border:'1px solid #e8b94466',background:'#2b210b99',padding:14,borderRadius:14,marginBottom:16,color:'#ffe8a3'}}>Live Money Engine reporting is not connected yet. Values remain zero instead of showing invented revenue. Connect the authoritative reporting API after reconciliation and Quantum Money Sandbox evidence pass.</div>}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginBottom:18}}>{cards.map(([label,value])=><div key={label} style={{background:'#08111ddd',border:'1px solid #18324a',borderRadius:16,padding:15}}><div style={{fontSize:10,color:'#7f95ad',fontWeight:900,letterSpacing:1}}>{label.toUpperCase()}</div><div style={{fontSize:25,fontWeight:950,marginTop:7}}>{money(value)}</div></div>)}</div>
      <section style={{background:'#070d16dd',border:'1px solid #17283a',borderRadius:18,padding:16,marginBottom:18}}><h2 style={{marginTop:0}}>Revenue engines</h2><div style={{overflowX:'auto'}}><table style={{width:'100%',borderCollapse:'collapse',minWidth:820}}><thead><tr>{['Engine','GMV','Revenue','Payables','Provider/Direct','Contribution','Margin','Customers'].map(x=><th key={x} style={{textAlign:'left',padding:'9px 7px',borderBottom:'1px solid #243244',fontSize:10,color:'#8297ae'}}>{x}</th>)}</tr></thead><tbody>{ranked.map(e=><tr key={e.engine}><td style={{padding:9,fontWeight:850}}>{engineLabels[e.engine]}</td><td>{money(e.grossVolume)}</td><td>{money(e.grossRevenue)}</td><td>{money(e.creatorPartnerPayables)}</td><td>{money(e.providerFees+e.infrastructureCost+e.otherDirectCost)}</td><td>{money(e.contributionMargin)}</td><td>{Math.round(e.contributionMarginPct*100)}%</td><td>{e.payingCustomers}/{e.activeCustomers}</td></tr>)}</tbody></table></div></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:12}}><div style={{background:'#07131a',border:'1px solid #174151',borderRadius:18,padding:16}}><h3>Founder decision loop</h3><div style={{lineHeight:1.8,color:'#b8c6d6'}}>ACQUIRE → ENGAGE → CREATE → TRANSACT → RETAIN → MEASURE → REINVEST → CREATE AGAIN</div></div><div style={{background:'#111008',border:'1px solid #544617',borderRadius:18,padding:16}}><h3>Money safety</h3><div style={{lineHeight:1.8,color:'#d6ccb0'}}>Money Engine → double-entry ledger → Internal Blockchain evidence → Quantum Money Sandbox → audit. Customer principal, ministry offerings, escrow/custody balances and regulated assets are never TRYAMM operating revenue.</div></div></section>
    </div>
  </div>
}
