import {useState} from 'react'
import {calculateEconomics,ECONOMICS_EXAMPLE,type EconomicsInput} from './businessEconomics'
const fields:[keyof EconomicsInput,string,number][]=[
 ['customers','Retained paying customers',1000000],['price','Average monthly price per customer · USD',1000000],
 ['variableCost','Delivery, support, AI and processing cost per customer · USD',1000000],
 ['commissionPercent','Recurring sales commission · % of collections after refunds',100],
 ['refundPercent','Refund / uncollected revenue allowance · %',100],
 ['fixedCost','All other monthly operating costs · USD',1000000],['ownerPay','Monthly owner pay allowance · USD',1000000],
 ['cashAvailable','Cash available after existing obligations · USD',100000000],
]
const example=()=>Object.fromEntries(Object.entries(ECONOMICS_EXAMPLE).map(([k,v])=>[k,String(v)])) as Record<keyof EconomicsInput,string>
const dollars=(n:number)=>n.toLocaleString('en-US',{style:'currency',currency:'USD'})
export default function BusinessEconomicsPlanner(){
 const [values,setValues]=useState(example),[notice,setNotice]=useState('')
 let result:ReturnType<typeof calculateEconomics>|null=null,error=''
 const input=Object.fromEntries(Object.entries(values).map(([k,v])=>[k,Number(v)])) as EconomicsInput
 try{if(Object.values(values).some(v=>!v.trim()))throw new Error('Complete every field to calculate.');result=calculateEconomics(input)}catch(e){error=e instanceof Error?e.message:'Check your entries.'}
 function download(){if(!result)return;const blob=new Blob([JSON.stringify({version:1,status:'planning-only-not-actual-financials',assumptions:input,scenario:result,excludes:'Taxes and any expense not entered. No billing, payout or budget controls are changed.'},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='TRYAMM-business-cost-scenario.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);setNotice('Scenario prepared for download. No settings were changed.')}
 return <details><summary>Plan monthly costs and break-even</summary><p>Illustrative planning only. Replace every assumption with actual figures. This is not a revenue report or profit guarantee. Entries stay on this page and clear when you leave; download to keep them.</p>
 <div className="template-form">{fields.map(([key,label,max])=><label key={key}>{label}<input type="number" min="0" max={max} step={key==='customers'?'1':'0.01'} value={values[key]} onChange={e=>{setValues(v=>({...v,[key]:e.target.value}));setNotice('')}}/></label>)}</div>
 <p>Include salesperson base pay, tools and ongoing development in fixed costs; include per-customer labor in variable costs. Do not count the same expense twice. Commission here is on collections after the refund allowance. Taxes and unentered expenses are excluded. Setup fees are excluded from recurring revenue.</p>
 {error?<p role="status">{error}</p>:result&&<div aria-live="polite"><dl>
 <dt>Monthly revenue before allowances</dt><dd>{dollars(result.gross)}</dd><dt>Refund / uncollected allowance</dt><dd>{dollars(result.refundAllowance)}</dd>
 <dt>Recurring commission</dt><dd>{dollars(result.commissions)}</dd><dt>Delivery and other variable costs</dt><dd>{dollars(result.variable)}</dd>
 <dt>Fixed costs and owner pay</dt><dd>{dollars(result.fixed)}</dd><dt>Modeled monthly remainder before taxes</dt><dd><strong>{dollars(result.remainder)}</strong></dd>
 <dt>Customers needed to cover modeled monthly costs</dt><dd>{result.breakEven===null?'No sustainable break-even at these unit costs.':result.breakEven}</dd>
 <dt>Cash runway at this modeled loss rate</dt><dd>{result.runwayMonths===null?'No monthly loss in this scenario; this is not a growth forecast.':result.runwayMonths.toFixed(1)+' months'}</dd></dl>
 <p>{result.remainder>0?'Positive in this scenario only. Check actual renewals, delivery capacity and reserves before adding staff.':'This scenario does not produce a positive remainder. Review price, costs and staffing before expanding.'}</p></div>}
 <button type="button" disabled={!result} onClick={download}>Download cost scenario</button><button type="button" onClick={()=>{setValues(example());setNotice('Illustrative assumptions restored.')}}>Reset example</button><p role="status">{notice}</p>
 </details>
}
