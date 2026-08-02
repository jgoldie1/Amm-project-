'use strict';

const assert = require('assert');
const fs = require('fs');

const moat = fs.readFileSync('competitive-moat.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert(moat.includes('Creator Pack'), 'creator pack missing');
assert(moat.includes('Gamer Pack'), 'gamer pack missing');
assert(moat.includes('Universal Access Pack'), 'access pack missing');
assert(moat.includes('/api/profile/packs'), 'pack selection route missing');
assert(moat.includes('/api/progression'), 'cross-world progression route missing');
assert(moat.includes('/api/inventory'), 'portable inventory route missing');
assert(moat.includes('user-exportable'), 'creator export rights missing');
assert(moat.includes('explainWhyShown'), 'recommendation transparency missing');
assert(moat.includes('chronologicalFeed'), 'chronological feed control missing');
assert(moat.includes('cashConversionEnabled: false'), 'unverified progression must not convert to cash');
assert(kernel.includes("require('./competitive-moat')"), 'competitive moat not wired into kernel');

console.log('Competitive moat smoke checks passed');
