export type BJRescueStage='idle'|'requested'|'dispatched'|'arrived'|'treatment'|'recovered'
export interface BJRescueState {stage:BJRescueStage;startedAt:number;updatedAt:number}
export function createBJRescueMission(){
 let state:BJRescueState={stage:'idle',startedAt:0,updatedAt:0}
 const advance=(stage:BJRescueStage,now:number)=>{state={...state,stage,updatedAt:now};return {...state}}
 return {
  getState:()=>({...state}),
  request:(now:number)=>{if(state.stage!=='idle'&&state.stage!=='recovered')return {...state};state={stage:'requested',startedAt:now,updatedAt:now};return {...state}},
  dispatch:(now:number)=>state.stage==='requested'?advance('dispatched',now):{...state},
  arrive:(now:number)=>state.stage==='dispatched'?advance('arrived',now):{...state},
  treat:(now:number)=>state.stage==='arrived'?advance('treatment',now):{...state},
  recover:(now:number)=>state.stage==='treatment'?advance('recovered',now):{...state},
  reset:()=>{state={stage:'idle',startedAt:0,updatedAt:0};return {...state}},
 }
}
