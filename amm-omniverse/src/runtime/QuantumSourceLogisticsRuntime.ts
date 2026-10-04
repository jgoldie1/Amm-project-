import {getAccessToken} from '../services/supabaseClient'
import {latestProofTracking,type ProofTrackingEvent} from '../logistics/carrierNetwork'

declare global{interface Window{__TRYAMM_QUANTUM_SOURCE_LOGISTICS__?:{
 version:string
 carrierStatus:()=>Promise<unknown>
 ingestTracking:(event:ProofTrackingEvent)=>void
}}}

const tracking=new Map<string,ProofTrackingEvent[]>()

export function installQuantumSourceLogisticsRuntime(){
 if(typeof window==='undefined')return()=>{}
 if(window.__TRYAMM_QUANTUM_SOURCE_LOGISTICS__)return()=>{}

 const carrierStatus=async()=>{
  const token=await getAccessToken()
  if(!token)throw new Error('Sign in required')
  const response=await fetch('/api/logistics/carriers-status',{headers:{Authorization:'Bearer '+token}})
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw new Error(String(data?.error||'Carrier status unavailable'))
  window.dispatchEvent(new CustomEvent('tryamm:carrier-network-status',{detail:data}))
  return data
 }

 const ingestTracking=(event:ProofTrackingEvent)=>{
  if(!event?.orderId||!event?.id)return
  const rows=tracking.get(event.orderId)||[]
  if(rows.some(x=>x.id===event.id))return
  rows.push(event)
  tracking.set(event.orderId,rows)
  const view=latestProofTracking(rows)
  window.dispatchEvent(new CustomEvent('tryamm:proof-tracking-update',{detail:{orderId:event.orderId,...view}}))
 }

 window.__TRYAMM_QUANTUM_SOURCE_LOGISTICS__={version:'1.0.0',carrierStatus,ingestTracking}
 window.dispatchEvent(new CustomEvent('tryamm:quantum-source-logistics-ready',{detail:{
  version:'1.0.0',
  vettedSuppliers:true,
  dropship:true,
  dtc:true,
  lowMoq:true,
  microBatch:true,
  tariffBuster:true,
  virtualWarehouse:true,
  carrier3pl:true,
  proofTracking:true,
  installmentProviderGated:true
 }}))
 return()=>{delete window.__TRYAMM_QUANTUM_SOURCE_LOGISTICS__}
}
