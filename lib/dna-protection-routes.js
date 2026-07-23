function registerDnaProtectionRoutes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/dna-protection', (_req,res)=>res.json(manifest));
  app.get('/api/dna-protection/report', requireInternalSecret, (_req,res)=>res.json(manager.report()));
  app.post('/api/dna-protection/register', requireInternalSecret, (req,res)=>{ try { const record=manager.register(req.body||{}); appendAudit({event:'dna.registered',dnaId:record.id,assetId:record.assetId,at:new Date().toISOString()}); res.status(201).json(record); } catch(e){ res.status(400).json({error:e.message}); } });
  app.post('/api/dna-protection/verify', requireInternalSecret, (req,res)=>res.json(manager.verify(req.body||{})));
  app.get('/api/dna-protection/:id', requireInternalSecret, (req,res)=>{ const record=manager.get(req.params.id); if(!record) return res.status(404).json({error:'DNA record not found'}); res.json(record); });
  app.get('/api/dna-protection/:id/lineage', requireInternalSecret, (req,res)=>{ const record=manager.get(req.params.id); if(!record) return res.status(404).json({error:'DNA record not found'}); res.json({lineage:manager.lineage(req.params.id)}); });
  app.post('/api/dna-protection/:id/attest', requireInternalSecret, (req,res)=>{ const record=manager.attest(req.params.id,req.body||{}); if(!record) return res.status(404).json({error:'DNA record not found'}); appendAudit({event:'dna.attested',dnaId:record.id,assetId:record.assetId,at:new Date().toISOString()}); res.json(record); });
  app.get('/api/dna-protection/:id/publish-ready', requireInternalSecret, (req,res)=>{ const record=manager.get(req.params.id); if(!record) return res.status(404).json({error:'DNA record not found'}); res.json({dnaId:record.id,publishReady:manager.canPublish(record.id)}); });
}
module.exports={registerDnaProtectionRoutes};
