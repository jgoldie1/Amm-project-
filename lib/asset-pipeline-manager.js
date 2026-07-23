const crypto = require('crypto');
const ENGINE = require('../data/quantum-speed-engine.json');

const jobs = new Map();

function createAssetJob({ gameId, assetType, name, brief, requestedBy = 'ai-or-developer' }) {
  const id = crypto.randomUUID();
  const job = {
    id,
    gameId,
    assetType,
    name,
    brief,
    requestedBy,
    engine: ENGINE.name,
    status: 'queued',
    createdAt: new Date().toISOString(),
    steps: ENGINE.pipeline.map((step) => ({ step, status: 'pending', output: null })),
    provenance: [],
    validation: [],
    publishedAsset: null,
  };
  jobs.set(id, job);
  return job;
}

function getAssetJob(id) {
  return jobs.get(id) || null;
}

function listAssetJobs() {
  return Array.from(jobs.values()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function updateStep(id, stepName, payload = {}) {
  const job = jobs.get(id);
  if (!job) return null;
  const step = job.steps.find((item) => item.step === stepName);
  if (!step) return null;
  step.status = payload.status || step.status;
  step.output = payload.output ?? step.output;
  step.updatedAt = new Date().toISOString();
  if (payload.provenance) job.provenance.push(payload.provenance);
  if (payload.validation) job.validation.push(payload.validation);
  job.status = payload.jobStatus || job.status;
  return job;
}

function publishAsset(id, publishedAsset) {
  const job = jobs.get(id);
  if (!job) return null;
  job.publishedAsset = publishedAsset;
  job.status = 'published-to-runtime-registry';
  job.completedAt = new Date().toISOString();
  return job;
}

module.exports = {
  createAssetJob,
  getAssetJob,
  listAssetJobs,
  updateStep,
  publishAsset,
};
