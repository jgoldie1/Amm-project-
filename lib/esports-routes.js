function registerEsportsRoutes({ app, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/esports/tournaments', (req, res) => {
    res.json({ tournaments: manager.listTournaments(req.query.gameId) });
  });

  app.post('/api/esports/register', (req, res) => {
    try {
      const registration = manager.register(req.body || {});
      appendAudit?.({ event: 'esports.registered', registration, at: new Date().toISOString() });
      res.status(201).json(registration);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/esports/check-in', (req, res) => {
    try {
      const checkin = manager.checkIn(req.body || {});
      appendAudit?.({ event: 'esports.checked-in', checkin, at: new Date().toISOString() });
      res.json(checkin);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/esports/results', (req, res) => {
    try {
      const result = manager.submitResult(req.body || {});
      appendAudit?.({ event: 'esports.result.submitted', result, at: new Date().toISOString() });
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.post('/api/esports/results/:id/verify', requireInternalSecret, (req, res) => {
    try {
      const result = manager.verifyResult({ resultId: req.params.id, accepted: Boolean(req.body?.accepted), reason: req.body?.reason || null });
      appendAudit?.({ event: 'esports.result.verified', result, at: new Date().toISOString() });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get('/api/esports/tournaments/:id/leaderboard', (req, res) => {
    res.json({ leaderboard: manager.leaderboard(req.params.id, req.query.limit) });
  });

  app.get('/api/esports/tournaments/:id/spectator', (req, res) => {
    res.json(manager.getSpectatorSnapshot(req.params.id));
  });
}

module.exports = { registerEsportsRoutes };