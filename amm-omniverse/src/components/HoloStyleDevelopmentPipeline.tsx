import { useMemo, useState } from 'react'

type Stage = { id:string; name:string; owner:string; gate:string; output:string; revenue:string }

const stages: Stage[] = [
  {id:'idea',name:'01 • Idea + Benny Brief',owner:'Creator + Benny',gate:'Original concept approved',output:'Design brief + target customer',revenue:'Premium creation tools'},
  {id:'design',name:'02 • Construct Design',owner:'Creator + Construct',gate:'Design direction approved',output:'Front/back concept, colorways, accessories',revenue:'Design service / subscription'},
  {id:'twin',name:'03 • AI Twin + Holo Try-On',owner:'HoloStyle',gate:'Presentation approved',output:'Digital look + scene preview',revenue:'Premium try-on / digital twin'},
  {id:'brand',name:'04 • Brand Builder',owner:'Brand owner',gate:'Brand Passport complete',output:'Positioning, identity, pricing, campaign',revenue:'Brand-building services'},
  {id:'academy',name:'05 • Fashion Academy',owner:'Creator / trainee',gate:'Required training complete',output:'Launch-readiness badge + skill record',revenue:'Course / cohort / sponsor revenue'},
  {id:'techpack',name:'06 • Send to Design',owner:'Technical designer',gate:'Human technical validation',output:'Tech pack, BOM, measurements, tolerances',revenue:'Tech-pack service'},
  {id:'rights',name:'07 • Rights + NNN/NDA Vault',owner:'Rights owner + counsel',gate:'Permissions and agreements cleared',output:'Rights record + staged disclosure package',revenue:'Business service tier'},
  {id:'lowmoq',name:'08 • Low-MOQ / Micro-Batch Strategy',owner:'Brand + sourcing',gate:'Maximum cash-at-risk and target MOQ set',output:'MOQ target, sample plan, micro-batch/preorder/POD route',revenue:'Low-MOQ sourcing service'},
  {id:'rfq',name:'09 • Quantum Source RFQ + MOQ Bid',owner:'Sourcing team',gate:'Comparable verified bids received',output:'MOQ ladder + supplier scorecard + landed-cost estimates',revenue:'Sourcing coordination / disclosed referral'},
  {id:'demand',name:'10 • Demand Test / Pre-Sell',owner:'Brand + creators',gate:'Demand threshold reached before scale order',output:'Waitlist, preorder, deposit or validated demand signal',revenue:'DTC preorder sales'},
  {id:'sample',name:'11 • Sample + QC',owner:'Supplier + QA',gate:'Sample accepted',output:'Approved sample + QC record',revenue:'Inspection / coordination service'},
  {id:'production',name:'12 • Micro-Batch → Scale Production',owner:'Approved manufacturer',gate:'Production release authorized',output:'Small first run with reorder trigger',revenue:'Manufacturing coordination'},
  {id:'catalog',name:'13 • Catalog + Digital Passport',owner:'Merchant',gate:'Real SKU + inventory/fulfillment path',output:'Product record + physical/digital twin',revenue:'Merchant subscription'},
  {id:'dtc',name:'14 • Direct-to-Consumer Launch',owner:'Brand + TRYAMM',gate:'Store, shipping, returns and support verified',output:'Brand-owned DTC storefront + customer relationship',revenue:'DTC commerce + platform services'},
  {id:'streetverse',name:'15 • StreetVerse Commerce Launch',owner:'Creator + merchant',gate:'Storefront and shoppable media verified',output:'Store, showroom, Reel/LIVE/AI-TV placements',revenue:'Ads, placement, events, affiliate sales'},
  {id:'checkout',name:'16 • Checkout + Server Verification',owner:'TRYAMM commerce server',gate:'Payment verified server-side',output:'Order + accounting event',revenue:'Marketplace/payment economics'},
  {id:'fulfill',name:'17 • Fulfillment + Customer Care',owner:'Merchant + logistics',gate:'Shipment/production status verified',output:'Tracking, delivery, returns and service record',revenue:'Fulfillment/service revenue where disclosed'},
  {id:'ledger',name:'18 • Ledger + Payout',owner:'TRYAMM ledger',gate:'Return/fraud/settlement rules satisfied',output:'Payable balances + platform revenue',revenue:'Platform economics'},
  {id:'reorder',name:'19 • Smart Reorder / Scale',owner:'Brand + analytics',gate:'Sell-through and margin threshold met',output:'Reorder quantity based on real demand',revenue:'Repeat sourcing + commerce'},
  {id:'learn',name:'20 • Learn + Next Drop',owner:'Brand + analytics',gate:'Privacy-safe performance review',output:'Demand insights + next collection brief',revenue:'Retention + repeat commerce'},
]

