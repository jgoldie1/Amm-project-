import {useState} from 'react'

const rows=[
  ['WEB / PWA','HTTPS / TLS ACTIVE','Your TRYAMM web traffic uses ordinary encrypted HTTPS. A PWA cannot create a system-wide VPN.'],
  ['iPHONE / iPAD','NATIVE SETUP REQUIRED','Personal VPN / Network Extension capability, entitlement, native compile and user authorization are required before we can call this a device VPN.'],
  ['ANDROID','NATIVE SETUP REQUIRED','Android VpnService, foreground-service behavior, prominent disclosure, consent and Play Console VPN declaration are required.'],
  ['BUSINESS / AI CAFE','MANAGED TUNNEL TARGET','Managed nodes can use a standards-based tunnel to TRYAMM regional gateways after gateway and credential provisioning.'],
] as const

export default function TryammPrivateRelayCenter({onClose}:{onClose:()=>void}){
  const [mode,setMode]=useState<'tryamm-only'|'full-device'>('tryamm-only')
  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Private Relay" style={{position:'fixed',inset:0,zIndex:10140,overflow:'auto',background:'#030711ee',color:'#fff',padding:18}}>
    <div style={{maxWidth:760,margin:'0 auto',background:'#07111d',border:'1px solid #24465e',borderRadius:22,padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><div><div style={{fontSize:9,letterSpacing:2,color:'#4FE3FF',fontWeight:950}}>TRYAMM NETWORK SECURITY</div><h2 style={{margin:'5px 0 0'}}>Private Relay / VPN</h2></div><button onClick={onClose} style={{width:44,height:44,borderRadius:'50%',background:'#0c1420',border:'1px solid #46637a',color:'#fff'}}>×</button></div>
      <p style={{color:'#aebdcc',lineHeight:1.6}}>Private Relay protects TRYAMM networking. It is separate from Pocket Edge earnings: tunneled traffic is never sold, redirected for ads, or counted as an earning workload.</p>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'12px 0'}}>{(['tryamm-only','full-device'] as const).map(x=><button key={x} onClick={()=>setMode(x)} style={{padding:'9px 11px',borderRadius:10,border:'1px solid #4fe3ff55',background:mode===x?'#123148':'#0b1420',color:'#fff',fontWeight:900}}>{x==='tryamm-only'?'TRYAMM-ONLY TUNNEL':'FULL-DEVICE VPN'}</button>)}</div>
      <div style={{fontSize:10,color:'#ffd98a',marginBottom:12}}>SELECTED DESIGN: {mode.toUpperCase()} • NATIVE TUNNEL NOT YET RELEASE-CERTIFIED</div>
      <div style={{display:'grid',gap:9}}>{rows.map(([name,status,copy])=><div key={name} style={{padding:12,border:'1px solid #1e3549',borderRadius:14,background:'#09131e'}}><div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><strong>{name}</strong><span style={{fontSize:9,color:status.includes('ACTIVE')?'#8fffc1':'#ffe49b'}}>{status}</span></div><div style={{fontSize:11,color:'#9eafc0',lineHeight:1.5,marginTop:6}}>{copy}</div></div>)}</div>
      <div style={{marginTop:12,fontSize:10,color:'#8da0b4'}}>REQUIREMENTS: explicit consent • standard cryptography • minimal logging • gateway failover • no VPN traffic monetization • store declarations/entitlements • native device testing.</div>
    </div>
  </div>
}
