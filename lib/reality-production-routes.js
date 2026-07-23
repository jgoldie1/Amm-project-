function registerRealityProductionRoutes({ app, manager }) {
  app.get('/api/reality-production/manifest', (_req, res) => res.json(manager.manifest));
  app.get('/api/reality-production/projects', (_req, res) => res.json({ projects: manager.listProjects() }));
  app.post('/api/reality-production/projects', (req, res) => {
    try { res.status(201).json(manager.createProject(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.get('/api/reality-production/projects/:id', (req, res) => {
    const project = manager.getProject(req.params.id);
    if (!project) return res.status(404).json({ error: 'PROJECT_NOT_FOUND' });
    res.json(project);
  });
  app.post('/api/reality-production/projects/:id/documents', (req, res) => {
    try { res.status(201).json(manager.addDocument(req.params.id, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/reality-production/projects/:id/stages/:stage', (req, res) => {
    try { res.json(manager.updateStage(req.params.id, req.params.stage, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/reality-production/projects/:id/reviews', (req, res) => {
    try { res.status(201).json(manager.addReview(req.params.id, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/reality-production/projects/:id/incidents', (req, res) => {
    try { res.status(201).json(manager.reportIncident(req.params.id, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/reality-production/projects/:id/greenlight', (req, res) => {
    try {
      const result = manager.greenlight(req.params.id);
      res.status(result.allowed ? 200 : 409).json(result);
    } catch (error) { res.status(400).json({ error: error.message }); }
  });
}

module.exports = { registerRealityProductionRoutes };
