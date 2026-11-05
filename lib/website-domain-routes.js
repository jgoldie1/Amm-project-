'use strict';
const {planDomain}=require('./website-domain-setup');
const supabase=require('./supabase-rest');
module.exports=function registerDomainSetup({app,auth}){
 app.post('/api/website-os/domain/prepare',auth,async(req,res,next)=>{
  try{
   const plan=planDomain(req.body||{});
   if(!supabase.configured())return res.status(503).json({error:'Private project storage unavailable; domain plan not saved or executed'});
   const rows=await supabase.select('website_brand_projects',
     'id=eq.'+encodeURIComponent(plan.projectId)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,revision,status,cloud_setup&limit=1');
   const project=rows?.[0];
   if(!project)return res.status(404).json({error:'Project not found'});
   if(project.status!=='draft')return res.status(409).json({error:'Project is locked for owner review'});
   if(project.cloud_setup?.provider!==plan.provider||project.cloud_setup?.domain!==plan.domain)
     return res.status(409).json({error:'First save matching cloud provider and domain preferences'});
   if(!Number.isInteger(req.body.revision)||req.body.revision!==project.revision)
     return res.status(409).json({error:'Project revision changed, reload the cloud setup page'});
   const updated=await supabase.update('website_brand_projects',
     'id=eq.'+encodeURIComponent(project.id)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&revision=eq.'+project.revision,
     {domain_setup:plan,revision:project.revision+1,updated_at:new Date().toISOString()});
   if(!updated?.length)return res.status(409).json({error:'Concurrent project edit detected'});
   res.status(201).json({ok:true,domainPlan:plan,revision:updated[0].revision,
     notice:'Domain onboarding prepared and saved. No live DNS, registrar account, website, email or hosting configuration was changed.'});
  }catch(e){next(e)}
 });
 app.get('/api/website-os/domain/:projectId',auth,async(req,res,next)=>{
  try{
   if(!supabase.configured())return res.status(503).json({error:'Secure storage not configured'});
   const id=String(req.params.projectId||'');
   if(!/^[0-9a-f-]{36}$/i.test(id))return res.status(400).json({error:'Invalid project ID'});
   const rows=await supabase.select('website_brand_projects',
    'id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,revision,domain_setup&limit=1');
   if(!rows?.length)return res.status(404).json({error:'Project not found'});
   res.json({ok:true,domainPlan:rows[0].domain_setup||null,revision:rows[0].revision});
  }catch(e){next(e)}
 });
};
