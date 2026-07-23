function registerEconomicOpportunityRoutes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/economic-opportunity', (_req, res) => res.json(manifest));

  app.get('/api/economic-opportunity/:id', (req, res) => {
    const domain = manager.getDomain(req.params.id);
    if (!domain) return res.status(404).json({ error: 'Domain not found' });
    res.json(domain);
  });

  app.post('/api/economic-opportunity/requests', requireInternalSecret, (req, res) => {
    try {
      const record = manager.create(req.body || {});
      appendAudit({ event: 'economic-opportunity.request.created', record, at: new Date().toISOString() });
      res.status(201).json(record);
    } catch (error) {
      res.status(error.message === 'UNKNOWN_DOMAIN' ? 400 : 500).json({ error: error.message });
    }
  });

  app.get('/api/economic-opportunity/requests/list', requireInternalSecret, (req, res) => {
    res.json({ requests: manager.list(req.query.domainId) });
  });

  app.get('/api/economic-opportunity/requests/:id', requireInternalSecret, (req, res) => {
    const record = manager.get(req.params.id);
    if (!record) return res.status(404).json({ error: 'Request not found' });
    res.json(record);
  });

  app.post('/api/economic-opportunity/requests/:id/status', requireInternalSecret, (req, res) => {
    const record = manager.update(req.params.id, req.body || {});
    if (!record) return res.status(404).json({ error: 'Request not found' });
    appendAudit({ event: 'economic-opportunity.request.updated', record, at: new Date().toISOString() });
    res.json(record);
  });
}

module.exports = { registerEconomicOpportunityRoutes };
