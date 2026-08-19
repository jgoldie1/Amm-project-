import { useEffect, useState } from 'react'
import { getSessionUser, isSupabaseConfigured } from '../game/auth/googleAuth'
import { addDeliveryEvent, approveJarvisRequest, authorizeSandboxPayment, createBusiness, createMarketplaceOrder, listAuditEvidence, listDeliveryEvents, loadPassport, requestJarvisApproval, savePassport, type JourneyBusiness, type JourneyOrder } from '../coreJourney/coreJourneyService'

export default function CoreJourneyLauncher(){
  const [open,setOpen]=useState(false),[user,setUser]=useState<string|null>(null),[msg,setMsg]=useState('')
  const [business,setBusiness]=useState<JourneyBusiness|null>(null),[order,setOrder]=useState<JourneyOrder|null>(null),[approval,setApproval]=useState<string|null>(null)
  const [done,setDone]=useState<Record<string,boolean>>({})
  useEffect(()=>{getSessionUser().then(u=>setUser(u?.provider==='mock'?null:u?.name??null))},[open])
  const ready=isSupabaseConfigured()&&!!user
  async function run(key:string,fn:()=>Promise<void>){setMsg('');try{await fn();setDone(s=>({...s,[key]:true}))}catch(e:any){setMsg(e?.message??String(e))}}
  const row=(key:string,label:string,disabled:boolean,fn:()=>Promise<void>)=><button disabled={disabled} onClick={()=>run(key,fn)} style={{width:'100%',padding:12,marginTop:8,borderRadius:12,border:'1px solid #1d3348',background:disabled?'#07090d':'#07131e',color:disabled?'#52606d':'#fff',display:'flex',justifyContent:'space-between',cursor:disabled?'not-allowed':'pointer'}}><b>{label}</b><span style={{color:done[key]?'#67ffb0':'#8b9bad'}}>{done[key]?'✓ DONE':'RUN'}</span></button>
  return <>
    <button aria-label="Open secure core journey" onClick={()=>setOpen(true)} style={{position:'fixed',right:12,bottom:176,zIndex:9000,border:'1px solid #4fe3ff77',borderRadius:999,padding:'9px 13px',background:'#0a202b',color:'#4fe3ff',fontWeight:900}}>CORE JOURNEY</button>
    {open&&<div role="dialog" aria-label="TRYAMM secure core journey" style={{position:'fixed',inset:0,zIndex:12000,background:'#02050bf2',overflowY:'auto',color:'#fff'}}><div style={{maxWidth:720,margin:'0 auto',padding:18}}>
      <div style={{display:'flex',justifyContent:'space-between'}}><div><small style={{color:'#4fe3ff'}}>TRYAMM SECURE JOURNEY</small><h2>One authenticated platform</h2></div><button onClick={()=>setOpen(false)} aria-label="Close">×</button></div>
      <div style={{padding:12,border:'1px solid #31506b',borderRadius:12}}> {ready?`Authenticated as ${user}`:'Production authentication required'}<br/>Supabase: {isSupabaseConfigured()?'configured':'not configured'}</div>
      {msg&&<div role="alert" style={{marginTop:10,color:'#ff9aaa'}}>{msg}</div>}
      {row('passport','Authenticated Passport save/reload',!ready,async()=>{await savePassport({displayName:user??undefined,goals:['build','earn','serve']});const p=await loadPassport();if(!p)throw new Error('Passport reload failed')})}
      {row('business','Authenticated Business creation',!ready,async()=>setBusiness(await createBusiness('TRYAMM Test Business',{source:'core-journey'})))}
      {row('order','Marketplace order',!ready||!business,async()=>setOrder(await createMarketplaceOrder({businessId:business?.id,totalMinor:2499,payload:{item:'TRYAMM Launch Kit',fulfillment:'holo_delivery'}})))}
      {row('approval','JARVIS approval firewall',!ready||!order,async()=>{const r=await requestJarvisApproval('authorize_sandbox_checkout',{orderId:order?.id});setApproval(r.id);await approveJarvisRequest(r.id)})}
      {row('payment','Payment sandbox',!ready||!order||!approval,async()=>{if(order)await authorizeSandboxPayment(order)})}
      {row('delivery','Holo Delivery tracking',!ready||!order,async()=>{if(!order)throw new Error('Order missing');await addDeliveryEvent(order.id,'confirmed','Order confirmed',28);await addDeliveryEvent(order.id,'in_transit','Courier is on the way',12);const e=await listDeliveryEvents(order.id);if(e.length<2)throw new Error('Tracking persistence failed')})}
      {row('audit','Audit evidence',!ready,async()=>{const a=await listAuditEvidence();if(!a.length)throw new Error('Audit evidence missing')})}
      {row('reload','Reload evidence',!ready||!order,async()=>{const p=await loadPassport(),e=order?await listDeliveryEvents(order.id):[],a=await listAuditEvidence();if(!p||!e.length||!a.length)throw new Error('Persistent reload failed')})}
    </div></div>}
  </>
}
