import { useMemo, useState } from 'react'

type Props={onClose:()=>void}

type LabMode={id:string;label:string;description:string;route:string;gate:string}

const MODES:LabMode[]=[
  {id:'xr',label:'AR · VR · Mixed Reality Lab',description:'Device-aware WebXR capability, immersive fallback and spatial experience testing.','route':'/xr','gate':'DEVICE'},
  {id:'core',label:'Holo Core Lab',description:'Exercise the canonical Holo Core services, profiles and backend contracts.','route':'/holo-core','gate':'BETA'},
  {id:'services',label:'Holo Services Lab',description:'Test Holo Search, Ride, Delivery, Logistics, Advertising, Lingo, Guardian and Builder workflows.','route':'/holo-services','gate':'BETA'},
  {id:'worlds',label:'Immersive World Lab',description:'Test shared world state, portals, avatars and 2D/3D fallback behavior.','route':'/immersive-worlds','gate':'BETA'},
  {id:'engine',label:'Quantum / Holographic Engine Lab',description:'Exercise simulation, holographic overlays and sandbox-only experimental systems without silently promoting regulated actions.','route':'/quantum-engine','gate':'SANDBOX'},
  {id:'media',label:'Holo Media Lab',description:'Test Holo Music, Holo Video, Reel creation and network publishing surfaces.','route':'/holo-music','gate':'RIGHTS'},
]

export default function HoloLabGateway({onClose}:Props){
  const [note,setNote]=useState('Holo Lab is the safe experimentation gateway. It reuses existing production surfaces instead of creating duplicate engines.')
  const support=useMemo(()=>({webxr:Boolean((navigator as any).xr),secure:window.isSecureContext}),[])
  function nav(path:string){const fn=(window as any).__tryammNavigate;if(typeof fn==='function')fn(path);else window.location.hash=path;onClose()}
  return <div role="dialog" aria-modal="true" aria-label="Holo Lab" style={{position:'fixed',inset:0,zIndex:12300,background:'radial-gradient(circle at 30% 10%,#14293d,#060914 48%,#020309)',color:'#fff',overflowY:'auto',fontFamily:'system-ui,sans-serif'}}>
    <header style={{position:'sticky',top:0,zIndex:3,display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,padding:'14px 18px',background:'#050914ed',borderBottom:'1px solid #4fe3ff44',backdropFilter:'blur(12px)'}}><div><div style={{fontSize:10,letterSpacing:3,color:'#4fe3ff'}}>TRYAMM HOLO LAB</div><h1 style={{margin:'3px 0'}}>Experimentation & Integration Lab</h1><div style={{fontSize:12,opacity:.65}}>Prototype safely → test capability → collect evidence → promote only when gates pass</div></div><button onClick={onClose} style={btn}>CLOSE</button></header>
    <main style={{maxWidth:1100,margin:'0 auto',padding:18,display:'grid',gap:14}}>
      <section style={panel}><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><span style={pill}>HTTPS {support.secure?'READY':'REQUIRED'}</span><span style={pill}>WEBXR {support.webxr?'DETECTED':'FALLBACK'}</span><span style={pill}>HIGH-RISK AUTO-PROMOTION BLOCKED</span></div><p style={{lineHeight:1.55,opacity:.72}}>{note}</p></section>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>{MODES.map(mode=><article key={mode.id} style={panel}><div style={{fontSize:9,color:'#e8b944',fontWeight:900}}>{mode.gate}</div><h2 style={{fontSize:17,margin:'6px 0'}}>{mode.label}</h2><p style={{fontSize:12,opacity:.68,lineHeight:1.5}}>{mode.description}</p><button onClick={()=>nav(mode.route)} style={btn}>OPEN LAB</button></article>)}</section>
      <section style={{...panel,borderColor:'#e8b94455'}}><strong>Promotion policy</strong><p style={{opacity:.7,lineHeight:1.5}}>Lab experiments may retry, fail over and roll back when low risk. Payments, wallets, payouts, identity, permissions, moderation, player inventory, physical drone dispatch and other regulated actions remain gated until tests and human approval are present.</p><button onClick={()=>setNote('Lab boundary verified: experiments can run, but high-impact systems stay fail-closed until evidence exists.')} style={btn}>VERIFY LAB BOUNDARY</button></section>
    </main>
  </div>
}
const panel:React.CSSProperties={padding:16,border:'1px solid #29475d',borderRadius:16,background:'#07101bdd'}
const btn:React.CSSProperties={minHeight:42,padding:'0 14px',border:'1px solid #4fe3ff66',borderRadius:10,background:'#0b2634',color:'#fff',fontWeight:900,cursor:'pointer'}
const pill:React.CSSProperties={padding:'6px 9px',border:'1px solid #31546b',borderRadius:999,fontSize:9,color:'#9fefff'}
