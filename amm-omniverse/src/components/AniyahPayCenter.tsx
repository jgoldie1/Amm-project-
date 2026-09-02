import { useMemo, useState } from 'react'
import { ANIYAH_PRODUCTION_BOUNDARY, buildAniyahQuote, transferFingerprint, type AniyahQuote } from '../services/aniyahPay'
import { PAYMENT_RAILS, PAYMENT_RAIL_PRODUCTION_BOUNDARY } from '../services/paymentRails'

type Props={onClose:()=>void}

export default function AniyahPayCenter({onClose}:Props){
  const [amount,setAmount]=useState('100')
  const [sourceCurrency,setSourceCurrency]=useState('USD')
  const [destinationCurrency,setDestinationCurrency]=useState('NGN')
  const [recipient,setRecipient]=useState('')
  const [quote,setQuote]=useState<AniyahQuote|null>(null)
  const [confirmed,setConfirmed]=useState(false)
  const [message,setMessage]=useState('')
  const currencies=['USD','NGN','GHS','KES','ZAR']
  const canConfirm=useMemo(()=>Boolean(quote&&quote.status==='quoted'&&recipient.trim()),[quote,recipient])
  const box:React.CSSProperties={background:'linear-gradient(155deg,#071723,#061019)',border:'1px solid #21415a',borderRadius:16,padding:14,boxShadow:'0 14px 36px #0005'}
  const btn:React.CSSProperties={background:'#0d2633',border:'1px solid #4fe3ff66',color:'#bff6ff',borderRadius:10,padding:'10px 12px',cursor:'pointer',fontFamily:'monospace',fontWeight:800}
  function makeQuote(){
    const next=buildAniyahQuote({amount:Number(amount),sourceCurrency,destinationCurrency})
    setQuote(next);setConfirmed(false);setMessage(next.reasons.join(' '))
  }
  function confirmSandbox(){
    if(!quote||!recipient.trim()) return
    setConfirmed(true)
    setMessage(`Sandbox transfer intent verified. ID ${transferFingerprint(quote,recipient).slice(0,42)}… No real money moved.`)
  }
  return <div role="dialog" aria-label="Aniyah Pay" style={{position:'fixed',inset:0,zIndex:10140,background:'radial-gradient(circle at 50% 0,#132b42 0,#02060f 48%)',color:'#eefcff',fontFamily:'monospace',overflowY:'auto'}}>
    <div style={{maxWidth:920,margin:'0 auto',padding:'max(16px,env(safe-area-inset-top)) 16px 42px'}}>
      <header style={{display:'flex',gap:12,alignItems:'center',justifyContent:'space-between',flexWrap:'wrap'}}><div style={{display:'flex',gap:12,alignItems:'center'}}><button style={btn} onClick={onClose}>← StreetVerse</button><div><div style={{fontSize:10,color:'#78ffb4',letterSpacing:2,fontWeight:900}}>HOLO FON • GLOBAL COMMERCE</div><h2 style={{margin:'2px 0',color:'#4fe3ff'}}>Aniyah Pay</h2><div style={{fontSize:10,color:'#8aa9b9'}}>Send • request • split • creator payouts • marketplace • cross-border</div></div></div></header>
      <section style={{...box,marginTop:14,borderColor:'#4fe3ff55'}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:900,letterSpacing:2}}>OMNI PAYMENT ROUTER</div><h1 style={{margin:'6px 0 8px',fontSize:'clamp(24px,5vw,42px)',lineHeight:1}}>Stripe + African payment rails</h1><div style={{fontSize:11,color:'#b7cad5',lineHeight:1.7}}>Aniyah selects an approved provider by corridor and can retain fallback rails. The game economy and real-money economy stay separate. Live provider submission stays server-side and compliance-gated.</div></section>
      <section style={{...box,marginTop:12}}><div style={{fontSize:10,color:'#4fe3ff',fontWeight:900,letterSpacing:2}}>ADAPTER NETWORK</div><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,marginTop:10}}>{PAYMENT_RAILS.map(rail=><div key={rail.id} style={{background:'#071722bb',border:'1px solid #19384a',borderRadius:10,padding:9}}><div style={{fontSize:10,fontWeight:900,color:'#aef5ff'}}>{rail.name}</div><div style={{fontSize:8,color:rail.status==='configured'?'#78ffb4':'#e8b944',marginTop:4}}>{rail.status.toUpperCase()}</div></div>)}</div><div style={{fontSize:9,color:'#8fa6b4',lineHeight:1.6,marginTop:10}}>{PAYMENT_RAIL_PRODUCTION_BOUNDARY}</div></section>
      <section style={{...box,marginTop:12}}><h3 style={{marginTop:0}}>Create sandbox transfer quote</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:10}}><label>Send amount<input value={amount} onChange={e=>setAmount(e.target.value)} inputMode="decimal" style={{width:'100%',marginTop:5,padding:10,boxSizing:'border-box',background:'#04101a',color:'#fff',border:'1px solid #21415a',borderRadius:8}}/></label><label>From<select value={sourceCurrency} onChange={e=>setSourceCurrency(e.target.value)} style={{width:'100%',marginTop:5,padding:10,background:'#04101a',color:'#fff',border:'1px solid #21415a',borderRadius:8}}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label><label>To<select value={destinationCurrency} onChange={e=>setDestinationCurrency(e.target.value)} style={{width:'100%',marginTop:5,padding:10,background:'#04101a',color:'#fff',border:'1px solid #21415a',borderRadius:8}}>{currencies.map(c=><option key={c}>{c}</option>)}</select></label></div><button style={{...btn,marginTop:12}} onClick={makeQuote}>Get transparent quote</button></section>
      {quote&&<section style={{...box,marginTop:12,borderColor:quote.status==='quoted'?'#78ffb455':'#ffbf6955'}}><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8}}>{[['PROVIDER',quote.provider.toUpperCase()],['FALLBACKS',quote.fallbackProviders.slice(0,3).map(p=>p.toUpperCase()).join(' • ')||'NONE'],['ANIYAH FEE',`${quote.sourceCurrency} ${quote.platformFee.toFixed(2)}`],['PROVIDER EST.',`${quote.sourceCurrency} ${quote.providerFeeEstimate.toFixed(2)}`],['FX',String(quote.fxRate)],['RECIPIENT EST.',`${quote.destinationCurrency} ${quote.recipientAmount.toFixed(2)}`],['MODE',quote.mode.toUpperCase()]].map(([k,v])=><div key={k} style={{background:'#071722bb',border:'1px solid #19384a',borderRadius:10,padding:9}}><div style={{fontSize:8,color:'#66899a'}}>{k}</div><div style={{fontSize:11,fontWeight:900,color:'#aef5ff',marginTop:4}}>{v}</div></div>)}</div><label style={{display:'block',marginTop:12}}>Recipient<input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="verified username / recipient reference" style={{width:'100%',marginTop:5,padding:10,boxSizing:'border-box',background:'#04101a',color:'#fff',border:'1px solid #21415a',borderRadius:8}}/></label><button disabled={!canConfirm} style={{...btn,marginTop:10,opacity:canConfirm?1:.5}} onClick={confirmSandbox}>Confirm sandbox transfer</button></section>}
      {message&&<div role="status" style={{...box,marginTop:12,borderColor:confirmed?'#78ffb455':'#e8b94455',fontSize:10,lineHeight:1.6}}>{message}</div>}
      <section style={{...box,marginTop:12,borderColor:'#e8b94466',fontSize:10,color:'#a8bbc4',lineHeight:1.65}}><b style={{color:'#e8b944'}}>Production boundary:</b> {ANIYAH_PRODUCTION_BOUNDARY}</section>
      <section style={{...box,marginTop:12,fontSize:10,color:'#8fa6b4',lineHeight:1.7}}>Flow: STREETVERSE / LIVE / REELS / MARKETPLACE → HOLO FON → ANIYAH PAY → OMNI ROUTER → APPROVED RAIL + FALLBACK → VERIFIED WEBHOOK → LEDGER / INTERNAL BLOCKCHAIN → RECEIPT → OMNI WALLET → COMMAND NEXUS.</section>
    </div>
  </div>
}
