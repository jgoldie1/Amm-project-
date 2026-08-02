'use strict';

const assert = require('assert');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config/hologpt-evolve.json', 'utf8'));
const runtime = fs.readFileSync('hologpt-evolve.js', 'utf8');
const moat = fs.readFileSync('competitive-moat.js', 'utf8');

assert(config.researchCycle.includes('learn') && config.researchCycle.includes('analyze'), 'evolution cycle missing');
assert(config.requiredControls.sandboxOnly, 'sandbox-only control missing');
assert(config.requiredControls.humanApprovalForPromotion, 'human promotion approval missing');
assert(config.requiredControls.rollbackRequired, 'rollback requirement missing');
assert(config.requiredControls.killSwitch, 'kill switch missing');
assert(config.forbiddenAutonomy.includes('self-deploy-to-production'), 'self-deployment prohibition missing');
assert(config.forbiddenAutonomy.includes('modify-its-own-release-gates'), 'release-gate protection missing');
assert.strictEqual(config.artificialSuperintelligenceClaimed, false, 'must not claim ASI exists');
assert(runtime.includes('/api/ai/evolve/config'), 'evolve configuration route missing');
assert(runtime.includes('/api/ai/evolve/experiments'), 'experiment routes missing');
assert(runtime.includes('promotion-approved-not-deployed'), 'deployment separation missing');
assert(runtime.includes('Rollback evidence is required before promotion'), 'rollback evidence gate missing');
assert(moat.includes("require('./hologpt-evolve')"), 'HoloGPT Evolve not wired into platform');
assert(moat.includes('HoloGPT Evolve Research Pack'), 'Evolve pack missing');

console.log('HoloGPT Evolve bounded research smoke checks passed');
