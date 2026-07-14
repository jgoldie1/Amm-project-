const MAX_MEMORY=24;

function normalizeLore(lore={}){
  return {
    name:String(lore.name||'Unnamed NPC').slice(0,120),
    role:String(lore.role||'guide').slice(0,80),
    world:String(lore.world||'TryAMM').slice(0,120),
    goals:Array.isArray(lore.goals)?lore.goals.slice(0,8).map(String):[],
    knowledge:Array.isArray(lore.knowledge)?lore.knowledge.slice(0,20).map(String):[],
    boundaries:Array.isArray(lore.boundaries)?lore.boundaries.slice(0,12).map(String):[
      'Do not impersonate real people.',
      'Do not reveal private player data.',
      'Do not encourage real-world harm.'
    ]
  };
}

function createNpcSession({npcId,playerId,lore,realm='metaverse'}){
  return {
    id:`npcchat_${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    npcId:String(npcId||'npc-demo'),
    playerId:String(playerId||'demo-player'),
    realm:String(realm),
    lore:normalizeLore(lore),
    memory:[],
    trust:0,
    mood:'neutral',
    createdAt:new Date().toISOString(),
    updatedAt:new Date().toISOString()
  };
}

function buildPrompt(session,message,retrievedFacts=[]){
  const lore=session.lore;
  return {
    system:[
      `You are ${lore.name}, an original TryAMM ${lore.role} NPC in ${lore.world}.`,
      `Goals: ${lore.goals.join('; ')||'help the player progress safely'}.`,
      `Knowledge: ${lore.knowledge.join('; ')||'local world knowledge only'}.`,
      `Boundaries: ${lore.boundaries.join('; ')}.`,
      'Stay in character, be concise, never invent private account facts, and never claim to be a real person.',
      `Approved retrieved facts: ${retrievedFacts.join(' | ')||'none'}.`
    ].join('\n'),
    messages:[...session.memory.slice(-12),{role:'user',content:String(message||'').slice(0,2000)}]
  };
}

function recordTurn(session,{user,assistant,emotion='neutral',facts=[]}){
  const memory=[...session.memory,{role:'user',content:String(user||'').slice(0,2000)},{role:'assistant',content:String(assistant||'').slice(0,3000),emotion,facts:Array.isArray(facts)?facts.slice(0,8):[]}].slice(-MAX_MEMORY);
  return {...session,memory,mood:emotion,trust:Math.max(-100,Math.min(100,session.trust+(emotion==='helpful'?2:emotion==='hostile'?-3:0))),updatedAt:new Date().toISOString()};
}

function estimateCost({inputTokens=0,outputTokens=0,inputPerMillion=0,outputPerMillion=0}){
  return Number((((inputTokens/1_000_000)*inputPerMillion)+((outputTokens/1_000_000)*outputPerMillion)).toFixed(6));
}

module.exports={createNpcSession,buildPrompt,recordTurn,estimateCost,normalizeLore};
