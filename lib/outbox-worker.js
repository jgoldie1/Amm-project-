'use strict';
const tx=require('./transaction-core');
function sleep(ms){return new Promise(r=>setTimeout(r,ms))}
async function runOnce({handlers={},limit=25,deadLetterAfter=8}={}){
 if(!tx.configured())return {ok:false,reason:'transaction_store_not_configured',claimed:0,delivered:0,failed:0};
 const rows=await tx.rpc('claim_outbox_messages',{p_limit:Math.max(1,Math.min(100,Number(limit)||25))});let delivered=0,failed=0;
 for(const m of Array.isArray(rows)?rows:[]){const handler=handlers[m.topic]||handlers['*'];if(!handler){await tx.rpc('fail_outbox_message',{p_id:m.id,p_error:`no_handler:${m.topic}`,p_dead_letter_after:deadLetterAfter});failed++;continue}
  try{await handler(m);await tx.rpc('complete_outbox_message',{p_id:m.id});delivered++;}
  catch(e){await tx.rpc('fail_outbox_message',{p_id:m.id,p_error:e?.message||String(e),p_dead_letter_after:deadLetterAfter});failed++;}
 }
 return {ok:true,claimed:Array.isArray(rows)?rows.length:0,delivered,failed};
}
async function runLoop({handlers={},intervalMs=2000,signal,limit=25}={}){while(!signal?.aborted){await runOnce({handlers,limit});await sleep(Math.max(250,Math.min(60000,Number(intervalMs)||2000)));}}
module.exports={runOnce,runLoop};
