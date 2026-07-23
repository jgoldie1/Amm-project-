function registerAiPlayhouseRoutes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/playhouse/manifest', (_req, res) => res.json(manifest));

  app.post('/api/playhouse/agents/enroll', requireInternalSecret, (req, res) => {
    try {
      const agent = manager.enrollAgent(req.body || {});
      appendAudit({ event: 'playhouse.agent.enrolled', agent, at: new Date().toISOString() });
      res.status(201).json(agent);
    } catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.get('/api/playhouse/agents', requireInternalSecret, (_req, res) => res.json({ agents: manager.listAgents() }));
  app.get('/api/playhouse/agents/:id/passport', requireInternalSecret, (req, res) => {
    const agent = manager.getAgent(req.params.id);
    if (!agent) return res.status(404).json({ error: 'Agent not found' });
    res.json({ ...agent, scootyBalance: manager.getRewardBalance(agent.id) });
  });

  app.post('/api/playhouse/sessions', requireInternalSecret, (req, res) => {
    try { const session = manager.createSession(req.body || {}); appendAudit({ event: 'playhouse.session.created', session, at: new Date().toISOString() }); res.status(201).json(session); }
    catch (error) { res.status(error.message === 'UNKNOWN_AGENT' ? 404 : 400).json({ error: error.message }); }
  });
  app.post('/api/playhouse/sessions/:id/events', requireInternalSecret, (req, res) => {
    const session = manager.addSessionEvent(req.params.id, req.body || {}); if (!session) return res.status(404).json({ error: 'Session not found' });
    appendAudit({ event: 'playhouse.session.event', sessionId: session.id, at: new Date().toISOString() }); res.json(session);
  });
  app.post('/api/playhouse/sessions/:id/close', requireInternalSecret, (req, res) => {
    const session = manager.closeSession(req.params.id, req.body || {}); if (!session) return res.status(404).json({ error: 'Session not found' });
    appendAudit({ event: 'playhouse.session.closed', session, at: new Date().toISOString() }); res.json(session);
  });

  app.post('/api/playhouse/challenges/:id/submit', requireInternalSecret, (req, res) => {
    try { const result = manager.submitChallenge({ ...(req.body || {}), challengeId: req.params.id }); appendAudit({ event: 'playhouse.challenge.submitted', result, at: new Date().toISOString() }); res.status(201).json(result); }
    catch (error) { res.status(error.message === 'UNKNOWN_AGENT' ? 404 : 400).json({ error: error.message }); }
  });

  app.post('/api/playhouse/rewards/earn', requireInternalSecret, (req, res) => {
    try { const entry = manager.recordReward({ ...(req.body || {}), direction: 'earn' }); appendAudit({ event: 'playhouse.reward.earned', entry, at: new Date().toISOString() }); res.status(201).json(entry); }
    catch (error) { res.status(400).json({ error: error.message }); }
  });
  app.post('/api/playhouse/rewards/spend', requireInternalSecret, (req, res) => {
    try {
      const current = manager.getRewardBalance(req.body?.agentId);
      const amount = Number(req.body?.amount || 0);
      if (!Number.isFinite(amount) || amount <= 0 || current < amount) return res.status(409).json({ error: 'Insufficient Scooty Snacks balance' });
      const entry = manager.recordReward({ ...(req.body || {}), direction: 'spend' }); appendAudit({ event: 'playhouse.reward.spent', entry, at: new Date().toISOString() }); res.status(201).json(entry);
    } catch (error) { res.status(400).json({ error: error.message }); }
  });

  app.post('/api/playhouse/creator/experiences', requireInternalSecret, (req, res) => {
    const item = manager.createCreatorExperience(req.body || {}); appendAudit({ event: 'playhouse.creator.experience.created', item, at: new Date().toISOString() }); res.status(201).json(item);
  });

  app.post('/api/playhouse/incidents', requireInternalSecret, (req, res) => {
    const incident = manager.reportIncident(req.body || {}); appendAudit({ event: 'playhouse.incident.reported', incident, at: new Date().toISOString() }); res.status(201).json(incident);
  });

  app.get('/api/playhouse/founder/report', requireInternalSecret, (_req, res) => res.json(manager.founderReport()));
}

module.exports = { registerAiPlayhouseRoutes };
