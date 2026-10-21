import {adminRest} from './supabase-admin.js';
import {UUID,normalizeDraft} from './ai-cafe-executor.js';
export const rest=(path,opts={})=>adminRest(path,{...opts,signal:AbortSignal.timeout(10000)});
export const action=(user,kind,data)=>rest('rpc/studio_action',{method:'POST',body:{p_user:user,p_action:kind,p_data:data}});
export const integer=(v,min,max)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
export function validateAction(body,owner){
 if(!body||JSON.stringify(body).length>20000)throw Error('invalid_request');
 const {action:a}=body;
 if(['business','expense','budget'].includes(a)&&!owner)throw Error('owner_required');
 if(a==='business'){
  if(body.approved!==true||!integer(body.priceCents,0,99900)||!integer(body.commissionBps,0,5000)||typeof body.agentReference!=='string'||body.agentReference.length>200||(body.commissionBps>0&&!body.agentReference.trim()))throw Error('approval_and_price_required');
  const data=normalizeDraft(body.data);return {...body,name:data.name,data};
 }
 if(a==='budget'){if(!integer(body.limitCents,0,10000000))throw Error('invalid_budget');return body}
 if(a==='expense'){if(!integer(body.amountCents,1,10000000)||!UUID.test(body.requestKey||'')||typeof body.description!=='string'||!body.description.trim()||body.description.length>300||!/^\d{4}-\d{2}-\d{2}$/.test(body.incurredOn||''))throw Error('invalid_expense');return body}
 if(!['intake','revise','execute','review','publish','unpublish'].includes(a))throw Error('unsupported_action');
 if(a==='intake'){if(!UUID.test(body.businessId||'')||!UUID.test(body.requestKey||''))throw Error('invalid_request')}
 else if(!UUID.test(body.id||'')||!integer(body.revision,1,50))throw Error('invalid_request');
 if(['intake','revise'].includes(a)){
  if(typeof body.requirements!=='string'||body.requirements.length>3000)throw Error('invalid_requirements');
  return {...body,input:normalizeDraft(body.input)};
 }
 if(a==='review'&&!/^[a-f0-9]{64}$/.test(body.hash||''))throw Error('completed_draft_required');
 return body;
}
export function financials(order,transactions=[],refunds=[]){
 const tx=transactions.find(t=>t.order_id===order.commerce_id&&t.buyer_id===order.customer_id&&t.provider==='stripe'&&t.metadata?.livemode===true&&['paid','refunded'].includes(t.status)&&Number(t.amount_cents)===order.price_cents&&t.currency.toUpperCase()==='USD');
 const refunded=tx?Math.min(Number(tx.amount_cents),refunds.filter(r=>r.transaction_id===tx.id&&r.status==='succeeded').reduce((n,r)=>n+Number(r.amount_cents),0)):0;
 const collected=tx?Math.max(0,Number(tx.amount_cents)-refunded):0;
 return {collectedCents:collected,refundedCents:refunded,commissionAccruedCents:Math.floor(collected*order.commission_bps/10000),commissionPaidCents:0,paymentState:order.price_cents===0?'gift':tx?(refunded?'refunded-or-partial':'verified-paid'):'unverified'};
}
export async function hydrateOrders(rows,db=rest){
 const commerceIds=[...new Set(rows.map(o=>o.commerce_id).filter(Boolean))];
 const jobIds=[...new Set(rows.map(o=>o.job_id).filter(Boolean))];
 const [tx,refunds,jobs]=await Promise.all([
  commerceIds.length?db('commerce_payment_transactions',{query:{order_id:`in.(${commerceIds.join(',')})`}}):[],
  commerceIds.length?db('commerce_refunds',{query:{order_id:`in.(${commerceIds.join(',')})`}}):[],
  jobIds.length?db('ai_cafe_jobs',{query:{id:`in.(${jobIds.join(',')})`,select:'id,user_id,status,attempts,error,output'}}):[]
 ]);
 return rows.map(order=>({...order,financials:financials(order,tx,refunds),job:jobs.find(j=>j.id===order.job_id&&j.user_id===order.owner_id)||null}));
}
export function summarize(orders,expenses,budget){
 const month=new Date().toISOString().slice(0,7),monthCosts=expenses.filter(e=>String(e.incurred_on).startsWith(month)).reduce((n,e)=>n+Number(e.amount_cents),0);
 const revenue=orders.reduce((n,o)=>n+o.financials.collectedCents,0),commissions=orders.reduce((n,o)=>n+o.financials.commissionAccruedCents,0),costs=expenses.reduce((n,e)=>n+Number(e.amount_cents),0);
 return {verifiedRevenueCents:revenue,commissionAccruedCents:commissions,recordedExpensesCents:costs,remainingBeforeUnrecordedCostsCents:revenue-commissions-costs,monthlyLimitCents:budget?.monthly_limit_cents||0,externalPaidExecutionEnabled:false,alerts:[...(monthCosts>(budget?.monthly_limit_cents||0)?[{orderId:'budget',message:'Recorded expenses exceed the configured budget'}]:[]),...orders.filter(o=>o.job?.status==='failed'||(o.state==='draft'&&!o.job)).map(o=>({orderId:o.id,message:'Draft needs attention'}))]};
}