const moneyLayers = ['Premium Benny / Construct tools','Fashion Academy','Brand Builder','Technical-design services','Designer/business subscriptions','Low-MOQ sourcing','Micro-batch coordination','DTC storefront services','Preorder commerce','Sourcing coordination','Disclosed supplier/logistics referrals','Marketplace commission','Creator affiliate economics','Promoted placement','Holo Runway / Fashion Week','Digital-fashion licensing','Enterprise showrooms','StreetVerse events and sponsorships']
const inventoryModes = [
  ['PREORDER','Sell first, place production after a disclosed threshold/date.'],
  ['MICRO-BATCH','Start with the smallest commercially sensible verified factory run.'],
  ['MADE TO ORDER','Produce after a paid order where supplier capability and lead time support it.'],
  ['POD / ON-DEMAND','Use compatible products/suppliers that can produce per order.'],
  ['DROPSHIP','Supplier fulfills directly only when quality, branding, returns and delivery standards are verified.'],
  ['SCALE REORDER','Increase order size only after sell-through, margin and return data justify it.'],
] as const

export default function HoloStyleDevelopmentPipeline() {
  const [completed, setCompleted] = useState<string[]>([])
  const [projectName, setProjectName] = useState('My HoloStyle Collection')
  const [moqTarget, setMoqTarget] = useState(25)
  const [unitCost, setUnitCost] = useState(18)
  const [retailPrice, setRetailPrice] = useState(60)
  const progress = Math.round((completed.length / stages.length) * 100)
  const next = useMemo(() => stages.find(s => !completed.includes(s.id)), [completed])
  const inventoryCash = Math.max(0, moqTarget * unitCost)
  const grossSales = Math.max(0, moqTarget * retailPrice)
  const grossBeforeOtherCosts = grossSales - inventoryCash
  const toggle = (id:string) => setCompleted(v => v.includes(id) ? v.filter(x => x !== id) : [...v,id])

  return <section aria-label="HoloStyle product development pipeline">
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:12,marginBottom:16}}>
      <div style={panel}><div style={eyebrow}>DEVELOPMENT CONTROL</div><label style={label}>Collection / project name</label><input value={projectName} onChange={e=>setProjectName(e.target.value)} style={input}/><div style={{fontSize:38,fontWeight:950,marginTop:14}}>{progress}%</div><div style={muted}>Development-gate progress for {projectName}.</div></div>
      <div style={panel}><div style={eyebrow}>NEXT GATE</div><h3 style={{margin:'9px 0 7px'}}>{next ? next.name : 'Launch loop complete'}</h3><p style={muted}>{next ? next.gate : 'Review performance and start the next collection.'}</p><div style={notice}>A checked stage means workflow progress only. It does not certify legal, manufacturing, payment, safety or production completion without supporting evidence.</div></div>
    </div>

    <div style={{...panel,marginBottom:16}}>
      <div style={eyebrow}>LOW-MOQ + DIRECT-TO-CONSUMER ENGINE</div>
      <h3 style={{fontSize:24,margin:'7px 0 8px'}}>Prove demand before tying up cash in inventory.</h3>
      <p style={muted}>Quantum Source should request an MOQ ladder from each verified supplier — sample quantity, smallest production run, 25/50/100/250/500-unit pricing where applicable — then compare landed margin, lead time, quality and risk rather than automatically choosing the cheapest quote.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10,margin:'14px 0'}}>
        <label style={label}>Target MOQ<input type="number" min="1" value={moqTarget} onChange={e=>setMoqTarget(Number(e.target.value)||1)} style={input}/></label>
        <label style={label}>Estimated unit cost ($)<input type="number" min="0" step="0.01" value={unitCost} onChange={e=>setUnitCost(Number(e.target.value)||0)} style={input}/></label>
        <label style={label}>DTC retail price ($)<input type="number" min="0" step="0.01" value={retailPrice} onChange={e=>setRetailPrice(Number(e.target.value)||0)} style={input}/></label>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:9}}><div style={metric}><span style={mini}>INITIAL PRODUCT COST</span><strong>${inventoryCash.toLocaleString()}</strong></div><div style={metric}><span style={mini}>POTENTIAL GROSS SALES</span><strong>${grossSales.toLocaleString()}</strong></div><div style={metric}><span style={mini}>BEFORE OTHER COSTS</span><strong>${grossBeforeOtherCosts.toLocaleString()}</strong></div></div>
      <p style={{...muted,fontSize:11}}>Illustrative planning math only. Freight, duties, taxes, payment fees, returns, discounts, packaging, fulfillment, defects, marketing and other costs can materially reduce margin.</p>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:9,marginTop:12}}>{inventoryModes.map(([name,desc])=><div key={name} style={subPanel}><strong style={{color:'#8ff4ff'}}>{name}</strong><p style={muted}>{desc}</p></div>)}</div>
      <div style={flow}>DESIGN → SAMPLE → DTC WAITLIST → PREORDER/DEPOSIT → LOW-MOQ RUN → STREETVERSE + REELS + LIVE → FULFILL → SELL-THROUGH CHECK → SMART REORDER</div>
    </div>

    <div style={{display:'grid',gap:10}}>{stages.map(stage=>{const done=completed.includes(stage.id);return <article key={stage.id} style={{...panel,borderColor:done?'#397f72':'#273149'}}><div style={{display:'flex',alignItems:'flex-start',gap:12}}><button onClick={()=>toggle(stage.id)} aria-pressed={done} aria-label={`${done?'Mark incomplete':'Mark complete'} ${stage.name}`} style={{width:34,height:34,flex:'0 0 34px',borderRadius:10,border:'1px solid #456071',background:done?'#1d654f':'#09111b',color:'#fff',fontWeight:950,cursor:'pointer'}}>{done?'✓':'○'}</button><div style={{flex:1,minWidth:0}}><div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:8}}><strong>{stage.name}</strong><span style={pill}>{stage.owner}</span></div><div style={grid}><div><span style={mini}>GATE</span><div style={muted}>{stage.gate}</div></div><div><span style={mini}>OUTPUT</span><div style={muted}>{stage.output}</div></div><div><span style={mini}>REVENUE</span><div style={muted}>{stage.revenue}</div></div></div></div></div></article>})}</div>

    <div style={{...panel,marginTop:16}}><div style={eyebrow}>MONEY STACK</div><h3 style={{fontSize:24,margin:'7px 0 12px'}}>Earn at several stages without hiding fees.</h3><div style={{display:'flex',flexWrap:'wrap',gap:8}}>{moneyLayers.map(x=><span key={x} style={pill}>{x}</span>)}</div><p style={{...muted,marginTop:12}}>Prices, commissions and referral relationships should be disclosed. Customer funds, commissions, rewards and payouts should be calculated on trusted server-side systems rather than in the browser.</p></div>
  </section>
}

