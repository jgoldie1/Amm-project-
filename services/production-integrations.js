const crypto=require('crypto');
const stripe=require('./stripe');
const payments=require('./payments');
const livekit=require('./livekit');
const claude=require('./claude');
const meshy=require('./meshy');

const LIVEKIT_ROLES={
  host:{canPublish:true,canSubscribe:true,canPublishData:true},
  cohost:{canPublish:true,canSubscribe:true,canPublishData:true},
  moderator:{canPublish:false,canSubscribe:true,canPublishData:true},
  guest:{canPublish:true,canSubscribe:true,canPublishData:true},
  viewer:{canPublish:false,canSubscribe:true,canPublishData:false}
};
function integrationStatus(){
  const status={
    stripe:Boolean(process.env.STRIPE_SECRET_KEY),stripeWebhook:Boolean(process.env.STRIPE_WEBHOOK_SECRET),stripePrices:Boolean(process.env.STRIPE_SUBSCRIPTION_PRICE_ID&&process.env.STRIPE_TOKEN_PACK_PRICE_ID),
    paystack:Boolean(process.env.PAYSTACK_SECRET_KEY),flutterwave:Boolean(process.env.FLUTTERWAVE_SECRET_KEY&&process.env.FLUTTERWAVE_WEBHOOK_SECRET),
    livekit:livekit.connected(),claude:claude.connected(),meshy:meshy.connected(),supabase:Boolean(process.env.SUPABASE_URL&&process.env.SUPABASE_SERVICE_ROLE_KEY)
  };
  return {...status,productionReady:Object.values(status).every(Boolean)};
}
function eventKey(provider,event){return `${provider}:${event.id||event.event||event.data?.reference||event.data?.id||crypto.createHash('sha256').update(JSON.stringify(event)).digest('hex')}`;}
function normalizePaymentEvent(provider,event){
  if(provider==='stripe'){
    const object=event.data?.object||{};
    return {provider,eventType:event.type,eventId:event.id,reference:object.id,userId:object.metadata?.userId||object.client_reference_id||null,kind:object.metadata?.kind||null,status:['checkout.session.completed','invoice.paid','payment_intent.succeeded'].includes(event.type)?'succeeded':['invoice.payment_failed','customer.subscription.deleted'].includes(event.type)?'failed':'informational',amountMinor:Number(object.amount_total??object.amount_paid??object.amount_received??0),currency:String(object.currency||'usd').toUpperCase(),customerId:object.customer||null,subscriptionId:object.subscription||object.id||null,metadata:object.metadata||{}};
  }
  const data=event.data||event;
  const success=provider==='paystack'?event.event==='charge.success':String(data.status||event.status).toLowerCase()==='successful';
  return {provider,eventType:event.event||event.type||'payment',eventId:event.id||data.id||data.reference||data.tx_ref,reference:data.reference||data.tx_ref||data.id,userId:data.metadata?.userId||data.meta?.userId||null,kind:data.metadata?.kind||data.meta?.kind||null,status:success?'succeeded':'failed',amountMinor:provider==='paystack'?Number(data.amount||0):Math.round(Number(data.amount||0)*100),currency:String(data.currency||'NGN').toUpperCase(),customerId:data.customer?.id||data.customer?.email||null,subscriptionId:null,metadata:data.metadata||data.meta||{}};
}
function entitlementFromPayment(payment){
  if(payment.status!=='succeeded')return null;
  if(payment.kind==='subscription')return {type:'subscription',plan:payment.metadata.plan||'creator',status:'active',startsAt:new Date().toISOString(),provider:payment.provider,providerReference:payment.reference};
  if(payment.kind==='token-pack')return {type:'token-credit',tokens:Number(payment.metadata.tokens||0),status:'posted',provider:payment.provider,providerReference:payment.reference};
  return {type:'purchase',status:'paid',provider:payment.provider,providerReference:payment.reference};
}
function livekitRole(role){return LIVEKIT_ROLES[String(role||'viewer').toLowerCase()]||LIVEKIT_ROLES.viewer;}
async function createLivekitToken(input){const grants=livekitRole(input.role);return livekit.createJoinToken({room:String(input.room||'').slice(0,120),identity:String(input.identity||'').slice(0,120),name:String(input.name||input.identity||'').slice(0,120),canPublish:grants.canPublish});}
function aiBudgetGuard({estimatedTokens=0,userSpentUsd=0}){const maxTokens=Math.max(256,Number(process.env.CLAUDE_MAX_TOKENS||1200));const dailyBudget=Math.max(0,Number(process.env.CLAUDE_DAILY_BUDGET_USD||10));if(Number(estimatedTokens)>maxTokens)return {allowed:false,reason:'token-limit',maxTokens};if(Number(userSpentUsd)>=dailyBudget)return {allowed:false,reason:'daily-budget',dailyBudget};return {allowed:true,maxTokens,dailyBudget};}
async function createMeshyJob(input){const task=await meshy.createTextTo3D({prompt:String(input.prompt||'').slice(0,1500),artStyle:input.artStyle||'realistic'});return {jobId:crypto.randomUUID(),providerTaskId:task.id,status:task.status||'PENDING',ownerId:input.ownerId,assetType:input.assetType||'avatar',prompt:String(input.prompt||'').slice(0,1500),createdAt:new Date().toISOString(),provider:task.mode||'live'};}
module.exports={LIVEKIT_ROLES,integrationStatus,eventKey,normalizePaymentEvent,entitlementFromPayment,livekitRole,createLivekitToken,aiBudgetGuard,createMeshyJob};