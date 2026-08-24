import { useEffect, useMemo, useState } from 'react'

type Market={id:string;label:string;currency:string;payments:string[];focus:string[];status:string}
const MARKETS:Market[]=[
 {id:'diaspora',label:'Global Diaspora',currency:'multi-currency',payments:['Stripe','OmniCash','country adapters'],focus:['trade','investment readiness','creator sponsorships','remote jobs','property discovery'],status:'platform-ready/provider-gated'},
 {id:'ng',label:'Nigeria',currency:'NGN',payments:['Flutterwave','Paystack'],focus:['marketplace','creator economy','business services','jobs','broadcasting','global trade'],status:'sandbox/payment-provider-gated'},
 {id:'za',label:'South Africa',currency:'ZAR',payments:['approved regional adapter','Stripe where eligible'],focus:['business services','creator economy','jobs','broadcasting','trade'],status:'market-ready/provider-gated'},
 {id:'ht',label:'Haiti + Caribbean',currency:'HTG/USD + supported corridors',payments:['approved regional/cross-border adapter'],focus:['diaspora commerce','remittance readiness','jobs','creator/media','trade'],status:'market-ready/provider-gated'},
]

const products=[
 ['Business OS','Storefront, CRM/workflows, commerce, analytics and business launch tools.'],
 ['AI Call Center','AI-assisted customer support, sales workflows and human-agent handoff.'],
 ['Holo Fon','Communications identity and carrier-ready orchestration; live telecom remains provider-gated.'],
 ['Holo Ads','Regional, diaspora, creator, marketplace, broadcast and immersive ad campaigns.'],
 ['Marketplace + Global Trade','Products, services, supplier matching and diaspora discovery.'],
 ['All American Network','LIVE, FAST/OTT, sponsorship, creator and business broadcasting.'],
 ['Jobs Network','Remote work, sales, support, creator/media, marketplace and dealer/install roles.'],
 ['OmniCash + Payments','Ledger, checkout/payout orchestration and approved country-provider routing.'],
 ['Immersive Commerce','3D showrooms, AR try-on, VR/MR tours and StreetVerse sponsored locations.'],
]

