'use strict';
const acceptance=require('./tryamm-quote-acceptance');
module.exports=function registerQuoteAcceptanceRoutes({app,auth}){
 app.get('/api/website-os/orders/acceptance/status',(_req,res)=>res.json({ok:true,enabled:acceptance.acceptanceEnabled(),checkoutEnabled:false,productionCertified:false}));
 app.post('/api/website-os/orders/:id/request-acceptance',auth,async(req,res,next)=>{
  try{
   if(req.body?.confirm!==true)return res.status(400).json({error:'Confirm emailing the customer this quote'});
   const result=await acceptance.issueAcceptance({orderId:req.params.id,ownerId:req.user.id});
   res.status(202).json({ok:true,...result,notice:'Private acceptance link sent to the inquiry email. No payment initiated; no token disclosed to the business owner.'});
  }catch(e){next(e)}
 });
 app.get('/api/website-os/quote/:token',async(req,res,next)=>{
  try{res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
   res.json({ok:true,quote:await acceptance.previewAcceptance(req.params.token),checkoutEnabled:false});
  }catch(e){next(e)}
 });
 app.post('/api/website-os/quote/:token/accept',async(req,res,next)=>{
  try{res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
   const accepted=await acceptance.accept(req.params.token,{confirm:req.body?.confirm===true});
   res.json({ok:true,...accepted,notice:'Quote accepted. No checkout has started and no payment was taken.'});
  }catch(e){next(e)}
 });
};
