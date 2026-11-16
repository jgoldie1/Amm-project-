/**
 * StreetVerse Mycelium: bounded, idempotent IN-GAME event routing.
 * This is a deterministic planning/event fabric, not biological mycelium,
 * a neural network, a payment processor, or a deployed multiplayer service.
 */
export type MyceliumNode = 'streetverse'|'living-city'|'missions'|'businesses'|'npc-memory'|'creator'|'ai-cafe'|'mlp';
export type MyceliumEvent = Readonly<{
  id:string; kind:'district-preview'|'mission-complete'|'business-update';
  cityId:string; source:MyceliumNode;
  payload:Readonly<Record<string,string|number|boolean>>;
}>;
export type MyceliumReceipt = Readonly<{eventId:string; delivered:readonly MyceliumNode[]; duplicate:boolean; effects:'simulation-only'}>;
const GRAPH: Readonly<Record<MyceliumNode,readonly MyceliumNode[]>> = {
  'streetverse':['living-city','missions','npc-memory'],
  'living-city':['businesses','creator'],
  'missions':['businesses','npc-memory'],
  'businesses':['ai-cafe'],
  'npc-memory':['creator'],
  'creator':['ai-cafe'],
  'ai-cafe':['mlp'],
  'mlp':[],
};
const STORAGE_KEY='tryamm.streetverse.mycelium-receipts.v1';
/** Browser-only bounded simulation receipts. No payments or server-authoritative rewards. */
export function createStreetVerseMyceliumNetwork(options:{persistLocal?:boolean}={}){
 const handled=new Map<string,MyceliumReceipt>();
 if(options.persistLocal&&typeof localStorage!=='undefined'){
  try{
   const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
   if(Array.isArray(saved))for(const row of saved.slice(-100)){
    if(row&&typeof row.eventId==='string'&&/^[a-z0-9][a-z0-9:._-]{0,127}$/i.test(row.eventId)&&
       Array.isArray(row.delivered)&&row.delivered.length<=8&&row.delivered.every((n:unknown)=>typeof n==='string'&&Object.prototype.hasOwnProperty.call(GRAPH,n))&&row.effects==='simulation-only'){
      handled.set(row.eventId,{eventId:row.eventId,delivered:[...row.delivered],duplicate:false,effects:'simulation-only'});
    }
   }
  }catch{}
 }
 function persist(){
  if(!options.persistLocal||typeof localStorage==='undefined')return;
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify([...handled.values()].slice(-100)))}catch{}
 }
 return {
  publish(event:MyceliumEvent):MyceliumReceipt {
   if(!/^[a-z0-9][a-z0-9:._-]{0,127}$/i.test(event.id))throw new Error('Invalid event identifier');
   if(!/^[a-z][a-z0-9-]{1,60}$/.test(event.cityId))throw new Error('Invalid city');
   if(!Object.prototype.hasOwnProperty.call(GRAPH,event.source))throw new Error('Invalid source node');
   if(Object.keys(event.payload).length>20)throw new Error('Event payload too large');
   const prior=handled.get(event.id);
   if(prior)return {...prior,duplicate:true};
   const visited=new Set<MyceliumNode>(),queue:MyceliumNode[]=[event.source];
   while(queue.length){
    const node=queue.shift()!;
    if(visited.has(node))continue;
    visited.add(node);
    for(const next of GRAPH[node])if(!visited.has(next))queue.push(next);
   }
   const receipt:MyceliumReceipt={eventId:event.id,delivered:[...visited],duplicate:false,effects:'simulation-only'};
   handled.set(event.id,receipt);
   if(handled.size>100)handled.delete(handled.keys().next().value!);
   persist();
   return receipt;
  },
  receipts:()=>[...handled.values()].map(r=>({...r,delivered:[...r.delivered]})),
 };
}
