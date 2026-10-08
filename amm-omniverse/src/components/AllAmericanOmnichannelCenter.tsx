import {useEffect,useState} from 'react'
import {getAccessToken} from '../services/supabaseClient'

type ChannelState={configured:boolean;live:boolean;blockers?:string[]}
type StatusResponse={ok:boolean;channels:Record<string,ChannelState>}

const nativeCards=[
 {id:'tryamm',label:'ALL AMERICAN MARKETPLACE',detail:'Native TRYAMM store + authoritative checkout',action:'OPEN MARKETPLACE'},
 {id:'mobility360',label:'STUBBS MOBILITY 360',detail:'Accessible disability-products store preview • supplier and safety approvals pending',action:'EXPLORE MOBILITY 360'},
 {id:'streetverse',label:'STREETVERSE STOREFRONTS',detail:'Shop inside the game world with shared cart and attribution',action:'OPEN STREETVERSE'},
 {id:'liveShoppingTwin',label:'LIVE SHOPPING TWIN',detail:'TRYAMM-owned QVC/HSN-style live commerce with AR/VR product presentation',action:'OPEN LIVE'}
]

export default function AllAmericanOmnichannelCenter({onClose}:{onClose:()=>void}){
 const [status,setStatus]=useState<StatusResponse|null>(null)
 const [message,setMessage]=useState('Checking channel readiness…')
 const [shopifyCount,setShopifyCount]=useState<number|null>(null)
 const [busy,setBusy]=useState(false)

 const refresh=async()=>{
  setBusy(true)
  try{
   const token=await getAccessToken()
   if(!token){setMessage('Sign in to check protected commerce connections.');return}
   const response=await fetch('/api/commerce/channels-status',{headers:{Authorization:'Bearer '+token}})
   const data=await response.json().catch(()=>({}))
   if(!response.ok)throw new Error(String(data?.error||'Channel status unavailable'))
   setStatus(data)
   setMessage('Channel status refreshed.')
  }catch(error){setMessage(String((error as Error)?.message||error))}
  finally{setBusy(false)}
 }

 useEffect(()=>{void refresh()},[])

 const syncShopify=async()=>{
  setBusy(true);setShopifyCount(null)
  try{
   const token=await getAccessToken()
   if(!token)throw new Error('Sign in required')
   const response=await fetch('/api/commerce/shopify-catalog?limit=25',{headers:{Authorization:'Bearer '+token}})
   const data=await response.json().catch(()=>({}))
   if(!response.ok)throw new Error(String(data?.error||'Shopify catalog unavailable'))
   setShopifyCount(Number(data.count||0))
   setMessage('Shopify catalog bridge returned '+Number(data.count||0)+' products. No listings were changed.')
  }catch(error){setMessage(String((error as Error)?.message||error))}
  finally{setBusy(false)}
 }

 const openNative=(id:string)=>{
  if(id==='tryamm'){(window as any).__tryammNavigate?.('/marketplace');onClose();return}
  if(id==='mobility360'){window.location.assign('/mobility360.html');return}
  if(id==='streetverse'){window.location.assign('/streetverse');return}
  if(id==='liveShoppingTwin'){(window as any).__showTryAMMLive?.();onClose();return}
 }

 const shopify=status?.channels?.shopify
 const ebay=status?.channels?.ebay

 return <div role="dialog" aria-modal="true" aria-label="All American Omnichannel Center" style={{position:'fixed',inset:0,zIndex:17100,background:'#020711f7',color:'#fff',overflowY:'auto',fontFamily:'system-ui'}}>
  <div style={{maxWidth:1050,margin:'0 auto',padding:'18px 14px 70px'}}>
   <header style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'flex-start'}}>
    <div><div style={{fontSize:10,color:'#70e7ff',fontWeight:950,letterSpacing:3}}>ALL AMERICAN STORE • OMNICHANNEL</div><h1 style={{margin:'5px 0',fontSize:'clamp(28px,7vw,50px)'}}>ONE PRODUCT • MANY WORLDS</h1><div style={{fontSize:12,color:'#a4b6c7',lineHeight:1.6,maxWidth:760}}>TRYAMM • StreetVerse • LIVE Shopping Twin • AR/VR • dropship sourcing • Shopify • eBay. External channels stay gated until their credentials and seller permissions are verified.</div></div>
    <button onClick={onClose} aria-label="Close All American Omnichannel Center" style={close}>×</button>
   </header>

   <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:10,marginTop:16}}>
    {nativeCards.map(card=><article key={card.id} style={panel}><div style={{fontSize:10,color:'#7df0bb',fontWeight:900}}>NATIVE • READY</div><h2 style={{fontSize:16,margin:'6px 0'}}>{card.label}</h2><p style={small}>{card.detail}</p><button style={button} onClick={()=>openNative(card.id)}>{card.action}</button></article>)}
   </section>

   <section style={{...panel,marginTop:12}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:10,alignItems:'center',flexWrap:'wrap'}}>
     <div><div style={{fontSize:10,color:'#70e7ff',fontWeight:900}}>EXTERNAL CHANNELS</div><h2 style={{margin:'5px 0'}}>Shopify + eBay</h2></div>
     <button disabled={busy} onClick={refresh} style={button}>{busy?'CHECKING…':'REFRESH STATUS'}</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:10,marginTop:10}}>
     <div style={sub}><b>SHOPIFY</b><div style={small}>{shopify?.live?'PRODUCTION READY':shopify?.configured?'CONFIGURED • NOT LIVE':'NOT CONNECTED'}</div><button disabled={busy||!shopify?.configured} onClick={syncShopify} style={{...button,marginTop:8,opacity:shopify?.configured?1:.5}}>READ CATALOG</button>{shopifyCount!==null&&<div style={{fontSize:10,color:'#7df0bb',marginTop:7}}>{shopifyCount} products returned</div>}<div style={note}>{shopify?.blockers?.join(' • ')||'Catalog can be read without making listing changes.'}</div></div>
     <div style={sub}><b>EBAY</b><div style={small}>{ebay?.live?'PRODUCTION READY':ebay?.configured?'CONFIGURED • ACTIONS GATED':'NOT CONNECTED'}</div><div style={note}>{ebay?.blockers?.join(' • ')||'Seller OAuth and tested listing/order actions are required.'}</div></div>
    </div>
   </section>

   <section style={{...panel,marginTop:12}}>
    <div style={{fontSize:10,color:'#e8c15f',fontWeight:900}}>CUSTOMER / GAMER LOOP</div>
    <div style={{fontSize:13,lineHeight:1.8,color:'#d4e1eb',marginTop:7}}>PLAY STREETVERSE → DISCOVER PRODUCT → HOLO LENS / QR → AR TRY-ON OR VR SHOWROOM → WATCH LIVE DEMO → ADD TO SHARED CART → GLOBAL PAYMENT ROUTER → VERIFIED ORDER → DELIVERY / PICKUP → REEL / REVIEW / REFERRAL.</div>
   </section>

   <section style={{...panel,marginTop:12}}>
    <div style={{fontSize:10,color:'#70e7ff',fontWeight:900}}>QUANTUM SOURCE + 3PL</div>
    <h2 style={{margin:'6px 0'}}>Vetted supplier → Tariff Buster → Virtual Warehouse → Proof Tracking</h2>
    <div style={small}>Low MOQ • samples • DTC demand tests • preorders • micro-batch • dropship • purchase orders • lawful landed-cost comparison • FedEx / UPS / USPS / DHL readiness • supplier-direct / approved 3PL • photo/signature/delivery-code proof.</div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:10}}>
      <button style={button} onClick={()=>window.__TRYAMM_QUANTUM_SOURCE_LOGISTICS__?.carrierStatus().then(()=>setMessage('Carrier readiness refreshed.')).catch(e=>setMessage(String(e?.message||e)))}>CHECK CARRIERS</button>
      <button style={button} onClick={()=>{(window as any).__showVirtualWarehouse?.();setMessage('Virtual Warehouse launcher requested.')}}>VIRTUAL WAREHOUSE</button>
    </div>
    <div style={note}>Pay-over-time remains provider-controlled. TRYAMM does not invent credit terms or mark a financing option live until a verified provider supplies the offer and disclosures.</div>
   </section>

   <section style={{...panel,marginTop:12,borderColor:'#31533f'}}>
    <div style={{fontSize:10,color:'#7df0bb',fontWeight:900}}>DROPSHIP / SOURCE RULE</div>
    <div style={small}>A supplier feed can propose products, but nothing becomes sellable until supplier identity, landed cost, inventory/availability, rights/safety requirements, authoritative price, fulfillment path, and payment readiness are verified. The browser never invents a supplier or charge amount.</div>
   </section>

   <div role="status" aria-live="polite" style={{marginTop:12,fontSize:11,color:'#b9d3df'}}>{message}</div>
  </div>
 </div>
}

const panel:React.CSSProperties={background:'#07111ddd',border:'1px solid #203b50',borderRadius:16,padding:14}
const sub:React.CSSProperties={padding:12,border:'1px solid #183349',borderRadius:12,background:'#050d17'}
const close:React.CSSProperties={width:44,height:44,borderRadius:'50%',border:'1px solid #36536a',background:'#0a1622',color:'#fff',fontSize:24}
const button:React.CSSProperties={minHeight:44,border:'1px solid #4fe3ff77',borderRadius:10,background:'#0b2430',color:'#fff',fontWeight:900,padding:'0 12px'}
const small:React.CSSProperties={fontSize:11,color:'#a8bac9',lineHeight:1.55}
const note:React.CSSProperties={fontSize:9,color:'#8398aa',lineHeight:1.5,marginTop:7}
