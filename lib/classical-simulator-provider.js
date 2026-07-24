'use strict';

const crypto = require('crypto');

function createClassicalSimulatorProvider() {
  const jobs = new Map();
  const backend = {
    id: 'local-classical-simulator',
    name: 'TryAMM Classical Simulator',
    executionType: 'classical_simulator',
    status: 'available'
  };

  return {
    async listBackends() { return [backend]; },
    async describeBackend(id) { return id === backend.id ? backend : null; },
    async estimateCost() { return { amountUsd: 0 }; },
    async validateJob(input) {
      if (!input || input.backendId !== backend.id) throw new Error('Unsupported simulator backend');
      if (!input.workload || typeof input.workload !== 'object') throw new Error('workload is required');
      return { valid: true };
    },
    async submitJob({ backendId, workload, clientJobId }) {
      if (backendId !== backend.id) throw new Error('Unsupported simulator backend');
      const jobId = `sim_${crypto.randomUUID()}`;
      const result = {
        jobId,
        clientJobId,
        executionType: 'classical_simulator',
        summary: 'Classical simulator staging job completed',
        output: { echoedWorkload: workload },
        completedAt: new Date().toISOString()
      };
      jobs.set(jobId, { state: 'succeeded', result });
      return { jobId };
    },
    async getJobStatus(jobId) { return jobs.get(jobId)?.state || 'not_found'; },
    async getJobResult(jobId) { return jobs.get(jobId)?.result || null; },
    async cancelJob(jobId) {
      const job = jobs.get(jobId);
      if (!job) return { cancelled: false };
      if (job.state === 'succeeded') return { cancelled: false, reason: 'already_completed' };
      job.state = 'cancelled';
      return { cancelled: true };
    }
  };
}

module.exports = { createClassicalSimulatorProvider };
