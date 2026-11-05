'use strict';
// Restored and hardened from agent/quantum-internet-mail / lib/tryamm-mail-routes.js.
// Draft operations are authenticated and user-scoped; actual transport remains disabled
// until externally certified durable storage and mail sender configuration exist.
const crypto=require('node:crypto');
const scrub=(v,max=200)=>String(v??'').trim().slice(0,max);
const VALID_EMAIL=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function ensure(store){store.tryammMail||={messages:[],drafts:[],rules:[]};return store.tryammMail}
function sanitized(d){return {id:d.id,to:d.to,cc:d.cc,bcc:d.bcc,subject:d.subject,body:d.body,updatedAt:d.updatedAt,status:d.status}}
function validateDraft(raw={}){
 const to=scrub(raw.to,300);
 if(!to||!to.split(',').every(x=>VALID_EMAIL.test(x.trim())))throw Object.assign(new Error('Valid recipient email required'),{status:400});
 const cc=scrub(raw.cc,300),bcc=scrub(raw.bcc,300);
 for(const field of [cc,bcc])if(field&&!field.split(',').every(x=>VALID_EMAIL.test(x.trim())))throw Object.assign(new Error('Invalid CC or BCC email'),{status:400});
 const subject=scrub(raw.subject,180),body=scrub(raw.body,12000);
 if(!subject||!body)throw Object.assign(new Error('Subject and message body required'),{status:400});
 return {to,cc,bcc,subject,body};
}
module.exports=function registerTryammQuantumMail({app,auth,getStore,saveStore}){
 app.get('/api/mail/status',auth,(_req,res)=>res.json({ok:true,brand:'TRYAMM Mail',internalCodename:'Quantum Mail',draftsAvailable:true,mailboxHostingVerified:false,transportConfigured:false,sendingEnabled:false,aiMayDraft:true,aiMaySend:false,persistence:'local-development-store; production not certified'}));
 app.get('/api/mail/drafts',auth,(req,res)=>res.json({ok:true,drafts:ensure(getStore()).drafts.filter(d=>d.ownerId===req.user.id).map(sanitized)}));
 app.post('/api/mail/drafts',auth,async(req,res,next)=>{try{
  const draft={...validateDraft(req.body||{}),id:'maildraft_'+crypto.randomUUID(),ownerId:req.user.id,updatedAt:new Date().toISOString(),status:'draft'};
  const store=ensure(getStore());if(store.drafts.filter(d=>d.ownerId===req.user.id).length>=100)return res.status(429).json({error:'Draft limit reached'});
  store.drafts.push(draft);await saveStore();res.status(201).json({ok:true,draft:sanitized(draft)});
 }catch(e){next(e)}});
 app.put('/api/mail/drafts/:id',auth,async(req,res,next)=>{try{
  const draft=ensure(getStore()).drafts.find(d=>d.id===req.params.id&&d.ownerId===req.user.id);
  if(!draft)return res.status(404).json({error:'Draft not found'});
  Object.assign(draft,validateDraft(req.body||{}),{updatedAt:new Date().toISOString()});
  await saveStore();res.json({ok:true,draft:sanitized(draft)});
 }catch(e){next(e)}});
 app.post('/api/mail/send/:id',auth,(req,res)=>res.status(503).json({error:'Mail sending disabled until verified provider, consent, durable storage, and transport testing',code:'MAIL_TRANSPORT_NOT_CERTIFIED'}));
 app.post('/api/mail/ai-assist',auth,(req,res)=>res.json({ok:true,task:scrub(req.body?.task,150),policy:{mayDraft:true,maySummarize:true,maySuggestReplies:true,maySend:false,mayDelete:false},status:'AI provider execution not wired or verified'}));
};
module.exports.validateDraft=validateDraft;
module.exports.ensure=ensure;
