import { useMemo, useState } from 'react'

type Stage = {
  id: string
  name: string
  owner: string
  gate: string
  output: string
  revenue: string
}

const stages: Stage[] = [
  {id:'idea',name:'01 • Idea + Benny Brief',owner:'Creator + Benny',gate:'Original concept approved',output:'Design brief + target customer',revenue:'Premium creation tools'},
  {id:'design',name:'02 • Construct Design',owner:'Creator + Construct',gate:'Design direction approved',output:'Front/back concept, colorways, accessories',revenue:'Design service / subscription'},
  {id:'twin',name:'03 • AI Twin + Holo Try-On',owner:'HoloStyle',gate:'Presentation approved',output:'Digital look + scene preview',revenue:'Premium try-on / digital twin'},
  {id:'brand',name:'04 • Brand Builder',owner:'Brand owner',gate:'Brand Passport complete',output:'Positioning, identity, pricing, campaign',revenue:'Brand-building services'},
  {id:'academy',name:'05 • Fashion Academy',owner:'Creator / trainee',gate:'Required training complete',output:'Launch-readiness badge + skill record',revenue:'Course / cohort / sponsor revenue'},
  {id:'techpack',name:'06 • Send to Design',owner:'Technical designer',gate:'Human technical validation',output:'Tech pack, BOM, measurements, tolerances',revenue:'Tech-pack service'},
  {id:'rights',name:'07 • Rights + NNN/NDA Vault',owner:'Rights owner + counsel',gate:'Permissions and agreements cleared',output:'Rights record + staged disclosure package',revenue:'Business service tier'},
  {id:'rfq',name:'08 • Quantum Source RFQ',owner:'Sourcing team',gate:'Comparable verified bids received',output:'Supplier scorecard + landed-cost estimates',revenue:'Sourcing coordination / disclosed referral'},
  {id:'sample',name:'09 • Sample + QC',owner:'Supplier + QA',gate:'Sample accepted',output:'Approved sample + QC record',revenue:'Inspection / coordination service'},
  {id:'production',name:'10 • Production',owner:'Approved manufacturer',gate:'Production release authorized',output:'Sellable inventory or made-to-order capacity',revenue:'Manufacturing coordination'},
  {id:'catalog',name:'11 • Catalog + Passport',owner:'Merchant',gate:'Real SKU + inventory/fulfillment path',output:'Product record + physical/digital twin',revenue:'Merchant subscription'},
  {id:'streetverse',name:'12 • StreetVerse Launch',owner:'Creator + merchant',gate:'Storefront and shoppable media verified',output:'Store, showroom, Reel/LIVE/AI-TV placements',revenue:'Ads, placement, events, affiliate sales'},
  {id:'checkout',name:'13 • Checkout + Server Verification',owner:'TRYAMM commerce server',gate:'Payment verified server-side',output:'Order + accounting event',revenue:'Marketplace commission'},
  {id:'ledger',name:'14 • Ledger + Payout',owner:'TRYAMM ledger',gate:'Return/fraud/settlement rules satisfied',output:'Payable balances + platform revenue',revenue:'Platform economics'},
  {id:'learn',name:'15 • Learn + Next Drop',owner:'Brand + analytics',gate:'Privacy-safe performance review',output:'Demand insights + next collection brief',revenue:'Retention + repeat commerce'},
]

const moneyLayers = [
  'Premium Benny / Construct tools','Fashion Academy','Brand Builder','Technical-design services','Designer/business subscriptions','Sourcing coordination','Disclosed supplier/logistics referrals','Marketplace commission','Creator affiliate economics','Promoted placement','Holo Runway / Fashion Week','Digital-fashion licensing','Enterprise showrooms','StreetVerse events and sponsorships'
]

