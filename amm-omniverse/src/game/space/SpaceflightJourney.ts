export type FlightStage='streetverse'|'spaceport'|'boarding'|'cockpit'|'launch'|'orbit'|'moon'|'mars'|'starverse'|'holoverse'

export const FLIGHT_STAGES: {id:FlightStage;title:string;objective:string;worldMemory:string}[]=[
 {id:'streetverse',title:'StreetVerse Departure',objective:'Carry the same claimed character and biography to the spaceport.','worldMemory':'departure intent + current life chapter'},
 {id:'spaceport',title:'Chicago Spaceport',objective:'Complete crew, accessibility and mission checks before boarding.','worldMemory':'crew assignment + launch readiness'},
 {id:'boarding',title:'Board the Ship',objective:'Enter the ship with the same inventory, reputation and mission state.','worldMemory':'ship manifest + crew relationships'},
 {id:'cockpit',title:'Cockpit Training',objective:'Learn thrust, pitch, yaw, roll and emergency-safe controls.','worldMemory':'flight skill + control preferences'},
 {id:'launch',title:'Atmospheric Launch',objective:'Climb through the atmosphere without exceeding simulated safety limits.','worldMemory':'first launch result + crew trust'},
 {id:'orbit',title:'Earth Orbit',objective:'Stabilize orbit and choose the next destination.','worldMemory':'orbital checkpoint'},
 {id:'moon',title:'Moon Mission',objective:'Complete a rights-safe science/exploration mission and return to orbit.','worldMemory':'lunar discoveries + mission choices'},
 {id:'mars',title:'Mars Mission',objective:'Land, complete a surface mission, and preserve a return checkpoint.','worldMemory':'Mars landing + discoveries + crew outcome'},
 {id:'starverse',title:'StarVerse Transit',objective:'Use creator/music reputation to unlock a performance or broadcast mission.','worldMemory':'StarVerse reputation + broadcast memory'},
 {id:'holoverse',title:'Holoverse Gateway',objective:'Enter the Holoverse without creating a second avatar or losing state.','worldMemory':'cross-world checkpoint + portable state proof'},
]

export type FlightState={stageIndex:number;thrust:number;pitch:number;yaw:number;roll:number;fuel:number;hull:number;crewReady:boolean;updatedAt:string}
export const INITIAL_FLIGHT_STATE:FlightState={stageIndex:0,thrust:0,pitch:0,yaw:0,roll:0,fuel:100,hull:100,crewReady:false,updatedAt:new Date(0).toISOString()}

export function clampFlightState(state:FlightState):FlightState{
 const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))
 return {...state,stageIndex:clamp(Math.round(state.stageIndex),0,FLIGHT_STAGES.length-1),thrust:clamp(state.thrust,0,100),pitch:clamp(state.pitch,-45,45),yaw:clamp(state.yaw,-90,90),roll:clamp(state.roll,-90,90),fuel:clamp(state.fuel,0,100),hull:clamp(state.hull,0,100),updatedAt:new Date().toISOString()}
}

export function advanceFlight(state:FlightState):FlightState{
 if(!state.crewReady&&state.stageIndex>=1)return state
 const fuelCost=state.stageIndex>=3?4:1
 return clampFlightState({...state,stageIndex:Math.min(state.stageIndex+1,FLIGHT_STAGES.length-1),fuel:state.fuel-fuelCost})
}

export const SPACEFLIGHT_PORTABLE_STATE=['user id','claimed character id','avatar appearance','XP + level','inventory','reputation','accessibility profile','mission runs','World Memory','creator works','eligible economy state'] as const
export const SPACEFLIGHT_RELEASE_GATES=['same character before/after transit','checkpoint survives reload','signed-in checkpoint survives second device','crew membership is server-authoritative','no client-authored rewards','Holoverse entry reuses portable state','mobile one-handed controls','reduced-motion launch mode'] as const
