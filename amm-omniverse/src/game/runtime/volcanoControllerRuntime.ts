import {chooseQuantumSpeedMode,quantumLagActions,type QuantumLagSignal,type QuantumSpeedSample} from './quantumSpeedEngine'

export type VolcanoControllerProfile='standard-gamepad'|'xbox-style'|'playstation-style'|'switch-style'|'generic'|'touch'|'keyboard'|'adaptive'
export type VolcanoInputAction='move-x'|'move-y'|'look-x'|'look-y'|'jump'|'interact'|'accelerate'|'brake'|'menu'|'primary'|'secondary'|'pause'

export type VolcanoControllerState={
 id:string;index:number;connected:boolean;mapping:string;profile:VolcanoControllerProfile
 buttons:number[];axes:number[];timestamp:number
}

export type VolcanoRuntimeTuning={
 speedMode:ReturnType<typeof chooseQuantumSpeedMode>
 lagActions:ReturnType<typeof quantumLagActions>
 inputPollHz:number
 deadzone:number
}

export function detectVolcanoProfile(id:string,mapping:string):VolcanoControllerProfile{
 const key=id.toLowerCase()
 if(mapping==='standard')return'standard-gamepad'
 if(key.includes('xbox')||key.includes('xinput'))return'xbox-style'
 if(key.includes('dualshock')||key.includes('dualsense')||key.includes('playstation'))return'playstation-style'
 if(key.includes('switch')||key.includes('joy-con')||key.includes('nintendo'))return'switch-style'
 return'generic'
}

export function tuneVolcanoRuntime(speed:QuantumSpeedSample,lag:QuantumLagSignal):VolcanoRuntimeTuning{
 const speedMode=chooseQuantumSpeedMode(speed)
 const lagActions=quantumLagActions(lag)
 const pressured=lagActions.some(x=>x!=='none')
 return {speedMode,lagActions,inputPollHz:pressured?60:120,deadzone:0.12}
}

export function normalizeVolcanoAxis(value:number,deadzone=.12){
 const v=Math.max(-1,Math.min(1,value))
 if(Math.abs(v)<=deadzone)return 0
 return Math.sign(v)*(Math.abs(v)-deadzone)/(1-deadzone)
}

export function readVolcanoControllers():VolcanoControllerState[]{
 if(typeof navigator==='undefined'||typeof navigator.getGamepads!=='function')return[]
 return Array.from(navigator.getGamepads()).filter((g):g is Gamepad=>!!g).map(g=>({
  id:g.id,index:g.index,connected:g.connected,mapping:g.mapping,
  profile:detectVolcanoProfile(g.id,g.mapping),
  buttons:g.buttons.map(b=>b.value),axes:Array.from(g.axes),timestamp:g.timestamp,
 }))
}
