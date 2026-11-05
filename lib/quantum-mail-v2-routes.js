'use strict';
const mail=require('./quantum-mail-v2');
const inbound=require('./quantum-mail-inbound');
const db=require('./supabase-rest');
const enabled=()=>process.env.QUANTUM_MAIL_INBOUND_ENABLED==='true'&&Boolean(process.env.RESEND_WEBHOOK_SECRET)&&mail.configured();
module.exports=function registerQuantumMailV2({app,auth}){
 app.get('/api/mail/v2/status',auth,(_req,res)=>res.json({ok:true,storageEnabled:mail.configured(),provider:'resend',sendingEnabled:mail.configured()&&process.env.QUANTUM_MAIL_LIVE_SEND_ENABLED==='true'&&Boolean(process.env.RESEND_API_KEY),receivingEnabled:enabled(),productionCertified:false,mailDeliveryVerified:false,backupRestoreVerified:false,accountRecoveryVerified:false}));
 app.post('/api/mail/v2/accounts/request',auth,async(req,res,next)=>{try{
  mail.requireStorage();
  const projectId=String(req.body?.projectId||'');
  const alias=String(req.body?.localPart||'').trim().toLowerCase();
  if(!/^[0-9a-f-]{36}$/i.test(projectId)||!/^[a-z0-9][a-z0-9._+-]{0,62}$/.test(alias))return res.status(400).json({error:'Valid customer project and mailbox name required'});
  if(req.body?.domainControlConfirmed!==true)return res.status(400).json({error:'Domain account ownership confirmation required'});
  const projects=await db.select('website_brand_projects','id=eq.'+encodeURIComponent(projectId)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,cloud_setup&limit=1');
  const domain=String(projects?.[0]?.cloud_setup?.domain||'').toLowerCase();
  if(!domain)return res.status(409).json({error:'Save your approved cloud/domain plan first'});
  const address=alias+'@'+domain;
  const duplicates=await db.select('quantum_mail_accounts','address=eq.'+encodeURIComponent(address)+'&select=id&limit=1');
  if(duplicates?.length)return res.status(409).json({error:'Business mailbox request already exists'});
  const created=await db.insert('quantum_mail_accounts',{owner_id:req.user.id,address,domain,provider:'resend',status:'pending',incoming_enabled:false,outgoing_enabled:false});
  res.status(201).json({ok:true,account:created?.[0]&&{id:created[0].id,address,status:'pending'},notice:'Pending independent DNS and provider verification; not an active inbox'});
 }catch(e){next(e)}});
 app.get('/api/mail/v2/accounts',auth,async(req,res,next)=>{try{
  mail.requireStorage();
  const rows=await db.select('quantum_mail_accounts','owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,address,domain,provider,status,verified_at,incoming_enabled,outgoing_enabled&order=created_at.desc&limit=100');
  res.json({ok:true,accounts:rows||[]});
 }catch(e){next(e)}});
 app.get('/api/mail/v2/:box',auth,async(req,res,next)=>{try{res.json({ok:true,messages:await mail.list(req.user.id,req.params.box)})}catch(e){next(e)}});
 app.post('/api/mail/v2/drafts',auth,async(req,res,next)=>{try{res.status(201).json({ok:true,draft:await mail.createDraft(req.user.id,req.body||{})})}catch(e){next(e)}});
 app.post('/api/mail/v2/send/:id',auth,async(req,res,next)=>{try{
  const result=await mail.sendDraft(req.user.id,req.params.id,{confirm:req.body?.confirm===true});
  res.json({ok:true,...result});
 }catch(e){next(e)}});
 // Authenticated with provider HMAC, not application bearer token.
 // Must receive exact raw bytes from server.js express.json verify callback.
 app.post('/api/mail/v2/resend-webhook',async(req,res,next)=>{try{
  if(!enabled())return res.status(503).json({error:'Receiving is not enabled'});
  const event=inbound.verifySvix({raw:req.rawBody,id:req.get('svix-id'),timestamp:req.get('svix-timestamp'),signatures:req.get('svix-signature'),secret:process.env.RESEND_WEBHOOK_SECRET});
  const result=await inbound.processInbound({event,deliveryId:String(req.get('svix-id')),db});
  res.json({received:true,quarantined:result.quarantined===true,accepted:result.accepted||0,ignored:result.ignored===true});
 }catch(e){next(e)}});
};
