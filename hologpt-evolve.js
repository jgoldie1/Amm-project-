'use strict';

const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config/hologpt-evolve.json'), 'utf8'));

module.exports = function registerHoloGptEvolve({ app, auth, admin, clean, id, getStore, saveStore }) {
  app.get('/api/ai/evolve/config', auth, (_req, res) => {
    res.json(config);
  });

  app.get('/api/ai/evolve/experiments', auth, (req, res) => {
    const store = getStore();
    const experiments = (store.aiEvolutionExperiments || []).filter(item =>
      req.user.role === 'admin' || item.createdBy === req.user.id
    );
    res.json({ count: experiments.length, experiments });
  });

  app.post('/api/ai/evolve/experiments', auth, async (req, res) => {
    const target = clean(req.body.target, 80);
    if (!config.evolutionTargets.includes(target)) {
      return res.status(400).json({ error: 'Evolution target is not approved' });
    }

    const store = getStore();
    store.aiEvolutionExperiments = store.aiEvolutionExperiments || [];
    const experiment = {
      id: id('evolve'),
      createdBy: req.user.id,
      target,
      hypothesis: clean(req.body.hypothesis, 1000),
      baselineRef: clean(req.body.baselineRef, 200),
      candidateRef: clean(req.body.candidateRef, 200),
      status: 'sandbox-requested',
      productionDeploymentAllowed: false,
      promotionRequiresHumanApproval: true,
      createdAt: new Date().toISOString(),
      history: [{ state: 'sandbox-requested', at: new Date().toISOString(), actor: req.user.id }]
    };
    store.aiEvolutionExperiments.push(experiment);
    await saveStore();
    res.status(201).json({ experiment });
  });

  app.post('/api/admin/ai/evolve/experiments/:experimentId/review', auth, admin, async (req, res) => {
    const store = getStore();
    const experiment = (store.aiEvolutionExperiments || []).find(item => item.id === req.params.experimentId);
    if (!experiment) return res.status(404).json({ error: 'Experiment not found' });

    const decision = clean(req.body.decision, 30);
    if (!['approve-sandbox', 'reject', 'approve-promotion', 'rollback'].includes(decision)) {
      return res.status(400).json({ error: 'Invalid review decision' });
    }

    if (decision === 'approve-promotion' && req.body.rollbackTested !== true) {
      return res.status(400).json({ error: 'Rollback evidence is required before promotion' });
    }

    const nextState = {
      'approve-sandbox': 'sandbox-approved',
      reject: 'rejected',
      'approve-promotion': 'promotion-approved-not-deployed',
      rollback: 'rolled-back'
    }[decision];

    experiment.status = nextState;
    experiment.productionDeploymentAllowed = false;
    experiment.review = {
      decision,
      reviewer: req.user.id,
      benchmarkSummary: clean(req.body.benchmarkSummary, 2000),
      safetySummary: clean(req.body.safetySummary, 2000),
      rollbackTested: Boolean(req.body.rollbackTested),
      reviewedAt: new Date().toISOString()
    };
    experiment.history.push({ state: nextState, at: new Date().toISOString(), actor: req.user.id });
    await saveStore();
    res.json({ experiment });
  });
};
