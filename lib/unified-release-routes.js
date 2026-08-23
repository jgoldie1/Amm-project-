'use strict';

const crypto=require('crypto');
const supabase=require('./supabase-rest');

const DESTINATIONS=new Set(['reel','omnibox','all-american-network','servants-of-christ-network','creator-profile']);
const RELEASE_CHAIN=[
  'sign-in','passport','streetverse','mission','xp','get-paid-to-play','ledger',
  'reel-capture','green-screen-stickers','omni-box','share','creator-commerce',
  'stripe-purchase','server-verification','payable-balance'
];
const MEDIA_BUCKET='creator-media';
const MAX_MEDIA_BYTES=1024*1024*1024;
const ALLOWED_MEDIA_TYPES=new Set(['video/mp4','video/webm','image/jpeg','image/png','image/webp','image/gif']);

function clean(value,max=160){return String(value||'').trim().slice(0,max)}
function isUuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''))}
function safeFileName(value){
  const raw=clean(value,180).replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/^-+|-+$/g,'');
  return raw||'tryamm-media.webm';
}
function storagePathUrl(path){return String(path||'').split('/').map(encodeURIComponent).join('/')}
function storageConfig(){
  const url=String(process.env.SUPABASE_URL||'').replace(/\/$/,'');
  const key=String(process.env.SUPABASE_SERVICE_ROLE_KEY||'');
  if(!url||!key)throw Object.assign(new Error('Supabase Storage is not configured'),{status:503,code:'SUPABASE_NOT_CONFIGURED'});
  return {url,key};
}
async function storageJson(url,options={}){
  const response=await fetch(url,options);
  const text=await response.text();
  let data={};
  try{data=text?JSON.parse(text):{}}catch{data={text}}
  if(!response.ok)throw Object.assign(new Error(data?.message||data?.error||`Storage request failed (${response.status})`),{status:response.status,details:data});
  return data;
}
async function createSignedUpload(path){
  const {url,key}=storageConfig();
  const data=await storageJson(`${url}/storage/v1/object/upload/sign/${MEDIA_BUCKET}/${storagePathUrl(path)}`,{
    method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:'{}'
  });
  const relative=String(data.url||'');
  const signedUrl=relative.startsWith('http')?relative:`${url}/storage/v1${relative}`;
  const token=new URL(signedUrl).searchParams.get('token');
  if(!token)throw Object.assign(new Error('Storage did not return a signed upload token'),{status:502});
  return {signedUrl,token};
}
async function verifyStoredObject(path){
  const {url,key}=storageConfig();
  const response=await fetch(`${url}/storage/v1/object/authenticated/${MEDIA_BUCKET}/${storagePathUrl(path)}`,{
    method:'HEAD',headers:{apikey:key,Authorization:`Bearer ${key}`}
  });
  if(response.status===404)return false;
  if(!response.ok)throw Object.assign(new Error(`Storage verification failed (${response.status})`),{status:response.status});
  return true;
}
async function createSignedPlayback(path,expiresIn=3600){
  const {url,key}=storageConfig();
  const data=await storageJson(`${url}/storage/v1/object/sign/${MEDIA_BUCKET}/${storagePathUrl(path)}`,{
    method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json'},body:JSON.stringify({expiresIn})
  });
  const relative=String(data.signedURL||data.signedUrl||'');
  if(!relative)throw Object.assign(new Error('Storage did not return a playback URL'),{status:502});
  return relative.startsWith('http')?relative:`${url}/storage/v1${relative}`;
}

