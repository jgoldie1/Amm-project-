'use strict';

const crypto=require('crypto');
const supabase=require('./supabase-rest');

const DESTINATIONS=new Set(['reel','omnibox','all-american-network','servants-of-christ-network','creator-profile']);
const RELEASE_CHAIN=[
  'sign-in','passport','streetverse','mission','xp','get-paid-to-play','ledger',
  'reel-capture','green-screen-stickers','omni-box','share','creator-commerce',
  'stripe-purchase','server-verification','payable-balance'
];

function clean(value,max=160){return String(value||'').trim().slice(0,max)}
function isUuid(value){return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value||''))}

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
    if(!Array.isArray(profileRows)||!profileRows.length){
      await supabase.insert('users',{id:userId,name:user.displayName||user.email||'TRYAMM Player',email:user.email||null});
    }
    let stateRows=await supabase.select('player_state',`user_id=eq.${encodeURIComponent(userId)}&select=*`);
    if(!Array.isArray(stateRows)||!stateRows.length){
      stateRows=await supabase.insert('player_state',{user_id:userId,current_world_id:'streetverse',current_verse:'streetverse',xp:0,level:1,tokens:100,inventory:[],checkpoint:{},accessibility_profile:{},revision:0});
    }
    return {userId,state:Array.isArray(stateRows)?stateRows[0]:stateRows};
  }

  app.get('/api/passport',auth,async(req,res,next)=>{
    try{
      const {userId,state}=await ensurePassport(req.user);
      res.json({
        ok:true,
        passport:{
          userId,
          displayName:req.user.displayName||req.user.email||'TRYAMM Player',
          avatar:state?.avatar||{},avatarId:state?.avatar_id||null,
          world:state?.current_world_id||'streetverse',verse:state?.current_verse||'streetverse',
          xp:Number(state?.xp||0),level:Number(state?.level||1),holoCredits:Number(state?.tokens||0),
          inventory:Array.isArray(state?.inventory)?state.inventory:[],checkpoint:state?.checkpoint||{},
          accessibilityProfile:state?.accessibility_profile||{},revision:Number(state?.revision||0)
        }
      });
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

      const manifest=media.manifest&&typeof media.manifest==='object'?media.manifest:{};
      const uploadStatus=clean(manifest.upload_status,40);
      const hasRemoteAsset=Boolean(manifest.asset_url||manifest.storage_path||manifest.transcoded_url);
      const status=hasRemoteAsset&&uploadStatus!=='awaiting-upload'?'queued':'blocked';
      const errorCode=status==='blocked'?'MEDIA_ASSET_UPLOAD_REQUIRED':null;

      const inserted=await supabase.insert('media_publish_jobs',{
        media_id:media.id,owner_id:userId,destinations,status,
        moderation_status:'pending',monetization_status:'gated',error_code:errorCode
      });
      const job=Array.isArray(inserted)?inserted[0]:inserted;
      res.status(status==='blocked'?202:201).json({
        ok:true,job,
        next:status==='blocked'?'Upload the media asset to production storage, update media_catalog.manifest, then requeue publishing.':'Moderation/transcoding worker must process the queued job.'
      });
    }catch(error){next(error)}
  });

  app.get('/api/media/publish-jobs',auth,async(req,res,next)=>{
    try{
      const {userId}=await ensurePassport(req.user);
      const rows=await supabase.select('media_publish_jobs',`owner_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc&limit=100`);
      res.json({ok:true,jobs:Array.isArray(rows)?rows:[]});
    }catch(error){next(error)}
  });

  app.get('/api/release/readiness',(_req,res)=>{
    const stripe=Boolean(process.env.STRIPE_SECRET_KEY);
    const supabaseReady=supabase.configured();
    const model=Boolean(process.env.OPENAI_API_KEY||process.env.HOLOGPT_API_URL||process.env.OLLAMA_BASE_URL||process.env.STUBBS_EXECUTIVE_URL);
    const realGamePayouts=String(process.env.ENABLE_REAL_GAME_PAYOUTS||'').toLowerCase()==='true';
    res.json({
      ok:true,
      chain:RELEASE_CHAIN,
      gates:{
        applicationServer:'implemented',authentication:'implemented',passport:supabaseReady?'configured':'blocked',
        persistentState:supabaseReady?'configured':'blocked',streetverseMissions:supabaseReady?'implemented':'blocked',
        xpRewards:supabaseReady?'implemented':'blocked',getPaidToPlay:supabaseReady?'implemented':'blocked',
        reelCapture:'browser-backed',greenScreenStickers:'browser-backed-beta',omniBoxPublishing:supabaseReady?'server-queue-ready':'blocked',
        creatorCommerce:stripe?'configured':'blocked',stripePurchase:stripe?'configured':'blocked',serverVerification:stripe?'implemented':'blocked',
        payableBalance:stripe?'ledger-ready':'blocked',liveExternalPayouts:'blocked',holoGPT:model?'configured':'degraded',
        realGamePayouts:realGamePayouts?'cash-gated-enabled':'disabled'
      },
      productionGreen:false,
      productionGreenRule:'GREEN requires live authenticated end-to-end proof; source code and configuration alone are insufficient.'
    });
  });
};

module.exports.RELEASE_CHAIN=RELEASE_CHAIN;
