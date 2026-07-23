const crypto = require('crypto');

function createMobilityOnboardingManager({ readiness, io }) {
  const applications = [];
  const markets = [];

  function createApplication(input = {}) {
    const role = input.role;
    if (!['driver', 'courier', 'fleet-partner', 'merchant-delivery-partner'].includes(role)) throw new Error('INVALID_ROLE');
    const record = {
      id: crypto.randomUUID(),
      role,
      userId: input.userId || 'anonymous',
      countryCode: String(input.countryCode || '').toUpperCase(),
      region: input.region || '',
      city: input.city || '',
      legalName: input.legalName || '',
      contact: input.contact || {},
      vehicle: input.vehicle || null,
      consent: {
        terms: Boolean(input.consent?.terms),
        privacy: Boolean(input.consent?.privacy),
        location: Boolean(input.consent?.location),
        screening: Boolean(input.consent?.screening),
      },
      documents: [],
      checks: readiness.requiredGates.map((gate) => ({ gate, status: 'pending', note: null, reviewedBy: null, reviewedAt: null })),
      status: 'submitted',
      payoutStatus: 'not-configured',
      trainingStatus: 'not-started',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    applications.unshift(record);
    io?.emit('mobility-onboarding:created', record);
    return record;
  }

  function listApplications(filters = {}) {
    return applications.filter((item) => (!filters.role || item.role === filters.role) && (!filters.countryCode || item.countryCode === String(filters.countryCode).toUpperCase()) && (!filters.status || item.status === filters.status));
  }

  function getApplication(id) { return applications.find((item) => item.id === id) || null; }

  function addDocument(id, document = {}) {
    const record = getApplication(id); if (!record) return null;
    record.documents.push({ id: crypto.randomUUID(), type: document.type || 'other', storageReference: document.storageReference || null, status: 'submitted', expiresAt: document.expiresAt || null, uploadedAt: new Date().toISOString() });
    record.updatedAt = new Date().toISOString();
    return record;
  }

  function updateGate(id, gate, patch = {}) {
    const record = getApplication(id); if (!record) return null;
    const check = record.checks.find((item) => item.gate === gate); if (!check) return null;
    check.status = patch.status || check.status;
    check.note = patch.note ?? check.note;
    check.reviewedBy = patch.reviewedBy ?? check.reviewedBy;
    check.reviewedAt = new Date().toISOString();
    const blocked = record.checks.some((item) => item.status === 'failed');
    const allPassed = record.checks.every((item) => ['passed', 'not-applicable'].includes(item.status));
    record.status = blocked ? 'blocked' : allPassed ? 'eligible-pending-activation' : 'in-review';
    record.updatedAt = new Date().toISOString();
    io?.emit('mobility-onboarding:update', record);
    return record;
  }

  function createMarket(input = {}) {
    const market = { id: crypto.randomUUID(), countryCode: String(input.countryCode || '').toUpperCase(), region: input.region || '', city: input.city || '', zones: input.zones || [], status: readiness.markets.defaultStatus, gates: readiness.requiredGates.map((gate) => ({ gate, status: 'pending', evidence: null })), metrics: {}, approval: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    markets.unshift(market); return market;
  }
  function listMarkets() { return markets; }
  function getMarket(id) { return markets.find((item) => item.id === id) || null; }
  function updateMarket(id, patch = {}) {
    const market = getMarket(id); if (!market) return null;
    if (patch.metrics) market.metrics = { ...market.metrics, ...patch.metrics };
    if (patch.status && readiness.markets.statusValues.includes(patch.status)) market.status = patch.status;
    if (patch.approval) market.approval = patch.approval;
    if (patch.gate) { const gate = market.gates.find((g) => g.gate === patch.gate); if (gate) { gate.status = patch.gateStatus || gate.status; gate.evidence = patch.evidence ?? gate.evidence; } }
    market.updatedAt = new Date().toISOString(); return market;
  }

  function readinessScore(market) {
    const passed = market.gates.filter((g) => ['passed', 'not-applicable'].includes(g.status)).length;
    const gateScore = market.gates.length ? (passed / market.gates.length) * 100 : 0;
    const margin = Number(market.metrics.contributionMarginPercent || 0);
    const marginPass = margin >= readiness.profitModel.defaultContributionMarginFloorPercent;
    return { gateScore: Math.round(gateScore), contributionMarginPercent: margin, marginPass, ownedNetworkEligible: gateScore === 100 && marginPass && Boolean(market.approval?.approvedBy) };
  }

  return { createApplication, listApplications, getApplication, addDocument, updateGate, createMarket, listMarkets, getMarket, updateMarket, readinessScore };
}
module.exports = { createMobilityOnboardingManager };
