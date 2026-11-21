/** Chicago one-session acceptance harness: deterministic simulation, not a browser/GLB certification. */
export type ChicagoStep='spawn'|'walked'|'entered'|'drove'|'exited'|'talked'|'completed'|'saved'|'reloaded'
export type ChicagoEvent={step:ChicagoStep;at:number;detail:string}
export type ChicagoState={step:ChicagoStep;inVehicle:boolean;missionComplete:boolean;credits:number;events:ChicagoEvent[]}
export const CHICAGO_ACCEPTANCE_STEPS:ChicagoStep[]=['spawn','walked','entered','drove','exited','talked','completed','saved','reloaded']
export function createChicagoAcceptanceSession(){
 let state:ChicagoState={step:'spawn',inVehicle:false,missionComplete:false,credits:0,events:[{step:'spawn',at:0,detail:'Chicago Circle Park spawn'}]}
 let saved:string|null=null
 const next=(step:ChicagoStep,detail:string)=>{
  const expected=CHICAGO_ACCEPTANCE_STEPS[CHICAGO_ACCEPTANCE_STEPS.indexOf(state.step)+1]
  if(step!==expected)throw new Error('Out-of-order Chicago mission action: expected '+expected)
  if(step==='entered')state.inVehicle=true
  if(step==='exited')state.inVehicle=false
  if(step==='completed'){if(state.inVehicle)throw new Error('Exit vehicle before mission handoff');state.missionComplete=true;state.credits+=100}
  state.step=step
  state.events.push({step,at:state.events.length,detail})
  return snapshot()
 }
 const snapshot=():ChicagoState=>JSON.parse(JSON.stringify(state)) as ChicagoState
 return {
  snapshot,
  walk:()=>next('walked','BJ reached parked vehicle'),
  enter:()=>next('entered','Driver seat occupied'),
  drive:()=>next('drove','Vehicle reached Chicago mission destination'),
  exit:()=>next('exited','Driver seat vacated'),
  talk:()=>next('talked','NPC mission dialogue acknowledged'),
  complete:()=>next('completed','Chicago delivery mission completed; 100 simulated credits'),
  save:()=>{const result=next('saved','Checkpoint serialized');saved=JSON.stringify({step:'saved',inVehicle:state.inVehicle,missionComplete:state.missionComplete,credits:state.credits,events:state.events});return {result,saveData:saved}},
  reload:(data?:string)=>{const source=data??saved;if(!source)throw new Error('No saved checkpoint');const parsed=JSON.parse(source) as ChicagoState;if(parsed.step!=='saved'||!parsed.missionComplete||parsed.inVehicle||parsed.credits!==100||!Array.isArray(parsed.events))throw new Error('Invalid checkpoint');state=JSON.parse(JSON.stringify(parsed)) as ChicagoState;return next('reloaded','Checkpoint restored without duplicate reward')},
  record:()=>({kind:'streetverse-chicago-acceptance-simulation',version:1,passed:state.step==='reloaded'&&state.credits===100,steps:CHICAGO_ACCEPTANCE_STEPS,events:snapshot().events,credits:state.credits,requiresDeviceVerification:true}),
 }
}
