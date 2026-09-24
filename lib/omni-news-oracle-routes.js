function registerOmniNewsOracleRoutes({ app, manager, auth, admin }) {
  const adminOnly = [auth, admin].filter(Boolean);

  app.get('/api/omni-news/sources', ...adminOnly, (_req, res) => res.json(manager.listSources()));

  app.post('/api/omni-news/sources', ...adminOnly, (req, res) => {
    try { res.status(201).json(manager.registerSource(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/sources/:id/approve', ...adminOnly, (req, res) => {
    try { res.json(manager.approveSource(req.params.id)); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/sources/:id/activate', ...adminOnly, (req, res) => {
    try { res.json(manager.activateSource(req.params.id)); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.get('/api/omni-news/items', (req, res) => {
    res.json(manager.listItems({
      region: req.query.region,
      lane: req.query.lane,
      desk: req.query.desk,
      purpose: req.query.purpose,
      category: req.query.category,
      verificationStatus: req.query.verificationStatus,
      live: req.query.live === undefined ? undefined : String(req.query.live).toLowerCase() === 'true'
    }));
  });

  app.post('/api/omni-news/ingest', ...adminOnly, (req, res) => {
    try { res.status(201).json(manager.ingest(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/omni-news/community-submissions', auth, (req, res) => {
    try {
      const payload = { ...(req.body || {}), submitterId: req.user?.id || req.body?.submitterId };
      res.status(201).json(manager.submitCommunityReport(payload));
    } catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.patch('/api/omni-news/items/:id/review', ...adminOnly, (req, res) => {
    try { res.json(manager.reviewItem(req.params.id, req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.get('/api/omni-news/items/:id/route', (req, res) => {
    try { res.json(manager.routeItem(req.params.id)); }
    catch (error) { res.status(404).json({ error: error.message }); }
  });

  app.post('/api/omni-news/anchor-scripts', ...adminOnly, (req, res) => {
    try { res.status(201).json(manager.createAnchorScript(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
}

module.exports = { registerOmniNewsOracleRoutes };
