import { getSupabaseClient } from '../services/supabaseClient'

export type JourneyPassport = { displayName?: string; accessibility?: Record<string, unknown>; learning?: Record<string, unknown>; goals?: string[]; updatedAt?: string }
export type JourneyBusiness = { id: string; name: string; status: 'draft'|'active'|'suspended'|'closed'; profile: Record<string, unknown> }
export type JourneyOrder = { id: string; kind: 'marketplace'|'food'|'package'|'service'; status: string; totalMinor: number; currency: string; payload: Record<string, unknown> }

async function requireAuth() {
  const sb = getSupabaseClient()
  if (!sb) throw new Error('Supabase is not configured.')
  const { data, error } = await sb.auth.getUser()
  if (error || !data.user) throw new Error('A real authenticated account is required for this journey.')
  return { sb, user: data.user }
}

async function writeAudit(action:string,targetType:string,targetId:string,result:string,metadata:Record<string,unknown>={}){
  const { sb, user } = await requireAuth()
  const correlationId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
  const { error } = await sb.from('tryamm_audit_events').insert({actor_id:user.id,action,target_type:targetType,target_id:targetId,result,correlation_id:correlationId,metadata})
  if(error) throw error
}

export async function savePassport(passport:JourneyPassport){
  const { sb, user } = await requireAuth(); const data={...passport,updatedAt:new Date().toISOString()}
  const { error }=await sb.from('tryamm_passports').upsert({user_id:user.id,data,updated_at:new Date().toISOString()}); if(error) throw error
  await writeAudit('passport.save','passport',user.id,'success'); return data
}
export async function loadPassport():Promise<JourneyPassport|null>{
  const { sb, user }=await requireAuth(); const { data,error }=await sb.from('tryamm_passports').select('data').eq('user_id',user.id).maybeSingle(); if(error) throw error
  return (data?.data as JourneyPassport|undefined)??null
}
export async function createBusiness(name:string,profile:Record<string,unknown>={}):Promise<JourneyBusiness>{
  const { sb,user }=await requireAuth(); const clean=name.trim(); if(clean.length<2) throw new Error('Business name is required.')
  const { data,error }=await sb.from('tryamm_businesses').insert({owner_id:user.id,name:clean,profile,status:'draft'}).select('id,name,status,profile').single(); if(error) throw error
  await writeAudit('business.create','business',data.id,'success'); return data as JourneyBusiness
}
export async function createMarketplaceOrder(input:{businessId?:string;totalMinor:number;currency?:string;payload:Record<string,unknown>}):Promise<JourneyOrder>{
  const { sb,user }=await requireAuth(); const { data,error }=await sb.from('tryamm_orders').insert({buyer_id:user.id,business_id:input.businessId??null,kind:'marketplace',status:'payment_pending',total_minor:input.totalMinor,currency:input.currency??'USD',payload:input.payload}).select('id,kind,status,total_minor,currency,payload').single(); if(error) throw error
  await writeAudit('marketplace.order.create','order',data.id,'success'); return {id:data.id,kind:data.kind,status:data.status,totalMinor:data.total_minor,currency:data.currency,payload:data.payload}
}
export async function requestJarvisApproval(action:string,payload:Record<string,unknown>){
  const { sb,user }=await requireAuth(); const { data,error }=await sb.from('tryamm_approval_requests').insert({user_id:user.id,action,payload,status:'pending'}).select('id,status').single(); if(error) throw error
  await writeAudit('jarvis.approval.requested','approval',data.id,'pending_approval'); return data as {id:string;status:string}
}
export async function approveJarvisRequest(id:string){
  const { sb }=await requireAuth(); const { data,error }=await sb.from('tryamm_approval_requests').update({status:'approved',decided_at:new Date().toISOString()}).eq('id',id).select('id,status,action,payload').single(); if(error) throw error
  await writeAudit('jarvis.approval.approved','approval',id,'success'); return data
}
export async function authorizeSandboxPayment(order:JourneyOrder){
  const { sb,user }=await requireAuth(); const { data,error }=await sb.from('tryamm_sandbox_payments').insert({user_id:user.id,order_id:order.id,amount_minor:order.totalMinor,currency:order.currency,provider:'tryamm_sandbox',status:'authorized'}).select('id,status').single(); if(error) throw error
  const { error:orderError }=await sb.from('tryamm_orders').update({status:'paid_sandbox',updated_at:new Date().toISOString()}).eq('id',order.id); if(orderError) throw orderError
  await writeAudit('payment.sandbox.authorized','order',order.id,'success',{paymentId:data.id}); return data
}
export async function addDeliveryEvent(orderId:string,state:string,publicMessage:string,etaMinutes?:number){
  const { sb,user }=await requireAuth(); const { data,error }=await sb.from('tryamm_delivery_events').insert({order_id:orderId,actor_id:user.id,state,public_message:publicMessage,eta_minutes:etaMinutes??null}).select('id,state,public_message,eta_minutes,occurred_at').single(); if(error) throw error
  await sb.from('tryamm_orders').update({status:state,updated_at:new Date().toISOString()}).eq('id',orderId); await writeAudit('delivery.event','order',orderId,'success',{state}); return data
}
export async function listDeliveryEvents(orderId:string){
  const { sb }=await requireAuth(); const { data,error }=await sb.from('tryamm_delivery_events').select('id,state,public_message,eta_minutes,occurred_at').eq('order_id',orderId).order('occurred_at',{ascending:true}); if(error) throw error; return data??[]
}
export async function listAuditEvidence(limit=25){
  const { sb,user }=await requireAuth(); const { data,error }=await sb.from('tryamm_audit_events').select('id,action,target_type,target_id,result,correlation_id,metadata,occurred_at').eq('actor_id',user.id).order('occurred_at',{ascending:false}).limit(limit); if(error) throw error; return data??[]
}