module.exports=function registerUnifiedReleaseRoutes({app,auth,getStore,saveStore}){
  async function ensureDurableIdentity(user){
    if(!supabase.configured())throw Object.assign(new Error('Supabase durable state is not configured'),{status:503,code:'SUPABASE_NOT_CONFIGURED'});
    if(user.supabaseUserId&&isUuid(user.supabaseUserId))return user.supabaseUserId;
    if(isUuid(user.id))return user.id;
    const existing=getStore().users?.find(row=>row.id===user.id);
    if(existing?.supabaseUserId&&isUuid(existing.supabaseUserId))return existing.supabaseUserId;
    const password=`${crypto.randomBytes(24).toString('base64url')}Aa1!`;
    const created=await supabase.auth.createUser({email:user.email,password,displayName:user.displayName});
    const userId=created?.id||created?.user?.id;
    if(!isUuid(userId))throw Object.assign(new Error('Supabase identity creation returned no valid user id'),{status:502});
    if(existing){existing.supabaseUserId=userId;await saveStore()}
    return userId;
  }

  async function ensurePassport(user){
    const userId=await ensureDurableIdentity(user);
    const profileRows=await supabase.select('users',`id=eq.${encodeURIComponent(userId)}&select=*`);
    if(!Array.isArray(profileRows)||!profileRows.length){await supabase.insert('users',{id:userId,name:user.displayName||user.email||'TRYAMM Player',email:user.email||null})}
    let stateRows=await supabase.select('player_state',`user_id=eq.${encodeURIComponent(userId)}&select=*`);
    if(!Array.isArray(stateRows)||!stateRows.length){stateRows=await supabase.insert('player_state',{user_id:userId,current_world_id:'streetverse',current_verse:'streetverse',xp:0,level:1,tokens:100,inventory:[],checkpoint:{},accessibility_profile:{},revision:0})}
    return {userId,state:Array.isArray(stateRows)?stateRows[0]:stateRows};
  }

  app.get('/api/passport',auth,async(req,res,next)=>{
    try{
      const {userId,state}=await ensurePassport(req.user);
      res.json({ok:true,passport:{userId,displayName:req.user.displayName||req.user.email||'TRYAMM Player',avatar:state?.avatar||'',avatarId:state?.avatar_id||null,world:state?.current_world_id||'streetverse',verse:state?.current_verse||'streetverse',xp:Number(state?.xp||0),level:Number(state?.level||1),holoCredits:Number(state?.tokens||0),inventory:Array.isArray(state?.inventory)?state.inventory:[],checkpoint:state?.checkpoint||{},accessibilityProfile:state?.accessibility_profile||{},revision:Number(state?.revision||0)}});
    }catch(error){next(error)}
  });

  app.post('/api/media/upload-intent',auth,async(req,res,next)=>{
    try{
      const {userId}=await ensurePassport(req.user);
      const fileName=safeFileName(req.body?.fileName);
      const contentType=clean(req.body?.contentType,100).toLowerCase();
      const sizeBytes=Math.max(0,Number(req.body?.sizeBytes||0));
      const title=clean(req.body?.title,160)||'TRYAMM Reel';
      const mediaType=contentType==='image/gif'?'gif':contentType.startsWith('image/')?'image':'reel';
      if(!ALLOWED_MEDIA_TYPES.has(contentType))return res.status(415).json({error:'Unsupported creator media type',allowed:[...ALLOWED_MEDIA_TYPES]});
      if(!sizeBytes||sizeBytes>MAX_MEDIA_BYTES)return res.status(413).json({error:'Media file must be between 1 byte and 1 GB'});
      const objectPath=`${userId}/${crypto.randomUUID()}/${fileName}`;
      const signed=await createSignedUpload(objectPath);
      const manifest={caption:clean(req.body?.caption,2000),destinations:[],source:'tryamm-media-studio',upload_status:'signed-upload-issued',storage_bucket:MEDIA_BUCKET,storage_path:objectPath,content_type:contentType,size_bytes:sizeBytes,transcode_status:'pending-verification'};
      const inserted=await supabase.insert('media_catalog',{owner_id:userId,brand:'TRYAMM',title,media_type:mediaType,rights_status:'original',visibility:'private',manifest,moderation_status:'pending',processing_status:'uploading',storage_bucket:MEDIA_BUCKET,storage_path:objectPath,content_type:contentType,size_bytes:sizeBytes});
      const media=Array.isArray(inserted)?inserted[0]:inserted;
      res.status(201).json({ok:true,media,upload:{url:signed.signedUrl,token:signed.token,path:objectPath,bucket:MEDIA_BUCKET,method:'PUT',expiresInSeconds:7200}});
    }catch(error){next(error)}
  });

  app.post('/api/media/upload-complete',auth,async(req,res,next)=>{
    try{
      const {userId}=await ensurePassport(req.user);
      const mediaId=clean(req.body?.mediaId,100);
      const rows=await supabase.select('media_catalog',`id=eq.${encodeURIComponent(mediaId)}&owner_id=eq.${encodeURIComponent(userId)}&select=*`);
      const media=Array.isArray(rows)?rows[0]:null;
      if(!media)return res.status(404).json({error:'Media item not found'});
      const objectPath=clean(media.storage_path||media.manifest?.storage_path,800);
      if(!objectPath)return res.status(409).json({error:'Media has no storage path'});
      if(!await verifyStoredObject(objectPath))return res.status(409).json({error:'Uploaded object is not present in production storage',code:'UPLOAD_NOT_FOUND'});
      const webNative=ALLOWED_MEDIA_TYPES.has(String(media.content_type||''));
      const manifest={...(media.manifest||{}),upload_status:'uploaded',storage_bucket:MEDIA_BUCKET,storage_path:objectPath,transcode_status:webNative?'not-required-web-native':'required'};
      const updated=await supabase.update('media_catalog',`id=eq.${encodeURIComponent(media.id)}&owner_id=eq.${encodeURIComponent(userId)}`,{manifest,processing_status:webNative?'ready':'processing',processing_error:null,updated_at:new Date().toISOString()});
      const playbackUrl=await createSignedPlayback(objectPath,3600);
      res.json({ok:true,media:Array.isArray(updated)?updated[0]:updated,processing:webNative?'ready':'processing',playbackUrl,notice:webNative?'Web-native asset verified; server transcoding is not required for this format.':'Asset requires a dedicated transcoding worker before publication.'});
    }catch(error){next(error)}
  });

  app.get('/api/media/:mediaId/playback',auth,async(req,res,next)=>{
    try{
      const {userId}=await ensurePassport(req.user);
      const rows=await supabase.select('media_catalog',`id=eq.${encodeURIComponent(clean(req.params.mediaId,100))}&owner_id=eq.${encodeURIComponent(userId)}&select=*`);
      const media=Array.isArray(rows)?rows[0]:null;
      if(!media)return res.status(404).json({error:'Media item not found'});
      const objectPath=clean(media.storage_path||media.manifest?.storage_path,800);
      const playbackUrl=await createSignedPlayback(objectPath,3600);
      res.json({ok:true,playbackUrl,expiresInSeconds:3600});
    }catch(error){next(error)}
  });

  app.post('/api/media/publish',auth,async(req,res,next)=>{
    try{
      const {userId}=await ensurePassport(req.user);
      const mediaId=clean(req.body?.mediaId,100);
      if(!mediaId)return res.status(400).json({error:'mediaId is required'});
      const mediaRows=await supabase.select('media_catalog',`id=eq.${encodeURIComponent(mediaId)}&owner_id=eq.${encodeURIComponent(userId)}&select=*`);
      const media=Array.isArray(mediaRows)?mediaRows[0]:null;
      if(!media)return res.status(404).json({error:'Media item not found'});
      const requested=Array.isArray(req.body?.destinations)?req.body.destinations:[];
      const destinations=[...new Set(requested.map(x=>clean(x,80)).filter(x=>DESTINATIONS.has(x)))];
      if(!destinations.length)return res.status(400).json({error:'Choose at least one supported destination'});
      const ready=media.processing_status==='ready'&&Boolean(media.storage_path||media.manifest?.storage_path);
      const status=ready?'queued':'blocked';
      const errorCode=ready?null:'MEDIA_PROCESSING_NOT_READY';
      const inserted=await supabase.insert('media_publish_jobs',{media_id:media.id,owner_id:userId,destinations,status,moderation_status:'pending',monetization_status:'gated',error_code:errorCode});
      const job=Array.isArray(inserted)?inserted[0]:inserted;
      res.status(status==='blocked'?202:201).json({ok:true,job,next:status==='blocked'?'Complete production upload/processing before publishing.':'Publishing job queued for moderation and destination delivery.'});
    }catch(error){next(error)}
  });

  app.get('/api/media/publish-jobs',auth,async(req,res,next)=>{
    try{const {userId}=await ensurePassport(req.user);const rows=await supabase.select('media_publish_jobs',`owner_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`);res.json({ok:true,jobs:Array.isArray(rows)?rows:[]})}catch(error){next(error)}
  });

  app.get('/api/release/readiness',(_req,res)=>{
    const stripe=Boolean(process.env.STRIPE_SECRET_KEY),supabaseReady=supabase.configured(),model=Boolean(process.env.OPENAI_API_KEY||process.env.HOLOGPT_API_URL||process.env.OLLAMA_BASE_URL||process.env.STUBBS_EXECUTIVE_URL),realGamePayouts=String(process.env.ENABLE_REAL_GAME_PAYOUTS||'').toLowerCase()==='true';
    res.json({ok:true,chain:RELEASE_CHAIN,gates:{applicationServer:'implemented',authentication:'implemented',passport:supabaseReady?'configured':'blocked',persistentState:supabaseReady?'configured':'blocked',streetverseMissions:supabaseReady?'implemented':'blocked',xpRewards:supabaseReady?'implemented':'blocked',getPaidToPlay:supabaseReady?'implemented':'blocked',reelCapture:'browser-backed',greenScreenStickers:'browser-backed-beta',mediaStorage:supabaseReady?'signed-upload-ready':'blocked',mediaProcessing:supabaseReady?'web-native-normalization-ready':'blocked',omniBoxPublishing:supabaseReady?'server-queue-ready':'blocked',creatorCommerce:stripe?'configured':'blocked',stripePurchase:stripe?'configured':'blocked',serverVerification:stripe?'implemented':'blocked',payableBalance:stripe?'ledger-ready':'blocked',liveExternalPayouts:'blocked',holoGPT:model?'configured':'degraded',realGamePayouts:realGamePayouts?'cash-gated-enabled':'disabled'},productionGreen:false,productionGreenRule:'GREEN requires live authenticated end-to-end proof; source code and configuration alone are insufficient.'});
  });
};

module.exports.RELEASE_CHAIN=RELEASE_CHAIN;
