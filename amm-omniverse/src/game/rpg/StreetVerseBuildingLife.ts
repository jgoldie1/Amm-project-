export type UtilityKind='plumbing'|'electrical'|'gas';
export type BuildingSystemEvent={id:string;buildingId:string;kind:'stairs'|'elevator'|'utility';floorFrom:number;floorTo:number;utility?:UtilityKind;action?:'inspect'|'repair';authorized:boolean};
export type BuildingState={id:string;floor:number;maxFloor:number;utilityHealth:Record<UtilityKind,number>;completedEventIds:string[]};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,Math.round(Number.isFinite(n)?n:lo)));
export function createBuildingState(id:string,maxFloor=3):BuildingState{return{id,floor:0,maxFloor:clamp(maxFloor,1,100),utilityHealth:{plumbing:50,electrical:50,gas:50},completedEventIds:[]}}
export function applyBuildingEvent(s:BuildingState,e:BuildingSystemEvent):BuildingState{
 if(!e.authorized||e.buildingId!==s.id||!e.id||s.completedEventIds.includes(e.id)||e.floorFrom!==s.floor)return s;
 if(e.kind==='stairs'&&Math.abs(e.floorTo-s.floor)!==1)return s;
 if((e.kind==='stairs'||e.kind==='elevator')&&(e.floorTo<0||e.floorTo>s.maxFloor))return s;
 if(e.kind==='utility'&&(!e.utility||!e.action||e.floorTo!==s.floor))return s;
 const next={...s,utilityHealth:{...s.utilityHealth},completedEventIds:[...s.completedEventIds,e.id]};
 if(e.kind==='utility'&&e.utility){if(e.action==='repair')next.utilityHealth[e.utility]=clamp(next.utilityHealth[e.utility]+20,0,100)}
 else next.floor=e.floorTo;
 return next;
}
// Logic-only state. Actual 3D collision, sloped steps, elevator animation, doors,
// utility blueprints and server authority must be connected and tested separately.
