import {lazy,Suspense,useEffect,useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import MusicCreatorStudio from './MusicCreatorStudio'
import {ANIYAH_64_TRACK_BUSINESS,ANIYAH_64_TRACK_OFFERS,ANIYAH_STUDIO_REVENUE_CHANNELS,formatUsd,type AniyahStudioSku} from '../data/Aniyah64TrackBusiness'

const RecordingStudio=lazy(()=>import('./RecordingStudio'))
type Mode='create'|'engineer'|'earn'

export default function Aniyah64TrackStudio({onClose}:{onClose?:()=>void}){
 const [mode,setMode]=useState<Mode>('create')
 const [status,setStatus]=useState('Aniyah 64-Track Studio is ready.')
 const [readiness,setReadiness]=useState<{readyForCharges?:boolean;readyForPayout?:boolean;message?:string}|null>(null)
 const [busy,setBusy]=useState<string>('')
 const split=useMemo(()=>({aniyah:ANIYAH_64_TRACK_BUSINESS.sellerShareBasisPoints/100,tryamm:ANIYAH_64_TRACK_BUSINESS.tryammShareBasisPoints/100}),[])
 useEffect(()=>{getAccessToken().then(token=>token?fetch('/api/studio/aniyah-readiness',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()).then(setReadiness):setReadiness(null)).catch(()=>setReadiness(null))},[])
 const buy=async(id:AniyahStudioSku)=>{
  setBusy(id);setStatus('Preparing server-priced checkout…')
  try{
   const token=await getAccessToken();if(!token)throw new Error('Sign in before buying or booking studio services.');const res=await fetch('/api/commerce/checkout',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({lines:[{id,qty:1}],clientOrderId:'ANIYAH-'+Date.now().toString(36).toUpperCase()})})
   const data=await res.json().catch(()=>({}))
   if(data?.checkoutUrl&&data?.state==='CHECKOUT_READY'){window.location.href=data.checkoutUrl;return}
   if(data?.state==='PAYMENT_GATED'){setStatus('Order saved, but live charging/payout remains gated until Stripe webhooks, seller transfers and reconciliation are verified.');return}
   setStatus(String(data?.message||data?.error||'Checkout is not ready yet.'))
  }catch{setStatus('Could not reach checkout. No charge was created.')}finally{setBusy('')}
 }
 return <div style={{minHeight:'100%',background:'radial-gradient(circle at 50% 0,#151b3a,#05060d 60%)',color:'#fff',fontFamily:'system-ui'}}> 
  <header style={{position:'sticky',top:0,zIndex:5,display:'flex',alignItems:'center',gap:10,flexWrap:'wrap',padding:'12px 14px',background:'#05060de8',borderBottom:'1px solid #6a5cff55',backdropFilter:'blur(12px)'}}>
   {onClose&&<button onClick={onClose} style={back}>← STAR STUDIO</button>}
   <div><div style={{fontSize:9,letterSpacing:2.4,color:'#ff91dc',fontWeight:950}}>ANIYAH • MUSIC BUSINESS</div><div style={{fontSize:20,fontWeight:950}}>64-Track Studio</div><div style={{fontSize:9,color:'#8fa2b8'}}>AI Create Mode + full 64-track Engineer Mode + verified commerce</div></div>
   <div style={{marginLeft:'auto',display:'flex',gap:6}}>{(['create','engineer','earn'] as Mode[]).map(m=><button key={m} onClick={()=>setMode(m)} style={{...tab,borderColor:mode===m?'#ffd75e':'#344156',color:mode===m?'#ffd75e':'#a6b2c0'}}>{m.toUpperCase()}</button>)}</div>
  </header>
  {mode==='create'&&<MusicCreatorStudio/>}
  {mode==='engineer'&&<div style={{height:'calc(100dvh - 78px)'}}><Suspense fallback={<div style={{padding:24}}>Loading 64-track Engineer Mode…</div>}><RecordingStudio onClose={()=>setMode('create')}/></Suspense></div>}
  {mode==='earn'&&<main style={{maxWidth:1080,margin:'0 auto',padding:'18px 14px 80px'}}>
   <section style={panel}><div style={eyebrow}>HOW THE BUSINESS EARNS</div><h2 style={{margin:'6px 0'}}>Aniyah owns the studio business. TRYAMM provides the platform.</h2><div style={{display:'flex',gap:6,flexWrap:'wrap',margin:'8px 0'}}><span style={pill}>CHARGING: {readiness?.readyForCharges?'READY':'GATED'}</span><span style={pill}>PAYOUT: {readiness?.readyForPayout?'READY':'GATED'}</span></div>{readiness?.message&&<p style={{...copy,color:'#ffd9a0'}}>{readiness.message}</p>}<p style={copy}>For the launch studio services below, the server catalog allocates <b>{split.aniyah}%</b> to the Aniyah 64-Track Studio seller allocation and <b>{split.tryamm}%</b> to TRYAMM platform revenue. Payable money still requires verified payment, fulfillment/entitlement, reconciliation and seller-transfer eligibility.</p><p style={{...copy,color:'#ffd9a0'}}>{ANIYAH_64_TRACK_BUSINESS.ageAndPayoutRule}</p></section>
   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(235px,1fr))',gap:10,marginTop:12}}>{ANIYAH_64_TRACK_OFFERS.map(o=><article key={o.id} style={panel}><div style={eyebrow}>{o.kind.toUpperCase()}</div><h3 style={{margin:'6px 0'}}>{o.name}</h3><div style={{fontSize:28,fontWeight:950,color:'#ffd75e'}}>{formatUsd(o.priceMinor)}</div><p style={copy}>{o.description}</p><div style={{fontSize:9,color:'#8fa2b8'}}>At launch split: {formatUsd(Math.floor(o.priceMinor*ANIYAH_64_TRACK_BUSINESS.sellerShareBasisPoints/10000))} seller allocation • {formatUsd(Math.floor(o.priceMinor*ANIYAH_64_TRACK_BUSINESS.tryammShareBasisPoints/10000))} TRYAMM</div><button disabled={busy===o.id} onClick={()=>buy(o.id)} style={buyBtn}>{busy===o.id?'PREPARING…':'BUY / BOOK'}</button></article>)}</section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>FAMILY SUPPORT</div><h3 style={{margin:'6px 0'}}>Use the business to help family projects without hiding the accounting.</h3><p style={copy}>{ANIYAH_64_TRACK_BUSINESS.familySupport.purpose}</p><p style={copy}>The current business policy recommends reserving up to {ANIYAH_64_TRACK_BUSINESS.familySupport.recommendedReserveBasisPoints/100}% of Aniyah Studio merchant proceeds for approved family-project reinvestment, but it is <b>not an automatic cash transfer</b>. Owner/guardian approval and the applicable payout rules are required.</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{ANIYAH_64_TRACK_BUSINESS.familySupport.destinations.map(x=><span key={x} style={pill}>{x}</span>)}</div></section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>REVENUE CHANNELS</div><div style={{display:'grid',gap:5,marginTop:8}}>{ANIYAH_STUDIO_REVENUE_CHANNELS.map(x=><div key={x} style={{fontSize:10,color:'#b5c2d0'}}>• {x}</div>)}</div></section>
   <div role='status' style={{marginTop:10,padding:10,borderRadius:10,background:'#0a1220',border:'1px solid #2d405c',fontSize:10,color:'#cbd7e4'}}>{status}</div>
  </main>}
 </div>
}
const panel:React.CSSProperties={padding:14,border:'1px solid #2a3b55',borderRadius:16,background:'linear-gradient(150deg,#0b1321,#080b13)'}
const copy:React.CSSProperties={fontSize:11,color:'#aab8c7',lineHeight:1.6}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:1.7,color:'#8cecff',fontWeight:950}
const tab:React.CSSProperties={minHeight:38,borderRadius:9,border:'1px solid #344156',background:'#0a101a',fontSize:9,fontWeight:950,padding:'0 10px'}
const back:React.CSSProperties={minHeight:38,borderRadius:9,border:'1px solid #344156',background:'#0a101a',color:'#fff',padding:'0 10px'}
const buyBtn:React.CSSProperties={width:'100%',minHeight:40,marginTop:10,borderRadius:10,border:'1px solid #ffd75e88',background:'#352907',color:'#fff2a8',fontWeight:950}
const pill:React.CSSProperties={padding:'5px 7px',borderRadius:999,border:'1px solid #354a63',background:'#0b1624',fontSize:8,color:'#cdd9e6'}