import { useMemo, useState } from 'react'
import { ILLINOIS_REGIONS, type IllinoisRegionId } from '../game/world/IllinoisRegionalWorld'
import { GLOBAL_LAUNCH_REGIONS, type LaunchRegionId } from '../game/world/GlobalLaunchRegions'
import { BUSINESS_CLAIM_FLOW, DEFAULT_MARKETPLACE_REVENUE_POLICY } from '../game/business/StreetVerseBusinessClaim'
import { DEATH_CARE_AUTHORITIES, DEATH_CARE_JOBS, DEATH_CARE_SAFETY_RULES } from '../game/civic/IllinoisDeathCareFlow'

const tabs = ['region', 'jobs', 'stories', 'business', 'death-care', 'revenue'] as const
type Tab = typeof tabs[number]
type Network = 'illinois' | 'national'

export default function IllinoisRegionalLauncher() {
  const [open, setOpen] = useState(false)
  const [network, setNetwork] = useState<Network>('illinois')
  const [illinoisRegionId, setIllinoisRegionId] = useState<IllinoisRegionId>('chicago')
  const [globalRegionId, setGlobalRegionId] = useState<LaunchRegionId>('detroit-mi')
  const [tab, setTab] = useState<Tab>('region')

  const illinoisRegion = useMemo(() => ILLINOIS_REGIONS.find(item => item.id === illinoisRegionId) ?? ILLINOIS_REGIONS[0], [illinoisRegionId])
  const globalRegion = useMemo(() => GLOBAL_LAUNCH_REGIONS.find(item => item.id === globalRegionId) ?? GLOBAL_LAUNCH_REGIONS[0], [globalRegionId])
  const authority = DEATH_CARE_AUTHORITIES[illinoisRegion.id]

  const currentName = network === 'illinois' ? illinoisRegion.name : globalRegion.name
  const currentIdentity = network === 'illinois' ? illinoisRegion.identity : globalRegion.identity
  const currentAnchors = network === 'illinois' ? illinoisRegion.anchors : globalRegion.anchors
  const currentJobs = network === 'illinois' ? illinoisRegion.jobs : globalRegion.jobs
  const currentStories = network === 'illinois'
    ? illinoisRegion.missionArcs.map(arc => ({ title: arc.title, backstory: arc.backstory, roles: arc.roles, chapters: arc.chapters }))
    : globalRegion.starterStories

  return <>
    <button
      type="button"
      aria-label="Open StreetVerse regional economy"
      onClick={() => setOpen(true)}
      style={{position:'fixed',left:12,bottom:126,zIndex:8999,border:'1px solid #4fe3ff88',borderRadius:999,background:'linear-gradient(135deg,#071827,#23102f)',color:'#fff',padding:'10px 14px',fontFamily:'monospace',fontSize:10,fontWeight:900,cursor:'pointer',boxShadow:'0 8px 28px #0008'}}
    >
      🏙 STREETVERSE WORLDS
    </button>

    {open && <div role="dialog" aria-modal="true" aria-label="StreetVerse Regional Economy" style={{position:'fixed',inset:0,zIndex:10100,overflowY:'auto',background:'rgba(2,3,10,.96)',color:'#fff',padding:16}}>
      <div style={{maxWidth:1240,margin:'0 auto'}}>
        <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <div style={{fontSize:10,letterSpacing:3,fontWeight:900,color:'#4fe3ff'}}>STREETVERSE • REGIONAL JOB + BUSINESS + STORY ECONOMY</div>
            <h1 style={{fontSize:'clamp(2rem,7vw,4.4rem)',margin:'8px 0'}}>Chicago → Michigan → California → South → East Coast → Global</h1>
            <p style={{color:'#aab7c5',maxWidth:900}}>One avatar, one career history, one verified business identity and one reputation state travel across regions. Local law, licensing, courts, public safety, jobs, businesses and story missions change by jurisdiction.</p>
          </div>
          <button onClick={() => setOpen(false)} aria-label="Close regional economy" style={{width:48,height:48,borderRadius:'50%',border:'1px solid #405064',background:'#0b1320',color:'#fff',fontSize:24}}>×</button>
        </header>

        <div style={{display:'flex',gap:8,flexWrap:'wrap',margin:'16px 0 10px'}}>
          <button onClick={() => setNetwork('illinois')} style={networkButton(network==='illinois')}>ILLINOIS STARTER</button>
          <button onClick={() => setNetwork('national')} style={networkButton(network==='national')}>NATIONAL STARTER</button>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,margin:'10px 0 16px'}}>
          {network === 'illinois'
            ? ILLINOIS_REGIONS.map(item => <button key={item.id} onClick={() => setIllinoisRegionId(item.id)} style={regionButton(item.id===illinoisRegion.id)}>{item.name}</button>)
            : GLOBAL_LAUNCH_REGIONS.map(item => <button key={item.id} onClick={() => setGlobalRegionId(item.id)} style={regionButton(item.id===globalRegion.id)}>{item.name}</button>)}
        </div>

        <nav aria-label="Regional economy sections" style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:18}}>
          {tabs.map(item => <button key={item} onClick={() => setTab(item)} style={{border:'1px solid #33455c',borderRadius:999,padding:'8px 12px',background:item===tab?'#17384c':'#080f18',color:'#fff',textTransform:'uppercase',fontSize:10,fontWeight:900}}>{item.replace('-', ' ')}</button>)}
        </nav>

        {tab === 'region' && <section style={panelStyle}>
          <h2>{currentName}</h2>
          <p style={muted}>{currentIdentity}</p>
          {network === 'national' && <p style={mutedSmall}><strong>{globalRegion.state}</strong> • {globalRegion.countyOrEquivalent}</p>}
          <h3>World anchors</h3>
          <div style={chipWrap}>{currentAnchors.map(anchor => <span style={chip} key={anchor}>{anchor}</span>)}</div>
          {network === 'illinois'
            ? <><h3>Death authority</h3><p style={muted}>{authority.authorityLabel} • {authority.facilityLabel}</p></>
            : <><h3>Local adapters</h3><p style={muted}>{globalRegion.civicAdapter}</p><p style={muted}>{globalRegion.businessAdapter}</p></>}
        </section>}

        {tab === 'jobs' && <section style={panelStyle}>
          <h2>{currentName} job board</h2>
          <p style={muted}>Jobs are playable roles with shifts, reputation, skills, story missions, employer relationships, references and promotion paths.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:8}}>{currentJobs.map(job => <article key={job} style={cardStyle}><strong>{job}</strong><div style={mutedSmall}>Shift → task → performance → XP/reputation → promotion, contract or entrepreneurship path.</div></article>)}</div>
        </section>}

        {tab === 'stories' && <section style={panelStyle}>
          <h2>{currentName} story + backstory mission arcs</h2>
          <div style={{display:'grid',gap:12}}>{currentStories.map(arc => <article key={arc.title} style={cardStyle}><h3>{arc.title}</h3><p style={muted}>{arc.backstory}</p><div style={chipWrap}>{arc.roles.map(role => <span style={chip} key={role}>{role}</span>)}</div><ol>{arc.chapters.map(chapter => <li key={chapter}>{chapter}</li>)}</ol></article>)}</div>
        </section>}

        {tab === 'business' && <section style={panelStyle}>
          <h2>Claim your business → build your storefront → hire → open → receive traffic</h2>
          <p style={muted}>Public registry records are discovery/reference inputs. Finding a real business never grants control. Ownership or authorized-management relationship must be verified first.</p>
          <ol>{BUSINESS_CLAIM_FLOW.map(step => <li key={step} style={{margin:'10px 0'}}>{step}</li>)}</ol>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:16}}>
            {['Storefront editor','Hours + services','Photos/video/live','Accessibility profile','Staff + jobs','Customer queue','Traffic analytics','Reviews/reputation','Bookings/orders','Ads/promotions','Inventory','Delivery/pickup'].map(item => <div key={item} style={cardStyle}>{item}</div>)}
          </div>
          <p style={{...mutedSmall,marginTop:14}}>{network === 'illinois' ? 'Chicago can seed discovery from the current City business-license registry; other Illinois regions use applicable state/local adapters.' : globalRegion.businessAdapter}</p>
        </section>}

        {tab === 'death-care' && <section style={panelStyle}>
          <h2>{currentName} death-care pathway</h2>
          {network === 'illinois' ? <>
            <p style={muted}>Gameplay stays respectful and non-graphic. County jurisdiction determines who investigates and what facility/release path applies.</p>
            <div style={cardStyle}><strong>{authority.authorityLabel}</strong><div style={mutedSmall}>{authority.facilityLabel}</div></div>
            <h3>Case flow</h3>
            <div style={chipWrap}>{['911 report','EMS/police response','Coroner/ME notification','Scene investigation','Authorized transport','Forensic facility','Release authorization','Funeral provider','Arrangements','Burial/cremation/other lawful disposition'].map(stage => <span style={chip} key={stage}>{stage}</span>)}</div>
          </> : <>
            <p style={muted}>The same respectful case-flow framework applies, but this region remains behind its local jurisdiction adapter until the applicable medical examiner/coroner, transport, funeral-service and disposition rules are verified.</p>
            <div style={cardStyle}><strong>{globalRegion.civicAdapter}</strong><div style={mutedSmall}>No Illinois-specific death-authority rule is reused here.</div></div>
          </>}
          <h3>Playable jobs</h3>
          <div style={chipWrap}>{DEATH_CARE_JOBS.map(job => <span style={chip} key={job}>{job}</span>)}</div>
          <h3>Safety rules</h3>
          <ul>{DEATH_CARE_SAFETY_RULES.map(rule => <li key={rule}>{rule}</li>)}</ul>
        </section>}

        {tab === 'revenue' && <section style={panelStyle}>
          <h2>Marketplace cash-cow model</h2>
          <p style={muted}>Recurring revenue comes from software, verified-business tools, ads, eligible marketplace services, recruiting and creator traffic—not a percentage of government police/court/coroner duties.</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>
            <article style={cardStyle}><strong>Business Pro subscription</strong><div style={mutedSmall}>Placeholder ${(DEFAULT_MARKETPLACE_REVENUE_POLICY.subscriptionCents/100).toFixed(0)}/month; final pricing requires market testing.</div></article>
            <article style={cardStyle}><strong>Promoted storefronts</strong><div style={mutedSmall}>Clearly labeled sponsored placement, campaign tools and local event boosts.</div></article>
            <article style={cardStyle}><strong>Eligible booking fee</strong><div style={mutedSmall}>Placeholder {DEFAULT_MARKETPLACE_REVENUE_POLICY.bookingPlatformFeeBps/100}% on eligible marketplace transactions after legal/provider/payment approval.</div></article>
            <article style={cardStyle}><strong>Ancillary marketplace</strong><div style={mutedSmall}>Eligible flowers, catering, memorial media, creator services, delivery and other local commerce.</div></article>
            <article style={cardStyle}><strong>Traffic + analytics</strong><div style={mutedSmall}>CRM, customer analytics, promotions, staffing, demand forecasting and creator campaigns.</div></article>
            <article style={cardStyle}><strong>Jobs marketplace</strong><div style={mutedSmall}>Featured jobs, employer subscriptions, recruiting tools and verified employer pages.</div></article>
            <article style={cardStyle}><strong>Multi-location tools</strong><div style={mutedSmall}>One verified brand can manage multiple storefronts across supported regions while each location keeps its local compliance adapter.</div></article>
            <article style={cardStyle}><strong>World sponsorships</strong><div style={mutedSmall}>Brands can sponsor clearly labeled districts, events and creator experiences without buying gameplay outcomes.</div></article>
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
const regionButton = (active:boolean) => ({minHeight:62,border:active?'2px solid #4fe3ff':'1px solid #263549',borderRadius:14,background:active?'#0d2635':'#0a111b',color:'#fff',fontWeight:900,cursor:'pointer'} as const)
const networkButton = (active:boolean) => ({minHeight:42,border:active?'2px solid #e8b944':'1px solid #35465a',borderRadius:999,background:active?'#2b2110':'#0a111b',color:'#fff',fontWeight:900,padding:'0 14px',cursor:'pointer'} as const)
