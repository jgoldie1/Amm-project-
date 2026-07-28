'use strict';

module.exports=function registerEnterpriseApi({app,auth,admin,clean,id,getStore,saveStore}){
  const PARTNER_LEVELS=['community','certified','gold','platinum'];
  const PARTNER_CATEGORIES=['technology','developer','agency','creator','education','church-community','enterprise','hardware','ai','nonprofit','government','global'];
  const PLAN_CATALOG={
    business:{name:'AMM Business',monthlyCents:49900,features:['5 seats','AI business center','creator studio','basic analytics','standard support']},
    enterprise:{name:'AMM Enterprise',monthlyCents:250000,features:['50 seats','enterprise command center','automation','advanced analytics','partner marketplace access']},
    enterprisePlus:{name:'AMM Enterprise Plus',monthlyCents:1000000,features:['250 seats','dedicated success manager','digital twin pilot','premium support','custom integrations']},
    global:{name:'AMM Global Enterprise',monthlyCents:null,features:['multi-region deployment','custom data residency','mission-critical support','executive governance','custom commercial terms']}
  };

  function store(){return getStore()}
  function now(){return new Date().toISOString()}
  function ensureCollections(){
    const s=store();
    s.organizations=s.organizations||[];
    s.organizationMembers=s.organizationMembers||[];
    s.partners=s.partners||[];
    s.partnerLeads=s.partnerLeads||[];
    s.enterpriseSubscriptions=s.enterpriseSubscriptions||[];
    s.enterpriseEvents=s.enterpriseEvents||[];
  }
  function membership(userId,organizationId){return store().organizationMembers.find(m=>m.userId===userId&&m.organizationId===organizationId&&m.status==='active')}
  function canManage(user,organizationId){return user.role==='admin'||['owner','admin'].includes(membership(user.id,organizationId)?.role)}
  function audit(type,userId,organizationId,details={}){store().enterpriseEvents.push({id:id('evt'),type,userId,organizationId:organizationId||null,details,createdAt:now()})}

  app.get('/api/enterprise/plans',(_req,res)=>res.json({plans:PLAN_CATALOG,currency:'usd',note:'Global Enterprise requires a scoped proposal and signed agreement.'}));

  app.get('/api/enterprise/overview',auth,(req,res)=>{
    ensureCollections();
    const s=store();
    const organizations=s.organizationMembers.filter(m=>m.userId===req.user.id&&m.status==='active').map(m=>{
      const organization=s.organizations.find(o=>o.id===m.organizationId);
      return organization&&{...organization,membershipRole:m.role};
    }).filter(Boolean);
    const partner=s.partners.find(p=>p.ownerUserId===req.user.id);
    res.json({organizations,partner,plans:PLAN_CATALOG});
  });

  app.post('/api/enterprise/organizations',auth,async(req,res)=>{
    ensureCollections();
    const name=clean(req.body.name,120),industry=clean(req.body.industry,80)||'business',size=clean(req.body.size,40)||'small';
    if(name.length<2)return res.status(400).json({error:'Organization name is required'});
    const organization={id:id('org'),name,industry,size,website:clean(req.body.website,240),country:clean(req.body.country,80)||'United States',status:'active',createdBy:req.user.id,createdAt:now(),modules:['command-center','analytics','partner-network']};
    store().organizations.push(organization);
    store().organizationMembers.push({id:id('mem'),organizationId:organization.id,userId:req.user.id,role:'owner',status:'active',createdAt:now()});
    audit('organization.created',req.user.id,organization.id,{name});
    await saveStore();
    res.status(201).json({organization});
  });

  app.get('/api/enterprise/organizations/:organizationId',auth,(req,res)=>{
    ensureCollections();
    const organization=store().organizations.find(o=>o.id===req.params.organizationId);
    if(!organization)return res.status(404).json({error:'Organization not found'});
    if(!membership(req.user.id,organization.id)&&req.user.role!=='admin')return res.status(403).json({error:'Organization access required'});
    const members=store().organizationMembers.filter(m=>m.organizationId===organization.id&&m.status==='active');
    const subscriptions=store().enterpriseSubscriptions.filter(s=>s.organizationId===organization.id);
    const events=store().enterpriseEvents.filter(e=>e.organizationId===organization.id).slice(-25).reverse();
    res.json({organization,members,subscriptions,events});
  });

  app.post('/api/enterprise/organizations/:organizationId/members',auth,async(req,res)=>{
    ensureCollections();
    if(!canManage(req.user,req.params.organizationId))return res.status(403).json({error:'Organization administrator access required'});
    const email=clean(req.body.email,200).toLowerCase(),role=clean(req.body.role,30)||'member',user=store().users.find(u=>u.email===email);
    if(!user)return res.status(404).json({error:'The invited person must create a TryAMM account first'});
    if(!['admin','manager','member','analyst','developer'].includes(role))return res.status(400).json({error:'Unsupported organization role'});
    const existing=store().organizationMembers.find(m=>m.organizationId===req.params.organizationId&&m.userId===user.id);
    if(existing){existing.role=role;existing.status='active'}else store().organizationMembers.push({id:id('mem'),organizationId:req.params.organizationId,userId:user.id,role,status:'active',createdAt:now()});
    audit('organization.member_added',req.user.id,req.params.organizationId,{memberUserId:user.id,role});
    await saveStore();
    res.status(201).json({ok:true});
  });

  app.post('/api/enterprise/organizations/:organizationId/subscribe',auth,async(req,res)=>{
    ensureCollections();
    if(!canManage(req.user,req.params.organizationId))return res.status(403).json({error:'Organization administrator access required'});
    const plan=clean(req.body.plan,40);
    if(!PLAN_CATALOG[plan])return res.status(400).json({error:'Unknown enterprise plan'});
    const subscription={id:id('sub'),organizationId:req.params.organizationId,plan,status:'pending-sales-review',monthlyCents:PLAN_CATALOG[plan].monthlyCents,createdBy:req.user.id,createdAt:now()};
    store().enterpriseSubscriptions.push(subscription);
    audit('enterprise.subscription_requested',req.user.id,req.params.organizationId,{plan});
    await saveStore();
    res.status(201).json({subscription,message:'Request recorded. High-value enterprise plans require scope, security, and contract review before activation.'});
  });

  app.get('/api/partners/catalog',(_req,res)=>res.json({levels:PARTNER_LEVELS,categories:PARTNER_CATEGORIES,benefits:{community:['referrals','training','directory listing'],certified:['certification badge','co-marketing','priority support'],gold:['lead sharing','incentives','partner manager'],platinum:['joint planning','executive reviews','dedicated engineering channel']}}));

  app.post('/api/partners/apply',auth,async(req,res)=>{
    ensureCollections();
    if(store().partners.some(p=>p.ownerUserId===req.user.id&&p.status!=='rejected'))return res.status(409).json({error:'A partner application already exists'});
    const organizationName=clean(req.body.organizationName,120),category=clean(req.body.category,60),summary=clean(req.body.summary,1000);
    if(organizationName.length<2||!PARTNER_CATEGORIES.includes(category)||summary.length<30)return res.status(400).json({error:'Organization, valid category, and a detailed summary are required'});
    const partner={id:id('ptr'),ownerUserId:req.user.id,organizationName,category,level:'community',status:'pending-review',website:clean(req.body.website,240),country:clean(req.body.country,80)||'United States',summary,referralCode:cryptoSafeCode(organizationName),certifications:[],revenueCents:0,createdAt:now()};
    store().partners.push(partner);
    audit('partner.application_submitted',req.user.id,null,{partnerId:partner.id,category});
    await saveStore();
    res.status(201).json({partner});
  });

  app.post('/api/partners/:partnerId/leads',auth,async(req,res)=>{
    ensureCollections();
    const partner=store().partners.find(p=>p.id===req.params.partnerId);
    if(!partner)return res.status(404).json({error:'Partner not found'});
    if(partner.ownerUserId!==req.user.id&&req.user.role!=='admin')return res.status(403).json({error:'Partner access required'});
    const company=clean(req.body.company,120),contactName=clean(req.body.contactName,100),contactEmail=clean(req.body.contactEmail,200).toLowerCase(),estimatedValueCents=Math.max(0,Number(req.body.estimatedValueCents||0));
    if(!company||!contactName||!/^\S+@\S+\.\S+$/.test(contactEmail))return res.status(400).json({error:'Company and valid contact details are required'});
    const lead={id:id('lead'),partnerId:partner.id,company,contactName,contactEmail,estimatedValueCents,status:'submitted',createdAt:now()};
    store().partnerLeads.push(lead);
    audit('partner.lead_submitted',req.user.id,null,{partnerId:partner.id,leadId:lead.id});
    await saveStore();
    res.status(201).json({lead});
  });

  app.get('/api/admin/enterprise',auth,admin,(_req,res)=>{
    ensureCollections();
    const s=store();
    const pipelineCents=s.partnerLeads.reduce((sum,lead)=>sum+(lead.estimatedValueCents||0),0);
    res.json({organizations:s.organizations.length,activeMembers:s.organizationMembers.filter(m=>m.status==='active').length,partnerApplications:s.partners.length,pendingPartners:s.partners.filter(p=>p.status==='pending-review').length,subscriptionRequests:s.enterpriseSubscriptions.length,partnerPipelineCents:pipelineCents,recentEvents:s.enterpriseEvents.slice(-50).reverse()});
  });

  function cryptoSafeCode(value){return String(value||'AMM').replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,8)+'-'+Math.random().toString(36).slice(2,8).toUpperCase()}
};
