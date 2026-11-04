/**
 * Fictional airport moving-walkway controller, measured in meters and seconds.
 * This is deterministic gameplay logic, not a real airport equipment controller.
 */
export type WalkwayState={
 id:string;lengthM:number;widthM:number;speedMps:number;direction:1|-1;
 enabled:boolean;emergencyStopped:boolean;
 riders:Record<string,{distanceM:number;walkingSpeedMps:number}>;
 accessibleAlternateAvailable:true;simulationOnly:true
}
export const WALKWAY_MAX_SPEED_MPS=.7
const bounded=(x:number,min:number,max:number)=>Number.isFinite(x)?Math.max(min,Math.min(max,x)):min
export function createAirportWalkway(id:string,lengthM=24):WalkwayState{
 return {id,lengthM:bounded(lengthM,4,200),widthM:1.5,speedMps:.5,direction:1,enabled:false,emergencyStopped:false,riders:{},accessibleAlternateAvailable:true,simulationOnly:true}
}
export function setWalkwayRunning(s:WalkwayState,enabled:boolean):WalkwayState{
 if(s.emergencyStopped&&enabled)return s
 return {...s,enabled}
}
export function setWalkwayDirection(s:WalkwayState,direction:1|-1):WalkwayState{
 if(s.enabled||Object.keys(s.riders).length>0)return s
 return {...s,direction}
}
export function boardWalkway(s:WalkwayState,riderId:string):WalkwayState{
 if(!riderId||riderId.length>80||s.emergencyStopped||s.riders[riderId])return s
 const position=s.direction===1?0:s.lengthM
 return {...s,riders:{...s.riders,[riderId]:{distanceM:position,walkingSpeedMps:0}}}
}
export function leaveWalkway(s:WalkwayState,riderId:string):WalkwayState{
 if(!s.riders[riderId])return s
 const riders={...s.riders};delete riders[riderId]
 return {...s,riders}
}
export function emergencyStopWalkway(s:WalkwayState):WalkwayState{
 return {...s,enabled:false,emergencyStopped:true}
}
export function resetWalkway(s:WalkwayState):WalkwayState{
 if(Object.keys(s.riders).length>0)return s
 return {...s,emergencyStopped:false,enabled:false}
}
export function tickAirportWalkway(s:WalkwayState,deltaSeconds:number):WalkwayState{
 if(!Number.isFinite(deltaSeconds)||deltaSeconds<=0)return s
 const dt=bounded(deltaSeconds,0,.1)
 const riders:WalkwayState['riders']={}
 for(const [id,rider] of Object.entries(s.riders)){
  const belt=s.enabled&&!s.emergencyStopped?s.speedMps*s.direction:0
  const velocity=belt+bounded(rider.walkingSpeedMps,-1,1)
  const distance=bounded(rider.distanceM+velocity*dt,0,s.lengthM)
  if((s.direction===1&&distance>=s.lengthM)||(s.direction===-1&&distance<=0))continue
  riders[id]={...rider,distanceM:distance}
 }
 return {...s,riders}
}
