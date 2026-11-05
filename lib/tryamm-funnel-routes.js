'use strict';
const db=require('./supabase-rest');
const funnel=require('./tryamm-funnel-contract');
const crypto=require('node:crypto');
const uuid=/^[0-9a-f-]{36}$/i;
const enabled=()=>db.configured()&&process.env.TRYAMM_FUNNEL_DURABLE_ENABLED==='true';
const unavailable=()=>Object.assign(new Error('Campaign database not yet activated; payment and sales reporting remain disabled'),{status:503});
function on(){if(!enabled())throw unavailable()}
module.exports=function registerFunnel({app,auth}){
 app.get('/api/website-os/funnel/status',(_req,res)=>res.json({ok:true,persistenceEnabled:enabled(),actualPaymentsIntegrated:false,publiclyLaunched:false,source:'TRYAMM Holo Reels to Website OS'}));
 app.post('/api/website-os/funnel/campaigns',auth,async(req,res,next)=>{try{
  on();const input=funnel.validateCampaign(req.body||{});
  const existing=await db.select('website_brand_projects','id=eq.'+encodeURIComponent(input.projectId)+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id&limit=1');
  if(!existing?.length)return res.status(404).json({error:'Owned website project required'});
  const record=funnel.newCampaign(req.user.id,input);
  const rows=await db.insert('tryamm_campaigns',record);
  res.status(201).json({ok:true,campaign:rows[0],notice:'Campaign created in draft only; not published or charged'});
 }catch(e){next(e)}});
 app.get('/api/website-os/funnel/campaigns',auth,async(req,res,next)=>{try{
  on();const campaigns=await db.select('tryamm_campaigns','owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=*&order=created_at.desc&limit=100');
  res.json({ok:true,campaigns:campaigns||[]});
 }catch(e){next(e)}});
 app.post('/api/website-os/funnel/campaigns/:id/approve',auth,async(req,res,next)=>{try{
  on();if(!uuid.test(req.params.id))return res.status(400).json({error:'Invalid campaign'});
  const rows=await db.select('tryamm_campaigns','id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=*&limit=1');
  const campaign=rows?.[0];if(!campaign)return res.status(404).json({error:'Campaign not found'});
  const review=funnel.gate({evidence:req.body?.evidence});
  if(!review.ready)return res.status(422).json({error:'Campaign evidence incomplete',review});
  if(req.body?.confirm!==true)return res.status(409).json({error:'Final owner approval required'});
  const changed=await db.update('tryamm_campaigns','id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&status=eq.draft',{status:'approved',evidence:req.body.evidence});
  if(!changed?.length)return res.status(409).json({error:'Campaign changed or is not a draft'});
  res.json({ok:true,campaign:changed[0],published:false,notice:'Approved for customer-directed distribution; no social post was published'});
 }catch(e){next(e)}});
 app.get('/api/website-os/funnel/campaigns/:id/report',auth,async(req,res,next)=>{try{
  on();if(!uuid.test(req.params.id))return res.status(400).json({error:'Invalid campaign'});
  const own=await db.select('tryamm_campaigns','id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,status,name&limit=1');
  if(!own?.length)return res.status(404).json({error:'Campaign not found'});
  const leads=await db.select('tryamm_campaign_leads','campaign_id=eq.'+req.params.id+'&owner_id=eq.'+encodeURIComponent(req.user.id)+'&select=id,status,created_at&limit=1000');
  res.json({ok:true,campaign:own[0],metrics:funnel.measurements({leads:(leads||[]).length}),leadRecords:leads||[],
   status:'PARTIAL',warning:'Visits, quotes and verified purchases are NOT yet reconciled into durable funnel reporting; zero is not evidence of zero sales'});
 }catch(e){next(e)}});
 // Public opt-in intake; no third-party scraping, open redirects or automated billing.
 app.post('/api/website-os/funnel/campaigns/:id/inquire',async(req,res,next)=>{try{
  on();if(!uuid.test(req.params.id))return res.status(400).json({error:'Invalid campaign'});
  const lead=funnel.validateLead(req.body||{});
  const campaign=await db.select('tryamm_campaigns','id=eq.'+req.params.id+'&status=eq.approved&select=id,owner_id&limit=1');
  if(!campaign?.length)return res.status(404).json({error:'Active campaign not found'});
  const inserted=await db.insert('tryamm_campaign_leads',{id:crypto.randomUUID(),campaign_id:req.params.id,owner_id:campaign[0].owner_id,...{
   email:lead.email,interest:lead.interest,marketing_opt_in:lead.marketingOptIn},status:'new'});
  res.status(201).json({ok:true,leadId:inserted[0]?.id,stage:'CUSTOMER_INQUIRY_RECEIVED',paymentRequired:false});
 }catch(e){next(e)}});
};
