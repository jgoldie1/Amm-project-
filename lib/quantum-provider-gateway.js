'use strict';

const crypto = require('crypto');

const JOB_STATES = Object.freeze({
  DRAFT: 'draft',
  VALIDATED: 'validated',
  APPROVAL_REQUIRED: 'approval_required',
  QUEUED: 'queued',
  RUNNING: 'running',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
});

class QuantumProviderGateway {
  constructor({ providers = {}, audit = async () => {}, maxJobBudgetUsd = 25 } = {}) {
    this.providers = new Map(Object.entries(providers));
    this.audit = audit;
    this.maxJobBudgetUsd = maxJobBudgetUsd;
  }

  registerProvider(id, adapter) {
    const required = ['listBackends','describeBackend','estimateCost','validateJob','submitJob','getJobStatus','getJobResult','cancelJob'];
    for (const method of required) {
      if (typeof adapter?.[method] !== 'function') throw new Error(`Provider ${id} missing ${method}()`);
    }
    this.providers.set(id, adapter);
  }

  async prepareJob(input, actor) {
    if (!actor?.userId) throw new Error('Authenticated actor required');
    const provider = this.providers.get(input.providerId);
    if (!provider) throw new Error('Quantum provider is not enabled');

    const backend = await provider.describeBackend(input.backendId);
    if (!backend) throw new Error('Unknown backend');
    if (!['classical_simulator','quantum_simulator','quantum_hardware'].includes(backend.executionType)) {
      throw new Error('Backend must declare executionType');
    }

    await provider.validateJob(input);
    const estimate = await provider.estimateCost(input);
    const estimatedUsd = Number(estimate?.amountUsd || 0);
    if (!Number.isFinite(estimatedUsd) || estimatedUsd < 0) throw new Error('Invalid cost estimate');

    const approvalRequired = backend.executionType === 'quantum_hardware' || estimatedUsd > this.maxJobBudgetUsd;
    const job = {
      id: crypto.randomUUID(),
      ownerId: actor.userId,
      tenantId: actor.tenantId || null,
      providerId: input.providerId,
      backendId: input.backendId,
      executionType: backend.executionType,
      state: approvalRequired ? JOB_STATES.APPROVAL_REQUIRED : JOB_STATES.VALIDATED,
      estimatedCostUsd: estimatedUsd,
      createdAt: new Date().toISOString(),
      workload: input.workload,
      provenance: { provider: input.providerId, backend: input.backendId, executionType: backend.executionType }
    };
    await this.audit('quantum.job.prepared', { jobId: job.id, actorId: actor.userId, executionType: job.executionType, estimatedCostUsd: estimatedUsd });
    return job;
  }

  async submitPreparedJob(job, actor, { approved = false } = {}) {
    if (!actor?.userId || actor.userId !== job.ownerId) throw new Error('Job owner required');
    if (job.state === JOB_STATES.APPROVAL_REQUIRED && !approved) throw new Error('Explicit approval required');
    if (![JOB_STATES.VALIDATED, JOB_STATES.APPROVAL_REQUIRED].includes(job.state)) throw new Error('Job is not submit-ready');

    const provider = this.providers.get(job.providerId);
    if (!provider) throw new Error('Quantum provider is not enabled');
    const remote = await provider.submitJob({ backendId: job.backendId, workload: job.workload, clientJobId: job.id });
    const submitted = { ...job, state: JOB_STATES.QUEUED, providerJobId: remote.jobId, submittedAt: new Date().toISOString() };
    await this.audit('quantum.job.submitted', { jobId: job.id, actorId: actor.userId, providerJobId: remote.jobId });
    return submitted;
  }
}

module.exports = { QuantumProviderGateway, JOB_STATES };
