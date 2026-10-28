import {useState} from 'react'
import {REVENUE_SERVICES,calculateContribution,LAUNCH_GATES} from '../data/TRYAMMRevenueGuardrails'
export default function TryAMMBusinessSustainability(){
 const [quantities,setQuantities]=useState<Record<string,number>>({'web-preview':2,'studio-edit':8,'business-pass':2})
 const totals=REVENUE_SERVICES.map(s=>calculateContribution(s,quantities[s.id]??0))
 const gross=totals.reduce((a,b)=>a+b.gross,0)
 const contribution=totals.reduce((a,b)=>a+b.contributionBeforeLaborAndFixedCosts,0)
 return <section id="tryamm-business-plan" aria-labelledby="sustainability-title" style={{marginTop:24,padding:20,borderRadius:20,background:'#0b1b22',border:'1px solid #6ba9b7',color:'#fff'}}>
  <div style={{fontSize:11,letterSpacing:2,color:'#9be5cb',fontWeight:900}}>BUSINESS SUSTAINABILITY · PLANNING DEMO</div>
  <h2 id="sustainability-title" style={{fontSize:27,margin:'8px 0'}}>Grow revenue without losing control of costs</h2>
  <p style={{fontSize:13,color:'#c1d5db',lineHeight:1.6}}>Explore sample sales quantities below. The cost assumptions are placeholders for planning; they are not TRYAMM's accounting records, forecasts or customer orders.</p>
  {REVENUE_SERVICES.map(s=><label key={s.id} style={{display:'grid',gridTemplateColumns:'minmax(0,1fr) 95px',gap:10,alignItems:'center',marginTop:12,fontSize:13}}><span>{s.name} · ${s.price}{s.recurring?'/mo':''}</span><input type="number" inputMode="numeric" min={0} max={999} value={quantities[s.id]??0} onChange={e=>setQuantities(p=>({...p,[s.id]:Math.min(999,Math.max(0,Number(e.target.value)||0))}))} style={{width:'100%',boxSizing:'border-box',minHeight:44,borderRadius:9,padding:9,border:'1px solid #7ba8b3',background:'#102b34',color:'#fff',fontSize:16}}/></label>)}
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginTop:18}}>
   <div style={{border:'1px solid #477584',padding:14,borderRadius:12}}><div style={{fontSize:11,color:'#b8cad1'}}>Sample gross receipts</div><strong style={{fontSize:25}}>${gross.toLocaleString()}</strong></div>
   <div style={{border:'1px solid #477584',padding:14,borderRadius:12}}><div style={{fontSize:11,color:'#b8cad1'}}>Before labor and fixed costs</div><strong style={{fontSize:25}}>${contribution.toLocaleString()}</strong></div>
  </div>
  <details style={{marginTop:16,fontSize:12,color:'#d0dae2'}}><summary style={{cursor:'pointer',minHeight:44,fontWeight:800}}>Safety and launch checklist</summary><ul>{LAUNCH_GATES.map(g=><li key={g} style={{margin:'8px 0'}}>{g}</li>)}</ul></details>
  <p style={{fontSize:11,color:'#b6c9cc'}}>Figures exclude labor, payment fees, taxes, hosting fixed costs, refunds and acquisition costs. Recurring quantities represent one illustrative billing month. No money is collected or charged here.</p>
 </section>
}
