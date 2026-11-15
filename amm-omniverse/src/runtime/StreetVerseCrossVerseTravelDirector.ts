import {createMyceliumTimeline,type VerseEvent} from './StreetVerseMyceliumTimelineRuntime'
import {createCrossVerseGateway,type CrossVersePortal} from './StreetVerseCrossVerseGatewayRuntime'

/** In-memory playable CrossVerse travel coordinator. Persistence and rendering are separate. */
export function createCrossVerseTravelDirector(rootId='streetverse:chicago'){
 const timeline=createMyceliumTimeline(rootId)
 const gateway=createCrossVerseGateway()
 const receipts=new Map<string,{playerId:string;from:string;to:string;portalId:string;at:number}>()
 return {
  registerPortal:(portal:CrossVersePortal)=>gateway.register(portal),
  activeTimeline:()=>timeline.active(),
  timelineHistory:()=>timeline.history(),
  timelines:()=>timeline.branches(),
  receipts:()=>Array.from(receipts.values()).map(r=>({...r})),
  recordEvent:(event:VerseEvent)=>timeline.record(event),
  enter:(args:{portalId:string;playerId:string;consented:boolean;at:number;forkId?:string})=>{
   const key=[args.playerId,args.portalId,args.at].join(':')
   const previous=receipts.get(key)
   if(previous)return {...previous}
   const from=timeline.active()
   const portal=gateway.enter(args)
   const to=args.forkId??portal.destination
   if(!timeline.branches().some(b=>b.id===to))timeline.fork(to,portal.timelineKind,args.at,from)
   timeline.travel(to)
   const receipt={playerId:args.playerId,from,to,portalId:args.portalId,at:args.at}
   receipts.set(key,receipt)
   return {...receipt}
  },
  returnTo:(id:string)=>timeline.travel(id),
 }
}
