function registerMusicHoloVerseRoutes({ app, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/music-holoverse', (_req, res) => res.json(manager.manifest()));
  app.get('/api/music/artists', (_req, res) => res.json({ artists: manager.listArtists() }));
  app.post('/api/music/artists', requireInternalSecret, (req, res) => {
    try { const artist = manager.createArtist(req.body || {}); appendAudit({ event: 'music.artist.created', artist, at: new Date().toISOString() }); res.status(201).json(artist); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.get('/api/music/releases', (_req, res) => res.json({ releases: manager.listReleases() }));
  app.post('/api/music/releases', requireInternalSecret, (req, res) => {
    try { const release = manager.createRelease(req.body || {}); appendAudit({ event: 'music.release.created', release, at: new Date().toISOString() }); res.status(201).json(release); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/music/releases/:id/status', requireInternalSecret, (req, res) => {
    const release = manager.updateRelease(req.params.id, req.body || {}); if (!release) return res.status(404).json({ error: 'Release not found' });
    appendAudit({ event: 'music.release.updated', release, at: new Date().toISOString() }); res.json(release);
  });
  app.post('/api/music/usage', requireInternalSecret, (req, res) => {
    try { const event = manager.recordUsage(req.body || {}); appendAudit({ event: 'music.usage.recorded', usage: event, at: new Date().toISOString() }); res.status(201).json(event); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.get('/api/music/usage', requireInternalSecret, (_req, res) => res.json({ usage: manager.listUsageEvents() }));
  app.get('/api/holoverse/events', (_req, res) => res.json({ events: manager.listHoloEvents() }));
  app.post('/api/holoverse/events', requireInternalSecret, (req, res) => {
    try { const event = manager.createHoloEvent(req.body || {}); appendAudit({ event: 'holoverse.event.created', holoEvent: event, at: new Date().toISOString() }); res.status(201).json(event); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/holoverse/events/:id/status', requireInternalSecret, (req, res) => {
    const event = manager.updateHoloEvent(req.params.id, req.body || {}); if (!event) return res.status(404).json({ error: 'HoloVerse event not found' });
    appendAudit({ event: 'holoverse.event.updated', holoEvent: event, at: new Date().toISOString() }); res.json(event);
  });
}

module.exports = { registerMusicHoloVerseRoutes };
