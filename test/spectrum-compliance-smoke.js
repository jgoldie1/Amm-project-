'use strict';

const assert = require('assert');
const fs = require('fs');

const config = JSON.parse(fs.readFileSync('config/spectrum-compliance.json', 'utf8'));
const runtime = fs.readFileSync('spectrum-compliance.js', 'utf8');
const pathway = fs.readFileSync('docs/TRYAMM_RADIO_DEPLOYMENT_PATHWAY.md', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert.strictEqual(config.authorities.nonFederalSpectrum, 'FCC', 'FCC authority missing');
assert(config.deploymentPaths.some(path => path.id === 'carrier-partner'), 'provider pathway missing');
assert(config.deploymentPaths.some(path => path.id === 'cbrs-private-network'), 'CBRS pathway missing');
assert(config.deploymentPaths.some(path => path.id === 'experimental-radio'), 'experimental pathway missing');
assert(config.deploymentPaths.some(path => path.id === 'terahertz-research'), 'terahertz research pathway missing');
assert(config.mandatoryGates.includes('equipment-authorization'), 'equipment authorization gate missing');
assert(config.mandatoryGates.includes('rf-exposure-compliance'), 'RF exposure gate missing');
assert(config.claimsPolicy.tenGbps.includes('not-universal'), '10 Gbps claim safeguard missing');
assert(runtime.includes('/api/network/compliance/pathways'), 'pathway API missing');
assert(runtime.includes('/api/network/compliance/gates'), 'release-gate API missing');
assert(runtime.includes('/api/admin/network/compliance/evidence'), 'evidence API missing');
assert(pathway.includes('Do not begin transmitting'), 'transmission authorization warning missing');
assert(pathway.includes('Production stop conditions'), 'production stop policy missing');
assert(kernel.includes("require('./spectrum-compliance')"), 'spectrum compliance not wired into kernel');

console.log('Spectrum authorization, equipment, field-test and regulatory pathway checks passed');
