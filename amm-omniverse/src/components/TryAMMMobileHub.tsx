import { CONNECTION_ENGINE, FRANCHISE_MODEL, MOBILE_CAPABILITIES, RADIO_HUB, TRYAMM_MOBILE, mobileFeatureEnabled } from '../mobile/TryAMMMobilePlatform'
import { AGENCY_EARNING_PATH, FAMILY_CODE_MODEL, FAMILY_EARNING_PATH, MOBILE_BRANDS, MONEY_SAFETY_PIPELINE, REBATE_RULES, YOUTH_ACCOUNT_RULES } from '../mobile/MobileBusinessEngine'
import { JACOBIE_VISION_SECURITY, JACOBIE_VISION_PATH } from '../mobile/JacobieVisionSecurity'

const cyan='#4FE3FF',gold='#E8B944'
export default function TryAMMMobileHub({onClose}:{onClose:()=>void}){
 const enabled=mobileFeatureEnabled()
 return <div role="dialog" aria-label="TRYAMM Mobile" style={{position:'fixed',inset:0,zIndex:12200,overflowY:'auto',background:'radial-gradient(circle at top,#10253a,#04050e 55%,#010205)',color:'#fff',padding:18}}><div style={{maxWidth:1180,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:cyan,letterSpacing:3,fontWeight:900}}>TRYAMM • ALL AMERICAN MOBILE • JACOBIE VISION • FRANCHISE • HOLOFON</div><h1 style={{margin:'7px 0'}}>TRYAMM Mobile + All American Mobile</h1><p style={{color:'#a9b7c8',maxWidth:820}}>{TRYAMM_MOBILE.truth}</p></div><button aria-label="Close TRYAMM Mobile" onClick={onClose} style={close}>×</button></header>
  <section style={panel}><strong style={{color:enabled?'#7dffb0':'#ffcf66'}}>FEATURE FLAG: {enabled?'ENABLED':'OFF / RELEASE-PROTECTED'}</strong><p style={muted}>Development can continue without exposing unapproved telecom actions. Real carrier, eSIM, NTN and hardware actions remain provider/regulatory gated.</p></section>
  <section style={panel}><h2>Two wireless brands</h2><div style={grid}>{Object.values(MOBILE_BRANDS).map(b=><article key={b.name} style={card}><b>{b.name}</b><p style={muted}>{b.position}</p></article>)}</div></section>
  <section style={panel}><h2>Jacobie Vision Cybersecurity</h2><p style={muted}>{JACOBIE_VISION_SECURITY.purpose}</p><div style={grid}>{JACOBIE_VISION_SECURITY.controls.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Operations: {JACOBIE_VISION_SECURITY.operations.join(' • ')}</p><p style={{...muted,color:'#ffcf66'}}>{JACOBIE_VISION_SECURITY.truth}</p><small>{JACOBIE_VISION_PATH}</small></section>
  <section style={panel}><h2>Network stack</h2><div style={grid}>{MOBILE_CAPABILITIES.map(c=><article key={c.id} style={card}><b>{c.label}</b><small style={{color:gateColor(c.gate),fontWeight:900}}>{c.gate.toUpperCase()}</small><p style={muted}>{c.detail}</p></article>)}</div></section>
  <section style={panel}><h2>Quantum Connection Engine</h2><ol>{CONNECTION_ENGINE.map(x=><li key={x}>{x}</li>)}</ol></section>
  <section style={panel}><h2>Agency earning lane</h2><p style={muted}>{AGENCY_EARNING_PATH.purpose}</p><div style={grid}>{AGENCY_EARNING_PATH.earningEvents.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Controls: {AGENCY_EARNING_PATH.controls.join(' • ')}</p></section>
  <section style={panel}><h2>Family earning lane</h2><p style={muted}>{FAMILY_EARNING_PATH.purpose}</p><div style={grid}>{FAMILY_EARNING_PATH.earningEvents.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Allocation: {FAMILY_EARNING_PATH.allocation.join(' • ')}</p></section>
  <section style={panel}><h2>Youth / kids accounts</h2><p style={muted}>Guardian-managed lane. Youth can participate in age-appropriate learning, creator, sports/game and family growth programs while adult contracting, telecom ownership and unrestricted cash-out stay blocked.</p><div style={grid}>{YOUTH_ACCOUNT_RULES.earningEvents.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Safety: {YOUTH_ACCOUNT_RULES.principles.join(' • ')}</p></section>
  <section style={panel}><h2>Family + agency codes</h2><p style={muted}>{FAMILY_CODE_MODEL.adultCodes}</p><p style={muted}>{FAMILY_CODE_MODEL.youthCodes}</p><p style={muted}>{FAMILY_CODE_MODEL.splitRule}</p></section>
  <section style={panel}><h2>Rebates + rewards</h2><div style={grid}>{REBATE_RULES.map(r=><article key={r.id} style={card}><b>{r.label}</b><p style={muted}>{r.trigger}</p><small>{r.reward}</small></article>)}</div><p style={{...muted,color:'#ffcf66'}}>{MONEY_SAFETY_PIPELINE}</p></section>
  <section style={panel}><h2>Franchise business</h2><div style={grid}>{FRANCHISE_MODEL.tracks.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Operating modules: {FRANCHISE_MODEL.operatingModules.join(' • ')}</p></section>
  <section style={panel}><h2>Radio + communications</h2><div style={grid}>{Object.entries(RADIO_HUB).map(([k,v])=><article key={k} style={card}><b>{k}</b><p style={muted}>{v}</p></article>)}</div></section>
  <section style={panel}><h2>HoloFon pathway</h2><p style={muted}>MVNO/eSIM → secure TRYAMM identity → Jacobie Vision device trust → Quantum WiFi/VPN policy → network telemetry → HoloGPT support → creator/game/live integration → future secure-element hardware → HoloFon prototype → certification → commercial device.</p></section>
 </div></div>
}
const panel={border:'1px solid #25415a',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:6} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
const gateColor=(g:string)=>g==='ready'?'#7dffb0':g==='planned'?'#9aa8ba':g==='regulatory-required'?'#ff9b8d':gold
