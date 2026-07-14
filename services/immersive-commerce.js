const crypto=require('crypto');
function id(prefix){return `${prefix}_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;}
function money(value){const n=Number(value);if(!Number.isFinite(n)||n<0)throw new Error('Invalid price.');return Math.round(n*100)/100;}

const TRY_ON_MODES={
  outfit:{tracking:['body-pose','segmentation'],surfaces:['mobile-ar','mirror','vr-avatar'],requiresConsent:true},
  shoes:{tracking:['feet','floor-plane'],surfaces:['mobile-ar','mirror'],requiresConsent:true},
  glasses:{tracking:['face-landmarks'],surfaces:['mobile-ar','mirror'],requiresConsent:true},
  jewelry:{tracking:['face-landmarks','hand-tracking'],surfaces:['mobile-ar','mirror'],requiresConsent:true},
  furniture:{tracking:['plane-detection','room-mesh'],surfaces:['mobile-ar','mixed-reality'],requiresConsent:false},
  art:{tracking:['wall-plane'],surfaces:['mobile-ar','mixed-reality'],requiresConsent:false},
  vehicle:{tracking:['ground-plane','scale-preview'],surfaces:['mobile-ar','vr-showroom'],requiresConsent:false}
};

function normalizeProduct(input={}){
  const type=String(input.tryOnType||'outfit');
  if(!TRY_ON_MODES[type])throw new Error('Unsupported try-on type.');
  return {id:String(input.id||id('product')),title:String(input.title||'Untitled product').slice(0,180),price:money(input.price||0),currency:String(input.currency||'USD').toUpperCase(),tryOnType:type,modelUrl:input.modelUrl?String(input.modelUrl):null,images:Array.isArray(input.images)?input.images.slice(0,8).map(String):[],sizes:Array.isArray(input.sizes)?input.sizes.slice(0,30).map(String):[],inventory:Math.max(0,Math.floor(Number(input.inventory)||0)),metadata:input.metadata||{},active:input.active!==false};
}

function createTryOnSession({userId,product,device={}}){
  const normalized=normalizeProduct(product);
  const mode=TRY_ON_MODES[normalized.tryOnType];
  return {id:id('tryon'),userId:String(userId||'guest'),product:normalized,mode,device:{camera:Boolean(device.camera),webxr:Boolean(device.webxr),handTracking:Boolean(device.handTracking),bodyTracking:Boolean(device.bodyTracking)},privacy:{storeRawCamera:false,storeBiometrics:false,consentRequired:mode.requiresConsent,consentGranted:false},status:'created',createdAt:new Date().toISOString()};
}

function createDrop({productId,title,startsAt,endsAt,inventory,perUserLimit=1}){
  const start=new Date(startsAt);const end=new Date(endsAt);
  if(Number.isNaN(start.valueOf())||Number.isNaN(end.valueOf())||end<=start)throw new Error('Invalid drop window.');
  return {id:id('drop'),productId:String(productId),title:String(title||'Limited drop'),startsAt:start.toISOString(),endsAt:end.toISOString(),inventory:Math.max(0,Math.floor(Number(inventory)||0)),perUserLimit:Math.max(1,Math.floor(Number(perUserLimit)||1)),sold:0,status:'scheduled',ethicalUrgency:{showRealInventoryOnly:true,noFakeViewers:true,noFakeCountdown:true}};
}

function createQuest({title,steps=[],reward={type:'points',amount:100},expiresAt=null}){
  return {id:id('quest'),title:String(title||'Marketplace Quest'),steps:steps.slice(0,12).map((step,index)=>({id:`step_${index+1}`,label:String(step.label||step),action:String(step.action||'view'),targetId:step.targetId?String(step.targetId):null,completed:false})),reward:{type:String(reward.type||'points'),amount:Number(reward.amount)||0},expiresAt:expiresAt?new Date(expiresAt).toISOString():null,status:'active',createdAt:new Date().toISOString()};
}

function loyaltyState({userId,points=0,streak=0,purchases=0,quests=0}){
  const p=Math.max(0,Math.floor(Number(points)||0));
  const tier=p>=25000?'diamond':p>=10000?'platinum':p>=4000?'gold':p>=1000?'silver':'bronze';
  return {userId:String(userId),points:p,tier,streak:Math.max(0,Number(streak)||0),purchases:Math.max(0,Number(purchases)||0),quests:Math.max(0,Number(quests)||0),benefits:{bronze:['quests'],silver:['early-access'],gold:['creator-drops','bonus-points'],platinum:['vip-events','priority-support'],diamond:['private-showrooms','annual-reward']}[tier]};
}

function socialProof({verifiedPurchases=0,wishlists=0,liveTryOns=0,rating=null}){
  return {verifiedPurchases:Math.max(0,Number(verifiedPurchases)||0),wishlists:Math.max(0,Number(wishlists)||0),liveTryOns:Math.max(0,Number(liveTryOns)||0),rating:rating==null?null:Math.max(0,Math.min(5,Number(rating))),rules:['Use verified events only.','Never fabricate scarcity, viewers, reviews, timers, or purchases.']};
}

module.exports={TRY_ON_MODES,normalizeProduct,createTryOnSession,createDrop,createQuest,loyaltyState,socialProof};
