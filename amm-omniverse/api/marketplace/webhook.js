import crypto from 'node:crypto';
import { adminRest, json } from '../_lib/supabase-admin.js';

export const config={api:{bodyParser:false}};

async function rawBody(req){
  const chunks=[];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk));
  return Buffer.concat(chunks);
}

function timingSafeHex(a,b){
  try{const x=Buffer.from(a,'hex'),y=Buffer.from(b,'hex');return x.length===y.length&&crypto.timingSafeEqual(x,y)}catch{return false}
}

function verifyStripeSignature(body,header,secret){
  if(!secret||!header)return false;
  const items=String(header).split(',').map(part=>part.split('='));
  const timestamp=items.find(([k])=>k==='t')?.[1];
  const signatures=items.filter(([k])=>k==='v1').map(([,v])=>v);
  if(!timestamp||!signatures.length)return false;
  if(Math.abs(Date.now()/1000-Number(timestamp))>300)return false;
  const expected=crypto.createHmac('sha256',secret).update(`${timestamp}.${body.toString('utf8')}`).digest('hex');
  return signatures.some(sig=>timingSafeHex(sig,expected));
}

async function patchOrder(orderId,body){
  if(!orderId)return;
  await adminRest('marketplace_orders',{method:'PATCH',query:{id:`eq.${orderId}`},body:{...body,updated_at:new Date().toISOString()}});
}

export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{error:'Method not allowed'});
  const raw=await rawBody(req);
  const secret=process.env.STRIPE_WEBHOOK_SECRET||'';
  if(!verifyStripeSignature(raw,req.headers['stripe-signature'],secret)) return json(res,400,{error:'Invalid Stripe signature'});

  let event;try{event=JSON.parse(raw.toString('utf8'))}catch{return json(res,400,{error:'Invalid JSON'});}
  const obj=event?.data?.object||{};

  try{
    if(event.type==='checkout.session.completed'){
      const orderId=obj.client_reference_id||obj.metadata?.order_id;
      const rows=await adminRest('marketplace_orders',{query:{id:`eq.${orderId}`,limit:1}});
      const order=rows?.[0];
      if(order&&order.status!=='paid'&&order.status!=='fulfilled'){
        await patchOrder(orderId,{status:'paid',stripe_payment_intent_id:obj.payment_intent||null});
        if(Number(order.platform_fee_cents)>0){
          await adminRest('marketplace_platform_revenue',{method:'POST',body:{order_id:order.id,revenue_type:'transaction-fee',amount_cents:order.platform_fee_cents,currency:order.currency||'USD',recognized_at:new Date().toISOString()}}).catch(()=>null);
        }
      }
    }

    if(event.type==='charge.refunded'){
      const orderId=obj.metadata?.order_id;
      if(orderId) await patchOrder(orderId,{status:'refunded',stripe_charge_id:obj.id||null});
    }

    if(event.type==='charge.dispute.created'){
      const chargeId=typeof obj.charge==='string'?obj.charge:obj.charge?.id;
      if(chargeId){
        const rows=await adminRest('marketplace_orders',{query:{stripe_charge_id:`eq.${chargeId}`,limit:1}});
        if(rows?.[0]) await patchOrder(rows[0].id,{status:'disputed'});
      }
    }

    return json(res,200,{received:true});
  }catch(error){
    return json(res,500,{error:String(error?.message||'Webhook processing failed')});
  }
}