export default function HoloStyleDevelopmentPipeline() {
  const [completed, setCompleted] = useState<string[]>([])
  const [projectName, setProjectName] = useState('My HoloStyle Collection')
  const progress = Math.round((completed.length / stages.length) * 100)
  const next = useMemo(() => stages.find(s => !completed.includes(s.id)), [completed])

  const toggle = (id: string) => setCompleted(v => v.includes(id) ? v.filter(x => x !== id) : [...v, id])

  return <section aria-label="HoloStyle product development pipeline">
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12,marginBottom:16}}>
      <div style={panel}>
        <div style={eyebrow}>DEVELOPMENT CONTROL</div>
        <label style={label}>Collection / project name</label>
        <input value={projectName} onChange={e=>setProjectName(e.target.value)} style={input} />
        <div style={{fontSize:38,fontWeight:950,marginTop:14}}>{progress}%</div>
        <div style={muted}>Development-gate progress for {projectName}.</div>
      </div>
      <div style={panel}>
        <div style={eyebrow}>NEXT GATE</div>
        <h3 style={{margin:'9px 0 7px'}}>{next ? next.name : 'Launch loop complete'}</h3>
        <p style={muted}>{next ? next.gate : 'Review performance and start the next collection.'}</p>
        <div style={notice}>A checked stage means workflow progress only. It does not certify legal, manufacturing, payment, safety or production completion without supporting evidence.</div>
      </div>
    </div>

    <div style={{display:'grid',gap:10}}>
      {stages.map(stage => {
        const done = completed.includes(stage.id)
        return <article key={stage.id} style={{...panel,borderColor:done?'#397f72':'#273149'}}>
          <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
            <button onClick={()=>toggle(stage.id)} aria-pressed={done} aria-label={`${done?'Mark incomplete':'Mark complete'} ${stage.name}`} style={{width:34,height:34,flex:'0 0 34px',borderRadius:10,border:'1px solid #456071',background:done?'#1d654f':'#09111b',color:'#fff',fontWeight:950,cursor:'pointer'}}>{done?'✓':'○'}</button>
            <div style={{flex:1,minWidth:0}}>
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:8}}><strong>{stage.name}</strong><span style={pill}>{stage.owner}</span></div>
              <div style={grid}>
                <div><span style={mini}>GATE</span><div style={muted}>{stage.gate}</div></div>
                <div><span style={mini}>OUTPUT</span><div style={muted}>{stage.output}</div></div>
                <div><span style={mini}>REVENUE</span><div style={muted}>{stage.revenue}</div></div>
              </div>
            </div>
          </div>
        </article>
      })}
    </div>

    <div style={{...panel,marginTop:16}}>
      <div style={eyebrow}>MONEY STACK</div>
      <h3 style={{fontSize:24,margin:'7px 0 12px'}}>Earn at several stages without hiding fees.</h3>
      <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{moneyLayers.map(x=><span key={x} style={pill}>{x}</span>)}</div>
      <p style={{...muted,marginTop:12}}>Prices, commissions and referral relationships should be disclosed. Customer funds, commissions, rewards and payouts should be calculated on trusted server-side systems rather than in the browser.</p>
    </div>
  </section>
}

const panel: React.CSSProperties = {background:'linear-gradient(160deg,#0d1322,#080b14)',border:'1px solid #273149',borderRadius:18,padding:16}
const eyebrow: React.CSSProperties = {fontSize:10,fontWeight:950,letterSpacing:2.2,color:'#75efff'}
const muted: React.CSSProperties = {fontSize:13,lineHeight:1.55,color:'#aeb7ca',margin:'5px 0'}
const notice: React.CSSProperties = {fontSize:11,lineHeight:1.5,color:'#dbca8c',marginTop:10,padding:10,border:'1px solid #564f2c',borderRadius:11,background:'#171409'}
const label: React.CSSProperties = {display:'block',fontSize:11,color:'#aeb7ca',margin:'12px 0 6px'}
const input: React.CSSProperties = {width:'100%',boxSizing:'border-box',border:'1px solid #31405d',borderRadius:11,background:'#060a13',color:'#fff',padding:'10px 11px'}
const pill: React.CSSProperties = {display:'inline-flex',alignItems:'center',border:'1px solid #304158',borderRadius:999,padding:'6px 9px',fontSize:10,color:'#d9e0f2',background:'#0a111d'}
const grid: React.CSSProperties = {display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10,marginTop:11}
const mini: React.CSSProperties = {fontSize:9,fontWeight:950,letterSpacing:1.5,color:'#69ddeb'}
