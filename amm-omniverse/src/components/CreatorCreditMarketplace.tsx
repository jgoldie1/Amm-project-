import {useEffect,useMemo,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'
import {formatCreditUnits} from '../data/TryammHoloPlayCreditEconomy'

type Listing={id:string;creatorUserId:string;assetRegistryId:string;title:string;description:string;category:string;creditPriceUnits:number;state:string;licenseScope:string;metadata:Record<string,unknown>}
type Asset={id:string;assetKey:string;title:string;provenanceStatus:string;rightsStatus:string;certificationStatus:string;metadata:Record<string,unknown>}
type Mode='buy'|'sell'|'earn'

const CATEGORIES=['lottie-gift','holo-gift-pack','stage-skin','sound-pack','rp-scene','animation-pack','crossverse-room','pocket-dimension-room','broadcast-graphics','creator-tool','world-skin']

export default function CreatorCreditMarketplace({compact=false}:{compact?:boolean}){
 const [mode,setMode]=useState<Mode>('buy')
 const [listings,setListings]=useState<Listing[]>([])
 const [mine,setMine]=useState<Listing[]>([])
 const [assets,setAssets]=useState<Asset[]>([])
 const [earnings,setEarnings]=useState<any>(null)
 const [busy,setBusy]=useState('')
 const [status,setStatus]=useState('Creator goods use credits for engagement; only reconciled purchased Play Credit value can create real creator payout eligibility.')
 const [form,setForm]=useState({assetRegistryId:'',title:'',description:'',category:'lottie-gift',creditPriceUnits:50,licenseScope:'tryamm-worlds'})

 const auth=async()=>{const token=await getAccessToken();if(!token)throw new Error('Sign in to use the Creator Credit Market.');return token}
 const loadMarket=async()=>{
  try{const token=await auth();const r=await fetch('/api/credits/creator-marketplace/listings',{headers:{Authorization:`Bearer ${token}`}});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Unable to load market');setListings(d.listings||[])}catch(e){setStatus(e instanceof Error?e.message:'Unable to load market')}
 }
 const loadCreator=async()=>{
  try{
   const token=await auth();
   const [m,a,e]=await Promise.all([
    fetch('/api/credits/creator-marketplace/listings?mine=1',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
    fetch('/api/commerce/assets',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json()),
    fetch('/api/credits/creator-marketplace/earnings',{headers:{Authorization:`Bearer ${token}`}}).then(r=>r.json())
   ])
   setMine(m.listings||[]);setAssets((a.assets||[]).filter((x:Asset)=>x.provenanceStatus==='verified'&&x.rightsStatus==='verified'&&x.certificationStatus==='verified'));setEarnings(e)
  }catch(e){setStatus(e instanceof Error?e.message:'Unable to load creator tools')}
 }
 useEffect(()=>{void loadMarket();void loadCreator()},[])

 const buy=async(listing:Listing)=>{
  setBusy(listing.id);setStatus('Applying creator credit purchase on the server…')
  try{
   const token=await auth();const r=await fetch('/api/credits/creator-marketplace/purchase',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({listingId:listing.id,clientReference:'CCM-'+listing.id+'-'+Date.now().toString(36)})});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Purchase failed')
   if(d.entitlement){window.dispatchEvent(new CustomEvent('tryamm:creator-marketplace-entitlement',{detail:d.entitlement}));window.dispatchEvent(new CustomEvent('tryamm:holo-play-wallet-refresh'))}
   const h=d.purchase?.holoUnits||0,p=d.purchase?.playUnits||0;setStatus(`${listing.title} acquired • ${h} Holo + ${p} Play Credits. Holo-funded value created no creator cash; Play-funded value remains reconciliation/payout gated.`);await loadMarket();await loadCreator()
  }catch(e){setStatus(e instanceof Error?e.message:'Purchase failed')}finally{setBusy('')}
 }
 const publish=async()=>{
  setBusy('publish');setStatus('Checking certified asset and publishing…')
  try{const token=await auth();const r=await fetch('/api/credits/creator-marketplace/listings',{method:'POST',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Publish failed');setStatus('Creator credit listing published.');setForm(v=>({...v,title:'',description:''}));await loadMarket();await loadCreator()}catch(e){setStatus(e instanceof Error?e.message:'Publish failed')}finally{setBusy('')}
 }
 const retire=async(id:string)=>{
  try{const token=await auth();const r=await fetch('/api/credits/creator-marketplace/listings',{method:'PATCH',headers:{'content-type':'application/json',Authorization:`Bearer ${token}`},body:JSON.stringify({listingId:id,state:'retired'})});const d=await r.json();if(!r.ok)throw new Error(d?.error||'Retire failed');setStatus('Listing retired.');await loadCreator();await loadMarket()}catch(e){setStatus(e instanceof Error?e.message:'Retire failed')}
 }
 const money=(minor:number)=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format((minor||0)/100)
 const verifiedAssets=useMemo(()=>assets,[assets])

 return <section aria-label='Creator Credit Marketplace' style={{padding:compact?10:14,borderRadius:18,border:'1px solid #5e4fc788',background:'linear-gradient(145deg,#100d25,#07111c)',color:'#fff'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'start',flexWrap:'wrap'}}><div><div style={{fontSize:9,letterSpacing:1.8,color:'#b9a5ff',fontWeight:950}}>CREATOR CREDIT MARKET</div><strong style={{fontSize:compact?14:20}}>Sell creator-made digital utility without turning free Holo Credits into fake cash.</strong></div><div style={{display:'flex',gap:5}}>{(['buy','sell','earn'] as Mode[]).map(x=><button key={x} onClick={()=>setMode(x)} style={{...tab,borderColor:mode===x?'#d6c7ff':'#39465a',color:mode===x?'#fff':'#93a2b0'}}>{x.toUpperCase()}</button>)}</div></div>

  {mode==='buy'&&<div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(210px,1fr))',gap:8,marginTop:10,maxHeight:compact?330:520,overflowY:'auto'}}>{listings.length?listings.map(l=><article key={l.id} style={card}><div style={eyebrow}>{l.category.replaceAll('-',' ').toUpperCase()}</div><h3 style={{fontSize:13,margin:'5px 0'}}>{l.title}</h3><p style={copy}>{l.description||'Certified creator digital utility.'}</p><div style={{fontSize:22,fontWeight:950,color:'#89edff'}}>{formatCreditUnits(l.creditPriceUnits)} CR</div><button disabled={!!busy} onClick={()=>buy(l)} style={buyBtn}>{busy===l.id?'APPLYING…':'BUY WITH CREDITS'}</button></article>):<div style={copy}>No certified creator-credit listings are published yet.</div>}</div>}

  {mode==='sell'&&<div style={{marginTop:10}}>
   <div style={card}><div style={eyebrow}>PUBLISH CERTIFIED CREATOR ASSET</div><p style={copy}>Only assets already verified for provenance, rights and certification can be listed. Self-purchases are blocked.</p>
    <select value={form.assetRegistryId} onChange={e=>setForm({...form,assetRegistryId:e.target.value})} style={input}><option value=''>Choose certified asset…</option>{verifiedAssets.map(a=><option key={a.id} value={a.id}>{a.title} • {a.assetKey}</option>)}</select>
    <input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder='Listing title' style={input}/>
    <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder='What does the buyer unlock?' style={{...input,minHeight:70,paddingTop:9}}/>
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:7}}><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={input}>{CATEGORIES.map(x=><option key={x} value={x}>{x}</option>)}</select><input type='number' min={10} max={100000} value={form.creditPriceUnits} onChange={e=>setForm({...form,creditPriceUnits:Math.max(10,Math.floor(Number(e.target.value||10)))})} style={input}/></div>
    <button disabled={busy==='publish'||!form.assetRegistryId||!form.title} onClick={publish} style={buyBtn}>{busy==='publish'?'PUBLISHING…':'PUBLISH FOR CREDITS'}</button>
   </div>
   <div style={{display:'grid',gap:6,marginTop:8}}>{mine.map(l=><div key={l.id} style={{...card,display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><b>{l.title}</b><div style={copy}>{formatCreditUnits(l.creditPriceUnits)} CR • {l.state}</div></div>{l.state==='published'&&<button onClick={()=>retire(l.id)} style={retireBtn}>RETIRE</button>}</div>)}</div>
  </div>}

  {mode==='earn'&&<div style={{marginTop:10}}>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:7}}>
    <Metric label='VERIFIED' value={money(earnings?.summary?.verifiedMinor||0)}/><Metric label='HELD' value={money(earnings?.summary?.heldMinor||0)}/><Metric label='PAYABLE' value={money(earnings?.summary?.payableMinor||0)}/><Metric label='PAID' value={money(earnings?.summary?.paidMinor||0)}/>
   </div>
   <div style={{...card,marginTop:8}}><div style={eyebrow}>SETTLEMENT POLICY</div><p style={copy}>Verified purchased Play Credit net value uses the existing asset-marketplace split: 40% creator • 40% TRYAMM • 20% reserve. Earned Holo Credits create engagement/ownership only and never create creator cash. Creator payout remains held until reconciliation, rights/risk review, payout eligibility and provider transfer readiness pass.</p></div>
  </div>}
  <div role='status' style={{fontSize:8,color:'#c9d3df',marginTop:8}}>{status}</div>
 </section>
}

function Metric({label,value}:{label:string;value:string}){return <div style={{padding:10,borderRadius:12,border:'1px solid #34495d',background:'#08131e'}}><div style={{fontSize:8,color:'#8fa5b5',fontWeight:900}}>{label}</div><div style={{fontSize:18,fontWeight:950,marginTop:3}}>{value}</div></div>}
const card:React.CSSProperties={padding:10,borderRadius:13,border:'1px solid #33495b',background:'#08131f'}
const eyebrow:React.CSSProperties={fontSize:8,letterSpacing:1.2,color:'#84eaff',fontWeight:950}
const copy:React.CSSProperties={fontSize:9,color:'#9fb0bd',lineHeight:1.5}
const tab:React.CSSProperties={minHeight:32,borderRadius:8,border:'1px solid #39465a',background:'#0a1019',fontSize:8,fontWeight:950,padding:'0 8px'}
const input:React.CSSProperties={width:'100%',boxSizing:'border-box',minHeight:40,marginTop:6,borderRadius:9,border:'1px solid #35495c',background:'#040910',color:'#fff',padding:'0 9px',fontSize:10}
const buyBtn:React.CSSProperties={width:'100%',minHeight:38,marginTop:8,borderRadius:9,border:'1px solid #77eaff77',background:'#0b2b3a',color:'#fff',fontWeight:950}
const retireBtn:React.CSSProperties={minHeight:32,borderRadius:8,border:'1px solid #ff9b9b55',background:'#2a0c0c',color:'#ffc0c0',fontSize:8,fontWeight:900,padding:'0 8px'}