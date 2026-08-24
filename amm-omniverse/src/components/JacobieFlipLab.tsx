import { useMemo, useState } from 'react'
import { analyzeFlip, scenarioAnalysis, FLIP_WORKSTREAMS, REGULATED_GATES } from '../realestate/flipOperations'

const card:React.CSSProperties={background:'#08121f',border:'1px solid #24415d',borderRadius:16,padding:16}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',background:'#040a12',color:'#fff',border:'1px solid #29445d',borderRadius:10,padding:'10px 11px'}
const btn:React.CSSProperties={border:'1px solid #4fe3ff77',background:'#0b1c2b',color:'#bff5ff',borderRadius:10,padding:'9px 11px',fontWeight:900,cursor:'pointer'}

function money(n:number){return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(Number.isFinite(n)?n:0)}

export default function JacobieFlipLab({onClose}:{onClose:()=>void}){
  const [values,setValues]=useState({purchasePrice:120000,rehabBudget:45000,financingCost:9000,carryingCost:8000,closingBuyingCost:3500,closingSellingCost:15000,taxesAndOther:4500,afterRepairValue:235000})
  const [message,setMessage]=useState('')
  const analysis=useMemo(()=>analyzeFlip(values),[values])
  const scenarios=useMemo(()=>scenarioAnalysis(values),[values])
  const update=(k:keyof typeof values,v:string)=>setValues(s=>({...s,[k]:Number(v)||0}))

  return <section style={{position:'fixed',inset:0,zIndex:10140,overflowY:'auto',background:'radial-gradient(circle at 20% 0,#15334c,#03060c 58%)',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1200,margin:'0 auto',padding:'22px 18px 110px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><div><div style={{fontSize:10,letterSpacing:3,fontWeight:950,color:'#4fe3ff'}}>JACOBIE VISION • POWERED BY STUBBS AI</div><h1 style={{fontSize:'clamp(34px,6vw,62px)',margin:'6px 0'}}>House Flipping Operations Lab</h1><p style={{maxWidth:850,color:'#a9b8c7',lineHeight:1.6}}>Analyze deals, plan rehab, document projects, create media and Holo listings, protect property records and coordinate approved work. Estimates are planning tools, not guarantees or licensed appraisals.</p></div><button style={btn} onClick={onClose}>← Jacobie Vision</button></header>

      {message&&<div style={{...card,marginTop:12,borderColor:'#4fe3ff66'}}>{message}</div>}

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10,marginTop:16}}>
        {Object.entries(values).map(([k,v])=><label key={k} style={card}><div style={{fontSize:10,color:'#91a6ba',marginBottom:6,textTransform:'uppercase'}}>{k.replace(/([A-Z])/g,' $1')}</div><input aria-label={k} style={input} type="number" value={v} onChange={e=>update(k as keyof typeof values,e.target.value)}/></label>)}
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:10,marginTop:14}}>
        {[['Total Project Cost',money(analysis.totalProjectCost)],['Projected Profit',money(analysis.projectedProfit)],['ROI',`${(analysis.roi*100).toFixed(1)}%`],['Break-even Sale',money(analysis.breakEvenSalePrice)]].map(([a,b])=><article key={a} style={card}><div style={{fontSize:10,color:'#91a6ba'}}>{a}</div><div style={{fontSize:25,fontWeight:950,marginTop:6}}>{b}</div></article>)}
      </div>

      <section style={{marginTop:18}}><h2>Best / Base / Worst Case</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:10}}>{(['best','base','worst'] as const).map(s=><article key={s} style={card}><div style={{fontSize:11,fontWeight:950,textTransform:'uppercase',color:s==='best'?'#8fffc1':s==='worst'?'#ff9aad':'#e8b944'}}>{s}</div><div style={{marginTop:8}}>ARV: <b>{money(scenarios[s].afterRepairValue)}</b></div><div>Cost: <b>{money(scenarios[s].totalProjectCost)}</b></div><div>Profit: <b>{money(scenarios[s].projectedProfit)}</b></div><div>ROI: <b>{(scenarios[s].roi*100).toFixed(1)}%</b></div></article>)}</div></section>

      <section style={{marginTop:18}}><h2>Flip Workstreams</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>{FLIP_WORKSTREAMS.map(w=><article key={w.key} style={card}><h3 style={{marginTop:0}}>{w.title}</h3><div style={{fontSize:11,color:'#9fb0bf',lineHeight:1.6}}>{w.outputs.join(' • ')}</div><button style={{...btn,marginTop:12}} onClick={()=>setMessage(`${w.title} opened as a supervised Jacobie Vision workstream. Save evidence and sources before supervisor approval.`)}>Start Workstream</button></article>)}</div></section>

      <section style={{marginTop:18}}><h2>Regulated Service Gates</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>{Object.entries(REGULATED_GATES).map(([name,g])=><article key={name} style={{...card,borderColor:'#e8b94455'}}><div style={{fontWeight:950,textTransform:'capitalize'}}>{name}</div><div style={{fontSize:11,color:'#a9b0ba',lineHeight:1.55,marginTop:7}}>{g.rule}</div></article>)}</div></section>

      <article style={{...card,marginTop:18,borderColor:'#53ddff66'}}><h2 style={{marginTop:0}}>Execution Path</h2><div style={{fontWeight:900,lineHeight:1.9}}>FIND PROPERTY → COMPS → ARV RANGE → INSPECTION/DUE DILIGENCE → REHAB BUDGET → FINANCING/CARRY → OFFER MODEL → QUALIFIED PROFESSIONAL GATES → ACQUIRE → RENOVATION TRACKING → QA → PHOTO/VIDEO + 3D SCAN → HOLO LISTING → MARKETING → SALE/RENT → PROFIT/LOSS CLOSEOUT → PORTFOLIO.</div></article>
    </div>
  </section>
}
