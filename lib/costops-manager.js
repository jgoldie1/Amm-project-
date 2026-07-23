const crypto = require('crypto');

function createCostOpsManager({ pricing, io }) {
  const quotes = new Map();
  const jobs = new Map();
  const now = () => new Date().toISOString();
  const emit = (event, payload) => io && io.emit(event, payload);

  function quoteAssetGeneration(input = {}) {
    const offer = pricing.meshyAssetOffers.find((x) => x.id === input.offerId);
    if (!offer) throw new Error('UNKNOWN_OFFER');
    const estimatedVariableCostUsd = Math.max(0, Number(input.estimatedVariableCostUsd || 0));
    const targetMargin = Math.min(0.9, Math.max(0.35, Number(input.targetMargin || 0.6)));
    const marginFloorRevenue = estimatedVariableCostUsd > 0 ? estimatedVariableCostUsd / (1 - targetMargin) : 0;
    const listedRevenue = Number(offer.startingUsdEquivalent || (offer.startingOmniCredits / pricing.creditReference.targetCreditsPerUsd));
    const requiredRevenueUsd = Math.max(listedRevenue, marginFloorRevenue);
    const omniCredits = Math.ceil(requiredRevenueUsd * pricing.creditReference.targetCreditsPerUsd);
    const quote = { id: crypto.randomUUID(), kind: 'asset-generation', offerId: offer.id, requestedBy: input.requestedBy || null, assetBrief: input.assetBrief || '', reusableAssetCandidate: input.reusableAssetCandidate || null, estimatedVariableCostUsd, targetMargin, requiredRevenueUsd: Number(requiredRevenueUsd.toFixed(2)), omniCredits, status: 'quoted', createdAt: now(), expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString() };
    quotes.set(quote.id, quote); emit('costops:quote', quote); return quote;
  }

  function authorizeQuote(id, input = {}) {
    const quote = quotes.get(id); if (!quote) return null;
    if (new Date(quote.expiresAt) < new Date()) throw new Error('QUOTE_EXPIRED');
    quote.status = 'authorized'; quote.authorizedAt = now(); quote.authorizationReference = input.authorizationReference || null; emit('costops:quote', quote); return quote;
  }

  function createJobFromQuote(id, input = {}) {
    const quote = quotes.get(id); if (!quote) throw new Error('QUOTE_NOT_FOUND');
    if (quote.status !== 'authorized') throw new Error('QUOTE_NOT_AUTHORIZED');
    const job = { id: crypto.randomUUID(), quoteId: quote.id, provider: input.provider || 'meshy-or-approved-adapter', status: 'queued', createdAt: now(), actualVariableCostUsd: null, settlement: null };
    jobs.set(job.id, job); quote.status = 'consumed'; quote.jobId = job.id; emit('costops:job', job); return job;
  }

  function settleJob(id, input = {}) {
    const job = jobs.get(id); if (!job) return null;
    const quote = quotes.get(job.quoteId);
    job.actualVariableCostUsd = Math.max(0, Number(input.actualVariableCostUsd || 0));
    job.status = input.success === false ? 'failed' : 'settled';
    job.settlement = { chargedCredits: quote.omniCredits, refundCredits: Math.max(0, Number(input.refundCredits || 0)), providerReference: input.providerReference || null, settledAt: now() };
    emit('costops:job', job); return job;
  }

  return { quoteAssetGeneration, authorizeQuote, createJobFromQuote, settleJob, getQuote: (id) => quotes.get(id) || null, getJob: (id) => jobs.get(id) || null, report: () => ({ quotes: quotes.size, jobs: jobs.size }) };
}

module.exports = { createCostOpsManager };
