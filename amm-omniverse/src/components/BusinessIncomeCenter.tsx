import {useEffect,useMemo,useState} from 'react'
import type {BusinessIncomeEntry,BusinessIncomeSnapshot,BusinessIncomeState} from '../runtime/BusinessIncomeCenterRuntime'

const EMPTY:BusinessIncomeSnapshot={currency:'USD',totals:{pendingMinor:0,verifiedMinor:0,payableMinor:0,paidMinor:0,reversedMinor:0},entries:[]}
const money=(n:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((Number(n)||0)/100)

export default function BusinessIncomeCenter({onClose}:{onClose:()=>void}){
 const [data,setData]=useState<BusinessIncomeSnapshot>(()=>window.__TRYAMM_BUSINESS_INCOME_CENTER__?.snapshot()||EMPTY)
 const [filter,setFilter]=useState<'ALL'|BusinessIncomeState>('ALL')
 useEffect(()=>{
  const on=(e:Event)=>setData((e as CustomEvent<BusinessIncomeSnapshot>).detail||EMPTY)
  window.addEventListener('tryamm:business-income-snapshot',on as EventListener)
  const current=window.__TRYAMM_BUSINESS_INCOME_CENTER__?.snapshot();if(current)setData(current)
  return()=>window.removeEventListener('tryamm:business-income-snapshot',on as EventListener)
 },[])
 const rows=useMemo(()=>filter==='ALL'?data.entries:data.entries.filter(x=>x.state===filter),[data.entries,filter])
 const cards=[['PENDING',data.totals.pendingMinor],['VERIFIED',data.totals.verifiedMinor],['PAYABLE',data.totals.payableMinor],['PAID',data.totals.paidMinor]] as const
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Business Income Center" style={{position:'fixed',inset:0,zIndex:17020,background:'#020711f7',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:980,margin:'0 auto',padding:'18px 14px 72px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
    <div><div style={{fontSize:10,color:'#72e6ff',fontWeight:950,letterSpacing:3}}>TRYAMM BUSINESS INCOME</div><h1 style={{margin:'5px 0',fontSize:'clamp(28px,7vw,48px)'}}>STORE • WORLD • CONTENT • ONE LEDGER</h1><div style={{fontSize:12,color:'#9fb2c4',lineHeight:1.6}}>Storefront sales, services, tickets, rentals, campaigns and digital-twin revenue. Creator and Scout attribution stays attached.</div></div>
    <button onClick={onClose} aria-label="Close Business Income Center" style={close}>×</button>
   </header>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:10,marginTop:16}}>
    {cards.map(([label,value])=><section key={label} style={card}><div style={{fontSize:10,color:'#8fa7ba',fontWeight:900}}>{label}</div><div style={{fontSize:28,fontWeight:950,marginTop:7}}>{money(value)}</div></section>)}
   </div>
   <section style={{...card,marginTop:12}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}>
     <div><b>BUSINESS ACTIVITY</b><div style={{fontSize:10,color:'#8fa4b7'}}>Only authoritative merchant proceeds are shown as cash.</div></div>
     <select value={filter} onChange={e=>setFilter(e.target.value as any)} style={select}>{['ALL','PENDING','VERIFIED','PAYABLE','PAID','REVERSED'].map(x=><option key={x}>{x}</option>)}</select>
    </div>
    <div style={{display:'grid',gap:8,marginTop:12}}>
     {rows.map((row:BusinessIncomeEntry)=><div key={row.id} style={item}><div style={{minWidth:0}}><div style={{fontWeight:900,fontSize:12}}>{row.label}</div><div style={{fontSize:9,color:'#8298aa',marginTop:3}}>{row.source.replaceAll('-',' ').toUpperCase()}{row.sourceVerse?' • '+row.sourceVerse.toUpperCase():''}{row.creatorId?' • CREATOR ATTRIBUTED':''}{row.scoutId?' • SCOUT ATTRIBUTED':''}</div></div><div style={{textAlign:'right'}}><div style={{fontWeight:950}}>{money(row.amountMinor)}</div><div style={{fontSize:9,color:'#8fe8ff'}}>{row.state}</div></div></div>)}
     {!rows.length&&<div style={{padding:18,border:'1px dashed #29435a',borderRadius:12,color:'#8fa4b7',fontSize:11,lineHeight:1.6}}>No server-authoritative merchant cash entries yet. Draft storefronts, demo credits, unverified scans and unpaid orders are intentionally excluded.</div>}
    </div>
   </section>
   <section style={{...card,marginTop:12,borderColor:'#28533f'}}><b style={{color:'#86efb1'}}>GAME + APP INCOME LOOP</b><div style={{fontSize:12,lineHeight:1.7,color:'#c6dfd0',marginTop:6}}>StreetVerse or a Reel creates discovery → Business Passport or creator content supplies attribution → checkout/provider verifies payment → fulfillment completes → merchant, creator, Scout and TRYAMM allocations are written to the authoritative ledger → payable income appears here.</div></section>
  </div>
 </div>
}

const card:React.CSSProperties={background:'#07111ddd',border:'1px solid #1f3a50',borderRadius:16,padding:14}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #36536a',background:'#0a1622',color:'#fff',fontSize:24}
const select:React.CSSProperties={minHeight:44,background:'#0b1724',border:'1px solid #36536a',borderRadius:10,color:'#fff',padding:'0 10px'}
const item:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',padding:10,border:'1px solid #173044',borderRadius:12,background:'#050d17'}