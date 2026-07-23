function registerMobilityOnboardingRoutes({ app, readiness, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/mobility/readiness', (_req, res) => res.json(readiness));

  app.post('/api/mobility/onboarding', (req, res) => {
    try {
      const record = manager.createApplication(req.body || {});
      appendAudit({ event: 'mobility.onboarding.created', record, at: new Date().toISOString() });
      res.status(201).json(record);
    } catch (error) {
      res.status(error.message === 'INVALID_ROLE' ? 400 : 500).json({ error: error.message });
    }
  });

  app.get('/api/mobility/onboarding', requireInternalSecret, (req, res) => res.json({ applications: manager.listApplications(req.query || {}) }));
  app.get('/api/mobility/onboarding/:id', requireInternalSecret, (req, res) => {
    const record = manager.getApplication(req.params.id); if (!record) return res.status(404).json({ error: 'Application not found' }); res.json(record);
  });
  app.post('/api/mobility/onboarding/:id/documents', requireInternalSecret, (req, res) => {
    const record = manager.addDocument(req.params.id, req.body || {}); if (!record) return res.status(404).json({ error: 'Application not found' });
    appendAudit({ event: 'mobility.onboarding.document', applicationId: record.id, at: new Date().toISOString() }); res.json(record);
  });
  app.post('/api/mobility/onboarding/:id/gates/:gate', requireInternalSecret, (req, res) => {
    const record = manager.updateGate(req.params.id, req.params.gate, req.body || {}); if (!record) return res.status(404).json({ error: 'Application or gate not found' });
    appendAudit({ event: 'mobility.onboarding.gate', applicationId: record.id, gate: req.params.gate, snapshot: record, at: new Date().toISOString() }); res.json(record);
  });

  app.post('/api/mobility/markets', requireInternalSecret, (req, res) => {
    const market = manager.createMarket(req.body || {}); appendAudit({ event: 'mobility.market.created', market, at: new Date().toISOString() }); res.status(201).json(market);
  });
  app.get('/api/mobility/markets', requireInternalSecret, (_req, res) => res.json({ markets: manager.listMarkets().map((market) => ({ ...market, readiness: manager.readinessScore(market) })) }));
  app.get('/api/mobility/markets/:id', requireInternalSecret, (req, res) => {
    const market = manager.getMarket(req.params.id); if (!market) return res.status(404).json({ error: 'Market not found' }); res.json({ ...market, readiness: manager.readinessScore(market) });
  });
  app.post('/api/mobility/markets/:id', requireInternalSecret, (req, res) => {
    const market = manager.updateMarket(req.params.id, req.body || {}); if (!market) return res.status(404).json({ error: 'Market not found' });
    appendAudit({ event: 'mobility.market.updated', marketId: market.id, snapshot: market, at: new Date().toISOString() }); res.json({ ...market, readiness: manager.readinessScore(market) });
  });
}
module.exports = { registerMobilityOnboardingRoutes };
