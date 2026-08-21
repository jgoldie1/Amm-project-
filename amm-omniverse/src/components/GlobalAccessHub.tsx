import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '../services/supabaseClient'

const FAMILY_CODES=[
  {code:'JACOBIE',owner:'Jacobie',purpose:'Family growth / referral attribution'},
  {code:'ISAIAH',owner:'Isaiah',purpose:'Family growth / referral attribution'},
  {code:'ANIYAH',owner:'Aniyah',purpose:'Family growth / referral attribution'},
] as const
const MARKET_GROUPS=[
  {name:'Africa',markets:['Nigeria','Ghana','Kenya','South Africa','Ethiopia','Tanzania','Uganda','Senegal','Morocco','Egypt']},
  {name:'North America',markets:['United States','Canada','Mexico']},
  {name:'United Kingdom + Europe',markets:['United Kingdom','Ireland','France','Germany','Spain','Italy','Netherlands']},
  {name:'Caribbean + Diaspora',markets:['Jamaica','Haiti','Trinidad & Tobago','Bahamas','Barbados','Dominican Republic','Global African Diaspora']},
  {name:'Latin America',markets:['Mexico','Brazil','Colombia','Argentina','Chile','Peru']},
  {name:'Asia + Pacific',markets:['Japan','South Korea','India','Philippines','Australia','New Zealand']},
]

