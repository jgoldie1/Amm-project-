'use strict';

const assert = require('assert');
const fs = require('fs');

const transit = JSON.parse(fs.readFileSync('config/transit-accessibility.json', 'utf8'));
const unity = fs.readFileSync('my-world-unity.js', 'utf8');
const kernel = fs.readFileSync('platform-kernel.js', 'utf8');

assert(transit.systems.some(system => system.id === 'chicago-metra'), 'Metra layer missing');
assert(transit.systems.some(system => system.id === 'us-amtrak'), 'intercity passenger rail layer missing');
assert(transit.systems.some(system => system.id === 'us-intercity-coach'), 'intercity coach layer missing');
assert(transit.systems.filter(system => ['chicago-metra','us-amtrak','us-intercity-coach'].includes(system.id)).every(system => system.accessibility.stepFreeRouting), 'national transit accessibility missing');
assert(unity.includes("platform: 'My World'"), 'My World platform identity missing');
assert(unity.includes("unityLayer: 'We Are One World'"), 'global unity layer missing');
assert(unity.includes('/api/my-world/journey'), 'unified journey route missing');
assert(unity.includes("accessibility: 'shared'"), 'shared accessibility continuity missing');
assert(unity.includes("translation: 'shared'"), 'shared translation continuity missing');
assert(unity.includes("progression: 'cross-world'"), 'cross-world progression missing');
assert(kernel.includes("require('./my-world-unity')"), 'My World unity layer not wired');

console.log('My World unity and national transit smoke checks passed');
