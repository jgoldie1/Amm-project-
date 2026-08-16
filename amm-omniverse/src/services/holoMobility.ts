import { getAuthenticatedUserId, getSupabaseClient } from './supabaseClient'

function sb(){const c=getSupabaseClient();if(!c)throw new Error('Supabase not configured');return c}
async function uid(){const id=await getAuthenticatedUserId();if(!id)throw new Error('Authentication required');return id}

export type DriverStatus='draft'|'submitted'|'review'|'approved'|'rejected'|'suspended'
export type TripStatus='requested'|'matching'|'driver_assigned'|'en_route'|'arrived'|'in_progress'|'completed'|'cancelled'
export type GeoPoint={label:string;lat?:number;lng?:number;placeId?:string}
export type CancelReason='changed_mind'|'wrong_pickup'|'wait_too_long'|'driver_not_moving'|'wrong_vehicle'|'safety_concern'|'other'
export type DriverReportReason='unsafe_driving'|'harassment'|'discrimination'|'wrong_driver'|'wrong_vehicle'|'impaired_driving'|'route_concern'|'vehicle_condition'|'payment_issue'|'other'

export async function upsertRiderProfile(input:{displayName:string;phone?:string;emergencyContact?:Record<string,string>;accessibility?:Record<string,unknown>}){
 const userId=await uid();const {data,error}=await sb().from('holo_rider_profiles').upsert({user_id:userId,display_name:input.displayName,phone:input.phone??null,emergency_contact:input.emergencyContact??{},accessibility:input.accessibility??{},updated_at:new Date().toISOString()},{onConflict:'user_id'}).select('*').single();if(error)throw error;return data
}

export async function submitDriverApplication(input:{consentBackgroundCheck:boolean}){
 if(!input.consentBackgroundCheck)throw new Error('Background-check consent is required.')
 const userId=await uid();const {data,error}=await sb().from('holo_driver_profiles').upsert({user_id:userId,status:'submitted',background_check_status:'pending_provider',identity_status:'pending_provider',insurance_status:'pending_review',payout_status:'pending_provider',consent_at:new Date().toISOString(),updated_at:new Date().toISOString()},{onConflict:'user_id'}).select('*').single();if(error)throw error;return data
}

export async function addDriverVehicle(input:{make:string;model:string;year:number;color?:string;plateLast4?:string;insuranceExpiresAt?:string}){
 const driverId=await uid();const {data,error}=await sb().from('holo_driver_vehicles').insert({driver_id:driverId,make:input.make,model:input.model,year:input.year,color:input.color??null,plate_last4:input.plateLast4??null,insurance_expires_at:input.insuranceExpiresAt??null,verification_status:'pending',active:false}).select('*').single();if(error)throw error;return data
}

export async function setDriverAvailability(online:boolean,location?:{lat:number;lng:number;heading?:number;accuracyM?:number}){
 const driverId=await uid();const {data:driver,error:driverError}=await sb().from('holo_driver_profiles').select('status').eq('user_id',driverId).maybeSingle();if(driverError)throw driverError
 if(online&&driver?.status!=='approved')throw new Error('Driver must be approved before going online.')
 const {data,error}=await sb().from('holo_driver_presence').upsert({driver_id:driverId,online,lat:location?.lat??null,lng:location?.lng??null,heading:location?.heading??null,accuracy_m:location?.accuracyM??null,updated_at:new Date().toISOString()},{onConflict:'driver_id'}).select('*').single();if(error)throw error;return data
}

export async function createSimulationQuote(pickup:GeoPoint,dropoff:GeoPoint,rideType='standard'){
 const riderId=await uid();const estimate=Math.max(500,350+Math.round((pickup.label.length+dropoff.label.length)*35));const expiresAt=new Date(Date.now()+5*60_000).toISOString()
 const {data,error}=await sb().from('holo_ride_quotes').insert({rider_id:riderId,pickup,dropoff,currency:'usd',fare_estimate_cents:estimate,expires_at:expiresAt,provider:'simulation'}).select('*').single();if(error)throw error
 return {...data,rideType,simulation:true}
}

export async function requestRideFromQuote(quote:{id:string;pickup:GeoPoint;dropoff:GeoPoint;fare_estimate_cents:number},rideType='standard'){
 const userId=await uid();const {data,error}=await sb().from('holo_ride_requests').insert({user_id:userId,quote_id:quote.id,pickup:quote.pickup,dropoff:quote.dropoff,ride_type:rideType,status:'requested',simulation:true,fare_estimate_cents:quote.fare_estimate_cents}).select('*').single();if(error)throw error;return data
}

