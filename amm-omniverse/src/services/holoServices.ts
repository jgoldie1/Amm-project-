import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb(){const c=getSupabaseClient();if(!c)throw new Error('Supabase not configured');return c}
async function uid(){const id=await getAuthenticatedUserId();if(!id)throw new Error('Authentication required');return id}

export interface HoloSearchDocument { id:string; source_type:string; source_id:string; title:string; description:string; tags:string[]; world_slug:string|null }
export interface HoloversePortal { id:string; slug:string; name:string; destination_type:string; destination_key:string; age_lane:string; enabled:boolean }

export async function holoSearch(query:string):Promise<HoloSearchDocument[]>{
  const q=query.trim().toLowerCase(); if(!q)return []
  const {data,error}=await sb().from('holo_search_documents').select('*').or(`title.ilike.%${q}%,description.ilike.%${q}%`).limit(40)
  if(error)throw error;return (data??[]) as HoloSearchDocument[]
}

export async function listHoloversePortals():Promise<HoloversePortal[]>{
  const {data,error}=await sb().from('holoverse_portals').select('*').eq('enabled',true).order('name');if(error)throw error;return (data??[]) as HoloversePortal[]
}

export async function requestHoloRide(pickup:string,dropoff:string){
  const id=await uid();const fare=Math.max(500,Math.round((pickup.length+dropoff.length)*42))
  const {data,error}=await sb().from('holo_ride_requests').insert({user_id:id,pickup:{label:pickup},dropoff:{label:dropoff},ride_type:'standard',status:'requested',simulation:true,fare_estimate_cents:fare}).select('*').single();if(error)throw error;return data
}

export async function createHoloDelivery(merchant:string,pickup:string,dropoff:string){
  const id=await uid();const {data,error}=await sb().from('holo_delivery_orders').insert({user_id:id,merchant_key:merchant,pickup:{label:pickup},dropoff:{label:dropoff},items:[],status:'placed',simulation:true,delivery_fee_cents:699}).select('*').single();if(error)throw error;return data
}

export async function createLogisticsJob(origin:string,destination:string){
  const id=await uid();const {data,error}=await sb().from('holo_logistics_jobs').insert({owner_id:id,job_type:'freight',origin:{label:origin},destination:{label:destination},cargo:{type:'general-freight'},status:'planned',simulation:true,route_state:{checkpoint:'planning'}}).select('*').single();if(error)throw error;return data
}

export async function createAdCampaign(name:string,objective='awareness'){
  const id=await uid();const {data,error}=await sb().from('holo_ad_campaigns').insert({owner_id:id,name,objective,creative:{format:'holo-card'},audience:{scope:'sandbox'},placements:['feed','living-world','live'],budget_cents:0,status:'draft',simulation:true}).select('*').single();if(error)throw error;return data
}

export async function createHoloBuilderProject(title:string,builderType:'world'|'app'|'storefront'|'ad'|'experience'|'workflow'|'agent'){
  const id=await uid();const {data,error}=await sb().from('holo_builder_projects').insert({owner_id:id,title,builder_type:builderType,status:'draft',spec:{version:1}}).select('*').single();if(error)throw error;return data
}

export async function prepareTranslation(sourceText:string,targetLocale:string,sourceLocale='auto'){
  const id=await uid();const risk=/\b(legal|medical|diagnosis|investment|emergency|contract|prescription)\b/i.test(sourceText)
  const {data,error}=await sb().from('holo_translation_jobs').insert({user_id:id,source_locale:sourceLocale,target_locale:targetLocale,source_text:sourceText,status:risk?'human-review':'prepared',high_risk:risk,metadata:{preserve_original:true}}).select('*').single();if(error)throw error;return data
}

export async function reportHoloSafetyEvent(eventType:string,severity:'low'|'medium'|'high'|'critical',payload:Record<string,unknown>={}){
  const id=await uid();const {data,error}=await sb().from('holo_safety_events').insert({user_id:id,event_type:eventType,severity,source:'holo-services-hub',payload,status:'open'}).select('*').single();if(error)throw error;return data
}
