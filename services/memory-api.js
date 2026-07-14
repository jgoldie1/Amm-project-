const express=require('express');
const crypto=require('crypto');
const supabaseService=require('./supabase');
const memoryCore=require('./googolplex-memory');
const memoryEvaluation=require('./memory-evaluation');
const africaWalletApi=require('./africa-wallet-api');
const globalCommerceApi=require('./global-commerce-api');
const quantumVocalStudioApi=require('./quantum-vocal-studio-api');
const aniyahCrossborderApi=require('./aniyah-crossborder-api');

const router=express.Router();
const SECRET_PATTERNS=[
  /(?:api[_-]?key|secret|password|token)\s*[:=]\s*[^\s,;]+/gi,
  /sk_(?:live|test)_[A-Za-z0-9]+/g,
  /Bearer\s+[A-Za-z0-9._-]+/gi,
  /\b\d{3}-\d{2}-\d{4}\b/g,
  /\b(?:\d[ -]*?){13,19}\b/g,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g
];
function redact(value){let text=String(value||'');for(const pattern of SECRET_PATTERNS)text=text.replace(pattern,'[REDACTED]');return text;}
function configured(){return supabaseService.configured();}
async function auth(req,res,next){if(!configured())return res.status(503).json({error:'Supabase is not configured.'});return supabaseService.requireUser(req,res,next);}
function audit(client,userId,action,memoryId,details={}){return client.from('ai_memory_audit').insert({owner_id:userId,action,memory_id:memoryId||null,details,request_id:crypto.randomUUID()});}
function normalize(row){return {...row,facts:row.facts||[],tags:row.tags||[],source_ids:row.source_ids||[]};}
async function embed(text){
  if(!process.env.EMBEDDING_API_URL||!process.env.EMBEDDING_API_KEY||!process.env.EMBEDDING_MODEL)return null;
  const response=await fetch(process.env.EMBEDDING_API_URL,{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${process.env.EMBEDDING_API_KEY}`},body:JSON.stringify({model:process.env.EMBEDDING_MODEL,input:redact(text).slice(0,12000)})});
  if(!response.ok)throw new Error(`Embedding provider returned ${response.status}`);
  const data=await response.json();return data.data?.[0]?.embedding||data.embedding||null;
}
async function conflicts(client,userId,candidate,excludeId=null){
  const {data,error}=await client.from('ai_memories').select('id,title,content,facts,confidence,updated_at').eq('owner_id',userId).eq('status','active').eq('subject_type',candidate.subjectType||'user').eq('subject_id',candidate.subjectId||userId).limit(100);
  if(error)throw error;
  const facts=new Set((candidate.facts||[]).map(v=>String(v).toLowerCase()));
  return (data||[]).filter(item=>item.id!==excludeId).map(item=>{
    const other=new Set((item.facts||[]).map(v=>String(v).toLowerCase()));
    const overlap=[...facts].filter(v=>other.has(v));
    const sameTitle=String(item.title).toLowerCase()===String(candidate.title||'').toLowerCase();
    const contradiction=sameTitle&&redact(item.content).toLowerCase()!==redact(candidate.content).toLowerCase();
    return overlap.length||contradiction?{memoryId:item.id,title:item.title,overlap,possibleContradiction:contradiction,confidence:item.confidence}:null;
  }).filter(Boolean);
}
async function retrieveForRequest(req,query,options={}){
  if(!configured()||!req.headers.authorization)return [];
  const user=await supabaseService.userFromRequest(req);if(!user)return [];
  const client=supabaseService.admin();
  const embedding=await embed(query).catch(()=>null);
  if(embedding){
    const {data,error}=await client.rpc('match_ai_memories',{query_embedding:embedding,match_owner:user.id,match_count:options.limit||8,minimum_similarity:options.minimumSimilarity||0.25});
    if(!error&&data?.length)return data.map(normalize);
  }
  const {data,error}=await client.from('ai_memories').select('*').eq('owner_id',user.id).eq('status','active').or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`).order('importance',{ascending:false}).order('updated_at',{ascending:false}).limit(100);
  if(error)return [];
  return memoryCore.retrieve((data||[]).map(row=>({id:row.id,ownerId:row.owner_id,subjectType:row.subject_type,subjectId:row.subject_id,tier:row.tier,title:row.title,content:row.content,facts:row.facts,tags:row.tags,sourceIds:row.source_ids,confidence:Number(row.confidence),importance:Number(row.importance),visibility:row.visibility,consent:row.consent,expiresAt:row.expires_at,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at})),query,{ownerId:user.id,limit:options.limit||8});
}
async function insertEventMemory(client,userId,{tier,title,content,subjectType,subjectId,facts=[],tags=[],sourceIds=[]}){
  const safe=memoryCore.createMemory({ownerId:userId,tier,title,content:redact(content),subjectType,subjectId,facts:facts.map(redact),tags,sourceIds,visibility:'private',consent:true,importance:.75,confidence:.9});
  const embedding=await embed(`${safe.title}\n${safe.content}\n${safe.facts.join('\n')}`).catch(()=>null);
  const {data,error}=await client.from('ai_memories').insert({owner_id:userId,subject_type:safe.subjectType,subject_id:safe.subjectId,tier:safe.tier,title:safe.title,content:safe.content,facts:safe.facts,tags:safe.tags,source_ids:safe.sourceIds,confidence:safe.confidence,importance:safe.importance,visibility:'private',consent:true,embedding}).select().single();
  if(error)throw error;await audit(client,userId,'event-memory',data.id,{subjectType,subjectId});return data;
}

router.use('/africa',africaWalletApi.router);
router.use('/global',globalCommerceApi.router);
router.use('/music-studio',quantumVocalStudioApi.router);
router.use('/aniyah',aniyahCrossborderApi.router);
router.get('/status',(req,res)=>res.json({configured:configured(),embedding:Boolean(process.env.EMBEDDING_API_URL&&process.env.EMBEDDING_API_KEY&&process.env.EMBEDDING_MODEL),service:'Googolplex Memory',africaCommerce:true,globalCommerce:true,quantumVocalStudio:true,aniyahCrossborder:true}));
router.use(auth);
router.get('/',async(req,res,next)=>{try{const client=supabaseService.admin();let query=client.from('ai_memories').select('*').eq('owner_id',req.user.id).order('updated_at',{ascending:false}).limit(Math.min(Number(req.query.limit)||100,500));if(req.query.tier)query=query.eq('tier',req.query.tier);if(req.query.status)query=query.eq('status',req.query.status);const {data,error}=await query;if(error)throw error;res.json(data.map(normalize));}catch(error){next(error);}});
router.post('/',async(req,res,next)=>{try{const client=supabaseService.admin();const safe=memoryCore.createMemory({...req.body,ownerId:req.user.id,content:redact(req.body.content),facts:(req.body.facts||[]).map(redact),consent:Boolean(req.body.consent)});const embedding=await embed(`${safe.title}\n${safe.content}\n${safe.facts.join('\n')}`).catch(()=>null);const row={owner_id:req.user.id,subject_type:safe.subjectType,subject_id:safe.subjectId||req.user.id,tier:safe.tier,title:safe.title,content:safe.content,facts:safe.facts,tags:safe.tags,source_ids:safe.sourceIds,confidence:safe.confidence,importance:safe.importance,visibility:safe.visibility,consent:safe.consent,expires_at:safe.expiresAt,embedding};const found=await conflicts(client,req.user.id,safe);const {data,error}=await client.from('ai_memories').insert(row).select().single();if(error)throw error;await audit(client,req.user.id,'create',data.id,{conflicts:found.length,visibility:data.visibility});res.status(201).json({...normalize(data),conflicts:found});}catch(error){next(error);}});
router.get('/search',async(req,res,next)=>{try{res.json(await retrieveForRequest(req,String(req.query.q||''),{limit:req.query.limit}));}catch(error){next(error);}});
router.get('/export',async(req,res,next)=>{try{const client=supabaseService.admin();const {data,error}=await client.from('ai_memories').select('*').eq('owner_id',req.user.id).order('created_at');if(error)throw error;await audit(client,req.user.id,'export',null,{count:data.length});res.setHeader('Content-Disposition','attachment; filename="tryamm-memory-export.json"');res.json({exportedAt:new Date().toISOString(),ownerId:req.user.id,memories:data});}catch(error){next(error);}});
router.post('/events/npc',async(req,res,next)=>{try{const event=req.body||{};const memory=await insertEventMemory(supabaseService.admin(),req.user.id,{tier:'npc',title:`NPC interaction: ${event.npcName||event.npcId||'unknown'}`,content:event.summary||event.dialogue||'NPC interaction completed.',subjectType:'npc',subjectId:String(event.npcId||'unknown'),facts:[event.outcome,event.relationshipChange,event.questId].filter(Boolean),tags:['npc','interaction'],sourceIds:[event.matchId,event.sessionId].filter(Boolean)});res.status(201).json(memory);}catch(error){next(error);}});
router.post('/events/arena',async(req,res,next)=>{try{const event=req.body||{};const memory=await insertEventMemory(supabaseService.admin(),req.user.id,{tier:'arena',title:`Arena match: ${event.gameTitle||event.gameId||'game'}`,content:event.summary||`Match result: ${event.result||'completed'}.`,subjectType:'arena-match',subjectId:String(event.matchId||crypto.randomUUID()),facts:[event.result,event.ratingChange!==undefined?`Rating change ${event.ratingChange}`:null,event.tournamentId].filter(Boolean),tags:['arena','match',String(event.gameId||'game')],sourceIds:[event.replayId,event.broadcastId].filter(Boolean)});res.status(201).json(memory);}catch(error){next(error);}});
router.post('/evaluate/memory/:id',async(req,res,next)=>{try{const client=supabaseService.admin();const {data:memory,error}=await client.from('ai_memories').select('*').eq('id',req.params.id).eq('owner_id',req.user.id).single();if(error)throw error;const {data:related}=await client.from('ai_memories').select('*').eq('owner_id',req.user.id).eq('subject_type',memory.subject_type).eq('subject_id',memory.subject_id).limit(100);const result=memoryEvaluation.evaluateMemory(memory,related||[]);await client.from('ai_memory_evaluations').insert({owner_id:req.user.id,memory_id:memory.id,evaluation_type:'quality-conflict',score:result.score,passed:result.passed,findings:result.findings,model:'deterministic-v1'});await audit(client,req.user.id,'evaluate-memory',memory.id,{score:result.score,passed:result.passed});res.json(result);}catch(error){next(error);}});
router.post('/evaluate/answer',async(req,res,next)=>{try{const memories=await retrieveForRequest(req,String(req.body.question||req.body.answer||''),{limit:12});const result=memoryEvaluation.evaluateAnswer({answer:req.body.answer,memories,requiredFacts:req.body.requiredFacts||[],forbiddenClaims:req.body.forbiddenClaims||[]});const client=supabaseService.admin();await client.from('ai_memory_evaluations').insert({owner_id:req.user.id,evaluation_type:'answer-hallucination',score:result.score,passed:result.passed,findings:result.findings,model:String(req.body.model||'unknown')});await audit(client,req.user.id,'evaluate-answer',null,{score:result.score,passed:result.passed});res.json(result);}catch(error){next(error);}});
router.post('/maintenance/cleanup',async(req,res,next)=>{try{const client=supabaseService.admin();const {data,error}=await client.rpc('cleanup_ai_memories',{target_owner:req.user.id});if(error)throw error;await audit(client,req.user.id,'cleanup',null,{result:data});res.json({cleaned:data});}catch(error){next(error);}});
router.get('/audit/events',async(req,res,next)=>{try{const client=supabaseService.admin();const {data,error}=await client.from('ai_memory_audit').select('*').eq('owner_id',req.user.id).order('created_at',{ascending:false}).limit(250);if(error)throw error;res.json(data);}catch(error){next(error);}});
router.patch('/:id',async(req,res,next)=>{try{const client=supabaseService.admin();const {data:current,error:readError}=await client.from('ai_memories').select('*').eq('id',req.params.id).eq('owner_id',req.user.id).single();if(readError)throw readError;const changes={};for(const key of ['title','tier','visibility','confidence','importance','expires_at'])if(req.body[key]!==undefined)changes[key]=req.body[key];if(req.body.content!==undefined)changes.content=redact(req.body.content);if(req.body.facts!==undefined)changes.facts=req.body.facts.map(redact);if(req.body.tags!==undefined)changes.tags=req.body.tags;if(req.body.consent!==undefined)changes.consent=Boolean(req.body.consent);if(changes.content||changes.title||changes.facts)changes.embedding=await embed(`${changes.title||current.title}\n${changes.content||current.content}\n${(changes.facts||current.facts||[]).join('\n')}`).catch(()=>current.embedding);const found=await conflicts(client,req.user.id,{subjectType:current.subject_type,subjectId:current.subject_id,title:changes.title||current.title,content:changes.content||current.content,facts:changes.facts||current.facts},current.id);const {data,error}=await client.from('ai_memories').update(changes).eq('id',req.params.id).eq('owner_id',req.user.id).select().single();if(error)throw error;await audit(client,req.user.id,'update',data.id,{fields:Object.keys(changes),conflicts:found.length});res.json({...normalize(data),conflicts:found});}catch(error){next(error);}});
router.post('/:id/forget',async(req,res,next)=>{try{const client=supabaseService.admin();const {data,error}=await client.from('ai_memories').update({status:'forgotten',content:'[FORGOTTEN BY OWNER]',facts:[],tags:[],embedding:null,expires_at:new Date().toISOString()}).eq('id',req.params.id).eq('owner_id',req.user.id).select().single();if(error)throw error;await audit(client,req.user.id,'forget',data.id,{reason:redact(req.body.reason||'user-request')});res.json(data);}catch(error){next(error);}});
router.post('/:id/expire',async(req,res,next)=>{try{const client=supabaseService.admin();const expiresAt=req.body.expiresAt||new Date().toISOString();const {data,error}=await client.from('ai_memories').update({expires_at:expiresAt}).eq('id',req.params.id).eq('owner_id',req.user.id).select().single();if(error)throw error;await audit(client,req.user.id,'expire',data.id,{expiresAt});res.json(data);}catch(error){next(error);}});
router.get('/:id/conflicts',async(req,res,next)=>{try{const client=supabaseService.admin();const {data,error}=await client.from('ai_memories').select('*').eq('id',req.params.id).eq('owner_id',req.user.id).single();if(error)throw error;res.json(await conflicts(client,req.user.id,{subjectType:data.subject_type,subjectId:data.subject_id,title:data.title,content:data.content,facts:data.facts},data.id));}catch(error){next(error);}});

module.exports={router,retrieveForRequest,redact,embed};