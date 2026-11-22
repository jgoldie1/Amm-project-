import {useState} from 'react'
import {BRIDGES,buildMissionIntegrationReport} from '../foundation/streetverseIntegrationRegistry.js'
const button={minHeight:58,borderRadius:13,padding:'12px 16px',border:'2px solid #74d5ff',background:'#164a68',color:'white',fontSize:17,fontWeight:850,cursor:'pointer',textDecoration:'none',display:'inline-flex',alignItems:'center',justifyContent:'center'} as const
export default function StreetVerseIntegrationCenter(){
 const [report,setReport]=useState<ReturnType<typeof buildMissionIntegrationReport>|null>(null)
 const run=()=>{
  let hasLocalStorage=false
  try{const key='tryamm:integration:storage-check';localStorage.setItem(key,'1');hasLocalStorage=localStorage.getItem(key)==='1';localStorage.removeItem(key)}catch{/* storage unavailable */}
  setReport(buildMissionIntegrationReport({hasLocalStorage,hasDownload:typeof Blob==='function'&&typeof URL.createObjectURL==='function'}))
 }
 const download=()=>{
  if(!report)return
  const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='StreetVerse_Integration_Readiness.json'
  document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
 }
 return <main style={{minHeight:'100vh',background:'linear-gradient(#0b1730,#03070f)',color:'#eff8ff',padding:'20px 12px 60px',fontFamily:'system-ui'}}>
 <div style={{maxWidth:920,margin:'auto'}}>
 <header style={{display:'flex',gap:12,justifyContent:'space-between',flexWrap:'wrap',alignItems:'center'}}>
 <strong style={{color:'#ffe3a3'}}>TRYAMM LLC • SYSTEM INTEGRATION</strong><a href="/" style={button}>HOME</a>
 </header>
 <h1 style={{fontSize:'clamp(28px,6vw,44px)',marginBottom:10}}>StreetVerse Integration Center</h1>
 <p style={{fontSize:17,lineHeight:1.6}}>One place to launch the ten connected TRYAMM product areas, inspect outstanding acceptance gates and export a truthful readiness report.</p>
 <div style={{display:'flex',gap:12,flexWrap:'wrap',margin:'20px 0'}}>
 <button type="button" style={button} onClick={run}>RUN INTEGRATION AUDIT</button>
 <button type="button" style={{...button,opacity:report?1:.6}} disabled={!report} onClick={download}>DOWNLOAD JSON REPORT</button>
 </div>
 <p role="status" aria-live="polite" style={{color:'#ffd889'}}>{report?'Report prepared: browser capabilities inspected. No 3D, cloud, payment, or LIVE service was automatically verified.':'Press RUN INTEGRATION AUDIT to check local capabilities and generate a readiness report.'}</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(270px,1fr))',gap:12}}>
 {BRIDGES.map(x=><section key={x.id} style={{border:'1px solid #396582',background:'#132740',padding:16,borderRadius:14}}>
 <h2 style={{fontSize:20,margin:'0 0 8px'}}>{x.name}</h2>
 <p style={{fontSize:14,color:'#a9d1ed'}}>Current evidence: {x.scope}</p>
 <p style={{fontSize:15,lineHeight:1.6}}><strong>Needs verification:</strong> {x.acceptance}</p>
 <a href={x.path} style={button}>OPEN {x.name.toUpperCase()}</a>
 </section>)}
 </div>
 <p style={{marginTop:22,fontSize:14,color:'#bdcedd',lineHeight:1.6}}>An integration audit is not a proof of production deployment, real money, clinical training, 911 service, actual game animation or valid artist licensing. All game modes and stories are original TRYAMM properties; third-party brands and real agencies do not endorse this experience.</p>
 </div></main>
}