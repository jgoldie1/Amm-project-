import {useState} from 'react'
import {PHYSICAL_RELEASE_FORMATS,FAN_MARKETING_STAGES,calculateDirectMusicMargin} from '../lib/music/directFanPhysicalMusic.mjs'
import {SUGGESTED_DISTRIBUTION_FEE_PERCENT,quoteDistributionFee,INDEPENDENT_CHART_CATEGORIES,CHART_GOVERNANCE} from '../lib/music/independentDistributionCharts.mjs'

type MoneyKey='units'|'pricePerUnit'|'manufacturingTotal'|'artworkTotal'|'packagingPerUnit'|'postagePerUnit'|'paymentFeePercent'|'paymentFeeFixed'|'marketingTotal'|'royaltyPerUnit'|'refundReservePerUnit'
const fieldLabels:Record<MoneyKey,string>={units:'Expected orders',pricePerUnit:'Fan price per order ($)',manufacturingTotal:'Manufacturing total ($)',artworkTotal:'Art and proof budget ($)',packagingPerUnit:'Packaging per order ($)',postagePerUnit:'Shipping cost per order ($)',paymentFeePercent:'Processor fee (%)',paymentFeeFixed:'Processor fixed fee ($)',marketingTotal:'Advertising budget ($)',royaltyPerUnit:'Royalties per order ($)',refundReservePerUnit:'Returns reserve per order ($)'}
const costFields=Object.keys(fieldLabels) as MoneyKey[]
const empty:Record<MoneyKey,string>={units:'1',pricePerUnit:'',manufacturingTotal:'',artworkTotal:'',packagingPerUnit:'',postagePerUnit:'',paymentFeePercent:'',paymentFeeFixed:'',marketingTotal:'',royaltyPerUnit:'',refundReservePerUnit:''}
const inputStyle:React.CSSProperties={boxSizing:'border-box',width:'100%',minHeight:48,borderRadius:9,border:'1px solid #4a7495',background:'#102031',color:'#fff',padding:'8px 12px',fontSize:16}
const btn:React.CSSProperties={minHeight:52,padding:'10px 14px',borderRadius:11,border:'1px solid #83c6e2',background:'#13283c',color:'#fff',fontSize:14,fontWeight:800,cursor:'pointer'}
const routes=[
 {id:'supplier-store',title:'Supplier-hosted storefront',detail:'External producer takes the fan order and ships the record. Easiest launch, but supplier handles checkout and may own much of the customer relationship.'},
 {id:'tryamm-checkout',title:'TRYAMM checkout + approved fulfillment',detail:'Artist storefront and customer relationship stay on TRYAMM. Requires verified supplier API or authorized manual order handoff, secure address transfer and confirmed payment/refund operations.'},
 {id:'manual-review',title:'TRYAMM reservation / interest list',detail:'Collect only permissioned interest before a quote or supplier integration exists. No money or manufacturing commitment.'}
] as const
export default function DirectFanPhysicalMusic(){
 const [format,setFormat]=useState('vinyl-12')
 const [route,setRoute]=useState<string>('manual-review')
 const [title,setTitle]=useState('')
 const [values,setValues]=useState<Record<MoneyKey,string>>(empty)
 const [showMarketing,setShowMarketing]=useState(false)
 const [distributionPercent,setDistributionPercent]=useState(String(SUGGESTED_DISTRIBUTION_FEE_PERCENT))
 const [alreadyPlatformCharged,setAlreadyPlatformCharged]=useState(false)
 const [status,setStatus]=useState('Planning only — no provider connected, charge made or pressing order submitted.')
 const selected=PHYSICAL_RELEASE_FORMATS.find(x=>x.id===format)!
 const filled=costFields.every(k=>values[k].trim()!=='')
 const estimate=filled?calculateDirectMusicMargin(values):null
 const distribution=values.pricePerUnit.trim()?quoteDistributionFee({itemSubtotal:Number(values.pricePerUnit),feePercent:Number(distributionPercent),alreadyPlatformCharged}):null
 const exportBrief=()=>{
  if(!title.trim()){setStatus('Enter an album or single title before exporting.');return}
  const payload={schema:1,title:title.trim(),format,route,inputs:values,estimate,proposedDistributionFee:distribution,chartsNotVerified:true,pressAuthorized:false,chargeAuthorized:false,shipmentAuthorized:false,rightsVerified:false,status:'DRAFT_ONLY',timestamp:new Date().toISOString()}
  const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download='all-american-records-direct-to-fan-draft.json';a.click()
  setTimeout(()=>URL.revokeObjectURL(url),3000)
  setStatus('Draft planning file prepared. No order or payment was sent.')
 }
 return <main aria-label="Vinyl and CD print on demand release planner" style={{maxWidth:980,margin:'0 auto',padding:'16px 14px 90px',color:'#fff'}}>
  <h2>💿 Vinyl & CD on Demand</h2>
  <p style={{lineHeight:1.6,color:'#bbd7e7'}}>All American Records • El Saturn Records • TRYAMM direct-to-fan planning. Fans order an approved release; a manufacturer makes a copy and ships it. Many single-copy vinyl services use <strong>lathe-cut discs</strong> instead of traditional mass-pressed records. Review audio quality and manufacture times before promising delivery.</p>
  <section style={{border:'1px solid #35546b',borderRadius:15,padding:14,marginBottom:14}}>
   <h3>1. Release and format</h3>
   <label style={{display:'block',marginBottom:12}}>Album title<input aria-label="Physical release title" style={inputStyle} value={title} maxLength={120} onChange={e=>setTitle(e.target.value)} placeholder="Enter original release title"/></label>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(155px,1fr))',gap:9}}>
    {PHYSICAL_RELEASE_FORMATS.map(f=><button key={f.id} aria-pressed={format===f.id} onClick={()=>setFormat(f.id)} style={{...btn,borderColor:format===f.id?'#f8d382':'#506f83'}}>{f.label}</button>)}
   </div>
   <p style={{fontSize:12,color:'#cdd7dd'}}>Before accepting payment, verify: {selected.requiredAssets.join(' · ')}.</p>
  </section>
  <section style={{border:'1px solid #35546b',borderRadius:15,padding:14,marginBottom:14}}>
   <h3>2. Choose who owns the checkout</h3>
   <div style={{display:'grid',gap:9}}>
    {routes.map(r=><button key={r.id} onClick={()=>setRoute(r.id)} aria-pressed={route===r.id} style={{...btn,textAlign:'left',borderColor:route===r.id?'#f8d382':'#506f83'}}><strong>{r.title}</strong><div style={{fontSize:12,fontWeight:400,marginTop:4,color:'#d0dbe4',lineHeight:1.5}}>{r.detail}</div></button>)}
   </div>
   <p style={{color:'#f2c992',fontSize:12}}>Supplier API, shipping estimates, permissions, taxes, returns and fulfillment webhooks are NOT connected. Choosing TRYAMM checkout does not enable live sales.</p>
  </section>
  <section style={{border:'1px solid #35546b',borderRadius:15,padding:14,marginBottom:14}}>
   <h3>3. Calculate margin from a real quote</h3>
   <p style={{fontSize:12,color:'#b9cbd9'}}>For on-demand orders, enter total manufacturing for the selected expected order count. Leave unknown fees blank; they are never silently treated as zero. All amounts are estimates, before tax.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
    {costFields.map(k=><label key={k} style={{fontSize:12}}>{fieldLabels[k]}<input aria-label={fieldLabels[k]} type="number" min={k==='units'?'1':'0'} max={k==='units'?'100000':undefined} step={k==='units'?'1':'0.01'} style={inputStyle} value={values[k]} onChange={e=>setValues(s=>({...s,[k]:e.target.value}))}/></label>)}
   </div>
   <p aria-live="polite" style={{fontSize:15,color:'#ffde9d'}}>{estimate?`Estimated sales: $${estimate.gross.toFixed(2)} · Total costs: $${estimate.totalCost.toFixed(2)} · Before-tax result: $${estimate.netBeforeTax.toFixed(2)} · Break-even: ${estimate.breakEvenUnits??'not feasible'} orders`:'Enter every quote/fee field to calculate; zero is allowed only when confirmed.'}</p>
  </section>
  <section aria-label="Proposed direct distribution and independent charts" style={{border:'1px solid #35546b',borderRadius:15,padding:14,marginBottom:14}}>
    <h3>4. Nationwide distribution and independent charts</h3>
    <p style={{fontSize:12,color:'#cde1eb'}}>Suggested TRYAMM physical distribution fee: 7% of item price, excluding taxes and fan-paid shipping. The fee is a proposal, not a live charge. Supplier coverage, manufacturing, artist royalty agreements and refunds require verification.</p>
    <label style={{display:'block',marginBottom:10}}>Proposed physical distribution fee (%)
      <input aria-label="Proposed physical distribution fee percent" type="number" min="0" max="15" step=".5" value={distributionPercent} onChange={e=>setDistributionPercent(e.target.value)} style={inputStyle}/>
    </label>
    <label style={{display:'flex',gap:10,alignItems:'center',marginBottom:12,minHeight:48,fontSize:13}}>
      <input aria-label="Existing platform share already applies" type="checkbox" checked={alreadyPlatformCharged} onChange={e=>setAlreadyPlatformCharged(e.target.checked)} style={{width:24,height:24}}/>
      Existing TRYAMM platform share already applies — do not charge the distribution fee again
    </label>
    <p role="status" aria-live="polite" style={{color:'#ffde9d',fontSize:13}}>{distribution?`Estimated distribution fee per item: ${distribution.distributionFee.toFixed(2)}. Artist/merchant item proceeds before production, shipping, processor, royalty and other costs: ${distribution.artistMerchantItemProceedsBeforeOtherCosts.toFixed(2)}.`:'Enter a valid item price and distribution percentage (0–15%) to calculate.'}</p>
    <h4>All American Independent Music Charts</h4>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10}}>
      {INDEPENDENT_CHART_CATEGORIES.map(chart=><div key={chart.id} style={{border:'1px solid #48687b',padding:12,borderRadius:10,background:'#142234'}}>
        <strong>{chart.title}</strong><p style={{fontSize:11,color:'#b8cedd'}}>{chart.metric}</p><span style={{fontSize:11,color:'#f2c992'}}>PLANNED • NO VERIFIED RANKINGS YET</span>
      </div>)}
    </div>
    <p style={{fontSize:12,color:'#b8cedd'}}>Separate paid advertisements from rankings. Charts require independently reconciled sales, artist opt-in, anti-fraud checks, refund removal and a public methodology. {CHART_GOVERNANCE.branding}.</p>
  </section>
  <section style={{border:'1px solid #35546b',borderRadius:15,padding:14,marginBottom:14}}>
   <button onClick={()=>setShowMarketing(x=>!x)} aria-expanded={showMarketing} style={{...btn,width:'100%',textAlign:'left'}}>📣 {showMarketing?'HIDE':'SHOW'} DIRECT FAN MARKETING CHECKLIST</button>
   {showMarketing&&<ol style={{lineHeight:1.8,color:'#cbdbe8'}}>{FAN_MARKETING_STAGES.map(s=><li key={s.id}><strong>{s.label}:</strong> {s.instruction}</li>)}</ol>}
  </section>
  <button style={{...btn,width:'100%',background:'#274936'}} onClick={exportBrief}>⬇ EXPORT PRIVATE RELEASE PLAN</button>
  <p role="status" aria-live="polite" style={{fontSize:12,color:'#f5d9a0'}}>{status}</p>
 </main>
}
