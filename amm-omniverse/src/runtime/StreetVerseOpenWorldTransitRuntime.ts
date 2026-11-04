import {createTransportManifest,boardTransportParty,passengerCount,type TransportKind,type TransportPartyMember} from './StreetVersePassengerTransportRuntime'

/** Local game-world itinerary and group boarding. Not a real-world ticket or booking. */
export type StreetVerseTripMode='rideshare'|'car'|'bus'|'train'|'plane'
export type StreetVerseDestination='Chicago'|'Detroit'|'New York'|'Los Angeles'|'San Diego'|'Las Vegas'|'Atlanta'|'Miami'|'Lagos'|'Addis Ababa'
export type TransitItinerary={
  id:string
  mode:StreetVerseTripMode
  from:StreetVerseDestination
  to:StreetVerseDestination
  partySize:number
  boarded:number
  waiting:number
  seatCapacity:number
  status:'boarding-planned'|'invalid'
  transportId:string
  virtualOnly:true
}
export const STREETVERSE_DESTINATIONS:readonly StreetVerseDestination[]=['Chicago','Detroit','New York','Los Angeles','San Diego','Las Vegas','Atlanta','Miami','Lagos','Addis Ababa']
export const STREETVERSE_TRANSIT_MODES:readonly StreetVerseTripMode[]=['rideshare','car','bus','train','plane']
export const STREETVERSE_MODE_SEATS:Record<StreetVerseTripMode,number>={rideshare:5,car:5,bus:40,train:120,plane:180}
export function planOpenWorldTrip(input:{mode:StreetVerseTripMode;from:StreetVerseDestination;to:StreetVerseDestination;members:readonly TransportPartyMember[];tripId:string}):TransitItinerary{
  const {mode,from,to,members,tripId}=input
  if(!STREETVERSE_TRANSIT_MODES.includes(mode)||!STREETVERSE_DESTINATIONS.includes(from)||!STREETVERSE_DESTINATIONS.includes(to)||from===to||!tripId.trim()||!members.length||new Set(members.map(m=>m.actorId)).size!==members.length){
    return{id:tripId,mode,from,to,partySize:members.length,boarded:0,waiting:members.length,seatCapacity:0,status:'invalid',transportId:'',virtualOnly:true}
  }
  const passengers=STREETVERSE_MODE_SEATS[mode]
  // A car or ride share requires a real driver seat plus five passenger seats.
  // Buses, trains and planes reserve the operator seat and board passengers only.
  const manifest=createTransportManifest('travel:'+tripId,mode as TransportKind,passengers)
  const passengersOnly=members.map(member=>({...member,leader:false,preferredSeatId:undefined}))
  const result=boardTransportParty(manifest,passengersOnly)
  return{id:tripId,mode,from,to,partySize:members.length,boarded:result.boarded.length,waiting:result.waiting.length,seatCapacity:passengers,status:'boarding-planned',transportId:manifest.transportId,virtualOnly:true}
}
export function requestOpenWorldTrip(input:{mode:StreetVerseTripMode;from:StreetVerseDestination;to:StreetVerseDestination;partySize:number}){
  const size=Number.isInteger(input.partySize)?Math.max(1,Math.min(200,input.partySize)):1
  const id='trip-'+Date.now().toString(36)
  const members:Array<TransportPartyMember>=Array.from({length:size},(_,i)=>({actorId:i===0?'local-player':`party-member-${i+1}`,kind:i===0?'player':'ai-companion'}))
  const itinerary=planOpenWorldTrip({...input,members,tripId:id})
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('tryamm:streetverse-transit-itinerary',{detail:itinerary}))
  // Deliberately do not emit global-city-state: another service must actually load
  // the selected world and confirm the party arrived before marking completion.
  return itinerary
}
