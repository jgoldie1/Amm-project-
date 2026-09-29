import { getAccessToken } from './supabaseClient'

const API=(import.meta.env.VITE_API_URL as string|undefined)?.replace(/\/$/,'')||''

export type TryammReadiness={
  ok:boolean
  critical?:Record<string,boolean>
  resilience?:{
    product?:string
    states?:Record<string,{inFlight:number;consecutiveFailures:number;circuitOpen:boolean;rejected:number}>
  }
  ts?:number
}

export async function getTryammReadiness():Promise<TryammReadiness>{
  if(!API)return{ok:false,critical:{apiConfigured:false}}
  const response=await fetch(`${API}/api/readyz`,{headers:{Accept:'application/json'},cache:'no-store'})
  const data=await response.json().catch(()=>({ok:false}))
  return data as TryammReadiness
}

export async function secureMiddleverseHandoff(input:{
  routeKey:string
  taskSummary:string
  sourceContext?:Record<string,unknown>
  riskBand?:'green'|'yellow'|'orange'|'red'
  targetRef?:string
  clientRequestId?:string
}){
  if(!API)throw new Error('VITE_API_URL is not configured')
  const token=await getAccessToken()
  if(!token)throw new Error('Authentication required')
  const clientRequestId=input.clientRequestId||crypto.randomUUID()
  const response=await fetch(`${API}/api/middleverse/handoffs`,{
    method:'POST',
    headers:{
      Authorization:`Bearer ${token}`,
      'Content-Type':'application/json',
      'Idempotency-Key':clientRequestId,
    },
    body:JSON.stringify({...input,clientRequestId}),
  })
  const data=await response.json().catch(()=>({}))
  if(!response.ok)throw Object.assign(new Error(data?.error||`Middleverse handoff failed (${response.status})`),{status:response.status,data})
  return{...data,clientRequestId}
}
