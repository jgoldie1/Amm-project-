'use strict';

const assert = require('assert');
const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/adaptive-radio-network.json', 'utf8'));
const runtime = fs.readFileSync('adaptive-network.js', 'utf8');
const moat = fs.readFileSync('competitive-moat.js', 'utf8');

assert(registry.bands.some(band => band.id === 'low-band'), 'low-band coverage layer missing');
assert(registry.bands.some(band => band.id === 'mid-band'), 'mid-band layer missing');
assert(registry.bands.some(band => band.id === 'millimeter-wave'), 'millimeter-wave layer missing');
assert(registry.bands.some(band => band.id === 'above-100-ghz-research'), 'above-100 GHz research layer missing');
assert.strictEqual(registry.towerArchitecture.targetBackhaulGbps, 10, '10 Gbps backhaul target missing');
assert(registry.towerArchitecture.notGuaranteedToEndUser, 'end-user speed truth safeguard missing');
assert(registry.pushToTalk.features.includes('emergency-override'), 'chirp emergency override missing');
assert(registry.pushToTalk.security.includes('anti-replay'), 'chirp anti-replay protection missing');
assert(registry.pushToTalk.accessibility.includes('live-captions'), 'chirp captions missing');
assert(registry.claims.terahertz === 'research-adapter-only', 'terahertz must remain research-only');
assert(runtime.includes('/api/network/select'), 'adaptive network selection route missing');
assert(runtime.includes('/api/chirp/groups'), 'chirp group route missing');
assert(runtime.includes('/api/chirp/capabilities'), 'chirp capability route missing');
assert(moat.includes("require('./adaptive-network')"), 'adaptive network not wired');
assert(moat.includes("id: 'connect'"), 'network and chirp pack missing');

console.log('Adaptive spectrum network and My World Chirp smoke checks passed');
