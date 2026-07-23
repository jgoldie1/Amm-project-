function registerCostOpsRoutes({ app, manager, pricing, requireInternalSecret, appendAudit }) {
  app.get('/api/costops/asset-pricing', (_req,res) => res.json(pricing));
  app.post('/api/costops/quotes/asset-generation', requireInternalSecret, (req,res) => { try { const quote=manager.quoteAssetGeneration(req.body||{}); appendAudit({event:'costops.quote.created',quoteId:quote.id,at:new Date().toISOString()}); res.status(201).json(quote); } catch(e){ res.status(400).json({error:e.message}); } });
  app.get('/api/costops/quotes/:id', requireInternalSecret, (req,res) => { const quote=manager.getQuote(req.params.id); if(!quote) return res.status(404).json({error:'Quote not found'}); res.json(quote); });
  app.post('/api/costops/quotes/:id/authorize', requireInternalSecret, (req,res) => { try { const quote=manager.authorizeQuote(req.params.id,req.body||{}); if(!quote) return res.status(404).json({error:'Quote not found'}); appendAudit({event:'costops.quote.authorized',quoteId:quote.id,at:new Date().toISOString()}); res.json(quote); } catch(e){ res.status(409).json({error:e.message}); } });
  app.post('/api/costops/quotes/:id/jobs', requireInternalSecret, (req,res) => { try { const job=manager.createJobFromQuote(req.params.id,req.body||{}); appendAudit({event:'costops.job.created',jobId:job.id,quoteId:job.quoteId,at:new Date().toISOString()}); res.status(201).json(job); } catch(e){ res.status(409).json({error:e.message}); } });
  app.get('/api/costops/jobs/:id', requireInternalSecret, (req,res) => { const job=manager.getJob(req.params.id); if(!job) return res.status(404).json({error:'Job not found'}); res.json(job); });
  app.post('/api/costops/jobs/:id/settle', requireInternalSecret, (req,res) => { const job=manager.settleJob(req.params.id,req.body||{}); if(!job) return res.status(404).json({error:'Job not found'}); appendAudit({event:'costops.job.settled',jobId:job.id,at:new Date().toISOString()}); res.json(job); });
  app.get('/api/costops/report', requireInternalSecret, (_req,res) => res.json(manager.report()));
}
module.exports={registerCostOpsRoutes};