export async function cancelRide(rideId:string,reason:CancelReason,details=''){
 const userId=await uid();const {data:ride,error:readError}=await sb().from('holo_ride_requests').select('id,user_id,status,driver_id').eq('id',rideId).single();if(readError)throw readError
 if(ride.user_id!==userId)throw new Error('Only the rider can cancel this trip from the rider app.')
 if(['completed','cancelled'].includes(ride.status))throw new Error(`Trip cannot be cancelled from ${ride.status}.`)
 const now=new Date().toISOString();const {data,error}=await sb().from('holo_ride_requests').update({status:'cancelled',cancelled_at:now,cancelled_by:userId,cancel_reason:reason,cancel_details:details||null}).eq('id',rideId).eq('user_id',userId).select('*').single();if(error)throw error
 await sb().from('holo_notifications').insert([{user_id:userId,type:'ride_cancelled',title:'Ride cancelled',body:'Your trip was cancelled.',payload:{rideId,reason}},{...(ride.driver_id?{user_id:ride.driver_id,type:'ride_cancelled',title:'Ride cancelled',body:'The rider cancelled this trip.',payload:{rideId,reason}}:{})}].filter(x=>'user_id' in x))
 return data
}

export async function reportDriver(rideId:string,reason:DriverReportReason,details='',urgent=false){
 const reporterId=await uid();const {data:ride,error:readError}=await sb().from('holo_ride_requests').select('id,user_id,driver_id,status').eq('id',rideId).single();if(readError)throw readError
 if(ride.user_id!==reporterId)throw new Error('You can only report a driver from your own trip.')
 if(!ride.driver_id)throw new Error('No driver is assigned to this trip.')
 const severity=urgent||['impaired_driving','harassment','wrong_driver'].includes(reason)?'critical':'high'
 const {data,error}=await sb().from('holo_ride_safety_events').insert({ride_id:rideId,reporter_id:reporterId,subject_id:ride.driver_id,severity,event_type:'driver_report',payload:{reason,details,tripStatus:ride.status},status:'open'}).select('*').single();if(error)throw error
 await sb().from('holo_notifications').insert({user_id:reporterId,type:'safety_report_received',title:'Safety report received',body:'Your report has been recorded for review.',payload:{rideId,reportId:data.id,severity}})
 return {...data,emergencyGuidance:urgent?'If there is immediate danger, use the in-app emergency action or contact local emergency services.':null}
}

export async function publishTripLocation(rideId:string,location:{lat:number;lng:number;heading?:number;speedMps?:number;accuracyM?:number}){
 const actorId=await uid();const {data,error}=await sb().from('holo_ride_location_events').insert({ride_id:rideId,actor_id:actorId,lat:location.lat,lng:location.lng,heading:location.heading??null,speed_mps:location.speedMps??null,accuracy_m:location.accuracyM??null}).select('*').single();if(error)throw error;return data
}

export function subscribeToRide(rideId:string,onChange:(payload:unknown)=>void){
 const channel=sb().channel(`ride:${rideId}`).on('postgres_changes',{event:'*',schema:'public',table:'holo_ride_requests',filter:`id=eq.${rideId}`},onChange).on('postgres_changes',{event:'INSERT',schema:'public',table:'holo_ride_location_events',filter:`ride_id=eq.${rideId}`},onChange).subscribe()
 return ()=>{void sb().removeChannel(channel)}
}

export async function createSafetyEvent(rideId:string,eventType:'sos'|'share_trip'|'route_deviation'|'unsafe_behavior',payload:Record<string,unknown>={}){
 const reporterId=await uid();const severity=eventType==='sos'?'critical':'high';const {data,error}=await sb().from('holo_ride_safety_events').insert({ride_id:rideId,reporter_id:reporterId,severity,event_type:eventType,payload,status:'open'}).select('*').single();if(error)throw error;return data
}

export async function submitTripRating(rideId:string,subjectId:string,rating:number,comment=''){
 if(!Number.isInteger(rating)||rating<1||rating>5)throw new Error('Rating must be 1–5.')
 const authorId=await uid();const {data,error}=await sb().from('holo_ride_ratings').insert({ride_id:rideId,author_id:authorId,subject_id:subjectId,rating,comment}).select('*').single();if(error)throw error;return data
}

export async function getDriverEarnings(){const driverId=await uid();const {data,error}=await sb().from('holo_driver_earnings').select('*').eq('driver_id',driverId).order('created_at',{ascending:false}).limit(100);if(error)throw error;return data??[]}
export async function listNotifications(){const userId=await uid();const {data,error}=await sb().from('holo_notifications').select('*').eq('user_id',userId).order('created_at',{ascending:false}).limit(100);if(error)throw error;return data??[]}

export const productionProviderRequirements={maps:['GOOGLE_MAPS_API_KEY','Routes API','Places/Geocoding'],payments:['Stripe Connect platform','connected driver accounts','payment webhooks','payout webhooks'],verification:['identity/background-check provider','driving-record verification','insurance review'],operations:['dispatch worker','notification worker','safety escalation','support console']}
