/**
 * StreetVerse fictional transit display and airport transfer simulator.
 * Never presents simulated departures as current CTA/airport schedules.
 * Shared state for car infotainment, bus/train signs, and airport wayfinding.
 */
export type StreetVerseTransitMode='car'|'bus'|'el-train'|'plane'|'airport-walkway'
export type TransitDisplayPage='route'|'next-stop'|'accessibility'|'cabin'|'safety'
export type TransitStop={id:string;name:string}
export type TransitDisplayState={
 mode:StreetVerseTransitMode;page:TransitDisplayPage;routeId:string;stops:readonly TransitStop[];
 currentStopIndex:number;doorsOpen:boolean;moving:boolean;speedMps:number;
 occupancy:number;capacity:number;announcement:string;fictional:true
}
export const STREETVERSE_TRANSIT_PRESETS:Record<StreetVerseTransitMode,{routeId:string;stops:readonly TransitStop[];capacity:number}>={
 car:{routeId:'Circle Park → Taylor Street',stops:[{id:'circle-park',name:'Circle Park'},{id:'taylor-street',name:'Taylor Street'},{id:'medical-district',name:'Medical District'}],capacity:6},
 bus:{routeId:'StreetVerse Chicago Bus',stops:[{id:'ashland',name:'Ashland Avenue'},{id:'taylor',name:'Taylor Street'},{id:'loop',name:'The Loop'}],capacity:40},
 'el-train':{routeId:'StreetVerse Blue Line Pilot',stops:[{id:'ohare',name:'O’Hare station'},{id:'jefferson-park',name:'Jefferson Park'},{id:'clark-lake',name:'Clark/Lake'}],capacity:120},
 plane:{routeId:'StreetVerse Airline Simulator',stops:[{id:'gate',name:'Departure gate'},{id:'airborne',name:'In flight'},{id:'arrival',name:'Destination gate'}],capacity:180},
 'airport-walkway':{routeId:'Terminal Transfer Walkway',stops:[{id:'terminal',name:'Terminal entrance'},{id:'walkway',name:'Moving walkway'},{id:'gate',name:'Gate concourse'}],capacity:20}
}
const finite=(n:number)=>Number.isFinite(n)?Math.max(0,n):0
export function createTransitDisplay(mode:StreetVerseTransitMode='car'):TransitDisplayState{
 const p=STREETVERSE_TRANSIT_PRESETS[mode]
 return {mode,page:'route',routeId:p.routeId,stops:p.stops,currentStopIndex:0,doorsOpen:true,moving:false,speedMps:0,occupancy:0,capacity:p.capacity,announcement:'Fictional StreetVerse simulation',fictional:true}
}
export function updateTransitDisplay(
 state:TransitDisplayState,
 action:{type:'page';page:TransitDisplayPage}|{type:'board'|'exit'}|{type:'doors';open:boolean}|{type:'move';speedMps:number}|{type:'next-stop'}
):TransitDisplayState{
 switch(action.type){
 case 'page':return {...state,page:action.page}
 case 'board':return state.doorsOpen?{...state,occupancy:Math.min(state.capacity,state.occupancy+1)}:state
 case 'exit':return state.doorsOpen?{...state,occupancy:Math.max(0,state.occupancy-1)}:state
 case 'doors':return state.moving&&action.open?state:{...state,doorsOpen:action.open}
 case 'move':{
  const speed=finite(action.speedMps)
  // Doors may not remain open when this fictional vehicle departs.
  return {...state,moving:speed>0,speedMps:speed,doorsOpen:speed>0?false:state.doorsOpen}
 }
 case 'next-stop':{
  if(state.moving)return state
  const index=Math.min(state.stops.length-1,state.currentStopIndex+1)
  return {...state,currentStopIndex:index,announcement:'Arriving at '+state.stops[index].name}
 }
 }
}
export function transitDisplayText(state:TransitDisplayState){
 const next=state.stops[Math.min(state.currentStopIndex+1,state.stops.length-1)]
 return {title:state.routeId,current:state.stops[state.currentStopIndex].name,next:next.name,occupancy:state.occupancy+'/'+state.capacity,
  doors:state.doorsOpen?'DOORS OPEN':'DOORS CLOSED',motion:state.moving?'IN MOTION':'STOPPED',simulation:'FICTIONAL GAME INFORMATION • NOT REAL-TIME TRANSIT DATA'}
}
