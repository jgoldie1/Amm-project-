function registerTapPayRoutes({ app, manager, manifest, requireInternalSecret, appendAudit }) {
  app.get('/api/tappay', (_req, res) => res.json(manifest));
  app.get('/api/tappay/routes/:country', (req, res) => res.json(manager.routeForCountry(req.params.country)));
  app.post('/api/tappay/intents', requireInternalSecret, (req, res) => {
    try {
      const intent = manager.createIntent(req.body || {});
      appendAudit({ event: 'tappay.intent.created', intentId: intent.id, country: intent.country, provider: intent.provider, at: new Date().toISOString() });
      res.status(201).json(intent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get('/api/tappay/intents', requireInternalSecret, (_req, res) => res.json({ intents: manager.listIntents() }));
  app.get('/api/tappay/intents/:id', requireInternalSecret, (req, res) => {
    const intent = manager.getIntent(req.params.id);
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    res.json(intent);
  });
  app.post('/api/tappay/intents/:id/status', requireInternalSecret, (req, res) => {
    const intent = manager.updateIntent(req.params.id, req.body || {});
    if (!intent) return res.status(404).json({ error: 'Payment intent not found' });
    appendAudit({ event: 'tappay.intent.updated', intentId: intent.id, status: intent.status, provider: intent.provider, at: new Date().toISOString() });
    res.json(intent);
  });
  app.get('/api/tappay/report', requireInternalSecret, (_req, res) => res.json(manager.report()));
}

module.exports = { registerTapPayRoutes };
