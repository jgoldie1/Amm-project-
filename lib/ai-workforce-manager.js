const crypto = require('crypto');

function createAiWorkforceManager({ io } = {}) {
  const workers = new Map();
  const tasks = new Map();

  function createWorker(input = {}) {
    const worker = {
      id: crypto.randomUUID(),
      userId: input.userId || null,
      role: input.role || 'support-agent',
      queueIds: Array.isArray(input.queueIds) ? input.queueIds : [],
      licensedRoles: Array.isArray(input.licensedRoles) ? input.licensedRoles : [],
      status: 'onboarding',
      availability: 'offline',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    workers.set(worker.id, worker);
    io?.emit('ai-workforce:worker', worker);
    return worker;
  }

  function updateWorker(id, patch = {}) {
    const worker = workers.get(id);
    if (!worker) return null;
    const allowed = ['status', 'availability', 'queueIds', 'licensedRoles', 'role'];
    for (const key of allowed) if (key in patch) worker[key] = patch[key];
    worker.updatedAt = new Date().toISOString();
    io?.emit('ai-workforce:worker', worker);
    return worker;
  }

  function createTask(input = {}) {
    if (!input.queueId || !input.summary) throw new Error('queueId and summary are required');
    const task = {
      id: crypto.randomUUID(),
      queueId: String(input.queueId),
      source: input.source || 'tryamm',
      sourceId: input.sourceId || null,
      summary: String(input.summary).slice(0, 1000),
      priority: input.priority || 'normal',
      risk: input.risk || 'standard',
      status: 'queued',
      assignedWorkerId: null,
      aiAssist: { summary: null, nextBestAction: null, model: null, generatedAt: null },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.set(task.id, task);
    io?.emit('ai-workforce:task', task);
    return task;
  }

  function assignTask(id, workerId) {
    const task = tasks.get(id);
    const worker = workers.get(workerId);
    if (!task || !worker) return null;
    task.assignedWorkerId = workerId;
    task.status = 'assigned';
    task.updatedAt = new Date().toISOString();
    io?.emit('ai-workforce:task', task);
    return task;
  }

  function setAiAssist(id, input = {}) {
    const task = tasks.get(id);
    if (!task) return null;
    task.aiAssist = {
      summary: input.summary || null,
      nextBestAction: input.nextBestAction || null,
      model: input.model || 'unspecified',
      generatedAt: new Date().toISOString(),
    };
    task.updatedAt = new Date().toISOString();
    io?.emit('ai-workforce:task', task);
    return task;
  }

  function updateTask(id, patch = {}) {
    const task = tasks.get(id);
    if (!task) return null;
    const allowed = ['status', 'priority', 'risk'];
    for (const key of allowed) if (key in patch) task[key] = patch[key];
    task.updatedAt = new Date().toISOString();
    io?.emit('ai-workforce:task', task);
    return task;
  }

  return {
    createWorker,
    updateWorker,
    listWorkers: () => Array.from(workers.values()),
    getWorker: (id) => workers.get(id) || null,
    createTask,
    assignTask,
    setAiAssist,
    updateTask,
    listTasks: (queueId) => Array.from(tasks.values()).filter((t) => !queueId || t.queueId === queueId),
    getTask: (id) => tasks.get(id) || null,
  };
}

module.exports = { createAiWorkforceManager };
