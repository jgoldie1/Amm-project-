import {useEffect,useMemo,useState} from 'react'
import {
  ALL_AMERICAN_NEWS_DESKS,
  CRYPTO_EDUCATION_RULES,
  DEFAULT_NEWSROOM_SCHEDULE,
  HOST_SCOUT_THRESHOLDS,
  NEWSROOM_TEAM,
  type HostCandidate,
  type NewsroomState,
} from '../runtime/AllAmericanNewsroomRuntime'

const phaseCopy={
  BOOTSTRAP:'Use AI-labeled house hosts + producer assistance while building consistent programming and audience.',
  SCOUT:'Verified traffic reached the scout gate. Surface active TRYAMM creators as correspondent/host prospects.',
  AUDITION:'Verified traffic supports auditions, trial segments and producer-reviewed host tests.',
  ROSTER:'Verified traffic supports a recurring real-host roster and scheduled shifts alongside AI production assistants.',
} as const

export default function AllAmericanNewsroomCenter(){
  const [state,setState]=useState<NewsroomState>({
    trafficPhase:'BOOTSTRAP',
    metrics:null,
    candidates:[],
    schedule:DEFAULT_NEWSROOM_SCHEDULE,
    updatedAt:new Date().toISOString(),
  })
  const [tab,setTab]=useState<'desk'|'schedule'|'hosts'|'crypto'>('desk')

  useEffect(()=>{
    const onState=(event:Event)=>setState((event as CustomEvent<NewsroomState>).detail||state)
    addEventListener('tryamm:all-american-newsroom-state',onState)
    dispatchEvent(new Event('tryamm:all-american-newsroom-request'))
    return()=>removeEventListener('tryamm:all-american-newsroom-state',onState)
  },[])

  const invited=useMemo(()=>state.candidates.filter(x=>x.phase!=='candidate').length,[state.candidates])

  const invite=(candidate:HostCandidate)=>{
    dispatchEvent(new CustomEvent('tryamm:network-host-invite',{detail:{userId:candidate.userId}}))
  }

  const advance=(candidate:HostCandidate,phase:HostCandidate['phase'])=>{
    dispatchEvent(new CustomEvent('tryamm:network-host-stage',{detail:{userId:candidate.userId,phase}}))
  }

  const openStudio=()=>{window.location.href='/network/studio'}

  return <main style={page}>
    <header style={header}>
      <div>
        <div style={eyebrow}>ALL AMERICAN NETWORK • NEWSROOM OS</div>
        <h1 style={{margin:'5px 0',fontSize:'clamp(34px,7vw,68px)'}}>News Team + Host Scout</h1>
        <p style={lead}>AI-assisted house programming now. Real correspondents and hosts graduate in as verified audience traffic grows.</p>
      </div>
      <div style={{display:'flex',gap:7,flexWrap:'wrap'}}>
        <a href="/network" style={button}>NETWORK</a>
        <button onClick={openStudio} style={button}>OPEN STUDIO</button>
      </div>
    </header>

    <section style={statusGrid}>
      <article style={statusCard}><span>TRAFFIC PHASE</span><b>{state.trafficPhase}</b><small>{phaseCopy[state.trafficPhase]}</small></article>
      <article style={statusCard}><span>VERIFIED WEEKLY VIEWERS</span><b>{state.metrics?state.metrics.weeklyUniqueViewers.toLocaleString():'—'}</b><small>{state.metrics?'Source: '+state.metrics.source:'Waiting for verified network analytics.'}</small></article>
      <article style={statusCard}><span>HOST CANDIDATES</span><b>{state.candidates.length}</b><small>{invited} advanced beyond candidate.</small></article>
      <article style={statusCard}><span>DAILY PROGRAM BLOCKS</span><b>{state.schedule.length}</b><small>Blueprint only until live/provider/rights gates are green.</small></article>
    </section>

    <section style={phaseRail}>
      <div><b>SCOUT</b><span>{HOST_SCOUT_THRESHOLDS.scoutWeeklyUnique.toLocaleString()} weekly uniques</span></div>
      <div><b>AUDITION</b><span>{HOST_SCOUT_THRESHOLDS.auditionWeeklyUnique.toLocaleString()} weekly uniques</span></div>
      <div><b>ROSTER</b><span>{HOST_SCOUT_THRESHOLDS.rosterWeeklyUnique.toLocaleString()} weekly uniques</span></div>
    </section>

    <nav style={tabs}>
      {(['desk','schedule','hosts','crypto'] as const).map(id=><button key={id} onClick={()=>setTab(id)} style={{...tab,borderColor:tab===id?'#5be7ff':'#30404b',background:tab===id?'#0d2934':'#081118'}}>{id.toUpperCase()}</button>)}
    </nav>

    {tab==='desk'&&<>
      <section style={card}>
        <div style={sectionTitle}>FULL NEWS TEAM</div>
        <div style={teamGrid}>{NEWSROOM_TEAM.map(role=><div key={role} style={roleCard}>{role}</div>)}</div>
      </section>
      <section style={card}>
        <div style={sectionTitle}>NEWSROOM DESKS</div>
        <div style={deskGrid}>{ALL_AMERICAN_NEWS_DESKS.map(d=><article key={d.id} style={deskCard}><b>{d.label}</b><p>{d.purpose}</p><small>SOURCE / TIMESTAMP REQUIRED BEFORE REAL-WORLD PUBLISHING</small></article>)}</div>
      </section>
    </>}

    {tab==='schedule'&&<section style={card}>
      <div style={sectionTitle}>24-HOUR PROGRAMMING BLUEPRINT</div>
      <div style={{display:'grid',gap:7}}>{state.schedule.map(show=><article key={show.id} style={scheduleRow}>
        <div style={{fontSize:20,fontWeight:1000}}>{String(show.startHour).padStart(2,'0')}:00</div>
        <div><b>{show.title}</b><small style={{display:'block',opacity:.65}}>{show.desk.replaceAll('-',' ')} • {show.durationMinutes} min • {show.hostMode}</small></div>
        <span style={{fontSize:8,color:show.liveEligible?'#7dffb2':'#ffd36e',fontWeight:950}}>{show.liveEligible?'LIVE ELIGIBLE':'LOOP / REPLAY'}</span>
      </article>)}</div>
      <p style={note}>This is a scheduling framework, not a claim that a licensed 24/7 external channel is already live. External FAST/CTV/OTT carriage still needs approved feeds, rights and provider relationships.</p>
    </section>}

    {tab==='hosts'&&<section style={card}>
      <div style={sectionTitle}>REAL HOST SCOUT</div>
      <p style={note}>The scout watches only for creator accounts already active inside TRYAMM after verified traffic reaches the scout gate. It does not fabricate hosts or automatically contact people outside the app.</p>
      {state.trafficPhase==='BOOTSTRAP'&&<div style={warning}>HOST SCOUT LOCKED • grow verified traffic first. House/AI-assisted programming can keep the schedule active in the meantime.</div>}
      <div style={{display:'grid',gap:8,marginTop:10}}>
        {state.candidates.length===0&&<div style={empty}>No eligible in-app creator candidates yet.</div>}
        {state.candidates.map(candidate=><article key={candidate.userId} style={candidateCard}>
          <div>
            <b>{candidate.displayName}</b>
            <small style={{display:'block',opacity:.65}}>{candidate.live?'LIVE NOW • ':''}{candidate.strengths.join(' • ')||'creator candidate'}</small>
          </div>
          <div style={{fontSize:9,fontWeight:950,color:'#8defff'}}>{candidate.phase.toUpperCase()}</div>
          <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
            {candidate.phase==='candidate'&&<button disabled={state.trafficPhase==='BOOTSTRAP'} onClick={()=>invite(candidate)} style={smallButton}>INVITE</button>}
            {candidate.phase==='invited'&&<button onClick={()=>advance(candidate,'audition')} style={smallButton}>AUDITION</button>}
            {candidate.phase==='audition'&&<button onClick={()=>advance(candidate,'trial-shift')} style={smallButton}>TRIAL SHIFT</button>}
            {candidate.phase==='trial-shift'&&<button disabled={state.trafficPhase!=='ROSTER'} onClick={()=>advance(candidate,'roster')} style={smallButton}>ADD ROSTER</button>}
          </div>
        </article>)}
      </div>
    </section>}

    {tab==='crypto'&&<section style={card}>
      <div style={sectionTitle}>CRYPTO EDUCATION + BROADCAST DESK</div>
      <h2 style={{margin:'6px 0'}}>Teach first. No hype.</h2>
      <p style={note}>This desk can explain blockchain, wallets, custody, security, scams, stablecoins, regulation and tax concepts. It should not promise returns, issue personalized investment advice, or turn unverified price chatter into news.</p>
      <div style={deskGrid}>
        {[
          ['Blockchain 101','How ledgers, consensus and transactions work.'],
          ['Wallet Safety','Keys, seed phrases, custody, phishing and scam prevention.'],
          ['Stablecoins','What they are, reserves, redemption and risks.'],
          ['Crypto Regulation','Source-labeled U.S. and international policy explainers.'],
          ['Taxes + Records','Education on recordkeeping and why jurisdiction-specific professional advice may be needed.'],
          ['Markets Literacy','How volatility, liquidity, leverage and market structure work — without price calls.'],
        ].map(([title,copy])=><article key={title} style={deskCard}><b>{title}</b><p>{copy}</p></article>)}
      </div>
      <div style={warning}>RULES • education only • no guaranteed returns • no pump/manipulation • sponsorships disclosed • source/timestamp required • custody risks explained.</div>
      <details style={{marginTop:10}}><summary style={{cursor:'pointer',fontWeight:900}}>Desk policy</summary><pre style={pre}>{JSON.stringify(CRYPTO_EDUCATION_RULES,null,2)}</pre></details>
    </section>}
  </main>
}

