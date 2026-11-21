/** CrossVerse portal registry: fictional travel and explicit interoperability permissions. */
import type {VerseKind} from './StreetVerseMyceliumTimelineRuntime'
export type CrossVerseWorld='streetverse'|'campusverse'|'faithverse'|'chronoverse'|'beautyverse'|'businessverse'|'external'
export type CrossVersePortal={
 id:string;from:CrossVerseWorld;to:CrossVerseWorld;destination:string;
 timelineKind:VerseKind;requiresConsent:boolean;enabled:boolean
}
export type CrossVerseTravel={portalId:string;playerId:string;consented:boolean;at:number}
export function createCrossVerseGateway(){
 const portals=new Map<string,CrossVersePortal>()
 const travelLog:CrossVerseTravel[]=[]
 return {
  register:(portal:CrossVersePortal)=>{
   if(!portal.id||!portal.destination||portals.has(portal.id))throw new Error('Invalid or duplicate CrossVerse portal')
   if(portal.to==='external'&&!portal.requiresConsent)throw new Error('External worlds require consent')
   portals.set(portal.id,{...portal})
  },
  list:()=>Array.from(portals.values()).map(p=>({...p})),
  enter:(request:CrossVerseTravel)=>{
   const portal=portals.get(request.portalId)
   if(!portal||!portal.enabled)throw new Error('Portal unavailable')
   if(!request.playerId||!Number.isFinite(request.at))throw new Error('Invalid traveler')
   if(portal.requiresConsent&&!request.consented)throw new Error('Player consent required')
   if(travelLog.some(t=>t.portalId===request.portalId&&t.playerId===request.playerId&&t.at===request.at))return {...portal}
   travelLog.push({...request})
   return {...portal}
  },
  journeys:()=>travelLog.map(t=>({...t})),
 }
}
