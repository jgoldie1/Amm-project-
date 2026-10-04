import {useMemo,useState} from 'react'
import {BUSINESS_PRODUCT_CATALOG,type RevenueModel} from '../data/ElSaturnBusinessRevenueCatalog'

const models:RevenueModel[]=['subscription','usage','transaction-fee','setup-fee','managed-service','marketplace-commission','license','fabrication-margin','delivery-fee','fintech-fee']
export default function ElSaturnBusinessRevenueCenter({onClose}:{onClose:()=>void}){
 const [filter,setFilter]=useState<RevenueModel|'all'>('all')
 const products=useMemo(()=>filter==='all'?BUSINESS_PRODUCT_CATALOG:BUSINESS_PRODUCT_CATALOG.filter(p=>p.revenueModels.includes(filter)),[filter])
 return <div role="dialog" aria-modal="true" aria-label="El Saturn Business Revenue Center" style={{position:'fixed',inset:0,zIndex:17400,background:'#02050bf7',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}><div style={{maxWidth:1180,margin:'0 auto',padding:'18px 14px 72px'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:12}}><div><div style={{fontSize:10,letterSpacing:3,color:'#e8b944',fontWeight:950}}>EL SATURN • TRYAMM • LYONS TECH • MIDDLEVERSE AI</div><h1 style={{margin:'5px 0'}}>BUSINESS REVENUE CENTER</h1><p style={{fontSize:12,color:'#a9bac8',maxWidth:800,lineHeight:1.6}}>Package the technology into sellable SaaS, transaction, managed-service, fintech, logistics and advanced-manufacturing products.</p></div><button onClick={onClose} style={close}>×</button></header>
  <div style={{display:'flex',gap:7,flexWrap:'wrap',marginTop:14}}><button style={button} onClick={()=>setFilter('all')}>ALL</button>{models.map(m=><button key={m} style={button} onClick={()=>setFilter(m)}>{m.toUpperCase()}</button>)}</div>
  <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:10,marginTop:14}}>{products.map(p=><article key={p.id} style={card}><div style={{fontSize:9,color:'#6de7ff',fontWeight:900}}>{p.brand.toUpperCase()} • {p.category.toUpperCase()}</div><h2 style={{margin:'6px 0'}}>{p.name}</h2><div style={{fontSize:10,color:p.status==='provider-gated'?'#ffd180':p.status==='pilot'?'#c9a8ff':'#83efaf',fontWeight:900}}>{p.status.toUpperCase()}</div><p style={copy}>{p.value}</p><div style={{display:'flex',gap:5,flexWrap:'wrap'}}>{p.revenueModels.map(r=><span key={r} style={chip}>{r}</span>)}</div><p style={{...copy,fontSize:10}}>Customer: {p.customer}</p>{p.productionBoundary&&<p style={{...copy,color:'#ffd9a0'}}>Boundary: {p.productionBoundary}</p>}</article>)}</section>
  <section style={{...card,marginTop:12}}><h2>Best commercial sequence</h2><p style={copy}><b>1.</b> Sell recurring SaaS first. <b>2.</b> Add setup/onboarding. <b>3.</b> Add managed services. <b>4.</b> Add transaction/marketplace fees only when real provider settlement is verified. <b>5.</b> Sell fabrication/robotics through quoted jobs and pilots before promising mass production.</p></section>
 </div></div>
}
const card:React.CSSProperties={background:'#07111ddd',border:'1px solid #243d50',borderRadius:16,padding:14}
const copy:React.CSSProperties={fontSize:11,color:'#aabdc9',lineHeight:1.6}
const button:React.CSSProperties={minHeight:40,border:'1px solid #4fe3ff66',borderRadius:10,background:'#0b1b27',color:'#fff',fontWeight:900,padding:'0 11px'}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #36536a',background:'#0a1622',color:'#fff',fontSize:24}
const chip:React.CSSProperties={padding:'5px 7px',borderRadius:999,border:'1px solid #315267',background:'#0a1924',fontSize:9,color:'#d7edf7'}