/**
 * StreetVerse Open World Kernel (original TRYAMM implementation).
 * Fixed-step, deterministic simulation contracts inspired by common open-world
 * engine architecture; NOT Rockstar RAGE code, a GTA decompilation, or a
 * replacement for the actual Three.js/Rapier render and physics engines.
 */
export type KernelMode='on-foot'|'driving'|'parked';
export type KernelInput=Readonly<{throttle:number;brake:number;steer:number;enter:boolean;exit:boolean}>;
export type KernelState=Readonly<{
 tick:number; timeSeconds:number; mode:KernelMode; speedMps:number;
 headingRad:number; x:number; z:number; distanceMeters:number;
 mission:'ready'|'in-progress'|'complete'; missionRewards:number;
}>;
export type KernelEvent=Readonly<{id:string;type:'entered-vehicle'|'left-vehicle'|'mission-start'|'mission-finish';tick:number}>;

export const STREETVERSE_KERNEL_DT=1/60;
export const STREETVERSE_KERNEL_MAX_SPEED=22;
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:0));
const copy=(s:KernelState):KernelState=>({...s});
export function createStreetVerseWorldKernel(){
 let state:KernelState={tick:0,timeSeconds:0,mode:'on-foot',speedMps:0,headingRad:0,x:0,z:0,distanceMeters:0,mission:'ready',missionRewards:0};
 const events:KernelEvent[]=[];
 const eventIds=new Set<string>();
 const emit=(type:KernelEvent['type'])=>{const id=`kernel:${state.tick}:${type}`;if(eventIds.has(id))return;eventIds.add(id);events.push({id,type,tick:state.tick})};
 return {
  snapshot:()=>copy(state),
  eventHistory:()=>events.map(e=>({...e})),
  /** One 60Hz physics *contract* step, not a Rapier rigid-body calculation. */
  step(raw:Partial<KernelInput>={}):KernelState{
   const input={throttle:clamp(raw.throttle??0,0,1),brake:clamp(raw.brake??0,0,1),steer:clamp(raw.steer??0,-1,1),enter:raw.enter===true,exit:raw.exit===true};
   state={...state,tick:state.tick+1,timeSeconds:(state.tick+1)*STREETVERSE_KERNEL_DT};
   if(input.enter&&state.mode==='on-foot'){state={...state,mode:'parked',speedMps:0};emit('entered-vehicle')}
   if(input.exit&&state.mode!=='on-foot'&&state.speedMps<.35){state={...state,mode:'on-foot',speedMps:0};emit('left-vehicle')}
   if(state.mode==='on-foot')return copy(state);
   const drag=.35,accel=4.5,braking=8;
   let speed=clamp(state.speedMps+(input.throttle*accel-input.brake*braking-drag)*STREETVERSE_KERNEL_DT,0,STREETVERSE_KERNEL_MAX_SPEED);
   if(speed<.1)speed=0;
   const heading=state.headingRad+input.steer*Math.min(1,speed/8)*1.1*STREETVERSE_KERNEL_DT;
   const dx=Math.sin(heading)*speed*STREETVERSE_KERNEL_DT,dz=Math.cos(heading)*speed*STREETVERSE_KERNEL_DT;
   state={...state,speedMps:speed,mode:speed>0?'driving':'parked',headingRad:heading,x:state.x+dx,z:state.z+dz,distanceMeters:state.distanceMeters+Math.hypot(dx,dz)};
   return copy(state);
  },
  startMission:():boolean=>{
   if(state.mission!=='ready')return false;
   state={...state,mission:'in-progress'};emit('mission-start');return true;
  },
  finishMission:():boolean=>{
   if(state.mission!=='in-progress'||state.mode!=='on-foot')return false;
   state={...state,mission:'complete',missionRewards:state.missionRewards+1};emit('mission-finish');return true;
  },
 };
}
