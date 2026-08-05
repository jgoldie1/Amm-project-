'use strict';

const fs = require('fs');
const path = require('path');

module.exports = function registerOperatingLayers({ app, auth, clean, getStore, saveStore }) {
  const operatingPath = path.join(__dirname, '..', 'config', 'operating-layers.json');
  const gatesPath = path.join(__dirname, '..', 'config', 'release-gates.json');
  const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));

  function ensureStore() {
    const store = getStore();
    store.operatingEvidence ||= [];
    store.releaseApprovals ||= [];
    return store;
  }

  function blockchainState() {
    const gates = readJson(gatesPath);
    const config = gates.systems.blockchain;
    const enabledRequested = String(process.env.BLOCKCHAIN_ENABLED || '').toLowerCase() === 'true';
    const auditStatus = String(process.env.BLOCKCHAIN_AUDIT_STATUS || 'NOT_SUBMITTED').toUpperCase();
    const reportSha = clean(process.env.BLOCKCHAIN_AUDIT_REPORT_SHA256, 128);
    const approvedBy = clean(process.env.BLOCKCHAIN_RELEASE_APPROVED_BY, 120);
    const activationReady = enabledRequested && auditStatus === 'PASSED' && /^[a-f0-9]{64}$/i.test(reportSha) && approvedBy.length >= 2;
    return {
      enabled: activationReady,
      requested: enabledRequested,
      status: activationReady ? 'ENABLED_AFTER_AUDIT' : 'AUDIT_HOLD',
      auditStatus,
      auditReportSha256Present: /^[a-f0-9]{64}$/i.test(reportSha),
      releaseApproverPresent: approvedBy.length >= 2,
      reason: activationReady ? 'All environment-level audit gates are satisfied.' : config.reason,
      requiredChecks: config.requiredChecks
    };
  }

  app.get('/api/operations/layers', auth, (_req, res) => {
    const model = readJson(operatingPath);
    res.json({ model, blockchain: blockchainState() });
  });

  app.get('/api/operations/readiness', auth, (_req, res) => {
    const model = readJson(operatingPath);
    const gates = readJson(gatesPath);
    const store = ensureStore();
    const evidenceByLayer = Object.fromEntries(model.layers.map(layer => [layer.id, store.operatingEvidence.filter(item => item.layerId === layer.id)]));
    const readiness = model.layers.map(layer => {
      const evidence = evidenceByLayer[layer.id] || [];
      const accepted = evidence.filter(item => item.status === 'accepted');
      return {
        id: layer.id,
        name: layer.name,
        ownerRole: layer.ownerRole,
        evidenceCount: evidence.length,
        acceptedCount: accepted.length,
        requiredArtifactCount: layer.requiredArtifacts.length,
        status: accepted.length >= layer.requiredArtifacts.length ? 'ready' : accepted.length ? 'in-progress' : 'missing'
      };
    });
    res.json({ readiness, releaseGates: gates, blockchain: blockchainState() });
  });

  app.post('/api/operations/evidence', auth, async (req, res) => {
    const model = readJson(operatingPath);
    const layerId = clean(req.body.layerId, 60);
    if (!model.layers.some(layer => layer.id === layerId)) return res.status(400).json({ error: 'Unknown operating layer' });
    const title = clean(req.body.title, 180);
    const evidenceType = clean(req.body.evidenceType, 100);
    if (!title || !evidenceType) return res.status(400).json({ error: 'Title and evidence type are required' });
    const store = ensureStore();
    const record = {
      id: `evidence_${Date.now()}_${Math.random().toString(16).slice(2)}`,
      layerId,
      title,
      evidenceType,
      reference: clean(req.body.reference, 500),
      notes: clean(req.body.notes, 1000),
      status: req.user.role === 'admin' && req.body.accepted === true ? 'accepted' : 'submitted',
      submittedBy: req.user.id,
      createdAt: new Date().toISOString()
    };
    store.operatingEvidence.push(record);
    await saveStore();
    res.status(201).json({ evidence: record });
  });

  app.get('/api/blockchain/status', (_req, res) => {
    const state = blockchainState();
    res.status(state.enabled ? 200 : 423).json(state);
  });

  app.all('/api/blockchain/*', (_req, res) => {
    const state = blockchainState();
    if (!state.enabled) return res.status(423).json({ error: 'Blockchain capability locked pending independent audit approval', blockchain: state });
    res.status(501).json({ error: 'Blockchain adapter has not been installed. Audit approval does not automatically deploy blockchain code.' });
  });
};
