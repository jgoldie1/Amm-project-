'use strict';

const assert = require('assert');
const fs = require('fs');

const registry = JSON.parse(fs.readFileSync('config/transit-accessibility.json', 'utf8'));
const runtime = fs.readFileSync('transit-accessibility.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert(registry.systems.some(system => system.id === 'chicago-cta'), 'Chicago CTA system missing');
assert(registry.systems.some(system => system.id === 'nyc-mta'), 'New York MTA system missing');
assert(registry.systems.every(system => system.accessibility.stepFreeRouting), 'step-free routing must be enabled');
assert(registry.universalProfile.mobility.includes('wheelchair'), 'wheelchair support missing');
assert(registry.universalProfile.motor.includes('one-hand'), 'one-hand support missing');
assert(registry.universalProfile.cognitive.includes('plain-language'), 'cognitive accessibility missing');
assert(registry.translation.routeInstructions, 'route translation missing');
assert(registry.translation.emergencyAlerts, 'emergency alert translation missing');
assert(runtime.includes('/api/transit/systems'), 'transit systems route missing');
assert(runtime.includes('/api/transit/plan'), 'accessible trip planner route missing');
assert(runtime.includes('/api/accessibility/capabilities'), 'accessibility capabilities route missing');
assert(runtime.includes('/api/profile/accessibility-universal'), 'universal accessibility profile route missing');
assert(runtime.includes('requires-live-provider-data'), 'live provider safeguard missing');
assert(kernel.includes("require('./transit-accessibility')"), 'transit runtime not wired into kernel');

console.log('Transit, translation and universal accessibility smoke checks passed');
