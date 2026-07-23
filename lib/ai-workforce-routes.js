function registerAiWorkforceRoutes({ app, manifest, manager, requireInternalSecret, appendAudit }) {
  app.get('/api/ai-workforce', (_req, res) => res.json(manifest));

  app.post('/api/ai-workforce/workers', requireInternalSecret, (req, res) => {
    const worker = manager.createWorker(req.body || {});
    appendAudit({ event: 'ai-workforce.worker.created', worker, at: new Date().toISOString() });
    res.status(201).json(worker);
  });
  app.get('/api/ai-workforce/workers', requireInternalSecret, (_req, res) => res.json({ workers: manager.listWorkers() }));
  app.post('/api/ai-workforce/workers/:id', requireInternalSecret, (req, res) => {
    const worker = manager.updateWorker(req.params.id, req.body || {});
    if (!worker) return res.status(404).json({ error: 'Worker not found' });
    appendAudit({ event: 'ai-workforce.worker.updated', worker, at: new Date().toISOString() });
    res.json(worker);
  });

  app.post('/api/ai-workforce/tasks', requireInternalSecret, (req, res) => {
    try {
      const task = manager.createTask(req.body || {});
      appendAudit({ event: 'ai-workforce.task.created', task, at: new Date().toISOString() });
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  app.get('/api/ai-workforce/tasks', requireInternalSecret, (req, res) => res.json({ tasks: manager.listTasks(req.query.queueId) }));
  app.get('/api/ai-workforce/tasks/:id', requireInternalSecret, (req, res) => {
    const task = manager.getTask(req.params.id);
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json(task);
  });
  app.post('/api/ai-workforce/tasks/:id/assign', requireInternalSecret, (req, res) => {
    const task = manager.assignTask(req.params.id, req.body?.workerId);
    if (!task) return res.status(404).json({ error: 'Task or worker not found' });
    appendAudit({ event: 'ai-workforce.task.assigned', task, at: new Date().toISOString() });
    res.json(task);
  });
  app.post('/api/ai-workforce/tasks/:id/ai-assist', requireInternalSecret, (req, res) => {
    const task = manager.setAiAssist(req.params.id, req.body || {});
    if (!task) return res.status(404).json({ error: 'Task not found' });
    appendAudit({ event: 'ai-workforce.task.ai-assist', taskId: task.id, aiAssist: task.aiAssist, at: new Date().toISOString() });
    res.json(task);
  });
  app.post('/api/ai-workforce/tasks/:id/status', requireInternalSecret, (req, res) => {
    const task = manager.updateTask(req.params.id, req.body || {});
    if (!task) return res.status(404).json({ error: 'Task not found' });
    appendAudit({ event: 'ai-workforce.task.updated', task, at: new Date().toISOString() });
    res.json(task);
  });
}

module.exports = { registerAiWorkforceRoutes };
