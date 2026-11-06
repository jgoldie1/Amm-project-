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

/** Local save is versioned and accepts only known stages. */
export const CHICAGO_SESSION_SAVE_KEY='tryamm.streetverse.chicago-session.v1'
export function parseChicagoSessionSave(raw:string|null):ChicagoStage{
 if(!raw)return 'drive'
 try{const value=JSON.parse(raw) as {version?:number;stage?:string};return value.version===1&&CHICAGO_STAGES.includes(value.stage as ChicagoStage)?value.stage as ChicagoStage:'drive'}catch{return 'drive'}
}
export function serializeChicagoSessionSave(stage:ChicagoStage):string{return JSON.stringify({version:1,stage})}
/** Only trusted world signals qualify; entering a car is not the same as driving. */
export function verifiedChicagoWorldEvent(type:string,detail:Record<string,unknown>|null):ChicagoEvent|null{
 if(!detail)return null
 if(type==='tryamm:streetverse-vehicle-distance'&&typeof detail.meters==='number'&&detail.meters>=20)return 'vehicle-driven'
 if(type==='tryamm:streetverse-uic-package-delivered'&&detail.delivered===true&&detail.packageId)return 'package-delivered'
 if(type==='tryamm:streetverse-next-mission-started'&&detail.started===true&&detail.missionId)return 'next-mission-started'
 return null
}
