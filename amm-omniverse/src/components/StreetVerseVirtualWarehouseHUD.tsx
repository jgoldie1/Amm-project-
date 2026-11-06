import {useEffect,useState} from 'react'
import {type WarehouseItem,type WarehouseState,initialWarehouseState} from '../runtime/StreetVerseVirtualWarehouseRuntime'
const labels:Record<WarehouseItem,string>={'uic-package':'UIC delivery packages','restaurant-supplies':'Restaurant supplies','studio-equipment':'Studio equipment'}
export default function StreetVerseVirtualWarehouseHUD(){
 const [open,setOpen]=useState(false)
 const [near,setNear]=useState(false)
 const [state,setState]=useState<WarehouseState>(initialWarehouseState)
 const [message,setMessage]=useState('Visit the warehouse at the Roosevelt checkpoint.')
 useEffect(()=>{
  const onState=(e:Event)=>{const d=(e as CustomEvent<{near:boolean;state:WarehouseState}>).detail;if(d){setNear(d.near);setState(d.state)}}
  const onResult=(e:Event)=>{const d=(e as CustomEvent<{ok:boolean;reason?:string}>).detail;setMessage(d.ok?'Warehouse transaction recorded.':d.reason||'Action unavailable.')}
  window.addEventListener('tryamm:streetverse-warehouse-state',onState)
  window.addEventListener('tryamm:streetverse-warehouse-result',onResult)
  return()=>{window.removeEventListener('tryamm:streetverse-warehouse-state',onState);window.removeEventListener('tryamm:streetverse-warehouse-result',onResult)}
 },[])
 const button={minHeight:46,borderRadius:9,border:'1px solid #8be9ff',background:'#163d58',color:'white',padding:'8px 10px',fontWeight:700}
 return <aside data-streetverse-warehouse="true" style={{position:'fixed',left:8,top:'calc(env(safe-area-inset-top) + 82px)',zIndex:43990,width:open?250:'auto',maxWidth:'calc(100vw - 16px)',maxHeight:'60dvh',overflowY:'auto',background:open?'rgba(5,23,41,.96)':'transparent',color:'#e7ffff',borderRadius:12,padding:open?10:0,font:'12px system-ui'}}>
 <button style={button} onClick={()=>setOpen(v=>!v)} aria-expanded={open}>🏭 VIRTUAL WAREHOUSE</button>
 {open&&<div style={{display:'grid',gap:8,marginTop:8}}><strong>CHICAGO LOGISTICS HUB</strong><div>{near?'At warehouse • operations enabled':'Travel to Roosevelt warehouse and exit vehicle'}</div>{(Object.keys(labels) as WarehouseItem[]).map(item=><div key={item} style={{borderTop:'1px solid #42647b',paddingTop:6}}><strong>{labels[item]}</strong><div>Available: {state.stock[item]} • Reserved: {state.reserved[item]}</div><div style={{display:'flex',gap:6,flexWrap:'wrap'}}><button style={button} disabled={!near||state.stock[item]<=0} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-warehouse-interact',{detail:{action:'reserve',item}}))}>PICK ORDER</button><button style={button} disabled={!near||state.reserved[item]<=0} onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:streetverse-warehouse-interact',{detail:{action:'fulfill',item}}))}>DISPATCH</button></div></div>)}<div>Orders dispatched: {state.fulfilled}</div><div role="status">{message}</div><small>Fictional warehouse simulation; no real stock or shipping.</small></div>}
 </aside>
}
