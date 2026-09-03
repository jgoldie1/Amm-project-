import { getAccessToken } from './supabaseClient'

async function postSettlement(body:Record<string,unknown>){
  const token=await getAccessToken();if(!token)throw new Error('Authentication required')
  const res=await fetch('/api/press/settlement',{method:'POST',headers:{'content-type':'application/json',authorization:`Bearer ${token}`},body:JSON.stringify(body)})
  const data=await res.json().catch(()=>({}))
  if(!res.ok)throw new Error(data?.error||`Settlement request failed (${res.status})`)
  return data
}

export async function reconcilePressSale(commerceOrderId:string,editionId:string,printJobId:string){
  return postSettlement({action:'reconcile',commerceOrderId,editionId,printJobId})
}

export async function releasePressRoyalty(pressSaleId:string){
  return postSettlement({action:'release',pressSaleId})
}
