// StreetVerse Googolplex Memory: bounded, owner-scoped event ledger for demo and
// a contract for the existing authenticated /api/memory/events/npc backend.
export type MemoryTier='hot'|'warm'|'cold';
export type WorldMemoryEvent={id:string;ownerId:string;worldId:string;subjectId:string;kind:'npc-interaction'|'repair'|'mission'|'relationship';summary:string;occurredAt:string;tier:MemoryTier;source:'game';confirmed:boolean};
export function worldMemoryEvent(input:Omit<WorldMemoryEvent,'source'|'confirmed'|'tier'>):WorldMemoryEvent{
 return {...input,source:'game',confirmed:false,tier:input.kind==='npc-interaction'?'hot':'warm'};
}
export function addWorldMemory(existing:WorldMemoryEvent[],event:WorldMemoryEvent,limit=100):WorldMemoryEvent[]{
 if(existing.some(item=>item.id===event.id))return existing;
 return [...existing.filter(item=>item.ownerId===event.ownerId&&item.worldId===event.worldId),event].slice(-Math.max(1,Math.min(limit,500)));
}
export function recallWorldMemory(events:WorldMemoryEvent[],ownerId:string,worldId:string,subjectId:string,limit=5):WorldMemoryEvent[]{
 return events.filter(e=>e.ownerId===ownerId&&e.worldId===worldId&&e.subjectId===subjectId )
 .sort((a,b)=>b.occurredAt.localeCompare(a.occurredAt)).slice(0,Math.max(0,Math.min(limit,20)));
}
export type MemoryWritePort={writeNpcEvent(input:{npcId:string;playerId:string;dialogueSummary:string;outcome:string;relationshipChange:number;sessionId:string;sourceReferences:string[]}):Promise<void>};
export function makeNpcMemoryWrite(event:WorldMemoryEvent,playerId:string,sessionId:string){
 if(event.kind!=='npc-interaction'&&event.kind!=='repair')return null;
 return {npcId:event.subjectId,playerId,dialogueSummary:event.summary,outcome:event.kind,relationshipChange:event.kind==='repair'?15:0,sessionId,sourceReferences:[event.id]};
}
// Local demo memories are unverified and visible only in the prototype. The server must independently confirm them.
// Server must derive authenticated ownerId, validate NPC IDs and source evidence,
// enforce access control, retention and idempotency. Never trust client-side rewards.
