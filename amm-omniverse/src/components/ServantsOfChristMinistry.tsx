import { useState } from 'react'

const card:React.CSSProperties={border:'1px solid #4b4025',borderRadius:18,padding:18,background:'#100e09d9'}
const button:React.CSSProperties={border:'1px solid #8d7740',borderRadius:12,padding:'12px 14px',background:'#211b0e',color:'#fff',fontWeight:900,cursor:'pointer',textDecoration:'none'}

export default function ServantsOfChristMinistry(){
  const [prayer,setPrayer]=useState('')
  const [saved,setSaved]=useState(false)
  const submit=(e:React.FormEvent)=>{e.preventDefault();if(!prayer.trim())return;localStorage.setItem('tryamm_servants_of_christ_prayer_draft',prayer.trim());setSaved(true)}
  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 50% 0,#3b3014 0,#0d0d0b 38%,#030303 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1080,margin:'0 auto',padding:'24px 16px 72px'}}>
      <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href="/" style={button}>TRYAMM HOME</a><a href="/network" style={button}>ALL AMERICAN NETWORK</a><a href="/workstation" style={button}>OMNI WORKSTATION</a><a href="/accessibility" style={button}>ACCESSIBILITY</a></nav>
      <header style={{padding:'68px 0 28px'}}><div style={{fontSize:11,letterSpacing:3,color:'#e8c867',fontWeight:950}}>SERVANTS OF CHRIST • MINISTRY NETWORK</div><h1 style={{fontSize:'clamp(38px,7vw,82px)',lineHeight:.98,margin:'10px 0'}}>Faith, teaching, community and service.</h1><p style={{maxWidth:780,color:'#d1c7aa',fontSize:18,lineHeight:1.65}}>A TRYAMM-connected ministry home for worship, Bible teaching, community events, prayer, accessible media and multilingual participation. Livestream and giving remain provider-gated until verified services are connected.</p></header>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <article style={card}><h2>📺 Sermons & LIVE</h2><p>Watch published teachings and, once a verified streaming provider is connected, ministry livestreams with captions.</p><span>STREAM CONNECTION: BETA</span></article>
        <article style={card}><h2>📖 Bible Study</h2><p>Teaching series, study notes, reading plans and discussion resources designed for screen readers and large-text use.</p><span>CONTENT LIBRARY: READY FOR PUBLISHING</span></article>
        <article style={card}><h2>🗓 Events</h2><p>Worship, study, service projects and community events can be published here and shared across TRYAMM.</p><span>CALENDAR SYNC: BETA</span></article>
        <article style={card}><h2>🌍 Global Access</h2><p>Designed to inherit captions, translation, reduced motion, high contrast, voice control and large touch targets from the TRYAMM accessibility passport.</p><span>ACCESSIBILITY: CONNECTED DESIGN</span></article>
        <article style={card}><h2>📡 Network Channel</h2><p>Servants of Christ can appear as a faith/community channel inside All American Network and Free TV once programming feeds are published.</p><a href="/free-tv" style={button}>OPEN FREE TV</a></article>
        <article style={card}><h2>🏙 StreetVerse</h2><p>A faith/community destination can connect ministry events, service missions and teaching to StreetVerse without claiming a physical church location that has not been verified.</p><a href="/streetverse" style={button}>OPEN STREETVERSE</a></article>
      </section>
      <section style={{...card,marginTop:18}}><h2>Prayer request</h2><p style={{color:'#d1c7aa'}}>This first version saves the request privately on this device as a draft. It does not transmit sensitive prayer information until a secure ministry backend and privacy workflow are connected.</p><form onSubmit={submit}><label htmlFor="prayer">Prayer request</label><textarea id="prayer" value={prayer} onChange={e=>{setPrayer(e.target.value);setSaved(false)}} rows={5} style={{width:'100%',boxSizing:'border-box',margin:'8px 0 10px',borderRadius:12,border:'1px solid #66583a',background:'#080806',color:'#fff',padding:12,fontSize:16}}/><button style={button}>SAVE PRIVATE DRAFT</button>{saved&&<span role="status" style={{marginLeft:12,color:'#9cffb7'}}>Saved on this device.</span>}</form></section>
      <section style={{...card,marginTop:18}}><h2>Giving</h2><p style={{color:'#d1c7aa'}}>Giving is intentionally not activated until a verified ministry payment account, accounting destination, receipt process and legal/tax treatment are configured. No donation is represented as tax-deductible unless that status is actually established.</p><button disabled style={{...button,opacity:.55}}>GIVING SETUP PENDING</button></section>
    </div>
  </main>
}
