import {useEffect,useState} from 'react'
import {applyStoreAction,advanceLivingWorld,type StoreAction} from '../runtime/StreetVerseLivingStoreRuntime'
import {awardDeliveryOnce,buyGameProduct,initialShoppingLedger,readShoppingLedger,serializeShoppingLedger,SHOPPING_SAVE_KEY,type ShoppingLedger} from '../runtime/StreetVerseShoppingLedger'
const button={minHeight:46,padding:'8px 12px',borderRadius:8,border:'1px solid #75e4ff',background:'#164c65',color:'#fff',cursor:'pointer'}
export default function StreetVerseLivingStoresHUD(){
 const [open,setOpen]=useState(false)
 const [ledger,setLedger]=useState<ShoppingLedger>(()=>{try{return readShoppingLedger(localStorage.getItem(SHOPPING_SAVE_KEY))}catch{return initialShoppingLedger()}})
 const [message,setMessage]=useState('Welcome to StreetVerse Shopping. Game credits only.')
 const [quantities,setQuantities]=useState<Record<string,number>>({})
 useEffect(()=>{const onOpen=(e:Event)=>{const id=(e as CustomEvent<{storeId?:string}>).detail?.storeId;if(!id||!ledger.world.stores.some(s=>s.id===id))return;setOpen(true);setMessage('Browsing '+ledger.world.stores.find(s=>s.id===id)?.name+' — game credits only.')};window.addEventListener('tryamm:streetverse-open-shopping',onOpen);return()=>window.removeEventListener('tryamm:streetverse-open-shopping',onOpen)},[ledger.world.stores])
 useEffect(()=>{try{localStorage.setItem(SHOPPING_SAVE_KEY,serializeShoppingLedger(ledger))}catch{}},[ledger])
 useEffect(()=>{
  const onComplete=(event:Event)=>{
   const d=(event as CustomEvent<{missionId?:string;storeId?:string;sku?:string;quantity?:number;rewardCredits?:number;demo?:boolean}>).detail
   if(d?.demo!==true||!d.missionId||!d.storeId||!d.sku)return
   setLedger(current=>awardDeliveryOnce(current,d.missionId!,d.storeId!,d.sku!,Number(d.quantity),Number(d.rewardCredits)))
   setMessage('Delivery completion received. Reward and store inventory are recorded once.')
  }
  window.addEventListener('tryamm:streetverse-holo-delivery-mission-complete',onComplete)
  return()=>window.removeEventListener('tryamm:streetverse-holo-delivery-mission-complete',onComplete)
 },[])
 const act=(action:StoreAction)=>{
  if(action.kind==='purchase'){
   const result=buyGameProduct(ledger,action.storeId,action.sku||'',action.quantity||1)
   setMessage(result.message)
   if(result.ok){setLedger(result.ledger);window.dispatchEvent(new CustomEvent('tryamm:streetverse-store-demo-purchase',{detail:{...action,demo:true,fictional:true}}))}
   return
  }
  const result=applyStoreAction(ledger.world,action)
  setMessage(result.reason)
  if(result.ok)setLedger({...ledger,world:result.state})
 }
 return <aside data-streetverse-living-stores="demo" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 80px)',zIndex:43987,maxWidth:'min(370px,calc(100vw - 16px))',maxHeight:'70dvh',overflow:'auto',background:'rgba(5,22,39,.97)',color:'white',padding:10,borderRadius:12,font:'13px system-ui',boxShadow:'0 8px 30px #0008'}}>
  <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🛍️ STREETVERSE SHOPPING MALL</button>
  {open&&<div style={{display:'grid',gap:12,marginTop:12}}>
   <header><strong style={{fontSize:17}}>SHOP THE LIVING CITY</strong><div>🪙 {ledger.world.credits} game credits • {ledger.receipts.length} purchases • {ledger.completedMissionIds.length} deliveries</div></header>
   {ledger.world.stores.map(store=><section key={store.id} style={{border:'1px solid #426e87',borderRadius:12,padding:10,background:'#0d2d42'}}>
    <div style={{fontSize:22}}>{store.kind==='creator-merch'?'👕':store.kind==='beauty'?'💄':'🍲'}</div>
    <strong style={{fontSize:15}}>{store.name}</strong><div>Shopkeeper: {store.merchant}</div>
    <div>{store.sku} • 🪙 {store.priceCredits} each</div>
    <div>Available: {store.stock} • In-game location ({store.x}, {store.z})</div>
    <label>Quantity <input aria-label={'Quantity for '+store.name} type="number" min={1} max={25} value={quantities[store.id]??1} onChange={e=>setQuantities(q=>({...q,[store.id]:Number(e.target.value)}))} style={{width:70,minHeight:44,margin:5}}/></label>
    <div style={{display:'flex',gap:6,flexWrap:'wrap'}}><button style={button} onClick={()=>act({kind:'npc-visit',storeId:store.id})}>TALK TO VENDOR</button><button style={button} onClick={()=>act({kind:'purchase',storeId:store.id,sku:store.sku,quantity:quantities[store.id]??1})}>BUY WITH GAME CREDITS</button></div>
   </section>)}
   <button style={button} onClick={()=>setLedger(l=>({...l,world:advanceLivingWorld(l.world)}))}>ADVANCE LIVING WORLD</button>
   <strong>YOUR GAME RECEIPTS</strong>
   {ledger.receipts.slice(-5).reverse().map(r=><div key={r.id}>{r.id} • {r.quantity} × {r.sku} • 🪙 {r.credits}</div>)}
   <div role="status" aria-live="polite">{message}</div>
   <small>All purchases, credits, inventory, vendor actions and delivery rewards here are fictional. No real goods, charges or shipments are created.</small>
  </div>}
 </aside>
}
