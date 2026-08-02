'use strict';

const assert = require('assert');
const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/local-tv-fast.json', 'utf8'));
const runtime = fs.readFileSync('local-tv-fast.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert.strictEqual(registry.model, 'FAST', 'FAST model missing');
assert(registry.channels.some(channel => channel.id === 'herrin-local'), 'Herrin local channel missing');
assert(registry.channels.some(channel => channel.id === 'chicago-local'), 'Chicago local channel missing');
assert(registry.channels.some(channel => channel.id === 'isaiah-ai-tv'), 'Isaiah AI TV channel missing');
assert(registry.channels.some(channel => channel.id === 'original-internet'), 'Original Internet channel missing');
assert(registry.programming.localNews, 'local news programming missing');
assert(registry.programming.weatherAndEmergencyAlerts, 'emergency programming missing');
assert(registry.advertising.localBusinessInventory, 'local ad inventory missing');
assert(registry.rightsAndSafety.localStationRetransmissionPermissionRequired, 'retransmission permission safeguard missing');
assert(registry.accessibility.captions && registry.accessibility.audioDescription, 'TV accessibility missing');
assert(runtime.includes('/api/tv/channels'), 'channel API missing');
assert(runtime.includes('/api/tv/guide'), 'program guide API missing');
assert(runtime.includes('/api/tv/local/:region'), 'local TV API missing');
assert(runtime.includes('requires-program-level-verification'), 'rights verification status missing');
assert(kernel.includes("require('./local-tv-fast')"), 'local TV runtime not wired into kernel');

console.log('Local FAST television smoke checks passed');
