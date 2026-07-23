const crypto = require('crypto');

function createAIOrchestrationManager({ manifest, io }) {
  const tasks = [];
  const memories = [];
  const approvals = [];
  const now = () => new Date().toISOString();
  const makeId = (p) => `${p}_${crypto.randomUUID()}`;

  function riskFor(domain, action) {
    const text = `${domain || ''}:${action || ''}`.toLowerCase();
    return manifest.riskGates.humanApprovalRequired.some((item) => text.includes(String(item).replaceAll('-', ' '))) ? 'high' : 'normal';
  }

  return {
    manifest: () => manifest,
    createTask(input = {}) {
      if (!input.domain || !input.action) throw new Error('domain and action are required');
      const task = {
        id: makeId('ai'), domain: input.domain, action: input.action, requestedBy: input.requestedBy || null,
        context: input.context || {}, status: 'queued', risk: riskFor(input.domain, input.action),
        model: null, provider: null, estimatedCost: 0, actualCost: 0, confidence: null,
        result: null, error: null, approvalRequired: false, createdAt: now(), updatedAt: now()
      };
      task.approvalRequired = task.risk === 'high';
      tasks.unshift(task); io?.emit('ai:task', task); return task;
    },
    listTasks() { return tasks; },
    getTask(id) { return tasks.find((t) => t.id === id) || null; },
    updateTask(id, patch = {}) {
      const task = tasks.find((t) => t.id === id); if (!task) return null;
      const allowed = ['status','model','provider','estimatedCost','actualCost','confidence','result','error'];
      for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch,key)) task[key] = patch[key];
      task.updatedAt = now(); io?.emit('ai:task', task); return task;
    },
    remember(input = {}) {
      const memory = { id: makeId('mem'), scope: input.scope || 'global', key: input.key || null, value: input.value || null, approved: Boolean(input.approved), createdAt: now() };
      memories.unshift(memory); if (memories.length > 5000) memories.length = 5000; return memory;
    },
    listMemories(scope) { return scope ? memories.filter((m) => m.scope === scope) : memories; },
    createApproval(input = {}) {
      if (!input.taskId) throw new Error('taskId is required');
      const approval = { id: makeId('approval'), taskId: input.taskId, status: 'pending', reason: input.reason || '', requestedAt: now(), decidedAt: null, decidedBy: null };
      approvals.unshift(approval); return approval;
    },
    decideApproval(id, input = {}) {
      const a = approvals.find((x) => x.id === id); if (!a) return null;
      a.status = input.status === 'approved' ? 'approved' : 'rejected'; a.decidedAt = now(); a.decidedBy = input.decidedBy || 'authorized-human'; return a;
    },
    listApprovals() { return approvals; }
  };
}

module.exports = { createAIOrchestrationManager };
