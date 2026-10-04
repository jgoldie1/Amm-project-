import {getAccessToken} from '../services/supabaseClient'

export type GlobalPaymentRoute={
 ok:boolean
 currency:string
 method:string|null
 selected:null|{id:string;name:string;configured:boolean;productionReady:boolean}
 fallbacks:Array<{id:string;name:string;configured:boolean;productionReady:boolean}>
 canMoveRealMoney:boolean
 mode:'production'|'gated'
 blockers:string[]
}

declare global{
 interface Window{
  __TRYAMM_GLOBAL_AFRICA_PAYMENTS__?:{
   version:string
   route:(input:{currency:string;method?:string})=>Promise<GlobalPaymentRoute>
  }
 }
}

const apiBase=()=>String((import.meta as any).env?.VITE_API_URL||'').replace(/\/$/,'')

export function installGlobalAfricaPaymentsRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_GLOBAL_AFRICA_PAYMENTS__)return()=>{}

 const route=async(input:{currency:string;method?:string})=>{
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in required for payment routing')
  const response=await fetch(apiBase()+'/api/payments/route',{
   method:'POST',
   headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},
   body:JSON.stringify({currency:String(input.currency||'').toUpperCase(),method:input.method||undefined})
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'Payment route failed'))
  window.dispatchEvent(new CustomEvent('tryamm:global-payment-route',{detail:data}))
  return data as GlobalPaymentRoute
 }

 const onCommerce=async(event:Event)=>{
  const d=(event as CustomEvent<Record<string,unknown>>).detail||{}
  const attribution=(d.attribution||{}) as Record<string,unknown>
  const currency=String(d.currency||'USD').toUpperCase()
  const method=String(d.paymentMethod||d.method||'')
  try{
   const result=await route({currency,method:method||undefined})
   window.dispatchEvent(new CustomEvent('tryamm:commerce-payment-route-ready',{detail:{
    intentId:d.id,
    route:result,
    sourceVerse:attribution.sourceVerse,
    merchantId:attribution.merchantId,
    creatorId:attribution.creatorId,
    scoutId:attribution.scoutId,
   }}))
  }catch(error){
   window.dispatchEvent(new CustomEvent('tryamm:commerce-payment-route-failed',{detail:{intentId:d.id,error:String((error as Error)?.message||error)}}))
  }
 }

 window.addEventListener('tryamm:commerce-intent-request',onCommerce as EventListener)
 window.__TRYAMM_GLOBAL_AFRICA_PAYMENTS__={version:'1.0.0',route}
 window.dispatchEvent(new CustomEvent('tryamm:global-africa-payments-ready',{detail:{
  version:'1.0.0',
  globalRouting:true,
  africaRouting:true,
  serverSideSecrets:true,
  liveMoneyFailClosed:true,
 }}))
 return()=>{
  window.removeEventListener('tryamm:commerce-intent-request',onCommerce as EventListener)
  delete window.__TRYAMM_GLOBAL_AFRICA_PAYMENTS__
 }
}
