import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

export type SafeJourneyMode='walk'|'transit'|'rideshare'|'bike'|'drive'|'delivery'|'other'
export type SafeJourneyStatus='planned'|'active'|'paused'|'arrived'|'cancelled'|'escalated'
export type SafeJourney={
  id:string
  owner_user_id:string
  mode:SafeJourneyMode
  status:SafeJourneyStatus
  origin:Record<string,unknown>
  destination:Record<string,unknown>
  expected_arrival_at?:string|null
  started_at?:string|null
  arrived_at?:string|null
  share_location:boolean
  auto_checkin_interval_minutes:number
  notes?:string|null
  created_at:string
  updated_at:string
}

export type DispatchSeverity='assist'|'urgent'|'emergency'
export type DispatchRequestType='route_support'|'check_in'|'trusted_contact'|'transport_assist'|'incident_support'|'emergency_escalation'
export type SafeJourneyDispatchRequest={
  id:string
  journey_id:string
  requester_user_id:string
  assigned_responder_user_id?:string|null
  severity:DispatchSeverity
  request_type:DispatchRequestType
  status:'requested'|'reviewing'|'assigned'|'accepted'|'en_route'|'resolved'|'cancelled'|'escalated'
  location:Record<string,unknown>
  details?:string|null
  external_emergency_contacted:boolean
  created_at:string
  assigned_at?:string|null
  resolved_at?:string|null
  updated_at:string
}

function client(){
  const sb=getSupabaseClient()
  if(!sb)throw new Error('Supabase is not configured')
  return sb
}

async function userId(){
  const id=await getAuthenticatedUserId()
  if(!id)throw new Error('Authentication required')
  return id
}

export async function createSafeJourney(input:{
  mode:SafeJourneyMode
  origin:Record<string,unknown>
  destination:Record<string,unknown>
  expectedArrivalAt?:string
  notes?:string
  shareLocation?:boolean
  autoCheckinIntervalMinutes?:number
}){
  const uid=await userId()
  const {data,error}=await client().from('safe_journeys').insert({
    owner_user_id:uid,
    mode:input.mode,
    origin:input.origin,
    destination:input.destination,
    expected_arrival_at:input.expectedArrivalAt??null,
    notes:input.notes??null,
    share_location:input.shareLocation??true,
    auto_checkin_interval_minutes:input.autoCheckinIntervalMinutes??15,
  }).select('*').single()
  if(error)throw error
  return data as SafeJourney
}

export async function startSafeJourney(journeyId:string){
  const {data,error}=await client().from('safe_journeys').update({status:'active',started_at:new Date().toISOString(),updated_at:new Date().toISOString()}).eq('id',journeyId).select('*').single()
  if(error)throw error
  await appendJourneyEvent(journeyId,'started',{})
  return data as SafeJourney
}

export async function markSafeArrival(journeyId:string){
  const now=new Date().toISOString()
  const {data,error}=await client().from('safe_journeys').update({status:'arrived',arrived_at:now,updated_at:now}).eq('id',journeyId).select('*').single()
  if(error)throw error
  await addSafeCheckin(journeyId,'arrived')
  await appendJourneyEvent(journeyId,'arrived',{})
  return data as SafeJourney
}

export async function addSafeCheckin(journeyId:string,status:'ok'|'delayed'|'need_help'|'arrived'|'missed',location?:{lat:number;lng:number;accuracy_m?:number},message?:string){
  const uid=await userId()
  const {data,error}=await client().from('safe_journey_checkins').insert({journey_id:journeyId,user_id:uid,status,message:message??null,...(location??{})}).select('*').single()
  if(error)throw error
  return data
}

export async function requestSafeJourneyDispatch(input:{journeyId:string;severity:DispatchSeverity;requestType:DispatchRequestType;location?:Record<string,unknown>;details?:string}){
  const uid=await userId()
  const {data,error}=await client().from('safe_journey_dispatch_requests').insert({
    journey_id:input.journeyId,
    requester_user_id:uid,
    severity:input.severity,
    request_type:input.requestType,
    location:input.location??{},
    details:input.details??null,
  }).select('*').single()
  if(error)throw error
  await appendJourneyEvent(input.journeyId,'help_requested',{severity:input.severity,requestType:input.requestType},data.id)
  return data as SafeJourneyDispatchRequest
}

export async function appendJourneyEvent(journeyId:string,eventType:string,payload:Record<string,unknown>,dispatchRequestId?:string){
  const uid=await userId()
  const {error}=await client().from('safe_journey_events').insert({journey_id:journeyId,dispatch_request_id:dispatchRequestId??null,actor_user_id:uid,event_type:eventType,payload})
  if(error)throw error
}

export async function listMySafeJourneys(){
  const {data,error}=await client().from('safe_journeys').select('*').order('created_at',{ascending:false}).limit(25)
  if(error)throw error
  return (data??[]) as SafeJourney[]
}

export async function getSafeJourneyDispatch(journeyId:string){
  const {data,error}=await client().from('safe_journey_dispatch_requests').select('*').eq('journey_id',journeyId).order('created_at',{ascending:false}).limit(10)
  if(error)throw error
  return (data??[]) as SafeJourneyDispatchRequest[]
}

export function subscribeToSafeJourney(journeyId:string,onChange:()=>void){
  const sb=client()
  const channel=sb.channel(`safe-journey:${journeyId}`)
    .on('postgres_changes',{event:'*',schema:'public',table:'safe_journeys',filter:`id=eq.${journeyId}`},onChange)
    .on('postgres_changes',{event:'*',schema:'public',table:'safe_journey_dispatch_requests',filter:`journey_id=eq.${journeyId}`},onChange)
    .on('postgres_changes',{event:'INSERT',schema:'public',table:'safe_journey_events',filter:`journey_id=eq.${journeyId}`},onChange)
    .subscribe()
  return ()=>{void sb.removeChannel(channel)}
}
