'use strict';
const ip=require('./ip-command-center');
const portfolio=require('./ip-portfolio');
const warehouse=require('./warehouse-network');
const routing=require('./warehouse-routing');
const legal=require('./ai-legal-compliance');
const regulatory=require('./regulatory-graph');
const readiness=require('./compliance-readiness');
const vault=require('./credential-vault');
const trust=require('./trust-network');
const risk=require('./trust-risk');
const disputes=require('./dispute-resolution');
const claims=require('./claims-holds');

module.exports=function registerGovernance({app,auth,admin,getStore,saveStore}){
  function state(){const s=getStore();s.governance||={inventions:[],ipPortfolio:[],warehouses:[],credentials:[],trustCredentials:[],riskSignals:[],regulatoryRequirements:[],disputes:[],holds:[],claims:[]};return s.governance;}
  app.get('/api/governance/status',auth,(req,res)=>{const s=state();res.json({counts:{inventions:s.inventions.length,ipPortfolio:s.ipPortfolio.length,warehouses:s.warehouses.length,credentials:s.credentials.length,trustCredentials:s.trustCredentials.length,riskSignals:s.riskSignals.length,regulatoryRequirements:s.regulatoryRequirements.length,disputes:s.disputes.length,holds:s.holds.length,claims:s.claims.length},principles:{aiLegalAuthority:'prepare-only for high-impact actions',providerCustody:true,appeals:true,protectedCharacteristicsExcluded:true}})});

  app.post('/api/governance/ip/inventions',auth,async(req,res)=>{const s=state();const inv=ip.createInvention({...req.body,inventors:Array.isArray(req.body.inventors)&&req.body.inventors.length?req.body.inventors:[req.user.displayName||req.user.email||req.user.id]});s.inventions.push(inv);const rec=portfolio.portfolioRecord({invention:inv,priority:req.body.priority,jurisdictions:req.body.jurisdictions,estimatedBudget:req.body.estimatedBudget,ownerEntity:req.body.ownerEntity});s.ipPortfolio.push(rec);await saveStore();res.status(201).json({invention:inv,portfolio:rec,triage:ip.triage(inv),priorArt:ip.priorArtQueries(inv)});});
  app.get('/api/governance/ip',auth,(_req,res)=>{const s=state();res.json({inventions:s.inventions,portfolio:s.ipPortfolio})});

  app.post('/api/governance/warehouses',auth,admin,async(req,res)=>{const s=state();const w=warehouse.normalizeWarehouse(req.body);s.warehouses.push(w);await saveStore();res.status(201).json({warehouse:w})});
  app.post('/api/governance/warehouse/quote',auth,(req,res)=>{res.json({quote:warehouse.quoteWarehouse(req.body)})});
  app.post('/api/governance/warehouse/allocate',auth,(req,res)=>{const s=state();res.json(routing.allocateInventory({...req.body,warehouses:req.body.warehouses||s.warehouses}))});

  app.post('/api/governance/regulatory/requirements',auth,admin,async(req,res)=>{const s=state();const r=regulatory.requirement(req.body);s.regulatoryRequirements.push(r);await saveStore();res.status(201).json({requirement:r})});
  app.post('/api/governance/compliance/readiness',auth,(req,res)=>{const s=state(),graph=regulatory.buildGraph(s.regulatoryRequirements);res.json(readiness.readiness({...req.body,graph}))});
  app.post('/api/governance/legal/gate',auth,(req,res)=>res.json(legal.gateAction(req.body)));
  app.post('/api/governance/legal/contract-review',auth,(req,res)=>res.json(legal.contractReview(req.body)));

  app.post('/api/governance/credentials',auth,admin,async(req,res)=>{const s=state();const c=req.body.type==='insurance'?vault.insurance(req.body):vault.credential(req.body);s.credentials.push(c);await saveStore();res.status(201).json({credential:c})});
  app.post('/api/governance/credentials/gate',auth,(req,res)=>{const s=state();res.json(vault.capabilityGate({...req.body,credentials:s.credentials}))});

  app.post('/api/governance/trust/credential',auth,admin,async(req,res)=>{const s=state();const c=trust.trustCredential(req.body);s.trustCredentials.push(c);await saveStore();res.status(201).json({credential:c})});
  app.post('/api/governance/trust/risk-signal',auth,admin,async(req,res)=>{const s=state();const sig=risk.signal(req.body);s.riskSignals.push(sig);await saveStore();res.status(201).json({signal:sig})});
  app.get('/api/governance/trust/passport/:subjectId',auth,(req,res)=>{const s=state(),cred=s.trustCredentials.filter(x=>x.subjectId===req.params.subjectId&&x.status==='active').at(-1),signals=s.riskSignals.filter(x=>x.subjectId===req.params.subjectId);res.json(risk.passport({subjectId:req.params.subjectId,trustCredential:cred,signals}))});

  app.post('/api/governance/disputes',auth,async(req,res)=>{const s=state();const c=disputes.createCase({...req.body,openedBy:req.user.id});s.disputes.push(c);await saveStore();res.status(201).json({case:c,mediation:disputes.mediationPlan(c)})});
  app.get('/api/governance/disputes',auth,(req,res)=>{const s=state();res.json({cases:s.disputes.filter(c=>c.openedBy===req.user.id||c.parties.includes(req.user.id)||req.user.role==='admin')})});
  app.post('/api/governance/disputes/:id/evidence',auth,async(req,res)=>{const s=state(),i=s.disputes.findIndex(c=>c.id===req.params.id&&(c.openedBy===req.user.id||c.parties.includes(req.user.id)||req.user.role==='admin'));if(i<0)return res.status(404).json({error:'Case not found'});s.disputes[i]=disputes.addEvidence(s.disputes[i],{...req.body,submittedBy:req.user.id});await saveStore();res.json({case:s.disputes[i]})});
  app.post('/api/governance/disputes/:id/appeal',auth,async(req,res)=>{const s=state(),i=s.disputes.findIndex(c=>c.id===req.params.id&&(c.openedBy===req.user.id||c.parties.includes(req.user.id)));if(i<0)return res.status(404).json({error:'Case not found'});s.disputes[i]=disputes.appeal(s.disputes[i],{...req.body,by:req.user.id});await saveStore();res.json({case:s.disputes[i]})});

  app.post('/api/governance/holds',auth,admin,async(req,res)=>{const s=state();const h=claims.hold(req.body);s.holds.push(h);await saveStore();res.status(201).json({hold:h})});
  app.post('/api/governance/claims',auth,async(req,res)=>{const s=state();const c=claims.claim(req.body);s.claims.push(c);await saveStore();res.status(201).json({claim:c})});
};
