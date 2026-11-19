import { useState } from 'react'

const lanes=[
 {title:'Kevon Forex & Stock AI',detail:'Previously developed simulated foreign exchange and stock-learning experience. Its current live app route has not been verified.'},
 {title:'World Markets',detail:'Market education and analysis. Live market data connections must be disclosed and separately verified.'},
 {title:'Jacobie DRIP Lab',detail:'Fictional dividend-reinvestment scenarios and long-term planning lessons; no trades executed.'},
 {title:'V92 Finance Academy',detail:'Financial literacy, risk education, responsible investment simulation and workforce-ready skills.'}
]
export default function AllAmericanFinancialAcademyHub({onClose,onOpenUniversity}:{onClose:()=>void;onOpenUniversity:()=>void}){
 const [riskAcknowledged,setRiskAcknowledged]=useState(false)
 const btn:React.CSSProperties={minHeight:56,background:'#153a42',border:'1px solid #56a5b3',color:'#fff',borderRadius:14,padding:14,fontWeight:800,fontSize:16,cursor:'pointer'}
 return <section role="dialog" aria-modal="true" aria-label="All American Financial Academy" style={{position:'fixed',inset:0,zIndex:2147483550,overflowY:'auto',background:'#061a1e',color:'#fff',padding:'clamp(16px,4vw,38px)'}}>
  <main style={{maxWidth:760,margin:'0 auto',display:'grid',gap:15}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center'}}><h1 style={{fontSize:27,margin:0}}>All American Financial Academy</h1><button style={btn} onClick={onClose}>Close</button></header>
   <p role="status" style={{padding:14,borderRadius:12,background:'#3a2c19',lineHeight:1.6}}>Simulation and education only. No brokerage, real trades, automatic investment profits or withdrawal services are enabled or verified here.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:12}}>
    {lanes.map(item=><article key={item.title} style={{border:'1px solid #47717a',borderRadius:14,padding:16}}><h2 style={{fontSize:19,margin:'0 0 8px'}}>{item.title}</h2><p style={{lineHeight:1.6,margin:0}}>{item.detail}</p></article>)}
   </div>
   <label style={{display:'flex',alignItems:'flex-start',gap:12,lineHeight:1.5,fontSize:14}}><input type="checkbox" style={{width:22,height:22,flexShrink:0}} checked={riskAcknowledged} onChange={e=>setRiskAcknowledged(e.target.checked)}/>I understand simulations are educational and do not promise returns or place live trades.</label>
   <button style={{...btn,opacity:riskAcknowledged?1:.5}} disabled={!riskAcknowledged} onClick={onOpenUniversity}>Open existing All American University</button>
   <p style={{fontSize:12,color:'#c2dee3',lineHeight:1.65}}>Finance activity must not receive health records or patient identities from OmniCare360. Investment recommendations or execution require separate regulatory review and authorized providers.</p>
  </main>
 </section>
}
