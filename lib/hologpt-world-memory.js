'use strict';

const crypto=require('crypto');
const {readMemory,writeMemory}=require('./stubbs-ai-runtime');

const PREFIX='HOLOGPT_WORLD_V1:';
const clean=(v,n=800)=>String(v||'').trim().slice(0,n);
const id=()=> 'world_'+crypto.randomBytes(8).toString('hex');

function decode(row){
  const summary=String(row?.summary||'');
  if(!summary.startsWith(PREFIX))return null;
  try{
    const value=JSON.parse(summary.slice(PREFIX.length));
    const expires=value.expiresAt?Date.parse(value.expiresAt):NaN;
    if(Number.isFinite(expires)&&expires<Date.now())return null;
    return {...value,memoryId:row.id||null,updatedAt:row.updated_at||row.created_at||null};
  }catch{return null}
}

async function rememberWorldFact(userId,{subject,predicate,object,scope='semantic',confidence=.75,sourceIds=[],ttlDays=30,context={}}={}){
  if(!userId)throw new Error('userId is required');
  const fact={
    id:id(),
    subject:clean(subject,240),
    predicate:clean(predicate,160),
    object:clean(object,1600),
    scope:['semantic','project','episodic','working'].includes(scope)?scope:'semantic',
    confidence:Math.max(0,Math.min(1,Number(confidence)||.75)),
    context:{
      world:clean(context?.world,120),
      entityType:clean(context?.entityType,120),
      source:clean(context?.source,120)
    },
    createdAt:new Date().toISOString(),
    expiresAt:new Date(Date.now()+Math.max(1,Math.min(365,Number(ttlDays)||30))*86400000).toISOString()
  };
  if(!fact.subject||!fact.predicate||!fact.object)throw new Error('subject, predicate and object are required');
  const saved=await writeMemory(userId,{
    scope:fact.scope,
    summary:PREFIX+JSON.stringify(fact),
    sourceIds:[...new Set([...(sourceIds||[]),'hologpt-world:'+fact.id].map(String))],
    confidence:fact.confidence,
    permissions:{owner:userId,kind:'hologpt-world-fact'},
    expiresAt:fact.expiresAt
  });
  return {saved:saved.saved===true,fact};
}

async function recallWorldFacts(userId,{subject='',predicate='',scope='semantic',limit=24}={}){
  if(!userId)throw new Error('userId is required');
  const rows=await readMemory(userId,{scope,limit:Math.max(1,Math.min(50,Number(limit)||24))});
  const s=clean(subject,240).toLowerCase();
  const p=clean(predicate,160).toLowerCase();
  const facts=rows.map(decode).filter(Boolean).filter(f=>(!s||f.subject.toLowerCase().includes(s))&&(!p||f.predicate.toLowerCase().includes(p)));
  return facts;
}

module.exports={PREFIX,rememberWorldFact,recallWorldFacts};
