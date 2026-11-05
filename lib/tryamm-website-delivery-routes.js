'use strict';
const delivery=require('./tryamm-website-delivery');
module.exports=function registerWebsiteDelivery({app,auth}){
 app.get('/api/website-os/delivery/status',(_req,res)=>res.json({ok:true,enabled:delivery.enabled(),productionCertified:false}));
 app.post('/api/website-os/orders/:id/prepare-review',auth,async(req,res,next)=>{try{
  if(req.body?.confirm!==true)return res.status(400).json({error:'Owner confirmation required'});
  res.json({ok:true,...await delivery.submitReview({orderId:req.params.id,ownerId:req.user.id,previewUrl:req.body.previewUrl})});
 }catch(e){next(e)}});
 app.post('/api/website-os/orders/:id/invite-review',auth,async(req,res,next)=>{try{
  if(req.body?.confirm!==true)return res.status(400).json({error:'Owner confirmation required'});
  res.status(202).json({ok:true,...await delivery.issueReview({orderId:req.params.id,ownerId:req.user.id})});
 }catch(e){next(e)}});
 app.post('/api/website-os/website-review/preview',async(req,res,next)=>{try{
  res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
  res.json({ok:true,review:await delivery.preview(req.body?.token)});
 }catch(e){next(e)}});
 app.post('/api/website-os/website-review/decision',async(req,res,next)=>{try{
  res.set('Cache-Control','no-store');res.set('Referrer-Policy','no-referrer');
  res.json({ok:true,...await delivery.decide(req.body?.token,{approve:req.body?.approve,notes:req.body?.notes})});
 }catch(e){next(e)}});
 app.post('/api/website-os/orders/:id/finalize-delivery',auth,async(req,res,next)=>{try{
  if(req.body?.confirm!==true)return res.status(400).json({error:'Owner confirmation required'});
  res.json({ok:true,...await delivery.finalize({orderId:req.params.id,ownerId:req.user.id,reference:req.body.reference})});
 }catch(e){next(e)}});
};