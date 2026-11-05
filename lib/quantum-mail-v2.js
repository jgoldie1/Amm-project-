'use strict';
// Quantum Mail v2: durable customer-scoped mail metadata and guarded Resend transport.
// Provider credentials are server-only. A draft is NEVER an authorization to send.
const crypto=require('node:crypto');
const supabase=require('./supabase-rest');
const EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function fail(message,status=400){return Object.assign(new Error(message),{status})}
function configured(){return supabase.configured()&&process.env.QUANTUM_MAIL_DURABLE_ENABLED==='true'}
function requireStorage(){if(!configured())throw fail('Durable Quantum Mail database is not verified or enabled',503)}
function addresses(input){
 const list=Array.isArray(input)?input:String(input||'').split(',');
 const arr=list.map(x=>String(x).trim().toLowerCase()).filter(Boolean);
 if(arr.length<1||arr.length>10||arr.some(x=>!EMAIL.test(x)||x.length>254))throw fail('Invalid recipients');
 return [...new Set(arr)];
}
function validateDraft(data={}){
 const to=addresses(data.to);
 const subject=String(data.subject||'').trim().slice(0,200);
 const body=String(data.body||'').trim().slice(0,20000);
 if(!subject||!body)throw fail('Subject and message text required');
 if(/\r|\n/.test(subject))throw fail('Subject must be a single line');
 return {to_addresses:to,subject,body_text:body};
}
async function myAccount(ownerId,address){
 requireStorage();
 if(!EMAIL.test(String(address||'')))return null;
 const query='owner_id=eq.'+encodeURIComponent(ownerId)+'&address=eq.'+encodeURIComponent(address.toLowerCase())+'&select=*&limit=1';
 const rows=await supabase.select('quantum_mail_accounts',query);
 return rows?.[0]||null;
}
async function list(ownerId,kind){
 requireStorage();if(!['draft','inbound','outbound'].includes(kind))throw fail('Invalid mailbox');
 const rows=await supabase.select('quantum_mail_messages','owner_id=eq.'+encodeURIComponent(ownerId)+'&direction=eq.'+kind+'&select=id,account_id,direction,status,from_address,to_addresses,subject,body_text,threat_status,created_at,updated_at&order=created_at.desc&limit=100');
 return (rows||[]).map(row=>row.status==='quarantined'?{...row,body_text:'',reviewRequired:true}:row);
}
async function createDraft(ownerId,data){
 requireStorage();const from=String(data.from||'').toLowerCase().trim();
 const account=await myAccount(ownerId,from);
 if(!account||account.status!=='verified')throw fail('Choose your verified business email identity',403);
 const content=validateDraft(data);
 const rows=await supabase.insert('quantum_mail_messages',{id:crypto.randomUUID(),owner_id:ownerId,account_id:account.id,direction:'draft',status:'draft',from_address:account.address,...content,threat_status:'reviewed'});
 return rows?.[0];
}
function sendingReady(account){
 return process.env.QUANTUM_MAIL_LIVE_SEND_ENABLED==='true'&&Boolean(process.env.RESEND_API_KEY)&&
  account?.status==='verified'&&account?.outgoing_enabled===true&&Boolean(account?.verified_at);
}
async function sendDraft(ownerId,draftId,{confirm=false,transport=globalThis.fetch}={}){
 requireStorage();if(confirm!==true)throw fail('Explicit send confirmation required',409);
 if(!UUID.test(String(draftId||'')))throw fail('Invalid draft ID');
 const drafts=await supabase.select('quantum_mail_messages','id=eq.'+draftId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&direction=eq.draft&status=eq.draft&select=*&limit=1');
 const draft=drafts?.[0];if(!draft)throw fail('Draft not found or already processing',404);
 const account=await myAccount(ownerId,draft.from_address);
 if(!sendingReady(account))throw fail('Sending disabled: provider or verified mailbox is not configured',503);
 if(account.id!==draft.account_id)throw fail('Mailbox ownership mismatch',403);
 const suppressed=await supabase.select('quantum_mail_suppressions','owner_id=eq.'+encodeURIComponent(ownerId)+'&account_id=eq.'+encodeURIComponent(account.id)+'&select=recipient&limit=1000');
 if((suppressed||[]).some(row=>draft.to_addresses.includes(row.recipient)))throw fail('Recipient is suppressed due to bounce, complaint or abuse review',403);
 // Atomic single-claim compare-and-set. Never retry a "sending" row without provider reconciliation.
 const claimed=await supabase.update('quantum_mail_messages','id=eq.'+draftId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&status=eq.draft',{status:'sending',updated_at:new Date().toISOString()});
 if(claimed?.length!==1)throw fail('Another send attempt is in progress',409);
 const response=await transport('https://api.resend.com/emails',{method:'POST',headers:{
  Authorization:'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':'quantum-mail-'+draftId
 },body:JSON.stringify({from:account.address,to:draft.to_addresses,subject:draft.subject,text:draft.body_text})});
 const reply=await response.json().catch(()=>({}));
 if(!response.ok||!reply.id){
  // Leave "sending" for review to avoid duplicate external sends after ambiguous timeouts.
  throw fail('Provider response unconfirmed. Draft held for reconciliation; do not resend automatically',502);
 }
 const applied=await supabase.update('quantum_mail_messages','id=eq.'+draftId+'&owner_id=eq.'+encodeURIComponent(ownerId)+'&status=eq.sending',{
  direction:'outbound',status:'sent',provider_message_id:reply.id,updated_at:new Date().toISOString()
 });
 if(!applied?.length)throw fail('Provider accepted mail but database receipt was not recorded; reconcile before retry',502);
 return {provider:'resend',messageId:reply.id,status:'provider-accepted-not-delivered'};
}
module.exports={configured,requireStorage,addresses,validateDraft,myAccount,list,createDraft,sendingReady,sendDraft};
