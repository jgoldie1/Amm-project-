import {useEffect,useState} from 'react'
import {enterShop,leaveShop,talkToMerchant,tryOutfit,travelChrono,initialShopRoleplay,type ShopRoleplay,type Era} from '../runtime/StreetVerseChronoShoppingRuntime'
import {initialLivingWorldState} from '../runtime/StreetVerseLivingStoreRuntime'
const shops=initialLivingWorldState().stores
const b={minHeight:46,padding:'9px 12px',border:'1px solid #8cecff',borderRadius:8,background:'#204a6b',color:'white',cursor:'pointer'}
export default function StreetVerseChronoShopHUD(){
 const [open,setOpen]=useState(false),[state,setState]=useState<ShopRoleplay>(initialShopRoleplay),[location,setLocation]=useState<{x:number;z:number;vehicleId?:string}|null>(null)
 useEffect(()=>{const onPos=(e:Event)=>{const d=(e as CustomEvent<{x?:number;z?:number;vehicleId?:string}>).detail;if(Number.isFinite(d?.x)&&Number.isFinite(d?.z))setLocation({x:d!.x!,z:d!.z!,vehicleId:d?.vehicleId})};window.addEventListener('tryamm:streetverse-player-location',onPos);return()=>window.removeEventListener('tryamm:streetverse-player-location',onPos)},[])
 const near=(x:number,z:number)=>Boolean(location&&Math.hypot(location.x-x,location.z-z)<10)
 const shop=shops.find(s=>s.id===state.insideStoreId)
 return <aside data-streetverse-chrono-shop="fictional" style={{position:'fixed',right:8,top:'calc(env(safe-area-inset-top) + 145px)',zIndex:43990,maxWidth:'min(350px,calc(100vw - 16px))',maxHeight:'65dvh',overflow:'auto',background:'rgba(10,18,39,.96)',color:'#fff',border:'1px solid #5b9eb9',borderRadius:12,padding:10,font:'13px system-ui'}}>
  <button style={b} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🌀 CHRONOVERSE + ENTER STORES</button>
  {open&&<div style={{display:'grid',gap:9,marginTop:10}}>
   <strong>Era: {state.chrono.era} • Branch: {state.chrono.branch}</strong>
   <div>Chrono Console: WHEN + WHERE + WORLD + PURPOSE</div>
   <label>Travel to simulated era<select aria-label="ChronoVerse era" style={{minHeight:46,width:'100%'}} value={state.chrono.era} onChange={e=>{const era=e.target.value as Era;setState(s=>travelChrono(s,era,'Explore historical storefronts'));window.dispatchEvent(new CustomEvent('tryamm:streetverse-chrono-era',{detail:{era,fictional:true}}))}}><option value="present">Present Chicago</option><option value="chicago-1920">Chicago 1920</option><option value="chicago-1985">Chicago 1985</option><option value="future-2126">Future Chicago 2126</option></select></label>
   {!shop?shops.map(s=><button key={s.id} style={b} disabled={!near(s.x,s.z)||Boolean(location?.vehicleId)} onClick={()=>setState(current=>enterShop(current,s.id,near(s.x,s.z),!location?.vehicleId))}>ENTER {s.name.toUpperCase()} {near(s.x,s.z)?'':'(WALK CLOSER)'}</button>):<>
    <strong>Inside {shop.name}</strong>
    <button style={b} onClick={()=>setState(s=>talkToMerchant(s,shop.id))}>TALK TO {shop.merchant.toUpperCase()}</button>
    <button style={b} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-open-shopping',{detail:{storeId:shop.id,demo:true}}))}>BROWSE MERCHANDISE / CHECKOUT</button>
    <button style={b} onClick={()=>setState(s=>tryOutfit(s,'creator-jacket'))}>TRY CREATOR JACKET</button>
    <button style={b} onClick={()=>setState(s=>tryOutfit(s,'vintage-suit'))}>TRY VINTAGE SUIT</button>
    <button style={b} onClick={()=>setState(s=>tryOutfit(s,'future-coat'))}>TRY FUTURE COAT</button>
    <button style={b} onClick={()=>setState(leaveShop)}>EXIT SHOP</button>
   </>}
   <div aria-live="polite">{state.dialogue}</div><div>Outfit preview: {state.outfit}</div>
   <small>Accessible one-touch interactions. Store entry, clothing and eras are currently UI simulations; no rig clothing mesh swap, physical time travel, real payment or goods.</small>
  </div>}
 </aside>
}
