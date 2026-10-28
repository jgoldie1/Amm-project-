/**
 * StreetVerse fictional/reviewed interior navigation contract.
 * Do not infer actual school floor plans from City of Chicago building footprints.
 * A physical entrance and matching landing must exist in a certified scene.
 */
export type VerticalMode='stairs'|'elevator'|'accessible-route'
export type InteriorNode={id:string;floor:number;x:number;y:number;z:number;type:'entrance'|'room'|'landing'|'elevator'|'exit';accessible:boolean}
export type InteriorEdge={from:string;to:string;mode:'walk'|VerticalMode;accessible:boolean}
export type InteriorBlueprint={id:string;label:string;fictionalized:boolean;approved:boolean;nodes:InteriorNode[];edges:InteriorEdge[]}
export type PathResult={ok:true;nodes:string[];modes:string[]}|{ok:false;reason:string}
export function validateInteriorBlueprint(plan:InteriorBlueprint):string[]{
 const errors:string[]=[]
 const ids=new Set<string>()
 for(const node of plan.nodes){
  if(ids.has(node.id))errors.push('Duplicate node '+node.id)
  ids.add(node.id)
  if(![node.x,node.y,node.z,node.floor].every(Number.isFinite))errors.push('Invalid coordinates '+node.id)
 }
 for(const edge of plan.edges){
  if(!ids.has(edge.from)||!ids.has(edge.to))errors.push('Disconnected edge '+edge.from+' '+edge.to)
  if(edge.mode==='elevator'&&!edge.accessible)errors.push('Elevator edge must be accessible')
 }
 if(!plan.nodes.some(n=>n.type==='entrance'))errors.push('Missing entrance')
 if(!plan.nodes.some(n=>n.type==='exit'))errors.push('Missing exit')
 return errors
}
export function findInteriorRoute(plan:InteriorBlueprint,start:string,end:string,accessibleOnly=false):PathResult{
 if(!plan.approved)return {ok:false,reason:'Interior blueprint has not been approved'}
 const errors=validateInteriorBlueprint(plan)
 if(errors.length)return {ok:false,reason:errors[0]}
 const ids=new Set(plan.nodes.map(n=>n.id))
 if(!ids.has(start)||!ids.has(end))return {ok:false,reason:'Unknown floor destination'}
 const queue=[start],previous=new Map<string,{from:string;mode:string}>()
 const visited=new Set([start])
 while(queue.length){
  const current=queue.shift()!
  if(current===end){
   const nodes=[end],modes:string[]=[]
   while(nodes[0]!==start){const step=previous.get(nodes[0]);if(!step)break;nodes.unshift(step.from);modes.unshift(step.mode)}
   return {ok:true,nodes,modes}
  }
  for(const edge of plan.edges){
   if(edge.from!==current||visited.has(edge.to)||accessibleOnly&&!edge.accessible)continue
   const target=plan.nodes.find(n=>n.id===edge.to)
   if(!target||accessibleOnly&&!target.accessible)continue
   visited.add(edge.to);previous.set(edge.to,{from:current,mode:edge.mode});queue.push(edge.to)
  }
 }
 return {ok:false,reason:accessibleOnly?'No step-free route available':'No connected route available'}
}
/** Demonstration ONLY: fictitious three-floor school, not an actual Chicago school. */
export const DEMO_SCHOOL_INTERIOR:InteriorBlueprint={
 id:'demo-school-building',label:'School Interior Navigation Test',fictionalized:true,approved:true,
 nodes:[
  {id:'outside',floor:0,x:0,y:0,z:0,type:'entrance',accessible:true},
  {id:'lobby',floor:0,x:2,y:0,z:0,type:'room',accessible:true},
  {id:'stairs-0',floor:0,x:4,y:0,z:0,type:'landing',accessible:false},
  {id:'stairs-1',floor:1,x:4,y:4,z:0,type:'landing',accessible:false},
  {id:'stairs-2',floor:2,x:4,y:8,z:0,type:'landing',accessible:false},
  {id:'lift-0',floor:0,x:6,y:0,z:0,type:'elevator',accessible:true},
  {id:'lift-1',floor:1,x:6,y:4,z:0,type:'elevator',accessible:true},
  {id:'lift-2',floor:2,x:6,y:8,z:0,type:'elevator',accessible:true},
  {id:'floor-1',floor:1,x:8,y:4,z:0,type:'room',accessible:true},
  {id:'floor-2',floor:2,x:8,y:8,z:0,type:'room',accessible:true},
  {id:'exit',floor:0,x:-1,y:0,z:0,type:'exit',accessible:true},
 ],
 edges:[
  {from:'outside',to:'lobby',mode:'walk',accessible:true},{from:'lobby',to:'outside',mode:'walk',accessible:true},
  {from:'lobby',to:'exit',mode:'walk',accessible:true},{from:'exit',to:'outside',mode:'walk',accessible:true},
  {from:'lobby',to:'stairs-0',mode:'walk',accessible:false},{from:'stairs-0',to:'stairs-1',mode:'stairs',accessible:false},{from:'stairs-1',to:'stairs-2',mode:'stairs',accessible:false},
  {from:'lobby',to:'lift-0',mode:'walk',accessible:true},{from:'lift-0',to:'lift-1',mode:'elevator',accessible:true},{from:'lift-1',to:'lift-2',mode:'elevator',accessible:true},
  {from:'lift-1',to:'floor-1',mode:'walk',accessible:true},{from:'lift-2',to:'floor-2',mode:'walk',accessible:true},
  {from:'floor-1',to:'lift-1',mode:'walk',accessible:true},{from:'floor-2',to:'lift-2',mode:'walk',accessible:true},
  {from:'lift-2',to:'lift-1',mode:'elevator',accessible:true},{from:'lift-1',to:'lift-0',mode:'elevator',accessible:true},{from:'lift-0',to:'lobby',mode:'walk',accessible:true},
  {from:'stairs-2',to:'stairs-1',mode:'stairs',accessible:false},{from:'stairs-1',to:'stairs-0',mode:'stairs',accessible:false},{from:'stairs-0',to:'lobby',mode:'walk',accessible:false},
 ]
}
