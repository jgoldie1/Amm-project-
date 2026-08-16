export type RaceSurface='street'|'circuit'|'wilderness'|'offroad'|'holo'
export type RaceMode='circuit'|'sprint'|'elimination'|'time-trial'|'battle-race'|'holo-vr'
export type Gadget='quantum_boost'|'jump_jets'|'grip_claws'|'shield'|'repair_drone'|'scan_drone'|'smoke_screen'|'emp_pulse'|'terrain_mode'|'holo_decoy'

export type RacerCar={
  id:string
  name:string
  topSpeed:number
  acceleration:number
  handling:number
  armor:number
  energy:number
  health:number
  gadgets:Gadget[]
  electric:boolean
  flyingPrototype:boolean
}

export type RaceState={
  mode:RaceMode
  surface:RaceSurface
  lap:number
  totalLaps:number
  position:number
  racers:number
  speed:number
  distance:number
  damage:number
  boost:number
  weather:'clear'|'rain'|'storm'|'night'
  car:RacerCar
  gadgetCooldowns:Partial<Record<Gadget,number>>
}

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n))

export function createVolcanoCar():RacerCar{
  return {
    id:'volcano-v1', name:'Volcano VX', topSpeed:228, acceleration:86, handling:82, armor:76,
    energy:100, health:100, electric:true, flyingPrototype:false,
    gadgets:['quantum_boost','jump_jets','grip_claws','shield','repair_drone','scan_drone','terrain_mode','holo_decoy']
  }
}

export function createRace(mode:RaceMode='circuit', surface:RaceSurface='street'):RaceState{
  return {mode,surface,lap:1,totalLaps:mode==='circuit'?3:1,position:8,racers:12,speed:0,distance:0,damage:0,boost:100,weather:'clear',car:createVolcanoCar(),gadgetCooldowns:{}}
}

export function tickRace(state:RaceState,input:{throttle:number;brake:number;steer:number;dt:number}):RaceState{
  const n=structuredClone(state) as RaceState
  const grip=n.weather==='rain'?.82:n.weather==='storm'?.72:1
  const target=clamp(input.throttle,0,1)*n.car.topSpeed
  n.speed=clamp(n.speed+(target-n.speed)*Math.min(1,input.dt*(n.car.acceleration/42))-Math.max(0,input.brake)*95*input.dt,0,n.car.topSpeed)
  n.distance+=n.speed*(1000/3600)*input.dt
  if(Math.abs(input.steer)>.85 && n.speed>170 && Math.random()>.78*grip){ n.damage=clamp(n.damage+2,0,100); n.car.health=clamp(n.car.health-2,0,100) }
  for(const k of Object.keys(n.gadgetCooldowns) as Gadget[]) n.gadgetCooldowns[k]=Math.max(0,(n.gadgetCooldowns[k]||0)-input.dt)
  return n
}

export function useGadget(state:RaceState,gadget:Gadget):RaceState{
  const n=structuredClone(state) as RaceState
  if(!n.car.gadgets.includes(gadget) || (n.gadgetCooldowns[gadget]||0)>0) return n
  if(gadget==='quantum_boost' && n.boost>=20){ n.speed=clamp(n.speed+55,0,n.car.topSpeed+35); n.boost-=20; n.gadgetCooldowns[gadget]=3 }
  if(gadget==='jump_jets'){ n.gadgetCooldowns[gadget]=6 }
  if(gadget==='grip_claws'){ n.gadgetCooldowns[gadget]=8 }
  if(gadget==='shield'){ n.car.energy=clamp(n.car.energy-15,0,100); n.gadgetCooldowns[gadget]=10 }
  if(gadget==='repair_drone'){ n.car.health=clamp(n.car.health+18,0,100); n.damage=clamp(n.damage-18,0,100); n.gadgetCooldowns[gadget]=20 }
  if(gadget==='scan_drone'){ n.gadgetCooldowns[gadget]=12 }
  if(gadget==='smoke_screen'||gadget==='emp_pulse'||gadget==='holo_decoy'){ n.gadgetCooldowns[gadget]=12 }
  if(gadget==='terrain_mode'){ n.gadgetCooldowns[gadget]=5 }
  return n
}

export const volcanoRacersFeatures={
  engines:['unreal','unity','godot','web-holo'],
  modes:['circuit','sprint','elimination','time-trial','battle-race','holo-vr'],
  presentation:['broadcast-replay','cockpit-camera','hood-camera','drone-camera','cinematic-finish','holographic-hud'],
  systems:['vehicle-physics','damage-lods','weather','day-night','controller-rumble','vr-driving','ar-holo-overlay','quantum-lag-buster','quantum-beat-sync'],
  progression:['driver-career','garage','vehicle-upgrades','original-team-leagues','online-ranked','ghost-replays'],
  accessibility:['one-hand-control','assist-steering','auto-accelerate','high-contrast','reduced-motion','captioned-audio-cues']
}
