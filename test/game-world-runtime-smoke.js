'use strict';

const assert = require('assert');
const fs = require('fs');

const worlds = JSON.parse(fs.readFileSync('config/worlds.json', 'utf8'));
const features = JSON.parse(fs.readFileSync('config/features.json', 'utf8'));
const runtime = fs.readFileSync('game-world-runtime.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');
const gamePlan = fs.readFileSync('docs/OPEN_CITY_AND_HIS_HERS_SPORTS.md', 'utf8');

assert.strictEqual(worlds.filter(world => world.category === 'living-world').length, 13, 'exactly 13 Living Worlds are required');
assert(worlds.some(world => world.id === 'herrin' && world.status === 'beta-proof'), 'Herrin proof world missing');
assert(worlds.some(world => world.id === 'starverse' && world.category === 'separate-universe'), 'StarVerse must remain separate');
assert(features.some(feature => feature.id === 'gaming.quantum-tag'), 'Quantum Tag missing');
assert(features.some(feature => feature.id === 'gaming.battle-deck'), 'Battle Deck missing');
assert(features.some(feature => feature.id === 'gaming.open-city' && feature.status === 'active-build'), 'My World: Open City missing from active build');
assert(features.some(feature => feature.id === 'gaming.his-hers-sports' && feature.status === 'active-build'), 'His & Hers Sports missing from active build');
assert(features.filter(feature => feature.domain === 'gaming').length >= 8, 'game catalog is incomplete');
assert(gamePlan.includes('must not copy Grand Theft Auto'), 'Open City IP boundary missing');
assert(gamePlan.includes("equal gameplay depth"), 'His & Hers equality requirement missing');
assert(runtime.includes('/api/beta/worlds'), 'world catalog route missing');
assert(runtime.includes('/api/beta/games/:gameId/sessions'), 'game session route missing');
assert(runtime.includes('/api/beta/journey'), 'beta journey route missing');
assert(runtime.includes('Rewards remain non-withdrawable'), 'anti-fraud reward safeguard missing');
assert(kernel.includes("require('./game-world-runtime')"), 'runtime not wired into kernel');

console.log('Living Worlds, Open City, His & Hers Sports and game runtime smoke checks passed');
