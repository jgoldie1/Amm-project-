'use strict';
const {mailPlan,PROVIDERS}=require('./website-quantum-mail-plan');
const supabase=require('./supabase-rest');
module.exports=function registerQuantumMailSetup({app,auth}){
 app.get('/api/website-os/business-email/providers',(_req,res)=>res.json({ok:true,providers:Object.entries(PROVIDERS).map(([id,p])=>({id,label:p.name,steps:p.steps})),quantumMail:'existing legacy mail design recovered',mailboxHostingVerified:false}));
 app.post('/api/website-os/business-email/prepare',auth,async(req,res,next)=>{try{
  const plan=mailPlan(req.body||{});
  if(!supabase.configured())return res.status(503).json({error:'Private project storage unavailable'});
  const rows=await supabase.select('website_brand_projects','id=eq.'+encodeURIComponent(plan.projectId)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,revision,status,cloud_setup&limit=1');
  const project=rows?.[0];
  if(!project)return res.status(404).json({error:'Project not found'});
  if(project.status!=='draft')return res.status(409).json({error:'Project locked for owner review'});
  if(project.cloud_setup?.domain!==plan.domain)return res.status(409).json({error:'Save the same website domain in cloud setup first'});
  if(!Number.isInteger(req.body.revision)||project.revision!==req.body.revision)return res.status(409).json({error:'Project changed; reload'});
  const changed=await supabase.update('website_brand_projects','id=eq.'+encodeURIComponent(project.id)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&revision=eq.'+project.revision,{business_email_setup:plan,revision:project.revision+1,updated_at:new Date().toISOString()});
  if(!changed?.length)return res.status(409).json({error:'Concurrent project change'});
  res.status(201).json({ok:true,plan,revision:changed[0].revision,notice:'Mail setup checklist saved; no mailbox, DNS, or provider account was changed.'});
 }catch(e){next(e)}});
};
