'use strict';
const workflow=require('./website-migration-workflow');
module.exports=function registerWebsiteMigrationRoutes({app,auth,getStore,saveStore}){
 app.get('/api/website-os/migrations',auth,(req,res)=>{
  res.json({ok:true,role:req.user.role==='admin'?'owner':'customer',requests:workflow.listForUser(getStore(),req.user).map(workflow.customerView),notice:'Migration requests are planning records, not live imports or deployments.'});
 });
 app.post('/api/website-os/migrations',auth,async(req,res,next)=>{
  try{
   const store=getStore(),previous=workflow.listForUser(store,req.user);
   if(req.user.role!=='admin'&&previous.length>=10)return res.status(429).json({error:'Contact support to request more than ten migrations'});
   const request=workflow.createRequest(store,req.user.id,req.body||{});
   await saveStore();res.status(201).json({ok:true,request:workflow.customerView(request)});
  }catch(e){next(e)}
 });
 app.patch('/api/website-os/migrations/:id/review',auth,async(req,res,next)=>{
  try{
   const request=workflow.reviewRequest(getStore(),req.user,req.params.id,req.body||{});
   await saveStore();res.json({ok:true,request:workflow.customerView(request)});
  }catch(e){next(e)}
 });
 app.get('/api/website-os/command-center',auth,(req,res)=>{
  const all=workflow.ensure(getStore()),mine=workflow.listForUser(getStore(),req.user);
  const isOwner=req.user.role==='admin';
  res.json({ok:true,role:isOwner?'owner':'customer',summary:{requests:mine.length,pending:mine.filter(x=>x.status==='awaiting-ownership-verification').length,live:0},
   requests:mine.map(workflow.customerView),
   ownerMetrics:isOwner?{allRequests:all.length,launchCertification:'NOT_VERIFIED',payments:'STRIPE_VERIFICATION_REQUIRED',storage:'PERSISTENCE_NOT_CERTIFIED'}:undefined,
   actions:isOwner?['review-migrations','approve-quotes','monitor-launch-gates']:['request-migration','review-preview','approve-quote'],
   policy:'No imported content, launched website, collected payment or activated StreetVerse integration is implied by this record.'});
 });
};
