import {useEffect,useMemo,useState} from 'react'
import {listMyPressSales,listMyPrintJobs,type PressSale,type PrintJob} from '../services/pressCafeOperations'

const money=(cents:number,currency='USD')=>{try{return new Intl.NumberFormat(undefined,{style:'currency',currency}).format(Number(cents||0)/100)}catch{return `${currency} ${(Number(cents||0)/100).toFixed(2)}`}}

export default function KingdomsPressSalesPanel(){
 const [sales,setSales]=useState<PressSale[]>([]),[jobs,setJobs]=useState<PrintJob[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(true)
 useEffect(()=>{let active=true;(async()=>{try{const [s,j]=await Promise.all([listMyPressSales(),listMyPrintJobs()]);if(active){setSales(s);setJobs(j)}}catch(e){if(active)setError(e instanceof Error?e.message:String(e))}finally{if(active)setBusy(false)}})();return()=>{active=false}},[])
 const totals=useMemo(()=>sales.reduce((a,s)=>{a.gross+=Number(s.gross_cents||0);a.royalty+=Number(s.royalty_cents||0);if(s.settlement_status==='payable')a.payable+=Number(s.royalty_cents||0);if(s.settlement_status==='paid')a.paid+=Number(s.royalty_cents||0);return a},{gross:0,royalty:0,payable:0,paid:0}),[sales])
 const jobById=useMemo(()=>new Map(jobs.map(j=>[j.id,j])),[jobs])
 const box:React.CSSProperties={border:'1px solid #31315a',background:'#07071a',borderRadius:12,padding:12}
 if(busy)return <section style={{...box,marginTop:12}} role="status">Loading Print Works sales…</section>
 return <section style={{...box,marginTop:12,borderColor:'#60d39455'}} aria-label="Print Works sales and royalties">
  <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start',flexWrap:'wrap'}}><div><h3 style={{margin:'0 0 5px',color:'#60d394'}}>Print Works • Sales, Tracking & Royalties</h3><div style={{fontSize:11,color:'#aaa'}}>Verified commerce → print job → fulfillment/tracking → settlement → Omni Cash payout eligibility.</div></div><span style={{fontSize:10,color:'#ffd166'}}>SERVER-AUTHORITATIVE SETTLEMENT</span></div>
  {error&&<p style={{color:'#ff9e9e'}}>{error}</p>}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:8,marginTop:10}}>
   {[['Gross sales',totals.gross],['Creator royalty',totals.royalty],['Payable',totals.payable],['Paid',totals.paid]].map(([label,value])=><div key={String(label)} style={box}><div style={{fontSize:9,color:'#888'}}>{label}</div><b>{money(Number(value))}</b></div>)}
  </div>
  {!sales.length?<p style={{fontSize:11,color:'#888'}}>No verified Print Works sales yet. Royalty balances appear only after a real commerce order is linked to a print edition and settlement evidence is received.</p>:<div style={{display:'grid',gap:8,marginTop:10}}>{sales.map(s=>{const job=s.print_job_id?jobById.get(s.print_job_id):undefined;const tracking=job?.tracking||{};const carrier=String((tracking as Record<string,unknown>).carrier||'');const number=String((tracking as Record<string,unknown>).tracking_number||(tracking as Record<string,unknown>).number||'');return <div key={s.id} style={box}><div style={{display:'flex',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}><b>Order {s.commerce_order_id.slice(0,8)}</b><span style={{fontSize:10,color:s.settlement_status==='paid'?'#60d394':s.settlement_status==='held'||s.settlement_status==='reversed'?'#ff8f8f':'#ffd166'}}>{s.settlement_status.toUpperCase()}</span></div><div style={{fontSize:11,color:'#aaa',lineHeight:1.6,marginTop:5}}>Qty {s.quantity} • gross {money(s.gross_cents,s.currency)} • print {money(s.print_cost_cents,s.currency)} • shipping {money(s.shipping_cents,s.currency)} • platform {money(s.platform_fee_cents,s.currency)} • <b style={{color:'#fff'}}>royalty {money(s.royalty_cents,s.currency)}</b><br/>Print job: {job?.status||'awaiting link'}{job?.provider_key?` • ${job.provider_key}`:''}{carrier?` • ${carrier}`:''}{number?` • tracking ${number}`:''}</div></div>})}</div>}
  <p style={{fontSize:10,color:'#777',marginBottom:0}}>A UI sale or print job does not create withdrawable money. Royalty becomes payable only after payment verification, print/shipping cost reconciliation, refund/chargeback checks and settlement rules.</p>
 </section>
}