export default function GlobalAccessHub({onClose,onOpenPricing}:{onClose:()=>void;onOpenPricing:()=>void}){
 const [code,setCode]=useState(()=>localStorage.getItem('tryamm.pending.code')||'')
 const [status,setStatus]=useState('Enter a TRYAMM access, promotion, or family growth code.')
 const [busy,setBusy]=useState(false)
 const locale=useMemo(()=>navigator.language||'en-US',[])
 const zone=useMemo(()=>Intl.DateTimeFormat().resolvedOptions().timeZone||'Local',[])
 const currency=useMemo(()=>{const region=locale.split('-')[1]?.toUpperCase();return region==='GB'?'GBP':region==='CA'?'CAD':region==='MX'?'MXN':region==='NG'?'NGN':region==='GH'?'GHS':region==='ZA'?'ZAR':'USD'},[locale])
 useEffect(()=>{const q=new URLSearchParams(location.search);const referral=q.get('ref')||q.get('code');if(referral&&!code){setCode(referral.toUpperCase());localStorage.setItem('tryamm.pending.code',referral.toUpperCase())}},[])
 const redeem=async()=>{
  const clean=code.trim().toUpperCase();if(!clean){setStatus('Enter a code first.');return}
  setCode(clean);localStorage.setItem('tryamm.pending.code',clean);setBusy(true)
  const sb=getSupabaseClient();if(!sb){setStatus('Code saved on this device. Sign in after the production backend is available to redeem it.');setBusy(false);return}
  const {data:{session}}=await sb.auth.getSession();if(!session){setStatus('Code saved. Sign in, then come back and press REDEEM CODE.');setBusy(false);return}
  const {data,error}=await sb.rpc('redeem_tryamm_code',{p_code:clean})
  if(error){setStatus(error.message||'Code could not be redeemed.')}else{
    const result=data as any;setStatus(result?.message||'Code redeemed.');localStorage.setItem('tryamm.last.redeemed.code',clean)
    if(result?.type==='free_month'||result?.type==='bogo') setTimeout(onOpenPricing,600)
  }
  setBusy(false)
 }
 const share=async(c:string)=>{const url=`${location.origin}${location.pathname}?ref=${encodeURIComponent(c)}`;try{await navigator.clipboard.writeText(url);setStatus(`Share link copied for ${c}.`)}catch{setStatus(`Share this code: ${c}`)}}
 return <div role="dialog" aria-modal="true" aria-label="TRYAMM Global Access and Growth" style={{position:'fixed',inset:0,zIndex:12260,overflowY:'auto',background:'radial-gradient(circle at top,#123047,#050812 58%,#020205)',color:'#fff',padding:16,fontFamily:'Inter,system-ui,sans-serif'}}><div style={{maxWidth:1100,margin:'0 auto'}}>
  <header style={{display:'flex',justifyContent:'space-between',gap:14,alignItems:'center',flexWrap:'wrap'}}><div><div style={{fontSize:10,color:'#4FE3FF',fontWeight:950,letterSpacing:3}}>TRYAMM • GLOBAL ACCESS</div><h1 style={{fontSize:'clamp(34px,6vw,64px)',margin:'6px 0'}}>One App • Global Reach • Trackable Growth</h1><p style={muted}>The app can accept one code box for launch access, billing promotions and family referral attribution. Referral codes track growth; they do not automatically create legal equity or payment rights.</p></div><button aria-label="Close Global Access" onClick={onClose} style={close}>×</button></header>
  <section style={panel}><h2>Enter your code</h2><div style={{display:'grid',gridTemplateColumns:'1fr auto',gap:9}}><input aria-label="TRYAMM access code" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="TRYAMMFREE, TRYAMMBOGO, or family code" style={input}/><button onClick={redeem} disabled={busy} style={action}>{busy?'CHECKING…':'REDEEM CODE'}</button></div><p style={muted}>{status}</p><div style={chips}><button style={small} onClick={()=>{setCode('TRYAMMFREE');localStorage.setItem('tryamm.pending.code','TRYAMMFREE')}}>FREE MONTH CODE</button><button style={small} onClick={()=>{setCode('TRYAMMBOGO');localStorage.setItem('tryamm.pending.code','TRYAMMBOGO')}}>BUY 1 → GET 1 CODE</button></div><p style={{...muted,fontSize:11}}>TRYAMMFREE records a one-month entitlement for a signed-in user. TRYAMMBOGO records the promotion request, but the second free month must still be released only after billing verifies the first paid month.</p></section>
  <section style={panel}><h2>Family growth codes</h2><div style={grid}>{FAMILY_CODES.map(x=><article key={x.code} style={card}><div style={{fontSize:11,color:'#E8B944',fontWeight:900}}>{x.owner.toUpperCase()}</div><div style={{fontSize:28,fontWeight:950,margin:'7px 0'}}>{x.code}</div><p style={muted}>{x.purpose}</p><button onClick={()=>share(x.code)} style={small}>COPY SHARE LINK</button></article>)}</div></section>
  <section style={panel}><h2>Global runtime baseline</h2><div style={chips}><span style={chip}>Locale: {locale}</span><span style={chip}>Time zone: {zone}</span><span style={chip}>Currency display: {currency}</span><span style={chip}>UTF-8 names/content</span><span style={chip}>Mobile-first</span><span style={chip}>Low-bandwidth fallbacks</span><span style={chip}>Captions</span><span style={chip}>Translation hooks</span></div><p style={muted}>Global availability still depends on production hosting, regional legal/compliance requirements, payment-provider coverage, content rights, and provider availability. The UI must never claim every regulated feature is available in every country.</p></section>
  <section style={panel}><h2>Priority markets + diaspora</h2><div style={grid}>{MARKET_GROUPS.map(g=><article key={g.name} style={card}><strong>{g.name}</strong><div style={{...chips,marginTop:10}}>{g.markets.map(m=><span key={m} style={chip}>{m}</span>)}</div></article>)}</div></section>
 </div></div>
}
const panel={border:'1px solid #28435d',borderRadius:20,padding:16,margin:'14px 0',background:'#07111c'} as const
const card={border:'1px solid #29415a',borderRadius:16,padding:14,background:'#0a1521'} as const
const grid={display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10} as const
const chips={display:'flex',gap:7,flexWrap:'wrap'} as const
const chip={border:'1px solid #36516a',borderRadius:999,padding:'6px 9px',fontSize:10,background:'#0b1824'} as const
const muted={color:'#aab8c8',lineHeight:1.6} as const
const input={minHeight:48,borderRadius:12,border:'1px solid #4FE3FF88',background:'#06111b',color:'#fff',padding:'0 13px',fontSize:15,fontWeight:800} as const
const action={minHeight:48,borderRadius:12,border:'1px solid #4FE3FF',background:'#0e2a39',color:'#fff',padding:'0 16px',fontWeight:950,cursor:'pointer'} as const
const small={minHeight:38,borderRadius:999,border:'1px solid #E8B94488',background:'#211a0c',color:'#fff',padding:'0 13px',fontWeight:900,cursor:'pointer'} as const
const close={width:46,height:46,borderRadius:'50%',border:'1px solid #46566a',background:'#0d1420',color:'#fff',fontSize:24,cursor:'pointer'} as const
