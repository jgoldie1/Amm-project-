// Server-side Circle Park mission authority. Import only into an authenticated backend.
// The caller must derive playerId from its verified session, never from request JSON.
const ACTIONS=['enter','elevator','meet','react','accept-repair','finish-repair','story'];
export function newCircleParkRecord(playerId){return {playerId,step:0,completed:[],xp:0,credits:0,memories:[],version:1};}
export function applyCircleParkAction(record,action,authenticatedPlayerId){
 if(!authenticatedPlayerId||authenticatedPlayerId!==record.playerId)throw new Error('unauthorized');
 if(!ACTIONS.includes(action))throw new Error('invalid action');
 const index=ACTIONS.indexOf(action);
 if(record.completed.includes(action))return {record,applied:false};
 if(index!==record.step)throw new Error('invalid mission sequence');
 const next={...record,step:index+1,completed:[...record.completed,action],memories:[...record.memories]};
 if(action==='meet'){next.xp+=20;next.memories.push({id:'ms-pearl-met',npcId:'ms-pearl',summary:'BJ met Ms. Pearl'});}
 if(action==='finish-repair'){next.xp+=120;next.credits+=40;next.memories.push({id:'ms-pearl-plumbing-fixed',npcId:'ms-pearl',summary:'BJ repaired Ms. Pearl plumbing'});}
 return {record:next,applied:true};
}
export function createCircleParkAuthority(store){
 // store must implement atomic transaction(playerId, updater) and read(playerId).
 // In-memory maps and localStorage are not valid for production persistence.
 return {
  async progress(authenticatedPlayerId,action){
   if(!authenticatedPlayerId)throw new Error('unauthorized');
   return store.transaction(authenticatedPlayerId,current=>applyCircleParkAction(current??newCircleParkRecord(authenticatedPlayerId),action,authenticatedPlayerId).record);
  },
  async load(authenticatedPlayerId){
   if(!authenticatedPlayerId)throw new Error('unauthorized');
   return await store.read(authenticatedPlayerId)??newCircleParkRecord(authenticatedPlayerId);
  }
 };
}
