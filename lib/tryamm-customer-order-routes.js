'use strict';
const tracking=require('./tryamm-customer-order-status');
module.exports=function registerCustomerTracking({app,auth}){
 app.get('/api/website-os/customer-tracking/health',(_req,res)=>res.json({
  ok:true,enabled:tracking.enabled(),productionCertified:false,paymentActivation:false
 }));
 app.post('/api/website-os/orders/:id/send-tracking-link',auth,async(req,res,next)=>{
  try{
   if(req.body?.confirm!==true)return res.status(400).json({error:'Explicit confirmation required'});
   const response=await tracking.issue({orderId:req.params.id,ownerId:req.user.id});
   res.status(202).json({ok:true,...response,notice:'Customer-only order status link accepted by mail provider; no payment initiated'});
  }catch(e){next(e)}
 });
 app.post('/api/website-os/customer-tracking/lookup',async(req,res,next)=>{
  try{
   res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
   const response=await tracking.status(req.body?.token);
   res.json({ok:true,...response});
  }catch(e){next(e)}
 });
};
