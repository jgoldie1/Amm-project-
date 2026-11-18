/** StreetVerse mobile parkour — deterministic and non-teleporting.
 * Vertical-only jumps, short hops and crouched landings. A full vault requires
 * a measured low obstacle and a validated landing collider before enabling.
 */
export type ParkourAction='jump'|'hop'|'vault'
export type ParkourState={height:number;velocity:number;grounded:boolean;cooldown:number;lastAction:ParkourAction|null;landings:number}
export const initialParkourState=():ParkourState=>({height:0,velocity:0,grounded:true,cooldown:0,lastAction:null,landings:0})
const limit=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:0))
export function startParkour(state:ParkourState,action:ParkourAction,options:{inVehicle:boolean;underwater:boolean;lowObstacleVerified?:boolean;clearLandingVerified?:boolean}){
 if(options.inVehicle||options.underwater)return {state,ok:false,message:'Exit the vehicle or water before jumping.'}
 if(!state.grounded||state.cooldown>0)return {state,ok:false,message:'Land before starting another parkour move.'}
 if(action==='vault'&&!(options.lowObstacleVerified&&options.clearLandingVerified))return {state,ok:false,message:'Vault blocked: no validated waist-high obstacle and safe landing nearby. Try JUMP or HOP.'}
 const impulse=action==='hop'?3.6:action==='vault'?4.4:6
 return {ok:true,message:action.toUpperCase()+' started',state:{...state,velocity:impulse,grounded:false,cooldown:action==='hop'?.28:.4,lastAction:action}}
}
export function stepParkour(state:ParkourState,seconds:number):ParkourState{
 const dt=limit(seconds,0,1/20),cooldown=Math.max(0,state.cooldown-dt)
 if(state.grounded)return {...state,height:0,velocity:0,cooldown}
 const v=state.velocity-17.5*dt,h=Math.max(0,state.height+v*dt)
 if(h<=0&&v<=0)return {...state,height:0,velocity:0,grounded:true,cooldown,landings:state.landings+1}
 return {...state,height:h,velocity:v,grounded:false,cooldown}
}
