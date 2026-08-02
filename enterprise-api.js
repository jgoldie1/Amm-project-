'use strict';
const crypto=require('crypto');

module.exports=function registerEnterpriseApi({app,auth,admin,clean,id,getStore,saveStore}){
  const PARTNER_LEVELS=['community','certified','gold','platinum'];
  const PARTNER_CATEGORIES=['technology','developer','agency','creator','education','church-community','enterprise','hardware','ai','nonprofit','government','global'];
  const ORG_ROLES=['admin','manager','member','analyst','developer'];
  const PLAN_CATALOG={
    business:{name:'AMM Business',monthlyCents:49900,features:['5 seats','AI business center','creator studio','basic analytics','standard support']},
    enterprise:{name:'AMM Enterprise',monthlyCents:250000,features:['50 seats','enterprise command center','automation','advanced analytics','partner marketplace access']},
    enterprisePlus:{name:'AMM Enterprise Plus',monthlyCents:1000000,features:['250 seats','dedicated success manager','digital twin pilot','premium support','custom integrations']},
    global:{name:'AMM Global Enterprise',monthlyCents:null,features:['multi-region deployment','custom data residency','mission-critical support','executive governance','custom commercial terms']}
  };
  const CERTIFICATION_CATALOG=[
    {slug:'developer',name:'AMM Certified Developer',priceCents:29900},
    {slug:'ai-builder',name:'AMM Certified AI Builder',priceCents:39900},
    {slug:'creator',name:'AMM Certified Creator',priceCents:14900},
    {slug:'enterprise-consultant',name:'AMM Certified Enterprise Consultant',priceCents:49900},
    {slug:'streaming',name:'AMM Certified Streaming Professional',priceCents:24900},
    {slug:'xr-developer',name:'AMM Certified XR Developer',priceCents:49900}
  ];

  function store(){return getStore()}
  function now(){return new Date().toISOString()}
  function ensureCollections(){
    const s=store();
    for(const key of ['organizations','organizationMembers','partners','partnerLeads','partnerOpportunities','partnerCertifications','partnerListings','partnerTickets','partnerApiKeys','enterpriseSubscriptions','enterpriseEvents'])s[key]=s[key]||[];
  }
  function membership(userId,organizationId){return store().organizationMembers.find(m=>m.userId===userId&&m.organizationId===organizationId&&m.status==='active')}
  function canManage(user,organizationId){return user.role==='admin'||['owner','admin'].includes(membership(user.id,organizationId)?.role)}
  function partnerForUser(user){return store().partners.find(p=>p.ownerUserId===user.id)}
  function canManagePartner(user,partnerId){const p=store().partners.find(item=>item.id===partnerId);return p&&(p.ownerUserId===user.id||user.role==='admin')}
  function audit(type,userId,organizationId,details={}){store().enterpriseEvents.push({id:id('evt'),type,userId,organizationId:organizationId||null,details,createdAt:now()})}
  function safeCode(value){return String(value||'AMM').replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,8)+'-'+crypto.randomBytes(4).toString('hex').toUpperCase()}
  function publicApiKey(record){return{...record,secretHash:undefined,secretPreview:record.secretPreview||'••••'}}

  app.get('/api/enterprise/plans',(_req,res)=>res.json({plans:PLAN_CATALOG,currency:'usd',note:'Global Enterprise requires a scoped proposal and signed agreement.'}));
  app.get('/api/partners/catalog',(_req,res)=>res.json({levels:PARTNER_LEVELS,categories:PARTNER_CATEGORIES,certifications:CERTIFICATION_CATALOG,benefits:{community:['referrals','training','directory listing'],certified:['certification badge','co-marketing','priority support'],gold:['lead sharing','incentives','partner manager'],platinum:['joint planning','executive reviews','dedicated engineering channel']}}));

  app.get('/api/enterprise/overview',auth,(req,res)=>{
    ensureCollections();const s=store();
    const organizations=s.organizationMembers.filter(m=>m.userId===req.user.id&&m.status==='active').map(m=>{const organization=s.organizations.find(o=>o.id===m.organizationId);return organization&&{...organization,membershipRole:m.role}}).filter(Boolean);
    const partner=partnerForUser(req.user);
    const partnerSummary=partner?{
      ...partner,
      leads:s.partnerLeads.filter(x=>x.partnerId===partner.id),
      opportunities:s.partnerOpportunities.filter(x=>!x.partnerId||x.partnerId===partner.id),
      certifications:s.partnerCertifications.filter(x=>x.partnerId===partner.id),
      listings:s.partnerListings.filter(x=>x.partnerId===partner.id),
      tickets:s.partnerTickets.filter(x=>x.partnerId===partner.id),
      apiKeys:s.partnerApiKeys.filter(x=>x.partnerId===partner.id).map(publicApiKey)
    }:null;
    res.json({organizations,partner:partnerSummary,plans:PLAN_CATALOG});
  });

  app.post('/api/enterprise/organizations',auth,async(req,res)=>{
    ensureCollections();const name=clean(req.body.name,120),industry=clean(req.body.industry,80)||'business',size=clean(req.body.size,40)||'small';
    if(name.length<2)return res.status(400).json({error:'Organization name is required'});
    const organization={id:id('org'),name,industry,size,website:clean(req.body.website,240),country:clean(req.body.country,80)||'United States',status:'active',createdBy:req.user.id,createdAt:now(),modules:['command-center','analytics','partner-network']};
    store().organizations.push(organization);store().organizationMembers.push({id:id('mem'),organizationId:organization.id,userId:req.user.id,role:'owner',status:'active',createdAt:now()});audit('organization.created',req.user.id,organization.id,{name});await saveStore();res.status(201).json({organization});
  });

  app.get('/api/enterprise/organizations/:organizationId',auth,(req,res)=>{
    ensureCollections();const organization=store().organizations.find(o=>o.id===req.params.organizationId);
    if(!organization)return res.status(404).json({error:'Organization not found'});
    if(!membership(req.user.id,organization.id)&&req.user.role!=='admin')return res.status(403).json({error:'Organization access required'});
    const members=store().organizationMembers.filter(m=>m.organizationId===organization.id&&m.status==='active').map(m=>({...m,user:store().users.find(u=>u.id===m.userId)?{id:m.userId,displayName:store().users.find(u=>u.id===m.userId).displayName,email:store().users.find(u=>u.id===m.userId).email}:null}));
    const subscriptions=store().enterpriseSubscriptions.filter(s=>s.organizationId===organization.id);const events=store().enterpriseEvents.filter(e=>e.organizationId===organization.id).slice(-25).reverse();res.json({organization,members,subscriptions,events});
  });

  app.post('/api/enterprise/organizations/:organizationId/members',auth,async(req,res)=>{
    ensureCollections();if(!canManage(req.user,req.params.organizationId))return res.status(403).json({error:'Organization administrator access required'});
    const email=clean(req.body.email,200).toLowerCase(),role=clean(req.body.role,30)||'member',user=store().users.find(u=>u.email===email);
    if(!user)return res.status(404).json({error:'The invited person must create a TryAMM account first'});if(!ORG_ROLES.includes(role))return res.status(400).json({error:'Unsupported organization role'});
    const existing=store().organizationMembers.find(m=>m.organizationId===req.params.organizationId&&m.userId===user.id);if(existing){existing.role=role;existing.status='active'}else store().organizationMembers.push({id:id('mem'),organizationId:req.params.organizationId,userId:user.id,role,status:'active',createdAt:now()});audit('organization.member_added',req.user.id,req.params.organizationId,{memberUserId:user.id,role});await saveStore();res.status(201).json({ok:true});
  });

  app.post('/api/enterprise/organizations/:organizationId/subscribe',auth,async(req,res)=>{
    ensureCollections();if(!canManage(req.user,req.params.organizationId))return res.status(403).json({error:'Organization administrator access required'});const plan=clean(req.body.plan,40);if(!PLAN_CATALOG[plan])return res.status(400).json({error:'Unknown enterprise plan'});
    const subscription={id:id('sub'),organizationId:req.params.organizationId,plan,status:'pending-sales-review',monthlyCents:PLAN_CATALOG[plan].monthlyCents,createdBy:req.user.id,createdAt:now()};store().enterpriseSubscriptions.push(subscription);audit('enterprise.subscription_requested',req.user.id,req.params.organizationId,{plan});await saveStore();res.status(201).json({subscription,message:'Request recorded. High-value enterprise plans require scope, security, and contract review before activation.'});
  });

  app.post('/api/partners/apply',auth,async(req,res)=>{
    ensureCollections();if(store().partners.some(p=>p.ownerUserId===req.user.id&&p.status!=='rejected'))return res.status(409).json({error:'A partner application already exists'});
    const organizationName=clean(req.body.organizationName,120),category=clean(req.body.category,60),summary=clean(req.body.summary,1000);if(organizationName.length<2||!PARTNER_CATEGORIES.includes(category)||summary.length<30)return res.status(400).json({error:'Organization, valid category, and a detailed summary are required'});
    const partner={id:id('ptr'),ownerUserId:req.user.id,organizationName,category,level:'community',status:'pending-review',website:clean(req.body.website,240),country:clean(req.body.country,80)||'United States',summary,referralCode:safeCode(organizationName),certifications:[],revenueCents:0,createdAt:now()};store().partners.push(partner);audit('partner.application_submitted',req.user.id,null,{partnerId:partner.id,category});await saveStore();res.status(201).json({partner});
  });

  app.post('/api/partners/:partnerId/leads',auth,async(req,res)=>{
    ensureCollections();if(!canManagePartner(req.user,req.params.partnerId))return res.status(403).json({error:'Partner access required'});
    const company=clean(req.body.company,120),contactName=clean(req.body.contactName,100),contactEmail=clean(req.body.contactEmail,200).toLowerCase(),estimatedValueCents=Math.max(0,Number(req.body.estimatedValueCents||0));if(!company||!contactName||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail))return res.status(400).json({error:'Company and valid contact details are required'});
    const lead={id:id('lead'),partnerId:req.params.partnerId,company,contactName,contactEmail,estimatedValueCents,status:'submitted',createdAt:now()};store().partnerLeads.push(lead);audit('partner.lead_submitted',req.user.id,null,{partnerId:req.params.partnerId,leadId:lead.id});await saveStore();res.status(201).json({lead});
  });

  app.post('/api/partners/:partnerId/certifications',auth,async(req,res)=>{
    ensureCollections();if(!canManagePartner(req.user,req.params.partnerId))return res.status(403).json({error:'Partner access required'});const certification=CERTIFICATION_CATALOG.find(c=>c.slug===clean(req.body.certification,60));if(!certification)return res.status(400).json({error:'Unknown certification'});
    const existing=store().partnerCertifications.find(c=>c.partnerId===req.params.partnerId&&c.certification===certification.slug&&c.status!=='expired');if(existing)return res.status(409).json({error:'Certification enrollment already exists'});
    const enrollment={id:id('cert'),partnerId:req.params.partnerId,certification:certification.slug,name:certification.name,status:'enrolled',priceCents:certification.priceCents,progressPercent:0,createdAt:now()};store().partnerCertifications.push(enrollment);audit('partner.certification_enrolled',req.user.id,null,{partnerId:req.params.partnerId,certification:certification.slug});await saveStore();res.status(201).json({enrollment});
  });

  app.post('/api/partners/:partnerId/listings',auth,async(req,res)=>{
    ensureCollections();if(!canManagePartner(req.user,req.params.partnerId))return res.status(403).json({error:'Partner access required'});const title=clean(req.body.title,120),type=clean(req.body.type,40),description=clean(req.body.description,1200),priceCents=Math.max(0,Number(req.body.priceCents||0));if(title.length<3||description.length<30)return res.status(400).json({error:'A title and detailed description are required'});
    const listing={id:id('lst'),partnerId:req.params.partnerId,title,type:type||'service',description,priceCents,status:'pending-review',createdAt:now()};store().partnerListings.push(listing);audit('partner.listing_submitted',req.user.id,null,{partnerId:req.params.partnerId,listingId:listing.id});await saveStore();res.status(201).json({listing});
  });

  app.post('/api/partners/:partnerId/tickets',auth,async(req,res)=>{
    ensureCollections();if(!canManagePartner(req.user,req.params.partnerId))return res.status(403).json({error:'Partner access required'});const subject=clean(req.body.subject,120),message=clean(req.body.message,2000),priority=clean(req.body.priority,20)||'normal';if(subject.length<3||message.length<10)return res.status(400).json({error:'Subject and message are required'});
    const ticket={id:id('tkt'),partnerId:req.params.partnerId,subject,message,priority,status:'open',createdBy:req.user.id,createdAt:now()};store().partnerTickets.push(ticket);audit('partner.ticket_created',req.user.id,null,{partnerId:req.params.partnerId,ticketId:ticket.id});await saveStore();res.status(201).json({ticket});
  });

  app.post('/api/partners/:partnerId/api-keys',auth,async(req,res)=>{
    ensureCollections();if(!canManagePartner(req.user,req.params.partnerId))return res.status(403).json({error:'Partner access required'});const label=clean(req.body.label,80)||'Partner integration',raw=`amm_${crypto.randomBytes(24).toString('hex')}`;const record={id:id('key'),partnerId:req.params.partnerId,label,secretHash:crypto.createHash('sha256').update(raw).digest('hex'),secretPreview:raw.slice(0,10)+'…'+raw.slice(-4),status:'active',createdAt:now()};store().partnerApiKeys.push(record);audit('partner.api_key_created',req.user.id,null,{partnerId:req.params.partnerId,keyId:record.id});await saveStore();res.status(201).json({apiKey:raw,record:publicApiKey(record),warning:'Copy this key now. It will not be shown again.'});
  });

  app.get('/api/partners/directory',(_req,res)=>{ensureCollections();const partners=store().partners.filter(p=>['approved','active'].includes(p.status)).map(p=>({id:p.id,organizationName:p.organizationName,category:p.category,level:p.level,country:p.country,website:p.website,summary:p.summary,certifications:store().partnerCertifications.filter(c=>c.partnerId===p.id&&c.status==='completed').map(c=>c.name)}));res.json({partners});});
  app.get('/api/partners/marketplace',(_req,res)=>{ensureCollections();res.json({listings:store().partnerListings.filter(l=>l.status==='approved')});});

  app.get('/api/admin/enterprise',auth,admin,(_req,res)=>{
    ensureCollections();const s=store(),pipelineCents=s.partnerLeads.reduce((sum,lead)=>sum+(lead.estimatedValueCents||0),0),marketplaceValueCents=s.partnerListings.reduce((sum,item)=>sum+(item.priceCents||0),0);
    res.json({organizations:s.organizations.length,activeMembers:s.organizationMembers.filter(m=>m.status==='active').length,partnerApplications:s.partners.length,pendingPartners:s.partners.filter(p=>p.status==='pending-review').length,subscriptionRequests:s.enterpriseSubscriptions.length,partnerPipelineCents:pipelineCents,marketplaceListings:s.partnerListings.length,marketplaceValueCents,openPartnerTickets:s.partnerTickets.filter(t=>t.status==='open').length,certificationEnrollments:s.partnerCertifications.length,recentEvents:s.enterpriseEvents.slice(-50).reverse()});
  });
};