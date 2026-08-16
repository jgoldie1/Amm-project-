import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb(){const c=getSupabaseClient();if(!c)throw new Error('Supabase not configured');return c}
async function uid(){const id=await getAuthenticatedUserId();if(!id)throw new Error('Authentication required');return id}

export type DriverStatus='draft'|'submitted'|'under_review'|'approved'|'rejected'|'suspended'
export type TripStatus='requested'|'matching'|'driver_assigned'|'en_route'|'arrived'|'in_progress'|'completed'|'cancelled'

export interface DriverApplicationInput {
  legalName:string
  phone:string
  dateOfBirth?:string
  licenseNumber:string
  licenseRegion:string
  licenseExpires?:string
  insuranceProvider:string
  insurancePolicy:string
  insuranceExpires?:string
  consentBackgroundCheck:boolean
}

export interface VehicleInput {
  make:string
  model:string
  year:number
  color:string
  plate:string
  plateRegion:string
  vinLast6?:string
  seats:number
  vehicleClass:'standard'|'xl'|'accessible'|'premium'
}

export async function upsertRiderProfile(input:{displayName:string;phone?:string;emergencyContact?:Record<string,string>;accessibility?:Record<string,unknown>}){
  const userId=await uid()
  const {data,error}=await sb().from('holo_rider_profiles').upsert({user_id:userId,display_name:input.displayName,phone:input.phone??null,emergency_contact:input.emergencyContact??{},accessibility:input.accessibility??{},updated_at:new Date().toISOString()},{onConflict:'user_id'}).select('*').single()
  if(error)throw error;return data
}

export async function submitDriverApplication(input:DriverApplicationInput){
  if(!input.consentBackgroundCheck)throw new Error('Background-check consent is required before driver review.')
  const userId=await uid()
  const {data,error}=await sb().from('holo_driver_applications').upsert({user_id:userId,status:'submitted',legal_name:input.legalName,phone:input.phone,date_of_birth:input.dateOfBirth??null,license_number:input.licenseNumber,license_region:input.licenseRegion,license_expires:input.licenseExpires??null,insurance_provider:input.insuranceProvider,insurance_policy:input.insurancePolicy,insurance_expires:input.insuranceExpires??null,background_check_consent:true,submitted_at:new Date().toISOString(),simulation:true},{onConflict:'user_id'}).select('*').single()
  if(error)throw error;return data
}

export async function upsertDriverVehicle(input:VehicleInput){
  const userId=await uid()
  const {data,error}=await sb().from('holo_driver_vehicles').upsert({user_id:userId,...input,verification_status:'pending',simulation:true,updated_at:new Date().toISOString()},{onConflict:'user_id,plate'}).select('*').single()
  if(error)throw error;return data
}

export async function setDriverAvailability(online:boolean,location?:{lat:number;lng:number}){
  const userId=await uid()
  const {data:driver,error:driverError}=await sb().from('holo_driver_applications').select('status').eq('user_id',userId).maybeSingle()
  if(driverError)throw driverError
  if(online&&driver?.status!=='approved')throw new Error('Driver must be approved before going online.')
  const {data,error}=await sb().from('holo_driver_presence').upsert({user_id:userId,online,location:location??null,last_seen_at:new Date().toISOString()},{onConflict:'user_id'}).select('*').single()
  if(error)throw error;return data
}

export async function quoteRide(pickup:{label:string;lat?:number;lng?:number},dropoff:{label:string;lat?:number;lng?:number},rideType='standard'){
  const base=350
  const estimate=Math.max(500,base+Math.round((pickup.label.length+dropoff.label.length)*35))
  return {currency:'USD',rideType,estimatedFareCents:estimate,estimatedRangeCents:[estimate,Math.round(estimate*1.2)],simulation:true,expiresAt:new Date(Date.now()+5*60_000).toISOString()}
}

export async function requestRide(pickup:Record<string,unknown>,dropoff:Record<string,unknown>,quote:{estimatedFareCents:number;rideType:string}){
  const userId=await uid()
  const {data,error}=await sb().from('holo_ride_requests').insert({user_id:userId,pickup,dropoff,ride_type:quote.rideType,status:'requested',simulation:true,fare_estimate_cents:quote.estimatedFareCents,requested_at:new Date().toISOString()}).select('*').single()
  if(error)throw error;return data
}

export async function transitionTrip(tripId:string,next:TripStatus,metadata:Record<string,unknown>={}){
  const userId=await uid()
  const allowed:Record<TripStatus,TripStatus[]>={requested:['matching','cancelled'],matching:['driver_assigned','cancelled'],driver_assigned:['en_route','cancelled'],en_route:['arrived','cancelled'],arrived:['in_progress','cancelled'],in_progress:['completed'],completed:[],cancelled:[]}
  const {data:trip,error:readError}=await sb().from('holo_ride_requests').select('id,status,user_id').eq('id',tripId).single()
  if(readError)throw readError
  if(trip.user_id!==userId)throw new Error('Not authorized for this trip.')
  if(!allowed[trip.status as TripStatus]?.includes(next))throw new Error(`Invalid trip transition: ${trip.status} → ${next}`)
  const {data,error}=await sb().from('holo_ride_requests').update({status:next,route_state:{...metadata,updatedAt:new Date().toISOString()}}).eq('id',tripId).select('*').single()
  if(error)throw error;return data
}

export async function createSafetyEvent(tripId:string,type:'sos'|'share_trip'|'route_deviation'|'unsafe_behavior',details:Record<string,unknown>={}){
  const userId=await uid()
  const severity=type==='sos'?'critical':'high'
  const {data,error}=await sb().from('holo_safety_events').insert({user_id:userId,event_type:`ride_${type}`,severity,source:'holo-ride',payload:{tripId,...details},status:'open'}).select('*').single()
  if(error)throw error;return data
}

export async function submitTripRating(tripId:string,rating:number,comment=''){
  if(!Number.isInteger(rating)||rating<1||rating>5)throw new Error('Rating must be an integer from 1 to 5.')
  const userId=await uid()
  const {data,error}=await sb().from('holo_ride_ratings').insert({trip_id:tripId,user_id:userId,rating,comment}).select('*').single()
  if(error)throw error;return data
}

export async function listRideReceipts(){
  const userId=await uid()
  const {data,error}=await sb().from('holo_ride_receipts').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(100)
  if(error)throw error;return data??[]
}

export async function getDriverEarnings(){
  const userId=await uid()
  const {data,error}=await sb().from('holo_driver_earnings').select('*').eq('driver_id',userId).order('created_at',{ascending:false}).limit(100)
  if(error)throw error;return data??[]
}

// Real charging/payout is intentionally provider-gated. Never mark a simulated trip paid.
export async function requestPaymentOrPayout(kind:'rider_payment'|'driver_payout',referenceId:string,amountCents:number){
  if(amountCents<=0)throw new Error('Amount must be positive.')
  const userId=await uid()
  const {data,error}=await sb().from('holo_payment_intents').insert({user_id:userId,kind,reference_id:referenceId,amount_cents:amountCents,currency:'USD',status:'provider_required',simulation:true}).select('*').single()
  if(error)throw error;return data
}
