'use strict';
const db=require('./supabase-rest');
const orders=require('./tryamm-order-lifecycle');
const testCheckout=require('./tryamm-test-checkout');
const UUID=/^[0-9a-f-]{36}$/i;
const enabled=()=>db.configured()&&process.env.TRYAMM_ORDERS_DURABLE_ENABLED==='true';
const disabled=()=>Object.assign(new Error('Durable Website OS order records have not yet been enabled'),{status:503});
module.exports=function registerWebsiteOrders({app,auth}){
 const requireEnabled=()=>{if(!enabled())throw disabled()};
 app.get('/api/website-os/orders/status',(_req,res)=>res.json({ok:true,durableEnabled:enabled(),checkoutEnabled:enabled()&&process.env.TRYAMM_CHECKOUT_TEST_ENABLED==='true',customerAcceptanceEnabled:enabled()&&process.env.TRYAMM_QUOTE_ACCEPTANCE_ENABLED==='true',verifiedSettlementEnabled:enabled()&&process.env.TRYAMM_ORDERS_STRIPE_SETTLEMENT_ENABLED==='true',fulfillmentEnabled:false,productionCertified:false,unverifiedSteps:['customer acceptance identity proof','staging SQL concurrency','Stripe test checkout','refund reconciliation','customer delivery acceptance','production backup and restore']}));
 app.post('/api/website-os/orders',auth,async(req,res,next)=>{try{
  requireEnabled();const proposal=orders.validateProposal(req.body||{});
  const owned=await db.select('tryamm_campaigns','id=eq.'+proposal.campaignId+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id&limit=1');
  if(!owned?.length)return res.status(404).json({error:'Owned campaign not found'});
  const lead=await db.select('tryamm_campaign_leads','id=eq.'+proposal.leadId+'&campaign_id=eq.'+proposal.campaignId+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id&limit=1');
  if(!lead?.length)return res.status(404).json({error:'Campaign inquiry not found'});
  const existing=await db.select('tryamm_website_orders','lead_id=eq.'+proposal.leadId+'&select=id&limit=1');
  if(existing?.length)return res.status(409).json({error:'An order already exists for that inquiry'});
  const created=await db.insert('tryamm_website_orders',orders.newOrder(req.user.id,proposal));
  res.status(201).json({ok:true,order:orders.customerSummary(created[0]),notice:'Draft quote only; no payment link or delivery was created'});
 }catch(e){next(e)}});
 app.get('/api/website-os/orders',auth,async(req,res,next)=>{try{
  requireEnabled();
  const rows=await db.select('tryamm_website_orders','owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=*&order=created_at.desc&limit=100');
  res.json({ok:true,orders:(rows||[]).map(orders.customerSummary)});
 }catch(e){next(e)}});
 app.post('/api/website-os/orders/:id/test-checkout',auth,async(req,res,next)=>{try{
  if(req.body?.confirm!==true)return res.status(400).json({error:'Confirm creating one Stripe test Checkout link'});
  const result=await testCheckout.prepare({orderId:req.params.id,ownerId:req.user.id});
  res.status(201).json({ok:true,...result,notice:'Test-mode Checkout link only. The customer has not been charged or recorded as paid.'});
 }catch(e){next(e)}});
 app.post('/api/website-os/orders/:id/approve-quote',auth,async(req,res,next)=>{try{
  requireEnabled();if(!UUID.test(req.params.id))return res.status(400).json({error:'Invalid order'});
  if(req.body?.confirm!==true)return res.status(409).json({error:'Owner confirmation required'});
  const found=await db.select('tryamm_website_orders','id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=*&limit=1');
  const order=found?.[0];if(!order)return res.status(404).json({error:'Order not found'});
  const patch=orders.ownerTransition(order,'quote-approved',{actorRole:'admin'});
  // Application owner is the verified campaign owner. This approves a quote, NOT a charge.
  const changed=await db.update('tryamm_website_orders','id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&status=eq.quote-pending',patch);
  if(!changed?.length)return res.status(409).json({error:'Order changed concurrently'});
  res.json({ok:true,order:orders.customerSummary(changed[0]),paymentEnabled:false,notice:'Quote approved; customer acceptance and provider-verified checkout still required'});
 }catch(e){next(e)}});
};
