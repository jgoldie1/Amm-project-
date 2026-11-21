/** Deterministic bounded flight controller for the LaTeasia NPC preview. */
export type FlightInput='rise'|'descend'|'forward'|'back'|'left'|'right'|'hover'|'land'
export type FlightState={x:number;y:number;z:number;active:boolean;energy:number}
export const FLIGHT_MAX_ALTITUDE=12
export const FLIGHT_MAX_RADIUS=18
export const FLIGHT_SPEED=3
export const FLIGHT_ENERGY_SECONDS=45
export const FLIGHT_EVENT='tryamm:streetverse-lateasia-flight-command'
export const FLIGHT_STATUS_EVENT='tryamm:streetverse-lateasia-flight-status'
export const initialFlightState=():FlightState=>({x:0,y:0,z:0,active:false,energy:FLIGHT_ENERGY_SECONDS})
export function stepLaTeasiaFlight(state:FlightState,input:FlightInput,dt:number):FlightState{
 const seconds=Math.max(0,Math.min(dt,.1))
 if(input==='land')return {...state,y:0,active:false}
 if(!state.active||state.energy<=0)return state
 const step=FLIGHT_SPEED*seconds
 let {x,y,z}=state
 if(input==='rise')y=Math.min(FLIGHT_MAX_ALTITUDE,y+step)
 if(input==='descend')y=Math.max(.5,y-step)
 if(input==='forward')z-=step
 if(input==='back')z+=step
 if(input==='left')x-=step
 if(input==='right')x+=step
 const radius=Math.hypot(x,z)
 if(radius>FLIGHT_MAX_RADIUS){x=x/radius*FLIGHT_MAX_RADIUS;z=z/radius*FLIGHT_MAX_RADIUS}
 const energy=Math.max(0,state.energy-seconds)
 return {x,y:energy===0?0:y,z,active:energy>0,energy}
}
export function startLaTeasiaFlight(state:FlightState):FlightState{
 if(state.energy<=0)return state
 return {...state,active:true,y:Math.max(.6,state.y)}
}
export function rechargeLaTeasiaFlight(state:FlightState):FlightState{
 return {...state,energy:FLIGHT_ENERGY_SECONDS}
}
