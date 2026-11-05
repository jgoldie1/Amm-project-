'use strict';
const projects=require('./website-brand-projects');
const {createLead}=require('./ai-cafe-sales');
module.exports=function registerWebsiteBrandRoutes({app,auth,getStore,saveStore}){
 const owner=(req,res,next)=>req.user.role==='admin'?next():res.status(403).json({error:'Owner only'});
 app.get('/api/website-os/projects',auth,async(req,res,next)=>{try{
   res.json({ok:true,projects:await projects.listProjects(req.user.id)});
 }catch(e){next(e)}});
 app.post('/api/website-os/projects',auth,async(req,res,next)=>{try{
   const result=await projects.createProject(req.user.id,req.body);
   res.status(201).json({ok:true,project:result});
 }catch(e){next(e)}});
 app.get('/api/website-os/projects/:id',auth,async(req,res,next)=>{try{
   const result=await projects.getProject(req.user.id,req.params.id);
   if(!result)return res.status(404).json({error:'Project not found'});
   res.json({ok:true,project:result});
 }catch(e){next(e)}});
 app.put('/api/website-os/projects/:id',auth,async(req,res,next)=>{try{
   res.json({ok:true,project:await projects.updateProject(req.user.id,req.params.id,req.body)});
 }catch(e){next(e)}});
 app.post('/api/website-os/projects/:id/request-quote',auth,async(req,res,next)=>{try{
   if(req.body?.consent!==true)return res.status(400).json({error:'Consent to a quote request is required'});
   const project=await projects.getProject(req.user.id,req.params.id);
   if(!project)return res.status(404).json({error:'Project not found'});
   const {brand,status}=project;
   if(status!=='draft')return res.status(409).json({error:'Project already submitted'});
   if(!brand.contactEmail)return res.status(400).json({error:'Add a customer email before requesting a quote'});
   // Record the lead before locking the project; both steps are individually checked.
   // This is not a distributed transaction, and a production outbox is still required.
   const lead=createLead(getStore(),{email:brand.contactEmail,interest:brand.businessName+' / '+brand.packageId+' / '+brand.templateId,businessId:project.id,consent:true});
   await saveStore();
   const submitted=await projects.submitProject(req.user.id,project.id);
   res.status(201).json({ok:true,project:submitted,leadId:lead.id,stage:'OWNER_REVIEW',notice:'No charge has been made. The owner must approve a quote before checkout.'});
 }catch(e){next(e)}});
 app.get('/api/website-os/owner/review-queue',auth,owner,async(req,res,next)=>{try{
   const supabase=require('./supabase-rest');
   if(!supabase.configured())return res.status(503).json({error:'Secure project storage unavailable'});
   const rows=await supabase.select('website_brand_projects','status=eq.review-requested&select=*&order=updated_at.desc&limit=100');
   res.json({ok:true,projects:(rows||[]).map(projects.publicProject),notice:'A submitted site is not automatically approved, paid or deployed'});
 }catch(e){next(e)}});
};
