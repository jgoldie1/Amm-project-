'use strict';
// HoloVerse Artist Release Desk: encrypted at-rest pilot; NO external send/charge/distribution.
// Provide 32-byte key as 64 hex chars in HOLOVERSE_VAULT_KEY. Database/KMS and object
// storage needed before production use. Master audio upload is NOT supported here.
const crypto=require('crypto');
const KEY_ENV='HOLOVERSE_VAULT_KEY';
const TYPES=new Set(['sample','interpolation','beat','remix']);
const USES=new Set(['audio_stream','download','video_sync','film','game','radio','advertisement','live']);
const rx=/^[a-zA-Z0-9][a-zA-Z0-9:_-]{1,79}$/;
const str=(v,n=200)=>typeof v==='string'?v.trim().slice(0,n):'';
function key(){const x=process.env[KEY_ENV]||'';return /^[0-9a-fA-F]{64}$/.test(x)?Buffer.from(x,'hex'):null;}
function encrypt(obj,k){const iv=crypto.randomBytes(12),c=crypto.createCipheriv('aes-256-gcm',k,iv);const p=Buffer.concat([c.update(JSON.stringify(obj),'utf8'),c.final()]);return {iv:iv.toString('base64'),tag:c.getAuthTag().toString('base64'),ciphertext:p.toString('base64')};}
function decrypt(rec,k){const c=crypto.createDecipheriv('aes-256-gcm',k,Buffer.from(rec.iv,'base64'));c.setAuthTag(Buffer.from(rec.tag,'base64'));return JSON.parse(Buffer.concat([c.update(Buffer.from(rec.ciphertext,'base64')),c.final()]).toString('utf8'));}
function validate(b){const e=[];
 if(!str(b.releaseTitle,150)||!str(b.sourceTitle,150)||!str(b.sourceArtist,120))e.push('release_and_sample_titles_required');
 if(!TYPES.has(b.sampleType))e.push('sample_type_invalid');
 if(!Array.isArray(b.uses)||!b.uses.length||b.uses.some(x=>!USES.has(x)))e.push('use_scope_invalid');
 if(!str(b.territories,100)||!str(b.term,100))e.push('license_scope_required');
 if(!Number.isFinite(b.startSeconds)||!Number.isFinite(b.endSeconds)||b.startSeconds<0||b.endSeconds<=b.startSeconds)e.push('timecodes_invalid');
 if(!str(b.compositionOwner,200))e.push('composition_owner_required');
 if(b.usesOriginalRecording===true&&!str(b.masterOwner,200))e.push('master_owner_required');
 if(b.artistConsent!==true)e.push('consent_required');
 return e;
}
function safePublic(record){return {id:record.id,status:record.status,createdAt:record.createdAt,updatedAt:record.updatedAt,hasDocument:!!record.document,sendReceipt:!!record.sendReceipt,distributionStatus:record.distributionStatus||'not_requested'};}
module.exports=function registerHoloVerseArtistDesk({app,auth,id,getStore,saveStore}){
 const store=getStore();if(!Array.isArray(store.holoverseClearances))store.holoverseClearances=[];
 function gated(req,res,next){if(!key())return res.status(503).json({error:'Encrypted clearance storage is not configured'});next();}
 function own(req,res){const rec=store.holoverseClearances.find(x=>x.id===req.params.id);if(!rec){res.status(404).json({error:'Not found'});return null;}if(rec.ownerId!==req.user.id&&req.user.role!=='admin'){res.status(403).json({error:'Not authorized'});return null;}return rec;}
 app.get('/api/holoverse/desk/status',auth,(_req,res)=>res.json({encryptedStorageConfigured:!!key(),externalSubmissionEnabled:false,externalDistributionEnabled:false,paymentsEnabled:false}));
 app.post('/api/holoverse/desk/clearances',auth,gated,async(req,res)=>{
  if(!req.user.isCreator&&req.user.role!=='admin')return res.status(403).json({error:'Creator access required'});
  const b=req.body||{},errors=validate(b);if(errors.length)return res.status(400).json({errors});
  const now=new Date().toISOString(),cid=id('clear'),detail={...b,artistId:req.user.id,requestId:cid,recipientContact:str(b.recipientContact,200),recipientName:str(b.recipientName,150),artistApprovedSubmission:false,rightsOwnerVerified:false,masterApproval:null,compositionApproval:null};
  const record={id:cid,ownerId:req.user.id,status:'draft',sealed:encrypt(detail,key()),history:[{at:now,event:'draft_created'}],createdAt:now,updatedAt:now,distributionStatus:'not_requested'};
  store.holoverseClearances.push(record);await saveStore();res.status(201).json({clearance:safePublic(record)});
 });
 app.get('/api/holoverse/desk/clearances',auth,gated,(req,res)=>res.json({clearances:store.holoverseClearances.filter(x=>x.ownerId===req.user.id||req.user.role==='admin').map(safePublic)}));
 app.get('/api/holoverse/desk/clearances/:id',auth,gated,(req,res)=>{const rec=own(req,res);if(!rec)return;try{res.json({clearance:safePublic(rec),details:decrypt(rec.sealed,key()),history:rec.history});}catch{return res.status(500).json({error:'Encrypted record could not be read'})}});
 // Document upload: narrow JSON base64 pilot, NOT a full music file uploader. No arbitrary file names/paths.
 app.post('/api/holoverse/desk/clearances/:id/document',auth,gated,async(req,res)=>{
  const rec=own(req,res);if(!rec)return;if(rec.ownerId!==req.user.id)return res.status(403).json({error:'Artist owner required'});
  if(!['draft','review_pending'].includes(rec.status))return res.status(409).json({error:'Cannot change documents after submission'});
  const {dataBase64,mimeType}=req.body||{};
  if(!['application/pdf','image/png','image/jpeg'].includes(mimeType)||typeof dataBase64!=='string'||dataBase64.length>1400000||!/^[a-zA-Z0-9+/]+={0,2}$/.test(dataBase64))return res.status(400).json({error:'PDF/JPG/PNG only, maximum 1 MiB'});
  const bytes=Buffer.from(dataBase64,'base64');if(bytes.length>1048576||!bytes.length)return res.status(400).json({error:'Document size invalid'});
  const magicPdf=bytes.subarray(0,5).toString()==='%PDF-',magicPng=bytes.subarray(0,8).equals(Buffer.from('89504e470d0a1a0a','hex')),magicJpg=bytes.subarray(0,3).equals(Buffer.from('ffd8ff','hex'));
  if(!(mimeType==='application/pdf'&&magicPdf||mimeType==='image/png'&&magicPng||mimeType==='image/jpeg'&&magicJpg))return res.status(400).json({error:'File signature does not match type'});
  rec.document=encrypt({mimeType,dataBase64,sha256:crypto.createHash('sha256').update(bytes).digest('hex')},key());rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'encrypted_document_stored'});await saveStore();res.json({stored:true,sha256:crypto.createHash('sha256').update(bytes).digest('hex'),antivirusScanned:false,productionUploadReady:false});
 });
 // Correspondence is a DRAFT with human approval. NO email or third-party action is attempted.
 app.post('/api/holoverse/desk/clearances/:id/correspondence',auth,gated,async(req,res)=>{
  const rec=own(req,res);if(!rec)return;if(rec.ownerId!==req.user.id)return res.status(403).json({error:'Artist owner required'});
  const detail=decrypt(rec.sealed,key());
  const recipient=str(req.body?.recipient,200),subject=str(req.body?.subject,160),message=str(req.body?.message,6000);
  if(!recipient||!subject||!message)return res.status(400).json({error:'Recipient, subject and message required'});
  if(!rec.correspondence)rec.correspondence=[];
  const mid=id('msg');rec.correspondence.push({id:mid,sealed:encrypt({recipient,subject,message},key()),status:'draft_not_sent',createdAt:new Date().toISOString()});
  rec.status='review_pending';rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'correspondence_drafted',messageId:mid});await saveStore();
  res.status(201).json({messageId:mid,status:'draft_not_sent',release:detail.releaseTitle});
 });
 // Artist approvals to contact, and verified owner contact evidence, are separate.
 app.post('/api/holoverse/desk/clearances/:id/authorize-submission',auth,gated,async(req,res)=>{
  const rec=own(req,res);if(!rec)return;if(rec.ownerId!==req.user.id)return res.status(403).json({error:'Artist owner required'});
  if(req.body?.approved!==true)return res.status(400).json({error:'Explicit approval required'});
  rec.artistApprovedSubmission=true;rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'artist_authorized_request'});await saveStore();res.json({authorized:true,dispatched:false});
 });
 // Admin records external evidence; never claims that this API itself sent a request.
 app.post('/api/holoverse/desk/clearances/:id/record-submission',auth,gated,async(req,res)=>{
  if(req.user.role!=='admin')return res.status(403).json({error:'Operator access required'});
  const rec=own(req,res);if(!rec)return;
  if(!rec.artistApprovedSubmission)return res.status(409).json({error:'Artist has not authorized correspondence'});
  const receipt=str(req.body?.externalReceiptId,200),channel=str(req.body?.channel,50);
  if(!receipt||!['rights_portal','manual_email','legal_counsel'].includes(channel)||req.body?.ownerVerified!==true)return res.status(400).json({error:'Verified rights owner and actual submission receipt required'});
  rec.sendReceipt={receipt,channel,recordedBy:req.user.id,at:new Date().toISOString()};rec.status='submitted';rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'external_submission_recorded'});await saveStore();res.json({submitted:true,actualExternalSend:false});
 });
 app.post('/api/holoverse/desk/clearances/:id/review',auth,gated,async(req,res)=>{
  if(req.user.role!=='admin')return res.status(403).json({error:'Operator access required'});
  const rec=own(req,res);if(!rec)return;
  if(!rec.sendReceipt)return res.status(409).json({error:'Actual submission receipt required'});
  const b=req.body||{},uses=decrypt(rec.sealed,key()).uses;
  const valid=a=>a&&a.verified===true&&str(a.agreementRef)&&str(a.owner)&&/^\d{4}-\d{2}-\d{2}$/.test(a.expiresOn||'')&&a.expiresOn>=new Date().toISOString().slice(0,10)&&Array.isArray(a.permittedUses)&&uses.every(u=>a.permittedUses.includes(u));
  const original=decrypt(rec.sealed,key()).usesOriginalRecording===true;
  if(!valid(b.compositionApproval)||(original&&!valid(b.masterApproval)))return res.status(400).json({error:'Signed and verified permissions are required for all uses'});
  rec.approval=encrypt({masterApproval:original?b.masterApproval:null,compositionApproval:b.compositionApproval},key());rec.status='cleared';rec.distributionStatus='artist_approval_required';rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'operator_verified_signed_rights',reviewerId:req.user.id});await saveStore();res.json({clearance:safePublic(rec)});
 });
 // Real DSP delivery always disabled until partner integration and business authority is established.
 app.post('/api/holoverse/desk/clearances/:id/distribution-approval',auth,gated,async(req,res)=>{
  const rec=own(req,res);if(!rec)return;if(rec.ownerId!==req.user.id)return res.status(403).json({error:'Artist owner required'});
  if(rec.status!=='cleared'||!rec.approval)return res.status(409).json({error:'Sample rights are not cleared'});
  if(req.body?.approved!==true)return res.status(400).json({error:'Explicit artist distribution approval required'});
  rec.distributionStatus='sandbox_ready';rec.updatedAt=new Date().toISOString();rec.history.push({at:rec.updatedAt,event:'artist_approved_sandbox_distribution'});await saveStore();res.json({status:'sandbox_ready',deliveredToDSP:false,paymentCharged:false});
 });
};
