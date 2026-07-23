function registerFreeTvRoutes({ app, manager }) {
  app.get('/api/free-tv/titles', (_req, res) => res.json({ titles: manager.listTitles() }));

  app.post('/api/free-tv/titles', (req, res) => {
    try { res.status(201).json(manager.createTitle(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.get('/api/free-tv/titles/:id', (req, res) => {
    const title = manager.getTitle(req.params.id);
    if (!title) return res.status(404).json({ error: 'Title not found' });
    res.json(title);
  });

  app.patch('/api/free-tv/titles/:id', (req, res) => {
    const title = manager.updateTitle(req.params.id, req.body || {});
    if (!title) return res.status(404).json({ error: 'Title not found' });
    res.json(title);
  });

  app.post('/api/free-tv/titles/:id/publish', (req, res) => {
    const result = manager.publishTitle(req.params.id);
    if (!result) return res.status(404).json({ error: 'Title not found' });
    res.status(result.ok ? 200 : 409).json(result);
  });

  app.post('/api/free-tv/watchlist', (req, res) => {
    const { userId, titleId } = req.body || {};
    if (!userId || !titleId) return res.status(400).json({ error: 'userId and titleId are required' });
    res.json({ userId, titleIds: manager.addToWatchlist(userId, titleId) });
  });

  app.post('/api/free-tv/progress', (req, res) => {
    const { userId, titleId, positionSeconds, durationSeconds } = req.body || {};
    if (!userId || !titleId) return res.status(400).json({ error: 'userId and titleId are required' });
    res.json(manager.saveProgress(userId, titleId, positionSeconds, durationSeconds));
  });

  app.post('/api/free-tv/channels', (req, res) => res.status(201).json(manager.createChannel(req.body || {})));

  app.put('/api/free-tv/channels/:id/schedule', (req, res) => {
    const channel = manager.setSchedule(req.params.id, req.body?.schedule || []);
    if (!channel) return res.status(404).json({ error: 'Channel not found' });
    res.json(channel);
  });
}

module.exports = { registerFreeTvRoutes };
