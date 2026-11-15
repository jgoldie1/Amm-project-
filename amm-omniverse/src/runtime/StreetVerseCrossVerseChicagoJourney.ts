import {createCrossVerseTravelDirector} from './StreetVerseCrossVerseTravelDirector'
import {createChicagoTimeSwitch,type ChicagoEra} from './StreetVerseChicagoTimeSwitchRuntime'

/** Coordinates existing systems without pretending a 3D scene was loaded. */
export type TravelerSnapshot={x:number;y:number;z:number;missionId:string;credits:number}
export function createCrossVerseChicagoJourney(){
 const director=createCrossVerseTravelDirector('streetverse:chicago')
 const chicago=createChicagoTimeSwitch()
 const snapshots=new Map<string,TravelerSnapshot>()
 let pending:null|{from:string;to:string;era:ChicagoEra;snapshot:TravelerSnapshot}=null
 let current='streetverse:chicago'
 const copy=(s:TravelerSnapshot)=>({...s})
 const validate=(s:TravelerSnapshot)=>{
  if(![s.x,s.y,s.z,s.credits].every(Number.isFinite)||s.credits<0||!s.missionId)throw new Error('Invalid traveler snapshot')
 }
 return {
  current:()=>current,
  pending:()=>pending?{...pending,snapshot:copy(pending.snapshot)}:null,
  preview:(era:ChicagoEra)=>chicago.scan().find(s=>s.era===era),
  prepare:(era:ChicagoEra,snapshot:TravelerSnapshot)=>{
   if(pending)throw new Error('Scene transition already pending')
   validate(snapshot)
   const to=era==='present'?'streetverse:chicago':'chicago:'+era
   pending={from:current,to,era,snapshot:copy(snapshot)}
   return {...pending,snapshot:copy(snapshot)}
  },
  confirmSceneLoaded:(to:string)=>{
   if(!pending||pending.to!==to)throw new Error('Scene load was not confirmed for pending destination')
   snapshots.set(pending.from,copy(pending.snapshot))
   if(pending.era!=='present'){
    const portalId='chicago-era-'+pending.era
    if(!director.timelines().some(b=>b.id===pending!.to)){
     director.registerPortal({id:portalId,from:'streetverse',to:'chronoverse',destination:pending.to,timelineKind:'chronoverse',requiresConsent:false,enabled:true})
     director.enter({portalId,playerId:'bj-stubbs',consented:true,at:Date.now()})
    }else director.returnTo(pending.to)
   }else director.returnTo('streetverse:chicago')
   chicago.switchTo(pending.era)
   current=to
   pending=null
   return {timelineId:current,restore:snapshots.has(current)?copy(snapshots.get(current)!):null,scene:chicago.scene()}
  },
  cancel:()=>{pending=null},
  saved:(timelineId:string)=>snapshots.has(timelineId)?copy(snapshots.get(timelineId)!):null,
  remember:(npcId:string,message:string)=>chicago.remember(npcId,message),
  recall:(npcId:string)=>chicago.recall(npcId),
 }
}
