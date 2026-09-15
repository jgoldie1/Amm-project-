import type { ContentLane, ProductionBible, ProductionFormat } from '../foundation/productionBibleFoundation'
import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export type ProductionBibleRecord={
  production_id:string
  owner_user_id:string
  title:string
  format:ProductionFormat
  content_lane:ContentLane
  version:number
  bible:ProductionBible
  created_at:string
  updated_at:string
}

function requireClient(){
  const sb=getSupabaseClient()
  if(!sb)throw new Error('Supabase is not configured for this client')
  return sb
}

async function requireUserId(){
  const userId=await getAuthenticatedUserId()
  if(!userId)throw new Error('Authenticated TRYAMM user required')
  return userId
}

export async function listMyProductionBibles(limit=50):Promise<ProductionBibleRecord[]>{
  const sb=requireClient()
  const userId=await requireUserId()
  const safeLimit=Math.min(Math.max(Math.trunc(limit)||50,1),100)
  const {data,error}=await sb
    .from('production_bibles')
    .select('production_id,owner_user_id,title,format,content_lane,version,bible,created_at,updated_at')
    .eq('owner_user_id',userId)
    .order('updated_at',{ascending:false})
    .limit(safeLimit)
  if(error)throw error
  return (data??[]) as ProductionBibleRecord[]
}

export async function getMyProductionBible(productionId:string):Promise<ProductionBibleRecord|null>{
  const sb=requireClient()
  const userId=await requireUserId()
  const {data,error}=await sb
    .from('production_bibles')
    .select('production_id,owner_user_id,title,format,content_lane,version,bible,created_at,updated_at')
    .eq('production_id',productionId)
    .eq('owner_user_id',userId)
    .maybeSingle()
  if(error)throw error
  return (data??null) as ProductionBibleRecord|null
}

export async function saveMyProductionBible(bible:ProductionBible):Promise<ProductionBibleRecord>{
  const sb=requireClient()
  const userId=await requireUserId()
  const payload={
    production_id:bible.id,
    owner_user_id:userId,
    title:bible.title,
    format:bible.format,
    content_lane:bible.ratingSafety.lane,
    version:bible.version,
    bible,
  }
  const {data,error}=await sb
    .from('production_bibles')
    .upsert(payload,{onConflict:'production_id'})
    .select('production_id,owner_user_id,title,format,content_lane,version,bible,created_at,updated_at')
    .single()
  if(error)throw error
  return data as ProductionBibleRecord
}

export async function deleteMyProductionBible(productionId:string):Promise<void>{
  const sb=requireClient()
  const userId=await requireUserId()
  const {error}=await sb
    .from('production_bibles')
    .delete()
    .eq('production_id',productionId)
    .eq('owner_user_id',userId)
  if(error)throw error
}

export type PlacementEventRecord={
  event_id:string
  production_id:string
  placement_id:string
  event_type:'IMPRESSION'|'INTERACTION'|'OMNI_BOX_SAVE'|'CHECKOUT_STARTED'|'PURCHASE_VERIFIED'
  territory:string
  commerce_reference:string|null
  event_metadata:Record<string,unknown>
  created_at:string
}

export async function listMyPlacementEvents(productionId:string,limit=100):Promise<PlacementEventRecord[]>{
  const sb=requireClient()
  const userId=await requireUserId()
  const safeLimit=Math.min(Math.max(Math.trunc(limit)||100,1),250)
  const {data,error}=await sb
    .from('production_placement_events')
    .select('event_id,production_id,placement_id,event_type,territory,commerce_reference,event_metadata,created_at')
    .eq('production_id',productionId)
    .eq('owner_user_id',userId)
    .order('created_at',{ascending:false})
    .limit(safeLimit)
  if(error)throw error
  return (data??[]) as PlacementEventRecord[]
}

// Intentionally no browser write/RPC path for production_placement_events.
// Attribution events, especially PURCHASE_VERIFIED, must originate from trusted server code after authoritative verification.
