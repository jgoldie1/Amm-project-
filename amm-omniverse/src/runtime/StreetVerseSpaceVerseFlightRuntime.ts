/** SpaceVerse foundational navigation and life-support simulation (fictional game state). */
export type SpaceDestination='earth'|'orbit'|'moon'|'mars'
export type SpaceFlightPhase='landed'|'launching'|'transit'|'approach'|'docked'
export type SpaceEnvironment={gravityG:number;breathable:boolean;pressureKPa:number}
export const SPACE_ENVIRONMENTS:Record<SpaceDestination,SpaceEnvironment>={
 earth:{gravityG:1,breathable:true,pressureKPa:101.325},
 orbit:{gravityG:0,breathable:false,pressureKPa:0},
 moon:{gravityG:0.165,breathable:false,pressureKPa:0},
 mars:{gravityG:0.38,breathable:false,pressureKPa:0.6},
}
export type SpaceFlightState={
 destination:SpaceDestination;origin:SpaceDestination;phase:SpaceFlightPhase;
 oxygenPercent:number;fuelPercent:number;suited:boolean;insidePressurizedCabin:boolean
}
export function createSpaceVerseFlight(){
 let state:SpaceFlightState={destination:'earth',origin:'earth',phase:'landed',oxygenPercent:100,fuelPercent:100,suited:false,insidePressurizedCabin:true}
 const read=()=>({...state})
 return {
  state:read,
  equipSuit:(suited:boolean)=>{state={...state,suited};return read()},
  setCabin:(pressurized:boolean)=>{state={...state,insidePressurizedCabin:pressurized};return read()},
  launch:(destination:SpaceDestination)=>{
   if(state.phase!=='landed'&&state.phase!=='docked')throw new Error('Ship not ready')
   if(destination===state.destination)throw new Error('Already at destination')
   if(state.fuelPercent<20)throw new Error('Insufficient fuel')
   if(state.oxygenPercent<=0)throw new Error('No life support')
   state={...state,origin:state.destination,destination,phase:'launching',fuelPercent:state.fuelPercent-20}
   return read()
  },
  advance:()=>{
   const phases:Record<SpaceFlightPhase,SpaceFlightPhase>={landed:'landed',launching:'transit',transit:'approach',approach:'docked',docked:'docked'}
   state={...state,phase:phases[state.phase]}
   return read()
  },
  canExit:()=>{
   const environment=SPACE_ENVIRONMENTS[state.destination]
   return (state.phase==='docked'||state.phase==='landed')&&(environment.breathable||state.suited)
  },
  tick:(minutes:number)=>{
   if(!Number.isFinite(minutes)||minutes<0||minutes>60)throw new Error('Invalid simulation interval')
   const environment=SPACE_ENVIRONMENTS[state.destination]
   const exposed=state.phase==='docked'&&!state.insidePressurizedCabin&&!environment.breathable&&!state.suited
   const use=minutes*(exposed?10:0.05)
   state={...state,oxygenPercent:Math.max(0,state.oxygenPercent-use)}
   return read()
  },
  refuel:()=>{if(state.phase!=='docked'&&state.phase!=='landed')throw new Error('Must be docked');state={...state,fuelPercent:100,oxygenPercent:100};return read()},
 }
}
