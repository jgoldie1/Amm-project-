function registerOmniCare360Routes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/omnicare-360', (_req, res) => res.json(manifest));

  app.post('/api/omnicare-360/cases', requireInternalSecret, (req, res) => {
    const record = manager.createCase(req.body || {});
    appendAudit({ event: 'omnicare.case.created', record, at: new Date().toISOString() });
    res.status(201).json(record);
  });

  app.get('/api/omnicare-360/cases', requireInternalSecret, (_req, res) => res.json({ cases: manager.listCases() }));

  app.get('/api/omnicare-360/cases/:id', requireInternalSecret, (req, res) => {
    const record = manager.getCase(req.params.id);
    if (!record) return res.status(404).json({ error: 'Case not found' });
    res.json(record);
  });

  app.post('/api/omnicare-360/cases/:id/status', requireInternalSecret, (req, res) => {
    const record = manager.updateCase(req.params.id, req.body || {});
    if (!record) return res.status(404).json({ error: 'Case not found' });
    appendAudit({ event: 'omnicare.case.updated', record, at: new Date().toISOString() });
    res.json(record);
  });

  app.post('/api/omnicare-360/cases/:id/appointments', requireInternalSecret, (req, res) => {
    const record = manager.addAppointment(req.params.id, req.body || {});
    if (!record) return res.status(404).json({ error: 'Case not found' });
    appendAudit({ event: 'omnicare.appointment.added', caseId: record.id, at: new Date().toISOString() });
    res.json(record);
  });

  app.post('/api/omnicare-360/cases/:id/transport', requireInternalSecret, (req, res) => {
    const record = manager.addTransportNeed(req.params.id, req.body || {});
    if (!record) return res.status(404).json({ error: 'Case not found' });
    appendAudit({ event: 'omnicare.transport.requested', caseId: record.id, at: new Date().toISOString() });
    res.json(record);
  });
}

module.exports = { registerOmniCare360Routes };
