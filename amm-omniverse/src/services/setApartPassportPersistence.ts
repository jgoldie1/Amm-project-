import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export type SetApartPassportReceipt={
  receipt_id:string
  chain_event_id:string
  block_number:number
  block_hash:string
  event_type:'SABBATH'|'NEW_MOON'|'COVENANT'|'MINISTRY_SERVICE'|'EDUCATION'|'LEGACY'|'COMMUNITY_RECORD'|'CHARITY_SERVICE'
  resource_ref:string
  classification:'SET_APART_COMMUNITY'|'FAITH_ATTESTATION'|'LEGACY_ATTESTATION'|'SERVICE_ATTESTATION'
  display_title:string
  display_summary:string|null
  visibility:'PRIVATE'
  attested_at:string
  projected_at:string
}

function requireClient(){
  const sb=getSupabaseClient()
  if(!sb)throw new Error('Supabase is not configured for this client')
  return sb
}

export async function listMySetApartPassportReceipts(limit=50):Promise<SetApartPassportReceipt[]>{
  const sb=requireClient()
  const userId=await getAuthenticatedUserId()
  if(!userId)throw new Error('Authenticated TRYAMM user required')
  const safeLimit=Math.min(Math.max(Math.trunc(limit)||50,1),100)
  const {data,error}=await sb
    .from('set_apart_passport_receipts')
    .select('receipt_id,chain_event_id,block_number,block_hash,event_type,resource_ref,classification,display_title,display_summary,visibility,attested_at,projected_at')
    .eq('owner_user_id',userId)
    .order('attested_at',{ascending:false})
    .limit(safeLimit)
  if(error)throw error
  return (data??[]) as SetApartPassportReceipt[]
}
