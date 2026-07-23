function registerNewsRoutes({ app, manager }) {
  app.get('/api/news/stories', (req, res) => {
    res.json({ stories: manager.listStories(req.query || {}) });
  });
  app.post('/api/news/stories', (req, res) => {
    try { res.status(201).json(manager.createStory(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.patch('/api/news/stories/:id', (req, res) => {
    const story = manager.updateStory(req.params.id, req.body || {});
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json(story);
  });
  app.get('/api/news/channels', (_req, res) => res.json({ channels: manager.listChannels() }));
  app.post('/api/news/channels', (req, res) => {
    try { res.status(201).json(manager.createChannel(req.body || {})); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
}

module.exports = { registerNewsRoutes };
