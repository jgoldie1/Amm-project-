'use strict';

function registerQuantumSandboxRoutes({ app, authenticate, gateway, store, appendAudit }) {
  if (!app || !authenticate || !gateway || !store) throw new Error('Quantum Sandbox route dependencies are required');

  app.post('/api/quantum-sandbox/jobs/prepare', authenticate, async (req, res, next) => {
    try {
      const prepared = await gateway.prepareJob(req.body || {}, { userId: req.auth.userId, tenantId: req.auth.tenantId || null });
      const saved = await store.createJob(prepared, req.auth.token || null);
      await appendAudit?.({ event: 'quantum.sandbox.job.prepared', jobId: saved.id, ownerId: req.auth.userId, at: new Date().toISOString() });
      res.status(201).json(saved);
    } catch (error) { next(error); }
  });

  app.get('/api/quantum-sandbox/jobs', authenticate, async (req, res, next) => {
    try { res.json({ jobs: await store.listJobs(req.auth.userId, req.auth.token || null) }); }
    catch (error) { next(error); }
  });

  app.get('/api/quantum-sandbox/jobs/:id', authenticate, async (req, res, next) => {
    try {
      const job = await store.getJob(req.params.id, req.auth.userId, req.auth.token || null);
      if (!job) return res.status(404).json({ error: 'JOB_NOT_FOUND', requestId: req.requestId });
      res.json(job);
    } catch (error) { next(error); }
  });

  app.post('/api/quantum-sandbox/jobs/:id/submit', authenticate, async (req, res, next) => {
    try {
      const job = await store.getJob(req.params.id, req.auth.userId, req.auth.token || null);
      if (!job) return res.status(404).json({ error: 'JOB_NOT_FOUND', requestId: req.requestId });
      const submitted = await gateway.submitPreparedJob(job, { userId: req.auth.userId }, { approved: Boolean(req.body?.approved) });
      const saved = await store.updateJob(submitted, req.auth.userId, req.auth.token || null);
      await appendAudit?.({ event: 'quantum.sandbox.job.submitted', jobId: saved.id, ownerId: req.auth.userId, at: new Date().toISOString() });
      res.json(saved);
    } catch (error) { next(error); }
  });

  app.get('/api/quantum-sandbox/jobs/:id/result', authenticate, async (req, res, next) => {
    try {
      const job = await store.getJob(req.params.id, req.auth.userId, req.auth.token || null);
      if (!job) return res.status(404).json({ error: 'JOB_NOT_FOUND', requestId: req.requestId });
      res.json({ id: job.id, state: job.state, result: job.result || null, provenance: job.provenance || {}, executionType: job.execution_type || job.executionType });
    } catch (error) { next(error); }
  });
}

module.exports = { registerQuantumSandboxRoutes };
