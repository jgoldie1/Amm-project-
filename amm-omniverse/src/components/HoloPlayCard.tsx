import {useEffect,useMemo,useState} from 'react'
import {TRYAMM_CREDIT_PACKS,TRYAMM_CREDIT_POLICY,TRYAMM_CREDIT_SPEND_CATALOG,formatCreditUnits} from '../data/TryammHoloPlayCreditEconomy'

type Wallet={holoCredits:number;playCredits:number;refundDebtUnits:number;lifetimeEarned:number;lifetimePurchased:number;lifetimeSpent:number;status:string}
type LedgerRow={id:string;bucket:string;eventType:string;units:number;sourceType:string;sourceId:string;createdAt:string;metadata:Record<string,unknown>}

export default function HoloPlayCard({onClose}:{onClose?:()=>void}){
 const [wallet,setWallet]=useState<Wallet>({holoCredits:0,playCredits:0,refundDebtUnits:0,lifetimeEarned:0,lifetimePurchased:0,lifetimeSpent:0,status:'active'})
 const [ledger,setLedger]=useState<LedgerRow[]>([])
 const [status,setStatus]=useState('Loading wallet…')
 const [busy,setBusy]=useState('')
 const total=useMemo(()=>wallet.holoCredits+wallet.playCredits,[wallet])
 const load=async()=>{
  try{const r=await fetch('/api/credits/wallet',{credentials:'include'});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Wallet unavailable');setWallet(d.wallet);setLedger(d.ledger||[]);setStatus('Wallet ready. Holo Credits spend first, then Play Credits.')}catch(e){setStatus(e instanceof Error?e.message:'Wallet unavailable')}
 }
 useEffect(()=>{void load()},[])
 const topup=async(id:string)=>{
  setBusy(id);setStatus('Preparing verified credit-pack checkout…')
  try{const r=await fetch('/api/commerce/checkout',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({lines:[{id,qty:1}],clientOrderId:'HOLO-'+Date.now().toString(36).toUpperCase()})});const d=await r.json();if(d?.checkoutUrl&&d?.state==='CHECKOUT_READY'){window.location.href=d.checkoutUrl;return}if(d?.state==='PAYMENT_GATED'){setStatus('Credit pack order saved, but live charging is still gated. No Play Credits were minted.');return}setStatus(String(d?.message||d?.error||'Checkout is not ready.'))}catch{setStatus('Checkout could not be created. No charge or credits were created.')}finally{setBusy('')}
 }
 const spend=async(itemId:string)=>{
  setBusy(itemId);setStatus('Applying server-authoritative credit spend…')
  try{const r=await fetch('/api/credits/spend',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({itemId,clientReference:'PLAY-'+itemId+'-'+Date.now().toString(36)})});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Spend failed');setStatus(`${d.item.label} unlocked for ${d.item.costUnits} credits.`);await load();window.dispatchEvent(new CustomEvent('tryamm:holo-play-entitlement',{detail:d.entitlement}))}catch(e){setStatus(e instanceof Error?e.message:'Spend failed')}finally{setBusy('')}
 }
 return <div role='dialog' aria-modal='true' aria-label='Holo Play Card' style={{position:'fixed',inset:0,zIndex:14500,background:'radial-gradient(circle at 50% 0,#1b1e4b,#050711 62%)',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1050,margin:'0 auto',padding:'18px 14px 90px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'start'}}><div><div style={{fontSize:10,letterSpacing:2.6,color:'#70e7ff',fontWeight:950}}>TRYAMM CLOSED-LOOP ECONOMY</div><h1 style={{fontSize:'clamp(38px,8vw,76px)',lineHeight:.9,margin:'8px 0'}}>HOLO PLAY CARD</h1><div style={{fontSize:10,color:'#ffdc7c',fontWeight:950}}>{TRYAMM_CREDIT_POLICY.label}</div></div>{onClose&&<button onClick={onClose} style={close}>×</button>}</header>
   <section style={{marginTop:16,padding:18,borderRadius:24,background:'linear-gradient(135deg,#0b374d,#352255 58%,#7b4b12)',border:'1px solid #92e8ff77',boxShadow:'0 20px 50px #0007'}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}><div><div style={{fontSize:10,letterSpacing:2,color:'#bff4ff'}}>HOLO PLAY</div><div style={{fontSize:34,fontWeight:950,marginTop:4}}>{formatCreditUnits(total)} <span style={{fontSize:12}}>TOTAL CREDITS</span></div></div><div style={{fontSize:24}}>✦</div></div>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginTop:14}}><div style={balance}><span>HOLO EARNED</span><b>{formatCreditUnits(wallet.holoCredits)}</b></div><div style={balance}><span>PLAY PURCHASED</span><b>{formatCreditUnits(wallet.playCredits)}</b></div></div>
    <div style={{fontSize:9,color:'#d8e3ef',marginTop:12}}>STATUS: {wallet.status.toUpperCase()} • CASH VALUE $0 • NO CASH-OUT • NO INTEREST • NO P2P TRANSFER • FAME CANNOT BE BOUGHT</div>
   </section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>BUY PLAY CREDITS WITH A REAL CARD</div><p style={copy}>A debit/credit card funds the Stripe checkout. Play Credits are minted only after a verified payment creates the matching server entitlement. Tapping BUY never mints credits by itself.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:8,marginTop:10}}>{TRYAMM_CREDIT_PACKS.map(p=><button key={p.id} disabled={!!busy} onClick={()=>topup(p.id)} style={card}><b>{p.label}</b><span>${(p.priceMinor/100).toFixed(2)}</span><small>{busy===p.id?'PREPARING…':'BUY WITH CARD'}</small></button>)}</div></section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>SPEND INSIDE THE ECOSYSTEM</div><p style={copy}>Earned Holo Credits are used first. Purchased Play Credits cover the rest. These are digital TRYAMM utility purchases—not cash payments to creators or merchants.</p><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:8,marginTop:10}}>{TRYAMM_CREDIT_SPEND_CATALOG.map(item=><article key={item.id} style={{...panel,background:'#080d17'}}><div style={{fontSize:14,fontWeight:950}}>{item.label}</div><div style={{fontSize:24,fontWeight:950,color:'#74e8ff',marginTop:4}}>{formatCreditUnits(item.costUnits)} CR</div><p style={copy}>{item.description}</p><button disabled={!!busy||wallet.status!=='active'} onClick={()=>spend(item.id)} style={spendBtn}>{busy===item.id?'APPLYING…':'USE CREDITS'}</button></article>)}</div></section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>HOW VALUE BUILDS</div><p style={copy}>The ecosystem becomes more valuable by giving credits more useful places to spend: RP creation, virtual vehicles, Reels, VR/MR scenes, world skins, creator tools and storage. The credits themselves do not appreciate and are not investments. Real creator/business earnings remain on the separate USD ledger.</p><div style={{display:'flex',gap:6,flexWrap:'wrap'}}>{['MISSIONS → HOLO CREDITS','CARD → PLAY CREDITS','CREDITS → DIGITAL UTILITY','CREATION → FAME','SALES → REAL USD LEDGER'].map(x=><span key={x} style={pill}>{x}</span>)}</div></section>
   <section style={{...panel,marginTop:12}}><div style={eyebrow}>RECENT CREDIT LEDGER</div><div style={{display:'grid',gap:5,marginTop:8}}>{ledger.length?ledger.slice(0,12).map(x=><div key={x.id} style={{display:'flex',justifyContent:'space-between',gap:8,padding:'8px 9px',borderRadius:9,background:'#080d15',fontSize:9}}><span>{x.eventType} • {x.bucket}</span><b style={{color:x.units>=0?'#87ffb0':'#ffc27b'}}>{x.units>=0?'+':''}{formatCreditUnits(x.units)}</b></div>):<div style={copy}>No server credit activity yet.</div>}</div></section>
   <div role='status' style={{marginTop:10,padding:10,borderRadius:10,border:'1px solid #35516b',background:'#08121d',fontSize:10,color:'#d0dde8'}}>{status}</div>
  </div>
 </div>
}
const panel:React.CSSProperties={padding:14,border:'1px solid #2a4058',borderRadius:16,background:'#09111c'}
const eyebrow:React.CSSProperties={fontSize:9,letterSpacing:1.8,color:'#8eeaff',fontWeight:950}
const copy:React.CSSProperties={fontSize:10,color:'#9fb0bf',lineHeight:1.6}
const balance:React.CSSProperties={display:'flex',flexDirection:'column',gap:3,padding:10,borderRadius:12,background:'#050a12aa',border:'1px solid #ffffff22',fontSize:9}
const card:React.CSSProperties={display:'flex',flexDirection:'column',gap:4,textAlign:'left',padding:12,borderRadius:13,border:'1px solid #56dff877',background:'#081923',color:'#fff',cursor:'pointer'}
const spendBtn:React.CSSProperties={width:'100%',minHeight:38,borderRadius:9,border:'1px solid #6fe5ff77',background:'#0b2b3b',color:'#fff',fontWeight:950}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #425a75',background:'#08111c',color:'#fff',fontSize:23}
const pill:React.CSSProperties={padding:'5px 8px',borderRadius:999,border:'1px solid #36516b',background:'#071624',fontSize:8,color:'#cce0ef'}