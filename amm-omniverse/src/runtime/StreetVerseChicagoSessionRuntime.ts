/** One-session pilot route. Events are local gameplay signals, not proof of 3D mission completion. */
export type ChicagoStage='drive'|'delivery'|'restaurant'|'after-dark'|'next-mission'|'complete'
export type ChicagoEvent='vehicle-driven'|'package-delivered'|'food-purchased'|'after-dark-exited'|'next-mission-started'
export const CHICAGO_STAGES:ChicagoStage[]=['drive','delivery','restaurant','after-dark','next-mission','complete']
const transitions:Record<Exclude<ChicagoStage,'complete'>,{event:ChicagoEvent;next:ChicagoStage}>={
 drive:{event:'vehicle-driven',next:'delivery'},delivery:{event:'package-delivered',next:'restaurant'},
 restaurant:{event:'food-purchased',next:'after-dark'},'after-dark':{event:'after-dark-exited',next:'next-mission'},
 'next-mission':{event:'next-mission-started',next:'complete'}
}
export function advanceChicagoSession(stage:ChicagoStage,event:ChicagoEvent):{stage:ChicagoStage;advanced:boolean}{
 if(stage==='complete'||transitions[stage].event!==event)return {stage,advanced:false}
 return {stage:transitions[stage].next,advanced:true}
}
export function createChicagoSession(initial:ChicagoStage='drive'){
 let stage=initial
 return {current:()=>stage,signal:(event:ChicagoEvent)=>{const result=advanceChicagoSession(stage,event);stage=result.stage;return result},reset:()=>{stage='drive'}}
}
