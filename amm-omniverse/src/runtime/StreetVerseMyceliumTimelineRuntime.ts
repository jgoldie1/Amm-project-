/** StreetVerse Mycelium timeline graph. Fictional game-world state only. */
export type VerseKind='streetverse'|'chronoverse'|'pocket-dimension'|'multiverse'
export type VerseEvent={id:string;kind:string;payload:Record<string,string|number|boolean>;at:number}
export type VerseBranch={id:string;parentId:string|null;kind:VerseKind;originAt:number;events:VerseEvent[]}
export function createMyceliumTimeline(rootId='streetverse:chicago'){
 const branches=new Map<string,VerseBranch>()
 branches.set(rootId,{id:rootId,parentId:null,kind:'streetverse',originAt:0,events:[]})
 let activeId=rootId
 const get=(id:string)=>{const branch=branches.get(id);if(!branch)throw new Error('Unknown timeline '+id);return branch}
 return {
  active:()=>activeId,
  branches:()=>Array.from(branches.values()).map(b=>({...b,events:b.events.map(e=>({...e,payload:{...e.payload}}))})),
  fork:(id:string,kind:VerseKind,at:number,parentId=activeId)=>{
   if(!id||branches.has(id))throw new Error('Timeline ID must be unique')
   if(!Number.isFinite(at))throw new Error('Invalid fork time')
   get(parentId)
   branches.set(id,{id,parentId,kind,originAt:at,events:[]})
   return id
  },
  travel:(id:string)=>{get(id);activeId=id;return id},
  record:(event:VerseEvent)=>{
   if(!event.id||!Number.isFinite(event.at))throw new Error('Invalid event')
   const branch=get(activeId)
   if(branch.events.some(e=>e.id===event.id))return false
   branch.events.push({...event,payload:{...event.payload}})
   return true
  },
  history:(id=activeId):VerseEvent[]=>{
   const branch=get(id)
   const inherited=branch.parentId?thisHistory(branch.parentId).filter(e=>e.at<=branch.originAt):[]
   return [...inherited,...branch.events].map(e=>({...e,payload:{...e.payload}}))
  },
 }
 function thisHistory(id:string):VerseEvent[]{
  const branch=get(id)
  return [...(branch.parentId?thisHistory(branch.parentId).filter(e=>e.at<=branch.originAt):[]),...branch.events]
 }
}
