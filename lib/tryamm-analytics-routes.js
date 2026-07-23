function registerTryAmmAnalyticsRoutes({ app, manager, manifest, requireInternalSecret, appendAudit }) {
  app.get('/api/analytics/manifest', (_req,res) => res.json(manifest));
  app.post('/api/analytics/events', (req,res) => { try { const event=manager.track(req.body||{}); res.status(201).json({ok:true,id:event.id}); } catch(e){ res.status(400).json({error:e.message}); } });
  app.post('/api/inbound/leads', (req,res) => { try { const lead=manager.createLead(req.body||{}); appendAudit({event:'inbound.lead.created',leadId:lead.id,at:new Date().toISOString()}); res.status(201).json({ok:true,id:lead.id}); } catch(e){ res.status(400).json({error:e.message}); } });
  app.get('/api/analytics/summary', requireInternalSecret, (_req,res) => res.json(manager.summary()));
  app.get('/api/analytics/events', requireInternalSecret, (req,res) => res.json({events:manager.listEvents(req.query.limit)}));
}
module.exports={registerTryAmmAnalyticsRoutes};
