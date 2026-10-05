import {useMemo,useState} from 'react'
import {creditItemsByChannel,formatCreditUnits,type TryammCreditSpendItem} from '../data/TryammHoloPlayCreditEconomy'

export default function HoloCreditChannelShop({channel,title,compact=false}:{channel:TryammCreditSpendItem['channel'];title?:string;compact?:boolean}){
 const items=useMemo(()=>creditItemsByChannel(channel),[channel])
 const [busy,setBusy]=useState('')
 const [status,setStatus]=useState('Use earned Holo Credits first, then purchased Play Credits.')
 const spend=async(item:TryammCreditSpendItem)=>{
  setBusy(item.id);setStatus('Applying server-verified credit spend…')
  try{
   const r=await fetch('/api/credits/spend',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({itemId:item.id,clientReference:'CH-'+channel+'-'+item.id+'-'+Date.now().toString(36)})})
   const d=await r.json().catch(()=>({}))
   if(!r.ok)throw new Error(d?.error||'Credit spend failed')
   window.dispatchEvent(new CustomEvent('tryamm:holo-play-entitlement',{detail:d.entitlement}))
   window.dispatchEvent(new CustomEvent('tryamm:holo-play-wallet-refresh'))
   setStatus(item.label+' unlocked for '+item.costUnits+' credits.')
  }catch(e){setStatus(e instanceof Error?e.message:'Credit spend failed')}finally{setBusy('')}
 }
 return <section aria-label={(title||channel)+' Holo Credit utilities'} style={{padding:10,borderRadius:14,border:'1px solid #43677c',background:'#07111bcc',color:'#fff'}}>
  <div style={{display:'flex',justifyContent:'space-between',gap:8,alignItems:'center'}}><div><div style={{fontSize:8,letterSpacing:1.5,color:'#75e8ff',fontWeight:950}}>HOLO PLAY • {channel}</div><strong>{title||'Credit Utilities'}</strong></div><button onClick={()=>window.dispatchEvent(new CustomEvent('tryamm:holo-play-card-open'))} style={walletBtn}>💳 WALLET</button></div>
  <div style={{display:'grid',gridTemplateColumns:compact?'repeat(2,minmax(0,1fr))':'repeat(auto-fit,minmax(180px,1fr))',gap:6,marginTop:8,maxHeight:compact?250:420,overflowY:'auto'}}>{items.map(item=><button key={item.id} disabled={!!busy} onClick={()=>spend(item)} style={itemBtn}><span style={{fontSize:9,fontWeight:950}}>{item.label}</span><span style={{fontSize:16,color:'#8cf1ff',fontWeight:950}}>{formatCreditUnits(item.costUnits)} CR</span><small style={{color:'#91a8b8',lineHeight:1.35}}>{item.description}</small></button>)}</div>
  <div role='status' style={{fontSize:8,color:'#bfd0dc',marginTop:7}}>{status}</div>
 </section>
}
const itemBtn:React.CSSProperties={textAlign:'left',display:'grid',gap:4,padding:9,borderRadius:11,border:'1px solid #2d4658',background:'#081722',color:'#fff'}
const walletBtn:React.CSSProperties={minHeight:34,borderRadius:9,border:'1px solid #5de7ff66',background:'#0a2634',color:'#fff',fontSize:8,fontWeight:950,padding:'0 9px'}