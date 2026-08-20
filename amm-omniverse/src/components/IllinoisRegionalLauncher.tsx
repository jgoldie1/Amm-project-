import { useMemo, useState } from 'react'
import { ILLINOIS_REGIONS, type IllinoisRegionId } from '../game/world/IllinoisRegionalWorld'
import { BUSINESS_CLAIM_FLOW, DEFAULT_MARKETPLACE_REVENUE_POLICY } from '../game/business/StreetVerseBusinessClaim'
import { DEATH_CARE_AUTHORITIES, DEATH_CARE_JOBS, DEATH_CARE_SAFETY_RULES } from '../game/civic/IllinoisDeathCareFlow'

const tabs = ['region', 'jobs', 'stories', 'business', 'death-care', 'revenue'] as const
type Tab = typeof tabs[number]

export default function IllinoisRegionalLauncher() {
  const [open, setOpen] = useState(false)
  const [regionId, setRegionId] = useState<IllinoisRegionId>('chicago')
  const [tab, setTab] = useState<Tab>('region')
  const region = useMemo(() => ILLINOIS_REGIONS.find(item => item.id === regionId) ?? ILLINOIS_REGIONS[0], [regionId])
  const authority = DEATH_CARE_AUTHORITIES[region.id]

  return <>
    <button
      type="button"
      aria-label="Open Illinois StreetVerse regional economy"
      onClick={() => setOpen(true)}
      style={{position:'fixed',left:12,bottom:126,zIndex:8999,border:'1px solid #4fe3ff88',borderRadius:999,background:'linear-gradient(135deg,#071827,#23102f)',color:'#fff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}
    >
      🏙 ILLINOIS WORLDS
    </button>

    {open && <div role="dialog" aria-modal="true" aria-label="Illinois StreetVerse Regional Economy" style={{position:'fixed',inset:0,zIndex:10100,overflowY:'auto',background:'rgba(2,3,10,.96)',color:'#fff',padding:16}}>
      <div style={{maxWidth:1180,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10,letterSpacing:3,fontWeight:900,color:'#4fe3ff'}}>STREETVERSE • ILLINOIS REGIONAL ECONOMY</div>
            <h1 style={{fontSize:'clamp(2rem,7vw,4.4rem)',margin:'8px 0'}}>Chicago → Downstate → Global</h1>
            <p style={{color:'#aab7c5',maxWidth:850}}>One avatar, one career history, one business identity and one reputation state travel across regions. Local law, jobs, institutions and civic authority change by location.</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close Illinois regional economy" style={{width:48,height:48,borderRadius:'50%',border:'1px solid #405064',background:'#0b1320',color:'#fff',fontSize:24}}>×</button>
        </header>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:8,margin:'16px 0'}}>
          {ILLINOIS_REGIONS.map(item => <button key={item.id} onClick={() => setRegionId(item.id)} style={{minHeight:62,border:item.id===region.id?'2px solid #4fe3ff':'1px solid #263549',borderRadius:14,background:item.id===region.id?'#0d2635':'#0a111b',color:'#fff',fontWeight:900}}>{item.name}</button>)}
        </div>

        <nav aria-label="Regional economy sections" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
          {tabs.map(item => <button key={item} onClick={() => setTab(item)} style={{border:'1px solid #33455c',borderRadius:999,padding:'8px 12px',background:item===tab?'#17384c':'#080f18',color:'#fff',textTransform:'uppercase',fontSize:10,fontWeight:900}}>{item.replace('-', ' ')}</button>)}
        </nav>

        {tab === 'region' && <section style={panelStyle}>
          <h2>{region.name}</h2>
          <p style={muted}>{region.identity}</p>
          <h3>World anchors</h3>
          <div style={chipWrap}>{region.anchors.map(anchor => <span style={chip} key={anchor}>{anchor}</span>)}</div>
          <h3>Death authority</h3>
          <p style={muted}>{authority.authorityLabel} • {authority.facilityLabel}</p>
        </section>}

        {tab === 'jobs' && <section style={panelStyle}>
          <h2>{region.name} job board</h2>
          <p style={muted}>Jobs are playable roles with shifts, reputation, skill progression, story missions and employer/business relationships.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8}}>{region.jobs.map(job => <article key={job} style={cardStyle}><strong>{job}</strong><div style={mutedSmall}>Shift → task → performance → XP/reputation → promotion or new contract.</div></article>)}</div>
        </section>}

        {tab === 'stories' && <section style={panelStyle}>
          <h2>Story + backstory mission arcs</h2>
          <div style={{display:'grid',gap:12}}>{region.missionArcs.map(arc => <article key={arc.id} style={cardStyle}><h3>{arc.title}</h3><p style={muted}>{arc.backstory}</p><div style={chipWrap}>{arc.roles.map(role => <span style={chip} key={role}>{role}</span>)}</div><ol>{arc.chapters.map(chapter => <li key={chapter}>{chapter}</li>)}</ol><div style={mutedSmall}>Rewards: {arc.rewards.join(' • ')}</div></article>)}</div>
        </section>}

        {tab === 'business' && <section style={panelStyle}>
          <h2>Claim your business → build your storefront → open for traffic</h2>
          <p style={muted}>Public registry records are discovery/reference inputs. A player cannot take control of a real business just by finding its name; ownership/management relationship must be verified first.</p>
          <ol>{BUSINESS_CLAIM_FLOW.map(step => <li key={step} style={{margin:'10px 0'}}>{step}</li>)}</ol>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:16}}>
            {['Storefront editor','Hours + services','Photos/video/live','Accessibility profile','Staff + jobs','Customer queue','Traffic analytics','Reviews/reputation','Bookings/orders','Ads/promotions'].map(item => <div key={item} style={cardStyle}>{item}</div>)}
          </div>
          <p style={{...mutedSmall,marginTop:14}}>Chicago can seed discovery from the City active-business-license registry. Other regions use their applicable public/business sources and verified provider onboarding as adapters are added.</p>
        </section>}

        {tab === 'death-care' && <section style={panelStyle}>
          <h2>{region.name} death-care pathway</h2>
          <p style={muted}>Gameplay stays respectful and non-graphic. County jurisdiction determines who investigates and what facility/release path applies.</p>
          <div style={cardStyle}><strong>{authority.authorityLabel}</strong><div style={mutedSmall}>{authority.facilityLabel}</div></div>
          <h3>Case flow</h3>
          <div style={chipWrap}>{['911 report','EMS/police response','Coroner/ME notification','Scene investigation','Authorized transport','Forensic facility','Release authorization','Funeral provider','Arrangements','Burial/cremation/other lawful disposition'].map(stage => <span style={chip} key={stage}>{stage}</span>)}</div>
          <h3>Playable jobs</h3>
          <div style={chipWrap}>{DEATH_CARE_JOBS.map(job => <span style={chip} key={job}>{job}</span>)}</div>
          <h3>Safety rules</h3>
          <ul>{DEATH_CARE_SAFETY_RULES.map(rule => <li key={rule}>{rule}</li>)}</ul>
        </section>}

        {tab === 'revenue' && <section style={panelStyle}>
          <h2>Marketplace cash-cow model</h2>
          <p style={muted}>The safest scalable revenue comes from software, verified-business tools, ads and eligible marketplace services—not taking money from government coroner/medical-examiner duties.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
            <article style={cardStyle}><strong>Business Pro subscription</strong><div style={mutedSmall}>Default model placeholder: ${(DEFAULT_MARKETPLACE_REVENUE_POLICY.subscriptionCents/100).toFixed(0)}/month. Final pricing requires market testing.</div></article>
            <article style={cardStyle}><strong>Promoted storefronts</strong><div style={mutedSmall}>Businesses pay for clearly labeled promotion; organic ranking remains distinct.</div></article>
            <article style={cardStyle}><strong>Eligible booking fee</strong><div style={mutedSmall}>Current model placeholder: {DEFAULT_MARKETPLACE_REVENUE_POLICY.bookingPlatformFeeBps/100}% on eligible transactions, only after provider/legal/payment-processor approval.</div></article>
            <article style={cardStyle}><strong>Ancillary marketplace</strong><div style={mutedSmall}>Flowers, catering, memorial media, design and other eligible marketplace goods/services can support a higher marketplace rate where lawful.</div></article>
            <article style={cardStyle}><strong>Traffic + analytics</strong><div style={mutedSmall}>Paid dashboards, CRM, promotions, staffing tools and creator campaigns create recurring SaaS revenue.</div></article>
            <article style={cardStyle}><strong>Jobs marketplace</strong><div style={mutedSmall}>Employers can pay for recruiting tools, featured jobs and verified employer profiles; do not charge workers simply to access earned wages.</div></article>
          </div>
        </section>}
      </div>
    </div>}
  </>
}

const panelStyle = {border:'1px solid #213247',borderRadius:20,padding:18,background:'linear-gradient(150deg,#08111c,#070912)'} as const
const cardStyle = {border:'1px solid #26374b',borderRadius:14,padding:12,background:'#0b121d'} as const
const chipWrap = {display:'flex',gap:7,flexWrap:'wrap'} as const
const chip = {border:'1px solid #35516b',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const muted = {color:'#aab7c5',lineHeight:1.6} as const
const mutedSmall = {color:'#8293a8',fontSize:11,lineHeight:1.5} as const
