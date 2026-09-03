import crypto from 'node:crypto';
import {json} from '../_lib/supabase-admin.js';
import {requireUser,audit} from '../_lib/security.js';

const CATALOG=new Map([
['loop-tee',{name:'Chicago StreetVerse Tee',unitAmount:2800,currency:'usd',seller:'loop-courier'}],
['loop-bag',{name:'Creator Transit Bag',unitAmount:4200,currency:'usd',seller:'loop-courier'}],
['river-kit',{name:'Creator Reel Kit',unitAmount:3500,currency:'usd',seller:'riverwalk-creator'}],
['park-print',{name:'Chicago World Art Print',unitAmount:2400,currency:'usd',seller:'millennium-event'}],
['south-meal',{name:'South Side Meal Pack',unitAmount:1800,currency:'usd',seller:'south-market'}],
['west-maker',{name:'Maker Starter Pack',unitAmount:3900,currency:'usd',seller:'west-maker'}],
['north-merch',{name:'North Side Creator Merch',unitAmount:3200,currency:'usd',seller:'north-night'}]
]);
const chargingEnabled=()=>String(process.env.TRYAMM_LIVE_CHARGING_ENABLED||'').toLowerCase()==='true';
const stripeConfigured=()=>Boolean(process.env.STRIPE_SECRET_KEY&&process.env.STRIPE_WEBHOOK_SECRET);
const normalizeLines=lines=>Array.isArray(lines)?lines.map(x=>({id:String(x?.id||''),qty:Math.max(1,Math.min(20,Math.trunc(Number(x?.qty)||1)))})):[];

export default async function handler(req,res){
 if(req.method!=='POST')return json(res,405,{error:'Method not allowed'});
 const user=await requireUser(req,res);if(!user)return;
 const lines=normalizeLines(req.body?.lines),fulfillment=req.body?.fulfillment==='delivery'?'delivery':'pickup';
 if(!lines.length)return json(res,400,{error:'Cart is empty'});
 const priced=[];let total=0;
 for(const line of lines){const p=CATALOG.get(line.id);if(!p)return json(res,400,{error:`Unknown product: ${line.id}`});const amount=p.unitAmount*line.qty;total+=amount;priced.push({...line,...p,amount});}
 if(total<50||total>500000)return json(res,400,{error:'Cart total outside allowed range'});
 const sellers=[...new Set(priced.map(x=>x.seller))];
 const readiness={authenticated:true,catalogValidated:true,serverPriced:true,stripeConfigured:stripeConfigured(),webhookConfigured:Boolean(process.env.STRIPE_WEBHOOK_SECRET),liveChargingEnabled:chargingEnabled(),sellerTransfersVerified:false,reconciliationVerified:false};
 const orderIntentId=`ord_${crypto.randomBytes(12).toString('hex')}`;
 await audit(user.id,'commerce_checkout_attempt','info',{orderIntentId,total,currency:'usd',fulfillment,sellers,readiness});
 if(!readiness.liveChargingEnabled||!readiness.stripeConfigured||!readiness.sellerTransfersVerified||!readiness.reconciliationVerified){
   return json(res,423,{ok:false,state:'PAYMENT_GATED',orderIntentId,total,currency:'usd',fulfillment,sellers,readiness,message:'Order validated server-side. Live charging remains disabled until Stripe webhooks, connected-seller transfer readiness, reconciliation, and release approval are verified.'});
 }
 return json(res,503,{ok:false,state:'CHECKOUT_ADAPTER_NOT_RELEASED',orderIntentId,message:'Live charging flag is on, but Stripe session creation is intentionally withheld until the release gate is completed.'});
}
