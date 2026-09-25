function registerOmniNewsOracleRoutes({ app, manager }) {
  app.get('/api/omni-news/sources', (_req, res) => res.json(manager.listSources()));

  app.post('/api/omni-news/sources', (req, res) => {
    try { res.status(201).json(manager.registerSource(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/sources/:id/approve', (req, res) => {
    try { res.json(manager.approveSource(req.params.id)); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.get('/api/omni-news/items', (req, res) => {
    res.json(manager.listItems({
      region: req.query.region,
      category: req.query.category,
      verificationStatus: req.query.verificationStatus
    }));
  });

  app.post('/api/omni-news/ingest', (req, res) => {
    try { res.status(201).json(manager.ingest(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/community-submissions', (req, res) => {
    try { res.status(201).json(manager.submitCommunityReport(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.patch('/api/omni-news/items/:id/review', (req, res) => {
    try { res.json(manager.reviewItem(req.params.id, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/anchor-scripts', (req, res) => {
    try { res.status(201).json(manager.createAnchorScript(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
}

module.exports = { registerOmniNewsOracleRoutes };
