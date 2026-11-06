import {useEffect,useState} from 'react'
import {applyStoreAction,advanceLivingWorld,initialLivingWorldState,type LivingWorldState,type StoreAction} from '../runtime/StreetVerseLivingStoreRuntime'
export default function StreetVerseLivingStoresHUD(){
 const [open,setOpen]=useState(false),[state,setState]=useState<LivingWorldState>(initialLivingWorldState),[message,setMessage]=useState('StreetVerse storefronts are fictional simulations.')
 useEffect(()=>{const onRestock=(event:Event)=>{const detail=(event as CustomEvent<{status?:string;sku?:string;demo?:boolean}>).detail
 if(detail?.demo!==true||detail.status!=='delivered')return
 setState(current=>{const store=current.stores.find(s=>s.sku===detail.sku);return store?applyStoreAction(current,{kind:'restock',storeId:store.id,quantity:3}).state:current})
 }
 window.addEventListener('tryamm:streetverse-fulfillment-demo-order',onRestock)
 return()=>window.removeEventListener('tryamm:streetverse-fulfillment-demo-order',onRestock)},[])
 const act=(action:StoreAction)=>{const result=applyStoreAction(state,action);setState(result.state);setMessage(result.reason);if(result.ok&&action.kind==='purchase')window.dispatchEvent(new CustomEvent('tryamm:streetverse-store-demo-purchase',{detail:{...action,demo:true,fictional:true}}))}
 const button={minHeight:44,padding:'7px 10px',borderRadius:8,border:'1px solid #70e1e7',background:'#16465a',color:'white'}
 return <aside data-streetverse-living-stores="demo" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 80px)',zIndex:43987,maxWidth:'min(330px,calc(100vw - 16px))',maxHeight:'65dvh',overflow:'auto',background:'rgba(6,25,37,.96)',color:'white',padding:8,borderRadius:10,font:'12px system-ui'}}>
  <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🏪 LIVING STORES / NPC VENDORS</button>
  {open&&<div style={{display:'grid',gap:8,marginTop:8}}>
   <div>Fictional wallet: {state.credits} credits • NPC visits: {state.visits} • Orders: {state.transactions}</div>
   {state.stores.map(store=><section key={store.id} style={{border:'1px solid #496477',padding:8,borderRadius:8}}>
    <strong>{store.name}</strong><div>{store.merchant} • ({store.x}, {store.z})</div>
    <div>{store.sku}: {store.stock} available • {store.priceCredits} credits</div>
    <button style={button} onClick={()=>act({kind:'npc-visit',storeId:store.id})}>TALK TO NPC</button>
    <button style={button} onClick={()=>act({kind:'purchase',storeId:store.id,sku:store.sku,quantity:1})}>BUY DEMO ITEM</button>
   </section>)}
   <button style={button} onClick={()=>{setState(s=>advanceLivingWorld(s));setMessage('Living world simulated one time step.')}}>ADVANCE NPC WORLD</button>
   <div aria-live="polite">{message}</div><small>NPCs, stock, credits and orders are simulated. No real stores, seller approvals, payments or deliveries are connected.</small>
  </div>}
 </aside>
}