const page:React.CSSProperties={minHeight:'100vh',padding:'max(18px,env(safe-area-inset-top)) 14px 70px',background:'radial-gradient(circle at 20% 0,#142d3a,#070b12 42%,#020306)',color:'#fff',fontFamily:'system-ui'}
const header:React.CSSProperties={maxWidth:1180,margin:'0 auto',display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,flexWrap:'wrap'}
const eyebrow:React.CSSProperties={fontSize:10,letterSpacing:3,fontWeight:950,color:'#5be7ff'}
const lead:React.CSSProperties={maxWidth:760,color:'#a9bac4',lineHeight:1.6}
const button:React.CSSProperties={display:'inline-flex',alignItems:'center',justifyContent:'center',minHeight:42,padding:'8px 12px',borderRadius:11,border:'1px solid #4f7180',background:'#0b1d27',color:'#fff',fontWeight:900,textDecoration:'none'}
const statusGrid:React.CSSProperties={maxWidth:1180,margin:'16px auto 0',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:8}
const statusCard:React.CSSProperties={display:'grid',gap:5,padding:12,borderRadius:14,border:'1px solid #2b4958',background:'#07131c'}
const phaseRail:React.CSSProperties={maxWidth:1180,margin:'8px auto 0',display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:6}
const tabs:React.CSSProperties={maxWidth:1180,margin:'12px auto 0',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:6}
const tab:React.CSSProperties={minHeight:40,border:'1px solid #30404b',borderRadius:10,color:'#fff',fontWeight:950}
const card:React.CSSProperties={maxWidth:1180,margin:'10px auto 0',padding:14,borderRadius:18,border:'1px solid #2a3e49',background:'#071019dd'}
const sectionTitle:React.CSSProperties={fontSize:10,letterSpacing:2.4,fontWeight:950,color:'#5be7ff'}
const teamGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:6,marginTop:10}
const roleCard:React.CSSProperties={padding:9,borderRadius:10,border:'1px solid #283e4a',background:'#0b1720',fontSize:11,fontWeight:850}
const deskGrid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8,marginTop:10}
const deskCard:React.CSSProperties={padding:12,borderRadius:12,border:'1px solid #2b4958',background:'#081721',fontSize:11,lineHeight:1.45}
const scheduleRow:React.CSSProperties={display:'grid',gridTemplateColumns:'72px 1fr auto',gap:10,alignItems:'center',padding:10,borderRadius:11,border:'1px solid #233c49',background:'#08131b'}
const note:React.CSSProperties={fontSize:11,lineHeight:1.55,color:'#9fb1bb'}
const warning:React.CSSProperties={marginTop:10,padding:10,borderRadius:11,border:'1px solid #765925',background:'#211706',color:'#ffdf9c',fontSize:10,lineHeight:1.45}
const empty:React.CSSProperties={padding:12,borderRadius:11,border:'1px dashed #3d505a',color:'#81939c'}
const candidateCard:React.CSSProperties={display:'grid',gridTemplateColumns:'1fr auto auto',gap:8,alignItems:'center',padding:10,borderRadius:12,border:'1px solid #2a4451',background:'#091720'}
const smallButton:React.CSSProperties={minHeight:34,padding:'5px 8px',borderRadius:9,border:'1px solid #4a7b90',background:'#0a2531',color:'#fff',fontSize:8,fontWeight:950}
const pre:React.CSSProperties={whiteSpace:'pre-wrap',fontSize:9,color:'#9dc5d5',background:'#03090d',padding:10,borderRadius:10,overflowX:'auto'}
