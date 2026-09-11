import { useMemo, useState } from 'react'

type HoloStyleCenterProps = { onClose: () => void }
type Section = 'studio' | 'academy' | 'brand' | 'source' | 'streetverse'

const academyTracks = [
  ['Fashion Foundations', 'Silhouette, color, textiles, construction and fit.'],
  ['Digital Fashion', 'AI Twin styling, digital twins, 3D garments and HoloStyle scenes.'],
  ['Technical Design', 'Measurements, sizing, tech packs, BOMs, tolerances and revisions.'],
  ['Brand Builder', 'Positioning, audience, identity, packaging, pricing and launch planning.'],
  ['Fashion Business', 'Costing, landed margin, drops, preorders, inventory and returns.'],
  ['Creator Commerce', 'StreetVerse stores, LIVE selling, Reels, affiliate campaigns and placements.'],
  ['Adaptive Fashion', 'Accessible closures, fit options and configurable presentation.'],
  ['Global Sourcing', 'RFQs, supplier comparison, samples, QC, logistics and scorecards.'],
  ['Rights & Provenance', 'Ownership records, permissions, licensed digital twins and clearance.'],
] as const

const sourceRegions = ['United States', 'Mexico', 'Africa', 'China', 'Japan', 'Other Asia'] as const
const revenueStreams = ['Marketplace commission', 'Designer subscriptions', 'Premium HoloStyle tools', 'Fashion Academy', 'Brand Builder services', 'Tech-pack services', 'Creator affiliate sales', 'Promoted placement', 'Digital-fashion licensing', 'Holo Runway events', 'Sourcing coordination', 'Enterprise digital showrooms']

