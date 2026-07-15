const crypto=require('crypto');

const TIERS=['working','episodic','semantic','procedural','relational','project','npc','arena','commerce'];
const VISIBILITY=['private','shared','public'];

function now(){return new Date().toISOString();}
function id(prefix='mem'){return `${prefix}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;}
function clamp(value,min,max){return Math.max(min,Math.min(max,Number(value)||0));}
function cleanText(value,max=12000){return String(value||'').replace(/\s+/g,' ').trim().slice(0,max);}

function createMemory(input={}){
  const tier=TIERS.includes(input.tier)?input.tier:'episodic';
  const visibility=VISIBILITY.includes(input.visibility)?input.visibility:'private';
  const content=cleanText(input.content);
  if(!content)throw new Error('Memory content is required.');
  return {
    id:id(),
    ownerId:String(input.ownerId||'').trim()||null,
    subjectType:String(input.subjectType||'user'),
    subjectId:String(input.subjectId||input.ownerId||'').trim()||null,
    tier,
    title:cleanText(input.title,180)||'Untitled memory',
    content,
    facts:Array.isArray(input.facts)?input.facts.map(v=>cleanText(v,500)).filter(Boolean).slice(0,50):[],
    tags:Array.isArray(input.tags)?input.tags.map(v=>cleanText(v,80).toLowerCase()).filter(Boolean).slice(0,30):[],
    sourceIds:Array.isArray(input.sourceIds)?input.sourceIds.map(String).slice(0,30):[],
    links:Array.isArray(input.links)?input.links.map(link=>({
      relation:cleanText(link.relation,80)||'related_to',
      targetId:String(link.targetId||'').trim()
    })).filter(link=>link.targetId).slice(0,50):[],
    confidence:clamp(input.confidence??0.7,0,1),
    importance:clamp(input.importance??0.5,0,1),
    visibility,
    consent:Boolean(input.consent),
    expiresAt:input.expiresAt||null,
    supersedesId:input.supersedesId||null,
    status:'active',
    createdAt:now(),
    updatedAt:now()
  };
}

function scoreMemory(memory,queryTerms,context={}){
  const haystack=`${memory.title} ${memory.content} ${(memory.tags||[]).join(' ')} ${(memory.facts||[]).join(' ')}`.toLowerCase();
  const lexical=queryTerms.reduce((sum,term)=>sum+(haystack.includes(term)?1:0),0);
  const tierBoost=context.tier&&memory.tier===context.tier?2:0;
  const subjectBoost=context.subjectId&&memory.subjectId===context.subjectId?3:0;
  const recency=Math.max(0,1-(Date.now()-Date.parse(memory.updatedAt||memory.createdAt))/(1000*60*60*24*365));
  return lexical+tierBoost+subjectBoost+memory.importance+memory.confidence+recency;
}

function retrieve(memories=[],query='',context={}){
  const terms=cleanText(query,2000).toLowerCase().split(/\W+/).filter(Boolean).slice(0,30);
  return memories
    .filter(memory=>memory&&memory.status==='active')
    .filter(memory=>!memory.expiresAt||Date.parse(memory.expiresAt)>Date.now())
    .filter(memory=>memory.visibility==='public'||memory.ownerId===context.ownerId||context.allowShared&&memory.visibility==='shared')
    .map(memory=>({...memory,_score:scoreMemory(memory,terms,context)}))
    .filter(memory=>memory._score>0)
    .sort((a,b)=>b._score-a._score)
    .slice(0,Math.max(1,Math.min(Number(context.limit)||8,30)));
}

function revise(memory,changes={}){
  if(!memory)throw new Error('Memory is required.');
  const next={...memory};
  if(changes.title!==undefined)next.title=cleanText(changes.title,180);
  if(changes.content!==undefined)next.content=cleanText(changes.content);
  if(changes.facts!==undefined)next.facts=Array.isArray(changes.facts)?changes.facts.map(v=>cleanText(v,500)).filter(Boolean).slice(0,50):[];
  if(changes.tags!==undefined)next.tags=Array.isArray(changes.tags)?changes.tags.map(v=>cleanText(v,80).toLowerCase()).filter(Boolean).slice(0,30):[];
  if(changes.confidence!==undefined)next.confidence=clamp(changes.confidence,0,1);
  if(changes.importance!==undefined)next.importance=clamp(changes.importance,0,1);
  next.revision=(Number(memory.revision)||1)+1;
  next.updatedAt=now();
  return next;
}

function forget(memory,reason='user-request'){
  if(!memory)throw new Error('Memory is required.');
  return {...memory,status:'forgotten',forgottenReason:cleanText(reason,300),forgottenAt:now(),updatedAt:now()};
}

function buildContext(memories=[],maxCharacters=12000){
  let used=0;
  const selected=[];
  for(const memory of memories){
    const block=`[${memory.tier}] ${memory.title}: ${memory.content}`;
    if(used+block.length>maxCharacters)break;
    selected.push(block);
    used+=block.length;
  }
  return selected.join('\n');
}

function governancePolicy(){
  return {
    name:'Googolplex Memory',
    principles:[
      'User-controlled memory with view, edit, export and forget actions.',
      'No secret, payment credential or raw biometric storage.',
      'Sensitive memories require explicit consent and short retention.',
      'Facts preserve source identifiers and confidence.',
      'Newer verified memories may supersede stale memories without deleting audit history.',
      'NPC and AI memory cannot impersonate real people or override server-authoritative rules.',
      'Retrieval is scoped by owner, role, visibility and purpose.'
    ],
    tiers:TIERS
  };
}

module.exports={TIERS,createMemory,retrieve,revise,forget,buildContext,governancePolicy};
