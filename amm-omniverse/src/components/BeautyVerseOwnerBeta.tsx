import { useState } from 'react'
type Tab='Appointments'|'Fashion Orders'|'Classes'|'Streaming'|'Earnings'
const tabs:Tab[]=['Appointments','Fashion Orders','Classes','Streaming','Earnings']
const guidance:Record<Tab,string[]>={
 'Appointments':['Connect the shop calendar and working hours','Verify licensing for every regulated service','Set real prices, durations and cancellation policies'],
 'Fashion Orders':['Approve suppliers, stock and shipping areas','Connect the business-owned merchant account','Test fulfillment, refunds and sales tax'],
 'Classes':['List permitted non-licensure workshops only','Verify Florida school approvals before career credentials or enrollment','Publish approved curriculum and student policies'],
 'Streaming':['Verify official La Taeasia streaming accounts','Publish a schedule and consent-based content','Connect authorized product offers to livestream events'],
 'Earnings':['Only confirmed settled transactions count as income','Separate gross sales, refunds, expenses and platform fees','Never calculate creator payouts from client-only events'],
}
export default function BeautyVerseOwnerBeta(){
 const [tab,setTab]=useState<Tab>('Appointments')
 return <main style={{background:'#140f19',color:'#fff',minHeight:'100vh',fontFamily:'system-ui',padding:'24px 14px'}}>
  <div style={{maxWidth:880,margin:'auto'}}>
   <a href="/streetverse/tampa" style={{color:'#fac5e4'}}>← Tampa BeautyVerse</a>
   <p style={{color:'#ffc4dc',letterSpacing:2}}>LA TAEASIA BEAUTYVERSE</p><h1>Owner Operations Preview</h1>
   <p role="status" style={{background:'#43272e',padding:14,borderRadius:12}}>Demonstration only. No appointments, customer details, sales, payments or earnings are connected. This page is not an authenticated owner portal; never enter private customer data here.</p>
   <nav aria-label="Business departments" style={{display:'flex',gap:8,flexWrap:'wrap'}}>{tabs.map(t=><button type="button" key={t} aria-pressed={tab===t} onClick={()=>setTab(t)} style={{padding:'12px 14px',borderRadius:10,border:0,background:tab===t?'#edb3c8':'#e8dce4',color:'#20151f'}}>{t}</button>)}</nav>
   <section aria-live="polite" style={{marginTop:20,border:'1px solid #8b5679',borderRadius:14,padding:20}}>
    <h2>{tab}</h2><p>Setup items required before activation:</p>
    <ul>{guidance[tab].map(item=><li key={item} style={{marginBottom:12}}>{item}</li>)}</ul>
    <p>Activation status: Pending owner verification and backend integration.</p>
   </section>
   <p>CrossVerse can direct customers to approved offers, but the merchant, booking and earnings systems must verify server-side records independently.</p>
  </div>
 </main>
}
