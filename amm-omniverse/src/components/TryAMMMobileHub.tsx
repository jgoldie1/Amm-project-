import { CONNECTION_ENGINE, FRANCHISE_MODEL, MOBILE_CAPABILITIES, RADIO_HUB, TRYAMM_MOBILE, mobileFeatureEnabled } from '../mobile/TryAMMMobilePlatform'

const cyan='#4FE3FF',gold='#E8B944'

export default function TryAMMMobileHub({onClose}:{onClose:()=>void}){
  const enabled=mobileFeatureEnabled()
  return <div role="dialog" aria-label="TRYAMM Mobile" style={{position:'fixed',inset:0,zIndex:12200,overflowY:'auto',background:'radial-gradient(circle at top,#10253a,#04050e 55%,#010205)',color:'#fff',padding:18}}>
    <div style={{maxWidth:1180,margin:'0 auto'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><div><div style={{fontSize:10,color:cyan,letterSpacing:3,fontWeight:900}}>TRYAMM • MOBILE • FRANCHISE • HOLOFON ROADMAP</div><h1 style={{margin:'7px 0'}}>TRYAMM Mobile</h1><p style={{color:'#a9b7c8',maxWidth:820}}>{TRYAMM_MOBILE.truth}</p></div><button aria-label="Close TRYAMM Mobile" onClick={onClose} style={close}>×</button></header>
      <section style={panel}><strong style={{color:enabled?'#7dffb0':'#ffcf66'}}>FEATURE FLAG: {enabled?'ENABLED':'OFF / RELEASE-PROTECTED'}</strong><p style={muted}>The hub may be developed and reviewed while the production launch stays protected. Real telecom actions remain provider/regulatory gated.</p></section>
      <section style={panel}><h2>Network stack</h2><div style={grid}>{MOBILE_CAPABILITIES.map(c=><article key={c.id} style={card}><b>{c.label}</b><small style={{color:gateColor(c.gate),fontWeight:900}}>{c.gate.toUpperCase()}</small><p style={muted}>{c.detail}</p></article>)}</div></section>
      <section style={panel}><h2>Quantum Connection Engine</h2><ol>{CONNECTION_ENGINE.map(x=><li key={x}>{x}</li>)}</ol></section>
      <section style={panel}><h2>Franchise business</h2><div style={grid}>{FRANCHISE_MODEL.tracks.map(x=><article key={x} style={card}><b>{x}</b></article>)}</div><p style={muted}>Operating modules: {FRANCHISE_MODEL.operatingModules.join(' • ')}</p></section>
      <section style={panel}><h2>Radio + communications</h2><div style={grid}>{Object.entries(RADIO_HUB).map(([k,v])=><article key={k} style={card}><b>{k}</b><p style={muted}>{v}</p></article>)}</div></section>
      <section style={panel}><h2>HoloFon pathway</h2><p style={muted}>MVNO/eSIM → secure TRYAMM identity → Quantum WiFi/VPN policy → network telemetry → HoloGPT support → creator/game/live integration → future secure-element hardware → HoloFon prototype → certification → commercial device.</p></section>
    </div>
  </div>
}
const panel={border:'1px solid #25415a',borderRadius:18,padding:16,margin:'14px 0',background:'#08111b'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const card={border:'1px solid #26394d',borderRadius:14,padding:13,background:'#0a1420',display:'grid',gap:6} as const
const muted={color:'#a9b7c8',lineHeight:1.55} as const
const close={width:44,height:44,borderRadius:'50%',border:'1px solid #4a5e73',background:'#0b1320',color:'#fff',fontSize:22} as const
const gateColor=(g:string)=>g==='ready'?'#7dffb0':g==='planned'?'#9aa8ba':g==='regulatory-required'?'#ff9b8d':gold
