import {useEffect,useMemo,useState} from 'react'
import type {CreatorMoneyEntry,CreatorMoneySnapshot,CreatorMoneyState} from '../runtime/CreatorMoneyCenterRuntime'

const EMPTY:CreatorMoneySnapshot={
  currency:'USD',
  totals:{pendingMinor:0,verifiedMinor:0,payableMinor:0,paidMinor:0,reversedMinor:0},
  entries:[],
}

const money=(minor:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((Number(minor)||0)/100)
const labelFor=(state:CreatorMoneyState)=>state.replaceAll('_',' ')

const stateStyle=(state:CreatorMoneyState):React.CSSProperties=>({
  fontSize:9,fontWeight:950,letterSpacing:1,padding:'5px 7px',borderRadius:999,
  border:'1px solid '+(state==='PAID'?'#3ddc84':state==='PAYABLE'?'#59e7ff':state==='VERIFIED'?'#8de4ff':state==='REVERSED'?'#ff6b6b':'#d9a441'),
  color:state==='PAID'?'#7cffad':state==='PAYABLE'?'#7decff':state==='VERIFIED'?'#b9edff':state==='REVERSED'?'#ff9898':'#ffd56a'
})

export default function CreatorMoneyCenter({onClose}:{onClose:()=>void}){
  const [snapshot,setSnapshot]=useState<CreatorMoneySnapshot>(()=>window.__TRYAMM_CREATOR_MONEY_CENTER__?.snapshot()||EMPTY)
  const [filter,setFilter]=useState<'ALL'|CreatorMoneyState>('ALL')

  useEffect(()=>{
    const onSnapshot=(event:Event)=>setSnapshot((event as CustomEvent<CreatorMoneySnapshot>).detail||EMPTY)
    window.addEventListener('tryamm:creator-money-snapshot',onSnapshot as EventListener)
    const current=window.__TRYAMM_CREATOR_MONEY_CENTER__?.snapshot()
    if(current)setSnapshot(current)
    return()=>window.removeEventListener('tryamm:creator-money-snapshot',onSnapshot as EventListener)
  },[])

  const rows=useMemo(()=>filter==='ALL'?snapshot.entries:snapshot.entries.filter(x=>x.state===filter),[snapshot.entries,filter])

  const cards=[
    ['PENDING',snapshot.totals.pendingMinor,'Awaiting server/provider verification'],
    ['VERIFIED',snapshot.totals.verifiedMinor,'Verified, not yet payable'],
    ['PAYABLE',snapshot.totals.payableMinor,'Eligible for payout workflow'],
    ['PAID',snapshot.totals.paidMinor,'Completed payouts'],
  ] as const

  return <div role="dialog" aria-modal="true" aria-label="TRYAMM Creator Money Center" style={{position:'fixed',inset:0,zIndex:17000,background:'radial-gradient(circle at top,#10263a 0%,#030712 48%,#010208 100%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'18px 14px 70px'}}>
      <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
        <div>
          <div style={{fontSize:10,letterSpacing:3,color:'#66e7ff',fontWeight:950}}>TRYAMM CREATOR MONEY CENTER</div>
          <h1 style={{margin:'5px 0',fontSize:'clamp(28px,7vw,48px)'}}>YOUR MONEY • ONE VIEW</h1>
          <div style={{fontSize:12,color:'#a9bbcc',lineHeight:1.55,maxWidth:760}}>Reels • LIVE gifts • missions • sales • referrals • licenses • rentals • tickets • campaigns. Cash appears here only after authoritative server/provider evidence.</div>
        </div>
        <button onClick={onClose} aria-label="Close Creator Money Center" style={close}>×</button>
      </header>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:10,marginTop:16}}>
        {cards.map(([state,amount,note])=><section key={state} style={card}>
          <div style={stateStyle(state)}>{state}</div>
          <div style={{fontSize:28,fontWeight:950,marginTop:9}}>{money(amount)}</div>
          <div style={{fontSize:10,color:'#93a7ba',marginTop:5,lineHeight:1.4}}>{note}</div>
        </section>)}
      </div>

      <section style={{...card,marginTop:12}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}>
          <div>
            <div style={{fontWeight:950}}>EARNING ACTIVITY</div>
            <div style={{fontSize:10,color:'#8fa4b7'}}>Server-authoritative cash events only • XP and Holo Credits stay separate</div>
          </div>
          <select value={filter} onChange={e=>setFilter(e.target.value as any)} style={select}>
            {['ALL','PENDING','VERIFIED','PAYABLE','PAID','REVERSED'].map(x=><option key={x} value={x}>{x}</option>)}
          </select>
        </div>

        <div style={{display:'grid',gap:8,marginTop:12}}>
          {rows.map((row:CreatorMoneyEntry)=><div key={row.id} style={rowStyle}>
            <div style={{minWidth:0}}>
              <div style={{fontWeight:900,fontSize:12,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{row.label}</div>
              <div style={{fontSize:9,color:'#8499ad',marginTop:3}}>{row.source.replaceAll('-',' ').toUpperCase()} • {new Date(row.updatedAt).toLocaleString()}</div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <div style={{fontWeight:950}}>{money(row.amountMinor)}</div>
              <span style={stateStyle(row.state)}>{labelFor(row.state)}</span>
            </div>
          </div>)}
          {!rows.length&&<div style={{padding:18,border:'1px dashed #29435a',borderRadius:12,color:'#8fa4b7',fontSize:11,lineHeight:1.6}}>No authoritative cash entries in this view yet. That is different from having no gameplay rewards: demo credits, XP and unverified client events are intentionally excluded.</div>}
        </div>
      </section>

      <section style={{...card,marginTop:12,borderColor:'#28533f'}}>
        <div style={{fontWeight:950,color:'#85f0b1'}}>MONEY PATH</div>
        <div style={{fontSize:12,lineHeight:1.7,color:'#c6dfd0',marginTop:6}}>Create / Sell / Complete → provider or server verifies → ledger records attribution → PAYABLE → payout workflow → PAID. Reversals and refunds remain visible instead of disappearing.</div>
      </section>
    </div>
  </div>
}

const card:React.CSSProperties={background:'#07111ddd',border:'1px solid #1f3a50',borderRadius:16,padding:14}
const close:React.CSSProperties={width:42,height:42,borderRadius:'50%',border:'1px solid #38536b',background:'#0b1724',color:'#fff',fontSize:24}
const select:React.CSSProperties={minHeight:40,background:'#0b1724',border:'1px solid #36536a',borderRadius:9,color:'#fff',padding:'0 10px'}
const rowStyle:React.CSSProperties={display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',padding:10,border:'1px solid #173044',borderRadius:12,background:'#050d17'}
