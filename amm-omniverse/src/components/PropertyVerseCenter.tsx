import { useMemo,useState } from 'react'
import { PROPERTYVERSE_LANES,readPropertyListings,type PropertyLane } from '../data/PropertyVerseRegistry'

type Props={onClose:()=>void}
const laneOrder:PropertyLane[]=['global-stays','hud-assisted','farmland','land-bank']

export default function PropertyVerseCenter({onClose}:Props){
  const [lane,setLane]=useState<PropertyLane>('global-stays')
  const [query,setQuery]=useState('')
  const listings=useMemo(()=>readPropertyListings(),[])
  const cfg=Object.values(PROPERTYVERSE_LANES).find(x=>x.id===lane)!
  const visible=listings.filter(x=>x.lane===lane&&(!query||`${x.title} ${x.city||''} ${x.region||''} ${x.country}`.toLowerCase().includes(query.toLowerCase())))
  const btn:React.CSSProperties={border:'1px solid #4fe3ff55',background:'#0b1624',color:'#fff',borderRadius:10,padding:'9px 11px',fontWeight:850,cursor:'pointer'}
  const card:React.CSSProperties={border:'1px solid #203247',background:'linear-gradient(145deg,#091522,#0a0e17)',borderRadius:16,padding:14}
  return <div style={{position:'fixed',inset:0,zIndex:10070,overflowY:'auto',background:'#030812',color:'#fff',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:1100,margin:'0 auto',padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',position:'sticky',top:0,zIndex:3,background:'#030812ee',padding:'8px 0 14px',backdropFilter:'blur(10px)'}}><div><div style={{fontSize:11,color:'#5ee7ff',fontWeight:950,letterSpacing:2}}>TRYAMM PROPERTYVERSE</div><h1 style={{margin:'4px 0 0',fontSize:25}}>Housing • Stays • Farmland • Land Bank</h1></div><button style={btn} onClick={onClose}>← Exit</button></div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:14}}>{laneOrder.map(id=><button key={id} style={{...btn,background:id===lane?'#12374a':'#0b1624',color:id===lane?'#8ff1ff':'#fff'}} onClick={()=>setLane(id)}>{PROPERTYVERSE_LANES[id==='global-stays'?'globalStays':id==='hud-assisted'?'hudAssisted':id==='farmland'?'farmland':'landBank'].label}</button>)}</div>
      <section style={{...card,borderColor:'#4fe3ff55'}}><h2 style={{margin:'0 0 7px'}}>{cfg.label}</h2><p style={{margin:'0 0 10px',color:'#bdc9d6',lineHeight:1.55}}>{cfg.description}</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{cfg.features.map(x=><span key={x} style={{fontSize:10,border:'1px solid #31516d',borderRadius:999,padding:'5px 8px',color:'#9adff0'}}>{x}</span>)}</div></section>
      <div style={{display:'grid',gridTemplateColumns:'1fr minmax(250px,.36fr)',gap:12,marginTop:12}}>
        <section style={card}><div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center'}}><h3 style={{margin:0}}>Listings & opportunities</h3><span style={{fontSize:10,color:'#7ef29a',fontWeight:900}}>{visible.length} CURRENT</span></div><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search city, region, country or listing" style={{width:'100%',boxSizing:'border-box',margin:'12px 0',padding:'11px 12px',borderRadius:10,border:'1px solid #29445b',background:'#07101a',color:'#fff'}}/>{visible.length?visible.map(x=><article key={x.id} style={{borderTop:'1px solid #1d3042',padding:'11px 0'}}><b>{x.title}</b><div style={{fontSize:11,color:'#91a4b7',marginTop:3}}>{[x.city,x.region,x.country].filter(Boolean).join(', ')} • {x.status} • {x.verified?'verified source':'verification required'}</div></article>):<div style={{padding:'24px 4px',color:'#7f91a3',fontSize:12}}>No verified live listings have been loaded into this lane yet. The workflow is active; real source feeds/listing onboarding still need to populate it.</div>}</section>
        <aside style={card}><h3 style={{marginTop:0}}>Verification gates</h3>{cfg.compliance.map(x=><div key={x} style={{fontSize:11,color:'#b9c7d5',lineHeight:1.45,marginBottom:8}}>✓ {x}</div>)}<div style={{marginTop:14,padding:10,borderRadius:10,background:'#261b08',border:'1px solid #e8b94466',fontSize:10,lineHeight:1.5,color:'#f0d990'}}>TRYAMM does not imply HUD, PHA, land-bank or government endorsement. Eligibility, participation, title, ownership and approvals require authoritative verification.</div></aside>
      </div>
    </div>
  </div>
}
