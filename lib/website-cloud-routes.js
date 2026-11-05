'use strict';
const setup=require('./website-cloud-setup');
const supabase=require('./supabase-rest');
const TABLE='website_brand_projects';
module.exports=function registerWebsiteCloudRoutes({app,auth}){
 app.get('/api/website-os/cloud/providers',(_req,res)=>res.json({ok:true,providers:Object.entries(setup.providers).map(([id,p])=>({id,label:p.label,kind:p.kind,steps:p.steps})),notice:'Hosting setup is optional and always customer-owned. No credentials accepted.'}));
 app.get('/api/website-os/cloud/:projectId',auth,async(req,res,next)=>{try{
   if(!supabase.configured())return res.status(503).json({error:'Private cloud-setup storage unavailable'});
   const id=String(req.params.projectId||'');
   if(!/^[a-f0-9-]{36}$/i.test(id))return res.status(400).json({error:'Invalid project ID'});
   const rows=await supabase.select(TABLE,'id=eq.'+encodeURIComponent(id)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,cloud_setup,revision&limit=1');
   if(!rows?.length)return res.status(404).json({error:'Project not found'});
   res.json({ok:true,cloudPlan:rows[0].cloud_setup?setup.publicPlan(rows[0].cloud_setup):null,revision:rows[0].revision});
 }catch(e){next(e)}});
 app.put('/api/website-os/cloud/:projectId',auth,async(req,res,next)=>{try{
   if(!supabase.configured())return res.status(503).json({error:'Private cloud-setup storage unavailable'});
   const supplied={...req.body,projectId:req.params.projectId};
   const data=setup.validate(supplied);
   const rows=await supabase.select(TABLE,'id=eq.'+encodeURIComponent(data.projectId)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,revision,status&limit=1');
   if(!rows?.length)return res.status(404).json({error:'Project not found'});
   const current=rows[0];
   if(current.status!=='draft')return res.status(409).json({error:'Project is locked for owner review'});
   if(!Number.isInteger(req.body?.revision)||req.body.revision!==current.revision)return res.status(409).json({error:'Revision mismatch; reload before saving'});
   const cloudPlan=setup.plan(req.user.id,data);
   const updated=await supabase.update(TABLE,'id=eq.'+encodeURIComponent(current.id)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&revision=eq.'+current.revision,{cloud_setup:cloudPlan,revision:current.revision+1,updated_at:new Date().toISOString()});
   if(!updated?.length)return res.status(409).json({error:'Cloud setup changed on another device'});
   res.json({ok:true,cloudPlan:setup.publicPlan(cloudPlan),revision:updated[0].revision,notice:'Planning checklist saved. No account, DNS, hosting, billing or deployment was changed.'});
 }catch(e){next(e)}});
};