const panel:React.CSSProperties={background:'linear-gradient(160deg,#0d1322,#080b14)',border:'1px solid #273149',borderRadius:18,padding:16}
const subPanel:React.CSSProperties={background:'#070d17',border:'1px solid #23334a',borderRadius:13,padding:12}
const eyebrow:React.CSSProperties={fontSize:10,fontWeight:950,letterSpacing:2.2,color:'#75efff'}
const muted:React.CSSProperties={fontSize:13,lineHeight:1.55,color:'#aeb7ca',margin:'5px 0'}
const notice:React.CSSProperties={fontSize:11,lineHeight:1.5,color:'#dbca8c',marginTop:10,padding:10,border:'1px solid #564f2c',borderRadius:11,background:'#171409'}
const label:React.CSSProperties={display:'block',fontSize:11,color:'#aeb7ca',margin:'12px 0 6px'}
const input:React.CSSProperties={display:'block',width:'100%',boxSizing:'border-box',border:'1px solid #31405d',borderRadius:11,background:'#060a13',color:'#fff',padding:'10px 11px',marginTop:6}
const pill:React.CSSProperties={display:'inline-flex',alignItems:'center',border:'1px solid #304158',borderRadius:999,padding:'6px 9px',fontSize:10,color:'#d9e0f2',background:'#0a111d'}
const grid:React.CSSProperties={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10,marginTop:11}
const mini:React.CSSProperties={display:'block',fontSize:9,fontWeight:950,letterSpacing:1.5,color:'#69ddeb',marginBottom:5}
const metric:React.CSSProperties={display:'flex',flexDirection:'column',gap:5,background:'#07131a',border:'1px solid #244b58',borderRadius:13,padding:12,fontSize:20}
const flow:React.CSSProperties={marginTop:14,padding:12,borderRadius:12,background:'#071a20',border:'1px solid #245263',color:'#8bf4ff',fontSize:11,fontWeight:900,lineHeight:1.6,letterSpacing:.6}
