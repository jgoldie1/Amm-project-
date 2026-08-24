import { useEffect, useMemo, useState } from 'react'
import { getAniyahCrossborder } from '../services/familyVentures'

type CrossBorderStatus={quotes:any[];transfers:any[];liveTransfersEnabled:boolean;reason:string}

const money=(value:number,currency='USD')=>new Intl.NumberFormat(undefined,{style:'currency',currency}).format(value)

export default function OmniCashLauncher(){
  const [open,setOpen]=useState(false)
  const [status,setStatus]=useState<CrossBorderStatus|null>(null)
  const [error,setError]=useState('')
  const [amount,setAmount]=useState('100')
  const [from,setFrom]=useState('USD')
  const [to,setTo]=useState('NGN')

  useEffect(()=>{
    const show=()=>setOpen(true)
    ;(window as any).__showOmniCash=show
    ;(window as any).__showAniyahCrossBorder=show
    const omni=()=>show()
    const cross=()=>show()
    window.addEventListener('tryamm:omnicash-open',omni)
    window.addEventListener('tryamm:aniyah-crossborder-open',cross)
    return()=>{
      window.removeEventListener('tryamm:omnicash-open',omni)
      window.removeEventListener('tryamm:aniyah-crossborder-open',cross)
      delete (window as any).__showOmniCash
      delete (window as any).__showAniyahCrossBorder
    }
  },[])

  useEffect(()=>{
    if(!open)return
    setError('')
    getAniyahCrossborder().then(setStatus).catch(e=>setError(e instanceof Error?e.message:'Unable to load cross-border status'))
  },[open])

  const numericAmount=Math.max(0,Number(amount)||0)
  const simulation=useMemo(()=>({
    source:from,
    destination:to,
    amount:numericAmount,
    fee:numericAmount*0.015,
    receive:numericAmount*0.985,
  }),[numericAmount,from,to])

  if(!open)return <button type="button" aria-label="Open OmniCash" onClick={()=>setOpen(true)} style={{position:'fixed',left:12,bottom:122,zIndex:8994,border:'1px solid #e8b94488',borderRadius:999,padding:'10px 14px',background:'linear-gradient(135deg,#1e1807,#10261f)',color:'#ffe49b',fontSize:10,fontWeight:950,letterSpacing:1,cursor:'pointer',boxShadow:'0 8px 28px #0009'}}>💳 OMNICASH</button>

  return <div role="dialog" aria-modal="true" aria-label="OmniCash and Aniyah Cross-Border Pay" style={{position:'fixed',inset:0,zIndex:13000,background:'radial-gradient(circle at 50% 0,#16352f,#05080d 48%,#010204)',color:'#fff',overflowY:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
    <div style={{maxWidth:980,margin:'0 auto',padding:'20px 18px 80px'}}>
      <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,marginBottom:20}}>
        <div><div style={{fontSize:10,color:'#4FE3FF',fontWeight:950,letterSpacing:3}}>TRYAMM MONEY</div><h1 style={{margin:'5px 0 0',fontSize:'clamp(30px,6vw,56px)'}}>OmniCash</h1><div style={{color:'#E8B944',fontWeight:900,marginTop:4}}>Aniyah Cross-Border Pay</div></div>
        <button onClick={()=>setOpen(false)} aria-label="Close OmniCash" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #4b5968',background:'#101722',color:'#fff',fontSize:24,cursor:'pointer'}}>×</button>
      </header>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:12,marginBottom:16}}>
        <div style={card}><div style={eyebrow}>WALLET LEDGER</div><h2 style={heading}>OmniCash Wallet</h2><p style={copy}>One money surface for subscriptions, purchases, creator earnings, vendor payouts and approved payment-provider adapters.</p><div style={badge}>LEDGER UI • PROVIDER-GATED</div></div>
        <div style={card}><div style={eyebrow}>CROSS-BORDER</div><h2 style={heading}>Aniyah Pay</h2><p style={copy}>Quote and transfer architecture with KYC, AML, sanctions screening and explicit user confirmation before real funds move.</p><div style={badge}>{status?.liveTransfersEnabled?'LIVE ADAPTER ENABLED':'SIMULATION / ADAPTER STAGE'}</div></div>
        <div style={card}><div style={eyebrow}>PROTECTION</div><h2 style={heading}>No Silent Money Movement</h2><p style={copy}>This screen never claims a transfer completed unless an approved backend/provider confirms it. Quotes shown below are simulation-only unless live transfer status is enabled.</p></div>
      </section>

      <section style={{...card,padding:20}}>
        <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'end',flexWrap:'wrap'}}><div><div style={eyebrow}>QUOTE LAB</div><h2 style={heading}>Cross-Border Quote</h2></div><span style={badge}>{status?.liveTransfersEnabled?'PROVIDER READY':'SIMULATION'}</span></div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))',gap:10,marginTop:14}}>
          <label style={label}>Amount<input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)} style={input}/></label>
          <label style={label}>From<select value={from} onChange={e=>setFrom(e.target.value)} style={input}>{['USD','CAD','GBP','EUR'].map(x=><option key={x}>{x}</option>)}</select></label>
          <label style={label}>To<select value={to} onChange={e=>setTo(e.target.value)} style={input}>{['NGN','GHS','ZAR','MXN','JPY','EUR','GBP','USD'].map(x=><option key={x}>{x}</option>)}</select></label>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:9,marginTop:14}}>
          <div style={metric}><small>SEND</small><strong>{money(simulation.amount,from)}</strong></div>
          <div style={metric}><small>SIMULATED FEE</small><strong>{money(simulation.fee,from)}</strong></div>
          <div style={metric}><small>AFTER FEE</small><strong>{money(simulation.receive,from)}</strong></div>
        </div>
        <p style={{...copy,marginTop:12}}>FX conversion is intentionally not fabricated here. A real exchange rate must come from the configured payment/FX provider at transaction time.</p>
        {status?.reason&&<div style={{marginTop:10,padding:11,border:'1px solid #31485a',borderRadius:12,color:'#a9c1d4',fontSize:11}}>{status.reason}</div>}
        {error&&<div style={{marginTop:10,padding:11,border:'1px solid #6c3542',borderRadius:12,color:'#ffb8c2',fontSize:11}}>{error}</div>}
      </section>

      <section style={{...card,marginTop:14}}><div style={eyebrow}>MONEY FLOW</div><p style={{...copy,fontWeight:800,color:'#dce9f4'}}>OMNICASH → QUOTE → KYC/AML/SANCTIONS → USER CONFIRMATION → PAYMENT PROVIDER → LEDGER RECEIPT → WALLET / CREATOR / VENDOR BALANCE</p></section>
    </div>
  </div>
}

const card:React.CSSProperties={border:'1px solid #23394b',borderRadius:20,padding:16,background:'linear-gradient(150deg,#0b1720,#070b10)',boxShadow:'0 16px 50px #0005'}
const eyebrow:React.CSSProperties={fontSize:9,color:'#4FE3FF',fontWeight:950,letterSpacing:2}
const heading:React.CSSProperties={margin:'6px 0 8px',fontSize:22}
const copy:React.CSSProperties={fontSize:12,color:'#9eb2c3',lineHeight:1.6,margin:0}
const badge:React.CSSProperties={display:'inline-block',marginTop:10,border:'1px solid #E8B94477',borderRadius:999,padding:'5px 8px',fontSize:8,color:'#ffe49b',fontWeight:950,letterSpacing:.7}
const label:React.CSSProperties={display:'grid',gap:6,fontSize:10,color:'#9fb3c4',fontWeight:900}
const input:React.CSSProperties={minHeight:44,borderRadius:11,border:'1px solid #31485a',background:'#09111a',color:'#fff',padding:'0 11px',fontSize:14}
const metric:React.CSSProperties={display:'grid',gap:5,padding:13,borderRadius:14,border:'1px solid #203545',background:'#081018'}
