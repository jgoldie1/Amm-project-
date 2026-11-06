import {useEffect,useState} from 'react'
import {addPartner,approvePartner,addSeller,approveSeller,createDemoOrder,advanceDemoOrder,initialFulfillmentState,readFulfillmentState,serializeFulfillmentState,FULFILLMENT_SAVE_KEY,type FulfillmentState} from '../runtime/StreetVerseWarehousePartnerRuntime'
/** A sandbox pilot inside StreetVerse, not a live commercial order processing portal. */
export default function StreetVerseWarehousePartnerPortal(){
 const [open,setOpen]=useState(false)
 const [state,setState]=useState<FulfillmentState>(()=>{try{return readFulfillmentState(localStorage.getItem(FULFILLMENT_SAVE_KEY))}catch{return initialFulfillmentState()}})
 const [partner,setPartner]=useState(''),[region,setRegion]=useState('Chicago'),[seller,setSeller]=useState('')
 const [sku,setSku]=useState('restaurant-supplies'),[qty,setQty]=useState(1)
 const [sellerId,setSellerId]=useState(''),[partnerId,setPartnerId]=useState('')
 const [carrier,setCarrier]=useState('Demo Carrier'),[tracking,setTracking]=useState('DEMO-TRACK-001')
 const [note,setNote]=useState('Local sandbox: no real orders, warehouse contracts, or shipments.')
 useEffect(()=>{try{localStorage.setItem(FULFILLMENT_SAVE_KEY,serializeFulfillmentState(state))}catch{}},[state])
 const update=(next:FulfillmentState)=>{if(next===state){setNote('Action blocked: check approvals and required fields.');return}setState(next);setNote('Demo record updated locally.')}
 const advance=(id:string)=>{const current=state.orders.find(o=>o.id===id);if(!current)return;const next=advanceDemoOrder(state,id,carrier,tracking);if(next===state){setNote('A carrier and tracking reference are required before marking shipped.');return}setState(next);const order=next.orders.find(o=>o.id===id);if(order)window.dispatchEvent(new CustomEvent('tryamm:streetverse-fulfillment-demo-order',{detail:{orderId:id,status:order.status,sku:order.sku,quantity:order.quantity,demo:true}}));setNote('Order moved to '+order?.status+' (demo only).')}
 const btn={minHeight:46,padding:'8px 11px',border:'1px solid #80e8ff',borderRadius:8,background:'#16465d',color:'white',fontWeight:700}
 const input={minHeight:44,width:'100%',boxSizing:'border-box' as const,borderRadius:7,padding:8}
 return <aside data-tryamm-warehouse-portal="demo" style={{position:'fixed',right:8,top:'calc(env(safe-area-inset-top) + 84px)',zIndex:43990,width:open?'min(360px,calc(100vw - 16px))':'auto',maxHeight:'min(76dvh,680px)',overflowY:'auto',borderRadius:12,background:open?'rgba(7,22,42,.98)':'transparent',color:'white',padding:open?12:0,font:'12px system-ui'}}>
  <button style={btn} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🏬 TRYAMM PARTNER PORTAL</button>
  {open&&<div style={{display:'grid',gap:9,marginTop:10}}>
   <strong>WAREHOUSE PARTNERS • DEMO</strong>
   <input aria-label="Warehouse partner business name" style={input} placeholder="Warehouse business name" value={partner} onChange={e=>setPartner(e.target.value)}/>
   <input aria-label="Warehouse region" style={input} placeholder="Service region" value={region} onChange={e=>setRegion(e.target.value)}/>
   <button style={btn} onClick={()=>{update(addPartner(state,partner,region));setPartner('')}}>APPLY AS PARTNER (DEMO)</button>
   {state.partners.map(p=><div key={p.id}>{p.name} • {p.region} • {p.status} {p.status==='applied'&&<button style={btn} onClick={()=>update(approvePartner(state,p.id))}>DEMO APPROVE</button>}</div>)}
   <strong>SELLER ONBOARDING • DEMO</strong>
   <input aria-label="Seller business name" style={input} placeholder="Seller business name" value={seller} onChange={e=>setSeller(e.target.value)}/>
   <button style={btn} onClick={()=>{update(addSeller(state,seller));setSeller('')}}>REGISTER SELLER (DEMO)</button>
   {state.sellers.map(p=><div key={p.id}>{p.name} • {p.status} {p.status==='pending'&&<button style={btn} onClick={()=>update(approveSeller(state,p.id))}>DEMO APPROVE</button>}</div>)}
   <strong>FULFILLMENT ORDER TEST</strong>
   <label>Approved seller<select style={input} value={sellerId} onChange={e=>setSellerId(e.target.value)}><option value="">Choose seller</option>{state.sellers.filter(s=>s.status==='approved').map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
   <label>Approved warehouse<select style={input} value={partnerId} onChange={e=>setPartnerId(e.target.value)}><option value="">Choose warehouse</option>{state.partners.filter(p=>p.status==='approved').map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
   <input aria-label="Order SKU" style={input} value={sku} onChange={e=>setSku(e.target.value)}/>
   <label>Quantity<input aria-label="Order quantity" style={input} type="number" min={1} max={100} value={qty} onChange={e=>setQty(Number(e.target.value))}/></label>
   <button style={btn} onClick={()=>update(createDemoOrder(state,sellerId,partnerId,sku,qty))}>CREATE TEST ORDER</button>
   <input aria-label="Demo carrier" style={input} value={carrier} onChange={e=>setCarrier(e.target.value)}/>
   <input aria-label="Demo tracking reference" style={input} value={tracking} onChange={e=>setTracking(e.target.value)}/>
   {state.orders.map(o=><div key={o.id} style={{border:'1px solid #44647c',borderRadius:8,padding:8}}><strong>{o.id} • {o.status.toUpperCase()}</strong><div>{o.sku} × {o.quantity} • {o.partnerId}</div>{o.tracking&&<div>{o.carrier}: {o.tracking}</div>}{o.status!=='delivered'&&<button style={btn} onClick={()=>advance(o.id)}>NEXT ORDER STAGE</button>}</div>)}
   <div aria-live="polite">{note}</div><small>Approvals, carrier references and tracking are simulated. Real partner onboarding requires authenticated staff approval, contracts, carrier APIs and payment verification.</small>
  </div>}
 </aside>
}
