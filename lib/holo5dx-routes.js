function registerHolo5dxRoutes({ app, manager, requireInternalSecret, appendAudit }) {
  app.post('/api/holo5dx/capabilities', (req, res) => {
    res.json(manager.capabilities(req.body || {}));
  });

  app.post('/api/holo5dx/sessions', (req, res) => {
    try {
      const session = manager.startSession(req.body || {});
      appendAudit?.({ event: 'holo5dx.session.created', session, at: new Date().toISOString() });
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/holo5dx/sessions/:id', (req, res) => {
    const session = manager.getSession(req.params.id);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json(session);
  });

  app.post('/api/holo5dx/calibration', requireInternalSecret, (req, res) => {
    try {
      const plan = manager.createCalibration(req.body || {});
      appendAudit?.({ event: 'holo5dx.calibration.generated', plan, at: new Date().toISOString() });
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/holo5dx/render-plan', requireInternalSecret, (req, res) => {
    try {
      const plan = manager.createRenderPlan(req.body || {});
      appendAudit?.({ event: 'holo5dx.render-plan.generated', mode: req.body?.mode || 'standard-3d', at: new Date().toISOString() });
      res.json(plan);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/holo5dx/diagnostics', (req, res) => {
    try {
      res.json(manager.diagnostics(req.body || {}));
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
}

module.exports = { registerHolo5dxRoutes };