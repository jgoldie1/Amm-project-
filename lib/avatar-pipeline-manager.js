const crypto = require("crypto");

function createAvatarPipelineManager({ policy, assetPipeline, io }) {
  const jobs = [];

  function create(input = {}) {
    const subjectType = input.subjectType || "self";
    if (!policy.allowedSubjects.includes(subjectType)) throw new Error("SUBJECT_NOT_ALLOWED");
    if (policy.privacy.requireExplicitConsent && input.consent !== true) throw new Error("CONSENT_REQUIRED");

    const captures = input.captures || {};
    const missingViews = policy.captureViews.filter((view) => !captures[view]);
    if (missingViews.length) {
      const error = new Error("MISSING_REQUIRED_VIEWS");
      error.missingViews = missingViews;
      throw error;
    }

    const job = {
      id: crypto.randomUUID(),
      ownerId: input.ownerId || "anonymous",
      gameId: input.gameId || null,
      subjectType,
      consentRecordedAt: new Date().toISOString(),
      consentReference: input.consentReference || null,
      displayName: input.displayName || "My Avatar",
      stylization: input.stylization || "realistic-respectful",
      captures,
      status: "captured",
      currentStep: "capture-quality-check",
      steps: policy.pipeline.map((name) => ({ name, status: "pending", result: null })),
      rawCaptureRetention: policy.privacy.defaultRawCaptureRetention,
      derivedAssetJobId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    jobs.unshift(job);
    io?.emit("avatar:created", { id: job.id, status: job.status, gameId: job.gameId });
    return job;
  }

  function get(id) {
    return jobs.find((job) => job.id === id) || null;
  }

  function list() {
    return jobs;
  }

  function completeStep(id, stepName, result = {}) {
    const job = get(id);
    if (!job) return null;
    const step = job.steps.find((item) => item.name === stepName);
    if (!step) throw new Error("UNKNOWN_STEP");
    step.status = result.success === false ? "failed" : "completed";
    step.result = result;
    job.currentStep = stepName;
    job.status = result.success === false ? "needs-repair" : "processing";
    job.updatedAt = new Date().toISOString();
    io?.emit("avatar:update", { id: job.id, step: stepName, status: job.status });
    return job;
  }

  function createDerivedAssetJob(id) {
    const job = get(id);
    if (!job) return null;
    if (!assetPipeline) throw new Error("ASSET_PIPELINE_UNAVAILABLE");
    const derived = assetPipeline.create({
      gameId: job.gameId,
      type: "character",
      name: job.displayName,
      brief: `Respectful user-authorized avatar derived from multi-view scan. Stylization: ${job.stylization}`,
      source: "avatar-scan",
      provenance: {
        avatarJobId: job.id,
        consentReference: job.consentReference,
        subjectType: job.subjectType,
      },
    });
    job.derivedAssetJobId = derived.id;
    job.updatedAt = new Date().toISOString();
    return { avatarJob: job, assetJob: derived };
  }

  function publish(id) {
    const job = get(id);
    if (!job) return null;
    const required = job.steps.filter((step) => step.name !== "publish");
    if (required.some((step) => step.status !== "completed")) throw new Error("VALIDATION_INCOMPLETE");
    const publishStep = job.steps.find((step) => step.name === "publish");
    publishStep.status = "completed";
    publishStep.result = { publishedAt: new Date().toISOString() };
    job.status = "published";
    job.updatedAt = new Date().toISOString();
    io?.emit("avatar:published", { id: job.id, derivedAssetJobId: job.derivedAssetJobId });
    return job;
  }

  return { create, get, list, completeStep, createDerivedAssetJob, publish };
}

module.exports = { createAvatarPipelineManager };
