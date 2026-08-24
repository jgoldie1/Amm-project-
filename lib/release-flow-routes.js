'use strict';

const fs=require('fs');
const path=require('path');

const FLOW=[
  ['sign_in','SIGN IN'],['passport','PASSPORT'],['streetverse','STREETVERSE'],['mission','MISSION'],['xp','XP'],['get_paid_to_play','GET PAID TO PLAY'],['ledger','LEDGER'],['reel_capture','REEL CAPTURE'],['green_screen_stickers','GREEN SCREEN/STICKERS'],['omni_box','OMNI BOX'],['share','SHARE'],['creator_commerce','CREATOR COMMERCE'],['stripe_purchase','STRIPE PURCHASE'],['server_verification','SERVER VERIFICATION'],['payable_balance','PAYABLE BALANCE']
];

function exists(root,file){try{return fs.existsSync(path.join(root,file))}catch{return false}}
function env(name){return Boolean(String(process.env[name]||'').trim())}

function capabilitySnapshot(root=path.join(__dirname,'..')){
  const supabaseReady=env('SUPABASE_URL')&&env('SUPABASE_SERVICE_ROLE_KEY');
  const stripeReady=env('STRIPE_SECRET_KEY');
  const checks={
    sign_in:{implemented:true,configured:true,evidence:'server.js /api/auth/register + /api/auth/login'},
    passport:{implemented:exists(root,'lib/durable-state-routes.js'),configured:supabaseReady,evidence:'durable player_state + accessibility profile'},
    streetverse:{implemented:exists(root,'lib/durable-state-routes.js'),configured:supabaseReady,evidence:'/api/streetverse/missions'},
    mission:{implemented:exists(root,'lib/durable-state-routes.js'),configured:supabaseReady,evidence:'mission run create/update'},
    xp:{implemented:exists(root,'lib/get-paid-to-play-routes.js'),configured:supabaseReady,evidence:'server-applied player_state XP'},
    get_paid_to_play:{implemented:exists(root,'lib/get-paid-to-play-routes.js'),configured:supabaseReady,evidence:'evidence-gated reward claim'},
    ledger:{implemented:exists(root,'lib/get-paid-to-play-routes.js')&&exists(root,'lib/payment-routes.js'),configured:true,evidence:'gameRewardLedger + creatorLedger'},
    reel_capture:{implemented:exists(root,'lib/durable-state-routes.js'),configured:supabaseReady,evidence:'media_catalog supports reel/live-replay records'},
    green_screen_stickers:{implemented:exists(root,'amm-omniverse/src/components/MediaStudioLauncher.tsx'),configured:true,evidence:'Media Studio composition layer present; live device proof still required'},
    omni_box:{implemented:exists(root,'amm-omniverse/src/components/MediaStudioLauncher.tsx'),configured:supabaseReady,evidence:'media destinations/manifest; production publish proof required'},
    share:{implemented:exists(root,'lib/publishing-network-routes.js'),configured:true,evidence:'publishing/network API plus media destinations'},
    creator_commerce:{implemented:true,configured:true,evidence:'creator activation + rooms + checkout'},
    stripe_purchase:{implemented:exists(root,'lib/payment-routes.js'),configured:stripeReady,evidence:'Stripe checkout + payment routes'},
    server_verification:{implemented:exists(root,'lib/payment-routes.js'),configured:stripeReady,evidence:'server retrieves Stripe session/event before ledger credit'},
    payable_balance:{implemented:exists(root,'lib/payment-routes.js'),configured:stripeReady,evidence:'creator payableBalanceCents + /api/creator/earnings'}
  };
  const gates=FLOW.map(([id,label])=>({id,label,...checks[id],state:checks[id].implemented&&checks[id].configured?'READY_FOR_LIVE_PROOF':checks[id].implemented?'BLOCKED_CONFIGURATION':'MISSING_IMPLEMENTATION'}));
  return {
    ok:true,
    version:'tryamm-release-flow-v1',
    gates,
    counts:{total:gates.length,readyForLiveProof:gates.filter(x=>x.state==='READY_FOR_LIVE_PROOF').length,blockedConfiguration:gates.filter(x=>x.state==='BLOCKED_CONFIGURATION').length,missingImplementation:gates.filter(x=>x.state==='MISSING_IMPLEMENTATION').length},
    productionGreen:gates.every(x=>x.state==='READY_FOR_LIVE_PROOF')?false:false,
    greenRule:'Production GREEN requires live authenticated end-to-end proof; static capability/configuration checks are not sufficient.'
  };
}

module.exports=function registerReleaseFlowRoutes({app,auth,getStore}){
  app.get('/api/release/flow/status',(_req,res)=>res.json(capabilitySnapshot()));
  app.get('/api/release/flow',auth,(req,res)=>{
    const store=getStore();
    const rewards=(store.gameRewardClaims||[]).filter(x=>x.userId===req.user.id||x.userId===req.user.supabaseUserId);
    const ledger=(store.creatorLedger||[]).filter(x=>x.creatorId===req.user.id);
    const purchases=(store.purchases||[]).filter(x=>x.buyerId===req.user.id||x.creatorId===req.user.id);
    const base=capabilitySnapshot();
    res.json({...base,user:{id:req.user.id,isCreator:Boolean(req.user.isCreator),rewardClaims:rewards.length,creatorLedgerEntries:ledger.length,purchases:purchases.length,payableBalanceCents:Number(req.user.payableBalanceCents||0)},proofState:'AUTHENTICATED_RUNTIME_REACHED'});
  });
};

module.exports.capabilitySnapshot=capabilitySnapshot;
module.exports.FLOW=FLOW;