export default function GlobalGrowthHub(){
 const [open,setOpen]=useState(false)
 const [market,setMarket]=useState('diaspora')
 const [budget,setBudget]=useState('500')
 const [objective,setObjective]=useState('sales')
 const [message,setMessage]=useState('')
 const active=useMemo(()=>MARKETS.find(m=>m.id===market)||MARKETS[0],[market])
 useEffect(()=>{
  const show=()=>setOpen(true)
  window.addEventListener('tryamm:global-growth-open',show)
  ;(window as any).__showGlobalGrowth=show
  ;(window as any).__showDiasporaBusiness=()=>{setMarket('diaspora');setOpen(true)}
  ;(window as any).__showHoloAds=()=>{setOpen(true);setMessage('Holo Ads campaign workspace ready.')}
  return()=>window.removeEventListener('tryamm:global-growth-open',show)
 },[])
 if(!open)return null
 const fire=(name:string)=>{
  const fn=(window as any)[name]
  if(typeof fn==='function')fn()
  else setMessage('That module is installed as a platform contract but still needs its final visible launcher or provider connection.')
 }
 const createCampaign=()=>{
  const amount=Math.max(0,Number(budget)||0)
  window.dispatchEvent(new CustomEvent('tryamm:holo-ads-campaign-draft',{detail:{market:active.id,objective,budget:amount,currency:'USD',placements:['creator','marketplace','broadcast','diaspora','immersive'],status:'draft',paymentStatus:'not-charged'}}))
  setMessage(`Campaign draft created for ${active.label}. No money was charged; activation requires checkout, targeting review and eligible inventory.`)
 }
 return <div role="dialog" aria-label="TRYAMM Global Growth Hub" style={{position:'fixed',inset:0,zIndex:15100,background:'rgba(2,5,14,.985)',color:'#fff',overflowY:'auto',fontFamily:'Inter,system-ui,sans-serif'}}>
  <div style={{maxWidth:1180,margin:'0 auto',padding:'18px 14px 90px'}}>
   <header style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><div><div style={{fontSize:10,color:'#4FE3FF',letterSpacing:3,fontWeight:900}}>TRYAMM GLOBAL ECONOMY</div><h1 style={{margin:'4px 0 0',fontSize:'clamp(26px,5vw,46px)'}}>Business • Diaspora • Jobs • Holo Ads</h1></div><button onClick={()=>setOpen(false)} aria-label="Close Global Growth Hub" style={{width:44,height:44,borderRadius:'50%',border:'1px solid #40556d',background:'#0a1420',color:'#fff',fontSize:22}}>×</button></header>
   <p style={{color:'#9eb5c8',maxWidth:900,lineHeight:1.6}}>One commercial surface connecting Business OS, AI Call Center, Holo Fon, Marketplace, All American Network, Holo Ads, jobs, OmniCash and country-approved payment providers. External telecom, banking/payment and XR capabilities remain gated until their real providers and device tests are verified.</p>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:14}}>{MARKETS.map(m=><button key={m.id} onClick={()=>setMarket(m.id)} style={{textAlign:'left',padding:14,borderRadius:16,border:`1px solid ${market===m.id?'#4FE3FF':'#24384c'}`,background:market===m.id?'#0b2530':'#08111b',color:'#fff',cursor:'pointer'}}><b>{m.label}</b><div style={{fontSize:10,color:'#8ca8ba',marginTop:6}}>{m.currency}</div><div style={{fontSize:9,color:'#e8b944',marginTop:7}}>{m.status}</div></button>)}</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:12,marginTop:14}}>
    <section style={box}><h2 style={h2}>{active.label}</h2><div style={small}><b>Payments:</b> {active.payments.join(' • ')}</div><div style={{...small,marginTop:8}}><b>Commercial focus:</b> {active.focus.join(' • ')}</div><div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:12}}><button style={btn} onClick={()=>fire('__showOmniCash')}>Open OmniCash</button><button style={btn} onClick={()=>fire('__showTryAMMConnect')}>Open Holo Fon</button><button style={btn} onClick={()=>fire('__showIsaiahTV')}>Open Broadcasting</button><button style={btn} onClick={()=>fire('__showHoloMarketplace')}>Open Marketplace</button></div></section>
    <section style={box}><h2 style={h2}>Holo Ads Growth</h2><label style={label}>Objective<select value={objective} onChange={e=>setObjective(e.target.value)} style={input}><option value="sales">Sales</option><option value="leads">Leads</option><option value="app-growth">App growth</option><option value="creator">Creator growth</option><option value="broadcast">Broadcast sponsorship</option><option value="jobs">Hiring</option></select></label><label style={label}>Draft budget (USD)<input value={budget} onChange={e=>setBudget(e.target.value)} inputMode="decimal" style={input}/></label><button onClick={createCampaign} style={{...btn,width:'100%',marginTop:10,background:'#113044'}}>Create campaign draft</button><div style={{fontSize:9,color:'#8299aa',marginTop:8}}>Draft only. No spend occurs until payment, inventory, targeting, policy and measurement gates pass.</div></section>
   </div>
   {message&&<div aria-live="polite" style={{...box,marginTop:12,borderColor:'#e8b94455'}}>{message}</div>}
   <h2 style={{marginTop:22}}>What businesses can buy</h2><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10}}>{products.map(([title,desc])=><div key={title} style={box}><b style={{color:'#4FE3FF'}}>{title}</b><div style={{...small,marginTop:7}}>{desc}</div></div>)}</div>
   <div style={{...box,marginTop:16,borderColor:'#55ff9a44'}}><b style={{color:'#78ffb4'}}>Revenue flywheel</b><div style={{...small,marginTop:7,lineHeight:1.7}}>FREE USER → CREATOR/BUSINESS → BUSINESS OS → HOLO ADS → MARKETPLACE → LIVE/BROADCAST → JOBS/GLOBAL TRADE → OMNICASH/PAYMENTS → SUBSCRIPTIONS/TRANSACTION REVENUE → BETTER CONTENT/SERVICES → MORE USERS.</div></div>
  </div>
 </div>
}

const box:React.CSSProperties={background:'#07111b',border:'1px solid #24394d',borderRadius:18,padding:15}
const btn:React.CSSProperties={border:'1px solid #3c7186',background:'#0d2130',color:'#d8f8ff',borderRadius:10,padding:'10px 12px',cursor:'pointer',fontWeight:800}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',marginTop:5,padding:10,borderRadius:9,border:'1px solid #29485c',background:'#030c14',color:'#fff'}
const label:React.CSSProperties={display:'block',fontSize:10,color:'#9fb5c5',marginTop:8}
const h2:React.CSSProperties={margin:'0 0 10px',fontSize:18}
const small:React.CSSProperties={fontSize:11,color:'#a6bac8',lineHeight:1.55}
