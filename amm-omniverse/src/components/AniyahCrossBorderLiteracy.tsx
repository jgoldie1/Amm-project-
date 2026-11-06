import {useMemo,useState} from 'react'
/** Education-only cross-border quote calculator; not a transfer service.
 * Never accepts card, bank, recipient, identity or authentication data. */
export type CrossBorderQuote={sendUsd:number;rate:number;feeUsd:number;received:number;effectiveRate:number;totalDebitUsd:number}
export function calculateCrossBorderQuote(sendUsd:number,rate:number,feeUsd:number):CrossBorderQuote{
 if(![sendUsd,rate,feeUsd].every(Number.isFinite)||sendUsd<=0||sendUsd>100000||rate<=0||feeUsd<0||feeUsd>sendUsd)throw Error('INVALID_QUOTE_INPUT')
 const received=Math.round((sendUsd-feeUsd)*rate*100)/100
 return {sendUsd,rate,feeUsd,received,effectiveRate:received/sendUsd,totalDebitUsd:sendUsd}
}
const lessons=[
 {title:'Exchange rate',body:'The rate tells you how much foreign currency one US dollar buys. Compare the provider rate with a reliable reference rate.'},
 {title:'Fees and spread',body:'A provider may charge a visible fee and also add a margin to the exchange rate. Compare how much the recipient receives, not just the advertised fee.'},
 {title:'Safety and scams',body:'Never send money to strangers promising guaranteed returns. Verify the recipient and provider independently. Never share passwords or one-time codes.'},
 {title:'Consumer protection',body:'Check licensed-provider disclosures, cancellation rights, refund procedures, delivery timing and supported countries before paying.'},
 {title:'Budgeting',body:'Set aside necessities and emergency savings first. Use this simulator to understand costs; it does not move real money.'}
]
export default function AniyahCrossBorderLiteracy(){
 const [amount,setAmount]=useState('100'),[rate,setRate]=useState('0.90'),[fee,setFee]=useState('4')
 const [lesson,setLesson]=useState(0)
 const quote=useMemo(()=>{try{return calculateCrossBorderQuote(Number(amount),Number(rate),Number(fee))}catch{return null}},[amount,rate,fee])
 return <section aria-label="Aniyah Cross Borders financial literacy" style={{padding:16,border:'1px solid #486a80',borderRadius:14,background:'#0a1b2b',color:'#fff',marginTop:16}}>
  <h2>Aniyah Cross Borders · HoloGPT Financial Literacy</h2>
  <p>Practice-only transfer comparison. Exchange rates and fees below are examples you enter, not live quotes. No real payment is initiated.</p>
  <div style={{display:'flex',gap:12,flexWrap:'wrap'}}>
   <label>Amount in USD <input aria-label="Amount in USD" type="number" min="1" max="100000" value={amount} onChange={e=>setAmount(e.target.value)} style={input}/></label>
   <label>Example destination units per USD <input aria-label="Destination currency rate" type="number" min=".000001" step="any" value={rate} onChange={e=>setRate(e.target.value)} style={input}/></label>
   <label>Example transfer fee USD <input aria-label="Transfer fee in USD" type="number" min="0" step=".01" value={fee} onChange={e=>setFee(e.target.value)} style={input}/></label>
  </div>
  {quote?<p role="status">Estimated recipient amount: <strong>{quote.received.toLocaleString(undefined,{maximumFractionDigits:2})} destination units</strong>. Total deducted: ${quote.totalDebitUsd.toFixed(2)} USD including ${quote.feeUsd.toFixed(2)} fee. Effective recipient rate: {quote.effectiveRate.toFixed(4)} units/USD.</p>:<p role="alert">Enter a valid amount, rate and fee (fee cannot exceed amount).</p>}
  <h3>HoloGPT Learning Guide (offline)</h3>
  <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{lessons.map((l,i)=><button type="button" key={l.title} onClick={()=>setLesson(i)} aria-pressed={lesson===i} style={{padding:10,minHeight:44,background:lesson===i?'#3d6591':'#142b40',border:'1px solid #7791ad',color:'#fff',borderRadius:8}}>{l.title}</button>)}</div>
  <p aria-live="polite"><strong>{lessons[lesson].title}:</strong> {lessons[lesson].body}</p>
  <p style={{fontSize:12}}>Real international payments require an authorized regulated provider, eligibility checks, age-appropriate account ownership, identity verification, sanctions screening, compliant disclosures and confirmed settlement. This module performs none of those actions.</p>
 </section>
}
const input:React.CSSProperties={display:'block',padding:10,minHeight:44,maxWidth:180,background:'#fff',color:'#111',borderRadius:8}