export default function HoloStyleCenter({ onClose }: HoloStyleCenterProps) {
  const [section, setSection] = useState<Section>('studio')
  const [selectedRegion, setSelectedRegion] = useState<(typeof sourceRegions)[number]>('United States')
  const [brief, setBrief] = useState('')

  const tabs = useMemo(() => [
    ['studio', 'HOLOSTYLE'],
    ['academy', 'ACADEMY'],
    ['brand', 'BRAND'],
    ['source', 'QUANTUM SOURCE'],
    ['streetverse', 'STREETVERSE SALES'],
  ] as const, [])

  return (
    <main style={{minHeight:'100dvh',background:'radial-gradient(circle at 50% 0%,#1c1538 0,#080817 38%,#02020a 100%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif',padding:'20px 16px 80px',overflowY:'auto'}}>
      <div style={{maxWidth:1120,margin:'0 auto'}}>
        <header style={{display:'flex',gap:14,alignItems:'flex-start',justifyContent:'space-between',marginBottom:18}}>
          <div>
            <div style={{fontSize:11,fontWeight:900,letterSpacing:4,color:'#72efff'}}>TRYAMM • BENNY + CONSTRUCT</div>
            <h1 style={{fontSize:'clamp(28px,6vw,54px)',margin:'8px 0 5px',lineHeight:.95}}>HoloStyle Design → Create → Sell</h1>
            <p style={{margin:0,maxWidth:760,color:'#b9bfd3',lineHeight:1.6}}>Create an original look, build the brand, train the creator, prepare sourcing, sell through StreetVerse and route verified revenue to the TRYAMM ledger.</p>
          </div>
          <button aria-label="Close HoloStyle" onClick={onClose} style={{width:42,height:42,borderRadius:'50%',border:'1px solid #ffffff33',background:'#111225',color:'#fff',fontSize:20,cursor:'pointer'}}>×</button>
        </header>

        <nav aria-label="HoloStyle sections" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:10,marginBottom:18}}>
          {tabs.map(([id,label]) => <button key={id} onClick={()=>setSection(id)} aria-pressed={section===id} style={{whiteSpace:'nowrap',borderRadius:999,border:section===id?'1px solid #70edff':'1px solid #28304a',background:section===id?'#123548':'#0c0f1d',color:section===id?'#9ff5ff':'#c5cad9',padding:'10px 14px',fontWeight:900,fontSize:10,letterSpacing:1,cursor:'pointer'}}>{label}</button>)}
        </nav>

        {section === 'studio' && <section>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:14}}>
            <article style={card}><div style={eyebrow}>BENNY PERSONAL STYLIST</div><h2 style={h2}>Tell Benny the reality you want.</h2><textarea value={brief} onChange={e=>setBrief(e.target.value)} placeholder="Example: Build a luxury adaptive streetwear look for a 2050 Chicago runway, with matching jewelry, shoes and environment." style={{width:'100%',minHeight:118,resize:'vertical',boxSizing:'border-box',borderRadius:14,border:'1px solid #2b3854',background:'#070b14',color:'#fff',padding:12,lineHeight:1.5}}/><button style={primaryButton} onClick={()=>setBrief(v=>v.trim() || 'Original HoloStyle collection concept')}>CREATE DESIGN BRIEF</button></article>
            <article style={card}><div style={eyebrow}>TRANSFORMATION STACK</div><h2 style={h2}>Self + world wrapping</h2><p style={body}>Avatar/body presentation, garments, shoes, jewelry, watches, glasses, hair, makeup, bags, accessories, vehicle, room, storefront, lighting and era can share one scene specification.</p><div style={flow}>BENNY → CONSTRUCT → AI TWIN → HOLO WRAP → SELL</div></article>
          </div>
        </section>}

        {section === 'academy' && <section><div style={eyebrow}>HOLOSTYLE FASHION ACADEMY</div><h2 style={sectionTitle}>Train creators to become launch-ready fashion businesses.</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>{academyTracks.map(([title,desc],i)=><article key={title} style={smallCard}><div style={{fontSize:10,color:'#79f1ff',fontWeight:900}}>TRACK {String(i+1).padStart(2,'0')}</div><h3 style={{margin:'7px 0',fontSize:16}}>{title}</h3><p style={body}>{desc}</p></article>)}</div><p style={{...body,marginTop:14}}>Badges and completion records are product credentials only; they must not be represented as accredited certifications unless separately authorized.</p></section>}

        {section === 'brand' && <section><div style={eyebrow}>BRAND BUILDER</div><h2 style={sectionTitle}>Turn a design into a company people recognize.</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>{['Brand story + customer','Visual identity + packaging','Collection architecture','Pricing + margin targets','Campaign + creator assets','Digital Fashion Passport','Rights + provenance','Launch calendar'].map(x=><div key={x} style={smallCard}>{x}</div>)}</div><div style={{...card,marginTop:14}}><div style={eyebrow}>SEND TO DESIGN</div><p style={body}>Prepare front/back views, measurements, size range, materials, trims, color references, construction notes and revision history for human technical-design validation before manufacturing.</p></div></section>}

        {section === 'source' && <section><div style={eyebrow}>QUANTUM SOURCE</div><h2 style={sectionTitle}>Compare the total economics, not only factory unit price.</h2><div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>{sourceRegions.map(r=><button key={r} onClick={()=>setSelectedRegion(r)} style={{...chip,background:selectedRegion===r?'#173c43':'#0b101b',borderColor:selectedRegion===r?'#70edff':'#28334a'}}>{r}</button>)}</div><div style={card}><strong>{selectedRegion} sourcing lane</strong><p style={body}>RFQ comparison fields: unit cost + MOQ + sample/tooling + materials + QC + freight + duties/tariffs + insurance + expected defect allowance = estimated landed cost.</p><div style={flow}>RIGHTS VAULT → STAGED DISCLOSURE → RFQ → QUANTUM BID → SAMPLE → QC → PRODUCTION</div><p style={body}>Supplier quotes, legal terms, tariffs and compliance claims require current verification. International NDA/NNN and manufacturing contracts require jurisdiction-appropriate legal review.</p></div></section>}

        {section === 'streetverse' && <section><div style={eyebrow}>STREETVERSE FASHION DISTRICT</div><h2 style={sectionTitle}>Make the world itself shoppable.</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10}}>{['Designer storefronts','Virtual showrooms','Holo Runway','StreetVerse Fashion Week','Limited drops + preorders','Creator Closet','Design Battles','LIVE/PK selling','Shoppable Reels','AI-TV placements','Digital + physical twins','Business fashion missions'].map(x=><div key={x} style={smallCard}>{x}</div>)}</div><h3 style={{margin:'22px 0 10px'}}>TRYAMM revenue layers</h3><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{revenueStreams.map(x=><span key={x} style={chip}>{x}</span>)}</div><p style={{...body,marginTop:14}}>Every purchasable item must map to a real catalog record and verified checkout. Server-side systems calculate commissions and payable balances; unreleased features display Coming Soon instead of broken routes.</p></section>}
      </div>
    </main>
  )
}

const card: React.CSSProperties = {background:'linear-gradient(160deg,#0e1323,#090b15)',border:'1px solid #27314a',borderRadius:20,padding:18,boxShadow:'0 18px 50px #0007'}
const smallCard: React.CSSProperties = {background:'#0b0f1b',border:'1px solid #202b42',borderRadius:15,padding:14,color:'#f5f7ff'}
const eyebrow: React.CSSProperties = {fontSize:10,fontWeight:950,letterSpacing:2.2,color:'#75efff'}
const h2: React.CSSProperties = {fontSize:24,margin:'7px 0 12px'}
const sectionTitle: React.CSSProperties = {fontSize:'clamp(24px,4vw,38px)',margin:'8px 0 18px'}
const body: React.CSSProperties = {color:'#aeb6ca',lineHeight:1.6,fontSize:14,margin:'8px 0'}
const flow: React.CSSProperties = {marginTop:14,padding:12,borderRadius:12,background:'#071a20',border:'1px solid #245263',color:'#8bf4ff',fontSize:11,fontWeight:900,lineHeight:1.6,letterSpacing:.6}
const chip: React.CSSProperties = {display:'inline-flex',alignItems:'center',border:'1px solid #28334a',background:'#0b101b',borderRadius:999,padding:'8px 11px',fontSize:11,color:'#d9def0'}
const primaryButton: React.CSSProperties = {marginTop:10,border:0,borderRadius:12,padding:'11px 14px',background:'linear-gradient(135deg,#56e5ff,#8d6aff)',color:'#041018',fontWeight:950,cursor:'pointer'}
