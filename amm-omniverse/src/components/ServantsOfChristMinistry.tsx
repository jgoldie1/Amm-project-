import { useEffect, useState } from 'react'
import { installMinistryNetworkRuntime, submitMinistryApplication } from '../runtime/MinistryNetworkRuntime'

const card:React.CSSProperties={border:'1px solid #4b4025',borderRadius:18,padding:18,background:'#100e09d9'}
const button:React.CSSProperties={border:'1px solid #8d7740',borderRadius:12,padding:'12px 14px',background:'#211b0e',color:'#fff',fontWeight:900,cursor:'pointer',textDecoration:'none'}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',margin:'7px 0 10px',borderRadius:12,border:'1px solid #66583a',background:'#080806',color:'#fff',padding:12,fontSize:16}

export default function ServantsOfChristMinistry(){
  const [prayer,setPrayer]=useState('')
  const [saved,setSaved]=useState(false)
  const [org,setOrg]=useState('')
  const [leader,setLeader]=useState('')
  const [email,setEmail]=useState('')
  const [applied,setApplied]=useState(false)
  useEffect(()=>{installMinistryNetworkRuntime()},[])
  const submitPrayer=(e:React.FormEvent)=>{e.preventDefault();if(!prayer.trim())return;localStorage.setItem('tryamm_servants_of_christ_prayer_draft',prayer.trim());setSaved(true)}
  const apply=(e:React.FormEvent)=>{e.preventDefault();if(!org.trim()||!leader.trim())return;const request=submitMinistryApplication({organizationName:org.trim(),leaderName:leader.trim(),email:email.trim()||undefined,taxStatus:'unverified',services:['worship','teaching','community-service','giving']});localStorage.setItem('tryamm_ministry_application_draft',JSON.stringify(request));setApplied(true)}
  return <main style={{minHeight:'100vh',background:'radial-gradient(circle at 50% 0,#3b3014 0,#0d0d0b 38%,#030303 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1080,margin:'0 auto',padding:'24px 16px 72px'}}>
      <nav style={{display:'flex',gap:8,flexWrap:'wrap'}}><a href="/" style={button}>TRYAMM HOME</a><a href="/network" style={button}>ALL AMERICAN NETWORK</a><a href="/workstation" style={button}>OMNI WORKSTATION</a><a href="/accessibility" style={button}>ACCESSIBILITY</a></nav>
      <header style={{padding:'68px 0 28px'}}><div style={{fontSize:11,letterSpacing:3,color:'#e8c867',fontWeight:950}}>SERVANTS OF CHRIST • MINISTRY NETWORK</div><h1 style={{fontSize:'clamp(38px,7vw,82px)',lineHeight:.98,margin:'10px 0'}}>Faith, teaching, community and service.</h1><p style={{maxWidth:820,color:'#d1c7aa',fontSize:18,lineHeight:1.65}}>Servants of Christ is the anchor ministry lane inside TRYAMM, with Pastor Kofi Orfi onboarding as an organization leader and an open pathway for other ministries to register, publish services, participate in LIVE/community programming and receive verified giving or service payments.</p></header>
      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:12}}>
        <article style={card}><h2>👤 Pastor Kofi Orfi</h2><p>Organization registration and payment/tax verification are required before the platform marks the ministry verified or enables public giving.</p><strong>STATUS: REGISTRATION / VERIFICATION REQUIRED</strong></article>
        <article style={card}><h2>⛪ Ministry Network</h2><p>Other ministries can apply to join, create a ministry profile, publish worship/teaching/service events and participate in TRYAMM LIVE and community programming.</p><strong>ONBOARDING LANE: CREATED</strong></article>
        <article style={card}><h2>💝 Giving</h2><p>Verified ministries can receive donations through their own verified payment/accounting destination. A donation is never shown as tax-deductible unless that treatment is verified.</p><strong>PAYMENT PROVIDER: GATED</strong></article>
        <article style={card}><h2>🤝 Ministry Services</h2><p>Ministries may also receive payment for clearly identified services where lawful. Service payments are tracked separately from charitable donations and are not labeled tax-deductible.</p><strong>DONATION / SERVICE SPLIT: ENFORCED</strong></article>
        <article style={card}><h2>📺 Sermons & LIVE</h2><p>Published teachings and verified ministry livestreams can connect to captions, translation, panels, community events and All American Network programming.</p><a href="/live" style={button}>OPEN TRYAMM LIVE</a></article>
        <article style={card}><h2>🏙 StreetVerse</h2><p>Faith/community missions and the Servants of Christ Charity Cup can connect to StreetVerse without claiming any unverified physical location.</p><a href="/streetverse" style={button}>OPEN STREETVERSE</a></article>
      </section>

      <section style={{...card,marginTop:18}}><h2>Join the Ministry Network</h2><p style={{color:'#d1c7aa'}}>This application creates a pending verification request. TRYAMM will not automatically mark any applicant as a 501(c)(3) organization.</p><form onSubmit={apply}><label>Organization name<input value={org} onChange={e=>{setOrg(e.target.value);setApplied(false)}} style={input}/></label><label>Pastor / ministry leader<input value={leader} onChange={e=>{setLeader(e.target.value);setApplied(false)}} style={input}/></label><label>Contact email<input type="email" value={email} onChange={e=>{setEmail(e.target.value);setApplied(false)}} style={input}/></label><button style={button}>SAVE MINISTRY APPLICATION</button>{applied&&<span role="status" style={{marginLeft:12,color:'#9cffb7'}}>Application saved pending verification.</span>}</form></section>

      <section style={{...card,marginTop:18}}><h2>Prayer request</h2><p style={{color:'#d1c7aa'}}>This version saves the request privately on this device as a draft. It does not transmit sensitive prayer information until a secure ministry backend and privacy workflow are connected.</p><form onSubmit={submitPrayer}><label htmlFor="prayer">Prayer request</label><textarea id="prayer" value={prayer} onChange={e=>{setPrayer(e.target.value);setSaved(false)}} rows={5} style={input}/><button style={button}>SAVE PRIVATE DRAFT</button>{saved&&<span role="status" style={{marginLeft:12,color:'#9cffb7'}}>Saved on this device.</span>}</form></section>

      <section style={{...card,marginTop:18}}><h2>Giving & service payments</h2><p style={{color:'#d1c7aa'}}>Giving remains disabled until the receiving ministry has a verified payment account, accounting destination, receipt workflow and legal/tax classification. When activated, charitable giving and paid ministry services will use separate transaction types so donor funds are not mixed with platform service revenue.</p><div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button disabled style={{...button,opacity:.55}}>DONATIONS • VERIFICATION REQUIRED</button><button disabled style={{...button,opacity:.55}}>SERVICE PAYMENTS • VERIFICATION REQUIRED</button></div></section>

      <section style={{...card,marginTop:18,borderColor:'#a88938'}}><h2>Race / platform ministry allocation</h2><p style={{color:'#d1c7aa'}}>The separate Servants of Christ platform service/ministry allocation remains distinct from Kenosha-family beneficiary allocations and from donor-restricted gifts. The proposed current operating rule is 10% of verified net distributable eligible race/service revenue, subject to the final server-side settlement schedule and applicable accounting/legal review.</p></section>
    </div>
  </main>
}
