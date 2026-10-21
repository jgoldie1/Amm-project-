import {json} from '../_lib/supabase-admin.js';
import {requireUser} from '../_lib/security.js';
import {hasTemplateAuthority} from '../_lib/template-listing.js';
import {executeOne,UUID} from '../_lib/ai-cafe-executor.js';
import {rest,action,validateAction,hydrateOrders,summarize} from '../_lib/studio.js';
export function createWorkflowHandler({userFor=requireUser,ownerFor=hasTemplateAuthority,db=rest,mutate=action,execute=executeOne}={}){
 return async(req,res)=>{
  try{
   if(!['GET','POST'].includes(req.method))return json(res,405,{error:'Method not allowed'});
   // Only an approved public offer is available before sign-in, never customer records.
   if(req.method==='GET'&&req.query?.offer){
    if(!UUID.test(req.query.offer))return json(res,400,{error:'Invalid offer'});
    const rows=await db('studio_businesses',{query:{id:`eq.${req.query.offer}`,approved:'eq.true',select:'id,name,data,price_cents',limit:1}});
    return json(res,200,{offer:rows[0]||null});
   }
   const user=await userFor(req,res);if(!user)return;
   const owner=ownerFor(user);
   if(req.method==='POST'){
    const data=validateAction(typeof req.body==='string'?JSON.parse(req.body):req.body,owner);
    if(['execute','review','publish','unpublish'].includes(data.action)&&!owner)return json(res,403,{error:'Owner account required'});
    const result=await mutate(user.id,data.action,data);
    if(data.action==='execute')await execute({userId:user.id,jobId:result.job_id});
    return json(res,200,{result});
   }
   const orders=await hydrateOrders(await db('studio_orders',{query:{[owner?'owner_id':'customer_id']:`eq.${user.id}`,order:'created_at.desc',limit:50}}),db);
   if(!owner)return json(res,200,{owner:false,orders:orders.map(({snapshot,agent_reference,commission_bps,...o})=>({...o,financials:{paymentState:o.financials.paymentState,collectedCents:o.financials.collectedCents}}))});
   const [businesses,expenses,budgets,backups]=await Promise.all([
    db('studio_businesses',{query:{owner_id:`eq.${user.id}`,order:'created_at.desc',limit:100}}),
    db('studio_expenses',{query:{owner_id:`eq.${user.id}`,order:'created_at.desc',limit:1000}}),
    db('studio_budgets',{query:{owner_id:`eq.${user.id}`,limit:1}}),
    db('studio_backup_runs',{query:{select:'status,created_at',order:'created_at.desc',limit:1}})
   ]);
   const summary=summarize(orders,expenses,budgets[0]);
   if(!backups[0]||backups[0].status!=='succeeded'||Date.now()-Date.parse(backups[0].created_at)>48*3600000)summary.alerts.push({orderId:'backup',message:'No successful automated backup in the last 48 hours. Download an owner backup and check configuration.'});
   return json(res,200,{owner:true,orders,businesses,expenses,budget:budgets[0]||null,summary,window:'Latest 50 orders and 1000 recorded expenses; not a complete accounting statement.'});
  }catch(e){
   const known=/^(invalid_|unsupported_|owner_required|approval_|completed_|review_required|verified_live_|revision_|request_conflict|business_|intake_|order_not_found|unpublish_|job_quota)/.test(e.message);
   return json(res,known?409:503,{error:known?e.message.replaceAll('_',' '):'Studio service unavailable. Reload saved orders before retrying.'});
  }
 };
}
export default createWorkflowHandler();
