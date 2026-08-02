'use strict';

const fs = require('fs');
const path = require('path');

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'config/spectrum-compliance.json'), 'utf8'));
}

module.exports = function registerSpectrumCompliance({ app, auth }) {
  const config = loadConfig();

  app.get('/api/network/compliance/pathways', (_req, res) => {
    res.json({
      releaseTruth: config.releaseTruth,
      authorities: config.authorities,
      pathways: config.deploymentPaths,
      claimsPolicy: config.claimsPolicy
    });
  });

  app.get('/api/network/compliance/gates', auth, (req, res) => {
    const evidence = req.user?.networkComplianceEvidence || {};
    const gates = config.mandatoryGates.map(gate => ({ gate, status: evidence[gate] ? 'evidence-recorded' : 'blocked' }));
    const ready = gates.every(item => item.status === 'evidence-recorded');
    res.json({ readyForProductionRadio: ready, gates, fieldTests: config.fieldTests });
  });

  app.post('/api/admin/network/compliance/evidence', auth, (req, res) => {
    if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
    const gate = String(req.body?.gate || '').trim();
    if (!config.mandatoryGates.includes(gate)) return res.status(400).json({ error: 'Unknown compliance gate' });
    const reference = String(req.body?.reference || '').trim();
    if (!reference) return res.status(400).json({ error: 'Evidence reference is required' });
    req.user.networkComplianceEvidence = req.user.networkComplianceEvidence || {};
    req.user.networkComplianceEvidence[gate] = {
      reference,
      reviewer: String(req.body?.reviewer || req.user.id),
      recordedAt: new Date().toISOString(),
      status: 'recorded-not-independently-verified'
    };
    res.status(201).json({ gate, evidence: req.user.networkComplianceEvidence[gate] });
  });
};
